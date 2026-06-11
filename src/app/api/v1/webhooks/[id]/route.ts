import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { z } from "zod";

const VALID_EVENTS = [
  "order.created",
  "order.updated",
  "order.cancelled",
  "order.completed",
  "product.created",
  "product.updated",
  "product.deleted",
  "vendor.approved",
  "vendor.rejected",
  "dispute.created",
  "dispute.resolved",
  "payout.completed",
] as const;

const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.enum(VALID_EVENTS)).min(1).optional(),
  is_active: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, updateWebhookSchema);
  if (valErr) return valErr;

  try {
    const db = createAdminClient();
    const { id } = params;

    const { data: existing } = await db.from("webhooks").select("owner_id").eq("id", id).single();
    if (!existing) return errorResponse("Webhook not found", 404);

    const { data: profile } = await db.from("profiles").select("role").eq("id", user!.id).single();
    const isAdmin = profile?.role && ["super-admin", "store-manager"].includes(profile.role);

    if (existing.owner_id !== user!.id && !isAdmin) {
      return errorResponse("Access denied", 403);
    }

    const updates: Record<string, unknown> = { ...body! };
    if (body!.url) updates.url = body!.url;
    if (body!.events) updates.events = body!.events;
    if (body!.is_active !== undefined) updates.is_active = body!.is_active;

    const { data: webhook, error } = await db
      .from("webhooks")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return errorResponse(error.message, 400);

    return successResponse(webhook);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const db = createAdminClient();
    const { id } = params;

    const { data: existing } = await db.from("webhooks").select("owner_id").eq("id", id).single();
    if (!existing) return errorResponse("Webhook not found", 404);

    const { data: profile } = await db.from("profiles").select("role").eq("id", user!.id).single();
    const isAdmin = profile?.role && ["super-admin", "store-manager"].includes(profile.role);

    if (existing.owner_id !== user!.id && !isAdmin) {
      return errorResponse("Access denied", 403);
    }

    const { error } = await db.from("webhooks").delete().eq("id", id);
    if (error) return errorResponse(error.message, 400);

    return successResponse({ message: "Webhook deleted" });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
