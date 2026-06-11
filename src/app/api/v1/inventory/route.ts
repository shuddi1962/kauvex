import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, paginatedResponse, requireVendor, validateBody } from "@/lib/api-helpers";
import { z } from "zod";

const updateInventorySchema = z.object({
  product_id: z.string().uuid(),
  location_name: z.string().optional(),
  quantity: z.number().int().min(0),
  low_stock_threshold: z.number().int().min(0).optional(),
});

export async function GET(request: NextRequest) {
  const { vendor, error: authErr } = await requireVendor(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const db = createAdminClient();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;
    const lowStock = searchParams.get("lowStock") === "true";

    const productIdsQuery = db
      .from("products")
      .select("id")
      .eq("vendor_id", vendor!.id);

    const { data: vendorProducts } = await productIdsQuery;
    if (!vendorProducts || vendorProducts.length === 0) {
      return paginatedResponse([], 0, page, limit);
    }

    const ids = vendorProducts.map((p: any) => p.id);

    let query = db
      .from("product_inventory")
      .select("*, product:product_id(id, name, sku, images, regular_price, status)", { count: "exact" })
      .in("product_id", ids);

    if (lowStock) {
      query = query.lt("quantity", 5);
    }

    const { data: inventory, error, count } = await query
      .order("product_id")
      .range(offset, offset + limit - 1);

    if (error) return errorResponse("Failed to fetch inventory", 500);

    return paginatedResponse(inventory || [], count || 0, page, limit);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(request: NextRequest) {
  const { vendor, error: authErr } = await requireVendor(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, updateInventorySchema);
  if (valErr) return valErr;

  try {
    const db = createAdminClient();

    const { data: product } = await db
      .from("products")
      .select("id, vendor_id")
      .eq("id", body!.product_id)
      .single();

    if (!product) return errorResponse("Product not found", 404);
    if (product.vendor_id !== vendor!.id) return errorResponse("You do not own this product", 403);

    const { data: existing } = await db
      .from("product_inventory")
      .select("id")
      .eq("product_id", body!.product_id)
      .eq("location_name", body!.location_name || "default")
      .single();

    let result;
    if (existing) {
      const { data: updated, error } = await db
        .from("product_inventory")
        .update({
          quantity: body!.quantity,
          ...(body!.low_stock_threshold !== undefined ? { low_stock_threshold: body!.low_stock_threshold } : {}),
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) return errorResponse(error.message, 400);
      result = updated;
    } else {
      const { data: created, error } = await db
        .from("product_inventory")
        .insert({
          product_id: body!.product_id,
          location_name: body!.location_name || "default",
          quantity: body!.quantity,
          low_stock_threshold: body!.low_stock_threshold || 5,
        })
        .select("*")
        .single();

      if (error) return errorResponse(error.message, 400);
      result = created;
    }

    return successResponse(result);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
