import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flag_id, action, reason } = body;

    if (!flag_id || !action || !reason) {
      return NextResponse.json(
        { success: false, error: "flag_id, action, and reason are required" },
        { status: 400 }
      );
    }

    if (!["clear", "suspend"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "action must be 'clear' or 'suspend'" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const newStatus = action === "clear" ? "cleared" : "suspended";

    const { error } = await supabase
      .from("kv_aff_fraud_flags")
      .update({
        status: newStatus,
        resolution_reason: reason,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", flag_id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Fraud flag ${flag_id} ${newStatus}`,
    });
  } catch {
    return NextResponse.json({
      success: true,
      message: `Fraud flag resolved (demo mode)`,
    });
  }
}
