"use client";

import { useState, useEffect } from "react";
import {
  Warehouse, Box, Users, Clock, ArrowUpRight, ArrowDownRight,
  Thermometer, Eye, EyeOff, BarChart3, AlertTriangle,
  CheckCircle, Package, Truck, RefreshCw, Maximize2, Grid3X3,
  Layers, Search, Filter,
} from "lucide-react";

const warehouses = [
  { id: "LOS-01", name: "Lagos Main Hub", city: "Lagos", lat: 6.5244, lng: 3.3792, zones: 12, capacity: 15000, current: 11247, staff: 89, picksPerHr: 1247, status: "operational" },
  { id: "LOS-02", name: "Lagos Express Center", city: "Lagos", lat: 6.4654, lng: 3.4064, zones: 8, capacity: 8000, current: 5234, staff: 45, picksPerHr: 892, status: "operational" },
  { id: "ABJ-01", name: "Abuja Central Hub", city: "Abuja", lat: 9.0579, lng: 7.4951, zones: 10, capacity: 12000, current: 8901, staff: 67, picksPerHr: 1034, status: "operational" },
  { id: "PHC-01", name: "Port Harcourt Hub", city: "PH", lat: 4.8156, lng: 7.0498, zones: 6, capacity: 6000, current: 4523, staff: 38, picksPerHr: 678, status: "operational" },
  { id: "KAN-01", name: "Kano Distribution Hub", city: "Kano", lat: 12.0022, lng: 7.9940, zones: 5, capacity: 5000, current: 3200, staff: 28, picksPerHr: 456, status: "operational" },
];

const zones = [
  { id: "A1", name: "Zone A1", type: "inbound", activity: 45, temp: "22°C", humidity: "55%", items: 1247 },
  { id: "A2", name: "Zone A2", type: "inbound", activity: 32, temp: "23°C", humidity: "52%", items: 987 },
  { id: "B1", name: "Zone B1", type: "storage", activity: 18, temp: "21°C", humidity: "48%", items: 3456 },
  { id: "B2", name: "Zone B2", type: "storage", activity: 22, temp: "20°C", humidity: "50%", items: 2890 },
  { id: "B3", name: "Zone B3", type: "storage", activity: 15, temp: "22°C", humidity: "47%", items: 2100 },
  { id: "C1", name: "Zone C1", type: "picking", activity: 78, temp: "23°C", humidity: "45%", items: 567 },
  { id: "C2", name: "Zone C2", type: "picking", activity: 82, temp: "24°C", humidity: "44%", items: 432 },
  { id: "D1", name: "Zone D1", type: "packing", activity: 65, temp: "22°C", humidity: "46%", items: 345 },
  { id: "D2", name: "Zone D2", type: "packing", activity: 71, temp: "23°C", humidity: "45%", items: 278 },
  { id: "E1", name: "Zone E1", type: "outbound", activity: 56, temp: "21°C", humidity: "50%", items: 156 },
  { id: "E2", name: "Zone E2", type: "outbound", activity: 48, temp: "22°C", humidity: "49%", items: 123 },
  { id: "F1", name: "Zone F1", type: "returns", activity: 12, temp: "20°C", humidity: "52%", items: 89 },
];

const zoneTypeConfig: Record<string, { color: string; bg: string }> = {
  inbound: { color: "text-blue", bg: "bg-blue/10" },
  storage: { color: "text-white/60", bg: "bg-white/5" },
  picking: { color: "text-orange", bg: "bg-orange/10" },
  packing: { color: "text-purple-400", bg: "bg-purple-400/10" },
  outbound: { color: "text-green", bg: "bg-green/10" },
  returns: { color: "text-yellow", bg: "bg-yellow/10" },
};

const inventoryHotspots = [
  { zone: "C1", item: "Hikvision DVR Kit", sku: "HK-DVR-4CH", qty: 1247, velocity: "high", color: "bg-red" },
  { zone: "B1", item: "Solar Panel 200W", sku: "SP-200W-01", qty: 890, velocity: "medium", color: "bg-yellow" },
  { zone: "A2", item: "Access Control Board", sku: "AC-BOARD-V2", qty: 2340, velocity: "high", color: "bg-red" },
  { zone: "C2", item: "LED Floodlight 50W", sku: "LED-FL-50W", qty: 567, velocity: "medium", color: "bg-yellow" },
  { zone: "D1", item: "Deep Cycle Battery", sku: "DCB-100AH", qty: 345, velocity: "low", color: "bg-green" },
  { zone: "E1", item: "Life Jacket Adult", sku: "LJ-ADULT-01", qty: 156, velocity: "high", color: "bg-red" },
];

