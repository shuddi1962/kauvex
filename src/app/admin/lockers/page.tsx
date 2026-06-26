"use client";

import { useState } from "react";
import {
  Package,
  MapPin,
  Clock,
  TrendingUp,
  AlertTriangle,
  Settings,
  Eye,
  Edit2,
  RefreshCw,
  Search,
  BarChart3,
  Users,
  DollarSign,
  Wrench,
  CheckCircle2,
  XCircle,
  Lock,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";

interface AdminLocker {
  id: string;
  name: string;
  code: string;
  type: "indoor" | "outdoor" | "drive_thru";
  address: string;
  city: string;
  status: "operational" | "maintenance" | "offline";
  totalCompartments: number;
  occupiedCompartments: number;
  collectionsToday: number;
  lastCollection: string;
  uptime: string;
  revenue30d: number;
  avgOccupancy: string;
}

const adminLockers: AdminLocker[] = [
  { id: "LKR-001", name: "Lekki Phase 1 Locker Hub", code: "LKR-LKI-001", type: "indoor", address: "14 Admiralty Way", city: "Lagos", status: "operational", totalCompartments: 64, occupiedCompartments: 41, collectionsToday: 18, lastCollection: "5 min ago", uptime: "99.8%", revenue30d: 245000, avgOccupancy: "64%" },
  { id: "LKR-002", name: "Victoria Island Express Locker", code: "LKR-VER-002", type: "outdoor", address: "Plot 1231, Ahmadu Bello Way", city: "Lagos", status: "operational", totalCompartments: 86, occupiedCompartments: 48, collectionsToday: 24, lastCollection: "2 min ago", uptime: "99.5%", revenue30d: 380000, avgOccupancy: "56%" },
  { id: "LKR-003", name: "Ikeja City Mall Pickup Point", code: "LKR-IKM-003", type: "indoor", address: "Obafemi Awolowo Way", city: "Lagos", status: "maintenance", totalCompartments: 43, occupiedCompartments: 41, collectionsToday: 0, lastCollection: "2 days ago", uptime: "94.2%", revenue30d: 125000, avgOccupancy: "95%" },
  { id: "LKR-004", name: "Lekki Mall Drive-Thru Locker", code: "LKR-LKD-004", type: "drive_thru", address: "14 Admiralty Road", city: "Lagos", status: "operational", totalCompartments: 67, occupiedCompartments: 38, collectionsToday: 15, lastCollection: "8 min ago", uptime: "99.9%", revenue30d: 290000, avgOccupancy: "57%" },
  { id: "LKR-005", name: "Surulere Community Locker", code: "LKR-SUR-005", type: "outdoor", address: "56 Adeniran Ogunsanya St", city: "Lagos", status: "maintenance", totalCompartments: 30, occupiedCompartments: 23, collectionsToday: 0, lastCollection: "1 day ago", uptime: "87.3%", revenue30d: 95000, avgOccupancy: "77%" },
  { id: "LKR-006", name: "Yaba Tech Hub Locker", code: "LKR-YBA-006", type: "indoor", address: "12 Herbert Macaulay Way", city: "Lagos", status: "operational", totalCompartments: 45, occupiedCompartments: 31, collectionsToday: 12, lastCollection: "12 min ago", uptime: "99.2%", revenue30d: 185000, avgOccupancy: "69%" },
  { id: "LKR-007", name: "Abuja Wuse II Locker Station", code: "LKR-ABJ-007", type: "indoor", address: "22 Aguiyi-Ironsi Street", city: "Abuja", status: "operational", totalCompartments: 52, occupiedCompartments: 29, collectionsToday: 8, lastCollection: "22 min ago", uptime: "99.6%", revenue30d: 210000, avgOccupancy: "56%" },
  { id: "LKR-008", name: "Port Harcourt GRA Locker", code: "LKR-PHC-008", type: "outdoor", address: "35 Forces Avenue", city: "Port Harcourt", status: "offline", totalCompartments: 36, occupiedCompartments: 0, collectionsToday: 0, lastCollection: "3 days ago", uptime: "0%", revenue30d: 72000, avgOccupancy: "0%" },
];

const typeColors: Record<string, string> = {
  indoor: "bg-blue-100 text-blue-700",
  outdoor: "bg-green-100 text-green-700",
  drive_thru: "bg-purple-100 text-purple-700",
};

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  operational: { color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" },
  maintenance: { color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
  offline: { color: "text-red-500", bg: "bg-red-50", dot: "bg-red-500" },
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export default function AdminLockersPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = adminLockers.filter((l) => {
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalCompartments = adminLockers.reduce((a, l) => a + l.totalCompartments, 0);
  const totalOccupied = adminLockers.reduce((a, l) => a + l.occupiedCompartments, 0);
  const totalCollections = adminLockers.reduce((a, l) => a + l.collectionsToday, 0);
  const totalRevenue = adminLockers.reduce((a, l) => a + l.revenue30d, 0);
  const overallOccupancy = totalCompartments > 0 ? Math.round((totalOccupied / totalCompartments) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0A1628]">Locker Management</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor and manage all locker stations across locations</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0A1628]/5 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#0A1628]" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#0A1628]">{adminLockers.length}</div>
              <div className="text-xs text-gray-500">Total Lockers</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#0A1628]">{totalCompartments}</div>
              <div className="text-xs text-gray-500">Compartments</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#0A1628]">{overallOccupancy}%</div>
              <div className="text-xs text-gray-500">Occupancy</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#0A1628]">{totalCollections}</div>
              <div className="text-xs text-gray-500">Collections Today</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#0A1628]">{formatCurrency(totalRevenue)}</div>
              <div className="text-xs text-gray-500">Revenue (30d)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Alerts */}
      {adminLockers.some((l) => l.status !== "operational") && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Maintenance Alerts</span>
          </div>
          <div className="space-y-2">
            {adminLockers.filter((l) => l.status !== "operational").map((l) => {
              const cfg = statusConfig[l.status];
              return (
                <div key={l.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    <div>
                      <div className="text-sm font-medium text-[#0A1628]">{l.name}</div>
                      <div className="text-xs text-gray-500">{l.code} · {l.city}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {l.status === "maintenance" ? "Under Maintenance" : "Offline"}
                    </span>
                    <button className="text-xs text-[#FF6B00] hover:underline font-medium flex items-center gap-1">
                      <Wrench className="w-3 h-3" /> Resolve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search lockers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
        >
          <option value="all">All Status</option>
          <option value="operational">Operational</option>
          <option value="maintenance">Maintenance</option>
          <option value="offline">Offline</option>
        </select>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-[#FF6B00] text-white text-sm font-medium rounded-lg hover:bg-[#e55f00] transition">
          <MapPin className="w-4 h-4" /> Add Locker
        </button>
      </div>

      {/* Lockers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Locker</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Compartments</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Occupancy</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Collections</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Uptime</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Revenue (30d)</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((locker) => {
                const occupancyPct = locker.totalCompartments > 0
                  ? Math.round((locker.occupiedCompartments / locker.totalCompartments) * 100)
                  : 0;
                const cfg = statusConfig[locker.status];
                return (
                  <tr key={locker.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition">
                    <td className="px-5 py-4">
                      <div>
                        <div className="text-sm font-semibold text-[#0A1628]">{locker.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{locker.code} · {locker.city}</div>
                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {locker.address}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[locker.type]}`}>
                        {locker.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className={`text-xs font-medium ${cfg.color}`}>
                          {locker.status.charAt(0).toUpperCase() + locker.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#0A1628]">
                      {locker.occupiedCompartments}/{locker.totalCompartments}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              occupancyPct > 80 ? "bg-red-500" : occupancyPct > 50 ? "bg-amber-500" : "bg-green-500"
                            }`}
                            style={{ width: `${occupancyPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{occupancyPct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-[#0A1628]">{locker.collectionsToday}</div>
                      <div className="text-xs text-gray-400">Last: {locker.lastCollection}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium ${parseFloat(locker.uptime) >= 99 ? "text-green-600" : parseFloat(locker.uptime) >= 95 ? "text-amber-600" : "text-red-500"}`}>
                        {locker.uptime}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-[#0A1628]">
                      {formatCurrency(locker.revenue30d)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="View Details">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="Edit">
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="Refresh Status">
                          <RefreshCw className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No lockers match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
