import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface DateRange {
  start: string;
  end: string;
}

function parseDateRange(range: string): DateRange {
  const now = new Date();
  const end = now.toISOString();
  let start: string;

  switch (range) {
    case "today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      start = d.toISOString();
      break;
    }
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      start = d.toISOString();
      break;
    }
    case "month": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      start = d.toISOString();
      break;
    }
    case "year": {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      start = d.toISOString();
      break;
    }
    default: {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      start = d.toISOString();
    }
  }

  return { start, end };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      date_range = "month",
      custom_start,
      custom_end,
      group_by = "month",
    } = body;

    const supabase = createAdminClient();

    const range =
      date_range === "custom" && custom_start && custom_end
        ? { start: custom_start, end: custom_end }
        : parseDateRange(date_range);

    const { data: shipments, error } = await supabase
      .from("kv_ship_express_shipments")
      .select("*")
      .gte("created_at", range.start)
      .lte("created_at", range.end)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = shipments || [];
    const total = rows.length;

    const statusCount = {
      pending: 0,
      picked_up: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      failed: 0,
      returned: 0,
    };

    rows.forEach((r: Record<string, unknown>) => {
      const s = (r.status as string) || "pending";
      if (s in statusCount) {
        (statusCount as Record<string, number>)[s] += 1;
      }
    });

    const breakdownCards = [
      {
        label: "Total",
        value: total,
        pct: 100,
        trend: calculateTrend(rows, "all"),
      },
      {
        label: "Active",
        value:
          statusCount.picked_up +
          statusCount.in_transit +
          statusCount.out_for_delivery,
        pct: total
          ? ((statusCount.picked_up +
              statusCount.in_transit +
              statusCount.out_for_delivery) /
              total) *
            100
          : 0,
        trend: calculateTrend(rows, "active"),
      },
      {
        label: "Completed",
        value: statusCount.delivered,
        pct: total ? (statusCount.delivered / total) * 100 : 0,
        trend: calculateTrend(rows, "delivered"),
      },
      {
        label: "Returned",
        value: statusCount.returned,
        pct: total ? (statusCount.returned / total) * 100 : 0,
        trend: calculateTrend(rows, "returned"),
      },
      {
        label: "Failed",
        value: statusCount.failed,
        pct: total ? (statusCount.failed / total) * 100 : 0,
        trend: calculateTrend(rows, "failed"),
      },
    ];

    const chart1 = buildVolumeChart(rows, group_by);
    const chart2 = buildSpendChart(rows, group_by);
    const chart3 = buildCategoryChart(rows);
    const chart4 = buildAvgCheck(rows);
    const chart5 = buildDeliveryTimeChart(rows);
    const chart6 = buildCarrierPerformance(rows);
    const chart7 = buildCostBreakdown(rows);
    const chart8 = buildCarbonData(rows);
    const mapData = buildMapData(rows);

    return NextResponse.json({
      date_range: range,
      breakdown: breakdownCards,
      chart1_volume: chart1,
      chart2_spend: chart2,
      chart3_categories: chart3,
      chart4_avg_check: chart4,
      chart5_delivery_time: chart5,
      chart6_carriers: chart6,
      chart7_cost_breakdown: chart7,
      chart8_carbon: chart8,
      map_analytics: mapData,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function calculateTrend(
  rows: Record<string, unknown>[],
  type: string
): { value: number; direction: "up" | "down" } {
  if (rows.length < 2) return { value: 0, direction: "up" };

  const now = new Date();
  const midpoint = new Date(now);
  midpoint.setDate(midpoint.getDate() - Math.floor(rows.length * 0.05 || 1));

  const recent = rows.filter(
    (r) => new Date(r.created_at as string) >= midpoint
  );
  const older = rows.filter(
    (r) => new Date(r.created_at as string) < midpoint
  );

  const filterByType = (arr: Record<string, unknown>[]) => {
    switch (type) {
      case "active":
        return arr.filter((r) =>
          ["picked_up", "in_transit", "out_for_delivery"].includes(
            r.status as string
          )
        );
      case "delivered":
        return arr.filter((r) => r.status === "delivered");
      case "returned":
        return arr.filter((r) => r.status === "returned");
      case "failed":
        return arr.filter((r) => r.status === "failed");
      default:
        return arr;
    }
  };

  const rCount = filterByType(recent).length;
  const oCount = filterByType(older).length;

  if (oCount === 0)
    return { value: rCount > 0 ? 100 : 0, direction: "up" };

  const pct = ((rCount - oCount) / oCount) * 100;
  return {
    value: Math.abs(Math.round(pct)),
    direction: pct >= 0 ? "up" : "down",
  };
}

function buildVolumeChart(
  rows: Record<string, unknown>[],
  groupBy: string
): Record<string, unknown> {
  const buckets: Record<
    string,
    {
      delivered: number;
      in_transit: number;
      picked_up: number;
      failed: number;
      pending: number;
      returned: number;
    }
  > = {};

  rows.forEach((r) => {
    const d = new Date(r.created_at as string);
    let key: string;

    if (groupBy === "week") {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d.setDate(diff));
      key = weekStart.toISOString().slice(0, 10);
    } else if (groupBy === "year") {
      key = d.toISOString().slice(0, 4);
    } else {
      key = d.toISOString().slice(0, 7);
    }

    if (!buckets[key]) {
      buckets[key] = {
        delivered: 0,
        in_transit: 0,
        picked_up: 0,
        failed: 0,
        pending: 0,
        returned: 0,
      };
    }

    const s = (r.status as string) || "pending";
    const b = buckets[key];
    switch (s) {
      case "delivered":
        b.delivered++;
        break;
      case "in_transit":
      case "out_for_delivery":
        b.in_transit++;
        break;
      case "picked_up":
        b.picked_up++;
        break;
      case "failed":
        b.failed++;
        break;
      case "returned":
        b.returned++;
        break;
      default:
        b.pending++;
        break;
    }
  });

  const sorted = Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12);

  return {
    labels: sorted.map(([k]) => k),
    delivered: sorted.map(([, v]) => v.delivered),
    in_transit: sorted.map(([, v]) => v.in_transit),
    picked_up: sorted.map(([, v]) => v.picked_up),
    failed: sorted.map(([, v]) => v.failed + v.returned),
    pending: sorted.map(([, v]) => v.pending),
  };
}

