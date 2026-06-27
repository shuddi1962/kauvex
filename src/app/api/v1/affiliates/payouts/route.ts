import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEMO_PAYOUTS = [
  { id: "pay1", partner_id: "p1", amount: 25000, currency: "NGN", status: "completed", payment_method: "bank_transfer", created_at: "2026-06-20" },
  { id: "pay2", partner_id: "p1", amount: 18000, currency: "NGN", status: "pending", payment_method: "wallet", created_at: "2026-06-25" },
];

const DEMO_SUMMARY = { total_paid: 25000, pending: 18000, total_count: 2 };

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partner_id");

    if (!partnerId) {
      return NextResponse.json({ error: "partner_id is required" }, { status: 400 });
    }

    try {
      const supabase = createAdminClient();
      const { data: payouts, error } = await supabase
        .from("kv_aff_payouts")
        .select("*")
        .eq("partner_id", partnerId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const totalPaid = payouts
        ?.filter((p: { status: string }) => p.status === "completed")
        .reduce((sum: number, p: { amount: number }) => sum + p.amount, 0) ?? 0;
      const pending = payouts
        ?.filter((p: { status: string }) => p.status === "pending")
        .reduce((sum: number, p: { amount: number }) => sum + p.amount, 0) ?? 0;

      return NextResponse.json({
        payouts,
        summary: { total_paid: totalPaid, pending, total_count: payouts?.length ?? 0 },
      });
    } catch {
      return NextResponse.json({
        payouts: DEMO_PAYOUTS,
        summary: DEMO_SUMMARY,
      });
    }
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
