import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { creditOrderEarnings } from "@/lib/billing/billing-engine";
import { z } from "zod";

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["processing", "cancelled"],
  processing: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["dispatched"],
  dispatched: ["in-transit"],
  "in-transit": ["delivered"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
  refunded: [],
  "on-hold": ["processing", "cancelled"],
};

const updateStatusSchema = z.object({
  status: z.enum(["pending", "processing", "confirmed", "packed", "dispatched", "in-transit", "delivered", "completed", "cancelled", "refunded", "on-hold"]),
});

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
      .select("*, items:order_items(*)")
      .eq("id", id)
      .single();

    if (error || !order) return errorResponse("Order not found", 404);

    const isOwner = order.customer_id === user!.id;
    const isAdmin = false;

    if (!isOwner && !isAdmin) return errorResponse("Access denied", 403);

    return successResponse(order);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const isAdmin = profile?.role && ["super-admin", "store-manager"].includes(profile.role);
  const isVendor = profile?.role === "vendor";

  if (!isAdmin && !isVendor) return errorResponse("Admin or vendor access required", 403);

  const { data: body, error: valErr } = await validateBody(request, updateStatusSchema);
  if (valErr) return valErr;

  try {
    const db = createAdminClient();
    const { id } = params;

    const { data: order } = await db.from("orders").select("status").eq("id", id).single();
    if (!order) return errorResponse("Order not found", 404);

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(body!.status)) {
      return errorResponse(`Cannot transition from ${order.status} to ${body!.status}`, 422);
    }

    const updates: Record<string, unknown> = { status: body!.status, updated_at: new Date().toISOString() };

    if (body!.status === "dispatched") {
      updates.tracking_number = `KVX-${Date.now().toString(36).toUpperCase()}`;
    }

    const { data: updated, error } = await db
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return errorResponse(error.message, 400);

    if (body!.status === "completed") {
      creditOrderEarnings(id).catch((err) =>
        console.error(`Failed to credit earnings for order ${id}:`, err)
      );
    }

    return successResponse(updated);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const db = createAdminClient();
    const { id } = params;

    const { data: order } = await db.from("orders").select("status, customer_id").eq("id", id).single();
    if (!order) return errorResponse("Order not found", 404);

    if (order.customer_id !== user!.id) return errorResponse("Access denied", 403);

    if (!["pending", "processing"].includes(order.status)) {
      return errorResponse("Order can only be cancelled before it is confirmed", 422);
    }

    const { error } = await db
      .from("orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return errorResponse(error.message, 400);

    return successResponse({ message: "Order cancelled" });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
