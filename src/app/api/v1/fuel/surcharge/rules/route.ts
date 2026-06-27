import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const demoRules = [
  {
    id: "rule-001",
    rule_name: "Nigeria Domestic Diesel",
    origin_country: "NG",
    origin_city: null,
    destination_country: "NG",
    destination_city: null,
    tier: "TIER_1_LOCAL",
    baseline_fuel_price: 650,
    baseline_currency: "NGN",
    surcharge_formula: "percent_per_unit",
    surcharge_per_unit_increase: 0.5,
    unit_increase_amount: 10,
    max_surcharge_percent: 15,
    min_fuel_increase_to_activate: 5,
    partner_share_percent: 70,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "rule-002",
    rule_name: "UK Domestic",
    origin_country: "GB",
    origin_city: null,
    destination_country: "GB",
    destination_city: null,
    tier: "all",
    baseline_fuel_price: 1.35,
    baseline_currency: "GBP",
    surcharge_formula: "percent_per_unit",
    surcharge_per_unit_increase: 0.3,
    unit_increase_amount: 0.05,
    max_surcharge_percent: 10,
    min_fuel_increase_to_activate: 3,
    partner_share_percent: 60,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "rule-003",
    rule_name: "US Domestic",
    origin_country: "US",
    origin_city: null,
    destination_country: "US",
    destination_city: null,
    tier: "all",
    baseline_fuel_price: 3.5,
    baseline_currency: "USD",
    surcharge_formula: "percent_per_unit",
    surcharge_per_unit_increase: 0.25,
    unit_increase_amount: 0.1,
    max_surcharge_percent: 12,
    min_fuel_increase_to_activate: 4,
    partner_share_percent: 65,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_fuel_surcharge_rules")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: demoRules, source: "demo" });
    }

    return NextResponse.json({ success: true, data, source: "database" });
  } catch {
    return NextResponse.json({ success: true, data: demoRules, source: "demo" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("kv_fuel_surcharge_rules")
      .insert({
        rule_name: body.rule_name,
        origin_country: body.origin_country || null,
        origin_city: body.origin_city || null,
        destination_country: body.destination_country || null,
        destination_city: body.destination_city || null,
        tier: body.tier || "all",
        baseline_fuel_price: body.baseline_fuel_price || 0,
        baseline_currency: body.baseline_currency || "USD",
        surcharge_formula: body.surcharge_formula || "percent_per_unit",
        surcharge_per_unit_increase: body.surcharge_per_unit_increase || 0.5,
        unit_increase_amount: body.unit_increase_amount || 10,
        max_surcharge_percent: body.max_surcharge_percent || 15,
        min_fuel_increase_to_activate: body.min_fuel_increase_to_activate || 5,
        partner_share_percent: body.partner_share_percent || 70,
        is_active: body.is_active !== undefined ? body.is_active : true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: id" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_fuel_surcharge_rules")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required query param: id" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("kv_fuel_surcharge_rules")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
