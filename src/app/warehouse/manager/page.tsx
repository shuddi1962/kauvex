"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Truck,
  BarChart3,
  MapPin,
  Target,
  RefreshCw,
  Eye,
  XCircle,
  Timer,
  Trophy,
  Medal,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  AlertOctagon,
  Server,
  PackageX,
  ChevronRight,
  Boxes,
  ShoppingCart,
  ClipboardList,
  TimerIcon,
  Warehouse,
} from "lucide-react";

type Tab = "operations" | "inbound" | "outbound" | "staff" | "exceptions";

interface WarehouseData {
  warehouse: { id: string; name: string; code: string; city: string; status: string };
  operations: {
    ordersInQueue: number;
    ordersPicking: number;
    ordersPacking: number;
    ordersAwaitingDispatch: number;
    ordersCompleted: number;
    staffOnShift: number;
    staffTotal: number;
    staffUtilization: number;
    avgPickTime: number;
    avgPackTime: number;
    ordersPerHour: number;
    targetThroughput: number;
    actualThroughput: number;
  };
  hourlyThroughput: { hour: string; completed: number }[];
  staffPerformance: {
    id: string;
    name: string;
    role: string;
    status: string;
    tasksToday: number;
    accuracy: number;
    avgTime: number;
  }[];
  inbound: {
    id: string;
    supplier_name: string;
    item_count: number;
    unit_count: number;
    status: string;
    expected_at: string | null;
    received_at: string | null;
    dock_bay: string;
  }[];
  outbound: {
    id: string;
    order_count: number;
    item_count: number;
    carrier: string;
    status: string;
    depart_by: string;
    priority: string;
  }[];
  exceptions: {
    id: string;
    type: string;
    order_id: string;
    product_name: string;
    severity: string;
    reported_by: string;
    reported_at: string;
    status: string;
    notes: string;
  }[];
  openExceptions: number;
  lastUpdated: string;
}

