"use client";

import { useState } from "react";
import {
  Package,
  MapPin,
  Clock,
  TrendingUp,
  AlertTriangle,
  Settings,
  Search,
  BarChart3,
  Users,
  DollarSign,
  Wrench,
  Lock,
  Eye,
  Edit2,
  RefreshCw,
  Bell,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Cpu,
} from "lucide-react";

interface AdminLocker {
  id: string;
  name: string;
  code: string;
  type: "standard" | "drive_through" | "refrigerated" | "smart_wall";
  address: string;
  city: string;
  status: "operational" | "maintenance" | "offline";
  totalCompartments: number;
  occupied: number;
  available: number;
  collectionsToday: number;
  lastCollection: string;
  uptime: string;
  revenue: number;
  avgDwellTime: string;
  popularSize: string;
  peakHour: string;
}

const LOCKERS: AdminLocker[] = [
  { id: "LKR-001", name: "Lekki Phase 1 Locker Hub", code: "LKR-LKI-001", type: "standard", address: "14 Admiralty Way", city: "Lagos", status: "operational", totalCompartments: 74, occupied: 48, available: 26, collectionsToday: 18, lastCollection: "5 min ago", uptime: "99.8%", revenue: 245000, avgDwellTime: "18h", popularSize: "S", peakHour: "14:00" },
  { id: "LKR-002", name: "Victoria Island Smart Wall", code: "LKR-VER-002", type: "smart_wall", address: "Plot 1231, Ahmadu Bello Way", city: "Lagos", status: "operational", totalCompartments: 96, occupied: 51, available: 45, collectionsToday: 24, lastCollection: "2 min ago", uptime: "99.5%", revenue: 380000, avgDwellTime: "14h", popularSize: "S", peakHour: "12:00" },
  { id: "LKR-003", name: "Ikeja City Mall Locker", code: "LKR-IKM-003", type: "standard", address: "Obafemi Awolowo Way", city: "Lagos", status: "maintenance", totalCompartments: 53, occupied: 42, available: 11, collectionsToday: 0, lastCollection: "2 days ago", uptime: "94.2%", revenue: 125000, avgDwellTime: "24h", popularSize: "M", peakHour: "16:00" },
  { id: "LKR-004", name: "Lekki Mall Drive-Thru", code: "LKR-LKD-004", type: "drive_through", address: "14 Admiralty Road", city: "Lagos", status: "operational", totalCompartments: 75, occupied: 41, available: 34, collectionsToday: 15, lastCollection: "8 min ago", uptime: "99.9%", revenue: 290000, avgDwellTime: "12h", popularSize: "M", peakHour: "11:00" },
  { id: "LKR-005", name: "Surulere Community Locker", code: "LKR-SUR-005", type: "refrigerated", address: "56 Adeniran Ogunsanya St", city: "Lagos", status: "maintenance", totalCompartments: 43, occupied: 25, available: 18, collectionsToday: 0, lastCollection: "1 day ago", uptime: "87.3%", revenue: 95000, avgDwellTime: "20h", popularSize: "M", peakHour: "17:00" },
  { id: "LKR-006", name: "Yaba Tech Hub Locker", code: "LKR-YBA-006", type: "standard", address: "12 Herbert Macaulay Way", city: "Lagos", status: "operational", totalCompartments: 55, occupied: 33, available: 22, collectionsToday: 12, lastCollection: "12 min ago", uptime: "99.2%", revenue: 185000, avgDwellTime: "16h", popularSize: "S", peakHour: "13:00" },
  { id: "LKR-007", name: "Abuja Wuse II Locker Station", code: "LKR-ABJ-007", type: "standard", address: "22 Aguiyi-Ironsi Street", city: "Abuja", status: "operational", totalCompartments: 52, occupied: 29, available: 23, collectionsToday: 8, lastCollection: "22 min ago", uptime: "99.6%", revenue: 210000, avgDwellTime: "22h", popularSize: "L", peakHour: "15:00" },
  { id: "LKR-008", name: "Port Harcourt GRA Locker", code: "LKR-PHC-008", type: "smart_wall", address: "35 Forces Avenue", city: "Port Harcourt", status: "offline", totalCompartments: 36, occupied: 0, available: 0, collectionsToday: 0, lastCollection: "3 days ago", uptime: "0%", revenue: 72000, avgDwellTime: "0h", popularSize: "S", peakHour: "—" },
];

