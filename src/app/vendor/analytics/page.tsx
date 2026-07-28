"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  DollarSign, ShoppingCart, TrendingUp, Eye, Package,
  ArrowRight, Loader2,
} from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";
import { MetricCard, SimpleLineChart, SimpleBarChart, PeriodSelector } from "@/components/vendor/analytics";

const PERIODS = ["7d", "30d", "90d", "1y"];

const mockData: Record<string, {
  revenue: number; orders: number; avgOrderValue: number; conversionRate: number;
  chartData: { label: string; value: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
  trafficSources: { label: string; value: number; color: string }[];
}> = {
  "7d": {
    revenue: 584000, orders: 142, avgOrderValue: 4113, conversionRate: 3.8,
    chartData: [
      { label: "Mon", value: 72000 }, { label: "Tue", value: 84000 },
      { label: "Wed", value: 78000 }, { label: "Thu", value: 91000 },
      { label: "Fri", value: 105000 }, { label: "Sat", value: 88000 },
      { label: "Sun", value: 66000 },
    ],
    topProducts: [
      { name: "Wireless Bluetooth Earbuds Pro", sales: 47, revenue: 2350000 },
      { name: "Smart Home Security Camera", sales: 38, revenue: 1520000 },
      { name: "Ergonomic Office Chair", sales: 29, revenue: 1740000 },
      { name: "Portable Power Bank 20000mAh", sales: 24, revenue: 720000 },
      { name: "Noise Cancelling Headphones", sales: 21, revenue: 1050000 },
    ],
    trafficSources: [
      { label: "Direct", value: 2450, color: "#0A1628" },
      { label: "Search", value: 3800, color: "#FF6B00" },
      { label: "Social", value: 2100, color: "#7C3AED" },
      { label: "Email", value: 980, color: "#059669" },
      { label: "Referral", value: 650, color: "#D97706" },
    ],
  },
  "30d": {
    revenue: 2450000, orders: 587, avgOrderValue: 4174, conversionRate: 3.5,
    chartData: Array.from({ length: 30 }, (_, i) => ({
      label: `D${i + 1}`,
      value: Math.floor(Math.random() * 60000) + 40000,
    })),
    topProducts: [
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
  },
  "90d": {
    revenue: 7200000, orders: 1680, avgOrderValue: 4286, conversionRate: 3.3,
    chartData: Array.from({ length: 13 }, (_, i) => ({
      label: `W${i + 1}`,
      value: Math.floor(Math.random() * 250000) + 350000,
    })),
    topProducts: [
      { name: "Wireless Bluetooth Earbuds Pro", sales: 520, revenue: 26000000 },
      { name: "Smart Home Security Camera", sales: 410, revenue: 16400000 },
      { name: "Ergonomic Office Chair", sales: 265, revenue: 15900000 },
      { name: "Noise Cancelling Headphones", sales: 230, revenue: 11500000 },
      { name: "Portable Power Bank 20000mAh", sales: 195, revenue: 5850000 },
    ],
    trafficSources: [
      { label: "Direct", value: 31000, color: "#0A1628" },
      { label: "Search", value: 56000, color: "#FF6B00" },
      { label: "Social", value: 24000, color: "#7C3AED" },
      { label: "Email", value: 11500, color: "#059669" },
      { label: "Referral", value: 7200, color: "#D97706" },
    ],
  },
  "1y": {
    revenue: 28500000, orders: 6800, avgOrderValue: 4191, conversionRate: 3.1,
    chartData: [
      { label: "Jan", value: 2100000 }, { label: "Feb", value: 1950000 },
      { label: "Mar", value: 2300000 }, { label: "Apr", value: 2150000 },
      { label: "May", value: 2480000 }, { label: "Jun", value: 2620000 },
      { label: "Jul", value: 2750000 }, { label: "Aug", value: 2580000 },
      { label: "Sep", value: 2410000 }, { label: "Oct", value: 2680000 },
      { label: "Nov", value: 2900000 }, { label: "Dec", value: 3100000 },
    ],
    topProducts: [
      { name: "Wireless Bluetooth Earbuds Pro", sales: 2100, revenue: 105000000 },
      { name: "Smart Home Security Camera", sales: 1680, revenue: 67200000 },
      { name: "Ergonomic Office Chair", sales: 1050, revenue: 63000000 },
      { name: "Noise Cancelling Headphones", sales: 920, revenue: 46000000 },
      { name: "Portable Power Bank 20000mAh", sales: 780, revenue: 23400000 },
    ],
    trafficSources: [
      { label: "Direct", value: 124000, color: "#0A1628" },
      { label: "Search", value: 228000, color: "#FF6B00" },
      { label: "Social", value: 96000, color: "#7C3AED" },
      { label: "Email", value: 48000, color: "#059669" },
      { label: "Referral", value: 29000, color: "#D97706" },
    ],
  },
};

export default function AnalyticsOverview() {
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState(mockData["30d"]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/vendor/analytics/overview?period=${period}`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      } else {
        setData(mockData[period as keyof typeof mockData] || mockData["30d"]);
      }
    } catch {
      setData(mockData[period as keyof typeof mockData] || mockData["30d"]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatNgn = (v: number) => {
    if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `₦${(v / 1_000).toFixed(1)}K`;
    return `₦${v}`;
  };

  const totalTraffic = data.trafficSources.reduce((s, t) => s + t.value, 0);

  return (
    <VendorShell title="Analytics" subtitle="Deep dive into your performance">
      <div className="space-y-6">
        {/* Period selector */}
        <div className="flex items-center justify-between">
          <div />
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-text-4" />
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                value={formatNgn(data.revenue)}
                label="Total Revenue"
                change="+15.3%"
                up
                icon={DollarSign}
                color="bg-emerald-100 text-emerald-700"
              />
              <MetricCard
                value={data.orders.toLocaleString()}
                label="Total Orders"
                change="+8.7%"
                up
                icon={ShoppingCart}
                color="bg-blue-100 text-blue"
              />
              <MetricCard
                value={formatNgn(data.avgOrderValue)}
                label="Avg Order Value"
                change="+3.2%"
                up
                icon={TrendingUp}
                color="bg-purple-100 text-purple-700"
              />
              <MetricCard
                value={`${data.conversionRate}%`}
                label="Conversion Rate"
                change="-0.2%"
                up={false}
                icon={Eye}
                color="bg-amber-100 text-amber-700"
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-text-1">Revenue Trend</h3>
                  <Link href="/vendor/analytics/financial" className="text-[10px] text-orange font-semibold hover:underline flex items-center gap-1">
                    Financial Details <ArrowRight size={10} />
                  </Link>
                </div>
                <SimpleLineChart
                  data={data.chartData}
                  height={200}
                  color="#FF6B00"
                  formatValue={formatNgn}
                />
              </div>

              {/* Traffic Sources */}
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-bold text-sm text-text-1 mb-4">Traffic Sources</h3>
                <SimpleBarChart
                  data={data.trafficSources}
                  height={220}
                  horizontal
                  formatValue={(v) => `${((v / totalTraffic) * 100).toFixed(1)}%`}
                />
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-text-1 flex items-center gap-2">
                  <Package size={15} className="text-orange" /> Top Selling Products
                </h3>
                <Link href="/vendor/analytics/products" className="text-[10px] text-orange font-semibold hover:underline flex items-center gap-1">
                  View All <ArrowRight size={10} />
                </Link>
              </div>
              <div className="space-y-3">
                {data.topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-text-4 shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-1 truncate">{p.name}</p>
                      <p className="text-[10px] text-text-4">{p.sales} sold</p>
                    </div>
                    <span className="text-xs font-bold text-green-700">{formatNgn(p.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </VendorShell>
  );
}
