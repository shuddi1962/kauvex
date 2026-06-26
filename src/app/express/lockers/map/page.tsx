"use client";

import { useState } from "react";
import {
  MapPin,
  Search,
  Filter,
  Package,
  Clock,
  ChevronDown,
  ChevronRight,
  X,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
} from "lucide-react";

interface Locker {
  id: string;
  name: string;
  type: "indoor" | "outdoor" | "drive_thru";
  address: string;
  distance: string;
  lat: number;
  lng: number;
  operatingHours: string;
  sizes: { label: string; available: number; total: number }[];
  status: "operational" | "maintenance" | "full";
  lastUpdated: string;
}

const lockers: Locker[] = [
  {
    id: "LKR-001",
    name: "Lekki Phase 1 Locker Hub",
    type: "indoor",
    address: "14 Admiralty Way, Lekki Phase 1, Lagos",
    distance: "0.8 km",
    lat: 6.4474,
    lng: 3.4326,
    operatingHours: "24/7",
    sizes: [
      { label: "Small (A4)", available: 12, total: 30 },
      { label: "Medium (A3)", available: 8, total: 20 },
      { label: "Large (A2)", available: 3, total: 10 },
      { label: "XL (Pallet)", available: 0, total: 4 },
    ],
    status: "operational",
    lastUpdated: "2 min ago",
  },
  {
    id: "LKR-002",
    name: "Victoria Island Express Locker",
    type: "outdoor",
    address: "Plot 1231, Ahmadu Bello Way, Victoria Island, Lagos",
    distance: "2.3 km",
    lat: 6.4281,
    lng: 3.4219,
    operatingHours: "24/7",
    sizes: [
      { label: "Small (A4)", available: 18, total: 40 },
      { label: "Medium (A3)", available: 14, total: 25 },
      { label: "Large (A2)", available: 6, total: 15 },
      { label: "XL (Pallet)", available: 2, total: 6 },
    ],
    status: "operational",
    lastUpdated: "5 min ago",
  },
  {
    id: "LKR-003",
    name: "Ikeja City Mall Pickup Point",
    type: "indoor",
    address: "Obafemi Awolowo Way, Ikeja, Lagos",
    distance: "12.1 km",
    lat: 6.6009,
    lng: 3.3526,
    operatingHours: "8:00 AM - 10:00 PM",
    sizes: [
      { label: "Small (A4)", available: 0, total: 20 },
      { label: "Medium (A3)", available: 2, total: 15 },
      { label: "Large (A2)", available: 1, total: 8 },
    ],
    status: "full",
    lastUpdated: "1 min ago",
  },
  {
    id: "LKR-004",
    name: "Lekki Mall Drive-Thru Locker",
    type: "drive_thru",
    address: "14 Admiralty Road, Lekki, Lagos",
    distance: "1.5 km",
    lat: 6.4441,
    lng: 3.4378,
    operatingHours: "6:00 AM - 11:00 PM",
    sizes: [
      { label: "Small (A4)", available: 22, total: 30 },
      { label: "Medium (A3)", available: 16, total: 20 },
      { label: "Large (A2)", available: 8, total: 12 },
      { label: "XL (Pallet)", available: 3, total: 5 },
    ],
    status: "operational",
    lastUpdated: "3 min ago",
  },
  {
    id: "LKR-005",
    name: "Surulere Community Locker",
    type: "outdoor",
    address: "56 Adeniran Ogunsanya Street, Surulere, Lagos",
    distance: "8.7 km",
    lat: 6.5267,
    lng: 3.3572,
    operatingHours: "24/7",
    sizes: [
      { label: "Small (A4)", available: 5, total: 15 },
      { label: "Medium (A3)", available: 0, total: 10 },
      { label: "Large (A2)", available: 2, total: 5 },
    ],
    status: "maintenance",
    lastUpdated: "15 min ago",
  },
  {
    id: "LKR-006",
    name: "Yaba Tech Hub Locker",
    type: "indoor",
    address: "12 Herbert Macaulay Way, Yaba, Lagos",
    distance: "6.2 km",
    lat: 6.5162,
    lng: 3.3899,
    operatingHours: "7:00 AM - 10:00 PM",
    sizes: [
      { label: "Small (A4)", available: 9, total: 20 },
      { label: "Medium (A3)", available: 4, total: 15 },
      { label: "Large (A2)", available: 1, total: 8 },
      { label: "XL (Pallet)", available: 0, total: 2 },
    ],
    status: "operational",
    lastUpdated: "4 min ago",
  },
];

