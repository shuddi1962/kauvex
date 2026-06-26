"use client";

import { useState } from "react";
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
  MoreHorizontal,
  Zap,
  AlertCircle,
  RefreshCw,
  Eye,
  Activity,
} from "lucide-react";

const METRICS = [
  {
    label: "Total Shipments",
    value: "12,847",
    change: "+12.3%",
    trend: "up" as const,
    icon: Package,
    color: "bg-blue-50 text-blue-600",
    period: "vs last month",
  },
  {
    label: "Active Right Now",
    value: "342",
    change: "+5.1%",
    trend: "up" as const,
    icon: Truck,
    color: "bg-orange-50 text-[#FF6B00]",
    period: "in transit",
  },
  {
    label: "Delivered Today",
    value: "89",
    change: "+18.7%",
    trend: "up" as const,
    icon: CheckCircle2,
    color: "bg-green-50 text-green-600",
    period: "target: 100",
  },
  {
    label: "Pending Pickup",
    value: "23",
    change: "-8.2%",
    trend: "down" as const,
    icon: Clock,
    color: "bg-yellow-50 text-yellow-600",
    period: "awaiting dispatch",
  },
  {
    label: "Total Spend",
    value: "$48,291",
    change: "+3.4%",
    trend: "up" as const,
    icon: DollarSign,
    color: "bg-purple-50 text-purple-600",
    period: "this month",
  },
  {
    label: "Active Value",
    value: "$1.2M",
    change: "+22.1%",
    trend: "up" as const,
    icon: TrendingUp,
    color: "bg-emerald-50 text-emerald-600",
    period: "in shipments",
  },
];

const ACTIVITY_FEED = [
  { id: 1, type: "delivered", msg: "KVX-7842 delivered in Lagos", time: "2 min ago", icon: CheckCircle2, color: "text-green-500" },
  { id: 2, type: "pickup", msg: "KVX-7843 picked up from Warehouse A", time: "8 min ago", icon: Truck, color: "text-blue-500" },
  { id: 3, type: "alert", msg: "KVX-7810 delayed at customs — Abuja", time: "15 min ago", icon: AlertCircle, color: "text-red-500" },
  { id: 4, type: "delivered", msg: "KVX-7839 delivered in Accra", time: "22 min ago", icon: CheckCircle2, color: "text-green-500" },
  { id: 5, type: "created", msg: "5 new shipments queued for pickup", time: "31 min ago", icon: Package, color: "text-purple-500" },
  { id: 6, type: "delivered", msg: "KVX-7838 delivered in Nairobi", time: "45 min ago", icon: CheckCircle2, color: "text-green-500" },
  { id: 7, type: "alert", msg: "Route Lagos → PH estimated +2h delay", time: "1 hr ago", icon: AlertCircle, color: "text-orange-500" },
  { id: 8, type: "created", msg: "Bulk upload: 12 shipments created", time: "1.5 hr ago", icon: Zap, color: "text-indigo-500" },
];

const SHIPMENT_STATUSES = [
  { label: "Pending", count: 23, color: "#F59E0B", width: "15%" },
  { label: "Picked Up", count: 67, color: "#3B82F6", width: "43%" },
  { label: "In Transit", count: 198, color: "#FF6B00", width: "60%" },
  { label: "Out for Delivery", count: 77, color: "#8B5CF6", width: "25%" },
  { label: "Delivered", count: 412, color: "#10B981", width: "100%" },
  { label: "Exception", count: 12, color: "#EF4444", width: "8%" },
];

const TOP_ROUTES = [
  { from: "Lagos", to: "Abuja", shipments: 1240, efficiency: 94, avgTime: "1.2 days" },
  { from: "Lagos", to: "Port Harcourt", shipments: 890, efficiency: 91, avgTime: "1.5 days" },
  { from: "Lagos", to: "Accra", shipments: 560, efficiency: 88, avgTime: "2.1 days" },
  { from: "Abuja", to: "Kano", shipments: 430, efficiency: 86, avgTime: "1.8 days" },
  { from: "Lagos", to: "Nairobi", shipments: 320, efficiency: 92, avgTime: "3.2 days" },
];

