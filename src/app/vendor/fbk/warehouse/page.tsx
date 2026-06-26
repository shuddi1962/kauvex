"use client";

import { useState, useMemo } from "react";
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
  ChevronUp,
  Info,
  Eye,
  TrendingUpIcon,
  Minus,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize,
  PackageCheck,
  PackageX,
  ShoppingCart,
  Sparkles,
  Lightbulb,
  Trash2,
  Tag,
  Gift,
  ArrowRight,
  Calendar,
  Weight,
  Truck,
} from "lucide-react";

type Tab = "overview" | "inventory" | "storage" | "analytics" | "costs" | "slow";

const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: "overview", label: "Overview", icon: Package },
  { id: "inventory", label: "My Inventory", icon: Box },
  { id: "storage", label: "Storage Map", icon: MapPin },
  { id: "analytics", label: "FBK Analytics", icon: BarChart3 },
  { id: "costs", label: "Cost Center", icon: DollarSign },
  { id: "slow", label: "Slow Movers", icon: Clock },
];

const inventoryItems = [
  { id: "INV-001", sku: "WEB-001", name: "Wireless Earbuds Pro", image: "/img/products/earbuds.jpg", onHand: 245, reserved: 32, inbound: 50, available: 213, binLocation: "A-12-3", daysSinceLastSale: 2, storageFeePerDay: 150, reorderPoint: 100, status: "healthy" as const, velocity: 12, daysOfSupply: 20, sales30d: 360, sales60d: 680, sales90d: 1020, costPerUnit: 4500 },
  { id: "INV-002", sku: "IPC-002", name: "iPhone 15 Case", image: "/img/products/case.jpg", onHand: 89, reserved: 15, inbound: 0, available: 74, binLocation: "B-04-1", daysSinceLastSale: 5, storageFeePerDay: 80, reorderPoint: 60, status: "healthy" as const, velocity: 8, daysOfSupply: 11, sales30d: 240, sales60d: 460, sales90d: 700, costPerUnit: 1200 },
  { id: "INV-003", sku: "MRS-010", name: "Men's Running Shoes", image: "/img/products/shoes.jpg", onHand: 320, reserved: 45, inbound: 100, available: 275, binLocation: "C-08-2", daysSinceLastSale: 30, storageFeePerDay: 420, reorderPoint: 80, status: "slow" as const, velocity: 5, daysOfSupply: 64, sales30d: 150, sales60d: 320, sales90d: 500, costPerUnit: 8500 },
  { id: "INV-004", sku: "OGT-005", name: "Organic Green Tea Box", image: "/img/products/tea.jpg", onHand: 18, reserved: 8, inbound: 200, available: 10, binLocation: "D-02-4", daysSinceLastSale: 1, storageFeePerDay: 60, reorderPoint: 50, status: "critical" as const, velocity: 15, daysOfSupply: 1, sales30d: 450, sales60d: 820, sales90d: 1200, costPerUnit: 2800 },
  { id: "INV-005", sku: "BTS-003", name: "Bluetooth Speaker", image: "/img/products/speaker.jpg", onHand: 156, reserved: 22, inbound: 0, available: 134, binLocation: "A-15-1", daysSinceLastSale: 3, storageFeePerDay: 200, reorderPoint: 60, status: "healthy" as const, velocity: 7, daysOfSupply: 22, sales30d: 210, sales60d: 400, sales90d: 620, costPerUnit: 6200 },
  { id: "INV-006", sku: "SWM-007", name: "Smart Watch X1", image: "/img/products/watch.jpg", onHand: 42, reserved: 18, inbound: 80, available: 24, binLocation: "B-09-3", daysSinceLastSale: 8, storageFeePerDay: 350, reorderPoint: 50, status: "reorder" as const, velocity: 9, daysOfSupply: 5, sales30d: 270, sales60d: 510, sales90d: 780, costPerUnit: 12000 },
  { id: "INV-007", sku: "YGA-004", name: "Yoga Mat Premium", image: "/img/products/yoga.jpg", onHand: 0, reserved: 0, inbound: 150, available: 0, binLocation: "C-03-1", daysSinceLastSale: 45, storageFeePerDay: 0, reorderPoint: 30, status: "stockout" as const, velocity: 3, daysOfSupply: 0, sales30d: 90, sales60d: 200, sales90d: 320, costPerUnit: 3500 },
  { id: "INV-008", sku: "WBT-006", name: "Water Bottle Steel", image: "/img/products/bottle.jpg", onHand: 520, reserved: 35, inbound: 0, available: 485, binLocation: "D-11-2", daysSinceLastSale: 95, storageFeePerDay: 50, reorderPoint: 40, status: "slow" as const, velocity: 2, daysOfSupply: 260, sales30d: 60, sales60d: 130, sales90d: 200, costPerUnit: 1800 },
  { id: "INV-009", sku: "PLC-011", name: "Phone Lens Kit", image: "/img/products/lens.jpg", onHand: 180, reserved: 10, inbound: 0, available: 170, binLocation: "E-05-1", daysSinceLastSale: 4, storageFeePerDay: 90, reorderPoint: 40, status: "healthy" as const, velocity: 10, daysOfSupply: 18, sales30d: 300, sales60d: 580, sales90d: 850, costPerUnit: 2200 },
  { id: "INV-010", sku: "CHG-012", name: "Fast Charger 65W", image: "/img/products/charger.jpg", onHand: 310, reserved: 28, inbound: 0, available: 282, binLocation: "A-03-2", daysSinceLastSale: 1, storageFeePerDay: 70, reorderPoint: 50, status: "healthy" as const, velocity: 14, daysOfSupply: 22, sales30d: 420, sales60d: 800, sales90d: 1180, costPerUnit: 1800 },
];

