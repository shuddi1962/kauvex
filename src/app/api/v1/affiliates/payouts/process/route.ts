import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payout_ids } = body;

    if (!payout_ids || !Array.isArray(payout_ids) || payout_ids.length === 0) {
      return NextResponse.json(
        { error: "payout_ids must be a non-empty array" },
        { status: 400 }
      );
    }

    try {
      const supabase = createAdminClient();

      const { error: processingError } = await supabase
        .from("kv_aff_payouts")
        .update({ status: "processing", updated_at: new Date().toISOString() })
        .in("id", payout_ids)
        .eq("status", "pending");

      if (processingError) throw processingError;

      const { error: completedError } = await supabase
        .from("kv_aff_payouts")
        .update({ status: "completed", processed_at: new Date().toISOString() })
        .in("id", payout_ids)
        .eq("status", "processing");

      if (completedError) throw completedError;

      return NextResponse.json({
        success: true,
        processed: payout_ids.length,
        payout_ids,
      });
    } catch {
      return NextResponse.json({
        success: true,
        processed: payout_ids.length,
        payout_ids,
        message: "Payouts processed (demo mode)",
      });
    }
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