const fallbackData: WarehouseData = {
  warehouse: { id: "WH-LAG-001", name: "Lagos Fulfillment Center", code: "LAG-FC", city: "Lagos", status: "active" },
  operations: {
    ordersInQueue: 67,
    ordersPicking: 23,
    ordersPacking: 14,
    ordersAwaitingDispatch: 31,
    ordersCompleted: 342,
    staffOnShift: 18,
    staffTotal: 22,
    staffUtilization: 82,
    avgPickTime: 6.4,
    avgPackTime: 4.8,
    ordersPerHour: 38,
    targetThroughput: 45,
    actualThroughput: 342,
  },
  hourlyThroughput: [
    { hour: "6AM", completed: 12 },
    { hour: "7AM", completed: 28 },
    { hour: "8AM", completed: 42 },
    { hour: "9AM", completed: 55 },
    { hour: "10AM", completed: 62 },
    { hour: "11AM", completed: 48 },
    { hour: "12PM", completed: 35 },
    { hour: "1PM", completed: 28 },
    { hour: "2PM", completed: 32 },
  ],
  staffPerformance: [
    { id: "STF-001", name: "Chidi Okoro", role: "Picker", status: "active", tasksToday: 52, accuracy: 99.8, avgTime: 6.2 },
    { id: "STF-002", name: "Ada Okafor", role: "Picker", status: "active", tasksToday: 48, accuracy: 99.5, avgTime: 6.8 },
    { id: "STF-003", name: "Emeka Nwachukwu", role: "Packer", status: "active", tasksToday: 45, accuracy: 99.9, avgTime: 4.5 },
    { id: "STF-004", name: "Blessing Ade", role: "Picker", status: "active", tasksToday: 41, accuracy: 98.8, avgTime: 7.1 },
    { id: "STF-005", name: "Tunde Balogun", role: "Packer", status: "active", tasksToday: 39, accuracy: 99.2, avgTime: 5.0 },
    { id: "STF-006", name: "Ngozi Eze", role: "Picker", status: "break", tasksToday: 38, accuracy: 99.0, avgTime: 7.3 },
    { id: "STF-007", name: "Yemi Adekunle", role: "Loader", status: "active", tasksToday: 35, accuracy: 100, avgTime: 3.2 },
    { id: "STF-008", name: "Funke Akindele", role: "Picker", status: "active", tasksToday: 33, accuracy: 97.5, avgTime: 8.0 },
  ],
  inbound: [
    { id: "INB-00412", supplier_name: "TechHub Electronics", item_count: 5, unit_count: 250, status: "received", expected_at: null, received_at: "10:15 AM", dock_bay: "Bay 1" },
    { id: "INB-00413", supplier_name: "Fashion House NG", item_count: 12, unit_count: 480, status: "in_transit", expected_at: "2:30 PM", received_at: null, dock_bay: "Bay 2" },
    { id: "INB-00414", supplier_name: "GadgetWorld", item_count: 8, unit_count: 120, status: "scheduled", expected_at: "4:00 PM", received_at: null, dock_bay: "Bay 3" },
    { id: "INB-00415", supplier_name: "Home Essentials Co.", item_count: 3, unit_count: 150, status: "received", expected_at: null, received_at: "9:45 AM", dock_bay: "Bay 1" },
  ],
  outbound: [
    { id: "OUT-00891", order_count: 28, item_count: 45, carrier: "DHL", status: "loading", depart_by: "3:00 PM", priority: "express" },
    { id: "OUT-00892", order_count: 35, item_count: 62, carrier: "FedEx", status: "ready", depart_by: "4:30 PM", priority: "standard" },
    { id: "OUT-00893", order_count: 18, item_count: 22, carrier: "Aramex", status: "loading", depart_by: "3:00 PM", priority: "express" },
    { id: "OUT-00894", order_count: 42, item_count: 58, carrier: "GIG Logistics", status: "scheduled", depart_by: "5:00 PM", priority: "economy" },
  ],
  exceptions: [
    { id: "EXC-001", type: "damaged", order_id: "KAU-3921", product_name: "Wireless Earbuds Pro", severity: "high", reported_by: "Chidi Okoro", reported_at: "11:30 AM", status: "open", notes: "Item found damaged during pick — earbud casing cracked" },
    { id: "EXC-002", type: "mismatch", order_id: "KAU-3918", product_name: "iPhone 15 Case", severity: "medium", reported_by: "Ada Okafor", reported_at: "10:45 AM", status: "resolved", notes: "SKU mismatch — wrong variant in bin B-04-1. Corrected." },
    { id: "EXC-003", type: "shortage", order_id: "KAU-3915", product_name: "Smart Watch X1", severity: "high", reported_by: "Emeka Nwachukwu", reported_at: "9:20 AM", status: "open", notes: "Bin shows 5 units but only 3 found. Audit requested." },
    { id: "EXC-004", type: "label_error", order_id: "KAU-3912", product_name: "Organic Green Tea Box", severity: "low", reported_by: "Blessing Ade", reported_at: "8:50 AM", status: "resolved", notes: "Shipping label printed with wrong address. Reprinted." },
  ],
  openExceptions: 2,
  lastUpdated: new Date().toISOString(),
};

const floorPlanZones = [
  { id: "receiving", label: "Receiving", color: "bg-blue-500", borderColor: "border-blue-400", textColor: "text-blue-100", gridArea: "1 / 1 / 3 / 3", activity: 85 },
  { id: "storage-a", label: "Storage A", color: "bg-gray-600", borderColor: "border-gray-500", textColor: "text-gray-300", gridArea: "1 / 3 / 2 / 5", activity: 60 },
  { id: "storage-b", label: "Storage B", color: "bg-gray-600", borderColor: "border-gray-500", textColor: "text-gray-300", gridArea: "2 / 3 / 3 / 5", activity: 45 },
  { id: "picking", label: "Picking Zone", color: "bg-orange-500", borderColor: "border-orange-400", textColor: "text-orange-100", gridArea: "1 / 5 / 3 / 7", activity: 92 },
  { id: "packing", label: "Packing Zone", color: "bg-green-500", borderColor: "border-green-400", textColor: "text-green-100", gridArea: "3 / 1 / 5 / 4", activity: 78 },
  { id: "staging", label: "Dispatch / Staging", color: "bg-red-500", borderColor: "border-red-400", textColor: "text-red-100", gridArea: "3 / 4 / 5 / 6", activity: 55 },
  { id: "quarantine", label: "Quarantine", color: "bg-purple-500", borderColor: "border-purple-400", textColor: "text-purple-100", gridArea: "3 / 6 / 5 / 7", activity: 12 },
];

