"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Globe, Package, Truck, Users, Clock, Zap, Activity,
  AlertTriangle, AlertCircle, CheckCircle, Pause, Play,
  RotateCcw, Maximize2, Radio, TrendingUp, ArrowUpRight,
  ArrowDownRight, DollarSign, Server, Box, Eye, BarChart3,
  MapPin, RefreshCw, Shield, Wifi, Battery, Signal,
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

const worldDots = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  type: ["order", "delivery", "partner"][Math.floor(Math.random() * 3)] as string,
  speed: Math.random() * 2 + 1,
}));

const activityEvents = [
  { id: 1, type: "order", message: "New order #ORD-89412 from Lagos", time: "12s ago", icon: Package, color: "text-orange" },
  { id: 2, type: "delivery", message: "Delivered #WB-EX-10234 to Abuja", time: "28s ago", icon: CheckCircle, color: "text-green" },
  { id: 3, type: "partner", message: "Partner Kwik-NG021 came online", time: "45s ago", icon: Wifi, color: "text-blue" },
  { id: 4, type: "alert", message: "High demand spike in PH region", time: "1m ago", icon: AlertTriangle, color: "text-yellow" },
  { id: 5, type: "order", message: "Bulk order #ORD-89413 — ₦2.4M", time: "1m ago", icon: Package, color: "text-orange" },
  { id: 6, type: "warehouse", message: "Warehouse LOS-01 pick rate at 94%", time: "2m ago", icon: Box, color: "text-green" },
  { id: 7, type: "delivery", message: "Rider assigned #WB-EX-10240", time: "2m ago", icon: Truck, color: "text-blue" },
  { id: 8, type: "partner", message: "Premium partner DHL-NG joined queue", time: "3m ago", icon: Users, color: "text-purple-400" },
  { id: 9, type: "alert", message: "Locker LAG-05 occupancy at 98%", time: "3m ago", icon: AlertCircle, color: "text-red" },
  { id: 10, type: "order", message: "International order #ORD-89415 to UK", time: "4m ago", icon: Globe, color: "text-orange" },
  { id: 11, type: "delivery", message: "Failed delivery attempt #WB-EX-10228", time: "5m ago", icon: AlertTriangle, color: "text-yellow" },
  { id: 12, type: "warehouse", message: "Inbound shipment received WH-ABJ-02", time: "5m ago", icon: Box, color: "text-green" },
];

const alerts = [
  { id: 1, severity: "critical", title: "Locker LAG-05 at 98% capacity", desc: "Redirect deliveries to LAG-06 or LAG-07", time: "3m ago" },
  { id: 2, severity: "warning", title: "Demand spike: Port Harcourt +340%", desc: "Activate surge routing for PH region", time: "1m ago" },
  { id: 3, severity: "info", title: "DHL Express API latency elevated", desc: "Avg response 4.2s (normal < 1s). Monitoring.", time: "6m ago" },
  { id: 4, severity: "warning", title: "WH-ABJ-02 pick rate dropped to 67%", desc: "Below SLA threshold of 85%", time: "8m ago" },
];

