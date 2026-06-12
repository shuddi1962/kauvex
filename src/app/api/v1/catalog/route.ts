import { NextRequest } from "next/server";
import { insforge } from "@/lib/insforge";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    let query = insforge.database
      .from("shared_catalog_products")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("title", { ascending: true });

    if (search) {
      query = query.or(`title.ilike.%${search}%,brand.ilike.%${search}%`);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) return errorResponse(error.message, 400);

    const enriched = await Promise.all(
      (data || []).map(async (product: any) => {
        const { data: offers } = await insforge.database
          .from("vendor_offers")
          .select("id")
          .eq("shared_product_id", product.id)
          .eq("is_active", true);
        return { ...product, seller_count: offers?.length || 0 };
      })
    );

    return paginatedResponse(enriched, count || 0, page, limit);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