const TYPE_LABELS: Record<string, string> = {
  standard: "Standard", drive_through: "Drive-Through",
  refrigerated: "Refrigerated", smart_wall: "Smart Wall",
};

const TYPE_COLORS: Record<string, string> = {
  standard: "bg-gray-100 text-gray-700",
  drive_through: "bg-purple-100 text-purple-700",
  refrigerated: "bg-cyan-100 text-cyan-700",
  smart_wall: "bg-orange-100 text-orange-700",
};

const STATUS_CFG: Record<string, { color: string; bg: string; dot: string }> = {
  operational: { color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" },
  maintenance: { color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
  offline: { color: "text-red-500", bg: "bg-red-50", dot: "bg-red-500" },
};

type Tab = "overview" | "maintenance";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

export default function AdminLockersPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showMaintenanceModal, setShowMaintenanceModal] = useState<string | null>(null);
  const [maintenanceNote, setMaintenanceNote] = useState("");

  const filtered = LOCKERS.filter((l) => {
    if (filterStatus !== "all" && l.status !== filterStatus) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalCompartments = LOCKERS.reduce((a, l) => a + l.totalCompartments, 0);
  const totalOccupied = LOCKERS.reduce((a, l) => a + l.occupied, 0);
  const totalCollections = LOCKERS.reduce((a, l) => a + l.collectionsToday, 0);
  const totalRevenue = LOCKERS.reduce((a, l) => a + l.revenue, 0);
  const overallOccupancy = totalCompartments > 0 ? Math.round((totalOccupied / totalCompartments) * 100) : 0;
  const maintenanceAlerts = LOCKERS.filter((l) => l.status !== "operational");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0A1628]">Locker Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor performance, occupancy, and maintenance across all locker stations</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {([
          { key: "overview" as Tab, label: "Overview" },
          { key: "maintenance" as Tab, label: `Maintenance (${maintenanceAlerts.length})` },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === tab.key ? "bg-white text-[#0A1628] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {activeTab === "overview" && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0A1628]/5 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#0A1628]" />
                </div>
                <div>
                  <div className="text-xl font-bold text-[#0A1628]">{LOCKERS.length}</div>
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
                  <div className="text-xs text-gray-500">Total Compartments</div>
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
                  <div className="text-xs text-gray-500">Occupancy Rate</div>
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
          </div>

          {/* Per-Locker Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Name</th>
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Type</th>
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Compartments</th>
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Occupied</th>
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Available</th>
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Usage</th>
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Avg Dwell</th>
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Popular</th>
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Peak</th>
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Revenue</th>
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((locker) => {
                    const usagePct = locker.totalCompartments > 0
                      ? Math.round((locker.occupied / locker.totalCompartments) * 100) : 0;
                    const cfg = STATUS_CFG[locker.status];
                    return (
                      <tr key={locker.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition">
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-[#0A1628]">{locker.name}</div>
                          <div className="text-[10px] text-gray-400">{locker.code} · {locker.city}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[locker.type]}`}>
                            {TYPE_LABELS[locker.type]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#0A1628]">{locker.totalCompartments}</td>
                        <td className="px-4 py-3 text-sm font-medium text-[#0A1628]">{locker.occupied}</td>
                        <td className="px-4 py-3 text-sm text-[#0A1628]">{locker.available}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  usagePct > 80 ? "bg-red-500" : usagePct > 50 ? "bg-amber-500" : "bg-green-500"
                                }`}
                                style={{ width: `${usagePct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-500">{usagePct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#0A1628]">{locker.avgDwellTime}</td>
                        <td className="px-4 py-3 text-xs text-[#FF6B00] font-medium">{locker.popularSize}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{locker.peakHour}</td>
                        <td className="px-4 py-3 text-sm font-medium text-[#0A1628]">{formatCurrency(locker.revenue)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className={`text-[10px] font-medium ${cfg.color}`}>
                              {locker.status.charAt(0).toUpperCase() + locker.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-0.5">
                            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="View">
                              <Eye className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="Edit">
                              <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="Refresh">
                              <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
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
        </>
      )}

      {/* ===== MAINTENANCE TAB ===== */}
      {activeTab === "maintenance" && (
        <div className="space-y-4">
          {/* Alerts Header */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">Active Alerts ({maintenanceAlerts.length})</span>
            </div>
            {maintenanceAlerts.length === 0 && (
              <p className="text-sm text-amber-700">All lockers are operational. No active maintenance alerts.</p>
            )}
          </div>

          {/* Alert Cards */}
          <div className="grid gap-4">
            {LOCKERS.filter((l) => l.status !== "operational").map((locker) => {
              const cfg = STATUS_CFG[locker.status];
              return (
                <div key={locker.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                        {locker.status === "maintenance" ? (
                          <Wrench className={`w-5 h-5 ${cfg.color}`} />
                        ) : (
                          <XCircle className={`w-5 h-5 ${cfg.color}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0A1628]">{locker.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{locker.code} · {locker.city} · {locker.address}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {locker.status === "maintenance" ? "Under Maintenance" : "Offline"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-500">Compartments</div>
                      <div className="font-medium text-[#0A1628]">{locker.totalCompartments}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-500">Last Collection</div>
                      <div className="font-medium text-[#0A1628]">{locker.lastCollection}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-500">Uptime</div>
                      <div className={`font-medium ${parseFloat(locker.uptime) >= 95 ? "text-green-600" : "text-red-500"}`}>
                        {locker.uptime}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-gray-500">Revenue (30d)</div>
                      <div className="font-medium text-[#0A1628]">{formatCurrency(locker.revenue)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowMaintenanceModal(locker.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] text-white text-xs font-semibold rounded-lg hover:bg-[#e55f00] transition"
                    >
                      <Wrench className="w-3.5 h-3.5" /> Report Issue
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-[#0A1628] text-xs font-medium rounded-lg hover:bg-gray-200 transition">
                      <Settings className="w-3.5 h-3.5" /> Schedule Maintenance
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-[#0A1628] text-xs font-medium rounded-lg hover:bg-gray-200 transition">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Offline Alert Banner */}
          {LOCKERS.some((l) => l.status === "offline") && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-red-800">Locker Offline Alert</div>
                <p className="text-xs text-red-700 mt-1">
                  {LOCKERS.filter((l) => l.status === "offline").map((l) => l.name).join(", ")} {LOCKERS.filter((l) => l.status === "offline").length > 1 ? "are" : "is"} currently offline.
                  Customers cannot use these lockers. Physical inspection recommended.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Issue Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#0A1628]">Report Issue</h3>
              <button onClick={() => setShowMaintenanceModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Report a compartment out of service or locker malfunction for{" "}
              <span className="font-medium text-[#0A1628]">{LOCKERS.find((l) => l.id === showMaintenanceModal)?.name}</span>
            </p>
            <textarea
              value={maintenanceNote}
              onChange={(e) => setMaintenanceNote(e.target.value)}
              placeholder="Describe the issue..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setShowMaintenanceModal(null); setMaintenanceNote(""); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowMaintenanceModal(null); setMaintenanceNote(""); }}
                className="flex-1 py-2.5 bg-[#FF6B00] text-white rounded-xl text-sm font-semibold hover:bg-[#e55f00] transition"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
