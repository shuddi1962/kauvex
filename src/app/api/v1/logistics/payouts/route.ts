import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partnerId");
    const status = searchParams.get("status");

    const supabase = createAdminClient();
    let query = supabase.from("kv_ship_partner_payouts").select("*");

    if (partnerId) query = query.eq("partner_id", partnerId);
    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("created_at", { ascending: false }).limit(100);
    if (error) throw error;

    const totalAmount = data?.reduce((sum, p) => sum + Number(p.net_amount || 0), 0) || 0;

    return NextResponse.json({ payouts: data, total: data?.length || 0, totalAmount });
  } catch (error) {
    console.error("[Payouts API]", error);
    return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase.from("kv_ship_partner_payouts").insert({
      partner_id: body.partner_id,
      amount: body.amount,
      fee_amount: body.fee_amount || 0,
      net_amount: body.amount - (body.fee_amount || 0),
      status: "pending",
      payout_schedule: body.payout_schedule || "weekly",
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ payout: data }, { status: 201 });
  } catch (error) {
    console.error("[Payouts POST]", error);
    return NextResponse.json({ error: "Failed to create payout" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Payout ID required" }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase.from("kv_ship_partner_payouts").update(updates).eq("id", id).select().single();
    if (error) throw error;

    return NextResponse.json({ payout: data });
  } catch (error) {
    console.error("[Payouts PATCH]", error);
    return NextResponse.json({ error: "Failed to update payout" }, { status: 500 });
  }
}