const staffLocations = [
  { id: "s1", name: "Chidi", zone: "picking", top: "25%", left: "72%", color: "bg-orange-400" },
  { id: "s2", name: "Ada", zone: "picking", top: "45%", left: "80%", color: "bg-orange-400" },
  { id: "s3", name: "Emeka", zone: "packing", top: "72%", left: "22%", color: "bg-green-400" },
  { id: "s4", name: "Blessing", zone: "picking", top: "35%", left: "65%", color: "bg-orange-400" },
  { id: "s5", name: "Tunde", zone: "packing", top: "80%", left: "35%", color: "bg-green-400" },
  { id: "s6", name: "Ngozi", zone: "receiving", top: "30%", left: "12%", color: "bg-blue-400" },
  { id: "s7", name: "Yemi", zone: "staging", top: "70%", left: "55%", color: "bg-red-400" },
  { id: "s8", name: "Funke", zone: "picking", top: "55%", left: "75%", color: "bg-orange-400" },
];

const statusColors: Record<string, string> = {
  received: "bg-green-100 text-green-700",
  in_transit: "bg-blue-100 text-blue-700",
  scheduled: "bg-gray-100 text-gray-600",
  loading: "bg-amber-100 text-amber-700",
  ready: "bg-green-100 text-green-700",
  open: "bg-red-100 text-red-700",
  resolved: "bg-green-100 text-green-700",
};

const severityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-600",
};

const staffStatusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  break: "bg-amber-100 text-amber-700",
  offline: "bg-gray-100 text-gray-600",
};

