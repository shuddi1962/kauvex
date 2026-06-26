"use client";

import { useState } from "react";
import { MapPin, Filter, ChevronDown, ChevronRight, Truck, Package, CheckCircle2, AlertCircle, XCircle, Layers, Satellite, RotateCw, ZoomIn, ZoomOut, Search } from "lucide-react";

const STATUS_FILTERS = [
  { id: "all", label: "All", count: 342, color: "bg-gray-100 text-gray-700" },
  { id: "transit", label: "In Transit", count: 198, color: "bg-blue-100 text-blue-700" },
  { id: "pickup", label: "Pending Pickup", count: 23, color: "bg-yellow-100 text-yellow-700" },
  { id: "delivered", label: "Delivered", count: 89, color: "bg-green-100 text-green-700" },
  { id: "exception", label: "Exception", count: 12, color: "bg-red-100 text-red-700" },
  { id: "out", label: "Out for Delivery", count: 20, color: "bg-purple-100 text-purple-700" },
];

const SHIPMENTS = [
  { id: "KVX-7842", from: "Lagos", to: "Abuja", status: "transit", carrier: "GIG Logistics", eta: "Today 4:30 PM", progress: 72, lat: 7.38, lng: 3.94, driver: "Tunde A.", vehicle: "Toyota Hiace" },
  { id: "KVX-7843", from: "Lekki", to: "Ikeja", status: "pickup", carrier: "Kwik Delivery", eta: "30 min", progress: 10, lat: 6.44, lng: 3.42, driver: "Awaiting", vehicle: "-" },
  { id: "KVX-7839", from: "Lagos", to: "Accra", status: "delivered", carrier: "DHL Express", eta: "Delivered", progress: 100, lat: 5.56, lng: -0.19, driver: "Completed", vehicle: "Van" },
  { id: "KVX-7841", from: "Abuja", to: "Kano", status: "transit", carrier: "FedEx", eta: "Tomorrow 10:00 AM", progress: 45, lat: 10.52, lng: 7.43, driver: "Emeka N.", vehicle: "Ford Transit" },
  { id: "KVX-7838", from: "Lagos", to: "Nairobi", status: "transit", carrier: "Aramex", eta: "Jun 28", progress: 30, lat: -1.29, lng: 36.82, driver: "Via Air", vehicle: "Air Freight" },
  { id: "KVX-7844", from: "PH", to: "Calabar", status: "exception", carrier: "GIG Logistics", eta: "Delayed", progress: 55, lat: 4.95, lng: 8.33, driver: "Kemi O.", vehicle: "Truck" },
  { id: "KVX-7845", from: "Lagos", to: "Lekki", status: "out", carrier: "Kwik Delivery", eta: "15 min", progress: 90, lat: 6.44, lng: 3.46, driver: "Bola M.", vehicle: "Bike" },
  { id: "KVX-7846", from: "Ikeja", to: "Surulere", status: "transit", carrier: "Local Partner", eta: "1 hr", progress: 35, lat: 6.53, lng: 3.36, driver: "Chidi E.", vehicle: "Tricycle" },
  { id: "KVX-7840", from: "Lagos", to: "Johannesburg", status: "delivered", carrier: "DHL International", eta: "Delivered", progress: 100, lat: -26.2, lng: 28.04, driver: "Completed", vehicle: "Air" },
  { id: "KVX-7847", from: "Abuja", to: "Lagos", status: "pickup", carrier: "FedEx", eta: "1 hr", progress: 5, lat: 9.06, lng: 7.49, driver: "Pending", vehicle: "-" },
];

