"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search, Filter, ChevronDown, ChevronRight, XCircle, Truck, Package,
  CheckCircle2, AlertCircle, Layers, RotateCw, ZoomIn, ZoomOut,
  MapPin, Globe, Clock, Navigation, Bell, Plus, CircleDot, X,
  ChevronUp, Eye, Target, Fence, Activity,
} from "lucide-react";

interface Shipment {
  id: string;
  waybillNumber: string;
  status: string;
  statusLabel: string;
  progress: number;
  senderName: string;
  receiverName: string;
  pickupCity: string;
  dropoffCity: string;
  pickupCountry: string;
  dropoffCountry: string;
  contentsDescription: string;
  serviceLevel: string;
  tier: string;
  carrierUsed: string;
  currentLat: number;
  currentLng: number;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  distanceRemaining: number;
  totalDistance: number;
  hoursInTransit: number;
  eta: string;
  createdAt: string;
}

interface GeofenceAlert {
  id: string;
  alertName: string;
  triggerType: string;
  city: string | null;
  countryCode: string | null;
  radiusKm: number | null;
  latitude: number | null;
  longitude: number | null;
  triggered: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  transit: number;
  pickup: number;
  out_for_delivery: number;
  exception: number;
  avgEta: string;
}

const MAP_W = 1000;
const MAP_H = 500;

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * MAP_W;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = MAP_H / 2 - (mercN / Math.PI) * (MAP_H / 2) * 0.8;
  return { x: Math.max(10, Math.min(MAP_W - 10, x)), y: Math.max(10, Math.min(MAP_H - 10, y)) };
}

const STATUS_DOTS: Record<string, { color: string; animate: string }> = {
  transit: { color: "#3B82F6", animate: "pulse-blue" },
  pickup: { color: "#F59E0B", animate: "none" },
  out_for_delivery: { color: "#10B981", animate: "pulse-green" },
  exception: { color: "#EF4444", animate: "none" },
  international: { color: "#8B5CF6", animate: "none" },
  delivered: { color: "#6B7280", animate: "none" },
};

const WORLD_PATHS = [
  "M120,120 L135,105 L160,108 L180,95 L210,90 L240,95 L260,110 L250,130 L240,145 L225,155 L215,170 L200,180 L185,175 L170,165 L155,158 L140,150 L125,140 Z",
  "M260,110 L285,100 L310,105 L330,115 L345,130 L340,150 L320,165 L300,160 L280,150 L265,140 Z",
  "M340,150 L360,145 L385,155 L400,170 L395,195 L380,210 L365,200 L350,185 L340,170 Z",
  "M400,170 L420,160 L450,165 L480,180 L495,200 L490,230 L475,250 L455,240 L435,225 L415,210 L405,190 Z",
  "M500,195 L530,180 L565,175 L600,180 L630,195 L650,215 L640,240 L620,260 L595,255 L570,240 L545,230 L520,220 L505,210 Z",
  "M650,100 L680,90 L720,85 L760,95 L790,110 L800,135 L790,160 L770,175 L740,180 L710,170 L685,155 L665,140 L655,120 Z",
  "M790,230 L820,220 L855,225 L880,240 L890,265 L880,290 L860,300 L835,295 L810,280 L795,260 Z",
  "M165,285 L200,270 L240,275 L275,290 L290,315 L280,345 L260,360 L235,355 L210,340 L190,320 L170,305 Z",
  "M385,330 L420,320 L460,325 L495,340 L510,365 L500,395 L480,410 L450,405 L420,390 L400,370 L388,350 Z",
  "M750,330 L785,315 L825,320 L860,340 L875,370 L865,400 L840,415 L810,410 L780,395 L760,375 L752,355 Z",
  "M510,400 L550,390 L590,395 L625,410 L640,435 L630,460 L605,475 L575,470 L545,455 L525,435 L515,415 Z",
];

const TIER_FILTERS = ["all", "tier_1", "tier_2", "tier_3"];

