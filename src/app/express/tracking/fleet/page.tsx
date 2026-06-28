"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Grid3X3,
  List,
  Map,
  Search,
  Filter,
  ChevronRight,
  X,
  Truck,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Camera,
  FileText,
  Leaf,
  CreditCard,
  Star,
  Download,
  ExternalLink,
  ArrowRight,
  Loader2,
  Calendar,
  Route,
  Car,
  User,
  Phone,
  Mail,
  Shield,
  Box,
  Weight,
  Ruler,
  Coins,
  CircleDot,
  Image,
  ImageOff,
  ChevronDown,
  ChevronUp,
  Navigation,
  RefreshCw,
} from "lucide-react";

interface CargoPhoto {
  id: string;
  checkpointType: string;
  photoUrl: string | null;
  takenByType: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  createdAt: string;
}

interface Shipment {
  id: string;
  waybillNumber: string;
  status: string;
  statusLabel: string;
  progress: number;
  origin: {
    address: string | null;
    city: string | null;
    country: string;
    lat: number | null;
    lng: number | null;
  };
  destination: {
    address: string | null;
    city: string | null;
    country: string;
    lat: number | null;
    lng: number | null;
  };
  sender: { name: string; phone: string; email: string | null };
  receiver: { name: string; phone: string };
  carrier: string;
  serviceLevel: string;
  tier: string | null;
  weight: number | null;
  dimensions: { l: number | null; w: number | null; h: number | null };
  chargeableWeight: number | null;
  declaredValue: number | null;
  currency: string;
  pricing: { baseShipping: number; insurancePremium: number; packagingFee: number; total: number };
  insurance: boolean;
  packaging: { type: string | null; size: string | null };
  waybillUrl: string | null;
  paymentStatus: string;
  deliveryConfidence: number | null;
  cargoPhotos: CargoPhoto[];
  elapsed: string;
  remaining: string;
  createdAt: string;
}

