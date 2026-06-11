import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const db = createAdminClient();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;
    const search = searchParams.get("q") || "";
    const tier = searchParams.get("tier") || "";

    let query = db
      .from("vendors")
      .select("id, shop_name, shop_slug, shop_logo, shop_banner, shop_description, vendor_tier, rating, total_sales, positive_feedback, response_rate, ship_on_time_rate, joined_at", { count: "exact" })
      .eq("status", "approved");

    if (search) {
      const safe = search.replace(/[%_\\]/g, "\\$&");
      query = query.or(`shop_name.ilike.%${safe}%,shop_description.ilike.%${safe}%`);
    }
    if (tier) query = query.eq("vendor_tier", tier);

    const { data: vendors, error, count } = await query
      .order("rating", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) return errorResponse("Failed to fetch vendors", 500);

    return paginatedResponse(vendors || [], count || 0, page, limit);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
