import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin, validateBody } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const createDriverSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(1).max(50),
  email: z.string().email().optional(),
  vehicle_type: z.string().optional(),
  license_number: z.string().optional(),
  warehouse_id: z.string().uuid().optional(),
});

export async function GET() {
  try {
    const adminDb = createAdminClient();
    const { data, error } = await adminDb
      .from("delivery_riders")
      .select("*, warehouse:warehouses(name, city)")
      .order("created_at", { ascending: false });

    if (error) return errorResponse("Failed to fetch drivers", 500);

    return successResponse(data || []);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createDriverSchema);
  if (valErr) return valErr;

  try {
    const adminDb = createAdminClient();
    const { data: driver, error } = await adminDb
      .from("delivery_riders")
      .insert({
        name: body!.name,
        phone: body!.phone,
        email: body!.email || null,
        vehicle_type: body!.vehicle_type || null,
        license_number: body!.license_number || null,
        warehouse_id: body!.warehouse_id || null,
        status: "active",
      })
      .select("*")
      .single();

    if (error) return errorResponse("Failed to create driver: " + error.message, 400);

    return successResponse(driver, 201);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
