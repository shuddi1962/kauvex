import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = createAdminClient();
    const { id } = params;

    const { data: vendor, error } = await db
      .from("vendors")
      .select("id, shop_name, shop_slug, shop_logo, shop_banner, shop_description, vendor_tier, rating, total_sales, total_revenue, positive_feedback, response_rate, ship_on_time_rate, joined_at")
      .eq("id", id)
      .eq("status", "approved")
      .single();

    if (error || !vendor) return errorResponse("Vendor not found", 404);

    const { data: products } = await db
      .from("products")
      .select("id, name, slug, regular_price, sale_price, images, rating, review_count")
      .eq("vendor_id", id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: store } = await db
      .from("vendor_stores")
      .select("store_name, store_slug, logo, banner, description, tagline, is_verified, is_featured")
      .eq("vendor_id", id)
      .single();

    return successResponse({
      ...vendor,
      products: products || [],
      store: store || null,
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
