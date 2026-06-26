"use client";

import { useState } from "react";
import {
  Package,
  Warehouse,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  DollarSign,
  BarChart3,
  MapPin,
  Box,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Layers,
  Zap,
  Target,
  Shield,
  ChevronDown,
  Info,
} from "lucide-react";

type Tab = "overview" | "inventory" | "storage" | "analytics" | "costs" | "slow" | "restock";

const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: "overview", label: "Overview", icon: Package },
  { id: "inventory", label: "My Inventory", icon: Box },
  { id: "storage", label: "Storage Map", icon: MapPin },
  { id: "analytics", label: "FBK Analytics", icon: BarChart3 },
  { id: "costs", label: "Cost Center", icon: DollarSign },
  { id: "slow", label: "Slow Movers", icon: Clock },
  { id: "restock", label: "Restock Alerts", icon: AlertTriangle },
];

const inventoryItems = [
  { id: "INV-001", sku: "WEB-001", name: "Wireless Earbuds Pro", stock: 245, reserved: 32, inTransit: 50, binLocation: "A-12-3", status: "healthy", velocity: 12, daysOfSupply: 20, reorderPoint: 100, costPerUnit: 4500 },
  { id: "INV-002", sku: "IPC-002", name: "iPhone 15 Case", stock: 89, reserved: 15, inTransit: 0, binLocation: "B-04-1", status: "low", velocity: 8, daysOfSupply: 11, reorderPoint: 60, costPerUnit: 1200 },
  { id: "INV-003", sku: "MRS-010", name: "Men's Running Shoes", stock: 320, reserved: 45, inTransit: 100, binLocation: "C-08-2", status: "healthy", velocity: 5, daysOfSupply: 64, reorderPoint: 80, costPerUnit: 8500 },
  { id: "INV-004", sku: "OGT-005", name: "Organic Green Tea Box", stock: 18, reserved: 8, inTransit: 200, binLocation: "D-02-4", status: "critical", velocity: 15, daysOfSupply: 1, reorderPoint: 50, costPerUnit: 2800 },
  { id: "INV-005", sku: "BTS-003", name: "Bluetooth Speaker", stock: 156, reserved: 22, inTransit: 0, binLocation: "A-15-1", status: "healthy", velocity: 7, daysOfSupply: 22, reorderPoint: 60, costPerUnit: 6200 },
  { id: "INV-006", sku: "SWM-007", name: "Smart Watch X1", stock: 42, reserved: 18, inTransit: 80, binLocation: "B-09-3", status: "low", velocity: 9, daysOfSupply: 5, reorderPoint: 50, costPerUnit: 12000 },
  { id: "INV-007", sku: "YGA-004", name: "Yoga Mat Premium", stock: 0, reserved: 0, inTransit: 150, binLocation: "C-03-1", status: "stockout", velocity: 3, daysOfSupply: 0, reorderPoint: 30, costPerUnit: 3500 },
  { id: "INV-008", sku: "WBT-006", name: "Water Bottle Steel", stock: 520, reserved: 35, inTransit: 0, binLocation: "D-11-2", status: "overstock", velocity: 2, daysOfSupply: 260, reorderPoint: 40, costPerUnit: 1800 },
];

const activityFeed = [
  { id: 1, type: "inbound", message: "Shipment KVX-INB-00412 received — 50 units of Wireless Earbuds Pro", time: "12 min ago", icon: ArrowDownRight, color: "text-green-600" },
  { id: 2, type: "outbound", message: "Order KAU-3921 picked and packed — 2x Wireless Earbuds Pro", time: "28 min ago", icon: ArrowUpRight, color: "text-blue-600" },
  { id: 3, type: "alert", message: "Low stock alert: Organic Green Tea Box — 18 units remaining", time: "1 hour ago", icon: AlertTriangle, color: "text-amber-500" },
  { id: 4, type: "inbound", message: "Shipment KVX-INB-00411 received — 100 units of Men's Running Shoes", time: "2 hours ago", icon: ArrowDownRight, color: "text-green-600" },
  { id: 5, type: "outbound", message: "Order KAU-3915 picked and packed — 1x Smart Watch X1", time: "3 hours ago", icon: ArrowUpRight, color: "text-blue-600" },
  { id: 6, type: "fee", message: "Monthly storage fee charged: ₦45,200", time: "1 day ago", icon: DollarSign, color: "text-purple-600" },
];

