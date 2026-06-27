import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("kv_users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { payout_ids } = body;

    if (!payout_ids || !Array.isArray(payout_ids) || payout_ids.length === 0) {
      return NextResponse.json(
        { error: "payout_ids array is required" },
        { status: 400 }
      );
    }

    const { data: payouts, error: fetchError } = await supabase
      .from("kv_ship_partner_payouts")
      .select("*")
      .in("id", payout_ids)
      .eq("status", "pending");

    if (fetchError) throw fetchError;

    if (!payouts || payouts.length === 0) {
      return NextResponse.json(
        { error: "No pending payouts found for the provided IDs" },
        { status: 404 }
      );
    }

    const totalAmount = payouts.reduce(
      (sum: number, p: { net_amount: number }) => sum + Number(p.net_amount || 0),
      0
    );

    const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}`;

    const { error: updateError } = await supabase
      .from("kv_ship_partner_payouts")
      .update({ status: "processing", batch_id: batchId })
      .in("id", payout_ids)
      .eq("status", "pending");

    if (updateError) throw updateError;

    return NextResponse.json({
      processed: payouts.length,
      total_amount: totalAmount,
      status: "processing",
      batch_id: batchId,
      message: `${payouts.length} payout(s) queued for processing`,
    });
  } catch (error) {
    console.error("[Batch Payouts]", error);
    return NextResponse.json(
      { error: "Failed to process payout batch" },
      { status: 500 }
    );
  }
}
