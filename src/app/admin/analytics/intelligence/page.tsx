"use client";

import { useState, useEffect } from "react";
import {
  Brain, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  DollarSign, ShoppingCart, Truck, Warehouse, Users, UserCheck,
  Zap, Target, AlertTriangle, CheckCircle, Lightbulb, BarChart3,
  LineChart, Activity, Eye, RefreshCw, ChevronRight, Sparkles,
  Package, Clock, Globe,
} from "lucide-react";

const intelligenceCards = [
  {
    id: "revenue",
    title: "Revenue Intelligence",
    icon: DollarSign,
    color: "text-green",
    bgColor: "bg-green/10",
    borderColor: "border-green/20",
    insight: "Revenue trending 12% above forecast. Express deliveries driving margin improvement.",
    trend: "up",
    trendValue: "+12.4%",
    metrics: [
      { label: "Today's Revenue", value: "$84,293", change: "+8.2%", up: true },
      { label: "Week Avg", value: "$76,421", change: "+5.1%", up: true },
      { label: "GMV (MTD)", value: "$2.4M", change: "+12.4%", up: true },
      { label: "Margin", value: "34.2%", change: "+1.8%", up: true },
    ],
    recommendations: [
      "Increase Express tier availability in Lagos — 23% higher AOV",
      "Bundle slow-moving electronics with high-demand security products",
      "Activate BNPL promotion for items >$200 — conversion uplift expected",
    ],
    trends: [
      { period: "Mon", value: 62000 },
      { period: "Tue", value: 68000 },
      { period: "Wed", value: 71000 },
      { period: "Thu", value: 74000 },
      { period: "Fri", value: 82000 },
      { period: "Sat", value: 79000 },
      { period: "Sun", value: 84000 },
    ],
  },
  {
    id: "demand",
    title: "Demand Intelligence",
    icon: ShoppingCart,
    color: "text-orange",
    bgColor: "bg-orange/10",
    borderColor: "border-orange/20",
    insight: "Security systems demand surging 340% in PH region. Solar products trending nationally.",
    trend: "up",
    trendValue: "+340%",
    metrics: [
      { label: "Search Volume", value: "142K", change: "+23.1%", up: true },
      { label: "Top Category", value: "Security", change: "+340%", up: true },
      { label: "Cart Abandon", value: "34.2%", change: "-2.1%", up: false },
      { label: "Conversion", value: "3.8%", change: "+0.4%", up: true },
    ],
    recommendations: [
      "Pre-position security inventory in PH warehouse for demand spike",
      "Activate surge pricing for Hikvision DVR kits — supply constrained",
      "Launch flash sale on solar panels — supplier has excess inventory",
    ],
    trends: [
      { period: "Mon", value: 12400 },
      { period: "Tue", value: 13800 },
      { period: "Wed", value: 15200 },
      { period: "Thu", value: 18900 },
      { period: "Fri", value: 24500 },
      { period: "Sat", value: 22100 },
      { period: "Sun", value: 28700 },
    ],
  },
  {
    id: "logistics",
    title: "Logistics Intelligence",
    icon: Truck,
    color: "text-blue",
    bgColor: "bg-blue/10",
    borderColor: "border-blue/20",
    insight: "Delivery success rate at 96.2%. Kwik outperforming GIG in Lagos by 8min avg.",
    trend: "up",
    trendValue: "+96.2%",
    metrics: [
      { label: "On-Time Rate", value: "94.7%", change: "+1.2%", up: true },
      { label: "Avg Delivery", value: "42min", change: "-3min", up: false },
      { label: "Failed Rate", value: "3.8%", change: "-0.4%", up: false },
      { label: "Partner NPS", value: "72", change: "+4", up: true },
    ],
    recommendations: [
      "Shift 15% of Lagos deliveries from GIG to Kwik — faster & cheaper",
      "Activate locker redirect for failed deliveries in Island axis",
      "Negotiate volume discount with DHL for international shipments >5kg",
    ],
    trends: [
      { period: "Mon", value: 2890 },
      { period: "Tue", value: 3120 },
      { period: "Wed", value: 3340 },
      { period: "Thu", value: 3180 },
      { period: "Fri", value: 3890 },
      { period: "Sat", value: 3650 },
      { period: "Sun", value: 4120 },
    ],
  },
  {
    id: "warehouse",
    title: "Warehouse Intelligence",
    icon: Warehouse,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20",
    insight: "LOS-01 at 75% capacity. Pick rate 94% above SLA. ABJ-01 needs rebalancing.",
    trend: "up",
    trendValue: "94% SLA",
    metrics: [
      { label: "Pick Rate", value: "4,521/hr", change: "+12%", up: true },
      { label: "Capacity", value: "75%", change: "+3%", up: true },
      { label: "Accuracy", value: "99.7%", change: "+0.1%", up: true },
      { label: "Returns/hr", value: "23", change: "-2", up: false },
    ],
    recommendations: [
      "Rebalance 800 SKUs from LOS-01 to LOS-02 — optimize proximity",
      "Schedule overnight pick batch for express orders before 6AM",
      "Deploy additional packing station in Zone D1 — bottleneck identified",
    ],
    trends: [
      { period: "Mon", value: 4100 },
      { period: "Tue", value: 4250 },
      { period: "Wed", value: 4380 },
      { period: "Thu", value: 4200 },
      { period: "Fri", value: 4520 },
      { period: "Sat", value: 4300 },
      { period: "Sun", value: 4521 },
    ],
  },
  {
    id: "vendor",
    title: "Vendor Intelligence",
    icon: Users,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/20",
    insight: "Top 20 vendors driving 68% of GMV. 12 vendors at risk of deactivation.",
    trend: "up",
    trendValue: "68% GMV",
    metrics: [
      { label: "Active Vendors", value: "1,247", change: "+34", up: true },
      { label: "Avg Vendor Rev", value: "$6,780", change: "+8.2%", up: true },
      { label: "At Risk", value: "12", change: "+2", up: true },
      { label: "New Signups", value: "89", change: "+12", up: true },
    ],
    recommendations: [
      "Engage 12 at-risk vendors with account health outreach campaign",
      "Launch vendor incentive program for security/solar categories",
      "Deactivate 3 vendors with ODR >5% and zero response to warnings",
    ],
    trends: [
      { period: "Mon", value: 1180 },
      { period: "Tue", value: 1195 },
      { period: "Wed", value: 1210 },
      { period: "Thu", value: 1220 },
      { period: "Fri", value: 1235 },
      { period: "Sat", value: 1240 },
      { period: "Sun", value: 1247 },
    ],
  },
  {
    id: "customer",
    title: "Customer Intelligence",
    icon: UserCheck,
    color: "text-yellow",
    bgColor: "bg-yellow/10",
    borderColor: "border-yellow/20",
    insight: "Repeat purchase rate at 34%. BNPL adoption up 67% this month.",
    trend: "up",
    trendValue: "+34%",
    metrics: [
      { label: "Active Users", value: "89,234", change: "+4.2%", up: true },
      { label: "Repeat Rate", value: "34.2%", change: "+2.1%", up: true },
      { label: "BNPL Orders", value: "1,892", change: "+67%", up: true },
      { label: "Avg LTV", value: "$284", change: "+12%", up: true },
    ],
    recommendations: [
      "Launch loyalty tier rewards for customers with >5 orders",
      "Promote BNPL for high-AOV items — 67% conversion uplift",
      "Send re-engagement campaign to 12K users inactive >30 days",
    ],
    trends: [
      { period: "Mon", value: 82000 },
      { period: "Tue", value: 83500 },
      { period: "Wed", value: 84800 },
      { period: "Thu", value: 86100 },
      { period: "Fri", value: 87900 },
      { period: "Sat", value: 88500 },
      { period: "Sun", value: 89234 },
    ],
  },
];

