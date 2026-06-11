import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, paginatedResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { z } from "zod";

const createOrderSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    variant_info: z.string().optional(),
  })).min(1),
  shipping_address: z.object({
    full_name: z.string().min(1),
    address_line1: z.string().min(1),
    address_line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postal_code: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().optional(),
  }),
  storefront_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

function generateOrderNumber(): string {
  const prefix = "KVX";
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const db = createAdminClient();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const offset = (page - 1) * limit;
    const status = searchParams.get("status") || "";

    let query = db
      .from("orders")
      .select("*, items:order_items(*)", { count: "exact" })
      .eq("customer_id", user!.id)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    query = query.range(offset, offset + limit - 1);

    const { data: orders, error, count } = await query;
    if (error) return errorResponse("Failed to fetch orders", 500);

    return paginatedResponse(orders || [], count || 0, page, limit);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createOrderSchema);
  if (valErr) return valErr;

  try {
    const db = createAdminClient();

    let subtotal = 0;
    const orderItems: {
      product_id: string;
      product_name: string;
      product_image: string | null;
      variant_info: string | null;
      quantity: number;
      price: number;
      total: number;
    }[] = [];

    for (const item of body!.items) {
      const { data: product } = await db
        .from("products")
        .select("id, name, images, regular_price, sale_price, status")
        .eq("id", item.product_id)
        .single();

      if (!product || product.status !== "published") {
        return errorResponse(`Product ${item.product_id} not found or unavailable`, 400);
      }

      const price = product.sale_price || product.regular_price;
      const lineTotal = price * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null,
        variant_info: item.variant_info || null,
        quantity: item.quantity,
        price,
        total: lineTotal,
      });
    }

    const orderNumber = generateOrderNumber();

    const { data: order, error: orderErr } = await db
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: user!.id,
        subtotal,
        shipping_cost: 0,
        tax: 0,
        discount: 0,
        total: subtotal,
        status: "pending",
        payment_status: "pending",
        shipping_address: body!.shipping_address,
        storefront_id: body!.storefront_id || null,
        notes: body!.notes || null,
      })
      .select("*")
      .single();

    if (orderErr) return errorResponse(orderErr.message, 400);

    const itemsToInsert = orderItems.map((item) => ({ ...item, order_id: order!.id }));
    const { data: items, error: itemsErr } = await db
      .from("order_items")
      .insert(itemsToInsert)
      .select("*");

    if (itemsErr) return errorResponse(itemsErr.message, 400);

    return successResponse({ ...order, items: items || [] }, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
