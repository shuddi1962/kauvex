import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");

    const supabase = createAdminClient();

    let query = supabase
      .from("kv_aff_fraud_flags")
      .select("*, kv_aff_partners(name)")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (severity) query = query.eq("severity", severity);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch {
    const demo = [
      {
        id: "f1",
        partner_name: "Suspicious User",
        type: "rapid_clicks",
        severity: "high",
        status: "open",
        ip_address: "197.210.xx.xx",
        created_at: "2026-06-25",
      },
      {
        id: "f2",
        partner_name: "VPN User",
        type: "vpn_detected",
        severity: "medium",
        status: "investigating",
        ip_address: "102.89.xx.xx",
        created_at: "2026-06-24",
      },
    ];

    return NextResponse.json({ success: true, data: demo, fallback: true });
  }
}