const slowMovers = [
  { sku: "WBT-006", name: "Water Bottle Steel", stock: 520, daysSinceLastSale: 45, storageCost: 15600, recommendation: "Consider price reduction or bundle deal" },
  { sku: "MRS-010", name: "Men's Running Shoes", stock: 320, daysSinceLastSale: 30, storageCost: 48000, recommendation: "High stock relative to velocity — reduce next order" },
  { sku: "BTS-003", name: "Bluetooth Speaker", stock: 156, daysSinceLastSale: 18, storageCost: 12400, recommendation: "Within acceptable range — monitor" },
];

const restockAlerts = [
  { sku: "OGT-005", name: "Organic Green Tea Box", current: 18, reorderPoint: 50, velocity: 15, daysUntilStockout: 1, urgency: "critical", suggestedQty: 200 },
  { sku: "SWM-007", name: "Smart Watch X1", current: 42, reorderPoint: 50, velocity: 9, daysUntilStockout: 5, urgency: "high", suggestedQty: 100 },
  { sku: "IPC-002", name: "iPhone 15 Case", current: 89, reorderPoint: 60, velocity: 8, daysUntilStockout: 11, urgency: "medium", suggestedQty: 50 },
  { sku: "YGA-004", name: "Yoga Mat Premium", current: 0, reorderPoint: 30, velocity: 3, daysUntilStockout: 0, urgency: "critical", suggestedQty: 100 },
];

const statusColors: Record<string, string> = {
  healthy: "bg-green-100 text-green-700",
  low: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700",
  stockout: "bg-red-100 text-red-700",
  overstock: "bg-blue-100 text-blue-700",
};

const urgencyColors: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-amber-100 text-amber-700",
  medium: "bg-blue-100 text-blue-700",
  low: "bg-gray-100 text-gray-600",
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

// CSS-based bar chart component
function BarChart({ data, maxVal }: { data: { label: string; value: number; color: string }[]; maxVal: number }) {
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-20 text-right shrink-0">{d.label}</span>
          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${d.color} transition-all flex items-center justify-end pr-2`}
              style={{ width: `${maxVal > 0 ? (d.value / maxVal) * 100 : 0}%` }}
            >
              {d.value > 0 && <span className="text-[10px] font-medium text-white">{d.value}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// CSS-based sparkline
function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${color} transition-all`}
          style={{ height: `${((v - min) / range) * 100}%`, minHeight: "2px" }}
        />
      ))}
    </div>
  );
}

