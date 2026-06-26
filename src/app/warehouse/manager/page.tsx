"use client";

import { useState } from "react";
import {
  Package,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  MapPin,
  Zap,
  Target,
  RefreshCw,
  ChevronRight,
  Wrench,
  Eye,
  XCircle,
  Timer,
} from "lucide-react";

type Tab = "operations" | "inbound" | "outbound" | "staff" | "exceptions";

const tabs: { id: Tab; label: string }[] = [
  { id: "operations", label: "Live Operations" },
  { id: "inbound", label: "Inbound" },
  { id: "outbound", label: "Outbound" },
  { id: "staff", label: "Staff Performance" },
  { id: "exceptions", label: "Exceptions" },
];

const operationsMetrics = [
  { label: "Orders Picked Today", value: 342, change: "+18%", trend: "up", icon: Package, color: "bg-blue-50 text-blue-600" },
  { label: "Orders Packed", value: 318, change: "+12%", trend: "up", icon: CheckCircle2, color: "bg-green-50 text-green-600" },
  { label: "Orders Shipped", value: 295, change: "+8%", trend: "up", icon: Truck, color: "bg-purple-50 text-purple-600" },
  { label: "Pending Tasks", value: 47, change: "-23%", trend: "down", icon: Clock, color: "bg-amber-50 text-amber-600" },
  { label: "Active Staff", value: 18, change: "of 22", trend: "neutral", icon: Users, color: "bg-[#0A1628]/5 text-[#0A1628]" },
  { label: "Exception Rate", value: "1.2%", change: "-0.3%", trend: "down", icon: AlertTriangle, color: "bg-red-50 text-red-600" },
];

const hourlyThroughput = [
  { hour: "6AM", picked: 15, packed: 12, shipped: 8 },
  { hour: "7AM", picked: 28, packed: 25, shipped: 18 },
  { hour: "8AM", picked: 42, packed: 38, shipped: 30 },
  { hour: "9AM", picked: 55, packed: 48, shipped: 42 },
  { hour: "10AM", picked: 62, packed: 55, shipped: 48 },
  { hour: "11AM", picked: 48, packed: 52, shipped: 50 },
  { hour: "12PM", picked: 20, packed: 35, shipped: 45 },
  { hour: "1PM", picked: 35, packed: 28, shipped: 32 },
  { hour: "2PM", picked: 37, packed: 25, shipped: 22 },
];

const staffPerformance = [
  { id: "STF-001", name: "Chidi Okoro", role: "Picker", ordersPicked: 52, accuracy: 99.8, avgTime: "6.2 min", rating: 5, status: "active" },
  { id: "STF-002", name: "Ada Okafor", role: "Picker", ordersPicked: 48, accuracy: 99.5, avgTime: "6.8 min", rating: 5, status: "active" },
  { id: "STF-003", name: "Emeka Nwachukwu", role: "Packer", ordersPacked: 45, accuracy: 99.9, avgTime: "4.5 min", rating: 5, status: "active" },
  { id: "STF-004", name: "Blessing Ade", role: "Picker", ordersPicked: 41, accuracy: 98.8, avgTime: "7.1 min", rating: 4, status: "active" },
  { id: "STF-005", name: "Tunde Balogun", role: "Packer", ordersPacked: 39, accuracy: 99.2, avgTime: "5.0 min", rating: 4, status: "active" },
  { id: "STF-006", name: "Ngozi Eze", role: "Picker", ordersPicked: 38, accuracy: 99.0, avgTime: "7.3 min", rating: 4, status: "break" },
  { id: "STF-007", name: "Yemi Adekunle", role: "Loader", ordersShipped: 35, accuracy: 100, avgTime: "3.2 min", rating: 5, status: "active" },
  { id: "STF-008", name: "Funke Akindele", role: "Picker", ordersPicked: 33, accuracy: 97.5, avgTime: "8.0 min", rating: 3, status: "active" },
];

const inboundShipments = [
  { id: "INB-00412", supplier: "TechHub Electronics", items: 5, units: 250, status: "received", eta: null, receivedAt: "10:15 AM", dock: "Bay 1" },
  { id: "INB-00413", supplier: "Fashion House NG", items: 12, units: 480, status: "in_transit", eta: "2:30 PM", receivedAt: null, dock: "Bay 2" },
  { id: "INB-00414", supplier: "GadgetWorld", items: 8, units: 120, status: "scheduled", eta: "4:00 PM", receivedAt: null, dock: "Bay 3" },
  { id: "INB-00415", supplier: "Home Essentials Co.", items: 3, units: 150, status: "received", eta: null, receivedAt: "9:45 AM", dock: "Bay 1" },
];

