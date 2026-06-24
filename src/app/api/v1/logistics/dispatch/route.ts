import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api-helpers";

const CONFIG_KEY = "dispatch_settings";

export async function GET(_request: NextRequest) {
  try {
    const db = createAdminClient();
    const { data } = await db
      .from("app_settings")
      .select("value")
      .eq("key", CONFIG_KEY)
      .single();

    return successResponse(data?.value || getDefaultConfig());
  } catch {
    return successResponse(getDefaultConfig());
  }
}

export async function PUT(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const db = createAdminClient();
    const { data: existing } = await db
      .from("app_settings")
      .select("id")
      .eq("key", CONFIG_KEY)
      .single();

    if (existing) {
      await db.from("app_settings").update({ value: body, updated_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      await db.from("app_settings").insert({ key: CONFIG_KEY, value: body });
    }

    return successResponse({ message: "Dispatch settings saved" });
  } catch {
    return errorResponse("Failed to save dispatch settings", 500);
  }
}

function getDefaultConfig() {
  return {
    tier1AcceptanceWindow: 15,
    tier1RadiusDefault: 60,
    tier1RadiusPerCountry: { NG: 60, GH: 50, KE: 50, ZA: 80, US: 40, GB: 50 },
    surgeEnabled: false,
    surgeMultiplier: 1.5,
    fallbackCarrierOrder: ["gig", "kwik", "dhl", "fedex"],
    autoDispatchEnabled: true,
    partnerFallbackAttempts: 3,
  };
}
