import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = createAdminClient();
    const { id } = params;

    const { data: storefront, error } = await db
      .from("storefronts")
      .select("*, banners:storefront_banners(*, image_url, headline, subtext, cta_text, cta_url)")
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (error || !storefront) return errorResponse("Storefront not found", 404);

    return successResponse(storefront);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
