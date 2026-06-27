import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const partnerId = searchParams.get("partner_id");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    const supabase = createAdminClient();

    let query = supabase
      .from("kv_aff_commissions")
      .select("*, kv_aff_partners(name)")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (partnerId) query = query.eq("partner_id", partnerId);
    if (dateFrom) query = query.gte("created_at", dateFrom);
    if (dateTo) query = query.lte("created_at", dateTo);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch {
    const demo = [
      {
        id: "c1",
        partner_name: "Lagos Tech Blog",
        order_id: "ORD-001",
        order_total: 85000,
        commission: 4250,
        status: "approved",
        created_at: "2026-06-25",
      },
      {
        id: "c2",
        partner_name: "Fashion Influencer NG",
        order_id: "ORD-002",
        order_total: 42000,
        commission: 2100,
        status: "pending",
        created_at: "2026-06-26",
      },
    ];

    return NextResponse.json({ success: true, data: demo, fallback: true });
  }
}
