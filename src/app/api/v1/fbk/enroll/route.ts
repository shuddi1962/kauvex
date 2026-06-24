import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireVendor, requireAdmin, validateBody } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const { vendor, error: authErr } = await requireVendor(request);
  if (authErr) return authErr;

  try {
    const adminDb = createAdminClient();
    const { data: enrollment } = await adminDb
      .from("fbk_enrollments")
      .select("*")
      .eq("vendor_id", vendor!.id)
      .maybeSingle();

    return successResponse(enrollment || null);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

const enrollSchema = z.object({
  vendor_store_id: z.string().uuid().optional(),
  storage_limit: z.number().positive().optional(),
});

export async function POST(request: NextRequest) {
  const { vendor, error: authErr } = await requireVendor(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, enrollSchema);
  if (valErr) return valErr;

  try {
    const adminDb = createAdminClient();
    const { data: existing } = await adminDb
      .from("fbk_enrollments")
      .select("id, status")
      .eq("vendor_id", vendor!.id)
      .maybeSingle();

    if (existing) return errorResponse("Vendor already has an enrollment", 409);

    const { data: enrollment, error } = await adminDb
      .from("fbk_enrollments")
      .insert({
        vendor_id: vendor!.id,
        vendor_store_id: body!.vendor_store_id || null,
        status: "active",
        storage_limit: body!.storage_limit || null,
        approved_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) return errorResponse("Failed to create enrollment: " + error.message, 400);

    return successResponse(enrollment, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["approved", "rejected"]),
});

export async function PATCH(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, patchSchema);
  if (valErr) return valErr;

  try {
    const adminDb = createAdminClient();
    const updates: Record<string, unknown> = { status: body!.status };
    if (body!.status === "approved") {
      updates.approved_at = new Date().toISOString();
    }

    const { data: enrollment, error } = await adminDb
      .from("fbk_enrollments")
      .update(updates)
      .eq("id", body!.id)
      .select("*")
      .single();

    if (error) return errorResponse("Failed to update enrollment: " + error.message, 400);
    return successResponse(enrollment);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
