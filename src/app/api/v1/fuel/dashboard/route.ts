import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const demoDashboard = {
  account_id: "demo-account",
  current_prices: [
    { route: "Lagos \u2192 Abuja", origin: "NG", destination: "NG", fuel_price: 680, currency: "NGN", last_updated: new Date().toISOString() },
    { route: "Lagos \u2192 Port Harcourt", origin: "NG", destination: "NG", fuel_price: 680, currency: "NGN", last_updated: new Date().toISOString() },
  ],
  surcharge_impact: {
    total_shipments: 142,
    total_base_fare: 285000,
    total_surcharge: 12825,
    average_surcharge_percent: 4.5,
    currency: "NGN",
    period: "last_30_days",
  },
  active_surcharges: [
    {
      rule_name: "Nigeria Domestic Diesel",
      origin: "NG",
      destination: "NG",
      current_surcharge_percent: 4.5,
      fuel_increase_percent: 4.62,
      baseline: 650,
      current: 680,
      effective_date: new Date().toISOString(),
    },
  ],
  monthly_totals: [
    { month: "2026-01", shipments: 128, base_fare: 256000, surcharge: 8960, currency: "NGN" },
    { month: "2026-02", shipments: 135, base_fare: 270000, surcharge: 10800, currency: "NGN" },
    { month: "2026-03", shipments: 142, base_fare: 285000, surcharge: 12825, currency: "NGN" },
    { month: "2026-04", shipments: 138, base_fare: 276000, surcharge: 11040, currency: "NGN" },
    { month: "2026-05", shipments: 155, base_fare: 310000, surcharge: 13950, currency: "NGN" },
    { month: "2026-06", shipments: 142, base_fare: 285000, surcharge: 12825, currency: "NGN" },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("account_id");

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: "Missing required query param: account_id" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get current fuel prices for common routes
    const { data: prices } = await supabase
      .from("kv_fuel_prices")
      .select("*")
      .order("fetched_at", { ascending: false })
      .limit(10);

    // Get surcharge rules
    const { data: rules } = await supabase
      .from("kv_fuel_surcharge_rules")
      .select("*")
      .eq("is_active", true);

    // Get recent surcharge logs
    const { data: logs } = await supabase
      .from("kv_fuel_surcharge_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if ((!prices || prices.length === 0) && (!rules || rules.length === 0)) {
      return NextResponse.json({ success: true, data: demoDashboard, source: "demo" });
    }

    // Build dashboard from real data
    const totalShipments = logs?.length || 0;
    const totalBaseFare = logs?.reduce((sum, l) => sum + (Number(l.surcharge_amount) / (Number(l.surcharge_percent) / 100 || 1)), 0) || 0;
    const totalSurcharge = logs?.reduce((sum, l) => sum + Number(l.surcharge_amount), 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        account_id: accountId,
        current_prices: (prices || []).map((p) => ({
          route: `${p.country_code} (${p.fuel_type})`,
          origin: p.country_code,
          destination: p.country_code,
          fuel_price: p.price,
          currency: p.currency_code,
          last_updated: p.fetched_at,
        })),
        surcharge_impact: {
          total_shipments: totalShipments,
          total_base_fare: Math.round(totalBaseFare),
          total_surcharge: Math.round(totalSurcharge),
          average_surcharge_percent: totalBaseFare > 0 ? Math.round((totalSurcharge / totalBaseFare) * 10000) / 100 : 0,
          currency: "NGN",
          period: "last_30_days",
        },
        active_surcharges: (rules || []).map((r) => ({
          rule_name: r.rule_name,
          origin: r.origin_country,
          destination: r.destination_country,
          current_surcharge_percent: r.surcharge_per_unit_increase,
          fuel_increase_percent: 0,
          baseline: r.baseline_fuel_price,
          current: 0,
          effective_date: r.created_at,
        })),
        monthly_totals: [],
      },
      source: "database",
    });
  } catch {
    return NextResponse.json({ success: true, data: demoDashboard, source: "demo" });
  }
}
