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
  hasData: boolean;
}

const DEMO_DATA: DashboardData = {
  metrics: {
    totalShipments: 12847,
    thisMonthCount: 1423,
    monthChange: 12.3,
    activeCount: 342,
    deliveredTodayCount: 89,
    deliveredTodaySuccess: 94,
    pendingCount: 23,
    oldestPendingMinutes: 45,
    hasHighPendingAlert: true,
    thisMonthSpend: 48291,
    spendChange: 3.4,
    avgCostPerShipment: 33.94,
    totalActiveValue: 1200000,
    insuredActiveCount: 218,
    activeValueInsured: true,
    currency: "NGN",
  },
  activityFeed: [
    { waybill: "KVX-7842", type: "delivered", emoji: "✅", city: "Lagos", time: new Date(Date.now() - 2 * 60000).toISOString() },
    { waybill: "KVX-7843", type: "pickup", emoji: "📦", city: "Abuja", time: new Date(Date.now() - 8 * 60000).toISOString() },
    { waybill: "KVX-7810", type: "attempted", emoji: "⚠️", city: "Abuja", time: new Date(Date.now() - 15 * 60000).toISOString() },
    { waybill: "KVX-7839", type: "delivered", emoji: "✅", city: "Accra", time: new Date(Date.now() - 22 * 60000).toISOString() },
    { waybill: "KVX-7844", type: "out_for_delivery", emoji: "🚴", city: "Port Harcourt", time: new Date(Date.now() - 31 * 60000).toISOString() },
    { waybill: "KVX-7838", type: "delivered", emoji: "✅", city: "Nairobi", time: new Date(Date.now() - 45 * 60000).toISOString() },
    { waybill: "KVX-7845", type: "pickup", emoji: "📦", city: "Lagos", time: new Date(Date.now() - 60 * 60000).toISOString() },
    { waybill: "KVX-7846", type: "out_for_delivery", emoji: "🚴", city: "Kano", time: new Date(Date.now() - 75 * 60000).toISOString() },
    { waybill: "KVX-7840", type: "delivered", emoji: "✅", city: "Johannesburg", time: new Date(Date.now() - 90 * 60000).toISOString() },
    { waybill: "KVX-7837", type: "pickup", emoji: "📦", city: "Cape Town", time: new Date(Date.now() - 120 * 60000).toISOString() },
  ],
  statusBreakdown: {
    delivered: 412,
    in_transit: 198,
    picked_up: 67,
    failed: 12,
    pending: 23,
    out_for_delivery: 77,
    returned: 5,
  },
  topDestinations: [
    { city: "Lagos", count: 4492, percentage: 35 },
    { city: "Abuja", count: 2826, percentage: 22 },
    { city: "Port Harcourt", count: 1927, percentage: 15 },
    { city: "Accra", count: 1542, percentage: 12 },
    { city: "Nairobi", count: 1028, percentage: 8 },
  ],
  deliveryTimes: [
    { city: "Lagos", avgDays: 0.8, slaMet: true },
    { city: "Abuja", avgDays: 1.2, slaMet: true },
    { city: "Port Harcourt", avgDays: 1.5, slaMet: true },
    { city: "Accra", avgDays: 2.1, slaMet: false },
    { city: "Nairobi", avgDays: 3.2, slaMet: false },
    { city: "Johannesburg", avgDays: 4.5, slaMet: false },
  ],
  spendTrend: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().substring(0, 10),
    amount: +(800 + Math.random() * 1200 + i * 20).toFixed(2),
  })),
  routeEfficiency: {
    score: 87,
    bestRoute: "Lagos → Abuja",
    worstRoute: "Lagos → Johannesburg",
  },
  hasData: false,
};

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatCurrency(amount: number, currency = "NGN"): string {
  if (currency === "NGN") return `₦${amount.toLocaleString()}`;
  if (currency === "USD") return `$${amount.toLocaleString()}`;
  return `${currency} ${amount.toLocaleString()}`;
}

function CircularProgress({ value, size = 80 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth="6" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={value >= 80 ? "#10B981" : value >= 60 ? "#F59E0B" : "#EF4444"}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000"
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="transform rotate-90"
        style={{ transformOrigin: "center", fontSize: size * 0.22, fontWeight: 700, fill: "#0A1628" }}
      >
        {value}%
      </text>
    </svg>
  );
}