export default function VendorFbkWarehousePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");

  const filteredInventory = inventoryItems.filter(
    (i) => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnits = inventoryItems.reduce((a, i) => a + i.stock, 0);
  const totalReserved = inventoryItems.reduce((a, i) => a + i.reserved, 0);
  const totalInTransit = inventoryItems.reduce((a, i) => a + i.inTransit, 0);

  const weeklyOrders = [12, 18, 15, 22, 19, 25, 20];
  const weeklyRevenue = [180000, 270000, 225000, 330000, 285000, 375000, 300000];
  const maxWeekly = Math.max(...weeklyRevenue);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0A1628]">FBK Warehouse Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor your inventory, costs, and performance at the fulfillment center</p>
      </div>

      {/* Location Indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0A1628] flex items-center justify-center">
            <Warehouse className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[#0A1628]">Lagos Fulfillment Center (LAG-FC)</div>
            <div className="text-xs text-gray-500">15 Admiralty Way, Lekki, Lagos · Your inventory is stored here</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-xs text-green-600 font-medium">Operational</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-white text-[#0A1628] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Total Units</div>
              <div className="text-2xl font-bold text-[#0A1628]">{totalUnits.toLocaleString()}</div>
              <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12% vs last week
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Reserved</div>
              <div className="text-2xl font-bold text-[#0A1628]">{totalReserved}</div>
              <div className="text-xs text-gray-500 mt-1">Pending fulfillment</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">In Transit</div>
              <div className="text-2xl font-bold text-[#0A1628]">{totalInTransit}</div>
              <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> 2 shipments pending
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">SKUs Active</div>
              <div className="text-2xl font-bold text-[#0A1628]">{inventoryItems.length}</div>
              <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> All listed
              </div>
            </div>
          </div>

          {/* Activity Feed + Weekly Orders */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {activityFeed.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 ${item.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#0A1628] leading-relaxed">{item.message}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Weekly Order Volume</h3>
              <div className="flex items-end gap-2 h-40">
                {weeklyOrders.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500">{v}</span>
                    <div
                      className="w-full bg-[#FF6B00] rounded-t-md transition-all hover:bg-[#e55f00]"
                      style={{ height: `${(v / Math.max(...weeklyOrders)) * 100}%` }}
                    />
                    <span className="text-[10px] text-gray-400">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by SKU or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200 transition">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">SKU</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Product</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Stock</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Reserved</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">In Transit</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Bin</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Velocity/day</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Days of Supply</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                    <td className="px-5 py-3 text-xs font-mono text-[#FF6B00] font-medium">{item.sku}</td>
                    <td className="px-5 py-3 text-sm font-medium text-[#0A1628]">{item.name}</td>
                    <td className="px-5 py-3 text-sm text-right font-bold text-[#0A1628]">{item.stock}</td>
                    <td className="px-5 py-3 text-sm text-right text-gray-600">{item.reserved}</td>
                    <td className="px-5 py-3 text-sm text-right text-gray-600">{item.inTransit}</td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-500">{item.binLocation}</td>
                    <td className="px-5 py-3 text-sm text-right text-gray-600">{item.velocity}</td>
                    <td className="px-5 py-3 text-sm text-right">
                      <span className={`font-medium ${item.daysOfSupply <= 3 ? "text-red-600" : item.daysOfSupply <= 10 ? "text-amber-600" : "text-green-600"}`}>
                        {item.daysOfSupply}d
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "storage" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Warehouse Floor Map — Lagos FC</h3>
          {/* 3D Floor Map Placeholder */}
          <div className="bg-[#0A1628] rounded-xl p-8 relative overflow-hidden" style={{ minHeight: 420 }}>
            {/* Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <defs>
                <pattern id="whgrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#whgrid)" />
            </svg>

            {/* Floor Plan Bins */}
            <div className="relative z-10 grid grid-cols-6 gap-3 max-w-3xl mx-auto">
              {["A", "B", "C", "D", "E", "F"].map((row) =>
                Array.from({ length: 8 }).map((_, col) => {
                  const occupancy = Math.random();
                  const color = occupancy > 0.8 ? "bg-red-500/80" : occupancy > 0.5 ? "bg-amber-500/70" : occupancy > 0.2 ? "bg-green-500/60" : "bg-white/10";
                  return (
                    <div
                      key={`${row}-${col}`}
                      className={`h-10 rounded-md ${color} border border-white/20 flex items-center justify-center text-[10px] text-white/70 font-mono cursor-pointer hover:border-[#FF6B00] transition`}
                      title={`${row}${col + 1} — ${Math.round(occupancy * 100)}% full`}
                    >
                      {row}{col + 1}
                    </div>
                  );
                })
              )}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 z-10">
              <div className="text-[10px] text-white/60 font-medium mb-2">Bin Occupancy</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] text-white/60"><div className="w-3 h-3 rounded bg-green-500/60" /> 0-50%</div>
                <div className="flex items-center gap-2 text-[10px] text-white/60"><div className="w-3 h-3 rounded bg-amber-500/70" /> 50-80%</div>
                <div className="flex items-center gap-2 text-[10px] text-white/60"><div className="w-3 h-3 rounded bg-red-500/80" /> 80-100%</div>
                <div className="flex items-center gap-2 text-[10px] text-white/60"><div className="w-3 h-3 rounded bg-white/10 border border-white/20" /> Empty</div>
              </div>
            </div>

            <div className="absolute top-4 left-4 text-white/30 text-xs z-10">
              Interactive 3D Floor Plan — Click bins for details
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Fill Rate</span>
              </div>
              <div className="text-2xl font-bold text-[#0A1628]">97.3%</div>
              <MiniSparkline values={[94, 95, 96, 97, 96, 98, 97]} color="bg-green-500" />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-500">Pick Velocity</span>
              </div>
              <div className="text-2xl font-bold text-[#0A1628]">8.2 <span className="text-sm font-normal text-gray-500">min/order</span></div>
              <MiniSparkline values={[10, 9.5, 9, 8.8, 8.5, 8.3, 8.2]} color="bg-blue-500" />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-500">Pick Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-[#0A1628]">99.8%</div>
              <MiniSparkline values={[99.5, 99.6, 99.7, 99.8, 99.7, 99.9, 99.8]} color="bg-purple-500" />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-gray-500">Damage Rate</span>
              </div>
              <div className="text-2xl font-bold text-[#0A1628]">0.12%</div>
              <MiniSparkline values={[0.2, 0.18, 0.15, 0.14, 0.13, 0.11, 0.12]} color="bg-amber-500" />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Cost Per Order Trend</h3>
              <div className="flex items-end gap-3 h-48">
                {[3200, 3100, 2900, 3000, 2800, 2750, 2650].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500">{formatCurrency(v)}</span>
                    <div
                      className="w-full bg-[#0A1628] rounded-t-md hover:bg-[#FF6B00] transition-all"
                      style={{ height: `${(v / 3500) * 100}%` }}
                    />
                    <span className="text-[10px] text-gray-400">{["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Revenue vs Storage Cost (30d)</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Revenue</span>
                    <span className="font-medium text-[#0A1628]">{formatCurrency(1825000)}</span>
                  </div>
                  <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Storage Fees</span>
                    <span className="font-medium text-[#0A1628]">{formatCurrency(145000)}</span>
                  </div>
                  <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: "8%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Pick & Pack Fees</span>
                    <span className="font-medium text-[#0A1628]">{formatCurrency(210000)}</span>
                  </div>
                  <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF6B00] rounded-full" style={{ width: "11.5%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Net Margin</span>
                    <span className="font-bold text-green-600">{formatCurrency(1470000)}</span>
                  </div>
                  <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0A1628] rounded-full" style={{ width: "80.5%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "costs" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Storage Fees (30d)</div>
              <div className="text-xl font-bold text-[#0A1628]">{formatCurrency(145000)}</div>
              <div className="text-xs text-green-600 mt-1">-8% vs last month</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Pick & Pack Fees</div>
              <div className="text-xl font-bold text-[#0A1628]">{formatCurrency(210000)}</div>
              <div className="text-xs text-amber-600 mt-1">+3% vs last month</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Inbound Handling</div>
              <div className="text-xl font-bold text-[#0A1628]">{formatCurrency(65000)}</div>
              <div className="text-xs text-gray-500 mt-1">3 shipments received</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Total FBK Fees</div>
              <div className="text-xl font-bold text-[#FF6B00]">{formatCurrency(420000)}</div>
              <div className="text-xs text-gray-500 mt-1">23% of revenue</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Storage Fee Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: "Small Compartment (A4) × 28", amount: 28000, pct: 19 },
                { label: "Medium Compartment (A3) × 15", amount: 45000, pct: 31 },
                { label: "Large Compartment (A2) × 8", amount: 48000, pct: 33 },
                { label: "XL Compartment (Pallet) × 2", amount: 24000, pct: 17 },
              ].map((fee) => (
                <div key={fee.label} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{fee.label}</span>
                      <span className="font-medium text-[#0A1628]">{formatCurrency(fee.amount)}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF6B00] rounded-full" style={{ width: `${fee.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-3">Optimization Suggestions</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-green-800">Consolidate slow-moving SKUs</div>
                  <div className="text-xs text-green-700 mt-0.5">WBT-006 and MRS-010 occupy 12 bins with low velocity. Consolidating could save ~₦18,000/month.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-amber-800">Reduce XL bin allocation</div>
                  <div className="text-xs text-amber-700 mt-0.5">Only 2 of 4 XL bins are used. Downgrade 2 to Large to save ~₦8,000/month.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-blue-800">Increase OGT-005 reorder point</div>
                  <div className="text-xs text-blue-700 mt-0.5">High velocity (15/day) but low stock (18). Risk of stockout within 1 day.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "slow" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-amber-800">Slow-Moving Inventory Alert</div>
              <div className="text-xs text-amber-700 mt-1">
                Items with low sales velocity incur storage costs without generating revenue. Consider price reductions, bundle deals, or removal.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">SKU</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Product</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Stock</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Days Since Last Sale</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Storage Cost (30d)</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {slowMovers.map((item) => (
                  <tr key={item.sku} className="border-b border-gray-50 hover:bg-gray-50/30">
                    <td className="px-5 py-3 text-xs font-mono text-[#FF6B00] font-medium">{item.sku}</td>
                    <td className="px-5 py-3 text-sm font-medium text-[#0A1628]">{item.name}</td>
                    <td className="px-5 py-3 text-sm text-right font-bold text-[#0A1628]">{item.stock}</td>
                    <td className="px-5 py-3 text-sm text-right text-red-600 font-medium">{item.daysSinceLastSale} days</td>
                    <td className="px-5 py-3 text-sm text-right text-[#0A1628]">{formatCurrency(item.storageCost)}</td>
                    <td className="px-5 py-3 text-xs text-gray-600">{item.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "restock" && (
        <div className="space-y-4">
          {restockAlerts.map((alert) => (
            <div key={alert.sku} className={`bg-white rounded-xl border p-5 ${
              alert.urgency === "critical" ? "border-red-200" : alert.urgency === "high" ? "border-amber-200" : "border-gray-200"
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    alert.urgency === "critical" ? "bg-red-50" : alert.urgency === "high" ? "bg-amber-50" : "bg-blue-50"
                  }`}>
                    <AlertTriangle className={`w-5 h-5 ${
                      alert.urgency === "critical" ? "text-red-600" : alert.urgency === "high" ? "text-amber-600" : "text-blue-600"
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#FF6B00]">{alert.sku}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgencyColors[alert.urgency]}`}>
                        {alert.urgency}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-[#0A1628] mt-1">{alert.name}</h4>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#FF6B00] text-white text-xs font-semibold rounded-lg hover:bg-[#e55f00] transition">
                  Reorder {alert.suggestedQty} units
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4 text-xs">
                <div>
                  <div className="text-gray-500">Current Stock</div>
                  <div className="font-bold text-[#0A1628]">{alert.current}</div>
                </div>
                <div>
                  <div className="text-gray-500">Reorder Point</div>
                  <div className="font-bold text-[#0A1628]">{alert.reorderPoint}</div>
                </div>
                <div>
                  <div className="text-gray-500">Daily Velocity</div>
                  <div className="font-bold text-[#0A1628]">{alert.velocity}/day</div>
                </div>
                <div>
                  <div className="text-gray-500">Days Until Stockout</div>
                  <div className={`font-bold ${alert.daysUntilStockout <= 1 ? "text-red-600" : alert.daysUntilStockout <= 3 ? "text-amber-600" : "text-[#0A1628]"}`}>
                    {alert.daysUntilStockout === 0 ? "OUT OF STOCK" : `${alert.daysUntilStockout} days`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
