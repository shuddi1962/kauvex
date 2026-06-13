import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin, validateBody } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const createPickupSchema = z.object({
  warehouse_id: z.string().uuid(),
  operating_hours: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  try {
    const adminDb = createAdminClient();
    const { data, error } = await adminDb
      .from("warehouses")
      .select("id, name, code, address, city, state, country, postal_code, contact_name, contact_phone, operating_hours, latitude, longitude")
      .eq("is_pickup_point", true)
      .eq("status", "active")
      .order("name");

    if (error) return errorResponse("Failed to fetch pickup points", 500);

    return successResponse(data || []);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createPickupSchema);
  if (valErr) return valErr;

  try {
    const adminDb = createAdminClient();
    const { data: warehouse, error } = await adminDb
      .from("warehouses")
      .update({
        is_pickup_point: true,
        operating_hours: body!.operating_hours ? JSON.stringify(body!.operating_hours) : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body!.warehouse_id)
      .select("*")
      .single();

    if (error) return errorResponse("Failed to set pickup point: " + error.message, 400);

    return successResponse(warehouse, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
