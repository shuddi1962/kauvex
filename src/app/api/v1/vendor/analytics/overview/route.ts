import { NextRequest, NextResponse } from "next/server";

function generateChartData(days: number) {
  return Array.from({ length: days }, (_, i) => ({
    label: days > 30 ? `W${Math.floor(i / 7) + 1}` : `D${i + 1}`,
    value: Math.floor(Math.random() * 60000) + 40000,
  }));
}

const periodConfig: Record<string, { days: number; multiplier: number }> = {
  "7d": { days: 7, multiplier: 1 },
  "30d": { days: 30, multiplier: 4.2 },
  "90d": { days: 13, multiplier: 12.3 },
  "1y": { days: 12, multiplier: 48.8 },
};

const baseData = {
  dailyRevenue: 81667,
  dailyOrders: 19.6,
  avgOrderValue: 4174,
  conversionRate: 3.5,
  topProductList: [
    { name: "Wireless Bluetooth Earbuds Pro", sales: 189, revenue: 9450000 },
    { name: "Smart Home Security Camera", sales: 152, revenue: 6080000 },
    { name: "Ergonomic Office Chair", sales: 98, revenue: 5880000 },
    { name: "Noise Cancelling Headphones", sales: 87, revenue: 4350000 },
    { name: "Portable Power Bank 20000mAh", sales: 76, revenue: 2280000 },
  ],
  trafficSources: [
    { label: "Direct", value: 10200, color: "#0A1628" },
    { label: "Search", value: 18400, color: "#FF6B00" },
    { label: "Social", value: 8900, color: "#7C3AED" },
    { label: "Email", value: 4200, color: "#059669" },
    { label: "Referral", value: 2800, color: "#D97706" },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const config = periodConfig[period];
    if (!config) {
      return NextResponse.json({ error: "Invalid period. Use 7d, 30d, 90d, or 1y." }, { status: 400 });
    }

    const multiplier = config.multiplier;

    const data = {
      period,
      revenue: Math.round(baseData.dailyRevenue * multiplier * 30),
      orders: Math.round(baseData.dailyOrders * multiplier * 30),
      avgOrderValue: baseData.avgOrderValue,
      conversionRate: baseData.conversionRate + (period === "7d" ? 0.3 : period === "30d" ? 0 : period === "90d" ? -0.2 : -0.4),
      chartData: generateChartData(config.days),
      topProducts: baseData.topProductList.map((p) => ({
        ...p,
        sales: Math.round(p.sales * multiplier),
        revenue: Math.round(p.revenue * multiplier),
      })),
      trafficSources: baseData.trafficSources.map((t) => ({
        ...t,
        value: Math.round(t.value * multiplier),
      })),
    };

    return NextResponse.json({ data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
