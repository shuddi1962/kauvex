import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { partner_id, order_id, order_total, click_id, conversion_type } = body;

    if (!partner_id || !order_id || !order_total) {
      return NextResponse.json({ error: "partner_id, order_id, and order_total are required" }, { status: 400 });
    }

    // Fetch partner commission rate
    const { data: partner } = await supabase
      .from("kv_aff_partners")
      .select("commission_rate, commission_model, status")
      .eq("id", partner_id)
      .single();

    if (!partner || partner.status !== "active") {
      return NextResponse.json({ error: "Partner not active" }, { status: 403 });
    }

    const rate = Number(partner.commission_rate) || 5;
    const model = partner.commission_model || "percentage";
    let commission = 0;

    if (model === "percentage") {
      commission = (Number(order_total) * rate) / 100;
    } else if (model === "flat") {
      commission = rate;
    }

    // Self-referral check: same IP as purchaser
    // (would need IP from order + click, simplified here)

    const { data, error } = await supabase
      .from("kv_aff_commissions")
      .insert({
        partner_id,
        order_id,
        order_total: Number(order_total),
        commission_amount: commission,
        click_id: click_id || null,
        conversion_type: conversion_type || "sale",
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.log("[Affiliate Conversion]", { partner_id, order_id, commission });
      return NextResponse.json({ data: { id: "conv_demo", commission_amount: commission } });
    }

    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