const DESTINATIONS = [
  { name: "Lagos", pct: 35, color: "#FF6B00" },
  { name: "Abuja", pct: 22, color: "#0A1628" },
  { name: "Port Harcourt", pct: 15, color: "#3B82F6" },
  { name: "Accra", pct: 12, color: "#10B981" },
  { name: "Nairobi", pct: 8, color: "#8B5CF6" },
  { name: "Other", pct: 8, color: "#9CA3AF" },
];

export default function ExpressDashboardOverview() {
  const [feedExpanded, setFeedExpanded] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Express Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, John. Here&apos;s your shipping overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/express/dashboard/ship"
            className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            <Zap className="w-4 h-4" />
            New Shipment
          </Link>
          <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4.5 h-4.5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {METRICS.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.color}`}>
                <m.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${m.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {m.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {m.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0A1628]">{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{m.period}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column — 2 cols */}
        <div className="xl:col-span-2 space-y-6">
          {/* Shipment Status Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-[#0A1628]">Shipment Status</h3>
                <p className="text-xs text-gray-500 mt-0.5">Current distribution of all active shipments</p>
              </div>
              <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="space-y-3">
              {SHIPMENT_STATUSES.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-28 shrink-0">{s.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                      style={{ width: s.width, backgroundColor: s.color }}
                    >
                      <span className="text-[10px] font-bold text-white">{s.count}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{((s.count / 789) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spend Trend Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-[#0A1628]">Spend Trend</h3>
                <p className="text-xs text-gray-500 mt-0.5">Daily shipping costs over the past 30 days</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
                  This Month
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  Last Month
                </span>
              </div>
            </div>
            <div className="relative h-48">
              <svg viewBox="0 0 800 180" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line key={i} x1="0" y1={i * 45} x2="800" y2={i * 45} stroke="#F3F4F6" strokeWidth="1" />
                ))}
                {/* Last month line */}
                <polyline
                  fill="none"
                  stroke="#D1D5DB"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  points="0,120 40,115 80,125 120,100 160,110 200,95 240,105 280,85 320,90 360,80 400,75 440,82 480,70 520,65 560,68 600,55 640,58 680,50 720,45 760,42 800,38"
                />
                {/* This month area */}
                <path
                  d="M0,140 L40,130 80,135 120,110 160,120 200,95 240,100 280,80 320,85 360,70 400,65 440,72 480,55 520,50 560,48 600,42 640,38 680,35 720,30 760,25 800,20 L800,180 L0,180 Z"
                  fill="url(#spendGradient)"
                  opacity="0.3"
                />
                <polyline
                  fill="none"
                  stroke="#FF6B00"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,140 40,130 80,135 120,110 160,120 200,95 240,100 280,80 320,85 360,70 400,65 440,72 480,55 520,50 560,48 600,42 640,38 680,35 720,30 760,25 800,20"
                />
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-1 text-[10px] text-gray-400 -ml-1">
                <span>$2.5K</span>
                <span>$2.0K</span>
                <span>$1.5K</span>
                <span>$1.0K</span>
                <span>$0</span>
              </div>
            </div>
          </div>

          {/* Delivery Time Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-[#0A1628]">Average Delivery Time</h3>
                <p className="text-xs text-gray-500 mt-0.5">Days by destination city</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { city: "Lagos", days: 0.8, max: 3, color: "#10B981" },
                { city: "Abuja", days: 1.2, max: 3, color: "#3B82F6" },
                { city: "PH", days: 1.5, max: 3, color: "#8B5CF6" },
                { city: "Accra", days: 2.1, max: 3, color: "#FF6B00" },
                { city: "Nairobi", days: 3.2, max: 5, color: "#F59E0B" },
                { city: "Johannesburg", days: 4.5, max: 5, color: "#EF4444" },
              ].map((c) => (
                <div key={c.city} className="text-center">
                  <div className="relative h-32 bg-gray-100 rounded-lg mx-auto w-full max-w-[60px] overflow-hidden">
                    <div
                      className="absolute bottom-0 w-full rounded-b-lg transition-all duration-700"
                      style={{ height: `${(c.days / c.max) * 100}%`, backgroundColor: c.color }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white drop-shadow">{c.days}d</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-2 font-medium">{c.city}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Route Efficiency */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-[#0A1628]">Route Efficiency</h3>
                <p className="text-xs text-gray-500 mt-0.5">Top routes by shipment volume</p>
              </div>
              <Link href="/express/analytics?tab=routes" className="text-xs text-[#FF6B00] hover:underline font-medium">
                View all routes →
              </Link>
            </div>
            <div className="space-y-3">
              {TOP_ROUTES.map((r, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                    <span className="text-sm font-medium text-[#0A1628] truncate">
                      {r.from}
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="text-sm font-medium text-[#0A1628] truncate">
                      {r.to}
                    </span>
                  </div>
                  <div className="flex-1 hidden sm:block">
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#FF6B00] transition-all duration-700"
                        style={{ width: `${r.efficiency}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#0A1628]">{r.efficiency}%</p>
                    <p className="text-[11px] text-gray-500">{r.avgTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Popular Destinations */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Popular Destinations</h3>
            {/* CSS Donut Chart */}
            <div className="relative mx-auto w-40 h-40 mb-5">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(${DESTINATIONS.map((d, i) => {
                    const offset = DESTINATIONS.slice(0, i).reduce((acc, x) => acc + x.pct, 0);
                    return `${d.color} ${offset}% ${offset + d.pct}%`;
                  }).join(", ")})`,
                }}
              />
              <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center flex-col">
                <span className="text-xl font-bold text-[#0A1628]">12,847</span>
                <span className="text-[10px] text-gray-500">Total</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DESTINATIONS.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-gray-600 truncate">{d.name}</span>
                  <span className="text-xs font-semibold text-gray-800 ml-auto">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Map Placeholder */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Live Delivery Map</h3>
            <div className="relative bg-[#0A1628] rounded-xl h-52 overflow-hidden">
              {/* Simulated map */}
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  <circle cx="80" cy="80" r="4" fill="#FF6B00" className="animate-pulse" />
                  <circle cx="120" cy="60" r="4" fill="#FF6B00" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
                  <circle cx="200" cy="100" r="4" fill="#FF6B00" className="animate-pulse" style={{ animationDelay: "1s" }} />
                  <circle cx="280" cy="70" r="4" fill="#FF6B00" className="animate-pulse" style={{ animationDelay: "1.5s" }} />
                  <circle cx="340" cy="130" r="4" fill="#FF6B00" className="animate-pulse" style={{ animationDelay: "2s" }} />
                  {/* Route lines */}
                  <line x1="80" y1="80" x2="200" y2="100" stroke="#FF6B00" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                  <line x1="120" y1="60" x2="280" y2="70" stroke="#FF6B00" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                  <line x1="200" y1="100" x2="340" y2="130" stroke="#FF6B00" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-[#FF6B00] mx-auto mb-2 animate-bounce" />
                  <p className="text-white/80 text-sm font-medium">342 Active Shipments</p>
                  <p className="text-white/50 text-xs mt-1">Across 12 countries</p>
                </div>
              </div>
            </div>
            <Link
              href="/express/track/map"
              className="mt-4 w-full inline-flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-[#0A1628] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              Open Full Map
            </Link>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#0A1628]">Live Activity</h3>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-green-500 animate-pulse" />
                <span className="text-xs text-green-600 font-medium">Live</span>
              </div>
            </div>
            <div className="space-y-3">
              {(feedExpanded ? ACTIVITY_FEED : ACTIVITY_FEED.slice(0, 5)).map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#0A1628] leading-relaxed">{item.msg}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            {ACTIVITY_FEED.length > 5 && (
              <button
                onClick={() => setFeedExpanded(!feedExpanded)}
                className="mt-3 text-xs text-[#FF6B00] hover:underline font-medium"
              >
                {feedExpanded ? "Show less" : `Show all ${ACTIVITY_FEED.length} events`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
