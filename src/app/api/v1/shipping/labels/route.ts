import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const createLabelSchema = z.object({
  order_id: z.string().uuid(),
  carrier_id: z.string().uuid(),
  rate_id: z.string().uuid(),
  weight: z.number().positive().optional(),
});

function generateTrackingNumber(): string {
  const prefix = "KVX";
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}${ts}${rand}`;
}

export async function POST(request: NextRequest) {
  const { error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createLabelSchema);
  if (valErr) return valErr;

  try {
    const adminDb = createAdminClient();

    const { data: order } = await adminDb
      .from("orders")
      .select("id, order_number, status")
      .eq("id", body!.order_id)
      .single();
    if (!order) return errorResponse("Order not found", 404);

    const { data: carrier } = await adminDb
      .from("shipping_carriers")
      .select("id, name")
      .eq("id", body!.carrier_id)
      .single();
    if (!carrier) return errorResponse("Carrier not found", 404);

    const { data: rate } = await adminDb
      .from("shipping_rates")
      .select("id, price, estimated_days")
      .eq("id", body!.rate_id)
      .single();
    if (!rate) return errorResponse("Rate not found", 404);

    const shipmentNumber = "SHIP-" + Date.now().toString(36).toUpperCase();
    const trackingNumber = generateTrackingNumber();

    const { data: shipment, error: shipErr } = await adminDb
      .from("shipments")
      .insert({
        shipment_number: shipmentNumber,
        type: "outbound",
        status: "label_created",
        order_id: body!.order_id,
        carrier_id: body!.carrier_id,
        tracking_number: trackingNumber,
        weight: body!.weight || null,
        shipping_cost: rate.price,
      })
      .select("*")
      .single();

    if (shipErr) return errorResponse("Failed to create shipment: " + shipErr.message, 400);

    await adminDb
      .from("orders")
      .update({ status: "processing", tracking_number: trackingNumber, updated_at: new Date().toISOString() })
      .eq("id", body!.order_id);

    return successResponse(shipment, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