const warehouseLocations = [
  { name: "Lagos Fulfillment Center", code: "LAG-FC", count: 580, address: "15 Admiralty Way, Lekki" },
  { name: "Abuja Distribution Hub", code: "ABJ-DH", count: 320, address: "12 Aguiyi-Ironsi St, Maitama" },
  { name: "Port Harcourt Warehouse", code: "PHC-WH", count: 180, address: "8 Trans Amadi Road" },
];

const activityFeed = [
  { id: 1, type: "picked", message: "Order KAU-3921 picked — 2x Wireless Earbuds Pro (Bin A-12-3)", time: "12 min ago", icon: PackageCheck, color: "text-blue-600", bg: "bg-blue-50" },
  { id: 2, type: "received", message: "Shipment KVX-INB-00412 received — 50 units Wireless Earbuds Pro", time: "28 min ago", icon: ArrowDownRight, color: "text-green-600", bg: "bg-green-50" },
  { id: 3, type: "low_stock", message: "Low stock alert: Organic Green Tea Box — 18 units (reorder: 50)", time: "1 hour ago", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  { id: 4, type: "dispatched", message: "Order KAU-3918 dispatched — 1x Smart Watch X1 → Abuja", time: "1.5 hours ago", icon: Truck, color: "text-purple-600", bg: "bg-purple-50" },
  { id: 5, type: "received", message: "Shipment KVX-INB-00411 received — 100 units Men's Running Shoes", time: "2 hours ago", icon: ArrowDownRight, color: "text-green-600", bg: "bg-green-50" },
  { id: 6, type: "picked", message: "Order KAU-3915 picked — 1x Bluetooth Speaker (Bin A-15-1)", time: "3 hours ago", icon: PackageCheck, color: "text-blue-600", bg: "bg-blue-50" },
  { id: 7, type: "fee", message: "Monthly storage fee charged: ₦45,200", time: "1 day ago", icon: DollarSign, color: "text-red-600", bg: "bg-red-50" },
  { id: 8, type: "low_stock", message: "Reorder alert: Smart Watch X1 — 42 units (reorder: 50)", time: "1 day ago", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
];

const storageBinData = [
  { aisle: "A", shelves: 5, binsPerShelf: 6 },
  { aisle: "B", shelves: 5, binsPerShelf: 6 },
  { aisle: "C", shelves: 4, binsPerShelf: 5 },
  { aisle: "D", shelves: 4, binsPerShelf: 5 },
  { aisle: "E", shelves: 3, binsPerShelf: 4 },
];

const generateBinData = () => {
  const bins: { id: string; aisle: string; shelf: number; bin: number; occupancy: number; product: string; qty: number; lastMovement: string }[] = [];
  let idx = 0;
  storageBinData.forEach((aisle) => {
    for (let s = 1; s <= aisle.shelves; s++) {
      for (let b = 1; b <= aisle.binsPerShelf; b++) {
        const hasProduct = Math.random() > 0.3;
        const occupancy = hasProduct ? Math.random() : 0;
        const products = ["Wireless Earbuds Pro", "iPhone 15 Case", "Men's Running Shoes", "Bluetooth Speaker", "Smart Watch X1", "Water Bottle Steel", "Phone Lens Kit", "Fast Charger 65W"];
        bins.push({
          id: `${aisle.aisle}-${s}-${b}`,
          aisle: aisle.aisle,
          shelf: s,
          bin: b,
          occupancy,
          product: hasProduct ? products[Math.floor(Math.random() * products.length)] : "",
          qty: hasProduct ? Math.floor(occupancy * 200) : 0,
          lastMovement: hasProduct ? `${Math.floor(Math.random() * 30) + 1} days ago` : "Never",
        });
        idx++;
      }
    }
  });
  return bins;
};

const costData = [
  { type: "Storage", items: [
    { label: "Wireless Earbuds Pro (A-12-3)", amount: 4500, days: 30 },
    { label: "iPhone 15 Case (B-04-1)", amount: 2400, days: 30 },
    { label: "Men's Running Shoes (C-08-2)", amount: 12600, days: 30 },
    { label: "Bluetooth Speaker (A-15-1)", amount: 6000, days: 30 },
    { label: "Smart Watch X1 (B-09-3)", amount: 10500, days: 30 },
    { label: "Water Bottle Steel (D-11-2)", amount: 1500, days: 30 },
    { label: "Phone Lens Kit (E-05-1)", amount: 2700, days: 30 },
    { label: "Fast Charger 65W (A-03-2)", amount: 2100, days: 30 },
  ]},
  { type: "Inbound Handling", total: 65000, shipments: 3 },
  { type: "Pick & Pack", total: 210000, orders: 145 },
  { type: "Removal", total: 0, count: 0 },
];

const slowMoversData = [
  { sku: "WBT-006", name: "Water Bottle Steel", image: "/img/products/bottle.jpg", stock: 520, daysSinceLastSale: 95, storageCost30d: 1500, velocity: 2, options: [
    { label: "Flash Sale", desc: "30% off for 7 days", projectedRevenue: 364000, costImpact: -1500, timeToSell: "7-14 days" },
    { label: "Bundle with Fast Mover", desc: "Pair with Fast Charger 65W", projectedRevenue: 520000, costImpact: 0, timeToSell: "14-21 days" },
    { label: "Reduce Price", desc: "Cut from ₦2,000 to ₦1,500", projectedRevenue: 780000, costImpact: -500, timeToSell: "21-30 days" },
    { label: "Remove from FBK", desc: "Ship back to self-fulfill", projectedRevenue: 0, costImpact: -93000, timeToSell: "N/A" },
    { label: "Donate", desc: "Tax write-off at ₦900/unit", projectedRevenue: 0, costImpact: -468000, timeToSell: "N/A" },
  ]},
  { sku: "MRS-010", name: "Men's Running Shoes", image: "/img/products/shoes.jpg", stock: 320, daysSinceLastSale: 30, storageCost30d: 12600, velocity: 5, options: [
    { label: "Flash Sale", desc: "25% off for 10 days", projectedRevenue: 12000000, costImpact: -12600, timeToSell: "10-20 days" },
    { label: "Bundle with Fast Mover", desc: "Pair with Phone Lens Kit", projectedRevenue: 14400000, costImpact: 0, timeToSell: "20-30 days" },
    { label: "Reduce Price", desc: "Cut from ₦45,000 to ₦38,000", projectedRevenue: 12160000, costImpact: -3000, timeToSell: "30-45 days" },
    { label: "Remove from FBK", desc: "Ship back to self-fulfill", projectedRevenue: 0, costImpact: -12600, timeToSell: "N/A" },
    { label: "Donate", desc: "Tax write-off at ₦25,000/unit", projectedRevenue: 0, costImpact: -8000000, timeToSell: "N/A" },
  ]},
  { sku: "SWM-007", name: "Smart Watch X1", image: "/img/products/watch.jpg", stock: 42, daysSinceLastSale: 8, storageCost30d: 10500, velocity: 9, options: [
    { label: "Flash Sale", desc: "20% off for 5 days", projectedRevenue: 1008000, costImpact: -10500, timeToSell: "5-10 days" },
    { label: "Bundle with Fast Mover", desc: "Pair with Fast Charger 65W", projectedRevenue: 1260000, costImpact: 0, timeToSell: "10-14 days" },
    { label: "Reduce Price", desc: "Cut from ₦30,000 to ₦25,000", projectedRevenue: 1050000, costImpact: -2000, timeToSell: "14-21 days" },
    { label: "Remove from FBK", desc: "Ship back to self-fulfill", projectedRevenue: 0, costImpact: -10500, timeToSell: "N/A" },
    { label: "Donate", desc: "Tax write-off at ₦18,000/unit", projectedRevenue: 0, costImpact: -756000, timeToSell: "N/A" },
  ]},
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  healthy: { color: "text-green-700", bg: "bg-green-100", label: "Healthy" },
  low: { color: "text-amber-700", bg: "bg-amber-100", label: "Low" },
  reorder: { color: "text-orange-700", bg: "bg-orange-100", label: "At Reorder" },
  critical: { color: "text-red-700", bg: "bg-red-100", label: "Critical" },
  stockout: { color: "text-red-700", bg: "bg-red-100", label: "Stockout" },
  slow: { color: "text-purple-700", bg: "bg-purple-100", label: "Slow Mover" },
};

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

function HorizontalBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-28 text-right shrink-0 truncate">{label}</span>
      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all flex items-center justify-end pr-2`}
          style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
        >
          {value > 0 && <span className="text-[10px] font-medium text-white">{formatCurrency(value)}</span>}
        </div>
      </div>
    </div>
  );
}

function BarChartVertical({ data, maxVal, color }: { data: { label: string; value: number }[]; maxVal: number; color: string }) {
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] text-gray-500">{d.value > 0 ? formatCurrency(d.value) : ""}</span>
          <div
            className={`w-full ${color} rounded-t-md transition-all hover:opacity-80`}
            style={{ height: `${maxVal > 0 ? (d.value / maxVal) * 100 : 0}%`, minHeight: d.value > 0 ? "4px" : "0" }}
          />
          <span className="text-[10px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function VendorFbkWarehousePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [velocityRange, setVelocityRange] = useState<"30" | "60" | "90">("30");
  const [slowAction, setSlowAction] = useState<Record<string, string>>({});

  const filteredInventory = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const totalOnHand = inventoryItems.reduce((a, i) => a + i.onHand, 0);
  const totalReserved = inventoryItems.reduce((a, i) => a + i.reserved, 0);
  const totalInbound = inventoryItems.reduce((a, i) => a + i.inbound, 0);
  const totalAvailable = totalOnHand - totalReserved;
  const lowStockCount = inventoryItems.filter((i) => i.status === "critical" || i.status === "reorder" || i.status === "stockout").length;
  const slowMoverCount = inventoryItems.filter((i) => i.status === "slow").length;
  const monthlyStorageCost = inventoryItems.reduce((a, i) => a + i.storageFeePerDay * 30, 0);
  const avgDaysOfSupply = inventoryItems.filter((i) => i.velocity > 0).reduce((a, i) => a + i.onHand / i.velocity, 0) / inventoryItems.filter((i) => i.velocity > 0).length;

  const weeklyOrders = [12, 18, 15, 22, 19, 25, 20];
  const maxWeekly = Math.max(...weeklyOrders);

  const bins = useMemo(() => generateBinData(), []);

  const allBins = useMemo(() => generateBinData(), []);

  const selectedBinData = allBins.find((b) => b.id === selectedBin);

  const totalCostFees = costData.reduce((a, c) => a + (c.total || c.items?.reduce((s, i) => s + i.amount, 0) || 0), 0);
  const fbkRevenue = 1825000;
  const fbkProfit = fbkRevenue - totalCostFees;
  const fbkMargin = ((fbkProfit / fbkRevenue) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0A1628]">FBK Warehouse Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor your inventory, costs, and performance at the fulfillment center</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-[#e55f00] transition self-start">
          <RefreshCw className="w-4 h-4" /> Refresh All
        </button>
      </div>

      {/* Warehouse Location Indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Warehouse className="w-4 h-4 text-[#0A1628]" />
          <span className="text-sm font-semibold text-[#0A1628]">Your Warehouse Locations</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {warehouseLocations.map((wh) => (
            <div key={wh.code} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-[#0A1628] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#0A1628] truncate">{wh.name}</div>
                <div className="text-xs text-gray-500 truncate">{wh.address}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-[#FF6B00]">{wh.count.toLocaleString()}</div>
                <div className="text-[10px] text-gray-400">units</div>
              </div>
            </div>
          ))}
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

      {/* ==================== TAB 1: OVERVIEW ==================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Live Status Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500">Units in Stock</span>
              </div>
              <div className="text-2xl font-bold text-[#0A1628]">{totalOnHand.toLocaleString()}</div>
              <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12% vs last week
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs text-gray-500">Units Inbound</span>
              </div>
              <div className="text-2xl font-bold text-[#0A1628]">{totalInbound.toLocaleString()}</div>
              <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> 2 shipments pending
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-xs text-gray-500">Units Reserved</span>
              </div>
              <div className="text-2xl font-bold text-[#0A1628]">{totalReserved.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Pending fulfillment</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Box className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <span className="text-xs text-gray-500">Units Available</span>
              </div>
              <div className="text-2xl font-bold text-[#0A1628]">{totalAvailable.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Ready to sell</div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-xs text-gray-500">Low Stock Alerts</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
              <div className="text-xs text-red-500 mt-1">SKUs need attention</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-xs text-gray-500">Slow Movers</span>
              </div>
              <div className="text-2xl font-bold text-amber-600">{slowMoverCount}</div>
              <div className="text-xs text-amber-500 mt-1">SKUs with low velocity</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-xs text-gray-500">Monthly Storage Cost</span>
              </div>
              <div className="text-2xl font-bold text-[#0A1628]">{formatCurrency(monthlyStorageCost)}</div>
              <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> -8% vs last month
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-xs text-gray-500">Days of Supply (AI)</span>
              </div>
              <div className="text-2xl font-bold text-[#0A1628]">{avgDaysOfSupply.toFixed(1)}</div>
              <div className="text-xs text-gray-500 mt-1">AI-calculated avg</div>
            </div>
          </div>

          {/* Activity Feed + Weekly Orders */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Live Activity Feed</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {activityFeed.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center shrink-0 ${item.color}`}>
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
                      style={{ height: `${(v / maxWeekly) * 100}%` }}
                    />
                    <span className="text-[10px] text-gray-400">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: MY INVENTORY ==================== */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by SKU or product name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            >
              <option value="all">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="low">Low</option>
              <option value="reorder">At Reorder</option>
              <option value="critical">Critical</option>
              <option value="stockout">Stockout</option>
              <option value="slow">Slow Mover</option>
            </select>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200 transition">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-[#0A1628] text-white text-sm rounded-lg hover:bg-[#0d1f3c] transition">
                <MapPin className="w-4 h-4" /> Map View
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Product</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">SKU</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">On Hand</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Reserved</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Available</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Inbound</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Bin</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Days Since Sale</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Storage Fee/mo</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Reorder Pt</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const sc = statusConfig[item.status] || statusConfig.healthy;
                    const isExpanded = expandedRow === item.id;
                    return (
                      <>
                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                              <span className="text-sm font-medium text-[#0A1628] truncate max-w-[180px]">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-[#FF6B00] font-medium">{item.sku}</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-[#0A1628]">{item.onHand}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{item.reserved}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-[#0A1628]">{item.available}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{item.inbound}</td>
                          <td className="px-4 py-3 text-xs font-mono text-gray-500">{item.binLocation}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <span className={`font-medium ${item.daysSinceLastSale > 60 ? "text-red-600" : item.daysSinceLastSale > 30 ? "text-amber-600" : "text-green-600"}`}>
                              {item.daysSinceLastSale}d
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-[#0A1628]">{formatCurrency(item.storageFeePerDay * 30)}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{item.reorderPoint}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setExpandedRow(isExpanded ? null : item.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${item.id}-detail`}>
                            <td colSpan={12} className="px-4 py-4 bg-gray-50/80">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Stock Breakdown */}
                                <div className="bg-white rounded-lg border border-gray-100 p-4">
                                  <h4 className="text-xs font-semibold text-[#0A1628] mb-3">Stock Breakdown</h4>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between"><span className="text-gray-500">On Hand</span><span className="font-bold text-[#0A1628]">{item.onHand}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Reserved</span><span className="text-[#0A1628]">{item.reserved}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Available</span><span className="font-bold text-green-600">{item.available}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Inbound</span><span className="text-blue-600">{item.inbound}</span></div>
                                    <div className="flex justify-between border-t border-gray-100 pt-2"><span className="text-gray-500">Days of Supply</span><span className="font-bold text-[#0A1628]">{item.daysOfSupply}d</span></div>
                                  </div>
                                </div>

                                {/* Sales Velocity Chart */}
                                <div className="bg-white rounded-lg border border-gray-100 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-semibold text-[#0A1628]">Sales Velocity</h4>
                                    <div className="flex gap-1">
                                      {(["30", "60", "90"] as const).map((r) => (
                                        <button
                                          key={r}
                                          onClick={() => setVelocityRange(r)}
                                          className={`text-[10px] px-2 py-0.5 rounded ${velocityRange === r ? "bg-[#0A1628] text-white" : "bg-gray-100 text-gray-500"}`}
                                        >
                                          {r}d
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="text-2xl font-bold text-[#0A1628] mb-2">
                                    {velocityRange === "30" ? item.sales30d : velocityRange === "60" ? item.sales60d : item.sales90d} units
                                  </div>
                                  <MiniSparkline
                                    values={velocityRange === "30"
                                      ? [item.sales30d / 6, item.sales30d / 5, item.sales30d / 4, item.sales30d / 3, item.sales30d / 2, item.sales30d]
                                      : velocityRange === "60"
                                        ? [item.sales60d / 6, item.sales60d / 5, item.sales60d / 4, item.sales60d / 3, item.sales60d / 2, item.sales60d]
                                        : [item.sales90d / 6, item.sales90d / 5, item.sales90d / 4, item.sales90d / 3, item.sales90d / 2, item.sales90d]
                                    }
                                    color={item.status === "slow" ? "bg-purple-500" : "bg-[#FF6B00]"}
                                  />
                                </div>

                                {/* Restock + Cost */}
                                <div className="bg-white rounded-lg border border-gray-100 p-4">
                                  <h4 className="text-xs font-semibold text-[#0A1628] mb-3">Restock & Cost</h4>
                                  <div className="space-y-2 text-xs">
                                    <div className="flex justify-between"><span className="text-gray-500">Reorder Point</span><span className="font-bold text-[#0A1628]">{item.reorderPoint}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Velocity/day</span><span className="font-bold text-[#0A1628]">{item.velocity}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Days Until Stockout</span><span className={`font-bold ${item.daysOfSupply <= 3 ? "text-red-600" : item.daysOfSupply <= 10 ? "text-amber-600" : "text-green-600"}`}>{item.daysOfSupply}d</span></div>
                                    <div className="flex justify-between border-t border-gray-100 pt-2"><span className="text-gray-500">Storage Cost/mo</span><span className="font-bold text-[#0A1628]">{formatCurrency(item.storageFeePerDay * 30)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Cost/Unit</span><span className="font-bold text-[#0A1628]">{formatCurrency(item.costPerUnit)}</span></div>
                                  </div>
                                  {item.status === "critical" || item.status === "stockout" ? (
                                    <button className="mt-3 w-full py-2 bg-[#FF6B00] text-white text-xs font-semibold rounded-lg hover:bg-[#e55f00] transition">
                                      Reorder Now
                                    </button>
                                  ) : item.status === "slow" ? (
                                    <button className="mt-3 w-full py-2 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg hover:bg-purple-200 transition">
                                      View Slow Mover Actions
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredInventory.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">No items match your search or filter.</div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: STORAGE MAP ==================== */}
      {activeTab === "storage" && (
        <div className="space-y-4">
          {/* Unique Feature Callout */}
          <div className="bg-gradient-to-r from-[#0A1628] to-[#162a4a] rounded-xl p-5 text-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF6B00] flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Your Glass Window Into the Warehouse</h3>
                <p className="text-xs text-white/70 mt-1">See exactly where your products are stored, bin by bin. No competitor offers this level of transparency. Click any bin below for full details.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#0A1628]">Warehouse Floor Plan — Lagos FC</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                  <ZoomOut className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-xs text-gray-500 font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(Math.min(2, zoom + 0.25))} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                  <ZoomIn className="w-4 h-4 text-gray-600" />
                </button>
                <button onClick={() => setZoom(1)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                  <Maximize className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-500" /> <span className="text-gray-500">Full (your bins)</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-yellow-500" /> <span className="text-gray-500">Low stock</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /> <span className="text-gray-500">Empty</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-200 border border-gray-300" /> <span className="text-gray-500">Other vendor</span></div>
            </div>

            {/* Floor Plan Grid */}
            <div
              className="bg-[#0A1628] rounded-xl p-6 relative overflow-auto"
              style={{ minHeight: 500 }}
            >
              {/* Grid background */}
              <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none">
                <defs>
                  <pattern id="whgrid2" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#whgrid2)" />
              </svg>

              <div className="relative z-10" style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 0.2s ease" }}>
                {storageBinData.map((aisleDef) => (
                  <div key={aisleDef.aisle} className="mb-6">
                    <div className="text-white/40 text-xs font-mono mb-2 ml-1">Aisle {aisleDef.aisle}</div>
                    <div className="space-y-1.5">
                      {Array.from({ length: aisleDef.shelves }).map((_, shelfIdx) => (
                        <div key={shelfIdx} className="flex items-center gap-1.5">
                          <span className="text-white/30 text-[10px] font-mono w-6 text-right shrink-0">S{shelfIdx + 1}</span>
                          <div className="flex gap-1.5">
                            {Array.from({ length: aisleDef.binsPerShelf }).map((_, binIdx) => {
                              const binId = `${aisleDef.aisle}-${shelfIdx + 1}-${binIdx + 1}`;
                              const bin = allBins.find((b) => b.id === binId);
                              const occ = bin?.occupancy ?? 0;
                              const isVendorBin = bin && bin.occupancy > 0 && Math.random() > 0.4;
                              let cellColor = "bg-white/5 border-white/10";
                              if (isVendorBin) {
                                if (occ > 0.7) cellColor = "bg-green-500/70 border-green-400/30";
                                else if (occ > 0.3) cellColor = "bg-yellow-500/60 border-yellow-400/30";
                                else cellColor = "bg-red-500/60 border-red-400/30";
                              } else if (bin && bin.occupancy > 0) {
                                cellColor = "bg-white/10 border-white/15";
                              }
                              return (
                                <div
                                  key={binId}
                                  onClick={() => setSelectedBin(selectedBin === binId ? null : binId)}
                                  className={`w-12 h-10 rounded-md ${cellColor} border flex items-center justify-center text-[9px] text-white/60 font-mono cursor-pointer hover:border-[#FF6B00] hover:scale-110 transition-all ${selectedBin === binId ? "ring-2 ring-[#FF6B00] border-[#FF6B00]" : ""}`}
                                  title={`${binId} — ${bin?.product || "Empty"} (${bin?.qty || 0} units)`}
                                >
                                  {aisleDef.aisle}{shelfIdx + 1}-{binIdx + 1}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Bin Detail */}
              {selectedBinData && (
                <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-xl p-4 z-20 max-w-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#0A1628]">Bin {selectedBinData.id}</span>
                    <button onClick={() => setSelectedBin(null)} className="p-1 hover:bg-gray-100 rounded">
                      <XCircle className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  {selectedBinData.product ? (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500">Product</span><span className="font-medium text-[#0A1628]">{selectedBinData.product}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Quantity</span><span className="font-bold text-[#0A1628]">{selectedBinData.qty} units</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Occupancy</span><span className={`font-bold ${selectedBinData.occupancy > 0.7 ? "text-green-600" : selectedBinData.occupancy > 0.3 ? "text-yellow-600" : "text-red-600"}`}>{Math.round(selectedBinData.occupancy * 100)}%</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Last Movement</span><span className="text-[#0A1628]">{selectedBinData.lastMovement}</span></div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">This bin is empty.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: FBK ANALYTICS ==================== */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">FBK Fill Rate</span>
              </div>
              <div className="text-2xl font-bold text-[#0A1628]">97.3%</div>
              <MiniSparkline values={[94, 95, 96, 97, 96, 98, 97]} color="bg-green-500" />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-500">FBK Velocity</span>
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
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-red-600" />
                <span className="text-xs text-gray-500">Cost Per Order</span>
              </div>
              <div className="text-2xl font-bold text-[#0A1628]">{formatCurrency(2650)}</div>
              <MiniSparkline values={[3200, 3100, 2900, 3000, 2800, 2750, 2650]} color="bg-red-500" />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#FF6B00]" />
                <span className="text-xs text-gray-500">FBK ROI</span>
              </div>
              <div className="text-2xl font-bold text-[#0A1628]">340%</div>
              <MiniSparkline values={[280, 300, 310, 320, 330, 335, 340]} color="bg-[#FF6B00]" />
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Inventory Level Over Time (30d)</h3>
              <BarChartVertical
                data={[
                  { label: "W1", value: 1200 },
                  { label: "W2", value: 1350 },
                  { label: "W3", value: 1100 },
                  { label: "W4", value: 1420 },
                ]}
                maxVal={1500}
                color="bg-[#0A1628]"
              />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Inbound vs Outbound Flow (30d)</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Inbound</span>
                    <span className="font-medium text-green-600">350 units</span>
                  </div>
                  <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "58%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Outbound</span>
                    <span className="font-medium text-[#FF6B00]">250 units</span>
                  </div>
                  <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF6B00] rounded-full" style={{ width: "42%" }} />
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Net Growth</span>
                    <span className="font-bold text-green-600">+100 units</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Storage Cost Trend (7 months)</h3>
              <BarChartVertical
                data={[
                  { label: "Jan", value: 165000 },
                  { label: "Feb", value: 158000 },
                  { label: "Mar", value: 152000 },
                  { label: "Apr", value: 149000 },
                  { label: "May", value: 147000 },
                  { label: "Jun", value: 145000 },
                  { label: "Jul", value: 142000 },
                ]}
                maxVal={170000}
                color="bg-red-400"
              />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Sales Velocity per SKU (units/day)</h3>
              <div className="space-y-2">
                {inventoryItems.slice(0, 6).map((item) => (
                  <div key={item.sku} className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-gray-500 w-16 text-right shrink-0">{item.sku}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${item.velocity >= 10 ? "bg-green-500" : item.velocity >= 5 ? "bg-[#FF6B00]" : "bg-amber-500"}`}
                        style={{ width: `${(item.velocity / 15) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#0A1628] w-8 text-right">{item.velocity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 5: COST CENTER ==================== */}
      {activeTab === "costs" && (
        <div className="space-y-6">
          {/* Fee Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Storage Fees (30d)</div>
              <div className="text-xl font-bold text-[#0A1628]">{formatCurrency(costData[0].items.reduce((s, i) => s + i.amount, 0))}</div>
              <div className="text-xs text-green-600 mt-1">-8% vs last month</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Pick & Pack Fees</div>
              <div className="text-xl font-bold text-[#0A1628]">{formatCurrency(costData[2].total)}</div>
              <div className="text-xs text-amber-600 mt-1">+3% vs last month</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Inbound Handling</div>
              <div className="text-xl font-bold text-[#0A1628]">{formatCurrency(costData[1].total)}</div>
              <div className="text-xs text-gray-500 mt-1">{costData[1].shipments} shipments received</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">Total FBK Spend</div>
              <div className="text-xl font-bold text-[#FF6B00]">{formatCurrency(totalCostFees)}</div>
              <div className="text-xs text-gray-500 mt-1">This month</div>
            </div>
          </div>

          {/* Cost vs Revenue */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Cost vs Revenue Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="text-xs text-green-600 mb-1">FBK Products Revenue</div>
                <div className="text-2xl font-bold text-green-700">{formatCurrency(fbkRevenue)}</div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="text-xs text-red-600 mb-1">FBK Total Fees</div>
                <div className="text-2xl font-bold text-red-700">{formatCurrency(totalCostFees)}</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-xs text-blue-600 mb-1">Net Profit</div>
                <div className="text-2xl font-bold text-blue-700">{formatCurrency(fbkProfit)}</div>
              </div>
              <div className="p-4 bg-[#0A1628] rounded-xl">
                <div className="text-xs text-white/60 mb-1">FBK Profit Margin</div>
                <div className="text-2xl font-bold text-[#FF6B00]">{fbkMargin}%</div>
              </div>
            </div>
          </div>

          {/* Storage Fees by SKU */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Storage Fees by SKU</h3>
            <div className="space-y-3">
              {costData[0].items.map((fee) => (
                <HorizontalBar
                  key={fee.label}
                  label={fee.label.split("(")[0].trim()}
                  value={fee.amount}
                  max={Math.max(...costData[0].items.map((f) => f.amount))}
                  color="bg-[#FF6B00]"
                />
              ))}
            </div>
          </div>

          {/* Storage Fees by Day Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Storage Fees by Day (30d)</h3>
            <BarChartVertical
              data={Array.from({ length: 30 }, (_, i) => ({
                label: i % 5 === 0 ? `${i + 1}` : "",
                value: Math.floor(Math.random() * 2000 + 4000),
              }))}
              maxVal={6000}
              color="bg-[#FF6B00]"
            />
          </div>

          {/* Fee Breakdown Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-[#0A1628]">Fee Breakdown</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Fee Type</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: "Storage Fees", amount: costData[0].items.reduce((s, i) => s + i.amount, 0), detail: `${costData[0].items.length} SKUs × 30 days` },
                  { type: "Inbound Handling", amount: costData[1].total, detail: `${costData[1].shipments} shipments received` },
                  { type: "Pick & Pack Fees", amount: costData[2].total, detail: `${costData[2].orders} orders fulfilled` },
                  { type: "Removal Fees", amount: costData[3].total, detail: `${costData[3].count} items removed` },
                ].map((row) => (
                  <tr key={row.type} className="border-b border-gray-50 hover:bg-gray-50/30">
                    <td className="px-5 py-3 text-sm font-medium text-[#0A1628]">{row.type}</td>
                    <td className="px-5 py-3 text-sm text-right font-bold text-[#0A1628]">{formatCurrency(row.amount)}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">{row.detail}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50/50">
                  <td className="px-5 py-3 text-sm font-bold text-[#0A1628]">Total</td>
                  <td className="px-5 py-3 text-sm text-right font-bold text-[#FF6B00]">{formatCurrency(totalCostFees)}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{((totalCostFees / fbkRevenue) * 100).toFixed(1)}% of revenue</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Optimization Suggestions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-[#FF6B00]" />
              <h3 className="text-sm font-semibold text-[#0A1628]">Optimization Suggestions</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-red-800">Your slow-moving SKU WBT-006 has cost ₦1,500 in storage this month with zero sales</div>
                  <div className="text-xs text-red-700 mt-1">Consider a flash sale or removing from FBK to cut losses.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-amber-800">MRS-010 occupies large bins with low velocity (5/day)</div>
                  <div className="text-xs text-amber-700 mt-1">Consolidating could save ~₦6,000/month in storage fees.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-green-800">High-velocity SKU CHG-012 is optimally placed</div>
                  <div className="text-xs text-green-700 mt-1">Fast Charger 65W moves 14/day — current bin allocation is efficient.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-blue-800">Increase OGT-005 reorder point to 80 units</div>
                  <div className="text-xs text-blue-700 mt-1">Highest velocity (15/day) but critically low stock — risk of stockout within 1 day.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 6: SLOW MOVERS ==================== */}
      {activeTab === "slow" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-amber-800">Slow-Moving Inventory Alert</div>
              <div className="text-xs text-amber-700 mt-1">
                Items not sold in 90+ days incur storage costs without generating revenue. Choose a recovery option below for each SKU to minimize losses.
              </div>
            </div>
          </div>

          {slowMoversData.map((item) => {
            const selectedOption = slowAction[item.sku] || "";
            return (
              <div key={item.sku} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Package className="w-7 h-7 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#FF6B00]">{item.sku}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        {item.daysSinceLastSale}d inactive
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-[#0A1628] mt-1">{item.name}</h4>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Stock: <span className="font-bold text-[#0A1628]">{item.stock}</span></span>
                      <span>Velocity: <span className="font-bold text-[#0A1628]">{item.velocity}/day</span></span>
                      <span>Storage 30d: <span className="font-bold text-red-600">{formatCurrency(item.storageCost30d)}</span></span>
                    </div>
                  </div>
                </div>

                {/* Recovery Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {item.options.map((opt) => {
                    const isSelected = selectedOption === opt.label;
                    const iconMap: Record<string, typeof Tag> = {
                      "Flash Sale": Tag,
                      "Bundle with Fast Mover": Gift,
                      "Reduce Price": TrendingDown,
                      "Remove from FBK": Trash2,
                      "Donate": Gift,
                    };
                    const Icon = iconMap[opt.label] || Tag;
                    const colorMap: Record<string, string> = {
                      "Flash Sale": "border-orange-200 bg-orange-50 text-orange-700",
                      "Bundle with Fast Mover": "border-blue-200 bg-blue-50 text-blue-700",
                      "Reduce Price": "border-amber-200 bg-amber-50 text-amber-700",
                      "Remove from FBK": "border-gray-200 bg-gray-50 text-gray-700",
                      "Donate": "border-purple-200 bg-purple-50 text-purple-700",
                    };
                    return (
                      <button
                        key={opt.label}
                        onClick={() => setSlowAction({ ...slowAction, [item.sku]: isSelected ? "" : opt.label })}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${isSelected ? "border-[#FF6B00] bg-[#FF6B00]/5 shadow-md" : colorMap[opt.label] || "border-gray-200 bg-gray-50"}`}
                      >
                        <Icon className="w-4 h-4 mb-2" />
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className="text-[10px] mt-1 opacity-75">{opt.desc}</div>
                        <div className="mt-2 pt-2 border-t border-black/10 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="opacity-60">Revenue</span>
                            <span className="font-bold">{opt.projectedRevenue > 0 ? formatCurrency(opt.projectedRevenue) : "—"}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="opacity-60">Cost Impact</span>
                            <span className={`font-bold ${opt.costImpact < 0 ? "text-red-600" : "text-green-600"}`}>{opt.costImpact !== 0 ? formatCurrency(opt.costImpact) : "Neutral"}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="opacity-60">Time to Sell</span>
                            <span className="font-bold">{opt.timeToSell}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedOption && (
                  <div className="mt-4 p-3 bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-lg flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
                    <div className="text-xs text-[#0A1628]">
                      <span className="font-semibold">{selectedOption}</span> selected for <span className="font-mono text-[#FF6B00]">{item.sku}</span>.
                      {selectedOption === "Remove from FBK" && " A removal request will be created. You'll need to provide a return address."}
                      {selectedOption === "Flash Sale" && " A 7-day flash sale will be configured. Discount will be applied at checkout."}
                      {selectedOption === "Bundle with Fast Mover" && " Our team will suggest bundle pairings with your high-velocity SKUs."}
                      {selectedOption === "Reduce Price" && " Price update will be submitted for review. Changes go live within 24 hours."}
                      {selectedOption === "Donate" && " Items will be donated to verified charities. Tax receipt will be issued."}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {slowMoversData.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-[#0A1628]">No slow-moving inventory</p>
              <p className="text-xs text-gray-500 mt-1">All your products are selling within expected timeframes.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
