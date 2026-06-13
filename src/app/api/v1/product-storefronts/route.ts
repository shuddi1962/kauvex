import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin, validateBody } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const assignSchema = z.object({
  product_id: z.string().uuid(),
  storefront_ids: z.array(z.string().uuid()),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");
    if (!productId) return errorResponse("product_id query parameter is required", 400);

    const adminDb = createAdminClient();

    const { data: storefronts } = await adminDb
      .from("storefronts")
      .select("id, name, slug")
      .eq("status", "active")
      .order("name");

    const { data: assignments } = await adminDb
      .from("product_storefronts")
      .select("storefront_id, is_active, sort_order")
      .eq("product_id", productId);

    const assignmentMap = new Map(
      (assignments || []).map((a: any) => [
        a.storefront_id,
        { isActive: a.is_active, sortOrder: a.sort_order || 0 },
      ])
    );

    const result = (storefronts || []).map((sf: any) => ({
      storefront_id: sf.id,
      storefront_name: sf.name,
      storefront_slug: sf.slug,
      is_assigned: assignmentMap.has(sf.id),
      is_active: assignmentMap.get(sf.id)?.isActive ?? false,
      sort_order: assignmentMap.get(sf.id)?.sortOrder ?? 0,
    }));

    return successResponse(result);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, assignSchema);
  if (valErr) return valErr;

  try {
    const adminDb = createAdminClient();

    await adminDb
      .from("product_storefronts")
      .delete()
      .eq("product_id", body!.product_id);

    if (body!.storefront_ids.length > 0) {
      const inserts = body!.storefront_ids.map((sfId, i) => ({
        product_id: body!.product_id,
        storefront_id: sfId,
        is_active: true,
        sort_order: i,
      }));
      const { error: insErr } = await adminDb
        .from("product_storefronts")
        .insert(inserts);
      if (insErr) return errorResponse("Failed to assign storefronts: " + insErr.message, 400);
    }

    return successResponse({ message: "Storefront assignments updated" }, 200);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