export default function ExpressDashboardOverview() {
  const [data, setData] = useState<DashboardData>(DEMO_DATA);
  const [loading, setLoading] = useState(true);
  const [feedPaused, setFeedPaused] = useState(false);
  const [statusPeriod, setStatusPeriod] = useState<"week" | "month" | "year">("week");
  const [spendPeriod, setSpendPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const feedRef = useRef<HTMLDivElement>(null);

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

  const metricCards = [
    {
      label: "Total Shipments",
      value: m.totalShipments.toLocaleString(),
      sub: `This month: ${m.thisMonthCount.toLocaleString()}`,
      change: `${m.monthChange >= 0 ? "+" : ""}${m.monthChange}% vs last month`,
      trend: m.monthChange >= 0 ? ("up" as const) : ("down" as const),
      icon: Package,
      bg: "bg-[#0A1628]",
      textColor: "text-white",
      subColor: "text-white/60",
      changeColor: m.monthChange >= 0 ? "text-green-400" : "text-red-400",
    },
    {
      label: "Active Right Now",
      value: m.activeCount.toLocaleString(),
      sub: "packages moving",
      pulse: true,
      icon: Truck,
      bg: "bg-[#FF6B00]",
      textColor: "text-white",
      subColor: "text-white/70",
    },
    {
      label: "Delivered Today",
      value: m.deliveredTodayCount.toLocaleString(),
      sub: `${m.deliveredTodaySuccess}% success rate`,
      detail: `${Math.round(m.deliveredTodayCount * 0.7)} on time | ${Math.round(m.deliveredTodayCount * 0.3)} delayed`,
      icon: CheckCircle2,
      bg: "bg-emerald-600",
      textColor: "text-white",
      subColor: "text-white/70",
    },
    {
      label: "Pending Pickup",
      value: m.pendingCount.toLocaleString(),
      sub: m.oldestPendingMinutes > 0 ? `Oldest: ${m.oldestPendingMinutes} min` : "None pending",
      alert: m.hasHighPendingAlert,
      icon: Clock,
      bg: "bg-amber-500",
      textColor: "text-white",
      subColor: "text-white/70",
    },
    {
      label: "Total Spend",
      value: formatCurrency(m.thisMonthSpend, currency),
      sub: `Avg: ${formatCurrency(m.avgCostPerShipment, currency)}/shipment`,
      change: `${m.spendChange >= 0 ? "+" : ""}${m.spendChange}% vs last month`,
      trend: m.spendChange <= 0 ? ("up" as const) : ("down" as const),
      icon: DollarSign,
      bg: "bg-blue-600",
      textColor: "text-white",
      subColor: "text-white/70",
      changeColor: m.spendChange <= 0 ? "text-green-400" : "text-red-400",
    },
    {
      label: "Active Shipments Value",
      value: formatCurrency(m.totalActiveValue, currency),
      sub: "declared value in transit",
      badge: m.activeValueInsured,
      badgeText: "Insured",
      icon: ShieldCheck,
      bg: "bg-purple-600",
      textColor: "text-white",
      subColor: "text-white/70",
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

  const maxDestCount = Math.max(...data.topDestinations.map((d) => d.count), 1);

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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Express Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your shipping overview at a glance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/express/dashboard/ship"
            className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            <Zap className="w-4 h-4" />
            New Shipment
          </Link>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4.5 h-4.5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} rounded-xl p-4 hover:shadow-lg transition-shadow relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                <card.icon className="w-5 h-5 text-white" />
              </div>
              {card.pulse && (
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                  </span>
                  <span className="text-[11px] font-semibold text-white/90">LIVE</span>
                </span>
              )}
              {card.change && (
                <span className={`text-xs font-semibold ${card.changeColor || "text-white/70"}`}>
                  {card.change}
                </span>
              )}
              {card.alert && (
                <span className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                  <AlertCircle className="w-3 h-3 text-white" />
                  <span className="text-[10px] font-bold text-white">ALERT</span>
                </span>
              )}
              {card.badge && (
                <span className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                  <ShieldCheck className="w-3 h-3 text-white" />
                  <span className="text-[10px] font-bold text-white">{card.badgeText}</span>
                </span>
              )}
            </div>
            <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
            <p className={`text-xs ${card.subColor} mt-1`}>{card.sub}</p>
            {card.detail && (
              <p className="text-[11px] text-white/50 mt-0.5">{card.detail}</p>
            )}
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Shipment Status Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-[#0A1628]">Shipment Status</h3>
                <p className="text-xs text-gray-500 mt-0.5">Current distribution of shipments</p>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {(["week", "month", "year"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setStatusPeriod(p)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      statusPeriod === p
                        ? "bg-[#0A1628] text-white shadow"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {statusBars.map((s) => {
                const pct = totalForStatusBars > 0 ? Math.round((s.count / totalForStatusBars) * 100) : 0;
                return (
                  <div key={s.label} className="group">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-24 shrink-0">{s.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all duration-700 flex items-center"
                          style={{ width: `${Math.max(pct, 5)}%`, backgroundColor: s.color }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#0A1628]">
                          {s.count}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {statusBars.map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[11px] text-gray-500">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spend Trend Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-[#0A1628]">Spend Trend</h3>
                <p className="text-xs text-gray-500 mt-0.5">Shipping costs over time</p>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {(["daily", "weekly", "monthly"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSpendPeriod(p)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      spendPeriod === p
                        ? "bg-[#0A1628] text-white shadow"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
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
                        c.slaMet
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {c.slaMet ? "SLA Met" : "Over SLA"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Route Efficiency */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-[#0A1628]">Route Efficiency</h3>
                <p className="text-xs text-gray-500 mt-0.5">Performance score based on on-time deliveries</p>
              </div>
              <Link href="/express/analytics?tab=routes" className="text-xs text-[#FF6B00] hover:underline font-medium">
                View all routes
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="shrink-0">
                <CircularProgress value={data.routeEfficiency.score} size={100} />
              </div>
              <div className="flex-1 space-y-3 w-full">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Navigation className="w-4 h-4 text-green-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-green-600 font-medium">Most Efficient</p>
                    <p className="text-sm font-semibold text-[#0A1628] truncate">{data.routeEfficiency.bestRoute}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <Navigation className="w-4 h-4 text-red-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-red-500 font-medium">Least Efficient</p>
                    <p className="text-sm font-semibold text-[#0A1628] truncate">{data.routeEfficiency.worstRoute}</p>
                  </div>
                </div>
              </div>
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
                {feedPaused ? (
                  <Play className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Pause className="w-3.5 h-3.5 text-gray-500" />
                )}
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
                      <span className="font-semibold">{item.waybill}</span> — {item.type === "delivered" ? "Delivered" : item.type === "pickup" ? "Picked up" : item.type === "out_for_delivery" ? "Out for delivery" : item.type === "attempted" ? "Delivery attempted" : item.type} in{" "}
                      <span className="font-medium">{item.city}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{formatTimeAgo(item.time)}</p>
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
              {data.topDestinations.map((d, i) => (
                <Link
                  key={d.city}
                  href={`/express/track?city=${encodeURIComponent(d.city)}`}
                  className="block group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4 text-right">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">
                          {d.city}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {d.count.toLocaleString()} ({d.percentage}%)
                        </span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${maxDestCount > 0 ? (d.count / maxDestCount) * 100 : 0}%`,
                            backgroundColor: i === 0 ? "#FF6B00" : i === 1 ? "#0A1628" : "#3B82F6",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Delivery Map */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Shipping Routes</h3>
            <div className="relative bg-[#0A1628] rounded-xl h-56 overflow-hidden">
              <svg viewBox="0 0 400 200" className="w-full h-full opacity-90">
                {/* Simplified world map dots */}
                {[
                  { x: 85, y: 95, label: "Lagos", size: 5 },
                  { x: 90, y: 82, label: "Abuja", size: 4 },
                  { x: 82, y: 100, label: "Accra", size: 3 },
                  { x: 95, y: 110, label: "Nairobi", size: 3 },
                  { x: 80, y: 140, label: "Johannesburg", size: 3 },
                  { x: 120, y: 105, label: "Port Harcourt", size: 3.5 },
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
                {/* Route lines */}
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