function buildSpendChart(
  rows: Record<string, unknown>[],
  groupBy: string
): Record<string, unknown> {
  const byAll: Record<string, { amount: number; count: number }> = {};
  const byDest: Record<string, { amount: number; count: number }> = {};
  const byCategory: Record<string, { amount: number; count: number }> = {};

  rows.forEach((r) => {
    const d = new Date(r.created_at as string);
    let key: string;

    if (groupBy === "week") {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d.setDate(diff));
      key = weekStart.toISOString().slice(0, 10);
    } else if (groupBy === "year") {
      key = d.toISOString().slice(0, 4);
    } else {
      key = d.toISOString().slice(0, 7);
    }

    const amt = Number(r.price_paid) || 0;
    const dest = (r.dropoff_country as string) || "Unknown";
    const cat = (r.contents_type as string) || "Other";

    if (!byAll[key]) byAll[key] = { amount: 0, count: 0 };
    byAll[key].amount += amt;
    byAll[key].count += 1;

    if (!byDest[dest]) byDest[dest] = { amount: 0, count: 0 };
    byDest[dest].amount += amt;
    byDest[dest].count += 1;

    if (!byCategory[cat]) byCategory[cat] = { amount: 0, count: 0 };
    byCategory[cat].amount += amt;
    byCategory[cat].count += 1;
  });

  const sortedAll = Object.entries(byAll)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12);

  return {
    all: {
      labels: sortedAll.map(([k]) => k),
      amounts: sortedAll.map(([, v]) => Math.round(v.amount * 100) / 100),
      counts: sortedAll.map(([, v]) => v.count),
    },
    by_destination: Object.entries(byDest)
      .sort(([, a], [, b]) => b.amount - a.amount)
      .slice(0, 10)
      .map(([k, v]) => ({
        destination: k,
        amount: Math.round(v.amount * 100) / 100,
        count: v.count,
      })),
    by_category: Object.entries(byCategory)
      .sort(([, a], [, b]) => b.amount - a.amount)
      .map(([k, v]) => ({
        category: k,
        amount: Math.round(v.amount * 100) / 100,
        count: v.count,
      })),
  };
}

function buildCategoryChart(
  rows: Record<string, unknown>[]
): { name: string; count: number; pct: number }[] {
  const counts: Record<string, number> = {};

  rows.forEach((r) => {
    const cat = (r.contents_type as string) || "Other";
    counts[cat] = (counts[cat] || 0) + 1;
  });

  const total = rows.length || 1;

  const categoryColors: Record<string, string> = {
    Documents: "#3B82F6",
    Electronics: "#FF6B00",
    Fashion: "#0A1628",
    Food: "#10B981",
    Industrial: "#8B5CF6",
  };

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 100),
      color: categoryColors[name] || "#9CA3AF",
    }));
}

