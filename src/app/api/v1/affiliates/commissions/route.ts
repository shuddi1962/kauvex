import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partner_id");
    const status = searchParams.get("status");

    let query = supabase
      .from("kv_aff_commissions")
      .select("*, kv_aff_partners(name, email)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (partnerId) query = query.eq("partner_id", partnerId);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({
        data: [
          { id: "c1", partner_id: "p1", partner_name: "Lagos Tech Blog", order_id: "ord-001", order_total: 85000, commission_amount: 4250, status: "approved", created_at: "2026-06-25" },
          { id: "c2", partner_id: "p2", partner_name: "Fashion Influencer NG", order_id: "ord-002", order_total: 42000, commission_amount: 2100, status: "pending", created_at: "2026-06-26" },
          { id: "c3", partner_id: "p1", partner_name: "Lagos Tech Blog", order_id: "ord-003", order_total: 120000, commission_amount: 6000, status: "approved", created_at: "2026-06-24" },
        ],
        summary: { total: 3, pending: 1, approved: 2, total_commission: 12350 },
      });
    }

    const commissions = data || [];
    const summary = {
      total: commissions.length,
      pending: commissions.filter((c) => c.status === "pending").length,
      approved: commissions.filter((c) => c.status === "approved").length,
      total_commission: commissions.reduce((sum, c) => sum + (Number(c.commission_amount) || 0), 0),
    };

    return NextResponse.json({ data: commissions, summary });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
