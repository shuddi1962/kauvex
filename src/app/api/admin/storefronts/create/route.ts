import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const { error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("storefronts")
      .insert([body.payload])
      .select();

    if (error) {
      return errorResponse(error.message, 400);
    }

    const storefrontId = data?.[0]?.id;

    if (storefrontId && body.categories?.length > 0) {
      const { error: catError } = await supabase
        .from("storefront_categories")
        .insert(body.categories.map((c: string) => ({ storefront_id: storefrontId, category_id: c })));

      if (catError) {
        return errorResponse(catError.message, 400);
      }
    }

    if (storefrontId && body.vendors?.length > 0) {
      const { error: venError } = await supabase
        .from("storefront_vendors")
        .insert(body.vendors.map((v: string) => ({ storefront_id: storefrontId, vendor_id: v })));

      if (venError) {
        return errorResponse(venError.message, 400);
      }
    }

    return successResponse(data, 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Internal error", 500);
  }
}
