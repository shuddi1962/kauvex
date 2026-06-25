import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { updateReferralStage, deleteReferral } from "@/lib/affiliates/b2b";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const { stage, first_payment_date, notes } = body;

    if (!stage) {
      return NextResponse.json({ error: "stage is required" }, { status: 400 });
    }

    const referral = await updateReferralStage(params.id, stage, {
      first_payment_date,
      notes,
    });

    return NextResponse.json({ referral });
  } catch (err) {
    console.error("B2B referral PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await deleteReferral(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("B2B referral DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
