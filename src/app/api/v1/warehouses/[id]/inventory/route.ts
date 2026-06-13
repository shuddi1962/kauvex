import { NextRequest } from "next/server";
import { insforge } from "@/lib/insforge";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, getAuthUser, requireAdmin, validateBody } from "@/lib/api-helpers";
import { z } from "zod";

const adjustSchema = z.object({
  product_id: z.string(),
  quantity_change: z.number().int(),
  reason: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { data, error } = await insforge.database
      .from("warehouse_inventory")
      .select("*, products!inner(name, sku, images, regular_price)")
      .eq("warehouse_id", params.id)
      .order("updated_at", { ascending: false });

    if (error) return errorResponse(error.message, 400);
    return successResponse(data || []);
  } catch { return errorResponse("Internal server error", 500); }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;
  const { data: body, error: valErr } = await validateBody(request, adjustSchema);
  if (valErr) return valErr;

  try {
    const adminDb = createAdminClient();
    const { data: existing } = await adminDb
      .from("warehouse_inventory")
      .select("*")
      .eq("warehouse_id", params.id)
      .eq("product_id", body!.product_id)
      .maybeSingle();

    let result;
    if (existing) {
      const newQty = (existing.quantity || 0) + body!.quantity_change;
      const { data, error } = await adminDb
        .from("warehouse_inventory")
        .update({ quantity: Math.max(0, newQty), updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select("*")
        .single();
      if (error) return errorResponse(error.message, 400);
      result = data;
    } else {
      const { data, error } = await adminDb
        .from("warehouse_inventory")
        .insert({ warehouse_id: params.id, product_id: body!.product_id, quantity: Math.max(0, body!.quantity_change) })
        .select("*")
        .single();
      if (error) return errorResponse(error.message, 400);
      result = data;
    }

    await adminDb.from("inventory_movements").insert({
      warehouse_id: params.id,
      product_id: body!.product_id,
      quantity_change: body!.quantity_change,
      reason: body!.reason || "manual_adjustment",
      reference_type: "adjustment",
    });

    return successResponse(result);
  } catch { return errorResponse("Internal server error", 500); }
}
