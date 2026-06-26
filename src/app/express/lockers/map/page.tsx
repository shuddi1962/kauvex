"use client";

import { useState, useMemo } from "react";
import {
  MapPin,
  Search,
  Filter,
  Package,
  Clock,
  ChevronRight,
  X,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Lock,
  List,
  Map,
  ChevronDown,
} from "lucide-react";

interface Locker {
  id: string;
  name: string;
  type: "standard" | "drive_through" | "refrigerated" | "smart_wall";
  address: string;
  distance: string;
  distanceNum: number;
  lat: number;
  lng: number;
  operatingHours: string;
  sizes: { label: string; available: number; total: number }[];
  status: "available" | "occupied" | "out_of_service";
  lastServiceCheck: string;
}

const LOCKERS: Locker[] = [
  {
    id: "LKR-001", name: "Lekki Phase 1 Locker Hub", type: "standard",
    address: "14 Admiralty Way, Lekki Phase 1, Lagos",
    distance: "0.8 km", distanceNum: 0.8, lat: 6.4474, lng: 3.4326,
    operatingHours: "24/7",
    sizes: [
      { label: "XS", available: 5, total: 10 },
      { label: "S", available: 12, total: 30 },
      { label: "M", available: 8, total: 20 },
      { label: "L", available: 3, total: 10 },
      { label: "XL", available: 0, total: 4 },
      { label: "Refrigerated", available: 0, total: 0 },
    ],
    status: "available", lastServiceCheck: "2 hours ago",
  },
  {
    id: "LKR-002", name: "Victoria Island Smart Wall", type: "smart_wall",
    address: "Plot 1231, Ahmadu Bello Way, Victoria Island, Lagos",
    distance: "2.3 km", distanceNum: 2.3, lat: 6.4281, lng: 3.4219,
    operatingHours: "24/7",
    sizes: [
      { label: "XS", available: 8, total: 15 },
      { label: "S", available: 18, total: 40 },
      { label: "M", available: 14, total: 25 },
      { label: "L", available: 6, total: 15 },
      { label: "XL", available: 2, total: 6 },
      { label: "Refrigerated", available: 3, total: 5 },
    ],
    status: "available", lastServiceCheck: "5 min ago",
  },
  {
    id: "LKR-003", name: "Ikeja City Mall Locker", type: "standard",
    address: "Obafemi Awolowo Way, Ikeja, Lagos",
    distance: "12.1 km", distanceNum: 12.1, lat: 6.6009, lng: 3.3526,
    operatingHours: "8:00 AM - 10:00 PM",
    sizes: [
      { label: "XS", available: 0, total: 8 },
      { label: "S", available: 0, total: 20 },
      { label: "M", available: 2, total: 15 },
      { label: "L", available: 1, total: 8 },
      { label: "XL", available: 0, total: 2 },
    ],
    status: "occupied", lastServiceCheck: "1 min ago",
  },
  {
    id: "LKR-004", name: "Lekki Mall Drive-Thru", type: "drive_through",
    address: "14 Admiralty Road, Lekki, Lagos",
    distance: "1.5 km", distanceNum: 1.5, lat: 6.4441, lng: 3.4378,
    operatingHours: "6:00 AM - 11:00 PM",
    sizes: [
      { label: "XS", available: 3, total: 8 },
      { label: "S", available: 22, total: 30 },
      { label: "M", available: 16, total: 20 },
      { label: "L", available: 8, total: 12 },
      { label: "XL", available: 3, total: 5 },
    ],
    status: "available", lastServiceCheck: "3 min ago",
  },
  {
    id: "LKR-005", name: "Surulere Community Locker", type: "refrigerated",
    address: "56 Adeniran Ogunsanya Street, Surulere, Lagos",
    distance: "8.7 km", distanceNum: 8.7, lat: 6.5267, lng: 3.3572,
    operatingHours: "24/7",
    sizes: [
      { label: "XS", available: 2, total: 5 },
      { label: "S", available: 5, total: 15 },
      { label: "M", available: 0, total: 10 },
      { label: "L", available: 2, total: 5 },
      { label: "Refrigerated", available: 4, total: 8 },
    ],
    status: "out_of_service", lastServiceCheck: "1 day ago",
  },
  {
    id: "LKR-006", name: "Yaba Tech Hub Locker", type: "standard",
    address: "12 Herbert Macaulay Way, Yaba, Lagos",
    distance: "6.2 km", distanceNum: 6.2, lat: 6.5162, lng: 3.3899,
    operatingHours: "7:00 AM - 10:00 PM",
    sizes: [
      { label: "XS", available: 4, total: 10 },
      { label: "S", available: 9, total: 20 },
      { label: "M", available: 4, total: 15 },
      { label: "L", available: 1, total: 8 },
      { label: "XL", available: 0, total: 2 },
    ],
    status: "available", lastServiceCheck: "4 min ago",
  },
];