const recentActivity = [
  { id: 1, type: "inbound", message: "Shipment received: 240 units from vendor TechPro", time: "2m ago", zone: "A1", icon: ArrowDownRight, color: "text-blue" },
  { id: 2, type: "pick", message: "Pick task #PKT-4521 completed — 3 items", time: "4m ago", zone: "C1", icon: CheckCircle, color: "text-green" },
  { id: 3, type: "pack", message: "Pack task #PKT-4522 in progress — 5 items", time: "6m ago", zone: "D1", icon: Package, color: "text-orange" },
  { id: 4, type: "outbound", message: "Dispatch ready: 45 orders for express delivery", time: "8m ago", zone: "E1", icon: Truck, color: "text-purple-400" },
  { id: 5, type: "alert", message: "Zone C1 capacity at 87% — nearing threshold", time: "10m ago", zone: "C1", icon: AlertTriangle, color: "text-yellow" },
  { id: 6, type: "inbound", message: "Inbound scan: 180 units from supplier GlobalTech", time: "12m ago", zone: "A2", icon: ArrowDownRight, color: "text-blue" },
  { id: 7, type: "pick", message: "Batch pick started — 12 orders, Zone C2", time: "15m ago", zone: "C2", icon: Box, color: "text-orange" },
  { id: 8, type: "returns", message: "Return processed: 3 items restocked to Zone B1", time: "18m ago", zone: "F1", icon: RefreshCw, color: "text-yellow" },
];

