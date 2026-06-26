"use client";

import { useState, useEffect } from "react";
import {
  MapPin, Users, Truck, Package, Warehouse, Lock,
  Eye, EyeOff, Clock, Play, Pause, FastForward,
  Layers, ZoomIn, ZoomOut, Maximize2, RefreshCw,
  Radio, TrendingUp, AlertTriangle, Navigation, Search,
  Building, Construction, BarChart3, Thermometer,
} from "lucide-react";

const partnerDots = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  name: `Partner-${String(i + 1).padStart(3, "0")}`,
  x: 12 + Math.random() * 76,
  y: 8 + Math.random() * 84,
  tier: ["new", "verified", "trusted", "premium"][Math.floor(Math.random() * 4)] as string,
  status: Math.random() > 0.2 ? "active" : "idle",
  orders: Math.floor(Math.random() * 20),
}));

const activeJobs = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: 15 + Math.random() * 70,
  y: 12 + Math.random() * 76,
  targetX: 20 + Math.random() * 60,
  targetY: 15 + Math.random() * 70,
  status: ["pickup", "in_transit", "delivery"][Math.floor(Math.random() * 3)] as string,
  orderId: `ORD-${80000 + i}`,
  partner: partnerDots[Math.floor(Math.random() * partnerDots.length)].name,
}));

const availableJobs = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: 18 + Math.random() * 65,
  y: 10 + Math.random() * 80,
  orderId: `ORD-${85000 + i}`,
  value: Math.floor(Math.random() * 50000) + 5000,
}));

const hubLocations = [
  { id: 1, name: "Lagos Hub", x: 32, y: 58, capacity: 1200, current: 847, type: "hub" },
  { id: 2, name: "Abuja Hub", x: 44, y: 34, capacity: 800, current: 512, type: "hub" },
  { id: 3, name: "Port Harcourt Hub", x: 56, y: 52, capacity: 600, current: 389, type: "hub" },
  { id: 4, name: "Kano Hub", x: 38, y: 18, capacity: 400, current: 267, type: "hub" },
];

const warehouseLocations = [
  { id: 1, name: "LOS-01 Main", x: 30, y: 56, capacity: 15000, current: 11247, type: "warehouse" },
  { id: 2, name: "LOS-02 Express", x: 34, y: 60, capacity: 8000, current: 5234, type: "warehouse" },
  { id: 3, name: "ABJ-01 Central", x: 46, y: 36, capacity: 12000, current: 8901, type: "warehouse" },
  { id: 4, name: "PHC-01", x: 58, y: 50, capacity: 6000, current: 4523, type: "warehouse" },
];

const lockerLocations = [
  { id: 1, name: "LAG-LKR-01", x: 28, y: 57, occupancy: 92 },
  { id: 2, name: "LAG-LKR-02", x: 35, y: 54, occupancy: 67 },
  { id: 3, name: "ABJ-LKR-01", x: 43, y: 33, occupancy: 78 },
  { id: 4, name: "PHC-LKR-01", x: 55, y: 49, occupancy: 45 },
  { id: 5, name: "KAN-LKR-01", x: 37, y: 17, occupancy: 34 },
];

const tierConfig: Record<string, { color: string; label: string; ring: string }> = {
  new: { color: "bg-gray-400", label: "New", ring: "ring-gray-400/30" },
  verified: { color: "bg-blue-500", label: "Verified", ring: "ring-blue-500/30" },
  trusted: { color: "bg-green", label: "Trusted", ring: "ring-green/30" },
  premium: { color: "bg-yellow", label: "Premium", ring: "ring-yellow/30" },
};

const jobStatusConfig: Record<string, { color: string; label: string }> = {
  pickup: { color: "bg-blue", label: "Pickup" },
  in_transit: { color: "bg-orange", label: "In Transit" },
  delivery: { color: "bg-purple-500", label: "Delivery" },
};

const layers = [
  { id: "partners", label: "Partners", icon: Users, defaultOn: true },
  { id: "activeJobs", label: "Active Jobs", icon: Truck, defaultOn: true },
  { id: "availableJobs", label: "Available Jobs", icon: Package, defaultOn: true },
  { id: "hubs", label: "Hubs", icon: Warehouse, defaultOn: true },
  { id: "warehouses", label: "Warehouses", icon: Building, defaultOn: true },
  { id: "lockers", label: "Lockers", icon: Lock, defaultOn: true },
  { id: "traffic", label: "Traffic", icon: Construction, defaultOn: false },
];

