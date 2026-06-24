import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVendorBalance, debitVendorWallet } from "@/lib/payments/wallet";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");
    if (!vendorId) return NextResponse.json({ error: "vendor_id is required" }, { status: 400 });

    const db = createAdminClient();
    const { data, error } = await db
      .from("vendor_plan_subscriptions")
      .select("*, vendor_plans(*)")
      .eq("vendor_id", vendorId)
      .maybeSingle();

    if (error) return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });

    if (!data) {
      const { data: freePlan } = await db
        .from("vendor_plans")
        .select("*")
        .eq("slug", "free")
        .maybeSingle();
      return NextResponse.json({ subscription: null, default_plan: freePlan });
    }

    return NextResponse.json({ subscription: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendor_id, plan_id, billing_cycle } = body;
    if (!vendor_id || !plan_id) {
      return NextResponse.json({ error: "vendor_id and plan_id are required" }, { status: 400 });
    }

    const db = createAdminClient();
    const { data: plan } = await db
      .from("vendor_plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    const price = billing_cycle === "annual"
      ? Number(plan.annual_price || 0)
      : Number(plan.monthly_price || 0);

    // Free plan — no charge
    if (plan.slug === "free" || price === 0) {
      const { data: existing } = await db
        .from("vendor_plan_subscriptions")
        .select("id")
        .eq("vendor_id", vendor_id)
        .maybeSingle();

      let result;
      if (existing) {
        const { data, error } = await db
          .from("vendor_plan_subscriptions")
          .update({
            plan_id,
            billing_cycle: billing_cycle || "monthly",
            status: "active",
            cancel_at_period_end: false,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("vendor_id", vendor_id)
          .select()
          .single();
        if (error) return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
        result = data;
      } else {
        const { data, error } = await db
          .from("vendor_plan_subscriptions")
          .insert({
            vendor_id,
            plan_id,
            billing_cycle: billing_cycle || "monthly",
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();
        if (error) return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
        result = data;
      }
      return NextResponse.json({ subscription: result, charge: 0 });
    }

    // Paid plan — check wallet and charge
    const balance = await getVendorBalance(vendor_id);
    if (Number(balance) < price) {
      return NextResponse.json({
        error: "Insufficient wallet balance",
        required: price,
        balance: Number(balance),
        shortfall: price - Number(balance),
      }, { status: 402 });
    }

    await debitVendorWallet(
      vendor_id, price, "subscription", "plan_subscription",
      `sub_${plan_id}_${Date.now()}`,
      `${plan.name} plan - ${billing_cycle || "monthly"} billing`
    );

    const { data: result, error } = await db
      .from("vendor_plan_subscriptions")
      .upsert(
        {
          vendor_id,
          plan_id,
          billing_cycle: billing_cycle || "monthly",
          status: "active",
          cancel_at_period_end: false,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (billing_cycle === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "vendor_id", ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });

    return NextResponse.json({ subscription: result, charge: price });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");
    if (!vendorId) return NextResponse.json({ error: "vendor_id is required" }, { status: 400 });

    const db = createAdminClient();
    const { data, error } = await db
      .from("vendor_plan_subscriptions")
      .update({
        status: "cancelled",
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("vendor_id", vendorId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
    return NextResponse.json({ subscription: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
