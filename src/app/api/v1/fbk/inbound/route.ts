import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireVendor, validateBody } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const createInboundSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  warehouse_id: z.string().uuid(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const { vendor, error: authErr } = await requireVendor(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createInboundSchema);
  if (valErr) return valErr;

  try {
    const adminDb = createAdminClient();

    const { data: warehouse } = await adminDb
      .from("warehouses")
      .select("id")
      .eq("id", body!.warehouse_id)
      .eq("status", "active")
      .single();
    if (!warehouse) return errorResponse("Warehouse not found", 404);

    const { data: plan, error: planErr } = await adminDb
      .from("fbk_inbound_plans")
      .insert({
        vendor_id: vendor!.id,
        warehouse_id: body!.warehouse_id,
        status: "pending",
        notes: body!.notes || null,
      })
      .select("*")
      .single();

    if (planErr) return errorResponse("Failed to create inbound plan: " + planErr.message, 400);

    const { data: item, error: itemErr } = await adminDb
      .from("fbk_inbound_items")
      .insert({
        plan_id: plan!.id,
        product_id: body!.product_id,
        quantity_shipped: body!.quantity,
        sku: body!.product_id,
        condition: "new",
      })
      .select("*")
      .single();

    if (itemErr) return errorResponse("Failed to add inbound item: " + itemErr.message, 400);

    return successResponse({ plan, item }, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function GET(request: NextRequest) {
  const { vendor, error: authErr } = await requireVendor(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const offset = (page - 1) * limit;

    const adminDb = createAdminClient();
    const { data: plans, error, count } = await adminDb
      .from("fbk_inbound_plans")
      .select("*, items:fbk_inbound_items(*), warehouse:warehouses(name, city, country)", { count: "exact" })
      .eq("vendor_id", vendor!.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return errorResponse(error.message, 400);

    const total = count ?? plans?.length ?? 0;
    return successResponse({
      plans: plans || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
