"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MapPin,
  ArrowRight,
  Zap,
  AlertCircle,
  RefreshCw,
  Eye,
  Activity,
  Pause,
  Play,
  ShieldCheck,
  BarChart3,
  Navigation,
  Globe,
  Send,
  Route,
} from "lucide-react";

interface DashboardData {
  metrics: {
    totalShipments: number;
    thisMonthCount: number;
    monthChange: number;
    activeCount: number;
    deliveredTodayCount: number;
    deliveredTodaySuccess: number;
    pendingCount: number;
    oldestPendingMinutes: number;
    hasHighPendingAlert: boolean;
    thisMonthSpend: number;
    spendChange: number;
    avgCostPerShipment: number;
    totalActiveValue: number;
    insuredActiveCount: number;
    activeValueInsured: boolean;
    currency: string;
  };
  activityFeed: Array<{
    waybill: string;
    type: string;
    emoji: string;
    city: string;
    time: string;
  }>;
  statusBreakdown: {
    delivered: number;
    in_transit: number;
    picked_up: number;
    failed: number;
    pending: number;
    out_for_delivery: number;
    returned: number;
  };
  topDestinations: Array<{
    city: string;
    count: number;
    percentage: number;
  }>;
  deliveryTimes: Array<{
    city: string;
    avgDays: number;
    slaMet: boolean;
  }>;
  spendTrend: Array<{
    date: string;
    amount: number;
  }>;
  routeEfficiency: {
    score: number;
    bestRoute: string;
    worstRoute: string;
  };
  recentShipments: Array<{
    tracking: string;
    destination: string;
    courier: string;
    status: string;
    date: string;
  }>;
  hasData: boolean;
}

