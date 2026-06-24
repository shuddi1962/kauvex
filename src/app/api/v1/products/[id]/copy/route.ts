import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const isAdmin = profile?.role && ["super-admin", "store-manager"].includes(profile.role);

  try {
    const db = createAdminClient();
    const { id } = params;

    const { data: original } = await db
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (!original) return errorResponse("Product not found", 404);

    if (!isAdmin && original.vendor_id !== profile!.vendor_id) {
      return errorResponse("You do not own this product", 403);
    }

    const { data: copy, error } = await db
      .from("products")
      .insert({
        vendor_id: original.vendor_id,
        name: `Copy of ${original.name}`,
        slug: `${original.slug}-copy-${Date.now()}`,
        sku: original.sku ? `${original.sku}-COPY` : null,
        description: original.description,
        short_description: original.short_description,
        type: original.type,
        category_id: original.category_id,
        brand_id: original.brand_id,
        regular_price: original.regular_price,
        sale_price: original.sale_price,
        cost_price: original.cost_price,
        images: original.images,
        variants: original.variants,
        specifications: original.specifications,
        tags: original.tags,
        status: "draft",
        metadata: original.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, name, status")
      .single();

    if (error) return errorResponse(error.message, 400);

    return successResponse(copy);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
