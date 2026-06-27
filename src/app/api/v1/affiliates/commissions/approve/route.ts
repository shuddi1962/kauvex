import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { commission_id, action } = body;

    if (!commission_id || !action) {
      return NextResponse.json({ error: "commission_id and action required" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    const { error } = await supabase
      .from("kv_aff_commissions")
      .update({ status: newStatus, approved_at: new Date().toISOString() })
      .eq("id", commission_id);

    if (error) {
      console.log("[Affiliate Commission Approve]", { commission_id, newStatus });
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
