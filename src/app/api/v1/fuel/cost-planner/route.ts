import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const demoProjection = {
  period_months: 6,
  scenario: "moderate",
  routes: [
    {
      origin: "NG",
      destination: "NG",
      monthly_volume: 50,
      current_fuel_cost: 34000,
      projected_fuel_costs: [
        { month: "2026-07", fuel_cost: 35700, increase_percent: 5 },
        { month: "2026-08", fuel_cost: 36750, increase_percent: 8.09 },
        { month: "2026-09", fuel_cost: 37800, increase_percent: 11.18 },
        { month: "2026-10", fuel_cost: 38850, increase_percent: 14.26 },
        { month: "2026-11", fuel_cost: 39900, increase_percent: 17.35 },
        { month: "2026-12", fuel_cost: 40950, increase_percent: 20.44 },
      ],
      total_projected: 229950,
    },
  ],
  summary: {
    total_current_monthly: 34000,
    total_projected: 229950,
    total_increase: 34950,
    average_increase_percent: 17.04,
    currency: "NGN",
  },
};

const scenarioMultipliers: Record<string, number> = {
  conservative: 0.5,
  moderate: 1.0,
  pessimistic: 2.0,
  custom: 1.0,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period_months, routes, scenario, custom_increase } = body;

    if (!period_months || !routes || !Array.isArray(routes) || routes.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: period_months, routes (array)" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const multiplier = scenarioMultipliers[scenario || "moderate"] || 1.0;

    const projectedRoutes = [];
    let totalCurrentMonthly = 0;
    let totalProjected = 0;

    for (const route of routes) {
      const { origin, destination, volume } = route;

      // Get current fuel price for origin
      const { data: fuelPrice } = await supabase
        .from("kv_fuel_prices")
        .select("price, currency_code")
        .eq("country_code", origin)
        .order("fetched_at", { ascending: false })
        .limit(1)
        .single();

      const pricePerLiter = fuelPrice?.price || (origin === "NG" ? 680 : origin === "GB" ? 1.42 : 3.65);
      const currency = fuelPrice?.currency_code || (origin === "NG" ? "NGN" : origin === "GB" ? "GBP" : "USD");
      const avgDistance = 25; // default km per delivery
      const consumptionPerKm = 0.04;
      const currentMonthlyCost = volume * avgDistance * consumptionPerKm * pricePerLiter;

      const monthlyProjections = [];
      for (let i = 0; i < period_months; i++) {
        const increasePercent = (i + 1) * 2.5 * multiplier * (custom_increase ? custom_increase / 100 : 1);
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() + i + 1);
        const monthLabel = monthDate.toISOString().slice(0, 7);

        monthlyProjections.push({
          month: monthLabel,
          fuel_cost: Math.round(currentMonthlyCost * (1 + increasePercent / 100)),
          increase_percent: Math.round(increasePercent * 100) / 100,
        });
      }

      const routeTotal = monthlyProjections.reduce((sum, p) => sum + p.fuel_cost, 0);
      totalCurrentMonthly += currentMonthlyCost;
      totalProjected += routeTotal;

      projectedRoutes.push({
        origin,
        destination: destination || origin,
        monthly_volume: volume || 50,
        current_fuel_cost: Math.round(currentMonthlyCost),
        projected_fuel_costs: monthlyProjections,
        total_projected: routeTotal,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        period_months,
        scenario: scenario || "moderate",
        routes: projectedRoutes,
        summary: {
          total_current_monthly: Math.round(totalCurrentMonthly),
          total_projected: Math.round(totalProjected),
          total_increase: Math.round(totalProjected - totalCurrentMonthly * period_months),
          average_increase_percent: totalCurrentMonthly > 0
            ? Math.round(((totalProjected / period_months) / totalCurrentMonthly - 1) * 10000) / 100
            : 0,
          currency: "NGN",
        },
      },
    });
  } catch {
    return NextResponse.json({ success: true, data: demoProjection, source: "demo" });
  }
}
