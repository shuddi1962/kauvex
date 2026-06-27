import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const partnerId = searchParams.get("partner_id");

    const supabase = createAdminClient();

    let query = supabase
      .from("kv_aff_payouts")
      .select("*, kv_aff_partners(name)")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (partnerId) query = query.eq("partner_id", partnerId);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch {
    const demo = [
      {
        id: "pay1",
        partner_name: "Lagos Tech Blog",
        amount: 25000,
        status: "completed",
        method: "bank_transfer",
        created_at: "2026-06-20",
      },
      {
        id: "pay2",
        partner_name: "Fashion Influencer NG",
        amount: 18000,
        status: "pending",
        method: "wallet",
        created_at: "2026-06-25",
      },
    ];

    return NextResponse.json({ success: true, data: demo, fallback: true });
  }
}