const outboundShipments = [
  { id: "OUT-00891", orders: 28, items: 45, carrier: "DHL", status: "loading", departBy: "3:00 PM", priority: "express" },
  { id: "OUT-00892", orders: 35, items: 62, carrier: "FedEx", status: "ready", departBy: "4:30 PM", priority: "standard" },
  { id: "OUT-00893", orders: 18, items: 22, carrier: "Aramex", status: "loading", departBy: "3:00 PM", priority: "express" },
  { id: "OUT-00894", orders: 42, items: 58, carrier: "GIG Logistics", status: "scheduled", departBy: "5:00 PM", priority: "economy" },
];

const exceptions = [
  { id: "EXC-001", type: "damaged", order: "KAU-3921", product: "Wireless Earbuds Pro", severity: "high", reportedBy: "Chidi Okoro", reportedAt: "11:30 AM", status: "open", notes: "Item found damaged during pick — earbud casing cracked" },
  { id: "EXC-002", type: "mismatch", order: "KAU-3918", product: "iPhone 15 Case", severity: "medium", reportedBy: "Ada Okafor", reportedAt: "10:45 AM", status: "resolved", notes: "SKU mismatch — wrong variant in bin B-04-1. Corrected." },
  { id: "EXC-003", type: "shortage", order: "KAU-3915", product: "Smart Watch X1", severity: "high", reportedBy: "Emeka Nwachukwu", reportedAt: "9:20 AM", status: "open", notes: "Bin shows 5 units but only 3 found. Audit requested." },
  { id: "EXC-004", type: "label_error", order: "KAU-3912", product: "Organic Green Tea Box", severity: "low", reportedBy: "Blessing Ade", reportedAt: "8:50 AM", status: "resolved", notes: "Shipping label printed with wrong address. Reprinted." },
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
  const maxPicked = Math.max(...hourlyThroughput.map((h) => h.picked));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0A1628]">Warehouse Operations Center</h1>
          <p className="text-sm text-gray-500 mt-1">Lagos Fulfillment Center (LAG-FC) — Real-time monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-600 font-medium">Live</span>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? "bg-white text-[#0A1628] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "operations" && (
        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {operationsMetrics.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xl font-bold text-[#0A1628]">{m.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
                  <div className={`text-xs mt-1 font-medium ${
                    m.trend === "up" ? "text-green-600" : m.trend === "down" ? "text-amber-600" : "text-gray-500"
                  }`}>
                    {m.change}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floor Plan + Throughput */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Floor Plan Placeholder */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Live Floor Map</h3>
              <div className="bg-[#0A1628] rounded-xl p-6 relative" style={{ minHeight: 320 }}>
                <svg className="absolute inset-0 w-full h-full opacity-10">
                  <defs>
                    <pattern id="mgrgrid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#mgrgrid)" />
                </svg>
                <div className="relative z-10 grid grid-cols-4 gap-2">
                  {["Receiving", "Storage A", "Storage B", "Packing", "Staging", "Pick Zone 1", "Pick Zone 2", "Shipping"].map((zone, i) => {
                    const activity = [85, 60, 45, 78, 30, 92, 70, 55][i];
                    return (
                      <div key={zone} className="bg-white/10 rounded-lg p-3 border border-white/20 hover:border-[#FF6B00] transition cursor-pointer">
                        <div className="text-[10px] text-white/50 mb-1">{zone}</div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                          <div className="h-full bg-[#FF6B00] rounded-full" style={{ width: `${activity}%` }} />
                        </div>
                        <div className="text-xs text-white font-medium">{activity}%</div>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute bottom-3 right-3 text-[10px] text-white/30 z-10">
                  Updated: Just now
                </div>
              </div>
            </div>

            {/* Throughput Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Hourly Throughput</h3>
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-4 text-[10px] text-gray-500">
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-blue-500" /> Picked</div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-green-500" /> Packed</div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-purple-500" /> Shipped</div>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-52">
                {hourlyThroughput.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full flex items-end gap-px" style={{ height: "160px" }}>
                      <div
                        className="flex-1 bg-blue-500 rounded-t"
                        style={{ height: `${(h.picked / maxPicked) * 100}%` }}
                      />
                      <div
                        className="flex-1 bg-green-500 rounded-t"
                        style={{ height: `${(h.packed / maxPicked) * 100}%` }}
                      />
                      <div
                        className="flex-1 bg-purple-500 rounded-t"
                        style={{ height: `${(h.shipped / maxPicked) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1">{h.hour}</span>
                  </div>
                ))}
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
                <Wrench className="w-3.5 h-3.5" /> Report Issue
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-[#0A1628] text-xs font-semibold rounded-lg hover:bg-gray-200 transition">
                <BarChart3 className="w-3.5 h-3.5" /> View Reports
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "inbound" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
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
              {inboundShipments.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                  <td className="px-5 py-3 text-sm font-mono font-medium text-[#FF6B00]">{s.id}</td>
                  <td className="px-5 py-3 text-sm text-[#0A1628]">{s.supplier}</td>
                  <td className="px-5 py-3 text-sm text-right text-[#0A1628]">{s.items}</td>
                  <td className="px-5 py-3 text-sm text-right font-bold text-[#0A1628]">{s.units}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{s.dock}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[s.status]}`}>
                      {s.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{s.receivedAt || s.eta}</td>
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
      )}

      {activeTab === "outbound" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
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
              {outboundShipments.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                  <td className="px-5 py-3 text-sm font-mono font-medium text-[#FF6B00]">{s.id}</td>
                  <td className="px-5 py-3 text-sm text-right text-[#0A1628]">{s.orders}</td>
                  <td className="px-5 py-3 text-sm text-right font-bold text-[#0A1628]">{s.items}</td>
                  <td className="px-5 py-3 text-sm text-[#0A1628]">{s.carrier}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      s.priority === "express" ? "bg-red-100 text-red-700" : s.priority === "standard" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {s.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{s.departBy}</td>
                  <td className="px-5 py-3">
                    <button className="text-xs text-[#FF6B00] hover:underline font-medium">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "staff" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Staff Performance Leaderboard</h3>
            <div className="space-y-3">
              {staffPerformance
                .sort((a, b) => (b.ordersPicked ?? 0) - (a.ordersPicked ?? 0))
                .map((s, idx) => (
                <div key={s.id} className={`flex items-center gap-4 p-3 rounded-lg ${
                  idx === 0 ? "bg-amber-50 border border-amber-200" : idx === 1 ? "bg-gray-50 border border-gray-200" : idx === 2 ? "bg-orange-50 border border-orange-200" : "bg-white border border-gray-100"
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? "bg-amber-400 text-white" : idx === 1 ? "bg-gray-400 text-white" : idx === 2 ? "bg-orange-400 text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#0A1628]">{s.name}</span>
                      <span className="text-xs text-gray-500">· {s.role}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${staffStatusColors[s.status]}`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{s.role === "Picker" ? `${s.ordersPicked} picked` : s.role === "Packer" ? `${s.ordersPacked} packed` : `${s.ordersPicked || s.ordersPacked || 35} shipped`}</span>
                      <span>·</span>
                      <span className={`font-medium ${s.accuracy >= 99 ? "text-green-600" : s.accuracy >= 98 ? "text-amber-600" : "text-red-600"}`}>
                        {s.accuracy}% accuracy
                      </span>
                      <span>·</span>
                      <span>{s.avgTime} avg</span>
                      <span>·</span>
                      <span className="text-amber-500">{"★".repeat(s.rating)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "exceptions" && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-red-800">
                {exceptions.filter((e) => e.status === "open").length} Open Exceptions
              </div>
              <div className="text-xs text-red-700 mt-0.5">Requires immediate attention to prevent shipping delays</div>
            </div>
          </div>

          <div className="space-y-3">
            {exceptions.map((exc) => (
              <div key={exc.id} className={`bg-white rounded-xl border p-5 ${
                exc.status === "open" ? "border-red-200" : "border-gray-200"
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      exc.type === "damaged" ? "bg-red-50" : exc.type === "mismatch" ? "bg-amber-50" : exc.type === "shortage" ? "bg-purple-50" : "bg-blue-50"
                    }`}>
                      {exc.type === "damaged" ? <XCircle className="w-5 h-5 text-red-600" /> :
                       exc.type === "mismatch" ? <AlertTriangle className="w-5 h-5 text-amber-600" /> :
                       exc.type === "shortage" ? <Package className="w-5 h-5 text-purple-600" /> :
                       <MapPin className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500">{exc.id}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityColors[exc.severity]}`}>
                          {exc.severity}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[exc.status]}`}>
                          {exc.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#0A1628] mt-1">
                        {exc.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} — {exc.order}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{exc.product}</p>
                      <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-lg p-2">{exc.notes}</p>
                      <div className="text-[10px] text-gray-400 mt-2">
                        Reported by {exc.reportedBy} at {exc.reportedAt}
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
