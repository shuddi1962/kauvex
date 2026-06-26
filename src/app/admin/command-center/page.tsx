"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Globe, Package, Truck, Users, Clock, Zap, Activity,
  AlertTriangle, AlertCircle, CheckCircle, Pause, Play,
  RotateCcw, Maximize2, Radio, TrendingUp, ArrowUpRight,
  ArrowDownRight, DollarSign, Server, Box, Eye, BarChart3,
  MapPin, RefreshCw, Shield, Wifi, Battery, Signal,
  ShoppingCart, CreditCard, Store, XCircle, Ban,
} from "lucide-react";

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(display);
  fromRef.current = display;

  useEffect(() => {
    const duration = 600;
    const steps = 15;
    const from = fromRef.current;
    const increment = (value - from) / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setDisplay(Math.round(from + increment * step));
      if (step >= steps) { setDisplay(value); clearInterval(interval); }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value]);

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

const worldDots = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 5 + 2,
  type: ["order", "delivery", "warehouse", "locker"][Math.floor(Math.random() * 4)] as string,
  speed: Math.random() * 3 + 1,
}));

const activityEvents = [
  { id: 1, type: "order", message: "🛒 New order — Lagos | ₦45,200", time: "12s ago", color: "text-orange" },
  { id: 2, type: "delivery", message: "✅ Delivered — Dubai | KVX-28470", time: "28s ago", color: "text-green" },
  { id: 3, type: "warehouse", message: "📦 Inbound received — London warehouse", time: "45s ago", color: "text-blue" },
  { id: 4, type: "alert", message: "🔴 Delivery failed — Nairobi", time: "1m ago", color: "text-red" },
  { id: 5, type: "payment", message: "💳 Payment received — ₦127,000", time: "1m ago", color: "text-yellow" },
  { id: 6, type: "vendor", message: "🏪 New vendor registered — Accra", time: "2m ago", color: "text-purple-400" },
  { id: 7, type: "order", message: "🛒 Bulk order — Abuja | ₦2,400,000", time: "2m ago", color: "text-orange" },
  { id: 8, type: "delivery", message: "✅ Delivered — Lagos | KVX-28471", time: "3m ago", color: "text-green" },
  { id: 9, type: "warehouse", message: "📦 Pick completed — LOS-01 | 340 items", time: "3m ago", color: "text-blue" },
  { id: 10, type: "alert", message: "🔴 Carrier API timeout — DHL Express", time: "4m ago", color: "text-red" },
  { id: 11, type: "payment", message: "💳 Wallet top-up — ₦85,000", time: "5m ago", color: "text-yellow" },
  { id: 12, type: "vendor", message: "🏪 Vendor payout processed — ₦3,200,000", time: "5m ago", color: "text-green" },
];

const alerts = [
  { id: 1, severity: "critical", title: "DHL Express API down", desc: "All international shipments queued. Auto-switching to FedEx.", time: "3m ago" },
  { id: 2, severity: "critical", title: "Payment gateway latency >5s", desc: "Paystack webhook delays. Monitoring auto-retry queue.", time: "5m ago" },
  { id: 3, severity: "warning", title: "Demand spike: PH region +340%", desc: "Activate surge routing. Pre-position inventory from LOS-02.", time: "1m ago" },
  { id: 4, severity: "warning", title: "WH-ABJ-02 pick rate dropped to 67%", desc: "Below SLA threshold of 85%. Staff reallocation recommended.", time: "8m ago" },
  { id: 5, severity: "info", title: "Stockout risk: Hikvision DVR kits", desc: "340 units remaining. Reorder triggered for vendor TechPro.", time: "12m ago" },
  { id: 6, severity: "info", title: "Locker LAG-05 occupancy at 92%", desc: "Redirect new deliveries to LAG-06.", time: "15m ago" },
];

const severityConfig: Record<string, { bg: string; border: string; dot: string; icon: React.ElementType }> = {
  critical: { bg: "bg-red-900/30", border: "border-red-500/50", dot: "bg-red", icon: AlertCircle },
  warning: { bg: "bg-yellow-900/30", border: "border-yellow-500/50", dot: "bg-yellow", icon: AlertTriangle },
  info: { bg: "bg-blue-900/30", border: "border-blue-500/50", dot: "bg-blue", icon: AlertCircle },
};