const TYPE_LABELS: Record<string, string> = {
  standard: "Standard",
  drive_through: "Drive-Through",
  refrigerated: "Refrigerated",
  smart_wall: "Smart Wall",
};

const TYPE_COLORS: Record<string, string> = {
  standard: "bg-gray-100 text-gray-700",
  drive_through: "bg-purple-100 text-purple-700",
  refrigerated: "bg-cyan-100 text-cyan-700",
  smart_wall: "bg-orange-100 text-orange-700",
};

const PIN_COLORS: Record<string, string> = {
  available: "#FF6B00",
  occupied: "#3B82F6",
  out_of_service: "#EF4444",
};

type ViewMode = "map" | "list";

export default function LockerMapPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [filterSize, setFilterSize] = useState<string>("all");
  const [filterAvailable, setFilterAvailable] = useState<"available_now" | "any">("any");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLockers = useMemo(() => {
    return LOCKERS.filter((l) => {
      if (filterType !== "all" && l.type !== filterType) return false;
      if (filterAvailable === "available_now" && l.status !== "available") return false;
      if (searchQuery && !l.name.toLowerCase().includes(searchQuery.toLowerCase()) && !l.address.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterSize !== "all") {
        const s = l.sizes.find((s) => s.label === filterSize);
        if (!s || s.available === 0) return false;
      }
      return true;
    });
  }, [filterSize, filterAvailable, filterType, searchQuery]);

  const sortedByDistance = useMemo(() => {
    return [...filteredLockers].sort((a, b) => a.distanceNum - b.distanceNum);
  }, [filteredLockers]);

  const pinPositions = [
    { top: "22%", left: "35%" }, { top: "38%", left: "62%" },
    { top: "55%", left: "25%" }, { top: "42%", left: "75%" },
    { top: "68%", left: "48%" }, { top: "30%", left: "18%" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
            <a href="/express" className="hover:text-white transition">Express</a>
            <ChevronRight className="w-3 h-3" />
            <a href="/express/lockers" className="hover:text-white transition">Lockers</a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Map</span>
          </div>
          <h1 className="text-2xl font-bold">Find a Locker</h1>
          <p className="text-white/70 mt-1">Drop off or pick up packages from secure lockers</p>
        </div>
      </div>

      {/* Search & Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search lockers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-lg text-sm font-medium transition ${
                filterOpen ? "bg-[#FF6B00]/5 border-[#FF6B00] text-[#FF6B00]" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  viewMode === "map" ? "bg-white text-[#0A1628] shadow-sm" : "text-gray-500"
                }`}
              >
                <Map className="w-3.5 h-3.5" /> Map
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  viewMode === "list" ? "bg-white text-[#0A1628] shadow-sm" : "text-gray-500"
                }`}
              >
                <List className="w-3.5 h-3.5" /> List
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {filterOpen && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Size</label>
                <select
                  value={filterSize}
                  onChange={(e) => setFilterSize(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                >
                  <option value="all">All Sizes</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="Refrigerated">Refrigerated</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Availability</label>
                <select
                  value={filterAvailable}
                  onChange={(e) => setFilterAvailable(e.target.value as "available_now" | "any")}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                >
                  <option value="any">Any</option>
                  <option value="available_now">Available Now</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                >
                  <option value="all">All Types</option>
                  <option value="standard">Standard</option>
                  <option value="drive_through">Drive-Through</option>
                  <option value="refrigerated">Refrigerated</option>
                  <option value="smart_wall">Smart Wall</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* ===== MAP VIEW ===== */}
        {viewMode === "map" && (
          <div className="grid lg:grid-cols-5 gap-4">
            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {sortedByDistance.map((locker) => {
                const totalAvail = locker.sizes.reduce((a, s) => a + s.available, 0);
                return (
                  <button
                    key={locker.id}
                    onClick={() => setSelectedLocker(locker)}
                    className={`w-full text-left bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
                      selectedLocker?.id === locker.id
                        ? "border-[#FF6B00] shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#0A1628] text-sm truncate">{locker.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{locker.address}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[locker.type]}`}>
                        {TYPE_LABELS[locker.type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {locker.distance}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {locker.operatingHours}</span>
                    </div>
                    {/* Size Availability */}
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {locker.sizes.filter((s) => s.total > 0).map((s) => (
                        <span
                          key={s.label}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            s.available > 0 ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"
                          }`}
                        >
                          {s.label}: {s.available}/{s.total}
                        </span>
                      ))}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2">
                      {totalAvail} available · Last service: {locker.lastServiceCheck}
                    </div>
                  </button>
                );
              })}
              {sortedByDistance.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No lockers match your filters</p>
                </div>
              )}
            </div>

            {/* SVG Map */}
            <div className="lg:col-span-3">
              <div className="bg-[#0A1628] rounded-xl overflow-hidden relative" style={{ height: "700px" }}>
                <div className="absolute inset-0">
                  {/* Grid */}
                  <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  {/* Roads */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <line x1="10%" y1="20%" x2="90%" y2="25%" stroke="#FF6B00" strokeWidth="1" opacity="0.15" />
                    <line x1="5%" y1="40%" x2="95%" y2="38%" stroke="#FF6B00" strokeWidth="1" opacity="0.15" />
                    <line x1="15%" y1="60%" x2="85%" y2="65%" stroke="#FF6B00" strokeWidth="1" opacity="0.15" />
                    <line x1="10%" y1="80%" x2="90%" y2="82%" stroke="#FF6B00" strokeWidth="1" opacity="0.15" />
                    <line x1="30%" y1="5%" x2="35%" y2="95%" stroke="#FF6B00" strokeWidth="1" opacity="0.1" />
                    <line x1="60%" y1="5%" x2="55%" y2="95%" stroke="#FF6B00" strokeWidth="1" opacity="0.1" />
                  </svg>

                  {/* Pins */}
                  {filteredLockers.map((locker, idx) => {
                    const pos = pinPositions[idx % pinPositions.length];
                    const isSelected = selectedLocker?.id === locker.id;
                    const color = PIN_COLORS[locker.status];
                    return (
                      <button
                        key={locker.id}
                        onClick={() => setSelectedLocker(locker)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
                        style={{ top: pos.top, left: pos.left }}
                      >
                        <div
                          className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                            isSelected ? "scale-125 shadow-lg" : "hover:scale-110"
                          }`}
                          style={{ backgroundColor: isSelected ? color : `${color}CC` }}
                        >
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white rounded-lg shadow-xl text-left whitespace-nowrap transition-all ${
                          isSelected ? "opacity-100 visible" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                        }`}>
                          <div className="text-xs font-semibold text-[#0A1628]">{locker.name}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{locker.distance} · {locker.sizes.reduce((a, s) => a + s.available, 0)} free</div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 -mt-1" />
                        </div>
                      </button>
                    );
                  })}

                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-xs text-white/70 font-medium mb-2">Legend</div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[10px] text-white/60">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FF6B00" }} /> Available
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-white/60">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3B82F6" }} /> All Occupied
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-white/60">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#EF4444" }} /> Out of Service
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-4 left-4 text-white/40 text-xs">
                    Interactive Map — Lagos, Nigeria
                  </div>
                </div>

                {/* Selected Locker Detail Panel */}
                {selectedLocker && (
                  <div className="absolute top-4 right-4 w-72 bg-white rounded-xl shadow-2xl overflow-hidden z-20">
                    <div className="bg-[#0A1628] text-white p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm truncate">{selectedLocker.name}</h3>
                          <p className="text-xs text-white/60 mt-1">{selectedLocker.address}</p>
                        </div>
                        <button onClick={() => setSelectedLocker(null)} className="text-white/60 hover:text-white shrink-0 ml-2">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-[10px] text-gray-500">Distance</div>
                          <div className="text-sm font-bold text-[#0A1628]">{selectedLocker.distance}</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-[10px] text-gray-500">Hours</div>
                          <div className="text-sm font-bold text-[#0A1628]">{selectedLocker.operatingHours}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[selectedLocker.type]}`}>
                          {TYPE_LABELS[selectedLocker.type]}
                        </span>
                        <span className={`text-xs font-medium flex items-center gap-1 ${
                          selectedLocker.status === "available" ? "text-green-600" :
                          selectedLocker.status === "occupied" ? "text-blue-500" : "text-red-500"
                        }`}>
                          {selectedLocker.status === "available" && <CheckCircle2 className="w-3 h-3" />}
                          {selectedLocker.status === "out_of_service" && <AlertTriangle className="w-3 h-3" />}
                          {selectedLocker.status === "occupied" && <Lock className="w-3 h-3" />}
                          {selectedLocker.status === "available" ? "Available" :
                           selectedLocker.status === "occupied" ? "All Occupied" : "Out of Service"}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-[#0A1628] mb-2">Compartments</h4>
                        <div className="space-y-1.5">
                          {selectedLocker.sizes.filter((s) => s.total > 0).map((s) => {
                            const pct = s.total > 0 ? (s.available / s.total) * 100 : 0;
                            return (
                              <div key={s.label}>
                                <div className="flex justify-between text-xs mb-0.5">
                                  <span className="text-gray-600">{s.label}</span>
                                  <span className={`font-medium ${s.available === 0 ? "text-red-500" : "text-green-600"}`}>
                                    {s.available}/{s.total}
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      pct > 50 ? "bg-green-500" : pct > 20 ? "bg-amber-500" : "bg-red-500"
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="text-[10px] text-gray-400 text-right">
                        Last service: {selectedLocker.lastServiceCheck}
                      </div>

                      <a
                        href="/express/lockers"
                        className={`block w-full py-2.5 rounded-lg text-sm font-semibold text-center transition ${
                          selectedLocker.status === "available"
                            ? "bg-[#FF6B00] text-white hover:bg-[#e55f00]"
                            : "bg-gray-100 text-gray-400 pointer-events-none"
                        }`}
                      >
                        {selectedLocker.status === "available" ? "Use This Locker" : "Not Available"}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== LIST VIEW ===== */}
        {viewMode === "list" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Name</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Type</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Distance</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Available Sizes</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Last Service</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedByDistance.map((locker) => (
                    <tr
                      key={locker.id}
                      className="border-b border-gray-50 hover:bg-gray-50/30 transition cursor-pointer"
                      onClick={() => { setSelectedLocker(locker); setViewMode("map"); }}
                    >
                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-[#0A1628]">{locker.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{locker.address}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[locker.type]}`}>
                          {TYPE_LABELS[locker.type]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#0A1628]">{locker.distance}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {locker.sizes.filter((s) => s.total > 0).map((s) => (
                            <span
                              key={s.label}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                s.available > 0 ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"
                              }`}
                            >
                              {s.label}:{s.available}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">{locker.lastServiceCheck}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${
                            locker.status === "available" ? "bg-green-500" :
                            locker.status === "occupied" ? "bg-blue-500" : "bg-red-500"
                          }`} />
                          <span className="text-xs text-gray-600 capitalize">{locker.status.replace("_", " ")}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sortedByDistance.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No lockers match your filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
