"use client";

import { useState } from "react";
import {
  Warehouse,
  Package,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  Users,
  DollarSign,
  BarChart3,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Settings,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Activity,
  Shield,
} from "lucide-react";

interface WarehouseOverview {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  countryCode: string;
  type: string;
  status: "operational" | "degraded" | "offline";
  totalCapacity: number;
  usedCapacity: number;
  ordersToday: number;
  ordersYesterday: number;
  staffOnDuty: number;
  totalStaff: number;
  inventoryValue: number;
  shipmentsInTransit: number;
  fillRate: number;
  avgPickTime: string;
  wmsStatus: "connected" | "disconnected" | "error";
  lastSync: string;
}

const warehouses: WarehouseOverview[] = [
  { id: "WH-001", name: "Lagos Fulfillment Center", code: "LAG-FC", city: "Lagos", country: "Nigeria", countryCode: "NG", type: "Fulfillment Center", status: "operational", totalCapacity: 5000, usedCapacity: 4100, ordersToday: 342, ordersYesterday: 318, staffOnDuty: 18, totalStaff: 22, inventoryValue: 45000000, shipmentsInTransit: 24, fillRate: 97.3, avgPickTime: "6.2 min", wmsStatus: "connected", lastSync: "2 min ago" },
  { id: "WH-002", name: "Port Harcourt Main Warehouse", code: "PH-MAIN", city: "Port Harcourt", country: "Nigeria", countryCode: "NG", type: "Standard", status: "operational", totalCapacity: 2000, usedCapacity: 1300, ordersToday: 98, ordersYesterday: 105, staffOnDuty: 8, totalStaff: 12, inventoryValue: 12000000, shipmentsInTransit: 12, fillRate: 95.8, avgPickTime: "7.5 min", wmsStatus: "connected", lastSync: "5 min ago" },
  { id: "WH-003", name: "Abuja Distribution Hub", code: "ABJ-DH", city: "Abuja", country: "Nigeria", countryCode: "NG", type: "Distribution Hub", status: "operational", totalCapacity: 3000, usedCapacity: 1350, ordersToday: 156, ordersYesterday: 142, staffOnDuty: 12, totalStaff: 16, inventoryValue: 18000000, shipmentsInTransit: 18, fillRate: 96.5, avgPickTime: "6.8 min", wmsStatus: "connected", lastSync: "3 min ago" },
  { id: "WH-004", name: "New York East Warehouse", code: "NYC-EAST", city: "New York", country: "USA", countryCode: "US", type: "Fulfillment Center", status: "degraded", totalCapacity: 8000, usedCapacity: 6240, ordersToday: 425, ordersYesterday: 410, staffOnDuty: 24, totalStaff: 30, inventoryValue: 120000000, shipmentsInTransit: 56, fillRate: 94.2, avgPickTime: "5.8 min", wmsStatus: "error", lastSync: "45 min ago" },
  { id: "WH-005", name: "London Metro Warehouse", code: "LON-MET", city: "London", country: "UK", countryCode: "GB", type: "Fulfillment Center", status: "operational", totalCapacity: 4000, usedCapacity: 2600, ordersToday: 210, ordersYesterday: 198, staffOnDuty: 14, totalStaff: 18, inventoryValue: 65000000, shipmentsInTransit: 32, fillRate: 98.1, avgPickTime: "5.2 min", wmsStatus: "connected", lastSync: "1 min ago" },
  { id: "WH-006", name: "Dubai Logistics Hub", code: "DXB-LH", city: "Dubai", country: "UAE", countryCode: "AE", type: "Logistics Hub", status: "operational", totalCapacity: 3500, usedCapacity: 2100, ordersToday: 178, ordersYesterday: 165, staffOnDuty: 10, totalStaff: 14, inventoryValue: 38000000, shipmentsInTransit: 28, fillRate: 97.8, avgPickTime: "6.0 min", wmsStatus: "connected", lastSync: "4 min ago" },
  { id: "WH-007", name: "Mumbai Fulfillment Center", code: "MUM-FC", city: "Mumbai", country: "India", countryCode: "IN", type: "Fulfillment Center", status: "operational", totalCapacity: 6000, usedCapacity: 3900, ordersToday: 380, ordersYesterday: 365, staffOnDuty: 20, totalStaff: 25, inventoryValue: 28000000, shipmentsInTransit: 40, fillRate: 96.0, avgPickTime: "7.0 min", wmsStatus: "connected", lastSync: "6 min ago" },
  { id: "WH-008", name: "Sydney Distribution Center", code: "SYD-DC", city: "Sydney", country: "Australia", countryCode: "AU", type: "Distribution Center", status: "offline", totalCapacity: 2500, usedCapacity: 0, ordersToday: 0, ordersYesterday: 120, staffOnDuty: 0, totalStaff: 10, inventoryValue: 15000000, shipmentsInTransit: 0, fillRate: 0, avgPickTime: "N/A", wmsStatus: "disconnected", lastSync: "6 hours ago" },
];

