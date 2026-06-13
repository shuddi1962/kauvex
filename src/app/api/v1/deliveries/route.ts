import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin, validateBody } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const assignDeliverySchema = z.object({
  order_id: z.string().uuid(),
  driver_id: z.string().uuid(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const adminDb = createAdminClient();
    const { data, error } = await adminDb
      .from("deliveries")
      .select("*, order:orders(order_number, status, shipping_address), driver:delivery_riders(name, phone, vehicle_type)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return errorResponse("Failed to fetch deliveries", 500);

    return successResponse(data || []);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, assignDeliverySchema);
  if (valErr) return valErr;

  try {
    const adminDb = createAdminClient();

    const { data: order } = await adminDb
      .from("orders")
      .select("id, status")
      .eq("id", body!.order_id)
      .single();
    if (!order) return errorResponse("Order not found", 404);

    const { data: driver } = await adminDb
      .from("delivery_riders")
      .select("id, status")
      .eq("id", body!.driver_id)
      .single();
    if (!driver) return errorResponse("Driver not found", 404);

    const { data: delivery, error: dErr } = await adminDb
      .from("deliveries")
      .insert({
        order_id: body!.order_id,
        driver_id: body!.driver_id,
        notes: body!.notes || null,
        status: "assigned",
      })
      .select("*")
      .single();

    if (dErr) return errorResponse("Failed to assign delivery: " + dErr.message, 400);

    await adminDb
      .from("orders")
      .update({ status: "dispatched", updated_at: new Date().toISOString() })
      .eq("id", body!.order_id);

    return successResponse(delivery, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