export default function WarehouseManagerPage() {
  const [activeTab, setActiveTab] = useState<Tab>("operations");
  const [data, setData] = useState<WarehouseData>(fallbackData);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Just now");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/warehouse/manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warehouse_id: "WH-LAG-001" }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setData(json.data);
          setLastUpdated("Just now");
        }
      }
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const ops = data.operations;
  const maxHourly = Math.max(...data.hourlyThroughput.map((h) => h.completed), 1);
  const throughputPct = ops.targetThroughput > 0 ? Math.round((ops.actualThroughput / (ops.targetThroughput * 8)) * 100) : 0;

  const pickerLeader = [...data.staffPerformance].filter((s) => s.role === "Picker").sort((a, b) => b.tasksToday - a.tasksToday)[0];
  const packerLeader = [...data.staffPerformance].filter((s) => s.role === "Packer").sort((a, b) => b.accuracy - a.accuracy)[0];
  const weeklyChampion = [...data.staffPerformance].sort((a, b) => b.tasksToday - a.tasksToday)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0A1628]">Real-Time Operations Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data.warehouse.name} ({data.warehouse.code}) — Live monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
          <span className="text-[10px] text-gray-400">Updated: {lastUpdated}</span>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {(
          [
            { id: "operations", label: "Live Operations" },
            { id: "inbound", label: "Inbound" },
            { id: "outbound", label: "Outbound" },
            { id: "staff", label: "Staff Performance" },
            { id: "exceptions", label: "Exceptions" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.id ? "bg-white text-[#0A1628] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.id === "exceptions" && data.openExceptions > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-bold">
                {data.openExceptions}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ===== OPERATIONS TAB ===== */}
      {activeTab === "operations" && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-3">
            {[
              { label: "In Queue", value: ops.ordersInQueue, icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
              { label: "Picking", value: ops.ordersPicking, icon: Package, color: "bg-orange-50 text-orange-600" },
              { label: "Packing", value: ops.ordersPacking, icon: Boxes, color: "bg-green-50 text-green-600" },
              { label: "Awaiting Dispatch", value: ops.ordersAwaitingDispatch, icon: Truck, color: "bg-red-50 text-red-600" },
              { label: "Staff on Shift", value: `${ops.staffOnShift}/${ops.staffTotal}`, icon: Users, color: "bg-[#0A1628]/5 text-[#0A1628]" },
              { label: "Staff Utilization", value: `${ops.staffUtilization}%`, icon: TrendingUp, color: "bg-purple-50 text-purple-600", bar: true, barPct: ops.staffUtilization },
              { label: "Avg Pick Time", value: `${ops.avgPickTime} min`, icon: Timer, color: "bg-amber-50 text-amber-600" },
              { label: "Avg Pack Time", value: `${ops.avgPackTime} min`, icon: TimerIcon, color: "bg-amber-50 text-amber-600" },
              { label: "Orders/Hour", value: ops.ordersPerHour, icon: Zap, color: "bg-[#FF6B00]/10 text-[#FF6B00]" },
              { label: "Target vs Actual", value: `${throughputPct}%`, icon: Target, color: throughputPct >= 90 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600" },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${m.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[#0A1628]">{m.value}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{m.label}</div>
                  {"bar" in m && m.bar && (
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full bg-[#FF6B00] rounded-full transition-all"
                        style={{ width: `${m.barPct}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Floor Plan + Throughput */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Interactive Floor Plan */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#0A1628]">Operations Map</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Receiving", color: "bg-blue-500" },
                    { label: "Picking", color: "bg-orange-500" },
                    { label: "Packing", color: "bg-green-500" },
                    { label: "Dispatch", color: "bg-red-500" },
                    { label: "Quarantine", color: "bg-purple-500" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${l.color}`} />
                      <span className="text-[9px] text-gray-500">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="relative bg-[#0A1628] rounded-xl overflow-hidden"
                style={{ minHeight: 340 }}
              >
                {/* Grid pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-10">
                  <defs>
                    <pattern id="opGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#opGrid)" />
                </svg>

                {/* Zone grid */}
                <div
                  className="relative z-10 p-3 gap-2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, 1fr)",
                    gridTemplateRows: "repeat(4, 1fr)",
                    gridTemplateAreas: `
                      "receiving receiving storage-a storage-a picking picking"
                      "receiving receiving storage-b storage-b picking picking"
                      "packing packing packing staging staging quarantine"
                      "packing packing packing staging staging quarantine"
                    `,
                    minHeight: 300,
                  }}
                >
                  {floorPlanZones.map((zone) => (
                    <div
                      key={zone.id}
                      className={`${zone.color}/20 border-2 ${zone.borderColor} rounded-lg p-3 flex flex-col justify-between hover:brightness-110 transition cursor-pointer relative`}
                      style={{ gridArea: zone.id.replace("-", "") === "storagea" ? "storage-a" : zone.id.replace("-", "") === "storageb" ? "storage-b" : zone.id === "storage-a" ? "storage-a" : zone.id === "storage-b" ? "storage-b" : zone.id }}
                    >
                      <div>
                        <div className={`text-[10px] font-semibold ${zone.textColor} uppercase tracking-wider`}>{zone.label}</div>
                        <div className="text-lg font-bold text-white mt-1">{zone.activity}%</div>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/50 rounded-full transition-all"
                          style={{ width: `${zone.activity}%` }}
                        />
                      </div>
                      {/* Moving indicator dot */}
                      <div className="absolute top-2 right-2">
                        <div className={`w-2 h-2 rounded-full ${zone.color} animate-pulse`} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Staff location dots */}
                {staffLocations.map((s) => (
                  <div
                    key={s.id}
                    className="absolute z-20 group"
                    style={{ top: s.top, left: s.left }}
                    title={s.name}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full ${s.color} border-2 border-white shadow-lg animate-pulse`} />
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-white/70 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
                      {s.name}
                    </div>
                  </div>
                ))}

                <div className="absolute bottom-2 right-3 text-[10px] text-white/30 z-10">
                  Updated: {lastUpdated}
                </div>
              </div>
            </div>

            {/* Throughput Chart + Bottleneck */}
            <div className="space-y-6">
              {/* Bar Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Hourly Throughput</h3>
                <div className="flex items-end gap-1.5 h-44">
                  {data.hourlyThroughput.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <span className="text-[9px] text-gray-400 font-medium">{h.completed}</span>
                      <div
                        className="w-full bg-[#FF6B00] rounded-t transition-all hover:bg-[#e55f00]"
                        style={{ height: `${(h.completed / maxHourly) * 100}%`, minHeight: 4 }}
                      />
                      <span className="text-[8px] text-gray-400 mt-0.5">{h.hour}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Productivity (horizontal bars) */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Staff Productivity</h3>
                <div className="space-y-2.5">
                  {data.staffPerformance.slice(0, 6).map((s) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-28 truncate">{s.name}</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF6B00] rounded-full transition-all"
                          style={{ width: `${(s.tasksToday / 55) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#0A1628] w-8 text-right">{s.tasksToday}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottleneck Detection */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-[#0A1628] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#FF6B00]" />
                  Bottleneck Detection
                </h3>
                {ops.ordersPacking < ops.ordersPicking ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-700 font-medium">
                      Packing is the bottleneck — {ops.ordersPicking} orders waiting for packing but only {ops.ordersPacking} in pack queue
                    </p>
                    <p className="text-[10px] text-red-600 mt-1.5 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Suggestion: Reallocate 2 pickers to packing
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-700 font-medium">Workflow balanced — no bottlenecks detected</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] text-white text-xs font-semibold rounded-lg hover:bg-[#e55f00] transition">
                <Package className="w-3.5 h-3.5" /> New Pick Task
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-[#0A1628] text-white text-xs font-semibold rounded-lg hover:bg-[#0d1f3c] transition">
                <Truck className="w-3.5 h-3.5" /> Assign Shipment
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-[#0A1628] text-xs font-semibold rounded-lg hover:bg-gray-200 transition">
                <Shield className="w-3.5 h-3.5" /> Quarantine Item
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-[#0A1628] text-xs font-semibold rounded-lg hover:bg-gray-200 transition">
                <BarChart3 className="w-3.5 h-3.5" /> View Reports
              </button>
            </div>
          </div>

          {/* Staff Leaderboard (inline in operations tab) */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Today&apos;s Leaderboard
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {pickerLeader && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                  <Trophy className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                  <div className="text-[10px] text-orange-600 font-semibold uppercase tracking-wider">Top Picker</div>
                  <div className="text-sm font-bold text-[#0A1628] mt-1">{pickerLeader.name}</div>
                  <div className="text-xs text-gray-500">{pickerLeader.tasksToday} orders picked</div>
                </div>
              )}
              {packerLeader && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <Medal className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <div className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">Most Accurate Packer</div>
                  <div className="text-sm font-bold text-[#0A1628] mt-1">{packerLeader.name}</div>
                  <div className="text-xs text-gray-500">{packerLeader.accuracy.toFixed(1)}% accuracy</div>
                </div>
              )}
              {weeklyChampion && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                  <div className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider">Weekly Champion</div>
                  <div className="text-sm font-bold text-[#0A1628] mt-1">{weeklyChampion.name}</div>
                  <div className="text-xs text-gray-500">{weeklyChampion.tasksToday} tasks today</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== INBOUND TAB ===== */}
      {activeTab === "inbound" && (
        <div className="space-y-4">
          {/* Docking Bay Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Docking Bay Assignments</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["Bay 1", "Bay 2", "Bay 3", "Bay 4"].map((bay) => {
                const shipment = data.inbound.find((s) => s.dock_bay === bay && s.status !== "received");
                return (
                  <div key={bay} className={`rounded-lg p-3 border-2 ${shipment ? "border-[#FF6B00] bg-[#FF6B00]/5" : "border-gray-200 bg-gray-50"}`}>
                    <div className="text-xs font-semibold text-[#0A1628]">{bay}</div>
                    {shipment ? (
                      <div className="mt-1">
                        <div className="text-[10px] text-gray-500">{shipment.supplier_name}</div>
                        <div className="text-[10px] font-mono text-[#FF6B00]">{shipment.id}</div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400 mt-1">Available</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inbound Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-semibold text-[#0A1628]">Scheduled Arrivals</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Shipment</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Supplier</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Items</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Units</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Dock</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">ETA / Received</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.inbound.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                      <td className="px-5 py-3 text-sm font-mono font-medium text-[#FF6B00]">{s.id}</td>
                      <td className="px-5 py-3 text-sm text-[#0A1628]">{s.supplier_name}</td>
                      <td className="px-5 py-3 text-sm text-right text-[#0A1628]">{s.item_count}</td>
                      <td className="px-5 py-3 text-sm text-right font-bold text-[#0A1628]">{s.unit_count}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{s.dock_bay}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[s.status] || "bg-gray-100 text-gray-600"}`}>
                          {s.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{s.received_at || s.expected_at}</td>
                      <td className="px-5 py-3">
                        <button className="text-xs text-[#FF6B00] hover:underline font-medium flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== OUTBOUND TAB ===== */}
      {activeTab === "outbound" && (
        <div className="space-y-4">
          {/* Carrier Cut-off Times */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Carrier Collection Schedule</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { carrier: "DHL", cutoff: "3:00 PM", collected: true },
                { carrier: "FedEx", cutoff: "4:30 PM", collected: false },
                { carrier: "Aramex", cutoff: "3:00 PM", collected: true },
                { carrier: "GIG Logistics", cutoff: "5:00 PM", collected: false },
              ].map((c) => (
                <div key={c.carrier} className={`rounded-lg p-3 border-2 ${c.collected ? "border-green-200 bg-green-50" : "border-[#FF6B00] bg-[#FF6B00]/5"}`}>
                  <div className="text-xs font-semibold text-[#0A1628]">{c.carrier}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Cut-off: {c.cutoff}</div>
                  <div className={`text-[10px] font-medium mt-1 ${c.collected ? "text-green-600" : "text-[#FF6B00]"}`}>
                    {c.collected ? "Collected" : "Pending"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outbound Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#0A1628]">Orders Ready for Dispatch</h3>
              <span className="text-xs text-gray-500">
                {data.outbound.filter((s) => s.priority === "express").length} express shipments
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Shipment</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Orders</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Items</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Carrier</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Priority</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Depart By</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.outbound.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                      <td className="px-5 py-3 text-sm font-mono font-medium text-[#FF6B00]">{s.id}</td>
                      <td className="px-5 py-3 text-sm text-right text-[#0A1628]">{s.order_count}</td>
                      <td className="px-5 py-3 text-sm text-right font-bold text-[#0A1628]">{s.item_count}</td>
                      <td className="px-5 py-3 text-sm text-[#0A1628]">{s.carrier}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            s.priority === "express"
                              ? "bg-red-100 text-red-700"
                              : s.priority === "standard"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {s.priority === "express" && <span className="mr-1">⚡</span>}
                          {s.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[s.status] || "bg-gray-100 text-gray-600"}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{s.depart_by}</td>
                      <td className="px-5 py-3">
                        <button className="text-xs text-[#FF6B00] hover:underline font-medium">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== STAFF TAB ===== */}
      {activeTab === "staff" && (
        <div className="space-y-4">
          {/* Leaderboard */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Staff Performance Leaderboard
            </h3>
            <div className="space-y-3">
              {data.staffPerformance.map((s, idx) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    idx === 0
                      ? "bg-amber-50 border border-amber-200"
                      : idx === 1
                        ? "bg-gray-50 border border-gray-200"
                        : idx === 2
                          ? "bg-orange-50 border border-orange-200"
                          : "bg-white border border-gray-100"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      idx === 0
                        ? "bg-amber-400 text-white"
                        : idx === 1
                          ? "bg-gray-400 text-white"
                          : idx === 2
                            ? "bg-orange-400 text-white"
                            : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#0A1628]">{s.name}</span>
                      <span className="text-xs text-gray-500">· {s.role}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${staffStatusColors[s.status] || "bg-gray-100 text-gray-600"}`}>
                        {s.status}
                      </span>
                      {idx === 0 && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{s.tasksToday} tasks</span>
                      <span>·</span>
                      <span className={`font-medium ${s.accuracy >= 99 ? "text-green-600" : s.accuracy >= 98 ? "text-amber-600" : "text-red-600"}`}>
                        {s.accuracy.toFixed(1)}% accuracy
                      </span>
                      <span>·</span>
                      <span>{s.avgTime.toFixed(1)} min avg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== EXCEPTIONS TAB ===== */}
      {activeTab === "exceptions" && (
        <div className="space-y-4">
          {/* Alert Banner */}
          {data.openExceptions > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-red-800">{data.openExceptions} Open Exceptions</div>
                <div className="text-xs text-red-700 mt-0.5">Requires immediate attention to prevent shipping delays</div>
              </div>
            </div>
          )}

          {/* Exception Cards */}
          <div className="space-y-3">
            {data.exceptions.map((exc) => (
              <div
                key={exc.id}
                className={`bg-white rounded-xl border p-5 ${exc.status === "open" ? "border-red-200" : "border-gray-200"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        exc.type === "damaged"
                          ? "bg-red-50"
                          : exc.type === "mismatch"
                            ? "bg-amber-50"
                            : exc.type === "shortage"
                              ? "bg-purple-50"
                              : "bg-blue-50"
                      }`}
                    >
                      {exc.type === "damaged" ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : exc.type === "mismatch" ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      ) : exc.type === "shortage" ? (
                        <PackageX className="w-5 h-5 text-purple-600" />
                      ) : (
                        <MapPin className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500">{exc.id}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityColors[exc.severity] || "bg-gray-100 text-gray-600"}`}>
                          {exc.severity}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[exc.status] || "bg-gray-100 text-gray-600"}`}>
                          {exc.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#0A1628] mt-1">
                        {exc.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} — {exc.order_id}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{exc.product_name}</p>
                      <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-lg p-2">{exc.notes}</p>
                      <div className="text-[10px] text-gray-400 mt-2">
                        Reported by {exc.reported_by} at {exc.reported_at}
                      </div>
                    </div>
                  </div>
                  {exc.status === "open" && (
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-[#FF6B00] text-white text-xs font-semibold rounded-lg hover:bg-[#e55f00] transition">
                        Resolve
                      </button>
                      <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition">
                        Escalate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
