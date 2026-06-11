import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, paginatedResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { z } from "zod";
import crypto from "crypto";

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

const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(VALID_EVENTS)).min(1),
});

function generateSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const db = createAdminClient();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    const { data: profile } = await db.from("profiles").select("role, vendor_id").eq("id", user!.id).single();
    const isAdmin = profile?.role && ["super-admin", "store-manager"].includes(profile.role);

    let query = db
      .from("webhooks")
      .select("*", { count: "exact" });

    if (!isAdmin) {
      query = query.eq("owner_id", user!.id);
    }

    const { data: webhooks, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return errorResponse("Failed to fetch webhooks", 500);

    const sanitized = (webhooks || []).map((w: any) => ({
      ...w,
      secret: w.secret ? `${w.secret.substring(0, 8)}...` : null,
    }));

    return paginatedResponse(sanitized, count || 0, page, limit);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createWebhookSchema);
  if (valErr) return valErr;

  try {
    const db = createAdminClient();

    const { data: profile } = await db.from("profiles").select("role, vendor_id").eq("id", user!.id).single();
    const ownerType = profile?.role === "vendor" ? "vendor" : "user";

    const { data: webhook, error } = await db
      .from("webhooks")
      .insert({
        owner_id: user!.id,
        owner_type: ownerType,
        url: body!.url,
        secret: generateSecret(),
        events: body!.events,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) return errorResponse(error.message, 400);

    return successResponse(webhook, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
