import { NextRequest } from "next/server";
import { successResponse, errorResponse, paginatedResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const returnTypeEnum = z.enum(["not_received", "not_as_described", "damaged", "wrong_item"]);

const createReturnSchema = z.object({
  order_id: z.string().uuid(),
  order_item_id: z.string().uuid().optional(),
  reason: z.string().min(1).max(1000),
  type: returnTypeEnum.default("not_as_described"),
  quantity: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createReturnSchema);
  if (valErr) return valErr;

  try {
    const adminDb = createAdminClient();

    const { data: order } = await adminDb
      .from("orders")
      .select("id, customer_id, vendor_id, status")
      .eq("id", body!.order_id)
      .single();
    if (!order) return errorResponse("Order not found", 404);

    const isOwner = order.customer_id === user!.id;
    const isVendor = profile?.role === "vendor" && order.vendor_id === profile.vendor_id;
    const isAdmin = profile?.role && ["super-admin", "admin", "support-admin"].includes(profile.role);

    if (!isOwner && !isVendor && !isAdmin) {
      return errorResponse("Not authorized to create return for this order", 403);
    }

    const { data: dispute, error: dErr } = await adminDb
      .from("disputes")
      .insert({
        order_id: body!.order_id,
        customer_id: user!.id,
        vendor_id: order.vendor_id,
        type: body!.type,
        status: "open",
        description: body!.reason,
      })
      .select("*")
      .single();

    if (dErr) return errorResponse("Failed to create return: " + dErr.message, 400);

    return successResponse(dispute, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function GET(request: NextRequest) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const offset = (page - 1) * limit;
    const adminDb = createAdminClient();

    let query = adminDb
      .from("disputes")
      .select("*, order:orders(order_number, status)", { count: "exact" })
      .order("opened_at", { ascending: false });

    const isAdmin = profile?.role && ["super-admin", "admin", "support-admin"].includes(profile.role);

    if (isAdmin) {
      // admin sees all
    } else if (profile?.role === "vendor") {
      query = query.eq("vendor_id", profile.vendor_id);
    } else {
      query = query.eq("customer_id", user!.id);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: returns, error, count } = await query;

    if (error) return errorResponse(error.message, 400);

    return paginatedResponse(returns || [], count || 0, page, limit);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