export default function LiveLogisticsPage() {
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(
    Object.fromEntries(layers.map((l) => [l.id, l.defaultOn]))
  );
  const [timeMode, setTimeMode] = useState<"live" | "replay" | "forecast">("live");
  const [selectedPartner, setSelectedPartner] = useState<number | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleLayer = (id: string) => setActiveLayers((p) => ({ ...p, [id]: !p[id] }));

  const activePartnerCount = partnerDots.filter((p) => p.status === "active").length;
  const activeJobCount = activeJobs.length;
  const availableJobCount = availableJobs.length;

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      <style jsx global>{`
        @keyframes pulse-available {
          0%, 100% { opacity: 0.5; transform: scale(1); box-shadow: 0 0 0 0 rgba(255,107,0,0.4); }
          50% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 20px 5px rgba(255,107,0,0.2); }
        }
        @keyframes move-job {
          0% { transform: translate(0, 0); }
          50% { transform: translate(3px, -2px); }
          100% { transform: translate(0, 0); }
        }
        .job-moving { animation: move-job 3s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="border-b border-white/10 bg-[#0D1B2A]/90 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green animate-pulse" />
              <span className="text-xs font-medium text-green uppercase tracking-wider">Live</span>
            </div>
            <h1 className="text-sm font-bold text-white">Live Logistics Intelligence Map</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Clock className="h-3.5 w-3.5" />
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-white/5 p-0.5">
              {(["live", "replay", "forecast"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTimeMode(mode)}
                  className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${
                    timeMode === mode ? "bg-orange text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  {mode === "live" && <Radio className="inline h-3 w-3 mr-1" />}
                  {mode === "replay" && <Play className="inline h-3 w-3 mr-1" />}
                  {mode === "forecast" && <TrendingUp className="inline h-3 w-3 mr-1" />}
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs">
            <Users className="h-3.5 w-3.5 text-blue" />
            <span className="text-white/50">Partners:</span>
            <span className="font-bold text-blue">{activePartnerCount}</span>
            <span className="text-white/30">active</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Truck className="h-3.5 w-3.5 text-orange" />
            <span className="text-white/50">Jobs:</span>
            <span className="font-bold text-orange">{activeJobCount}</span>
            <span className="text-white/30">in progress</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Package className="h-3.5 w-3.5 text-yellow" />
            <span className="text-white/50">Available:</span>
            <span className="font-bold text-yellow">{availableJobCount}</span>
            <span className="text-white/30">unassigned</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Warehouse className="h-3.5 w-3.5 text-green" />
            <span className="text-white/50">Hubs:</span>
            <span className="font-bold text-green">{hubLocations.length}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Lock className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-white/50">Lockers:</span>
            <span className="font-bold text-cyan-400">{lockerLocations.length}</span>
          </div>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ml-auto ${
              showHeatmap ? "bg-red/20 text-red border border-red/30" : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            <Thermometer className="h-3 w-3" />
            Demand Heatmap
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-110px)]">
        {/* Layers Panel */}
        <div className="w-56 border-r border-white/10 bg-[#0D1B2A]/60 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-4 w-4 text-white/50" />
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Map Layers</h3>
          </div>
          <div className="space-y-1.5">
            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`flex items-center gap-3 w-full rounded-lg px-3 py-2 text-xs transition-colors ${
                  activeLayers[layer.id] ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5"
                }`}
              >
                {activeLayers[layer.id] ? <Eye className="h-3.5 w-3.5 text-orange" /> : <EyeOff className="h-3.5 w-3.5" />}
                <layer.icon className="h-3.5 w-3.5" />
                <span>{layer.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Partner Tiers</h4>
            <div className="space-y-2">
              {Object.entries(tierConfig).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${cfg.color}`} />
                  <span className="text-[11px] text-white/60">{cfg.label}</span>
                  <span className="text-[10px] text-white/30 ml-auto">
                    {partnerDots.filter((p) => p.tier === key).length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Job Status</h4>
            <div className="space-y-2">
              {Object.entries(jobStatusConfig).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${cfg.color}`} />
                  <span className="text-[11px] text-white/60">{cfg.label}</span>
                  <span className="text-[10px] text-white/30 ml-auto">
                    {activeJobs.filter((j) => j.status === key).length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Summary</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between"><span className="text-white/40">Total Partners</span><span className="text-white/70">{partnerDots.length}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Active Partners</span><span className="text-green">{activePartnerCount}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Active Jobs</span><span className="text-orange">{activeJobCount}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Available Jobs</span><span className="text-yellow">{availableJobCount}</span></div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/50">
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-orange rounded-full transition-all" style={{ width: `${((zoom - 0.5) / 1.5) * 100}%` }} />
              </div>
              <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/50">
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative overflow-hidden bg-[#060E1A]">
          {/* Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="loggrid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#loggrid)" />
          </svg>

          <div className="absolute inset-0" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
            {/* Heatmap overlay */}
            {showHeatmap && (
              <div className="absolute inset-0 pointer-events-none">
                {[
                  { x: 30, y: 55, r: 140, color: "rgba(255,107,0,0.18)" },
                  { x: 45, y: 35, r: 110, color: "rgba(255,107,0,0.12)" },
                  { x: 56, y: 50, r: 90, color: "rgba(255,107,0,0.1)" },
                  { x: 38, y: 18, r: 70, color: "rgba(255,107,0,0.08)" },
                  { x: 65, y: 40, r: 60, color: "rgba(255,107,0,0.06)" },
                ].map((h, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{ left: `${h.x}%`, top: `${h.y}%`, width: h.r, height: h.r, background: `radial-gradient(circle, ${h.color}, transparent)`, transform: "translate(-50%, -50%)" }}
                  />
                ))}
              </div>
            )}

            {/* Hub locations — navy square markers */}
            {activeLayers.hubs && hubLocations.map((hub) => (
              <div key={hub.id} className="absolute group cursor-pointer" style={{ left: `${hub.x}%`, top: `${hub.y}%`, transform: "translate(-50%, -50%)" }}>
                <div className="relative">
                  <div className="h-8 w-8 rounded bg-[#0A1628] border-2 border-orange flex items-center justify-center">
                    <Warehouse className="h-4 w-4 text-orange" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green animate-pulse" />
                </div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 w-48 rounded-lg bg-[#0A1628] border border-white/10 p-3 shadow-xl">
                  <div className="text-xs font-bold text-white">{hub.name}</div>
                  <div className="text-[10px] text-white/50 mt-1">Capacity: {hub.current.toLocaleString()}/{hub.capacity.toLocaleString()}</div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-orange rounded-full" style={{ width: `${(hub.current / hub.capacity) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}

            {/* Warehouse locations — building icons */}
            {activeLayers.warehouses && warehouseLocations.map((wh) => (
              <div key={`wh-${wh.id}`} className="absolute group cursor-pointer" style={{ left: `${wh.x}%`, top: `${wh.y}%`, transform: "translate(-50%, -50%)" }}>
                <div className="h-6 w-6 rounded bg-[#0A1628] border border-blue/40 flex items-center justify-center">
                  <Building className="h-3.5 w-3.5 text-blue" />
                </div>
                <div className="absolute top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 w-44 rounded-lg bg-[#0A1628] border border-white/10 p-2 shadow-xl">
                  <div className="text-[10px] font-bold text-white">{wh.name}</div>
                  <div className="text-[10px] text-white/50">Capacity: {wh.current.toLocaleString()}/{wh.capacity.toLocaleString()}</div>
                </div>
              </div>
            ))}

            {/* Locker locations */}
            {activeLayers.lockers && lockerLocations.map((locker) => (
              <div key={locker.id} className="absolute group cursor-pointer" style={{ left: `${locker.x}%`, top: `${locker.y}%`, transform: "translate(-50%, -50%)" }}>
                <div className="h-5 w-5 rounded bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center">
                  <Lock className="h-3 w-3 text-cyan-400" />
                </div>
                <div className="absolute top-7 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 w-40 rounded-lg bg-[#0A1628] border border-white/10 p-2 shadow-xl">
                  <div className="text-[10px] font-bold text-white">{locker.name}</div>
                  <div className="text-[10px] text-white/50">Occupancy: {locker.occupancy}%</div>
                  <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${locker.occupancy > 85 ? "bg-red" : locker.occupancy > 60 ? "bg-yellow" : "bg-green"}`}
                      style={{ width: `${locker.occupancy}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Partner dots — color by tier */}
            {activeLayers.partners && partnerDots.map((partner) => (
              <div
                key={partner.id}
                className="absolute cursor-pointer"
                style={{ left: `${partner.x}%`, top: `${partner.y}%`, transform: "translate(-50%, -50%)" }}
                onClick={() => setSelectedPartner(selectedPartner === partner.id ? null : partner.id)}
              >
                <div className={`relative ${selectedPartner === partner.id ? "z-20" : ""}`}>
                  <div className={`h-3 w-3 rounded-full ${tierConfig[partner.tier].color} ${selectedPartner === partner.id ? "ring-2 ring-white scale-150" : `ring-2 ${tierConfig[partner.tier].ring}`} transition-all`} />
                  {partner.status === "active" && (
                    <div className={`absolute inset-0 h-3 w-3 rounded-full ${tierConfig[partner.tier].color} animate-ping opacity-40`} />
                  )}
                </div>
                {selectedPartner === partner.id && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-48 rounded-lg bg-[#0A1628] border border-white/10 p-3 shadow-xl">
                    <div className="text-xs font-bold text-white">{partner.name}</div>
                    <div className="text-[10px] text-white/50 mt-1">
                      Tier: <span className="text-white/80">{tierConfig[partner.tier].label}</span>
                    </div>
                    <div className="text-[10px] text-white/50">
                      Orders today: <span className="text-white/80">{partner.orders}</span>
                    </div>
                    <div className="text-[10px] text-white/50">
                      Status: <span className={partner.status === "active" ? "text-green" : "text-white/50"}>{partner.status}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Active jobs — moving dots with route lines */}
            {activeLayers.activeJobs && activeJobs.map((job) => (
              <div key={`job-${job.id}`}>
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ position: "absolute", left: 0, top: 0 }}>
                  <line
                    x1={`${job.x}%`} y1={`${job.y}%`}
                    x2={`${job.targetX}%`} y2={`${job.targetY}%`}
                    stroke="#FF6B00" strokeWidth="1" opacity="0.3" strokeDasharray="4 4"
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="1s" repeatCount="indefinite" />
                  </line>
                </svg>
                <div
                  className="absolute job-moving"
                  style={{ left: `${job.x}%`, top: `${job.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div className={`h-3 w-3 rounded-full ${jobStatusConfig[job.status].color} shadow-lg`} style={{ boxShadow: `0 0 8px ${job.status === "in_transit" ? "#FF6B00" : job.status === "pickup" ? "#3B82F6" : "#A855F7"}` }} />
                </div>
              </div>
            ))}

            {/* Available jobs — pulsing orange pins */}
            {activeLayers.availableJobs && availableJobs.map((job) => (
              <div
                key={`avail-${job.id}`}
                className="absolute cursor-pointer"
                style={{ left: `${job.x}%`, top: `${job.y}%`, transform: "translate(-50%, -50%)", animation: "pulse-available 2s ease-in-out infinite" }}
              >
                <div className="relative">
                  <div className="h-4 w-4 rounded-full bg-orange border-2 border-white/30" />
                  <div className="absolute inset-0 h-4 w-4 rounded-full bg-orange animate-ping opacity-30" />
                </div>
              </div>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="h-8 w-8 rounded bg-[#0A1628]/90 border border-white/10 flex items-center justify-center text-white/50 hover:text-white">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="h-8 w-8 rounded bg-[#0A1628]/90 border border-white/10 flex items-center justify-center text-white/50 hover:text-white">
              <ZoomOut className="h-4 w-4" />
            </button>
            <button onClick={() => setZoom(1)} className="h-8 w-8 rounded bg-[#0A1628]/90 border border-white/10 flex items-center justify-center text-white/50 hover:text-white">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Time controls overlay */}
          <div className="absolute top-4 right-4 z-10 rounded-lg bg-[#0A1628]/90 border border-white/10 p-3">
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Timeline</div>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50">
                <Play className="h-3 w-3" />
              </button>
              <button className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50">
                <Pause className="h-3 w-3" />
              </button>
              <button className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50">
                <FastForward className="h-3 w-3" />
              </button>
              <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-orange rounded-full" style={{ width: timeMode === "live" ? "100%" : timeMode === "replay" ? "65%" : "30%" }} />
              </div>
            </div>
            <div className="mt-2 text-[10px] text-white/30 text-center">
              {timeMode === "live" ? "Real-time tracking" : timeMode === "replay" ? "Last 24h replay" : "Next 6h forecast"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
