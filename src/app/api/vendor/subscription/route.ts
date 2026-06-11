import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    if (!vendorId) {
      return NextResponse.json({ error: "vendor_id is required" }, { status: 400 });
    }

    const db = createAdminClient();
    const { data, error } = await db
      .from("vendor_subscriptions")
      .select("*, vendor_plans(*)")
      .eq("vendor_id", vendorId)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
    }

    if (!data) {
      const { data: freePlan } = await db
        .from("vendor_plans")
        .select("*")
        .eq("id", "free")
        .single();

      return NextResponse.json({
        subscription: null,
        default_plan: freePlan,
      });
    }

    return NextResponse.json({ subscription: data });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendor_id, plan_id, billing_cycle } = body;

    if (!vendor_id || !plan_id) {
      return NextResponse.json(
        { error: "vendor_id and plan_id are required" },
        { status: 400 }
      );
    }

    const db = createAdminClient();

    const { data: plan } = await db
      .from("vendor_plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const { data: existing } = await db
      .from("vendor_subscriptions")
      .select("id")
      .eq("vendor_id", vendor_id)
      .single();

    let result;
    if (existing) {
      const { data, error } = await db
        .from("vendor_subscriptions")
        .update({
          plan_id,
          price: plan.price,
          billing_cycle: billing_cycle || "month",
          updated_at: new Date().toISOString(),
        })
        .eq("vendor_id", vendor_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
      }
      result = data;
    } else {
      const { data, error } = await db
        .from("vendor_subscriptions")
        .insert({
          vendor_id,
          plan_id,
          price: plan.price,
          status: "active",
          billing_cycle: billing_cycle || "month",
          period_start: new Date().toISOString(),
          period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
      }
      result = data;
    }

    return NextResponse.json({ subscription: result });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    if (!vendorId) {
      return NextResponse.json({ error: "vendor_id is required" }, { status: 400 });
    }

    const db = createAdminClient();
    const { data, error } = await db
      .from("vendor_subscriptions")
      .update({
        status: "cancelled",
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("vendor_id", vendorId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
    }

    return NextResponse.json({ subscription: data });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
