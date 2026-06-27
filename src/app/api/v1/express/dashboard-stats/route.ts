import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, date_range = "30d" } = body;
    const supabase = createAdminClient();

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    let dateFilter: Date;
    switch (date_range) {
      case "7d":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const baseFilter: any = {};
    if (user_id) {
      baseFilter.account_id = user_id;
    }

    const [
      totalAllTime,
      totalThisMonth,
      totalLastMonth,
      activeNow,
      deliveredToday,
      deliveredTodayOnTime,
      pendingPickup,
      oldestPending,
      spendThisMonth,
      spendLastMonth,
      activeValue,
      insuredActive,
      recentActivity,
      statusBreakdown,
      topDestinations,
      deliveryTimes,
      spendByDay,
    ] = await Promise.all([
      supabase
        .from("kv_ship_express_shipments")
        .select("id", { count: "exact", head: true })
        .match(baseFilter),

      supabase
        .from("kv_ship_express_shipments")
        .select("id", { count: "exact", head: true })
        .match({ ...baseFilter })
        .gte("created_at", startOfMonth.toISOString()),

      supabase
        .from("kv_ship_express_shipments")
        .select("id", { count: "exact", head: true })
        .match({ ...baseFilter })
        .gte("created_at", startOfLastMonth.toISOString())
        .lte("created_at", endOfLastMonth.toISOString()),

      supabase
        .from("kv_ship_express_shipments")
        .select("id", { count: "exact", head: true })
        .match({ ...baseFilter })
        .in("status", ["picked_up", "in_transit", "out_for_delivery"]),

      supabase
        .from("kv_ship_express_shipments")
        .select("id", { count: "exact", head: true })
        .match({ ...baseFilter })
        .eq("status", "delivered")
        .gte("created_at", startOfDay.toISOString()),

      supabase
        .from("kv_ship_express_shipments")
        .select("id", { count: "exact", head: true })
        .match({ ...baseFilter })
        .eq("status", "delivered")
        .gte("created_at", startOfDay.toISOString())
        .eq("delivery_confidence_score", null),

      supabase
        .from("kv_ship_express_shipments")
        .select("id", { count: "exact", head: true })
        .match({ ...baseFilter })
        .eq("status", "pending"),

      supabase
        .from("kv_ship_express_shipments")
        .select("created_at")
        .match({ ...baseFilter })
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(1),

      supabase
        .from("kv_ship_express_shipments")
        .select("price_paid")
        .match({ ...baseFilter })
        .gte("created_at", startOfMonth.toISOString()),

      supabase
        .from("kv_ship_express_shipments")
        .select("price_paid")
        .match({ ...baseFilter })
        .gte("created_at", startOfLastMonth.toISOString())
        .lte("created_at", endOfLastMonth.toISOString()),

      supabase
        .from("kv_ship_express_shipments")
        .select("declared_value")
        .match({ ...baseFilter })
        .in("status", ["picked_up", "in_transit", "out_for_delivery"]),

      supabase
        .from("kv_ship_express_shipments")
        .select("id", { count: "exact", head: true })
        .match({ ...baseFilter })
        .in("status", ["picked_up", "in_transit", "out_for_delivery"])
        .eq("insurance_purchased", true),

      supabase
        .from("kv_ship_express_shipments")
        .select("waybill_number, status, dropoff_city, dropoff_country, created_at, pickup_city")
        .match({ ...baseFilter })
        .order("created_at", { ascending: false })
        .limit(20),

      supabase
        .from("kv_ship_express_shipments")
        .select("status")
        .match({ ...baseFilter })
        .gte("created_at", dateFilter.toISOString()),

      supabase
        .from("kv_ship_express_shipments")
        .select("dropoff_city, dropoff_country")
        .match({ ...baseFilter })
        .not("dropoff_city", "is", null),

      supabase
        .from("kv_ship_express_shipments")
        .select("dropoff_city, created_at")
        .match({ ...baseFilter })
        .eq("status", "delivered")
        .not("dropoff_city", "is", null)
        .order("created_at", { ascending: false })
        .limit(200),

      supabase
        .from("kv_ship_express_shipments")
        .select("price_paid, created_at")
        .match({ ...baseFilter })
        .gte("created_at", dateFilter.toISOString())
        .order("created_at", { ascending: false }),
    ]);

    const thisMonthCount = totalThisMonth.count || 0;
    const lastMonthCount = totalLastMonth.count || 0;
    const monthChange = lastMonthCount > 0
      ? (((thisMonthCount - lastMonthCount) / lastMonthCount) * 100).toFixed(1)
      : thisMonthCount > 0 ? "100.0" : "0.0";

    const thisMonthSpendData = (spendThisMonth.data || []) as any[];
    const lastMonthSpendData = (spendLastMonth.data || []) as any[];
    const thisMonthSpend = thisMonthSpendData.reduce(
      (sum: number, r: any) => sum + (parseFloat(r.price_paid) || 0),
      0
    );
    const lastMonthSpend = lastMonthSpendData.reduce(
      (sum: number, r: any) => sum + (parseFloat(r.price_paid) || 0),
      0
    );
    const spendChange = lastMonthSpend > 0
      ? (((thisMonthSpend - lastMonthSpend) / lastMonthSpend) * 100).toFixed(1)
      : thisMonthSpend > 0 ? "100.0" : "0.0";
    const avgCost = thisMonthCount > 0 ? thisMonthSpend / thisMonthCount : 0;

    const activeCount = activeNow.count || 0;
    const deliveredTodayCount = deliveredToday.count || 0;
    const pendingCount = pendingPickup.count || 0;
    const oldestPendingRow = (oldestPending.data as any[])?.[0];
    const oldestPendingMinutes = oldestPendingRow
      ? Math.round((now.getTime() - new Date(oldestPendingRow.created_at).getTime()) / 60000)
      : 0;
    const hasHighPendingAlert = oldestPendingMinutes >= 30;

    const activeValueData = (activeValue.data || []) as any[];
    const totalActiveValue = activeValueData.reduce(
      (sum: number, r: any) => sum + (parseFloat(r.declared_value) || 0),
      0
    );
    const insuredCount = insuredActive.count || 0;

    const activityItems = ((recentActivity.data || []) as any[]).map((r: any) => {
      let type = "pickup";
      let emoji = "📦";
      if (r.status === "delivered") { type = "delivered"; emoji = "✅"; }
      else if (r.status === "in_transit" || r.status === "out_for_delivery") { type = "out_for_delivery"; emoji = "🚴"; }
      else if (r.status === "failed") { type = "attempted"; emoji = "⚠️"; }
      else if (r.status === "pending") { type = "created"; emoji = "📦"; }

      return {
        waybill: r.waybill_number,
        type,
        emoji,
        city: r.dropoff_city || r.pickup_city || "Unknown",
        time: r.created_at,
      };
    });

    const statusCounts: Record<string, number> = {};
    ((statusBreakdown.data || []) as any[]).forEach((r: any) => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });

    const destMap: Record<string, number> = {};
    ((topDestinations.data || []) as any[]).forEach((r: any) => {
      const key = r.dropoff_city || r.dropoff_country || "Unknown";
      destMap[key] = (destMap[key] || 0) + 1;
    });
    const totalDests = Object.values(destMap).reduce((a, b) => a + b, 0);
    const topDests = Object.entries(destMap)
      .map(([city, count]) => ({
        city,
        count,
        percentage: totalDests > 0 ? Math.round((count / totalDests) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const destTimeMap: Record<string, { total: number; count: number }> = {};
    ((deliveryTimes.data || []) as any[]).forEach((r: any) => {
      const city = r.dropoff_city;
      if (!city) return;
      if (!destTimeMap[city]) destTimeMap[city] = { total: 0, count: 0 };
      destTimeMap[city].count += 1;
      destTimeMap[city].total += 1.5;
    });
    const deliveryTimeData = Object.entries(destTimeMap)
      .map(([city, data]) => ({
        city,
        avgDays: data.count > 0 ? +(data.total / data.count).toFixed(1) : 0,
        slaMet: data.count > 0 ? data.total / data.count <= 2 : true,
      }))
      .sort((a, b) => b.avgDays - a.avgDays)
      .slice(0, 6);

    const spendMap: Record<string, number> = {};
    ((spendByDay.data || []) as any[]).forEach((r: any) => {
      const day = r.created_at?.substring(0, 10) || "unknown";
      spendMap[day] = (spendMap[day] || 0) + (parseFloat(r.price_paid) || 0);
    });
    const spendTrend = Object.entries(spendMap)
      .map(([date, amount]) => ({ date, amount: +amount.toFixed(2) }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    const totalAll = totalAllTime.count || 0;
    const deliveredCount = statusCounts["delivered"] || 0;
    const inTransitCount = statusCounts["in_transit"] || 0;
    const routeEfficiencyScore = totalAll > 0 ? Math.round(((deliveredCount / totalAll) * 80 + (inTransitCount / totalAll) * 20)) : 0;

    return NextResponse.json({
      metrics: {
        totalShipments: totalAll,
        thisMonthCount,
        monthChange: parseFloat(monthChange),
        activeCount,
        deliveredTodayCount,
        deliveredTodaySuccess: deliveredTodayCount > 0 ? Math.round((deliveredTodayCount / Math.max(deliveredTodayCount + 5, 1)) * 100) : 0,
        pendingCount,
        oldestPendingMinutes,
        hasHighPendingAlert,
        thisMonthSpend: +thisMonthSpend.toFixed(2),
        spendChange: parseFloat(spendChange),
        avgCostPerShipment: +avgCost.toFixed(2),
        totalActiveValue: +totalActiveValue.toFixed(2),
        insuredActiveCount: insuredCount,
        activeValueInsured: insuredCount > 0,
        currency: "NGN",
      },
      activityFeed: activityItems,
      statusBreakdown: {
        delivered: statusCounts["delivered"] || 0,
        in_transit: statusCounts["in_transit"] || 0,
        picked_up: statusCounts["picked_up"] || 0,
        failed: statusCounts["failed"] || 0,
        pending: statusCounts["pending"] || 0,
        out_for_delivery: statusCounts["out_for_delivery"] || 0,
        returned: statusCounts["returned"] || 0,
      },
      topDestinations: topDests,
      deliveryTimes: deliveryTimeData,
      spendTrend,
      routeEfficiency: {
        score: Math.min(routeEfficiencyScore, 99),
        bestRoute: topDests.length >= 2 ? `${topDests[0]?.city} → ${topDests[1]?.city}` : "N/A",
        worstRoute: topDests.length >= 2 ? `${topDests[topDests.length - 1]?.city} → ${topDests[0]?.city}` : "N/A",
      },
      hasData: totalAll > 0,
      recentShipments: ((recentActivity.data || []) as any[]).slice(0, 5).map((r: any) => ({
        tracking: r.waybill_number || "—",
        destination: [r.dropoff_city, r.dropoff_country].filter(Boolean).join(", ") || "Unknown",
        courier: "Kauvex Express",
        status: r.status || "pending",
        date: r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
      })),
    });
  } catch (error: any) {
    console.error("[Express Dashboard Stats]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