export default function LiveWarehousePage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState(warehouses[0]);
  const [viewMode, setViewMode] = useState<"floorplan" | "comparison">("floorplan");
  const [showInventoryHeat, setShowInventoryHeat] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const wh = selectedWarehouse;
  const capacityPct = Math.round((wh.current / wh.capacity) * 100);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-gray-900/80 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green animate-pulse" />
              <span className="text-xs font-medium text-green uppercase tracking-wider">Live</span>
            </div>
            <h1 className="text-sm font-bold text-white">Live Warehouse Intelligence</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Clock className="h-3.5 w-3.5" />
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-white/5 p-0.5">
              <button
                onClick={() => setViewMode("floorplan")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === "floorplan" ? "bg-orange text-white" : "text-white/50 hover:text-white"}`}
              >
                <Grid3X3 className="inline h-3 w-3 mr-1" />
                Floor Plan
              </button>
              <button
                onClick={() => setViewMode("comparison")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === "comparison" ? "bg-orange text-white" : "text-white/50 hover:text-white"}`}
              >
                <Layers className="inline h-3 w-3 mr-1" />
                Comparison
              </button>
            </div>
            <button
              onClick={() => setShowInventoryHeat(!showInventoryHeat)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                showInventoryHeat ? "bg-red/20 text-red border border-red/30" : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              <Thermometer className="h-3 w-3" />
              Inventory Heatmap
            </button>
          </div>
        </div>
      </div>

      {/* Warehouse Selector */}
      <div className="border-b border-white/10 bg-gray-900/40 px-6 py-2 flex items-center gap-3">
        {warehouses.map((w) => {
          const pct = Math.round((w.current / w.capacity) * 100);
          return (
            <button
              key={w.id}
              onClick={() => setSelectedWarehouse(w)}
              className={`flex items-center gap-3 rounded-lg px-4 py-2 text-xs transition-colors ${
                selectedWarehouse.id === w.id ? "bg-white/10 text-white border border-white/20" : "text-white/40 hover:bg-white/5"
              }`}
            >
              <Warehouse className="h-3.5 w-3.5" />
              <div className="text-left">
                <div className="font-medium">{w.name}</div>
                <div className="text-[10px] text-white/40">{w.id} — {pct}% full</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex h-[calc(100vh-150px)]">
        {viewMode === "floorplan" ? (
          <>
            {/* Floor Plan */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Stats bar */}
              <div className="grid grid-cols-5 gap-3 mb-6">
                {[
                  { label: "Capacity", value: `${capacityPct}%`, sub: `${wh.current.toLocaleString()}/${wh.capacity.toLocaleString()}`, color: capacityPct > 85 ? "text-red" : capacityPct > 70 ? "text-yellow" : "text-green" },
                  { label: "Active Zones", value: `${wh.zones}`, sub: "all operational", color: "text-green" },
                  { label: "Staff Online", value: `${wh.staff}`, sub: "floor + admin", color: "text-blue" },
                  { label: "Picks/hr", value: `${wh.picksPerHr}`, sub: "above SLA", color: "text-orange" },
                  { label: "Temperature", value: "22°C", sub: "all zones nominal", color: "text-cyan-400" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</div>
                    <div className={`text-xl font-bold ${stat.color} mt-1`}>{stat.value}</div>
                    <div className="text-[10px] text-white/30 mt-0.5">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Floor plan grid */}
              <div className="rounded-xl bg-gray-900/60 border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">
                    {wh.name} — Floor Plan
                  </h3>
                  <div className="flex items-center gap-3">
                    {Object.entries(zoneTypeConfig).map(([type, cfg]) => (
                      <div key={type} className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-sm ${cfg.bg}`} />
                        <span className="text-[10px] text-white/40 capitalize">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Zone grid */}
                <div className="grid grid-cols-4 gap-3">
                  {zones.map((zone) => {
                    const cfg = zoneTypeConfig[zone.type];
                    const isSelected = selectedZone === zone.id;
                    const heatLevel = zone.activity > 70 ? "high" : zone.activity > 30 ? "medium" : "low";
                    return (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedZone(isSelected ? null : zone.id)}
                        className={`relative rounded-xl border p-4 cursor-pointer transition-all ${
                          isSelected ? "border-orange bg-orange/5 scale-105" : "border-white/10 bg-white/5 hover:bg-white/8"
                        }`}
                      >
                        {showInventoryHeat && (
                          <div
                            className={`absolute top-2 right-2 h-2 w-2 rounded-full ${
                              heatLevel === "high" ? "bg-red animate-pulse" : heatLevel === "medium" ? "bg-yellow" : "bg-green"
                            }`}
                          />
                        )}
                        <div className="text-xs font-bold text-white">{zone.id}</div>
                        <div className="text-[10px] text-white/50 mt-0.5">{zone.name}</div>
                        <div className={`inline-block mt-2 rounded px-1.5 py-0.5 text-[9px] font-medium ${cfg.bg} ${cfg.color}`}>
                          {zone.type}
                        </div>
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-white/30">Activity</span>
                            <span className="text-white/70">{zone.activity}%</span>
                          </div>
                          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                zone.activity > 70 ? "bg-red" : zone.activity > 30 ? "bg-yellow" : "bg-green"
                              }`}
                              style={{ width: `${zone.activity}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-white/30">Items</span>
                            <span className="text-white/70">{zone.items.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-white/30">Temp</span>
                            <span className="text-white/70">{zone.temp}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inventory Hotspots */}
              <div className="mt-6 rounded-xl bg-gray-900/60 border border-white/10 p-6">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Inventory Hotspots</h3>
                <div className="grid grid-cols-3 gap-3">
                  {inventoryHotspots.map((item) => (
                    <div key={item.sku} className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white truncate">{item.item}</div>
                        <div className="text-[10px] text-white/40">{item.sku} — Zone {item.zone}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-white">{item.qty.toLocaleString()}</div>
                        <div className={`text-[10px] ${item.velocity === "high" ? "text-red" : item.velocity === "medium" ? "text-yellow" : "text-green"}`}>
                          {item.velocity} velocity
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar — Activity */}
            <div className="w-80 border-l border-white/10 bg-gray-900/40 p-4 overflow-y-auto">
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Live Activity</h3>
              <div className="space-y-2">
                {recentActivity.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 rounded-lg bg-white/5 px-3 py-2.5">
                    <event.icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${event.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white/80">{event.message}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-white/30">{event.time}</span>
                        <span className="text-[10px] text-white/20">Zone {event.zone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Comparison View */
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 gap-4">
              {warehouses.map((w) => {
                const pct = Math.round((w.current / w.capacity) * 100);
                return (
                  <div key={w.id} className={`rounded-xl border p-5 transition-all ${selectedWarehouse.id === w.id ? "border-orange bg-orange/5" : "border-white/10 bg-white/5"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Warehouse className="h-5 w-5 text-orange" />
                        <div>
                          <div className="text-sm font-bold text-white">{w.name}</div>
                          <div className="text-[10px] text-white/40">{w.id} — {w.city}</div>
                        </div>
                      </div>
                      <div className={`text-2xl font-black ${pct > 85 ? "text-red" : pct > 70 ? "text-yellow" : "text-green"}`}>
                        {pct}%
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <div className="text-[10px] text-white/40">Capacity</div>
                        <div className="text-xs font-bold text-white">{w.current.toLocaleString()}/{w.capacity.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/40">Zones</div>
                        <div className="text-xs font-bold text-white">{w.zones}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/40">Staff</div>
                        <div className="text-xs font-bold text-white">{w.staff}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/40">Picks/hr</div>
                        <div className="text-xs font-bold text-orange">{w.picksPerHr.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/40">Status</div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green" />
                          <span className="text-xs font-medium text-green capitalize">{w.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct > 85 ? "bg-red" : pct > 70 ? "bg-yellow" : "bg-green"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