export default function TrackingMapPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [geofenceAlerts, setGeofenceAlerts] = useState<GeofenceAlert[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, transit: 0, pickup: 0, out_for_delivery: 0, exception: 0, avgEta: "0h" });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [carrierFilter, setCarrierFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [clusterMode, setClusterMode] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGeofencePanel, setShowGeofencePanel] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [geofenceForm, setGeofenceForm] = useState({ alertName: "", triggerType: "city_entry", city: "", countryCode: "", radiusKm: 50 });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/express/tracking-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: null,
          filters: { status: statusFilter, serviceLevel: serviceFilter, carrier: carrierFilter, tier: tierFilter },
        }),
      });
      const data = await res.json();
      setShipments(data.shipments || []);
      setGeofenceAlerts(data.geofenceAlerts || []);
      setStats(data.stats || { total: 0, transit: 0, pickup: 0, out_for_delivery: 0, exception: 0, avgEta: "0h" });
    } catch {
      setShipments([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, serviceFilter, carrierFilter, tierFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = shipments.filter((s) => {
    if (search) {
      const q = search.toLowerCase();
      if (!s.waybillNumber.toLowerCase().includes(q) && !s.pickupCity.toLowerCase().includes(q) && !s.dropoffCity.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selected = shipments.find((s) => s.id === selectedId);

  const carriers = [...new Set(shipments.map((s) => s.carrierUsed))];
  const services = [...new Set(shipments.map((s) => s.serviceLevel))];

  const clusters = clusterMode
    ? Object.entries(
        filtered.reduce((acc: Record<string, { shipments: Shipment[]; lat: number; lng: number }>, s) => {
          const gridKey = `${Math.round(s.currentLat / 5) * 5},${Math.round(s.currentLng / 5) * 5}`;
          if (!acc[gridKey]) acc[gridKey] = { shipments: [], lat: 0, lng: 0 };
          acc[gridKey].shipments.push(s);
          acc[gridKey].lat += s.currentLat;
          acc[gridKey].lng += s.currentLng;
          return acc;
        }, {})
      ).map(([key, val]) => ({
        key,
        lat: val.lat / val.shipments.length,
        lng: val.lng / val.shipments.length,
        count: val.shipments.length,
        shipments: val.shipments,
      }))
    : [];

  const handleSvgMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element).closest(".map-bg")) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleSvgMouseUp = () => setIsDragging(false);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      <style>{`
        @keyframes pulse-blue {
          0%, 100% { r: 6; opacity: 1; }
          50% { r: 10; opacity: 0.6; }
        }
        @keyframes pulse-green {
          0%, 100% { r: 6; opacity: 1; }
          50% { r: 9; opacity: 0.7; }
        }
        @keyframes pulse-ring {
          0% { r: 12; opacity: 0.5; }
          100% { r: 20; opacity: 0; }
        }
        .dot-pulse-blue { animation: pulse-blue 2s ease-in-out infinite; }
        .dot-pulse-green { animation: pulse-green 1.5s ease-in-out infinite; }
        .dot-ring { animation: pulse-ring 2s ease-out infinite; }
        @media (max-width: 768px) {
          .map-sidebar { display: none; }
          .map-sidebar.mobile-open { display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; max-height: 60vh; border-radius: 16px 16px 0 0; box-shadow: 0 -4px 20px rgba(0,0,0,0.15); }
        }
      `}</style>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel - Shipment List */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col shrink-0 map-sidebar">
          <div className="p-4 border-b border-gray-200 space-y-3">
            <h3 className="text-sm font-bold text-[#0A1628] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#FF6B00]" />
              Active Shipments
              <span className="ml-auto text-xs font-normal text-gray-400">{filtered.length} total</span>
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search waybill, city..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
              />
            </div>
            <div className="flex gap-1.5">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]/30">
                <option value="all">All Status</option>
                <option value="in_transit">In Transit</option>
                <option value="picked_up">Pending Pickup</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="failed">Exception</option>
              </select>
              <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]/30">
                <option value="all">All Service</option>
                {services.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={carrierFilter} onChange={(e) => setCarrierFilter(e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]/30">
                <option value="all">All Carrier</option>
                {carriers.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                <RotateCw className="w-4 h-4 animate-spin mr-2" /> Loading shipments...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                <Package className="w-8 h-8 mb-2 opacity-50" />
                <p>No shipments found</p>
              </div>
            ) : (
              filtered.map((s) => {
                const dot = STATUS_DOTS[s.status] || STATUS_DOTS.transit;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(selectedId === s.id ? null : s.id)}
                    className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedId === s.id ? "bg-orange-50 border-l-2 border-l-[#FF6B00]" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#0A1628] font-mono">{s.waybillNumber}</span>
                      <span
                        className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                        style={{ backgroundColor: dot.color }}
                      >
                        {s.statusLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1.5">
                      <MapPin className="w-3 h-3" />
                      <span>{s.pickupCity}</span>
                      <ChevronRight className="w-3 h-3" />
                      <span>{s.dropoffCity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${s.progress}%`, backgroundColor: dot.color }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] text-gray-400">{s.carrierUsed}</span>
                      <span className="text-[10px] text-gray-600 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {s.hoursInTransit.toFixed(1)}h
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative overflow-hidden bg-[#0A1628]">
          {/* SVG Map */}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onMouseLeave={handleSvgMouseUp}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <defs>
              <radialGradient id="heatGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g transform={`translate(${pan.x / 2},${pan.y / 2}) scale(${zoom})`} style={{ transformOrigin: "center" }}>
              {/* Ocean background */}
              <rect className="map-bg" x="0" y="0" width={MAP_W} height={MAP_H} fill="#0A1628" />

              {/* Grid lines */}
              {Array.from({ length: 19 }, (_, i) => (
                <line key={`v${i}`} x1={i * 55} y1="0" x2={i * 55} y2={MAP_H} stroke="#1a2d47" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 10 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 55} x2={MAP_W} y2={i * 55} stroke="#1a2d47" strokeWidth="0.5" />
              ))}

              {/* Continents */}
              {WORLD_PATHS.map((d, i) => (
                <path key={i} d={d} fill="#1a2d47" stroke="#2a4060" strokeWidth="0.8" opacity="0.9" />
              ))}

              {/* Heatmap overlay */}
              {heatmapMode && filtered.map((s, i) => {
                const pos = latLngToSvg(s.currentLat, s.currentLng);
                return <circle key={`heat${i}`} cx={pos.x} cy={pos.y} r="40" fill="url(#heatGrad)" opacity="0.6" />;
              })}

              {/* Geofence circles */}
              {geofenceAlerts.map((gf) => {
                if (!gf.latitude || !gf.longitude) return null;
                const pos = latLngToSvg(Number(gf.latitude), Number(gf.longitude));
                const r = Math.max(15, (Number(gf.radiusKm) || 50) / 3);
                return (
                  <g key={gf.id}>
                    <circle
                      cx={pos.x} cy={pos.y} r={r}
                      fill={gf.triggered ? "rgba(239,68,68,0.1)" : "rgba(255,107,0,0.08)"}
                      stroke={gf.triggered ? "#EF4444" : "#FF6B00"}
                      strokeWidth="1.5"
                      strokeDasharray="6 4"
                    />
                    <text x={pos.x} y={pos.y - r - 5} textAnchor="middle" fill={gf.triggered ? "#EF4444" : "#FF6B00"} fontSize="9" fontWeight="600">
                      {gf.alertName}
                    </text>
                  </g>
                );
              })}

              {/* Route lines */}
              {!clusterMode && filtered.map((s) => {
                const from = latLngToSvg(s.pickupLat, s.pickupLng);
                const to = latLngToSvg(s.dropoffLat, s.dropoffLng);
                const cur = latLngToSvg(s.currentLat, s.currentLng);
                return (
                  <g key={`route-${s.id}`}>
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={STATUS_DOTS[s.status]?.color || "#3B82F6"} strokeWidth="1" strokeDasharray="4 3" opacity="0.3" />
                    <line x1={from.x} y1={from.y} x2={cur.x} y2={cur.y} stroke={STATUS_DOTS[s.status]?.color || "#3B82F6"} strokeWidth="1.5" opacity="0.7" />
                  </g>
                );
              })}

              {/* Cluster mode */}
              {clusterMode && clusters.map((c) => {
                const pos = latLngToSvg(c.lat, c.lng);
                return (
                  <g key={c.key} className="cursor-pointer" onClick={() => setSelectedId(c.shipments[0]?.id || null)}>
                    <circle cx={pos.x} cy={pos.y} r={Math.min(20 + c.count * 2, 40)} fill="rgba(255,107,0,0.15)" stroke="#FF6B00" strokeWidth="1.5" />
                    <circle cx={pos.x} cy={pos.y} r={Math.min(12 + c.count, 25)} fill="#FF6B00" />
                    <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{c.count}</text>
                  </g>
                );
              })}

              {/* Individual dots */}
              {!clusterMode && filtered.map((s) => {
                const pos = latLngToSvg(s.currentLat, s.currentLng);
                const dot = STATUS_DOTS[s.status] || STATUS_DOTS.transit;
                const isSelected = selectedId === s.id;
                return (
                  <g key={s.id} className="cursor-pointer" onClick={() => setSelectedId(isSelected ? null : s.id)}>
                    {s.status === "transit" && (
                      <circle cx={pos.x} cy={pos.y} r="6" fill={dot.color} opacity="0.4" className="dot-ring" />
                    )}
                    <circle
                      cx={pos.x} cy={pos.y}
                      r={isSelected ? 9 : 6}
                      fill={dot.color}
                      stroke={isSelected ? "white" : "rgba(255,255,255,0.5)"}
                      strokeWidth={isSelected ? 3 : 2}
                      className={
                        s.status === "transit" ? "dot-pulse-blue" :
                        s.status === "out_for_delivery" ? "dot-pulse-green" : ""
                      }
                      filter={isSelected ? "url(#glow)" : undefined}
                    />
                    {isSelected && (
                      <>
                        <circle cx={pos.x} cy={pos.y} r="14" fill="none" stroke="white" strokeWidth="1" opacity="0.5" className="dot-ring" />
                        <text x={pos.x} y={pos.y - 16} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" className="pointer-events-none">
                          {s.waybillNumber}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Map Controls - floating */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <button onClick={() => setZoom(Math.min(zoom + 0.2, 3))} className="p-2 hover:bg-gray-50 border-b border-gray-100 transition-colors"><ZoomIn className="w-4 h-4 text-gray-600" /></button>
              <button onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))} className="p-2 hover:bg-gray-50 border-b border-gray-100 transition-colors"><ZoomOut className="w-4 h-4 text-gray-600" /></button>
              <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-2 hover:bg-gray-50 transition-colors"><RotateCw className="w-4 h-4 text-gray-600" /></button>
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setClusterMode(!clusterMode)}
                className={`p-2 hover:bg-gray-50 border-b border-gray-100 transition-colors ${clusterMode ? "bg-[#FF6B00]/10" : ""}`}
                title="Cluster Mode"
              >
                <Layers className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setHeatmapMode(!heatmapMode)}
                className={`p-2 hover:bg-gray-50 border-b border-gray-100 transition-colors ${heatmapMode ? "bg-[#FF6B00]/10" : ""}`}
                title="Heatmap Mode"
              >
                <Activity className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setShowGeofencePanel(!showGeofencePanel)}
                className={`p-2 hover:bg-gray-50 transition-colors ${showGeofencePanel ? "bg-[#FF6B00]/10" : ""}`}
                title="Geofence Alerts"
              >
                <Fence className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tier filter bar */}
          <div className="absolute top-4 left-4 flex gap-1.5">
            {TIER_FILTERS.map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all shadow-sm ${tierFilter === t ? "bg-[#FF6B00] text-white" : "bg-white/90 text-gray-600 hover:bg-white"}`}
              >
                {t === "all" ? "All Tiers" : t.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 rounded-lg shadow-lg border border-gray-200 p-3">
            <p className="text-[11px] font-bold text-[#0A1628] mb-2">Legend</p>
            <div className="space-y-1.5">
              {[
                { label: "In Transit", color: "#3B82F6", pulse: true },
                { label: "At Pickup", color: "#F59E0B", pulse: false },
                { label: "Out for Delivery", color: "#10B981", pulse: true },
                { label: "Delayed/Exception", color: "#EF4444", pulse: false },
                { label: "International/Customs", color: "#8B5CF6", pulse: false },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    {l.pulse && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: l.color }} />}
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: l.color }} />
                  </span>
                  <span className="text-[11px] text-gray-600">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Shipment Popup */}
          {selected && (
            <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 w-80 overflow-hidden z-20">
              <div className="p-4 bg-[#0A1628] text-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-sm">{selected.waybillNumber}</span>
                  <button onClick={() => setSelectedId(null)} className="p-1 hover:bg-white/10 rounded transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <span>{selected.pickupCity}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{selected.dropoffCity}</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${selected.progress}%`, backgroundColor: STATUS_DOTS[selected.status]?.color || "#3B82F6" }}
                  />
                </div>
                <p className="text-[11px] text-gray-500">{selected.contentsDescription}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-400 block text-[10px]">Carrier</span>
                    <span className="font-medium text-[#0A1628]">{selected.carrierUsed}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-400 block text-[10px]">ETA</span>
                    <span className="font-medium text-[#0A1628]">{selected.eta}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-400 block text-[10px]">Distance Left</span>
                    <span className="font-medium text-[#0A1628]">{selected.distanceRemaining.toLocaleString()} km</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-400 block text-[10px]">In Transit</span>
                    <span className="font-medium text-[#0A1628]">{selected.hoursInTransit.toFixed(1)}h</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-400 block text-[10px]">Tier</span>
                    <span className="font-medium text-[#0A1628]">{selected.tier?.replace("_", " ").toUpperCase()}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-400 block text-[10px]">Service</span>
                    <span className="font-medium text-[#0A1628]">{selected.serviceLevel}</span>
                  </div>
                </div>
                <Link
                  href={`/express/track/${selected.waybillNumber}`}
                  className="block w-full text-center py-2 bg-[#FF6B00] text-white rounded-lg text-xs font-semibold hover:bg-[#e55f00] transition-colors"
                >
                  View Full Tracking
                </Link>
              </div>
            </div>
          )}

          {/* Geofence Panel */}
          {showGeofencePanel && (
            <div className="absolute top-4 right-16 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-30 max-h-[70vh] flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0A1628] flex items-center gap-2">
                  <Fence className="w-4 h-4 text-[#FF6B00]" />
                  Geofence Alerts
                </h3>
                <button onClick={() => setShowGeofencePanel(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="p-4 border-b border-gray-100 space-y-2">
                <input
                  type="text"
                  value={geofenceForm.alertName}
                  onChange={(e) => setGeofenceForm({ ...geofenceForm, alertName: e.target.value })}
                  placeholder="Alert name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B00]/30"
                />
                <div className="flex gap-2">
                  <select
                    value={geofenceForm.triggerType}
                    onChange={(e) => setGeofenceForm({ ...geofenceForm, triggerType: e.target.value })}
                    className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none"
                  >
                    <option value="city_entry">City Entry</option>
                    <option value="distance">Distance</option>
                    <option value="border_cross">Border Cross</option>
                  </select>
                  <input
                    type="text"
                    value={geofenceForm.city}
                    onChange={(e) => setGeofenceForm({ ...geofenceForm, city: e.target.value })}
                    placeholder="City"
                    className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B00]/30"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={geofenceForm.countryCode}
                    onChange={(e) => setGeofenceForm({ ...geofenceForm, countryCode: e.target.value })}
                    placeholder="Country code"
                    className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B00]/30"
                  />
                  <input
                    type="number"
                    value={geofenceForm.radiusKm}
                    onChange={(e) => setGeofenceForm({ ...geofenceForm, radiusKm: Number(e.target.value) })}
                    placeholder="Radius km"
                    className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FF6B00]/30"
                  />
                </div>
                <button className="w-full py-2 bg-[#FF6B00] text-white rounded-lg text-xs font-semibold hover:bg-[#e55f00] transition-colors flex items-center justify-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Create Geofence Alert
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {geofenceAlerts.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-xs">
                    <Fence className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No geofence alerts yet
                  </div>
                ) : (
                  geofenceAlerts.map((gf) => (
                    <div key={gf.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#0A1628]">{gf.alertName}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${gf.triggered ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {gf.triggered ? "Triggered" : "Active"}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 space-y-0.5">
                        <p>Type: {gf.triggerType.replace("_", " ")}</p>
                        {gf.city && <p>City: {gf.city}{gf.countryCode ? ` (${gf.countryCode})` : ""}</p>}
                        {gf.radiusKm && <p>Radius: {gf.radiusKm} km</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Mobile toggle button */}
          <button
            onClick={() => setShowMobileSheet(!showMobileSheet)}
            className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#FF6B00] text-white px-4 py-2 rounded-full shadow-lg text-xs font-semibold flex items-center gap-1.5 z-40"
          >
            <Truck className="w-4 h-4" />
            Shipments ({filtered.length})
            {showMobileSheet ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Bottom Sheet */}
        {showMobileSheet && (
          <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transition-all ${mobileSheetExpanded ? "h-[70vh]" : "h-[40vh]"}`}>
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <button onClick={() => setMobileSheetExpanded(!mobileSheetExpanded)} className="flex items-center gap-2">
                <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto" />
              </button>
              <button onClick={() => setShowMobileSheet(false)} className="p-1"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="overflow-y-auto h-full pb-20">
              <div className="p-3 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search waybill..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {TIER_FILTERS.map((t) => (
                    <button key={t} onClick={() => setTierFilter(t)} className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${tierFilter === t ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-600"}`}>
                      {t === "all" ? "All" : t.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
              {filtered.map((s) => {
                const dot = STATUS_DOTS[s.status] || STATUS_DOTS.transit;
                return (
                  <button key={s.id} onClick={() => { setSelectedId(s.id); setShowMobileSheet(false); }} className="w-full text-left p-3 border-b border-gray-100 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dot.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0A1628] font-mono">{s.waybillNumber}</span>
                        <span className="text-[10px] text-gray-500">{s.eta}</span>
                      </div>
                      <div className="text-[11px] text-gray-500">{s.pickupCity} → {s.dropoffCity}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stats Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2.5 flex items-center gap-6 text-xs overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <Truck className="w-4 h-4 text-[#FF6B00]" />
          <span className="font-bold text-[#0A1628]">{stats.total}</span>
          <span className="text-gray-400">active</span>
        </div>
        <div className="w-px h-4 bg-gray-200 shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          <Clock className="w-4 h-4 text-blue-500" />
          <span className="text-gray-500">Avg ETA:</span>
          <span className="font-semibold text-[#0A1628]">{stats.avgEta}</span>
        </div>
        <div className="w-px h-4 bg-gray-200 shrink-0" />
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-500">Transit:</span>
            <span className="font-semibold text-[#0A1628]">{stats.transit}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-gray-500">Pickup:</span>
            <span className="font-semibold text-[#0A1628]">{stats.pickup}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-gray-500">Delivery:</span>
            <span className="font-semibold text-[#0A1628]">{stats.out_for_delivery}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-500">Exception:</span>
            <span className="font-semibold text-[#0A1628]">{stats.exception}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