export default function TrackMapPage() {
  const [filter, setFilter] = useState("all");
  const [cluster, setCluster] = useState(true);
  const [heatmap, setHeatmap] = useState(false);
  const [satellite, setSatellite] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = SHIPMENTS.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (search && !s.id.toLowerCase().includes(search.toLowerCase()) && !s.from.toLowerCase().includes(search.toLowerCase()) && !s.to.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusColor: Record<string, string> = {
    transit: "bg-blue-500",
    pickup: "bg-yellow-500",
    delivered: "bg-green-500",
    exception: "bg-red-500",
    out: "bg-purple-500",
  };

  const statusLabel: Record<string, string> = {
    transit: "In Transit",
    pickup: "Pending Pickup",
    delivered: "Delivered",
    exception: "Exception",
    out: "Out for Delivery",
  };

  const selectedShipment = SHIPMENTS.find((s) => s.id === selected);

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-gray-200 bg-white">
      {/* Left Panel */}
      <div className="w-80 border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search shipments..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${filter === f.id ? "bg-[#FF6B00] text-white" : f.color}`}>
                {f.label} <span className="ml-0.5 opacity-70">{f.count}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((s) => (
            <button key={s.id} onClick={() => setSelected(s.id)} className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selected === s.id ? "bg-orange-50 border-l-2 border-l-[#FF6B00]" : ""}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-[#0A1628] font-mono">{s.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${statusColor[s.status]}`}>{statusLabel[s.status]}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                <span>{s.from}</span><ChevronRight className="w-3 h-3" /><span>{s.to}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${statusColor[s.status]}`} style={{ width: `${s.progress}%` }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[11px] text-gray-400">{s.carrier}</span>
                <span className="text-[11px] text-gray-600 font-medium">{s.eta}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        {/* Map Placeholder */}
        <div className={`absolute inset-0 ${satellite ? "bg-[#0A1628]" : "bg-gray-100"}`}>
          <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            {heatmap && (
              <g opacity="0.4">
                <circle cx="300" cy="350" r="80" fill="#FF6B00" opacity="0.3" />
                <circle cx="450" cy="200" r="60" fill="#FF6B00" opacity="0.25" />
                <circle cx="200" cy="250" r="50" fill="#FF6B00" opacity="0.2" />
                <circle cx="600" cy="400" r="70" fill="#FF6B00" opacity="0.2" />
              </g>
            )}
            {/* Route lines */}
            <line x1="300" y1="350" x2="450" y2="200" stroke="#FF6B00" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
            <line x1="300" y1="350" x2="200" y2="250" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
            <line x1="450" y1="200" x2="700" y2="150" stroke="#FF6B00" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
            <line x1="300" y1="350" x2="600" y2="400" stroke="#10B981" strokeWidth="1.5" opacity="0.5" />
            {/* Markers */}
            {filtered.map((s, i) => {
              const positions = [[300, 350], [250, 310], [200, 250], [450, 200], [600, 400], [500, 300], [280, 380], [350, 280], [700, 150], [400, 220]];
              const [cx, cy] = positions[i % positions.length];
              return (
                <g key={s.id}>
                  <circle cx={cx} cy={cy} r="12" fill={statusColor[s.status]?.replace("bg-", "") || "#FF6B00"} opacity="0.3">
                    <animate attributeName="r" values="12;16;12" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={cx} cy={cy} r="6" fill={statusColor[s.status]?.replace("bg-", "") || "#FF6B00"} stroke="white" strokeWidth="2" />
                </g>
              );
            })}
            {cluster && (
              <>
                <circle cx="300" cy="350" r="30" fill="none" stroke="#FF6B00" strokeWidth="1" strokeDasharray="4 2" opacity="0.4" />
                <text x="300" y="355" textAnchor="middle" fill="#FF6B00" fontSize="11" fontWeight="bold">4</text>
              </>
            )}
          </svg>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <button className="p-2 hover:bg-gray-50 border-b border-gray-100"><ZoomIn className="w-4 h-4 text-gray-600" /></button>
            <button className="p-2 hover:bg-gray-50"><ZoomOut className="w-4 h-4 text-gray-600" /></button>
          </div>
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setCluster(!cluster)} className={`p-2 hover:bg-gray-50 border-b border-gray-100 ${cluster ? "bg-[#FF6B00]/10" : ""}`}><Layers className="w-4 h-4 text-gray-600" /></button>
            <button onClick={() => setHeatmap(!heatmap)} className={`p-2 hover:bg-gray-50 border-b border-gray-100 ${heatmap ? "bg-[#FF6B00]/10" : ""}`}><RotateCw className="w-4 h-4 text-gray-600" /></button>
            <button onClick={() => setSatellite(!satellite)} className={`p-2 hover:bg-gray-50 ${satellite ? "bg-[#FF6B00]/10" : ""}`}><Satellite className="w-4 h-4 text-gray-600" /></button>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <p className="text-[11px] font-semibold text-gray-700 mb-2">Legend</p>
          <div className="space-y-1.5">
            {[{ label: "In Transit", color: "bg-blue-500" }, { label: "Delivered", color: "bg-green-500" }, { label: "Pending Pickup", color: "bg-yellow-500" }, { label: "Exception", color: "bg-red-500" }, { label: "Out for Delivery", color: "bg-purple-500" }].map((l) => (
              <div key={l.label} className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${l.color}`} /><span className="text-[11px] text-gray-600">{l.label}</span></div>
            ))}
          </div>
        </div>

        {/* Shipment Detail Card */}
        {selectedShipment && (
          <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-xl border border-gray-200 w-72 overflow-hidden">
            <div className="p-4 bg-[#0A1628] text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold">{selectedShipment.id}</span>
                <button onClick={() => setSelected(null)} className="p-1 hover:bg-white/10 rounded"><XCircle className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/80"><span>{selectedShipment.from}</span><ChevronRight className="w-3 h-3" /><span>{selectedShipment.to}</span></div>
            </div>
            <div className="p-4 space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className={`h-full rounded-full ${statusColor[selectedShipment.status]}`} style={{ width: `${selectedShipment.progress}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-500 block">Carrier</span><span className="font-medium text-[#0A1628]">{selectedShipment.carrier}</span></div>
                <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-500 block">ETA</span><span className="font-medium text-[#0A1628]">{selectedShipment.eta}</span></div>
                <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-500 block">Driver</span><span className="font-medium text-[#0A1628]">{selectedShipment.driver}</span></div>
                <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-500 block">Vehicle</span><span className="font-medium text-[#0A1628]">{selectedShipment.vehicle}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
