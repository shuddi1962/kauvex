import { NextRequest } from "next/server";
import { insforge } from "@/lib/insforge";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, requireAdmin, validateBody } from "@/lib/api-helpers";
import { z } from "zod";

const transferSchema = z.object({
  from_warehouse_id: z.string(),
  to_warehouse_id: z.string(),
  product_id: z.string(),
  quantity: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;
  const { data: body, error: valErr } = await validateBody(request, transferSchema);
  if (valErr) return valErr;

  try {
    const adminDb = createAdminClient();
    const { data: fromInv } = await adminDb
      .from("warehouse_inventory")
      .select("*")
      .eq("warehouse_id", body!.from_warehouse_id)
      .eq("product_id", body!.product_id)
      .maybeSingle();

    if (!fromInv || (fromInv.quantity || 0) < body!.quantity) {
      return errorResponse("Insufficient inventory at source warehouse", 400);
    }

    await adminDb.from("warehouse_inventory").update({ quantity: fromInv.quantity - body!.quantity, updated_at: new Date().toISOString() }).eq("id", fromInv.id);

    const { data: toInv } = await adminDb.from("warehouse_inventory").select("*").eq("warehouse_id", body!.to_warehouse_id).eq("product_id", body!.product_id).maybeSingle();
    if (toInv) {
      await adminDb.from("warehouse_inventory").update({ quantity: (toInv.quantity || 0) + body!.quantity, updated_at: new Date().toISOString() }).eq("id", toInv.id);
    } else {
      await adminDb.from("warehouse_inventory").insert({ warehouse_id: body!.to_warehouse_id, product_id: body!.product_id, quantity: body!.quantity });
    }

    const { data: transfer, error: tErr } = await adminDb.from("inventory_movements").insert({
      warehouse_id: body!.from_warehouse_id,
      product_id: body!.product_id,
      quantity_change: -body!.quantity,
      reason: `transfer_to_${body!.to_warehouse_id}`,
      reference_type: "transfer",
    }).select("*").single();

    if (tErr) return errorResponse(tErr.message, 400);
    return successResponse(transfer, 201);
  } catch { return errorResponse("Internal server error", 500); }
}

export async function GET(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { data, error } = await insforge.database
      .from("inventory_movements")
      .select("*, warehouses!inner(name), products!inner(name, sku)")
      .eq("reference_type", "transfer")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return errorResponse(error.message, 400);
    return successResponse(data || []);
  } catch { return errorResponse("Internal server error", 500); }
}
