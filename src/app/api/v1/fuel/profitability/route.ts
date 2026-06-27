import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const demoProfitability = {
  partner_id: "partner-001",
  route_distance_km: 25,
  payout_amount: 3500,
  currency_code: "NGN",
  fuel_consumption_liters: 1,
  fuel_cost_per_liter: 680,
  total_fuel_cost: 680,
  net_earnings: 2820,
  profit_margin_percent: 80.57,
  fuel_as_percent_of_payout: 19.43,
  breakeven_distance_km: 129.41,
  recommendation: "This route is profitable. Fuel costs represent a healthy portion of your payout.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partner_id, route_distance_km, payout_amount, currency } = body;

    if (!partner_id || !route_distance_km || !payout_amount || !currency) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: partner_id, route_distance_km, payout_amount, currency" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get partner profile for consumption rate
    const { data: profile } = await supabase
      .from("kv_fuel_partner_profiles")
      .select("consumption_per_km, fuel_type, currency_code")
      .eq("partner_id", partner_id)
      .single();

    const consumptionPerKm = profile?.consumption_per_km || 0.04;

    // Get current fuel price
    const { data: fuelPrice } = await supabase
      .from("kv_fuel_prices")
      .select("price, currency_code")
      .eq("country_code", currency === "NGN" ? "NG" : currency === "GBP" ? "GB" : "US")
      .eq("fuel_type", profile?.fuel_type || "petrol")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    const fuelCostPerLiter = fuelPrice?.price || (currency === "NGN" ? 680 : currency === "GBP" ? 1.42 : 3.65);
    const totalFuelCost = route_distance_km * consumptionPerKm * fuelCostPerLiter;
    const netEarnings = payout_amount - totalFuelCost;
    const profitMargin = payout_amount > 0 ? (netEarnings / payout_amount) * 100 : 0;
    const fuelAsPercent = payout_amount > 0 ? (totalFuelCost / payout_amount) * 100 : 0;
    const breakevenDistance = consumptionPerKm * fuelCostPerLiter > 0
      ? payout_amount / (consumptionPerKm * fuelCostPerLiter)
      : 0;

    let recommendation: string;
    if (profitMargin > 60) {
      recommendation = "Excellent profit margin. This route is highly profitable for your vehicle type.";
    } else if (profitMargin > 40) {
      recommendation = "Good profit margin. This route is profitable and worth taking.";
    } else if (profitMargin > 20) {
      recommendation = "Moderate profit margin. Consider optimizing your route or fuel efficiency.";
    } else if (profitMargin > 0) {
      recommendation = "Low profit margin. Fuel costs are eating into earnings. Consider shorter routes.";
    } else {
      recommendation = "This route is not profitable. Fuel costs exceed the payout. Decline or negotiate higher rates.";
    }

    const result = {
      partner_id,
      route_distance_km: Number(route_distance_km),
      payout_amount: Number(payout_amount),
      currency_code: currency,
      fuel_consumption_liters: Math.round(route_distance_km * consumptionPerKm * 100) / 100,
      fuel_cost_per_liter: fuelCostPerLiter,
      total_fuel_cost: Math.round(totalFuelCost * 100) / 100,
      net_earnings: Math.round(netEarnings * 100) / 100,
      profit_margin_percent: Math.round(profitMargin * 100) / 100,
      fuel_as_percent_of_payout: Math.round(fuelAsPercent * 100) / 100,
      breakeven_distance_km: Math.round(breakevenDistance * 100) / 100,
      recommendation,
    };

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json({ success: true, data: demoProfitability, source: "demo" });
  }
}
