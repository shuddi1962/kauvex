import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storefrontId = searchParams.get("storefront_id");

    const adminDb = createAdminClient();
    let query = adminDb.from("warehouses").select("id, name, code, city, state, country, status, contact_phone, contact_email");

    if (storefrontId) {
      query = query.eq("storefront_id", storefrontId);
    }

    const { data, error } = await query.eq("status", "active").order("name");

    if (error) return errorResponse(error.message, 400);
    return successResponse(data || []);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