function MiniSparkline({ data, color }: { data: { period: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;
  const width = 200;
  const height = 40;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.value - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="opacity-80">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.value - min) / range) * height;
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
      })}
    </svg>
  );
}

export default function AnalyticsIntelligencePage() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const colorMap: Record<string, string> = {
    "text-green": "#22C55E",
    "text-orange": "#FF6B00",
    "text-blue": "#3B82F6",
    "text-purple-400": "#A855F7",
    "text-cyan-400": "#22D3EE",
    "text-yellow": "#EAB308",
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-gray-900/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-orange/20 flex items-center justify-center">
              <Brain className="h-5 w-5 text-orange" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Platform AI Analytics Intelligence</h1>
              <p className="text-[10px] text-white/40 mt-0.5">AI-powered insights, trends, and actionable recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Sparkles className="h-3.5 w-3.5 text-orange" />
              <span>AI Engine Active</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Clock className="h-3.5 w-3.5" />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
            <button
              onClick={() => setLastUpdated(new Date())}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary bar */}
        <div className="mt-4 grid grid-cols-6 gap-3">
          {[
            { label: "Revenue", value: "$84.3K", change: "+8.2%", up: true, icon: DollarSign, color: "text-green" },
            { label: "Orders", value: "12,847", change: "+5.4%", up: true, icon: ShoppingCart, color: "text-orange" },
            { label: "Deliveries", value: "4,123", change: "+3.1%", up: true, icon: Truck, color: "text-blue" },
            { label: "Vendors", value: "1,247", change: "+2.8%", up: true, icon: Users, color: "text-cyan-400" },
            { label: "Customers", value: "89.2K", change: "+4.2%", up: true, icon: UserCheck, color: "text-yellow" },
            { label: "Uptime", value: "99.97%", change: "+0.01%", up: true, icon: Activity, color: "text-green" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-2.5">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">{s.label}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
                  <span className={`text-[10px] ${s.up ? "text-green" : "text-red"}`}>{s.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intelligence Cards Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {intelligenceCards.map((card) => {
            const isExpanded = selectedCard === card.id;
            return (
              <div
                key={card.id}
                className={`rounded-xl border transition-all cursor-pointer ${
                  isExpanded
                    ? `${card.borderColor} ${card.bgColor} ring-1 ring-white/10`
                    : "border-white/10 bg-white/5 hover:bg-white/8"
                }`}
                onClick={() => setSelectedCard(isExpanded ? null : card.id)}
              >
                {/* Card header */}
                <div className="flex items-center justify-between p-5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{card.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {card.trend === "up" ? (
                          <ArrowUpRight className="h-3 w-3 text-green" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red" />
                        )}
                        <span className={`text-[10px] font-bold ${card.trend === "up" ? "text-green" : "text-red"}`}>
                          {card.trendValue}
                        </span>
                        <span className="text-[10px] text-white/30">trend</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-white/30 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </div>

                {/* Insight */}
                <div className="px-5 pb-3">
                  <div className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <Lightbulb className="h-3.5 w-3.5 text-yellow mt-0.5 flex-shrink-0" />
                    <span className="text-[11px] text-white/70">{card.insight}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="px-5 pb-3">
                  <div className="grid grid-cols-4 gap-2">
                    {card.metrics.map((m) => (
                      <div key={m.label} className="text-center">
                        <div className="text-[9px] text-white/30 uppercase tracking-wider">{m.label}</div>
                        <div className="text-xs font-bold text-white mt-0.5">{m.value}</div>
                        <div className={`text-[10px] ${m.up ? "text-green" : "text-red"}`}>{m.change}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sparkline */}
                <div className="px-5 pb-3">
                  <MiniSparkline data={card.trends} color={colorMap[card.color] || "#FF6B00"} />
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/10 pt-4">
                    <h4 className="text-[10px] text-white/40 uppercase tracking-widest mb-3">AI Recommendations</h4>
                    <div className="space-y-2">
                      {card.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2.5">
                          <Target className="h-3.5 w-3.5 text-orange mt-0.5 flex-shrink-0" />
                          <span className="text-[11px] text-white/70">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