const severityConfig: Record<string, { bg: string; border: string; icon: React.ElementType }> = {
  critical: { bg: "bg-red-900/30", border: "border-red-500/50", icon: AlertCircle },
  warning: { bg: "bg-yellow-900/30", border: "border-yellow-500/50", icon: AlertTriangle },
  info: { bg: "bg-blue-900/30", border: "border-blue-500/50", icon: AlertCircle },
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
  const [revenuePerMin, setRevenuePerMin] = useState(3280);
  const [activityPaused, setActivityPaused] = useState(false);
  const [feed, setFeed] = useState(activityEvents);
  const [replayMode, setReplayMode] = useState(false);
  const [selectedDot, setSelectedDot] = useState<number | null>(null);

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
      setRevenuePerMin((p) => Math.max(1500, p + Math.floor(Math.random() * 400) - 200));
    }, 2000);
    return () => clearInterval(interval);
  }, [activityPaused]);

  const addEvent = useCallback(() => {
    const types = [
      { type: "order", message: `New order #ORD-${89500 + Math.floor(Math.random() * 500)}`, icon: Package, color: "text-orange" },
      { type: "delivery", message: `Delivered #WB-EX-${10300 + Math.floor(Math.random() * 200)}`, icon: CheckCircle, color: "text-green" },
      { type: "partner", message: `Partner online: ${["GIG", "Kwik", "DHL", "FedEx"][Math.floor(Math.random() * 4)]}-${Math.floor(Math.random() * 999)}`, icon: Wifi, color: "text-blue" },
    ];
    const pick = types[Math.floor(Math.random() * types.length)];
    setFeed((prev) => [{ id: Date.now(), ...pick, time: "now" }, ...prev].slice(0, 20));
  }, []);

  useEffect(() => {
    if (activityPaused) return;
    const interval = setInterval(addEvent, 5000);
    return () => clearInterval(interval);
  }, [activityPaused, addEvent]);

  const throughputGauges = [
    { label: "Orders/min", value: ordersPerMin, max: 80, color: "#FF6B00", suffix: "" },
    { label: "Deliveries/hr", value: deliveriesPerHr, max: 3000, color: "#22C55E", suffix: "" },
    { label: "Warehouse Picks/hr", value: warehousePicksPerHr, max: 8000, color: "#3B82F6", suffix: "" },
    { label: "Revenue/min", value: revenuePerMin, max: 6000, color: "#A855F7", prefix: "$" },
  ];

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Top Metrics Bar */}
      <div className="border-b border-white/10 bg-[#0D1B2A]/80 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center justify-between">
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
              {replayMode ? "Replay ON" : "Replay"}
            </button>
            <span className="text-xs text-white/50">{new Date().toLocaleTimeString()}</span>
            <Wifi className="h-4 w-4 text-green" />
            <Shield className="h-4 w-4 text-white/50" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-4">
          {[
            { label: "Orders Today", value: ordersToday, icon: Package, color: "text-orange" },
            { label: "Active Deliveries", value: activeDeliveries, icon: Truck, color: "text-green" },
            { label: "GMV", value: gmv, icon: DollarSign, color: "text-yellow", prefix: "$" },
            { label: "Partners Online", value: partnersOnline, icon: Users, color: "text-blue" },
            { label: "Express Bookings", value: expressBookings, icon: Zap, color: "text-purple-400" },
            { label: "Locker Occupancy", value: lockerOccupancy, icon: Box, color: "text-cyan-400", suffix: "%" },
            { label: "Uptime", value: uptime, icon: Server, color: "text-green", suffix: "%" },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-2.5">
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

      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Panel — Throughput Gauges */}
        <div className="w-64 border-r border-white/10 bg-[#0D1B2A]/60 p-4 flex flex-col gap-4 overflow-y-auto">
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Throughput</h3>
          {throughputGauges.map((g) => {
            const pct = Math.min(100, (g.value / g.max) * 100);
            return (
              <div key={g.label} className="rounded-lg bg-white/5 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider">{g.label}</span>
                  <span className="text-xs font-bold" style={{ color: g.color }}>
                    {g.prefix || ""}{g.value.toLocaleString()}{g.suffix || ""}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%`, backgroundColor: g.color }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[9px] text-white/30">
                  <span>0</span>
                  <span>{g.max.toLocaleString()}{g.suffix || ""}</span>
                </div>
              </div>
            );
          })}

          <div className="mt-auto rounded-lg bg-white/5 p-3">
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

        {/* Center Panel — World Map */}
        <div className="flex-1 relative overflow-hidden bg-[#060E1A]">
          {replayMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-lg bg-orange/20 border border-orange/40 px-4 py-2">
              <RotateCcw className="h-4 w-4 text-orange animate-spin" />
              <span className="text-xs font-bold text-orange">TIME-LAPSE REPLAY ACTIVE</span>
              <span className="text-[10px] text-orange/70">Speed: 10x</span>
            </div>
          )}

          {/* Grid background */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* World map outline placeholder */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="500" cy="250" rx="450" ry="200" fill="none" stroke="#FF6B00" strokeWidth="0.5" opacity="0.3" />
            <ellipse cx="500" cy="250" rx="300" ry="150" fill="none" stroke="#FF6B00" strokeWidth="0.3" opacity="0.2" />
            <ellipse cx="500" cy="250" rx="150" ry="80" fill="none" stroke="#FF6B00" strokeWidth="0.3" opacity="0.15" />
            <line x1="50" y1="250" x2="950" y2="250" stroke="#FF6B00" strokeWidth="0.3" opacity="0.15" />
            <line x1="500" y1="50" x2="500" y2="450" stroke="#FF6B00" strokeWidth="0.3" opacity="0.15" />
          </svg>

          {/* Animated dots */}
          {worldDots.map((dot) => (
            <div
              key={dot.id}
              className={`absolute rounded-full cursor-pointer transition-all duration-300 ${
                selectedDot === dot.id ? "ring-2 ring-white scale-150" : ""
              }`}
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                width: dot.size,
                height: dot.size,
                backgroundColor: dot.type === "order" ? "#FF6B00" : dot.type === "delivery" ? "#22C55E" : "#3B82F6",
                boxShadow: `0 0 ${dot.size * 3}px ${dot.type === "order" ? "#FF6B00" : dot.type === "delivery" ? "#22C55E" : "#3B82F6"}`,
                animation: `pulse ${dot.speed}s ease-in-out infinite`,
              }}
              onClick={() => setSelectedDot(selectedDot === dot.id ? null : dot.id)}
            />
          ))}

          {/* Map legend */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 rounded-lg bg-[#0A1628]/90 border border-white/10 px-4 py-2">
            {[
              { color: "#FF6B00", label: "Orders" },
              { color: "#22C55E", label: "Deliveries" },
              { color: "#3B82F6", label: "Partners" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-[10px] text-white/60">{l.label}</span>
              </div>
            ))}
          </div>

          {/* Connection lines (decorative) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <line x1="25%" y1="45%" x2="55%" y2="35%" stroke="#FF6B00" strokeWidth="0.5" opacity="0.2" strokeDasharray="4 4">
              <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="1s" repeatCount="indefinite" />
            </line>
            <line x1="55%" y1="35%" x2="72%" y2="50%" stroke="#22C55E" strokeWidth="0.5" opacity="0.2" strokeDasharray="4 4">
              <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="1.2s" repeatCount="indefinite" />
            </line>
            <line x1="30%" y1="60%" x2="60%" y2="55%" stroke="#3B82F6" strokeWidth="0.5" opacity="0.2" strokeDasharray="4 4">
              <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="0.8s" repeatCount="indefinite" />
            </line>
          </svg>

          {/* Center stat overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-6xl font-black text-white/5">{ordersToday.toLocaleString()}</div>
            <div className="text-xs text-white/20 uppercase tracking-widest">Total Orders Today</div>
          </div>
        </div>

        {/* Right Panel — Activity Feed */}
        <div className="w-80 border-l border-white/10 bg-[#0D1B2A]/60 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Live Activity</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/40">{feed.length} events</span>
              <button
                onClick={() => setActivityPaused(!activityPaused)}
                className={`p-1 rounded transition-colors ${activityPaused ? "bg-orange/20 text-orange" : "bg-white/10 text-white/50 hover:bg-white/20"}`}
              >
                {activityPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
            {feed.map((event) => (
              <div key={event.id} className="flex items-start gap-3 rounded-lg bg-white/5 px-3 py-2.5 hover:bg-white/10 transition-colors">
                <event.icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${event.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/80 truncate">{event.message}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{event.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Alert Center */}
      <div className="border-t border-white/10 bg-[#0D1B2A]/80 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-3.5 w-3.5 text-yellow" />
          <h3 className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Alert Center</h3>
          <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red">{alerts.filter((a) => a.severity === "critical").length} Critical</span>
          <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold text-yellow">{alerts.filter((a) => a.severity === "warning").length} Warning</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {alerts.map((alert) => {
            const cfg = severityConfig[alert.severity];
            return (
              <div key={alert.id} className={`rounded-lg border ${cfg.bg} ${cfg.border} px-4 py-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <cfg.icon className={`h-3.5 w-3.5 ${alert.severity === "critical" ? "text-red" : alert.severity === "warning" ? "text-yellow" : "text-blue"}`} />
                  <span className="text-xs font-bold text-white">{alert.title}</span>
                </div>
                <div className="text-[11px] text-white/50">{alert.desc}</div>
                <div className="text-[10px] text-white/30 mt-1">{alert.time}</div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
