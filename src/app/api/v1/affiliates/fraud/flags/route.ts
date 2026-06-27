import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partner_id");

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("kv_aff_fraud_flags")
      .select("*")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch {
    const demo = [
      {
        id: "f1",
        type: "rapid_clicks",
        description: "52 clicks in 1 minute from same IP",
        severity: "high",
        status: "open",
        created_at: "2026-06-25",
      },
      {
        id: "f2",
        type: "vpn_detected",
        description: "VPN usage detected on 3 conversions",
        severity: "medium",
        status: "investigating",
        created_at: "2026-06-24",
      },
    ];

    return NextResponse.json({ success: true, data: demo, fallback: true });
  }
}
