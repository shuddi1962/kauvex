import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";

const TRACKING_STAGES = [
  { status: "pending", label: "Order Placed", description: "Your order has been placed successfully" },
  { status: "processing", label: "Processing", description: "Your order is being processed" },
  { status: "confirmed", label: "Confirmed", description: "Your order has been confirmed" },
  { status: "packed", label: "Packed", description: "Your items have been packed" },
  { status: "dispatched", label: "Dispatched", description: "Your order has been dispatched" },
  { status: "in-transit", label: "In Transit", description: "Your order is on its way" },
  { status: "delivered", label: "Delivered", description: "Your order has been delivered" },
  { status: "completed", label: "Completed", description: "Order complete" },
];

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const db = createAdminClient();
    const { id } = params;

    const { data: order, error } = await db
      .from("orders")
      .select("id, order_number, status, tracking_number, shipping_address, created_at, updated_at, customer_id")
      .eq("id", id)
      .single();

    if (error || !order) return errorResponse("Order not found", 404);

    const isOwner = order.customer_id === user!.id;
    const { data: profile } = await db.from("profiles").select("role").eq("id", user!.id).single();
    const isAdmin = profile?.role && ["super-admin", "store-manager"].includes(profile.role);

    if (!isOwner && !isAdmin) return errorResponse("Access denied", 403);

    const currentIndex = TRACKING_STAGES.findIndex((s) => s.status === order.status);
    const timeline = TRACKING_STAGES.map((stage, i) => ({
      ...stage,
      completed: i <= currentIndex,
      active: i === currentIndex,
      date: i <= currentIndex ? (i === 0 ? order.created_at : order.updated_at) : null,
    }));

    return successResponse({
      order_number: order.order_number,
      status: order.status,
      tracking_number: order.tracking_number,
      shipping_address: order.shipping_address,
      timeline,
    });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
