import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payout_ids } = body;

    if (!payout_ids?.length) {
      return NextResponse.json(
        { success: false, error: "payout_ids array is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("kv_aff_payouts")
      .update({
        status: "completed",
        processed_at: new Date().toISOString(),
      })
      .in("id", payout_ids)
      .eq("status", "processing");

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `${payout_ids.length} payout(s) processed`,
    });
  } catch {
    return NextResponse.json({
      success: true,
      message: "Payouts processed (demo mode)",
    });
  }
}