function buildAvgCheck(
  rows: Record<string, unknown>[]
): { route: string; avgSpend: number; count: number }[] {
  const routeData: Record<string, { total: number; count: number }> = {};

  rows.forEach((r) => {
    const origin = (r.pickup_city as string) || "Unknown";
    const dest = (r.dropoff_city as string) || "Unknown";
    const route = `${origin} → ${dest}`;
    const amt = Number(r.price_paid) || 0;

    if (!routeData[route]) routeData[route] = { total: 0, count: 0 };
    routeData[route].total += amt;
    routeData[route].count += 1;
  });

  return Object.entries(routeData)
    .map(([route, data]) => ({
      route,
      avgSpend: Math.round((data.total / (data.count || 1)) * 100) / 100,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function buildDeliveryTimeChart(
  rows: Record<string, unknown>[]
): {
  destination: string;
  avgDays: number;
  sla: number;
  rating: string;
}[] {
  const destData: Record<string, { totalDays: number; count: number }> = {};

  rows
    .filter(
      (r) =>
        r.status === "delivered" &&
        r.created_at &&
        r.updated_at
    )
    .forEach((r) => {
      const dest = (r.dropoff_city as string) || (r.dropoff_country as string) || "Unknown";
      const created = new Date(r.created_at as string);
      const updated = new Date(r.updated_at as string);
      const days = (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

      if (days > 0) {
        if (!destData[dest]) destData[dest] = { totalDays: 0, count: 0 };
        destData[dest].totalDays += days;
        destData[dest].count += 1;
      }
    });

  const slaMap: Record<string, number> = {
    NG: 3,
    GB: 7,
    US: 7,
    AE: 5,
    IN: 10,
    AU: 10,
    DE: 7,
    CA: 7,
    GH: 5,
    KE: 7,
    ZA: 7,
    SA: 7,
    BR: 14,
    JP: 10,
    FR: 7,
  };

  return Object.entries(destData)
    .map(([dest, data]) => {
      const avgDays = Math.round((data.totalDays / data.count) * 10) / 10;
      const sla = slaMap[dest] || 5;
      let rating: string;
      if (avgDays <= sla) {
        rating = "Perfectly";
      } else if (avgDays <= sla * 1.3) {
        rating = "Fine";
      } else {
        rating = "Too long";
      }
      return { destination: dest, avgDays, sla, rating };
    })
    .sort((a, b) => a.avgDays - b.avgDays)
    .slice(0, 12);
}

function buildCarrierPerformance(
  rows: Record<string, unknown>[]
): {
  carrier: string;
  shipments: number;
  successRate: number;
  avgCost: number;
  avgDays: number;
  recommendation: string;
}[] {
  const carrierData: Record<
    string,
    {
      total: number;
      delivered: number;
      totalCost: number;
      totalDays: number;
      deliveredCount: number;
    }
  > = {};

  rows.forEach((r) => {
    const carrier = (r.carrier_used as string) || "Unknown";
    if (!carrierData[carrier]) {
      carrierData[carrier] = {
        total: 0,
        delivered: 0,
        totalCost: 0,
        totalDays: 0,
        deliveredCount: 0,
      };
    }

    const c = carrierData[carrier];
    c.total += 1;
    c.totalCost += Number(r.price_paid) || 0;

    if (r.status === "delivered") {
      c.delivered += 1;
      if (r.created_at && r.updated_at) {
        const days =
          (new Date(r.updated_at as string).getTime() -
            new Date(r.created_at as string).getTime()) /
          (1000 * 60 * 60 * 24);
        if (days > 0) {
          c.totalDays += days;
          c.deliveredCount += 1;
        }
      }
    }
  });

  const allCarriers = Object.entries(carrierData).map(([carrier, data]) => ({
    carrier,
    shipments: data.total,
    successRate: Math.round((data.delivered / (data.total || 1)) * 1000) / 10,
    avgCost: Math.round((data.totalCost / (data.total || 1)) * 100) / 100,
    avgDays:
      Math.round((data.totalDays / (data.deliveredCount || 1)) * 10) / 10,
    recommendation: "",
  }));

  allCarriers.sort((a, b) => b.shipments - a.shipments);

  if (allCarriers.length >= 2) {
    const cheapest = allCarriers.reduce((min, c) =>
      c.avgCost < min.avgCost ? c : min
    );
    const mostExpensive = allCarriers.reduce((max, c) =>
      c.avgCost > max.avgCost ? c : max
    );

    if (cheapest.carrier !== mostExpensive.carrier) {
      const savings = Math.round(
        ((mostExpensive.avgCost - cheapest.avgCost) /
          (mostExpensive.avgCost || 1)) *
          100
      );
      cheapest.recommendation = `${cheapest.carrier} is ${savings}% cheaper on average`;
      mostExpensive.recommendation = `Consider switching routes to ${cheapest.carrier} for savings`;
    }
  }

  return allCarriers;
}

function buildCostBreakdown(
  rows: Record<string, unknown>[]
): { label: string; amount: number; pct: number; color: string }[] {
  let totalShipping = 0;
  let totalInsurance = 0;
  let totalPackaging = 0;
  let totalDdp = 0;
  let totalLate = 0;

  rows.forEach((r) => {
    totalShipping += Number(r.price_paid) || 0;
    totalInsurance += Number(r.insurance_premium) || 0;
    totalPackaging += Number(r.packaging_fee) || 0;
    totalDdp += Number(r.ddp_charges) || 0;
    totalLate += Number(r.late_fee) || 0;
  });

  const grandTotal =
    totalShipping + totalInsurance + totalPackaging + totalDdp + totalLate || 1;

  return [
    {
      label: "Base Shipping",
      amount: Math.round(totalShipping * 100) / 100,
      pct: Math.round((totalShipping / grandTotal) * 100),
      color: "#FF6B00",
    },
    {
      label: "Packaging Fees",
      amount: Math.round(totalPackaging * 100) / 100,
      pct: Math.round((totalPackaging / grandTotal) * 100),
      color: "#10B981",
    },
    {
      label: "Insurance Premiums",
      amount: Math.round(totalInsurance * 100) / 100,
      pct: Math.round((totalInsurance / grandTotal) * 100),
      color: "#3B82F6",
    },
    {
      label: "DDP Charges",
      amount: Math.round(totalDdp * 100) / 100,
      pct: Math.round((totalDdp / grandTotal) * 100),
      color: "#8B5CF6",
    },
    {
      label: "Late Fees",
      amount: Math.round(totalLate * 100) / 100,
      pct: Math.round((totalLate / grandTotal) * 100),
      color: "#EF4444",
    },
  ];
}

function buildCarbonData(
  rows: Record<string, unknown>[]
): {
  co2ThisMonth: number;
  treesEquivalent: number;
  routeEfficiency: number;
  byRoute: { route: string; co2: number }[];
  suggestions: string[];
} {
  const routeData: Record<string, number> = {};
  let totalCo2 = 0;

  rows.forEach((r) => {
    const origin = (r.pickup_country as string) || "NG";
    const dest = (r.dropoff_country as string) || "NG";
    const route = `${origin} → ${dest}`;
    const weight = Number(r.weight_kg) || 1;
    const isInternational = origin !== dest;
    const co2PerKg = isInternational ? 0.8 : 0.15;
    const co2 = weight * co2PerKg;

    routeData[route] = (routeData[route] || 0) + co2;
    totalCo2 += co2;
  });

  const treesEquiv = Math.round(totalCo2 / 21.77);
  const efficiency = rows.length > 0
    ? Math.round(
        (rows.filter((r) => r.status === "delivered").length /
          (rows.length || 1)) *
          100
      )
    : 0;

  const byRoute = Object.entries(routeData)
    .map(([route, co2]) => ({
      route,
      co2: Math.round(co2 * 100) / 100,
    }))
    .sort((a, b) => b.co2 - a.co2)
    .slice(0, 10);

  const suggestions = [
    "Consolidate shipments to reduce per-unit emissions",
    "Use ground transport for domestic routes when possible",
    "Choose eco-friendly packaging materials",
    "Optimize pickup routes to minimize empty miles",
    "Consider carbon offset programs for international shipments",
  ];

  return {
    co2ThisMonth: Math.round(totalCo2 * 100) / 100,
    treesEquivalent: treesEquiv,
    routeEfficiency: efficiency,
    byRoute,
    suggestions,
  };
}

function buildMapData(
  rows: Record<string, unknown>[]
): {
  countries: { country: string; count: number; pct: number; avgCost: number; avgDays: number }[];
  searchIndex: string[];
} {
  const countryData: Record<
    string,
    { count: number; totalCost: number; totalDays: number; deliveredCount: number }
  > = {};

  rows.forEach((r) => {
    const country = (r.dropoff_country as string) || "Unknown";
    if (!countryData[country]) {
      countryData[country] = {
        count: 0,
        totalCost: 0,
        totalDays: 0,
        deliveredCount: 0,
      };
    }

    const c = countryData[country];
    c.count += 1;
    c.totalCost += Number(r.price_paid) || 0;

    if (r.status === "delivered" && r.created_at && r.updated_at) {
      const days =
        (new Date(r.updated_at as string).getTime() -
          new Date(r.created_at as string).getTime()) /
        (1000 * 60 * 60 * 24);
      if (days > 0) {
        c.totalDays += days;
        c.deliveredCount += 1;
      }
    }
  });

  const total = rows.length || 1;

  const countries = Object.entries(countryData)
    .map(([country, data]) => ({
      country,
      count: data.count,
      pct: Math.round((data.count / total) * 100),
      avgCost:
        Math.round((data.totalCost / (data.count || 1)) * 100) / 100,
      avgDays:
        Math.round((data.totalDays / (data.deliveredCount || 1)) * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count);

  const searchIndex = countries.map(
    (c) => `${c.country}`.toLowerCase()
  );

  return { countries, searchIndex };
}
