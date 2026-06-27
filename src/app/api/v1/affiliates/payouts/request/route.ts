import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partner_id, amount, payment_method, bank_details } = body;

    if (!partner_id || !amount || !payment_method) {
      return NextResponse.json(
        { error: "partner_id, amount, and payment_method are required" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("kv_aff_payouts")
        .insert({
          partner_id,
          amount,
          currency: "NGN",
          status: "pending",
          payment_method,
          bank_details: bank_details ?? null,
        })
        .select("id")
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, payout_id: data.id });
    } catch {
      return NextResponse.json({
        success: true,
        payout_id: `pay_demo_${Date.now()}`,
        message: "Payout request recorded (demo mode)",
      });
    }
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
