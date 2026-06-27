import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_aff_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      return NextResponse.json({
        data: {
          default_commission_rate: 5,
          default_commission_model: "percentage",
          min_payout_amount: 5000,
          payout_schedule: "weekly",
          auto_approve_threshold: 25000,
          fraud_detection_enabled: true,
          cookie_duration_days: 30,
          max_clicks_per_minute: 50,
          vpn_detection_enabled: true,
        },
      });
    }

    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const { error } = await supabase
      .from("kv_aff_settings")
      .upsert(body, { onConflict: "id" });

    if (error) {
      console.log("[Affiliate Settings Update]", body);
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