type ViewMode = "grid" | "list" | "map";
type DetailTab = "shipping" | "vehicle" | "documents" | "carbon" | "billing";
type ShowMode = "all" | "active" | "inactive";

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: "Waiting", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  picked_up: { label: "On Route", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  in_transit: { label: "On Route", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  out_for_delivery: { label: "On Route", bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  delivered: { label: "Delivered", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  failed: { label: "Exception", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  returned: { label: "Exception", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

const CHECKPOINT_LABELS: Record<string, string> = {
  pickup: "Pickup",
  hub_arrival: "Hub Arrival",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  locker_placed: "Locker Placed",
  locker_collected: "Locker Collected",
};

const CHECKPOINT_ICONS: Record<string, string> = {
  pickup: "📍",
  hub_arrival: "🏭",
  in_transit: "🚚",
  out_for_delivery: "🚴",
  delivered: "✅",
  locker_placed: "📦",
  locker_collected: "🔓",
};

const CHECKPOINTS_ORDER = ["pickup", "hub_arrival", "in_transit", "out_for_delivery", "delivered"];

const SERVICE_LABELS: Record<string, string> = {
  economy: "Economy",
  standard: "Standard",
  express: "Express",
  same_day: "Same Day",
};

export default function FleetTrackingPage() {
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [carrierFilter, setCarrierFilter] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showMode, setShowMode] = useState<ShowMode>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("shipping");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/express/fleet-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters: {
            search: search || undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
            carrier: carrierFilter || undefined,
            route: routeFilter || undefined,
            service_level: serviceFilter || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            show: showMode,
          },
        }),
      });
      const data = await res.json();
      if (data.shipments) {
        setShipments(data.shipments);
      }
    } catch (err) {
      console.error("Failed to fetch fleet data:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, carrierFilter, routeFilter, serviceFilter, dateFrom, dateTo, showMode]);

  useEffect(() => {
    const debounce = setTimeout(fetchShipments, 400);
    return () => clearTimeout(debounce);
  }, [fetchShipments]);

  const selected = shipments.find((s) => s.id === selectedId) || null;

  const getStatusInfo = (status: string) => STATUS_MAP[status] || STATUS_MAP.pending;

  const statusCounts = {
    all: shipments.length,
    active: shipments.filter((s) => ["pending", "picked_up", "in_transit", "out_for_delivery"].includes(s.status)).length,
    inactive: shipments.filter((s) => ["delivered", "failed", "returned"].includes(s.status)).length,
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]">Fleet Tracking</h1>
            <p className="text-sm text-gray-500 mt-1">Track shipments, carriers, and cargo photos in real time.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchShipments} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {([
                { id: "grid" as ViewMode, icon: Grid3X3, label: "Grid" },
                { id: "list" as ViewMode, icon: List, label: "List" },
                { id: "map" as ViewMode, icon: Map, label: "Map" },
              ]).map((v) => (
                <button key={v.id} onClick={() => setView(v.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === v.id ? "bg-white shadow text-[#0A1628]" : "text-gray-400 hover:text-gray-600"}`}>
                  <v.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by reference number..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
              />
            </div>

            <select value={carrierFilter} onChange={(e) => setCarrierFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 bg-white">
              <option value="">All Carriers</option>
              <option value="gig">GIG Logistics</option>
              <option value="FedEx">FedEx</option>
              <option value="DHL">DHL</option>
              <option value="Aramex">Aramex</option>
              <option value="kwik">Kwik Delivery</option>
              <option value="Local">Local Partner</option>
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 bg-white">
              <option value="all">All Status</option>
              <option value="on_route">On Route</option>
              <option value="delivered">Delivered</option>
              <option value="waiting">Waiting</option>
              <option value="exception">Exception</option>
            </select>

            <select value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 bg-white">
              <option value="">All Routes</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="PH">Port Harcourt</option>
              <option value="Kano">Kano</option>
              <option value="Accra">Accra</option>
              <option value="Johannesburg">Johannesburg</option>
            </select>

            <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 bg-white">
              <option value="">All Services</option>
              <option value="economy">Economy</option>
              <option value="standard">Standard</option>
              <option value="express">Express</option>
              <option value="same_day">Same Day</option>
            </select>

            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Date</span>
              {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">From</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">To</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            {([
              { id: "all" as ShowMode, label: "All", count: statusCounts.all },
              { id: "active" as ShowMode, label: "Active", count: statusCounts.active },
              { id: "inactive" as ShowMode, label: "Inactive", count: statusCounts.inactive },
            ]).map((m) => (
              <button key={m.id} onClick={() => setShowMode(m.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${showMode === m.id ? "bg-[#0A1628] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {m.label}
                <span className="ml-1 opacity-70">{m.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-5">
          <div className={`flex-1 min-w-0 ${selected ? "hidden lg:block" : ""}`}>
            {loading ? (
              <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
                <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
              </div>
            ) : shipments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-200 text-center">
                <Package className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">No shipments found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                {view === "grid" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {shipments.map((s) => {
                      const sc = getStatusInfo(s.status);
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedId(s.id)}
                          className={`text-left bg-white rounded-xl border p-4 hover:shadow-md transition-all group ${selectedId === s.id ? "border-[#FF6B00] ring-1 ring-[#FF6B00]/30 shadow-md" : "border-gray-200"}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-mono text-sm font-bold text-[#0A1628]">{s.waybillNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sc.bg} ${sc.text}`}>{sc.label}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                            <MapPin className="w-3 h-3 text-[#FF6B00]" />
                            <span className="truncate">{s.origin.city || "Origin"}</span>
                            <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">{s.destination.city || "Dest"}</span>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1 text-[11px] text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{s.elapsed}</span>
                            </div>
                            <span className="text-gray-300">|</span>
                            <span className="text-[11px] text-gray-400">{s.remaining}</span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                            <div className={`h-full rounded-full transition-all ${sc.dot}`} style={{ width: `${Math.max(s.progress, 3)}%` }} />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs text-gray-600">{s.carrier}</span>
                            </div>
                            {s.cargoPhotos.length > 0 && (
                              <div className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                <Camera className="w-3 h-3" />
                                {s.cargoPhotos.length}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className={`w-3 h-3 ${i <= 4 ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                              ))}
                            </div>
                            <span className="text-[10px] text-gray-400 group-hover:text-[#FF6B00] transition-colors flex items-center gap-1">
                              Click to expand <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {view === "list" && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Reference</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Route</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Status</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Carrier</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Service</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Elapsed</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Progress</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shipments.map((s) => {
                            const sc = getStatusInfo(s.status);
                            return (
                              <tr key={s.id} onClick={() => setSelectedId(s.id)} className={`border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedId === s.id ? "bg-orange-50/50" : ""}`}>
                                <td className="py-3 px-4 font-mono font-bold text-[#0A1628] text-xs">{s.waybillNumber}</td>
                                <td className="py-3 px-4 text-gray-600">
                                  <span className="text-xs">{s.origin.city || "-"}</span>
                                  <ArrowRight className="w-3 h-3 inline mx-1 text-gray-400" />
                                  <span className="text-xs">{s.destination.city || "-"}</span>
                                </td>
                                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sc.bg} ${sc.text}`}>{sc.label}</span></td>
                                <td className="py-3 px-4 text-gray-600 text-xs">{s.carrier}</td>
                                <td className="py-3 px-4 text-gray-600 text-xs">{SERVICE_LABELS[s.serviceLevel] || s.serviceLevel}</td>
                                <td className="py-3 px-4 text-gray-500 text-xs">{s.elapsed}</td>
                                <td className="py-3 px-4 w-32">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                      <div className={`h-full rounded-full ${sc.dot}`} style={{ width: `${Math.max(s.progress, 3)}%` }} />
                                    </div>
                                    <span className="text-[10px] text-gray-400 shrink-0">{s.progress}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {view === "map" && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-[500px] relative">
                    <div className="absolute inset-0 bg-[#0A1628]">
                      <svg viewBox="0 0 800 500" className="w-full h-full">
                        {shipments.map((s, i) => {
                          const positions = [
                            [120, 300], [300, 150], [500, 100], [650, 80], [400, 350],
                            [200, 200], [350, 280], [550, 250], [150, 150], [450, 180],
                            [280, 380], [600, 320],
                          ];
                          const [cx, cy] = positions[i % positions.length];
                          const sc = getStatusInfo(s.status);
                          const dotColor = s.status === "delivered" ? "#10b981"
                            : s.status === "failed" || s.status === "returned" ? "#ef4444"
                            : s.status === "pending" ? "#f59e0b"
                            : s.status === "out_for_delivery" ? "#6366f1"
                            : "#3b82f6";
                          return (
                            <g key={s.id} className="cursor-pointer" onClick={() => setSelectedId(s.id)}>
                              <circle cx={cx} cy={cy} r="12" fill={dotColor} opacity="0.2">
                                <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite" />
                              </circle>
                              <circle cx={cx} cy={cy} r="5" fill={dotColor} stroke="white" strokeWidth="2" />
                              <text x={cx} y={cy - 16} textAnchor="middle" fill="white" fontSize="8" opacity="0.8" fontFamily="monospace">{s.waybillNumber}</text>
                              {s.cargoPhotos.length > 0 && (
                                <circle cx={cx + 8} cy={cy - 8} r="4" fill="#FF6B00" stroke="white" strokeWidth="1" />
                              )}
                            </g>
                          );
                        })}
                        {/* Fuel station markers */}
                        {[
                          { x: 180, y: 260, name: "NNPC VI", price: "₦617", type: "petrol" },
                          { x: 220, y: 240, name: "Total Lekki", price: "₦620", type: "petrol" },
                          { x: 350, y: 180, name: "Oando Wuse", price: "₦617", type: "petrol" },
                          { x: 500, y: 140, name: "NNPC PH", price: "₦617", type: "petrol" },
                        ].map((fs, i) => (
                          <g key={`fuel-${i}`} className="cursor-pointer" opacity="0.7">
                            <rect x={fs.x - 8} y={fs.y - 8} width="16" height="16" rx="3" fill="#FF6B00" stroke="white" strokeWidth="1.5" />
                            <text x={fs.x} y={fs.y + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="monospace">⛽</text>
                            <text x={fs.x} y={fs.y - 12} textAnchor="middle" fill="#FF6B00" fontSize="7" fontFamily="monospace" fontWeight="bold">{fs.price}/L</text>
                          </g>
                        ))}
                      </svg>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-[#0A1628]/80 backdrop-blur rounded-lg p-3 flex items-center gap-4 text-white text-xs">
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> On Route</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Delivered</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Waiting</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Exception</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#FF6B00]" /> Fuel Station</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="fixed inset-0 lg:static lg:inset-auto z-50 lg:z-auto">
              <div className="absolute inset-0 bg-black/30 lg:hidden" onClick={() => setSelectedId(null)} />
              <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[440px] lg:w-[420px] bg-white border-l border-gray-200 shadow-2xl lg:shadow-none lg:rounded-xl overflow-y-auto flex flex-col">
                {/* Panel Header */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-lg font-bold text-[#0A1628]">{selected.waybillNumber}</span>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => { const sc = getStatusInfo(selected.status); return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sc.bg} ${sc.text}`}>{sc.label}</span>; })()}
                      <span className="text-xs text-gray-400">{SERVICE_LABELS[selected.serviceLevel] || selected.serviceLevel}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedId(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-100 px-5">
                  <div className="flex gap-1 overflow-x-auto">
                    {([
                      { id: "shipping" as DetailTab, label: "Shipping", icon: Package },
                      { id: "vehicle" as DetailTab, label: "Vehicle", icon: Truck },
                      { id: "documents" as DetailTab, label: "Documents", icon: FileText },
                      { id: "carbon" as DetailTab, label: "Carbon", icon: Leaf },
                      { id: "billing" as DetailTab, label: "Billing", icon: CreditCard },
                    ]).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setDetailTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${detailTab === tab.id ? "border-[#FF6B00] text-[#FF6B00]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                      >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  {detailTab === "shipping" && <ShippingTab shipment={selected} />}
                  {detailTab === "vehicle" && <VehicleTab shipment={selected} />}
                  {detailTab === "documents" && <DocumentsTab shipment={selected} />}
                  {detailTab === "carbon" && <CarbonTab shipment={selected} />}
                  {detailTab === "billing" && <BillingTab shipment={selected} />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────── SHIPPING TAB ──────────── */

function ShippingTab({ shipment }: { shipment: Shipment }) {
  return (
    <div className="space-y-5">
      {/* Route SVG Map */}
      <div className="bg-[#0A1628] rounded-xl p-4 relative overflow-hidden">
        <svg viewBox="0 0 360 120" className="w-full h-24">
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B00" />
              <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path d="M 30 60 Q 120 20, 180 60 Q 240 100, 330 60" fill="none" stroke="url(#routeGrad)" strokeWidth="2.5" strokeDasharray={shipment.status === "delivered" ? "none" : "6 4"} />
          <circle cx="30" cy="60" r="6" fill="#FF6B00" stroke="white" strokeWidth="2" />
          <circle cx="330" cy="60" r="6" fill="#10b981" stroke="white" strokeWidth="2" />
          {[0.25, 0.5, 0.75].map((t, i) => {
            const x = 30 + (330 - 30) * t;
            const y = 60 + Math.sin(t * Math.PI) * -30;
            return <circle key={i} cx={x} cy={y} r="2" fill="white" opacity="0.3" />;
          })}
          <text x="30" y="85" textAnchor="middle" fill="white" fontSize="8" opacity="0.8">{shipment.origin.city || "Origin"}</text>
          <text x="330" y="85" textAnchor="middle" fill="white" fontSize="8" opacity="0.8">{shipment.destination.city || "Dest"}</text>
        </svg>
      </div>

      {/* Route Details */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-0.5">
            <div className="w-3 h-3 rounded-full bg-[#FF6B00] border-2 border-[#FF6B00]/30" />
            <div className="w-px h-8 bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-500/30" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Origin</p>
              <p className="text-sm font-medium text-[#0A1628]">{shipment.origin.address || shipment.origin.city || "N/A"}</p>
              <p className="text-xs text-gray-500">{shipment.origin.city}, {shipment.origin.country}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Destination</p>
              <p className="text-sm font-medium text-[#0A1628]">{shipment.destination.address || shipment.destination.city || "N/A"}</p>
              <p className="text-xs text-gray-500">{shipment.destination.city}, {shipment.destination.country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#0A1628]">Shipment Progress</span>
          <span className="text-xs text-gray-500">{shipment.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="h-full rounded-full bg-[#FF6B00] transition-all" style={{ width: `${Math.max(shipment.progress, 3)}%` }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] text-gray-400">Time Elapsed</p>
            <p className="text-sm font-bold text-[#0A1628]">{shipment.elapsed}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] text-gray-400">ETA</p>
            <p className="text-sm font-bold text-[#0A1628]">{shipment.remaining}</p>
          </div>
        </div>
      </div>

      {/* Sender / Receiver */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-1.5"><User className="w-3 h-3 text-[#FF6B00]" /><p className="text-[10px] text-gray-400 uppercase">Sender</p></div>
          <p className="text-xs font-medium text-[#0A1628]">{shipment.sender.name}</p>
          <div className="flex items-center gap-1"><Phone className="w-2.5 h-2.5 text-gray-400" /><span className="text-[10px] text-gray-500">{shipment.sender.phone}</span></div>
          {shipment.sender.email && <div className="flex items-center gap-1"><Mail className="w-2.5 h-2.5 text-gray-400" /><span className="text-[10px] text-gray-500">{shipment.sender.email}</span></div>}
        </div>
        <div className="bg-gray-50 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-green-500" /><p className="text-[10px] text-gray-400 uppercase">Receiver</p></div>
          <p className="text-xs font-medium text-[#0A1628]">{shipment.receiver.name}</p>
          <div className="flex items-center gap-1"><Phone className="w-2.5 h-2.5 text-gray-400" /><span className="text-[10px] text-gray-500">{shipment.receiver.phone}</span></div>
        </div>
      </div>

      {/* Change Route button (Tier 1) */}
      {shipment.tier === "tier_1_local" && (
        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-[#E65A00] transition-colors">
          <Route className="w-4 h-4" />
          Change Route
        </button>
      )}
    </div>
  );
}

/* ──────────── VEHICLE TAB ──────────── */

function VehicleTab({ shipment }: { shipment: Shipment }) {
  const capacityPercent = shipment.weight ? Math.min(Math.round((shipment.weight / 50) * 100), 100) : 0;
  const maxLoad = 50;
  const currentLoad = shipment.weight || 0;
  const spaceRemaining = Math.max(0, maxLoad - currentLoad);

  return (
    <div className="space-y-5">
      {/* Truck Visualization */}
      <div className="bg-gray-50 rounded-xl p-5">
        <div className="text-center mb-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Cargo Capacity</p>
          <p className="text-3xl font-bold text-[#0A1628]">{capacityPercent}%</p>
          <p className="text-xs text-gray-500">filled</p>
        </div>

        {/* CSS Truck Illustration */}
        <div className="relative mx-auto max-w-[280px]">
          <div className="relative bg-[#0A1628] rounded-lg h-28 border-2 border-gray-300 overflow-hidden">
            {/* Cab */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-[#1a2d47] border-r border-gray-600 flex items-center justify-center">
              <Car className="w-8 h-8 text-gray-400" />
            </div>
            {/* Cargo area */}
            <div className="absolute left-16 top-0 bottom-0 right-0 bg-gray-700/30">
              <div
                className="absolute bottom-0 left-0 right-0 bg-[#FF6B00]/80 transition-all"
                style={{ height: `${capacityPercent}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-lg font-bold drop-shadow">{capacityPercent}%</span>
              </div>
            </div>
          </div>
          {/* Wheels */}
          <div className="absolute -bottom-3 left-4 w-6 h-6 bg-gray-800 rounded-full border-2 border-gray-400" />
          <div className="absolute -bottom-3 right-4 w-6 h-6 bg-gray-800 rounded-full border-2 border-gray-400" />
        </div>

        {/* Load Stats */}
        <div className="grid grid-cols-3 gap-2 mt-6">
          <div className="text-center">
            <p className="text-[10px] text-gray-400">Max Load</p>
            <p className="text-sm font-bold text-[#0A1628]">{maxLoad} kg</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400">Current</p>
            <p className="text-sm font-bold text-[#FF6B00]">{currentLoad} kg</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400">Remaining</p>
            <p className="text-sm font-bold text-green-600">{spaceRemaining.toFixed(1)} kg</p>
          </div>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-[#0A1628]">Load Distribution</p>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#FF6B00] to-amber-400 transition-all" style={{ width: `${capacityPercent}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>0 kg</span>
          <span>{maxLoad} kg</span>
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="text-xs font-semibold text-[#0A1628]">Vehicle Information</h4>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { label: "Vehicle ID", value: `VH-${shipment.waybillNumber.slice(-6)}` },
            { label: "Registration", value: shipment.tier === "tier_1_local" ? "NG-" + Math.random().toString(36).slice(2, 8).toUpperCase() : "International" },
            { label: "Type", value: shipment.weight && shipment.weight > 30 ? "Heavy Truck" : shipment.weight && shipment.weight > 10 ? "Medium Van" : "Light Vehicle" },
            { label: "Driver", value: shipment.status === "pending" ? "Awaiting assignment" : shipment.status === "delivered" ? "Completed" : "Assigned Driver" },
            { label: "Contact", value: shipment.status === "pending" ? "-" : "+234 800 XXX XXXX" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-gray-500">{item.label}</span>
              <span className="text-xs font-medium text-[#0A1628]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────── DOCUMENTS TAB ──────────── */

function DocumentsTab({ shipment }: { shipment: Shipment }) {
  const photoCheckpoints = CHECKPOINTS_ORDER.map((cp) => {
    const photo = shipment.cargoPhotos.find((p) => p.checkpointType === cp);
    return { type: cp, label: CHECKPOINT_LABELS[cp], icon: CHECKPOINT_ICONS[cp], photo };
  });

  return (
    <div className="space-y-5">
      {/* Document Cards */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-[#0A1628] uppercase tracking-wide">Documents</h4>
        <div className="space-y-2">
          {[
            { label: "Waybill", available: true, url: shipment.waybillUrl },
            { label: "Commercial Invoice", available: shipment.origin.country !== shipment.destination.country },
            { label: "Customs Declaration", available: shipment.origin.country !== shipment.destination.country },
            { label: "Proof of Delivery", available: shipment.status === "delivered" },
          ].map((doc) => (
            <div key={doc.label} className={`flex items-center justify-between p-3 rounded-lg border ${doc.available ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100"}`}>
              <div className="flex items-center gap-2.5">
                <FileText className={`w-4 h-4 ${doc.available ? "text-[#FF6B00]" : "text-gray-300"}`} />
                <span className={`text-xs ${doc.available ? "text-[#0A1628] font-medium" : "text-gray-400"}`}>{doc.label}</span>
                {!doc.available && <span className="text-[10px] text-gray-400">(Not applicable)</span>}
              </div>
              {doc.available && (
                <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-[#FF6B00] hover:bg-orange-50 rounded transition-colors">
                  <Download className="w-3 h-3" />
                  Download
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cargo Photo Chain */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#0A1628] uppercase tracking-wide flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-[#FF6B00]" />
          Cargo Photo Chain
        </h4>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-gray-200" />

          <div className="space-y-4">
            {photoCheckpoints.map((cp, idx) => (
              <div key={cp.type} className="relative flex gap-3">
                {/* Timeline dot */}
                <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 ${cp.photo ? "bg-[#FF6B00] text-white shadow-md" : "bg-gray-100 text-gray-400 border-2 border-gray-200"}`}>
                  {cp.photo ? <Camera className="w-4 h-4" /> : <span className="text-xs">{idx + 1}</span>}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#0A1628]">Point #{idx + 1}: {cp.label}</span>
                    {cp.photo && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>

                  {cp.photo ? (
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      {cp.photo.photoUrl ? (
                        <div className="h-32 bg-gray-100 flex items-center justify-center">
                          <img src={cp.photo.photoUrl} alt={cp.label} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-32 bg-gray-100 flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                      <div className="p-2.5 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] text-gray-500">
                            {new Date(cp.photo.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {cp.photo.latitude && cp.photo.longitude && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] text-gray-500">
                              {cp.photo.latitude.toFixed(4)}, {cp.photo.longitude.toFixed(4)}
                            </span>
                          </div>
                        )}
                        {cp.photo.notes && (
                          <p className="text-[10px] text-gray-400 italic">{cp.photo.notes}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4 text-center">
                      <ImageOff className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                      <p className="text-[10px] text-gray-400">No photos yet</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────── CARBON TAB ──────────── */

function CarbonTab({ shipment }: { shipment: Shipment }) {
  const baseEmission = shipment.weight ? (shipment.weight * 0.12).toFixed(2) : "0.00";
  const altEmission = shipment.weight ? (shipment.weight * 0.18).toFixed(2) : "0.00";
  const saved = (parseFloat(altEmission) - parseFloat(baseEmission)).toFixed(2);

  return (
    <div className="space-y-5">
      {/* CO2 for this shipment */}
      <div className="bg-emerald-50 rounded-xl p-5 text-center">
        <Leaf className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
        <p className="text-3xl font-bold text-emerald-700">{baseEmission} kg</p>
        <p className="text-xs text-emerald-600 mt-1">CO₂ for this shipment</p>
      </div>

      {/* Route Comparison */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-semibold text-[#0A1628]">Route CO₂ Comparison</h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500">Chosen Route ({shipment.carrier})</span>
              <span className="text-xs font-bold text-emerald-600">{baseEmission} kg</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(parseFloat(baseEmission) / parseFloat(altEmission)) * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500">Alternative Route</span>
              <span className="text-xs font-bold text-gray-400">{altEmission} kg</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-full rounded-full bg-gray-400" style={{ width: "100%" }} />
            </div>
          </div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 text-center">
          <p className="text-xs text-emerald-700">
            Saved <span className="font-bold">{saved} kg CO₂</span> by choosing this route
          </p>
        </div>
      </div>

      {/* Offset */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <Leaf className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#0A1628]">Carbon Offset</p>
              <p className="text-[10px] text-gray-500">Tree planting credits</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${shipment.insurance ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
            {shipment.insurance ? "Purchased" : "Not Purchased"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ──────────── BILLING TAB ──────────── */

function BillingTab({ shipment }: { shipment: Shipment }) {
  const fmt = (n: number) => `${shipment.currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-5">
      {/* Fee Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h4 className="text-xs font-semibold text-[#0A1628]">Shipping Fee Breakdown</h4>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { label: "Base Shipping Fee", amount: shipment.pricing.baseShipping },
            { label: "Insurance Premium", amount: shipment.pricing.insurancePremium, highlight: false },
            { label: "Packaging Fee", amount: shipment.pricing.packagingFee },
            { label: "DDP Charges", amount: shipment.origin.country !== shipment.destination.country ? shipment.pricing.baseShipping * 0.1 : 0, note: shipment.origin.country !== shipment.destination.country ? "International" : "Domestic" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">{item.label}</span>
                {item.note && <span className="text-[10px] text-gray-400">({item.note})</span>}
              </div>
              <span className="text-xs font-medium text-[#0A1628]">{fmt(item.amount)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0A1628]/5">
            <span className="text-sm font-bold text-[#0A1628]">Total</span>
            <span className="text-sm font-bold text-[#FF6B00]">{fmt(shipment.pricing.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#FF6B00]" />
            <div>
              <p className="text-xs font-medium text-[#0A1628]">Payment Status</p>
              <p className="text-[10px] text-gray-500">Shipment #{shipment.waybillNumber}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${shipment.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {shipment.paymentStatus === "paid" ? "Paid" : "Pending"}
          </span>
        </div>
      </div>

      {/* Declared Value */}
      {shipment.declaredValue && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Declared Value</span>
            <span className="text-sm font-bold text-[#0A1628]">{fmt(shipment.declaredValue)}</span>
          </div>
        </div>
      )}

      {/* Download Invoice */}
      <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-medium hover:bg-[#1a2d47] transition-colors">
        <Download className="w-4 h-4" />
        Download Invoice
      </button>
    </div>
  );
}