export default function CommandCenterPage() {
  const [ordersToday, setOrdersToday] = useState(12847);
  const [activeDeliveries, setActiveDeliveries] = useState(3421);
  const [gmv, setGmv] = useState(2847593);
  const [partnersOnline, setPartnersOnline] = useState(1247);
  const [expressBookings, setExpressBookings] = useState(892);
  const [lockerOccupancy, setLockerOccupancy] = useState(76);
  const [uptime, setUptime] = useState(99.97);
  const [ordersPerMin, setOrdersPerMin] = useState(47);
  const [deliveriesPerHr, setDeliveriesPerHr] = useState(1892);
  const [warehousePicksPerHr, setWarehousePicksPerHr] = useState(4521);
  const [expressPerHr, setExpressPerHr] = useState(156);
  const [lockerCollectionsPerHr, setLockerCollectionsPerHr] = useState(312);
  const [revenuePerMin, setRevenuePerMin] = useState(3280);
  const [activityPaused, setActivityPaused] = useState(false);
  const [feed, setFeed] = useState(activityEvents);
  const [replayMode, setReplayMode] = useState(false);
  const [selectedDot, setSelectedDot] = useState<number | null>(null);
  const [feedFilter, setFeedFilter] = useState<string>("all");
  const [feedCountryFilter, setFeedCountryFilter] = useState<string>("all");

  useEffect(() => {
    if (activityPaused) return;
    const interval = setInterval(() => {
      setOrdersToday((p) => p + Math.floor(Math.random() * 3));
      setActiveDeliveries((p) => p + Math.floor(Math.random() * 5) - 2);
      setGmv((p) => p + Math.floor(Math.random() * 15000));
      setPartnersOnline((p) => Math.max(1200, p + Math.floor(Math.random() * 10) - 5));
      setExpressBookings((p) => p + Math.floor(Math.random() * 2));
      setLockerOccupancy((p) => Math.min(99, Math.max(60, p + Math.floor(Math.random() * 3) - 1)));
      setOrdersPerMin((p) => Math.max(20, p + Math.floor(Math.random() * 8) - 4));
      setDeliveriesPerHr((p) => Math.max(1500, p + Math.floor(Math.random() * 50) - 25));
      setWarehousePicksPerHr((p) => Math.max(3000, p + Math.floor(Math.random() * 100) - 50));
      setExpressPerHr((p) => Math.max(100, p + Math.floor(Math.random() * 20) - 10));
      setLockerCollectionsPerHr((p) => Math.max(200, p + Math.floor(Math.random() * 30) - 15));
      setRevenuePerMin((p) => Math.max(1500, p + Math.floor(Math.random() * 400) - 200));
    }, 2000);
    return () => clearInterval(interval);
  }, [activityPaused]);

  const addEvent = useCallback(() => {
    const cities = ["Lagos", "Abuja", "Dubai", "London", "Nairobi", "Accra", "Port Harcourt", "Kano"];
    const currencies = ["₦", "₦", "$", "£", "KSh", "GH₵", "₦", "₦"];
    const cityIdx = Math.floor(Math.random() * cities.length);
    const eventTemplates = [
      { type: "order", message: `🛒 New order — ${cities[cityIdx]} | ${currencies[cityIdx]}${(Math.floor(Math.random() * 500) * 1000).toLocaleString()}`, color: "text-orange" },
      { type: "delivery", message: `✅ Delivered — ${cities[cityIdx]} | KVX-${28000 + Math.floor(Math.random() * 999)}`, color: "text-green" },
      { type: "warehouse", message: `📦 Inbound received — ${cities[cityIdx]} warehouse`, color: "text-blue" },
      { type: "alert", message: `🔴 Delivery failed — ${cities[cityIdx]}`, color: "text-red" },
      { type: "payment", message: `💳 Payment received — ${currencies[cityIdx]}${(Math.floor(Math.random() * 200) * 1000).toLocaleString()}`, color: "text-yellow" },
      { type: "vendor", message: `🏪 New vendor registered — ${cities[cityIdx]}`, color: "text-purple-400" },
    ];
    const pick = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    setFeed((prev) => [{ id: Date.now(), ...pick, time: "now" }, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    if (activityPaused) return;
    const interval = setInterval(addEvent, 4000);
    return () => clearInterval(interval);
  }, [activityPaused, addEvent]);

  const filteredFeed = feed.filter((e) => {
    if (feedFilter !== "all" && e.type !== feedFilter) return false;
    return true;
  });

  const throughputGauges = [
    { label: "Orders/min", value: ordersPerMin, max: 80, color: "#FF6B00" },
    { label: "Deliveries/hr", value: deliveriesPerHr, max: 3000, color: "#22C55E" },
    { label: "Warehouse Picks/hr", value: warehousePicksPerHr, max: 8000, color: "#3B82F6" },
    { label: "Express Bookings/hr", value: expressPerHr, max: 400, color: "#A855F7" },
    { label: "Locker Collections/hr", value: lockerCollectionsPerHr, max: 600, color: "#22D3EE" },
    { label: "Revenue/min", value: revenuePerMin, max: 6000, color: "#EAB308" },
  ];

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      <style jsx global>{`
        @keyframes pulse-order {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.8); }
        }
        @keyframes pulse-green {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.6); }
        }
        @keyframes pulse-blue {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
        @keyframes gauge-fill {
          from { stroke-dashoffset: 283; }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .feed-item { animation: slide-in 0.3s ease-out; }
      `}</style>

      {/* PANEL 2 — LIVE METRICS (top bar) */}
      <div className="border-b border-white/10 bg-[#0D1B2A]/90 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green animate-pulse" />
              <span className="text-xs font-medium text-green uppercase tracking-wider">System Live</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <h1 className="text-sm font-bold text-white tracking-wide">KAUVEX COMMAND CENTER</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setReplayMode(!replayMode)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${replayMode ? "bg-orange text-white" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
            >
              <RotateCcw className="h-3 w-3" />
              {replayMode ? "Time-Lapse ON" : "Time-Lapse 24h"}
            </button>
            <span className="text-xs text-white/50">{new Date().toLocaleTimeString()}</span>
            <Wifi className="h-4 w-4 text-green" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-3">
          {[
            { label: "Orders Today", value: ordersToday, icon: Package, color: "text-orange", prefix: "" },
            { label: "Active Deliveries", value: activeDeliveries, icon: Truck, color: "text-green", prefix: "" },
            { label: "GMV Today", value: gmv, icon: DollarSign, color: "text-yellow", prefix: "$" },
            { label: "Partners Online", value: partnersOnline, icon: Users, color: "text-blue", prefix: "" },
            { label: "Express Shipments", value: expressBookings, icon: Zap, color: "text-purple-400", prefix: "" },
            { label: "Locker Occupancy", value: lockerOccupancy, icon: Box, color: "text-cyan-400", suffix: "%" },
            { label: "Platform Uptime", value: uptime, icon: Server, color: "text-green", suffix: "%" },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-2.5 border border-white/5">
              <m.icon className={`h-4 w-4 ${m.color}`} />
              <div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">{m.label}</div>
                <div className={`text-lg font-bold ${m.color}`}>
                  <AnimatedNumber value={m.value} prefix={m.prefix || ""} suffix={m.suffix || ""} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex h-[calc(100vh-148px)]">
        {/* PANEL 4 — THROUGHPUT GAUGES (left) */}
        <div className="w-64 border-r border-white/10 bg-[#0D1B2A]/60 p-4 flex flex-col gap-3 overflow-y-auto">
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Throughput Gauges</h3>
          {throughputGauges.map((g) => {
            const pct = Math.min(100, (g.value / g.max) * 100);
            const circumference = 2 * Math.PI * 45;
            const offset = circumference - (pct / 100) * circumference;
            return (
              <div key={g.label} className="rounded-lg bg-white/5 p-3 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider">{g.label}</span>
                  <span className="text-xs font-bold" style={{ color: g.color }}>
                    {g.value.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <svg width="90" height="90" viewBox="0 0 100 100" className="-rotate-90">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="45" fill="none"
                      stroke={g.color}
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-lg font-bold" style={{ color: g.color }}>{Math.round(pct)}%</div>
                    <div className="text-[8px] text-white/30">of max</div>
                  </div>
                </div>
                <div className="mt-1 flex justify-between text-[9px] text-white/30">
                  <span>0</span>
                  <span>{g.max.toLocaleString()}</span>
                </div>
              </div>
            );
          })}

          <div className="mt-auto rounded-lg bg-white/5 p-3 border border-white/5">
            <h4 className="text-[10px] text-white/50 uppercase tracking-wider mb-2">System Health</h4>
            <div className="space-y-2">
              {[
                { label: "API Latency", value: "42ms", status: "good" },
                { label: "DB Connections", value: "312/500", status: "good" },
                { label: "Memory", value: "67%", status: "good" },
                { label: "CPU", value: "43%", status: "good" },
                { label: "Queue Depth", value: "23", status: "good" },
              ].map((h) => (
                <div key={h.label} className="flex items-center justify-between text-xs">
                  <span className="text-white/40">{h.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/70">{h.value}</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-green" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL 1 — WORLD MAP (center, largest) */}
        <div className="flex-1 relative overflow-hidden bg-[#060E1A]">
          {replayMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-lg bg-orange/20 border border-orange/40 px-4 py-2">
              <RotateCcw className="h-4 w-4 text-orange animate-spin" />
              <span className="text-xs font-bold text-orange">TIME-LAPSE REPLAY ACTIVE</span>
              <span className="text-[10px] text-orange/70">Last 24h — Speed: 10x</span>
            </div>
          )}

          {/* SVG world map */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="heatGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid lines */}
            {Array.from({ length: 25 }, (_, i) => (
              <line key={`vg-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600" stroke="white" strokeWidth="0.3" opacity="0.04" />
            ))}
            {Array.from({ length: 13 }, (_, i) => (
              <line key={`hg-${i}`} x1="0" y1={i * 50} x2="1200" y2={i * 50} stroke="white" strokeWidth="0.3" opacity="0.04" />
            ))}

            {/* Heatmap overlay zones */}
            <circle cx="350" cy="310" r="80" fill="url(#heatGrad)" opacity="0.6">
              <animate attributeName="r" values="80;95;80" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="500" cy="200" r="60" fill="url(#heatGrad)" opacity="0.4">
              <animate attributeName="r" values="60;72;60" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="700" cy="280" r="50" fill="url(#heatGrad)" opacity="0.3">
              <animate attributeName="r" values="50;60;50" dur="3.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="850" cy="350" r="45" fill="url(#heatGrad)" opacity="0.35">
              <animate attributeName="r" values="45;55;45" dur="4.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="600" cy="400" r="40" fill="url(#heatGrad)" opacity="0.25">
              <animate attributeName="r" values="40;50;40" dur="6s" repeatCount="indefinite" />
            </circle>

            {/* Connection routes */}
            <line x1="350" y1="310" x2="500" y2="200" stroke="#FF6B00" strokeWidth="0.8" opacity="0.25" strokeDasharray="6 4">
              <animate attributeName="stroke-dashoffset" from="0" to="-10" dur="1.5s" repeatCount="indefinite" />
            </line>
            <line x1="500" y1="200" x2="700" y2="280" stroke="#22C55E" strokeWidth="0.8" opacity="0.2" strokeDasharray="6 4">
              <animate attributeName="stroke-dashoffset" from="0" to="-10" dur="1.2s" repeatCount="indefinite" />
            </line>
            <line x1="350" y1="310" x2="850" y2="350" stroke="#3B82F6" strokeWidth="0.6" opacity="0.15" strokeDasharray="4 6">
              <animate attributeName="stroke-dashoffset" from="0" to="-10" dur="2s" repeatCount="indefinite" />
            </line>
            <line x1="700" y1="280" x2="850" y2="350" stroke="#A855F7" strokeWidth="0.5" opacity="0.15" strokeDasharray="4 6">
              <animate attributeName="stroke-dashoffset" from="0" to="-10" dur="1.8s" repeatCount="indefinite" />
            </line>
          </svg>

          {/* Animated dots — orders (orange flash) */}
          {worldDots.filter((d) => d.type === "order").map((dot) => (
            <div
              key={dot.id}
              className="absolute rounded-full cursor-pointer"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                width: dot.size,
                height: dot.size,
                backgroundColor: "#FF6B00",
                boxShadow: `0 0 ${dot.size * 4}px #FF6B00`,
                animation: `pulse-order ${dot.speed}s ease-in-out infinite`,
              }}
              onClick={() => setSelectedDot(selectedDot === dot.id ? null : dot.id)}
            />
          ))}

          {/* Animated dots — deliveries (green flash) */}
          {worldDots.filter((d) => d.type === "delivery").map((dot) => (
            <div
              key={dot.id}
              className="absolute rounded-full cursor-pointer"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                width: dot.size,
                height: dot.size,
                backgroundColor: "#22C55E",
                boxShadow: `0 0 ${dot.size * 3}px #22C55E`,
                animation: `pulse-green ${dot.speed}s ease-in-out infinite`,
              }}
            />
          ))}

          {/* Animated dots — warehouse (green) */}
          {worldDots.filter((d) => d.type === "warehouse").map((dot) => (
            <div
              key={dot.id}
              className="absolute cursor-pointer"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                width: dot.size + 2,
                height: dot.size + 2,
                backgroundColor: "#059669",
                boxShadow: `0 0 ${dot.size * 3}px #059669`,
                animation: `pulse-green ${dot.speed + 1}s ease-in-out infinite`,
              }}
            />
          ))}

          {/* Animated dots — locker (blue flash) */}
          {worldDots.filter((d) => d.type === "locker").map((dot) => (
            <div
              key={dot.id}
              className="absolute rounded cursor-pointer"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                width: dot.size,
                height: dot.size,
                backgroundColor: "#3B82F6",
                boxShadow: `0 0 ${dot.size * 3}px #3B82F6`,
                animation: `pulse-blue ${dot.speed}s ease-in-out infinite`,
              }}
            />
          ))}

          {/* Map legend */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 rounded-lg bg-[#0A1628]/90 border border-white/10 px-4 py-2">
            {[
              { color: "#FF6B00", label: "New Orders" },
              { color: "#22C55E", label: "Deliveries" },
              { color: "#059669", label: "Warehouse" },
              { color: "#3B82F6", label: "Locker" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color, boxShadow: `0 0 6px ${l.color}` }} />
                <span className="text-[10px] text-white/60">{l.label}</span>
              </div>
            ))}
          </div>

          {/* Center stat overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-7xl font-black text-white/5">{ordersToday.toLocaleString()}</div>
            <div className="text-xs text-white/20 uppercase tracking-widest">Total Orders Today</div>
          </div>
        </div>

        {/* PANEL 3 — LIVE ACTIVITY FEED (right) */}
        <div className="w-80 border-l border-white/10 bg-[#0D1B2A]/60 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Live Activity</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/40">{filteredFeed.length} events</span>
              <button
                onClick={() => setActivityPaused(!activityPaused)}
                className={`p-1 rounded transition-colors ${activityPaused ? "bg-orange/20 text-orange" : "bg-white/10 text-white/50 hover:bg-white/20"}`}
              >
                {activityPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
            {["all", "order", "delivery", "warehouse", "payment", "vendor", "alert"].map((f) => (
              <button
                key={f}
                onClick={() => setFeedFilter(f)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize transition-colors ${
                  feedFilter === f ? "bg-orange text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
            {filteredFeed.map((event) => (
              <div key={event.id} className="feed-item flex items-start gap-3 rounded-lg bg-white/5 px-3 py-2.5 hover:bg-white/10 transition-colors border border-white/5">
                <div className="text-sm mt-0.5 flex-shrink-0">{event.type === "order" ? "🛒" : event.type === "delivery" ? "✅" : event.type === "warehouse" ? "📦" : event.type === "payment" ? "💳" : event.type === "vendor" ? "🏪" : "🔴"}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/80 truncate">{event.message}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{event.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PANEL 5 — ALERT CENTER (bottom) */}
      <div className="border-t border-white/10 bg-[#0D1B2A]/90 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-3.5 w-3.5 text-yellow" />
          <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Alert Center</h3>
          <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red">{alerts.filter((a) => a.severity === "critical").length} Critical</span>
          <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold text-yellow">{alerts.filter((a) => a.severity === "warning").length} Warning</span>
          <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue">{alerts.filter((a) => a.severity === "info").length} Info</span>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {alerts.map((alert) => {
            const cfg = severityConfig[alert.severity];
            return (
              <div key={alert.id} className={`rounded-lg border ${cfg.bg} ${cfg.border} px-4 py-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                  <span className="text-xs font-bold text-white">{alert.title}</span>
                </div>
                <div className="text-[11px] text-white/50">{alert.desc}</div>
                <div className="text-[10px] text-white/30 mt-1">{alert.time}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