const countryFlags: Record<string, string> = {
  NG: "🇳🇬", US: "🇺🇸", GB: "🇬🇧", AE: "🇦🇪", IN: "🇮🇳", AU: "🇦🇺",
};

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  operational: { color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" },
  degraded: { color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
  offline: { color: "text-red-500", bg: "bg-red-50", dot: "bg-red-500" },
};

const wmsColors: Record<string, string> = {
  connected: "text-green-600",
  disconnected: "text-red-500",
  error: "text-amber-600",
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export default function AdminWarehouseOverviewPage() {
  const [search, setSearch] = useState("");

  const filtered = warehouses.filter(
    (w) => !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.code.toLowerCase().includes(search.toLowerCase()) || w.city.toLowerCase().includes(search.toLowerCase())
  );

  const totalOrders = warehouses.reduce((a, w) => a + w.ordersToday, 0);
  const totalStaff = warehouses.reduce((a, w) => a + w.staffOnDuty, 0);
  const totalCapacity = warehouses.reduce((a, w) => a + w.totalCapacity, 0);
  const totalUsed = warehouses.reduce((a, w) => a + w.usedCapacity, 0);
  const avgFillRate = warehouses.filter((w) => w.fillRate > 0).reduce((a, w) => a + w.fillRate, 0) / warehouses.filter((w) => w.fillRate > 0).length;
  const totalShipments = warehouses.reduce((a, w) => a + w.shipmentsInTransit, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#0A1628]">Warehouse Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Global warehouse network monitoring and management</p>
      </div>

      {/* World Map Placeholder */}
      <div className="bg-[#0A1628] rounded-xl p-6 relative overflow-hidden" style={{ height: 280 }}>
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="worldgrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#worldgrid)" />
        </svg>

        {/* Warehouse pins on world map */}
        <div className="absolute inset-0 z-10">
          {warehouses.map((w) => {
            const positions: Record<string, { top: string; left: string }> = {
              "NG": { top: "52%", left: "48%" },
              "US": { top: "35%", left: "22%" },
              "GB": { top: "28%", left: "47%" },
              "AE": { top: "48%", left: "58%" },
              "IN": { top: "45%", left: "65%" },
              "AU": { top: "72%", left: "78%" },
            };
            const pos = positions[w.countryCode] || { top: "50%", left: "50%" };
            const cfg = statusConfig[w.status];
            return (
              <div
                key={w.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{ top: pos.top, left: pos.left }}
              >
                <div className={`w-4 h-4 rounded-full ${cfg.dot} border-2 border-white shadow-lg animate-pulse`} />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white rounded-lg shadow-xl text-left whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                  <div className="text-xs font-semibold text-[#0A1628]">{w.name}</div>
                  <div className="text-[10px] text-gray-500">{w.city}, {w.country} · {w.ordersToday} orders today</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative z-10 text-white/30 text-xs">
          Global Warehouse Network — {warehouses.length} locations
        </div>
      </div>

      {/* Combined Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Warehouse className="w-4 h-4 text-[#0A1628]" />
            <span className="text-xs text-gray-500">Total Warehouses</span>
          </div>
          <div className="text-2xl font-bold text-[#0A1628]">{warehouses.length}</div>
          <div className="text-xs text-green-600 mt-1">
            {warehouses.filter((w) => w.status === "operational").length} operational
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-[#FF6B00]" />
            <span className="text-xs text-gray-500">Orders Today</span>
          </div>
          <div className="text-2xl font-bold text-[#0A1628]">{totalOrders.toLocaleString()}</div>
          <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +8% vs yesterday
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-500">Avg Fill Rate</span>
          </div>
          <div className="text-2xl font-bold text-[#0A1628]">{avgFillRate.toFixed(1)}%</div>
          <div className="text-xs text-green-600 mt-1">Across all warehouses</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-500">Staff On Duty</span>
          </div>
          <div className="text-2xl font-bold text-[#0A1628]">{totalStaff}</div>
          <div className="text-xs text-gray-500 mt-1">of {warehouses.reduce((a, w) => a + w.totalStaff, 0)} total</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-gray-500">In Transit</span>
          </div>
          <div className="text-2xl font-bold text-[#0A1628]">{totalShipments}</div>
          <div className="text-xs text-gray-500 mt-1">active shipments</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-500">Inventory Value</span>
          </div>
          <div className="text-xl font-bold text-[#0A1628]">{formatCurrency(warehouses.reduce((a, w) => a + w.inventoryValue, 0))}</div>
          <div className="text-xs text-gray-500 mt-1">across all warehouses</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search warehouses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
        />
      </div>

      {/* Per-Warehouse Detail Cards */}
      <div className="grid lg:grid-cols-2 gap-4">
        {filtered.map((w) => {
          const cfg = statusConfig[w.status];
          const capacityPct = w.totalCapacity > 0 ? Math.round((w.usedCapacity / w.totalCapacity) * 100) : 0;
          const orderChange = w.ordersYesterday > 0 ? Math.round(((w.ordersToday - w.ordersYesterday) / w.ordersYesterday) * 100) : 0;
          return (
            <div key={w.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                    <Warehouse className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0A1628]">{w.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {countryFlags[w.countryCode]} {w.city}, {w.country} · {w.code}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{w.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-xs font-medium ${cfg.color}`}>
                      {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                    </span>
                  </div>
                  <a href={`/admin/warehouses/${w.id}/wms`} className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="WMS Settings">
                    <Settings className="w-4 h-4 text-gray-400" />
                  </a>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Capacity</span>
                  <span className="font-medium text-[#0A1628]">{w.usedCapacity.toLocaleString()} / {w.totalCapacity.toLocaleString()} ({capacityPct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      capacityPct > 85 ? "bg-red-500" : capacityPct > 65 ? "bg-amber-500" : "bg-green-500"
                    }`}
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-3 text-xs mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 mb-0.5">Orders</div>
                  <div className="font-bold text-[#0A1628]">{w.ordersToday}</div>
                  <div className={`text-[10px] ${orderChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {orderChange >= 0 ? "+" : ""}{orderChange}%
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 mb-0.5">Staff</div>
                  <div className="font-bold text-[#0A1628]">{w.staffOnDuty}/{w.totalStaff}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 mb-0.5">Fill Rate</div>
                  <div className={`font-bold ${w.fillRate >= 96 ? "text-green-600" : w.fillRate >= 93 ? "text-amber-600" : "text-red-500"}`}>
                    {w.fillRate > 0 ? `${w.fillRate}%` : "N/A"}
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 mb-0.5">Pick Time</div>
                  <div className="font-bold text-[#0A1628]">{w.avgPickTime}</div>
                </div>
              </div>

              {/* WMS Status */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Activity className={`w-3.5 h-3.5 ${wmsColors[w.wmsStatus]}`} />
                  <span className={`text-xs font-medium ${wmsColors[w.wmsStatus]}`}>
                    WMS: {w.wmsStatus.charAt(0).toUpperCase() + w.wmsStatus.slice(1)}
                  </span>
                  <span className="text-[10px] text-gray-400">· Last sync: {w.lastSync}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="View Details">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition" title="Refresh">
                    <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* WMS Health Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-[#0A1628] mb-4">WMS Health Status</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {warehouses.map((w) => {
            const wmsCfg = {
              connected: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
              disconnected: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
              error: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
            }[w.wmsStatus];
            const WmsIcon = wmsCfg.icon;
            return (
              <div key={w.id} className={`rounded-lg p-3 border ${
                w.wmsStatus === "connected" ? "bg-green-50/50 border-green-100" :
                w.wmsStatus === "error" ? "bg-amber-50/50 border-amber-100" :
                "bg-red-50/50 border-red-100"
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <WmsIcon className={`w-4 h-4 ${wmsCfg.color}`} />
                  <span className="text-xs font-semibold text-[#0A1628]">{w.code}</span>
                </div>
                <div className="text-[10px] text-gray-500">{w.city}</div>
                <div className={`text-[10px] font-medium mt-1 ${wmsCfg.color}`}>
                  {w.wmsStatus === "connected" ? `Connected · ${w.lastSync}` :
                   w.wmsStatus === "error" ? `Error · ${w.lastSync}` :
                   `Disconnected · ${w.lastSync}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
