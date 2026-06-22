import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const schema = z.object({
  product_id: z.string(),
  category_name: z.string().optional(),
  brand_name: z.string().optional(),
  contact_email: z.string().email(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, schema);
  if (valErr) return valErr;

  try {
    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from("profiles")
      .select("vendor_id")
      .eq("id", user!.id)
      .single();

    const vendor_id = profile?.vendor_id || user!.id;

    const { data: request_rec, error: insertErr } = await adminDb
      .from("kv_approval_requests")
      .insert({
        vendor_id,
        category_name: body!.category_name || null,
        brand_name: body!.brand_name || null,
        contact_email: body!.contact_email,
        notes: body!.notes || null,
        status: "pending",
      })
      .select("*")
      .single();

    if (insertErr) return errorResponse("Failed to create approval request: " + insertErr.message, 400);

    return successResponse(request_rec, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from("profiles")
      .select("vendor_id")
      .eq("id", user!.id)
      .single();

    const vendor_id = profile?.vendor_id || user!.id;

    const { data: requests, error } = await adminDb
      .from("kv_approval_requests")
      .select("*")
      .eq("vendor_id", vendor_id)
      .order("created_at", { ascending: false });

    if (error) return errorResponse(error.message, 400);

    return successResponse(requests || []);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
