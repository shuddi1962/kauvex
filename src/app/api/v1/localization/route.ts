import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { detectAndLocalize, getLocalizationForCountry } from "@/lib/localization-engine";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryOverride = searchParams.get("country");

    let storefronts: { slug: string; id: string; name: string }[] = [];
    try {
      const db = createAdminClient();
      const { data } = await db.from("storefronts").select("id, slug, name").eq("status", "active");
      if (data) storefronts = data;
    } catch { /* fallback */ }

    let config;
    if (countryOverride) {
      config = await getLocalizationForCountry(countryOverride.toUpperCase(), storefronts);
    } else {
      config = await detectAndLocalize(request);
    }

    return successResponse(config);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