const DEMO_DATA: DashboardData = {
  metrics: {
    totalShipments: 4821,
    thisMonthCount: 1423,
    monthChange: 18.0,
    activeCount: 312,
    deliveredTodayCount: 89,
    deliveredTodaySuccess: 91,
    pendingCount: 23,
    oldestPendingMinutes: 45,
    hasHighPendingAlert: true,
    thisMonthSpend: 12400000,
    spendChange: 22.0,
    avgCostPerShipment: 3394,
    totalActiveValue: 1200000,
    insuredActiveCount: 218,
    activeValueInsured: true,
    currency: "NGN",
  },
  activityFeed: [
    { waybill: "KVX-20481", type: "in_transit", emoji: "✈️", city: "London", time: "2026-06-27T10:00:00.000Z" },
    { waybill: "KVX-20480", type: "delivered", emoji: "✅", city: "Abuja", time: "2026-06-27T09:52:00.000Z" },
    { waybill: "KVX-20479", type: "customs", emoji: "⚠️", city: "Houston", time: "2026-06-27T09:45:00.000Z" },
    { waybill: "KVX-20477", type: "delivered", emoji: "✅", city: "Kano", time: "2026-06-27T09:38:00.000Z" },
    { waybill: "KVX-20476", type: "in_transit", emoji: "✈️", city: "Dubai", time: "2026-06-27T09:29:00.000Z" },
    { waybill: "KVX-20475", type: "delivered", emoji: "✅", city: "Accra", time: "2026-06-27T09:15:00.000Z" },
    { waybill: "KVX-20474", type: "out_for_delivery", emoji: "🚴", city: "Port Harcourt", time: "2026-06-27T09:00:00.000Z" },
    { waybill: "KVX-20473", type: "delivered", emoji: "✅", city: "Lagos", time: "2026-06-27T08:45:00.000Z" },
  ],
  statusBreakdown: {
    delivered: 4390,
    in_transit: 312,
    picked_up: 67,
    failed: 12,
    pending: 23,
    out_for_delivery: 77,
    returned: 5,
  },
  topDestinations: [
    { city: "Lagos", count: 1688, percentage: 35 },
    { city: "Abuja", count: 1061, percentage: 22 },
    { city: "Port Harcourt", count: 723, percentage: 15 },
    { city: "Accra", count: 482, percentage: 10 },
    { city: "Nairobi", count: 386, percentage: 8 },
  ],
  deliveryTimes: [
    { city: "Lagos", avgDays: 0.8, slaMet: true },
    { city: "Abuja", avgDays: 1.2, slaMet: true },
    { city: "Port Harcourt", avgDays: 1.5, slaMet: true },
    { city: "Accra", avgDays: 2.1, slaMet: false },
    { city: "Nairobi", avgDays: 3.2, slaMet: false },
    { city: "Johannesburg", avgDays: 4.5, slaMet: false },
  ],
  spendTrend: [
    { date: "2026-05-28", amount: 820 }, { date: "2026-05-29", amount: 860 },
    { date: "2026-05-30", amount: 910 }, { date: "2026-05-31", amount: 880 },
    { date: "2026-06-01", amount: 950 }, { date: "2026-06-02", amount: 920 },
    { date: "2026-06-03", amount: 990 }, { date: "2026-06-04", amount: 1020 },
    { date: "2026-06-05", amount: 980 }, { date: "2026-06-06", amount: 1050 },
    { date: "2026-06-07", amount: 1080 }, { date: "2026-06-08", amount: 1040 },
    { date: "2026-06-09", amount: 1100 }, { date: "2026-06-10", amount: 1130 },
    { date: "2026-06-11", amount: 1090 }, { date: "2026-06-12", amount: 1160 },
    { date: "2026-06-13", amount: 1190 }, { date: "2026-06-14", amount: 1150 },
    { date: "2026-06-15", amount: 1210 }, { date: "2026-06-16", amount: 1240 },
    { date: "2026-06-17", amount: 1200 }, { date: "2026-06-18", amount: 1270 },
    { date: "2026-06-19", amount: 1300 }, { date: "2026-06-20", amount: 1260 },
    { date: "2026-06-21", amount: 1330 }, { date: "2026-06-22", amount: 1360 },
    { date: "2026-06-23", amount: 1320 }, { date: "2026-06-24", amount: 1390 },
    { date: "2026-06-25", amount: 1420 }, { date: "2026-06-26", amount: 1380 },
  ],
  routeEfficiency: {
    score: 91,
    bestRoute: "Lagos → Abuja",
    worstRoute: "Lagos → Johannesburg",
  },
  recentShipments: [
    { tracking: "KVX-20481", destination: "London, UK", courier: "DHL Express", status: "in_transit", date: "Dec 18" },
    { tracking: "KVX-20480", destination: "Abuja, NG", courier: "Kauvex Express", status: "delivered", date: "Dec 17" },
    { tracking: "KVX-20479", destination: "Houston, USA", courier: "FedEx Intl", status: "customs", date: "Dec 16" },
    { tracking: "KVX-20477", destination: "Kano, NG", courier: "Kauvex Express", status: "delivered", date: "Dec 15" },
    { tracking: "KVX-20476", destination: "Dubai, UAE", courier: "Aramex", status: "in_transit", date: "Dec 14" },
  ],
  hasData: false,
};

const ROUTE_PERFORMANCE = [
  { route: "Lagos → Abuja", percentage: 87, color: "#FF6B00" },
  { route: "PHC → Lagos", percentage: 74, color: "#0A1628" },
  { route: "Nigeria → UK", percentage: 65, color: "#FF6B00" },
  { route: "Nigeria → USA", percentage: 52, color: "#FF6B00" },
  { route: "China → NG", percentage: 48, color: "#10B981" },
  { route: "NG → UAE", percentage: 38, color: "#10B981" },
];

const MONTHLY_VOLUME = [
  { month: "Jan", value: 60 },
  { month: "Feb", value: 80 },
  { month: "Mar", value: 55 },
  { month: "Apr", value: 90 },
  { month: "May", value: 70 },
  { month: "Jun", value: 95 },
  { month: "Jul", value: 75 },
  { month: "Aug", value: 85 },
  { month: "Sep", value: 65, accent: true },
  { month: "Oct", value: 100, accent: true },
  { month: "Nov", value: 88, accent: true },
  { month: "Dec", value: 92, accent: true },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  in_transit: { label: "In Transit", color: "bg-blue-50 text-blue-700" },
  delivered: { label: "Delivered", color: "bg-green-50 text-green-700" },
  customs: { label: "Customs Hold", color: "bg-amber-50 text-amber-700" },
  exception: { label: "Exception", color: "bg-red-50 text-red-700" },
  pending: { label: "Pending", color: "bg-gray-100 text-gray-600" },
  out_for_delivery: { label: "Out for Delivery", color: "bg-cyan-50 text-cyan-700" },
};

