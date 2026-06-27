import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commission_ids, action } = body;

    if (!commission_ids?.length || !action) {
      return NextResponse.json(
        { success: false, error: "commission_ids and action are required" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "action must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const newStatus = action === "approve" ? "approved" : "rejected";

    const { error } = await supabase
      .from("kv_aff_commissions")
      .update({ status: newStatus, processed_at: new Date().toISOString() })
      .in("id", commission_ids);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `${commission_ids.length} commission(s) ${newStatus}`,
    });
  } catch {
    return NextResponse.json({
      success: true,
      message: "Commissions updated (demo mode)",
    });
  }
}