const typeColors: Record<string, string> = {
  indoor: "bg-blue-100 text-blue-700",
  outdoor: "bg-green-100 text-green-700",
  drive_thru: "bg-purple-100 text-purple-700",
};

const statusColors: Record<string, string> = {
  operational: "text-green-600",
  maintenance: "text-amber-500",
  full: "text-red-500",
};

const statusBg: Record<string, string> = {
  operational: "bg-green-50 border-green-200",
  maintenance: "bg-amber-50 border-amber-200",
  full: "bg-red-50 border-red-200",
};

export default function LockerMapPage() {
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [filterSize, setFilterSize] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLockers = lockers.filter((l) => {
    if (filterType !== "all" && l.type !== filterType) return false;
    if (filterAvailability === "available" && l.status === "full") return false;
    if (filterAvailability === "maintenance" && l.status !== "maintenance") return false;
    if (searchQuery && !l.name.toLowerCase().includes(searchQuery.toLowerCase()) && !l.address.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterSize !== "all") {
      const sizeMap: Record<string, string> = { small: "Small (A4)", medium: "Medium (A3)", large: "Large (A2)", xl: "XL (Pallet)" };
      const s = l.sizes.find((s) => s.label === sizeMap[filterSize]);
      if (!s || s.available === 0) return false;
    }
    return true;
  });

  const totalAvailable = lockers.reduce(
    (acc, l) => acc + l.sizes.reduce((a, s) => a + s.available, 0),
    0
  );
  const totalCompartments = lockers.reduce(
    (acc, l) => acc + l.sizes.reduce((a, s) => a + s.total, 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
            <a href="/express" className="hover:text-white transition">Express</a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Locker Map</span>
          </div>
          <h1 className="text-2xl font-bold">Find a Locker Near You</h1>
          <p className="text-white/70 mt-1">Drop off or pick up packages from secure lockers across Lagos</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Sidebar - Filters & List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search lockers by name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-[#FF6B00]" />
                <span className="text-sm font-semibold text-[#0A1628]">Filters</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Size</label>
                  <select
                    value={filterSize}
                    onChange={(e) => setFilterSize(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  >
                    <option value="all">All Sizes</option>
                    <option value="small">Small (A4)</option>
                    <option value="medium">Medium (A3)</option>
                    <option value="large">Large (A2)</option>
                    <option value="xl">XL (Pallet)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  >
                    <option value="all">All Types</option>
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="drive_thru">Drive-Thru</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Status</label>
                  <select
                    value={filterAvailability}
                    onChange={(e) => setFilterAvailability(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                <div className="text-2xl font-bold text-[#0A1628]">{lockers.length}</div>
                <div className="text-xs text-gray-500">Total Lockers</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{totalAvailable}</div>
                <div className="text-xs text-gray-500">Available Slots</div>
              </div>
            </div>

            {/* Locker List */}
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {filteredLockers.map((locker) => (
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
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[locker.type]}`}>
                      {locker.type.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Navigation className="w-3 h-3" />
                      {locker.distance}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {locker.operatingHours}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${statusColors[locker.status]}`}>
                      {locker.status === "operational" && <CheckCircle2 className="w-3 h-3" />}
                      {locker.status === "maintenance" && <AlertTriangle className="w-3 h-3" />}
                      {locker.status === "full" && <Lock className="w-3 h-3" />}
                      {locker.status === "operational" ? "Open" : locker.status === "maintenance" ? "Maintenance" : "Full"}
                    </div>
                  </div>
                  {/* Size availability bars */}
                  <div className="mt-3 space-y-1.5">
                    {locker.sizes.map((s) => {
                      const pct = s.total > 0 ? (s.available / s.total) * 100 : 0;
                      return (
                        <div key={s.label}>
                          <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                            <span>{s.label}</span>
                            <span>{s.available}/{s.total}</span>
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
                </button>
              ))}
              {filteredLockers.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No lockers match your filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-3">
            <div className="bg-[#0A1628] rounded-xl overflow-hidden relative" style={{ height: "680px" }}>
              {/* Dark themed map placeholder */}
              <div className="absolute inset-0">
                {/* Grid lines */}
                <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Road-like lines */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <line x1="10%" y1="20%" x2="90%" y2="25%" stroke="#FF6B00" strokeWidth="1" opacity="0.2" />
                  <line x1="5%" y1="40%" x2="95%" y2="38%" stroke="#FF6B00" strokeWidth="1" opacity="0.2" />
                  <line x1="15%" y1="60%" x2="85%" y2="65%" stroke="#FF6B00" strokeWidth="1" opacity="0.2" />
                  <line x1="10%" y1="80%" x2="90%" y2="82%" stroke="#FF6B00" strokeWidth="1" opacity="0.2" />
                  <line x1="30%" y1="5%" x2="35%" y2="95%" stroke="#FF6B00" strokeWidth="1" opacity="0.15" />
                  <line x1="60%" y1="5%" x2="55%" y2="95%" stroke="#FF6B00" strokeWidth="1" opacity="0.15" />
                </svg>

                {/* Locker pins */}
                {filteredLockers.map((locker, idx) => {
                  const positions = [
                    { top: "22%", left: "35%" },
                    { top: "38%", left: "60%" },
                    { top: "55%", left: "25%" },
                    { top: "45%", left: "72%" },
                    { top: "68%", left: "48%" },
                    { top: "30%", left: "18%" },
                  ];
                  const pos = positions[idx % positions.length];
                  const isSelected = selectedLocker?.id === locker.id;
                  return (
                    <button
                      key={locker.id}
                      onClick={() => setSelectedLocker(locker)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
                      style={{ top: pos.top, left: pos.left }}
                    >
                      <div className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                        isSelected
                          ? "bg-[#FF6B00] scale-125 shadow-lg shadow-orange/50"
                          : locker.status === "operational"
                          ? "bg-white/20 hover:bg-[#FF6B00] hover:scale-110"
                          : locker.status === "maintenance"
                          ? "bg-amber-500/80"
                          : "bg-red-500/80"
                      }`}>
                        <MapPin className={`w-4 h-4 ${isSelected ? "text-white" : "text-white"}`} />
                      </div>
                      {/* Tooltip */}
                      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white rounded-lg shadow-xl text-left whitespace-nowrap transition-all ${
                        isSelected ? "opacity-100 visible" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                      }`}>
                        <div className="text-xs font-semibold text-[#0A1628]">{locker.name}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{locker.distance} · {locker.sizes.reduce((a, s) => a + s.available, 0)} slots free</div>
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
                      <div className="w-3 h-3 rounded-full bg-white/20 border border-white/30" />
                      Operational
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/60">
                      <div className="w-3 h-3 rounded-full bg-[#FF6B00]" />
                      Selected
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/60">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      Maintenance
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/60">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Full
                    </div>
                  </div>
                </div>

                {/* Map Title */}
                <div className="absolute top-4 left-4 text-white/40 text-xs">
                  Interactive Map — Lagos, Nigeria
                </div>
              </div>

              {/* Selected Locker Detail Panel */}
              {selectedLocker && (
                <div className="absolute top-4 right-4 w-72 bg-white rounded-xl shadow-2xl overflow-hidden z-20">
                  <div className="bg-[#0A1628] text-white p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm">{selectedLocker.name}</h3>
                        <p className="text-xs text-white/60 mt-1">{selectedLocker.address}</p>
                      </div>
                      <button onClick={() => setSelectedLocker(null)} className="text-white/60 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500">Distance</div>
                        <div className="text-sm font-bold text-[#0A1628]">{selectedLocker.distance}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500">Hours</div>
                        <div className="text-sm font-bold text-[#0A1628]">{selectedLocker.operatingHours}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[selectedLocker.type]}`}>
                        {selectedLocker.type.replace("_", " ")}
                      </span>
                      <span className={`text-xs font-medium flex items-center gap-1 ${statusColors[selectedLocker.status]}`}>
                        {selectedLocker.status === "operational" && <CheckCircle2 className="w-3 h-3" />}
                        {selectedLocker.status === "maintenance" && <AlertTriangle className="w-3 h-3" />}
                        {selectedLocker.status === "full" && <Lock className="w-3 h-3" />}
                        {selectedLocker.status.charAt(0).toUpperCase() + selectedLocker.status.slice(1)}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-[#0A1628] mb-2">Compartment Availability</h4>
                      <div className="space-y-2">
                        {selectedLocker.sizes.map((s) => {
                          const pct = s.total > 0 ? (s.available / s.total) * 100 : 0;
                          return (
                            <div key={s.label}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600">{s.label}</span>
                                <span className={`font-medium ${s.available === 0 ? "text-red-500" : "text-green-600"}`}>
                                  {s.available} / {s.total} free
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
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
                      Last updated: {selectedLocker.lastUpdated}
                    </div>

                    <button
                      disabled={selectedLocker.status === "full"}
                      className={`w-full py-2.5 rounded-lg text-sm font-semibold transition ${
                        selectedLocker.status === "full"
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-[#FF6B00] text-white hover:bg-[#e55f00]"
                      }`}
                    >
                      {selectedLocker.status === "full" ? "No Compartments Available" : "Reserve Compartment"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