function formatTimeAgo(isoString: string, now: number): string {
  const diff = now - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatCurrency(amount: number, currency = "NGN"): string {
  if (currency === "NGN") {
    if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
    return `₦${amount.toLocaleString()}`;
  }
  if (currency === "USD") return `$${amount.toLocaleString()}`;
  return `${currency} ${amount.toLocaleString()}`;
}

export default function ExpressDashboardOverview() {
  const [data, setData] = useState<DashboardData>(DEMO_DATA);
  const [loading, setLoading] = useState(true);
  const [feedPaused, setFeedPaused] = useState(false);
  const [now, setNow] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/express/dashboard-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date_range: "30d" }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.hasData) {
          setData(json);
        } else {
          setData({ ...DEMO_DATA, hasData: false });
        }
      }
    } catch {
      // keep demo data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const m = data.metrics;
  const currency = m.currency;

  const statCards = [
    {
      label: "Total Shipments",
      value: m.totalShipments.toLocaleString(),
      sub: `↑ 18% vs last month`,
      icon: Package,
      iconBg: "bg-[#EEF2FF]",
      iconColor: "text-[#0A1628]",
    },
    {
      label: "Delivered",
      value: m.deliveredTodayCount.toLocaleString(),
      sub: `↑ ${m.deliveredTodaySuccess}% success rate`,
      icon: CheckCircle2,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "In Transit",
      value: m.activeCount.toLocaleString(),
      sub: "Avg 2.4 days",
      icon: Truck,
      iconBg: "bg-orange-50",
      iconColor: "text-[#FF6B00]",
    },
    {
      label: "Express Orders",
      value: "189",
      sub: "↑ 34% this week",
      icon: Zap,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      label: "Revenue",
      value: formatCurrency(m.thisMonthSpend, currency),
      sub: `↑ ${m.spendChange}% vs last month`,
      icon: DollarSign,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Intl Shipments",
      value: "638",
      sub: "↑ 41% to 87 countries",
      icon: Globe,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  ];

  const totalForStatusBars = Math.max(
    data.statusBreakdown.delivered,
    data.statusBreakdown.in_transit,
    data.statusBreakdown.picked_up,
    data.statusBreakdown.failed,
    data.statusBreakdown.pending,
    1
  );

  const statusBars = [
    { label: "Delivered", count: data.statusBreakdown.delivered, color: "#10B981" },
    { label: "In Transit", count: data.statusBreakdown.in_transit, color: "#FF6B00" },
    { label: "Picked Up", count: data.statusBreakdown.picked_up, color: "#3B82F6" },
    { label: "Failed", count: data.statusBreakdown.failed, color: "#EF4444" },
    { label: "Pending", count: data.statusBreakdown.pending, color: "#9CA3AF" },
  ];

  const maxSpend = Math.max(...data.spendTrend.map((d) => d.amount), 1);
  const spendPoints = data.spendTrend.map((d, i) => ({
    x: (i / (data.spendTrend.length - 1)) * 100,
    y: 100 - (d.amount / maxSpend) * 80,
    ...d,
  }));
  const spendPath = spendPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const maxDeliveryDays = Math.max(...data.deliveryTimes.map((d) => d.avgDays), 1);

  return (
    <div className="space-y-6">
      {!data.hasData && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800">
            Connect your Express account to see real data. Showing demo data for now.
          </p>
          <button
            onClick={fetchData}
            className="ml-auto text-xs font-medium text-amber-700 hover:text-amber-900 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">/ Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/express/book"
            className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#e55f00] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            <Send className="w-4 h-4" />
            New Shipment
          </Link>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stat Cards - Roshana Style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-[#0A1628]">{card.value}</p>
            <p className="text-[11px] text-gray-500 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Shipment Volume Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-[#0A1628]">Shipment Volume</h3>
              <p className="text-xs text-gray-500 mt-0.5">Daily volume over last 30 days</p>
            </div>
            <button className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
              Export ↗
            </button>
          </div>
          <div className="flex items-end gap-2 h-44 px-2">
            {MONTHLY_VOLUME.map((bar) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md transition-all duration-300"
                  style={{
                    height: `${bar.value}%`,
                    backgroundColor: bar.accent ? "#FF6B00" : "#0A1628",
                    opacity: bar.accent ? 1 : 0.85,
                  }}
                />
                <span className="text-[10px] text-gray-400">{bar.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Route Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-[#0A1628]">Route Performance</h3>
              <p className="text-xs text-gray-500 mt-0.5">Top shipping routes</p>
            </div>
          </div>
          <div className="space-y-4">
            {ROUTE_PERFORMANCE.map((route) => (
              <div key={route.route} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-28 shrink-0">{route.route}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${route.percentage}%`, backgroundColor: route.color }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-10 text-right">{route.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column: Recent + Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Shipments */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#0A1628]">Recent Shipments</h3>
            <Link href="/express/history" className="text-xs text-[#FF6B00] hover:underline font-medium">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Tracking #</th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Courier</th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentShipments.map((s) => {
                  const sc = STATUS_MAP[s.status] || { label: s.status, color: "bg-gray-100 text-gray-600" };
                  return (
                    <tr key={s.tracking} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 font-semibold text-[#0A1628]">{s.tracking}</td>
                      <td className="px-6 py-3 text-gray-600">{s.destination}</td>
                      <td className="px-6 py-3 text-gray-600">{s.courier}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delivery Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-[#0A1628]">Delivery Performance</h3>
              <p className="text-xs text-gray-500 mt-0.5">This month vs target</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F5F7FA] rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-600">91%</p>
              <p className="text-[11px] text-gray-500 mt-1">On-time rate</p>
            </div>
            <div className="bg-[#F5F7FA] rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-[#0A1628]">2.1d</p>
              <p className="text-[11px] text-gray-500 mt-1">Avg delivery</p>
            </div>
            <div className="bg-[#F5F7FA] rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-[#FF6B00]">0.8%</p>
              <p className="text-[11px] text-gray-500 mt-1">Loss/damage</p>
            </div>
            <div className="bg-[#F5F7FA] rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-600">4.8★</p>
              <p className="text-[11px] text-gray-500 mt-1">Customer rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Charts + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Spend Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-[#0A1628]">Spend Trend</h3>
                <p className="text-xs text-gray-500 mt-0.5">Shipping costs over time</p>
              </div>
            </div>
            <div className="relative h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                {[0, 25, 50, 75, 100].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#F3F4F6" strokeWidth="0.3" />
                ))}
                <path
                  d={`${spendPath} L 100 100 L 0 100 Z`}
                  fill="url(#spendGrad)"
                  opacity="0.2"
                />
                <path d={spendPath} fill="none" stroke="#FF6B00" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
                {spendPoints.filter((_, i) => i % 5 === 0 || i === spendPoints.length - 1).map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="1" fill="#FF6B00" stroke="white" strokeWidth="0.5" />
                ))}
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-2 text-[10px] text-gray-400 -ml-1">
                <span>{formatCurrency(maxSpend, currency)}</span>
                <span>{formatCurrency(maxSpend * 0.75, currency)}</span>
                <span>{formatCurrency(maxSpend * 0.5, currency)}</span>
                <span>{formatCurrency(maxSpend * 0.25, currency)}</span>
                <span>₦0</span>
              </div>
            </div>
          </div>

          {/* Delivery Time Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-[#0A1628]">Average Delivery Time</h3>
                <p className="text-xs text-gray-500 mt-0.5">Days by destination — green = within SLA</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.deliveryTimes.map((c) => {
                const heightPct = maxDeliveryDays > 0 ? (c.avgDays / maxDeliveryDays) * 100 : 0;
                const barColor = c.avgDays <= 1.5 ? "#10B981" : c.avgDays <= 2.5 ? "#F59E0B" : "#EF4444";
                return (
                  <div key={c.city} className="text-center">
                    <div className="relative h-32 bg-gray-100 rounded-lg mx-auto w-full max-w-[60px] overflow-hidden">
                      <div
                        className="absolute bottom-0 w-full rounded-b-lg transition-all duration-700"
                        style={{ height: `${heightPct}%`, backgroundColor: barColor }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white drop-shadow">{c.avgDays}d</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-2 font-medium truncate">{c.city}</p>
                    <span
                      className={`inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                        c.slaMet ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {c.slaMet ? "SLA Met" : "Over SLA"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Live Activity Feed */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#0A1628]">Live Activity</h3>
                <span className="flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                </span>
              </div>
              <button
                onClick={() => setFeedPaused(!feedPaused)}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                title={feedPaused ? "Resume feed" : "Pause feed"}
              >
                {feedPaused ? <Play className="w-3.5 h-3.5 text-green-600" /> : <Pause className="w-3.5 h-3.5 text-gray-500" />}
              </button>
            </div>
            <div ref={feedRef} className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {data.activityFeed.map((item, idx) => (
                <Link
                  key={`${item.waybill}-${idx}`}
                  href={`/express/track/${item.waybill}`}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <span className="text-base mt-0.5 shrink-0">{item.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#0A1628] leading-relaxed group-hover:text-[#FF6B00] transition-colors">
                      <span className="font-semibold">{item.waybill}</span> —{" "}
                      {item.type === "delivered"
                        ? "Delivered"
                        : item.type === "in_transit"
                        ? "In transit"
                        : item.type === "out_for_delivery"
                        ? "Out for delivery"
                        : item.type === "customs"
                        ? "Customs hold"
                        : item.type}{" "}
                      in <span className="font-medium">{item.city}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{now > 0 ? formatTimeAgo(item.time, now) : "—"}</p>
                  </div>
                </Link>
              ))}
            </div>
            {feedPaused && (
              <div className="mt-3 text-center">
                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded">Feed paused</span>
              </div>
            )}
          </div>

          {/* Popular Destinations */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Popular Destinations</h3>
            <div className="space-y-3">
              {data.topDestinations.map((d, i) => {
                const maxCount = Math.max(...data.topDestinations.map((x) => x.count), 1);
                return (
                  <div key={d.city}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[#0A1628]">{d.city}</span>
                      <span className="text-[11px] text-gray-500">
                        {d.count.toLocaleString()} ({d.percentage}%)
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${maxCount > 0 ? (d.count / maxCount) * 100 : 0}%`,
                          backgroundColor: i === 0 ? "#FF6B00" : i === 1 ? "#0A1628" : "#3B82F6",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Routes Map */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Shipping Routes</h3>
            <div className="relative bg-[#0A1628] rounded-xl h-56 overflow-hidden">
              <svg viewBox="0 0 400 200" className="w-full h-full opacity-90">
                {[
                  { x: 85, y: 95, label: "Lagos", size: 5 },
                  { x: 90, y: 82, label: "Abuja", size: 4 },
                  { x: 82, y: 100, label: "Accra", size: 3 },
                  { x: 95, y: 110, label: "Nairobi", size: 3 },
                  { x: 80, y: 140, label: "Johannesburg", size: 3 },
                  { x: 120, y: 105, label: "PHC", size: 3.5 },
                  { x: 180, y: 75, label: "Dubai", size: 2.5 },
                  { x: 310, y: 60, label: "London", size: 2.5 },
                  { x: 290, y: 50, label: "NYC", size: 2.5 },
                  { x: 350, y: 100, label: "Tokyo", size: 2 },
                ].map((dot) => (
                  <g key={dot.label}>
                    <circle cx={dot.x} cy={dot.y} r={dot.size} fill="#FF6B00" opacity="0.9" />
                    <circle cx={dot.x} cy={dot.y} r={dot.size + 3} fill="#FF6B00" opacity="0.2" />
                    <text x={dot.x} y={dot.y - dot.size - 4} textAnchor="middle" fill="white" fontSize="6" opacity="0.7">
                      {dot.label}
                    </text>
                  </g>
                ))}
                {[
                  { x1: 85, y1: 95, x2: 90, y2: 82, w: 2 },
                  { x1: 85, y1: 95, x2: 120, y2: 105, w: 1.8 },
                  { x1: 85, y1: 95, x2: 82, y2: 100, w: 1.5 },
                  { x1: 85, y1: 95, x2: 95, y2: 110, w: 1.2 },
                  { x1: 85, y1: 95, x2: 310, y2: 60, w: 1 },
                  { x1: 85, y1: 95, x2: 180, y2: 75, w: 1 },
                  { x1: 95, y1: 110, x2: 80, y2: 140, w: 0.8 },
                ].map((line, i) => (
                  <line
                    key={i}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#FF6B00"
                    strokeWidth={line.w}
                    strokeDasharray="4 3"
                    opacity="0.4"
                  />
                ))}
              </svg>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="text-white/60 text-[10px]">{data.metrics.activeCount} active shipments</span>
                <Link href="/express/track/map" className="text-[#FF6B00] text-[10px] font-medium hover:underline">
                  Open full map
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
