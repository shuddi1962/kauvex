"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BarChart3, TrendingUp, DollarSign, ShoppingCart, Users,
  Percent, FileText, Download, Printer, Package, Truck,
  Warehouse, Store, MapPin, ArrowUpRight, ArrowDownRight,
  CreditCard, Receipt, AlertTriangle, Building2, Ship,
  Timer, CheckCircle, XCircle, Loader2, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/admin-shell";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

type ReportTab = "sales" | "tax" | "vendor" | "inventory" | "shipping" | "warehouse";

const reportTabs: { id: ReportTab; label: string; icon: React.ElementType }[] = [
  { id: "sales", label: "Sales Reports", icon: DollarSign },
  { id: "tax", label: "Tax Reports", icon: Percent },
  { id: "vendor", label: "Vendor Reports", icon: Store },
  { id: "inventory", label: "Inventory Reports", icon: Package },
  { id: "shipping", label: "Shipping Reports", icon: Truck },
  { id: "warehouse", label: "Warehouse Reports", icon: Warehouse },
];

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

// ─── Demo Data ───────────────────────────────────────────

const salesKpis = [
  { label: "Total Revenue", value: "₦18,450,000", change: "+12.5%", up: true },
  { label: "Total Orders", value: "1,847", change: "+8.3%", up: true },
  { label: "Avg Order Value", value: "₦9,989", change: "+3.7%", up: true },
  { label: "Conversion Rate", value: "3.2%", change: "+0.4%", up: true },
];

const revenueDaily = [
  { date: "Mon", revenue: 420000, orders: 42 },
  { date: "Tue", revenue: 510000, orders: 51 },
  { date: "Wed", revenue: 385000, orders: 38 },
  { date: "Thu", revenue: 620000, orders: 62 },
  { date: "Fri", revenue: 750000, orders: 74 },
  { date: "Sat", revenue: 890000, orders: 88 },
  { date: "Sun", revenue: 670000, orders: 67 },
];

const revenueWeekly = [
  { date: "Wk 1", revenue: 3850000, orders: 385 },
  { date: "Wk 2", revenue: 4200000, orders: 420 },
  { date: "Wk 3", revenue: 3950000, orders: 398 },
  { date: "Wk 4", revenue: 4650000, orders: 462 },
];

const revenueMonthly = [
  { date: "Jan", revenue: 12500000, orders: 1250 },
  { date: "Feb", revenue: 14100000, orders: 1412 },
  { date: "Mar", revenue: 16200000, orders: 1624 },
  { date: "Apr", revenue: 14800000, orders: 1488 },
  { date: "May", revenue: 17500000, orders: 1756 },
  { date: "Jun", revenue: 18450000, orders: 1847 },
];

const topProducts = [
  { rank: 1, name: "Hikvision 4CH DVR Kit", sku: "HK-DVR-4CH", sales: 234, revenue: 11700000 },
  { rank: 2, name: "Yamaha 40HP Outboard", sku: "YM-40HP-OB", sales: 45, revenue: 9900000 },
  { rank: 3, name: "Access Control System", sku: "ACS-1000", sales: 89, revenue: 6230000 },
  { rank: 4, name: "Fire Alarm Panel", sku: "FAP-200", sales: 156, revenue: 4680000 },
  { rank: 5, name: "Life Jacket Adult", sku: "LJ-ADT-001", sales: 312, revenue: 3120000 },
  { rank: 6, name: "Marine GPS Navigator", sku: "GPS-MRN-7", sales: 67, revenue: 2680000 },
  { rank: 7, name: "Solar Panel 300W", sku: "SP-300W", sales: 123, revenue: 2214000 },
];

const paymentMethods = [
  { name: "Card (Paystack)", value: 42, amount: 7749000 },
  { name: "Bank Transfer", value: 35, amount: 6457500 },
  { name: "Wallet", value: 12, amount: 2214000 },
  { name: "USSD", value: 8, amount: 1476000 },
  { name: "Crypto", value: 3, amount: 553500 },
];

// ─── Tax Data ────────────────────────────────────────────

const taxKpis = [
  { label: "VAT Collected", value: "₦1,383,750", change: "+12.5%", up: true },
  { label: "VAT Paid (Inputs)", value: "₦735,000", change: "+5.2%", up: true },
  { label: "Net VAT Payable", value: "₦648,750", change: "+18.3%", up: true },
  { label: "Tax Returns Filed", value: "12", change: "1 pending", up: false },
];

const taxRateBreakdown = [
  { rate: "Standard (7.5%)", collected: 1037812, paid: 551250, net: 486562 },
  { rate: "Zero-Rated (0%)", collected: 0, paid: 36750, net: -36750 },
  { rate: "Exempt", collected: 0, paid: 0, net: 0 },
  { rate: "Withholding (5%)", collected: 345938, paid: 147000, net: 198938 },
];

const vatReport = [
  { period: "Jan 2026", collected: 937500, paid: 487500, net: 450000 },
  { period: "Feb 2026", collected: 1057500, paid: 562500, net: 495000 },
  { period: "Mar 2026", collected: 1215000, paid: 675000, net: 540000 },
  { period: "Apr 2026", collected: 1110000, paid: 525000, net: 585000 },
  { period: "May 2026", collected: 1312500, paid: 637500, net: 675000 },
  { period: "Jun 2026", collected: 1383750, paid: 735000, net: 648750 },
];

// ─── Vendor Data ─────────────────────────────────────────

const vendorKpis = [
  { label: "Active Vendors", value: "48", change: "+6", up: true },
  { label: "Total Commission", value: "₦2,767,500", change: "+15.2%", up: true },
  { label: "Vendor Sales", value: "₦27,675,000", change: "+18.7%", up: true },
  { label: "Avg Vendor Score", value: "4.2", change: "+0.3", up: true },
];

const topVendors = [
  { rank: 1, name: "Marine Solutions Ltd", sales: 5840000, commission: 584000, orders: 234, rating: 4.8 },
  { rank: 2, name: "Security Pro NG", sales: 4920000, commission: 492000, orders: 187, rating: 4.6 },
  { rank: 3, name: "Electronics Hub", sales: 3750000, commission: 375000, orders: 156, rating: 4.5 },
  { rank: 4, name: "Safety Gear Co", sales: 2980000, commission: 298000, orders: 312, rating: 4.7 },
  { rank: 5, name: "SolarTech Africa", sales: 2150000, commission: 215000, orders: 98, rating: 4.3 },
  { rank: 6, name: "Auto Parts Direct", sales: 1850000, commission: 185000, orders: 145, rating: 4.1 },
  { rank: 7, name: "Home & Office Supplies", sales: 1420000, commission: 142000, orders: 89, rating: 4.4 },
  { rank: 8, name: "Fashion World", sales: 980000, commission: 98000, orders: 212, rating: 4.0 },
];

const vendorCommissionRates = [
  { tier: "Basic (5%)", vendors: 18, revenue: 4200000, commission: 210000 },
  { tier: "Standard (10%)", vendors: 16, revenue: 8750000, commission: 875000 },
  { tier: "Premium (12%)", vendors: 10, revenue: 9250000, commission: 1110000 },
  { tier: "Enterprise (15%)", vendors: 4, revenue: 5550000, commission: 832500 },
];

// ─── Inventory Data ──────────────────────────────────────

const inventoryKpis = [
  { label: "Total Products", value: "12,847", change: "+234", up: true },
  { label: "Low Stock Items", value: "89", change: "+12", up: false },
  { label: "Out of Stock", value: "23", change: "-5", up: true },
  { label: "Inventory Value", value: "₦89,500,000", change: "+3.2%", up: true },
];

const lowStockAlerts = [
  { name: "Hikvision 4CH DVR Kit", sku: "HK-DVR-4CH", stock: 3, threshold: 20, warehouse: "Lagos Main" },
  { name: "Yamaha 40HP Outboard", sku: "YM-40HP-OB", stock: 2, threshold: 10, warehouse: "Port Harcourt" },
  { name: "Fire Alarm Panel", sku: "FAP-200", stock: 5, threshold: 30, warehouse: "Abuja" },
  { name: "Life Jacket Adult (XL)", sku: "LJ-ADT-XL", stock: 8, threshold: 50, warehouse: "Lagos Main" },
  { name: "Marine GPS Navigator", sku: "GPS-MRN-7", stock: 1, threshold: 15, warehouse: "Warri" },
  { name: "Solar Panel 300W", sku: "SP-300W", stock: 4, threshold: 25, warehouse: "Lagos Main" },
  { name: "Security Camera Dome", sku: "CAM-DOME-4K", stock: 6, threshold: 40, warehouse: "Abuja" },
  { name: "Inverter 5KVA", sku: "INV-5KVA", stock: 0, threshold: 10, warehouse: "Port Harcourt" },
];

const inventoryValuation = [
  { category: "Security & Surveillance", value: 28500000, items: 1240, pct: 31.8 },
  { category: "Marine Equipment", value: 19600000, items: 560, pct: 21.9 },
  { category: "Solar & Power", value: 15700000, items: 890, pct: 17.5 },
  { category: "Safety & PPE", value: 11200000, items: 3450, pct: 12.5 },
  { category: "Electronics", value: 8900000, items: 2100, pct: 9.9 },
  { category: "Automotive", value: 5600000, items: 4607, pct: 6.3 },
];

const stockMovement = [
  { month: "Jan", inbound: 3200, outbound: 2850, returns: 120 },
  { month: "Feb", inbound: 3500, outbound: 3100, returns: 95 },
  { month: "Mar", inbound: 4100, outbound: 3800, returns: 145 },
  { month: "Apr", inbound: 3800, outbound: 3650, returns: 110 },
  { month: "May", inbound: 4500, outbound: 4200, returns: 135 },
  { month: "Jun", inbound: 4800, outbound: 4450, returns: 98 },
];

// ─── Shipping Data ───────────────────────────────────────

const shippingKpis = [
  { label: "Total Shipments", value: "1,647", change: "+10.4%", up: true },
  { label: "On-Time Delivery", value: "94.2%", change: "+1.2%", up: true },
  { label: "Avg Delivery Time", value: "2.3 days", change: "-0.4", up: true },
  { label: "Shipping Cost", value: "₦4,850,000", change: "+8.1%", up: false },
];

const shipmentsByCarrier = [
  { carrier: "GIG Logistics", shipments: 587, onTime: 562, avgDays: 1.8, cost: 1560000 },
  { carrier: "DHL", shipments: 345, onTime: 338, avgDays: 1.2, cost: 1240000 },
  { carrier: "FedEx", shipments: 278, onTime: 264, avgDays: 1.5, cost: 980000 },
  { carrier: "Aramex", shipments: 198, onTime: 178, avgDays: 2.1, cost: 520000 },
  { carrier: "Local Courier", shipments: 158, onTime: 126, avgDays: 3.5, cost: 320000 },
  { carrier: "Kauvex Express", shipments: 81, onTime: 80, avgDays: 0.8, cost: 230000 },
];

const deliveryPerformance = [
  { month: "Jan", onTime: 92.1, delayed: 5.8, damaged: 2.1 },
  { month: "Feb", onTime: 93.5, delayed: 4.7, damaged: 1.8 },
  { month: "Mar", onTime: 91.8, delayed: 6.2, damaged: 2.0 },
  { month: "Apr", onTime: 94.0, delayed: 4.5, damaged: 1.5 },
  { month: "May", onTime: 93.7, delayed: 5.0, damaged: 1.3 },
  { month: "Jun", onTime: 94.2, delayed: 4.3, damaged: 1.5 },
];

const shippingCostAnalysis = [
  { zone: "Lagos Metro", shipments: 523, avgCost: 1850, totalCost: 967550 },
  { zone: "South-South", shipments: 412, avgCost: 3200, totalCost: 1318400 },
  { zone: "South-West", shipments: 298, avgCost: 2800, totalCost: 834400 },
  { zone: "North-Central", shipments: 187, avgCost: 3500, totalCost: 654500 },
  { zone: "South-East", shipments: 145, avgCost: 3100, totalCost: 449500 },
  { zone: "North-East", shipments: 52, avgCost: 4500, totalCost: 234000 },
  { zone: "North-West", shipments: 30, avgCost: 4200, totalCost: 126000 },
];

// ─── Warehouse Data ──────────────────────────────────────

const warehouseKpis = [
  { label: "Total Warehouses", value: "6", change: "+1", up: true },
  { label: "Total Capacity", value: "45,000 sq ft", change: "+10,000", up: true },
  { label: "Utilization", value: "78.4%", change: "+2.1%", up: false },
  { label: "Fulfillment Rate", value: "96.8%", change: "+1.5%", up: true },
];

const warehouseCapacity = [
  { name: "Lagos Main", capacity: 12000, used: 10200, utilization: 85, location: "Ikeja, Lagos" },
  { name: "Port Harcourt", capacity: 8500, used: 6800, utilization: 80, location: "Trans Amadi, PH" },
  { name: "Abuja", capacity: 7500, used: 5250, utilization: 70, location: "Kubwa, Abuja" },
  { name: "Warri", capacity: 6000, used: 5100, utilization: 85, location: "Effurun, Warri" },
  { name: "Calabar", capacity: 5500, used: 3850, utilization: 70, location: "Calabar Port" },
  { name: "Kano", capacity: 5500, used: 2750, utilization: 50, location: "Kano City" },
];

const inventoryByLocation = [
  { category: "Security", lagos: 420, ph: 280, abuja: 190, warri: 150, calabar: 100, kano: 100 },
  { category: "Marine", lagos: 180, ph: 220, abuja: 40, warri: 80, calabar: 40, kano: 0 },
  { category: "Solar", lagos: 310, ph: 190, abuja: 150, warri: 100, calabar: 80, kano: 60 },
  { category: "Safety", lagos: 1200, ph: 650, abuja: 500, warri: 400, calabar: 350, kano: 350 },
  { category: "Electronics", lagos: 780, ph: 420, abuja: 350, warri: 200, calabar: 180, kano: 170 },
  { category: "Automotive", lagos: 1800, ph: 950, abuja: 600, warri: 700, calabar: 300, kano: 257 },
];

const fulfillmentRates = [
  { month: "Jan", rate: 94.5, orders: 1250, fulfilled: 1181 },
  { month: "Feb", rate: 95.2, orders: 1412, fulfilled: 1344 },
  { month: "Mar", rate: 94.8, orders: 1624, fulfilled: 1540 },
  { month: "Apr", rate: 96.0, orders: 1488, fulfilled: 1428 },
  { month: "May", rate: 96.2, orders: 1756, fulfilled: 1689 },
  { month: "Jun", rate: 96.8, orders: 1847, fulfilled: 1788 },
];

// ─── Helpers ─────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toLocaleString()}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printReport(title: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  const content = document.getElementById("report-content");
  const html = content?.innerHTML || "";
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: Inter, Arial, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; color: #1a1a2e; }
      h1 { font-size: 24px; margin-bottom: 4px; }
      h2 { font-size: 18px; margin: 24px 0 12px; }
      .meta { color: #666; font-size: 13px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; font-size: 13px; }
      th { background: #f5f5f5; text-align: left; padding: 10px 12px; font-weight: 600; }
      td { padding: 8px 12px; border-bottom: 1px solid #eee; }
      .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 16px 0; }
      .kpi-card { border: 1px solid #eee; border-radius: 8px; padding: 16px; text-align: center; }
      .kpi-value { font-size: 22px; font-weight: 700; margin: 4px 0; }
      .kpi-label { font-size: 12px; color: #666; }
      .kpi-change { font-size: 12px; }
      .positive { color: #10b981; } .negative { color: #ef4444; }
      .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 11px; color: #999; text-align: center; }
      @media print { body { padding: 20px; } }
    </style></head><body>
    <h1>${title}</h1>
    <p class="meta">KAUVEX Admin — Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
    ${html}
    <div class="footer">KAUVEX Commerce Cloud — Confidential</div>
    <script>window.print()</script></body></html>`);
  win.document.close();
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: "bg-green-50 text-green-700",
    pending: "bg-yellow-50 text-yellow-700",
    failed: "bg-red-50 text-red",
    active: "bg-green-50 text-green-700",
    inactive: "bg-gray-100 text-gray-500",
    low: "bg-red-50 text-red",
    critical: "bg-red-100 text-red",
    normal: "bg-green-50 text-green-700",
    on_time: "bg-green-50 text-green-700",
    delayed: "bg-yellow-50 text-yellow-700",
    damaged: "bg-red-50 text-red",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Tab Components ──────────────────────────────────────

function KPICards({ data }: { data: typeof salesKpis }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((kpi) => (
        <div key={kpi.label} className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-blue" />
            </div>
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${kpi.up ? "text-green-600" : "text-red"}`}>
              {kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {kpi.change}
            </span>
          </div>
          <p className="text-xl font-bold text-text-1">{kpi.value}</p>
          <p className="text-xs text-text-4 mt-0.5">{kpi.label}</p>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ title, subtitle, icon: Icon, onExport, onPrint }: {
  title: string; subtitle?: string; icon: React.ElementType;
  onExport?: () => void; onPrint?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-blue" />
        <h3 className="font-semibold text-text-1">{title}</h3>
        {subtitle && <span className="text-xs text-text-4">({subtitle})</span>}
      </div>
      <div className="flex gap-2">
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
            <Download size={13} /> CSV
          </Button>
        )}
        {onPrint && (
          <Button variant="outline" size="sm" onClick={onPrint} className="gap-1.5">
            <Printer size={13} /> Print
          </Button>
        )}
      </div>
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | number | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-off-white">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-3 font-medium text-text-4 text-xs uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-off-white transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-text-1">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("sales");
  const [dateRange, setDateRange] = useState("last-30");
  const [chartPeriod, setChartPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTopProducts = useMemo(() => {
    if (!searchQuery) return topProducts;
    return topProducts.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredLowStock = useMemo(() => {
    if (!searchQuery) return lowStockAlerts;
    return lowStockAlerts.filter((i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleExport = useCallback((type: string, headers: string[], rows: string[][]) => {
    exportCSV(`${type}-${new Date().toISOString().split("T")[0]}`, headers, rows);
  }, []);

  const revenueChartData = useMemo(() => {
    if (chartPeriod === "daily") return revenueDaily;
    if (chartPeriod === "weekly") return revenueWeekly;
    return revenueMonthly;
  }, [chartPeriod]);

  const revenueChartKey = "date";

  const handlePrint = useCallback((title: string) => {
    printReport(title);
  }, []);

  return (
    <AdminShell title="Reports" subtitle="Comprehensive reporting and analytics engine">
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {reportTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-blue text-white shadow-sm"
                      : "bg-white text-text-3 border border-border hover:bg-off-white"
                  }`}>
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-blue">
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last-7">Last 7 Days</option>
              <option value="last-30">Last 30 Days</option>
              <option value="last-90">Last 90 Days</option>
              <option value="this-year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            <input type="text" placeholder="Search..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border text-sm w-[180px] focus:outline-none focus:border-blue" />
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setLoading(!loading)}>
              <BarChart3 size={14} /> Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue" size={28} />
          </div>
        ) : (
          <div id="report-content">
            {/* ═══ SALES REPORTS ═══ */}
            {activeTab === "sales" && (
              <div className="space-y-6">
                <KPICards data={salesKpis} />

                {/* Revenue Chart */}
                <div className="bg-white rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-text-1">Revenue Trend</h3>
                    <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
                      {(["daily", "weekly", "monthly"] as const).map((p) => (
                        <button key={p} onClick={() => setChartPeriod(p)}
                          className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${
                            chartPeriod === p ? "bg-white text-text-1 font-medium shadow-sm" : "text-text-4 hover:text-text-2"
                          }`}>{p}</button>
                      ))}
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey={revenueChartKey} tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v / 1e6).toFixed(0)}M`} />
                        <Tooltip formatter={(value) => [<span key="revenue" className="font-semibold">{formatCurrency(Number(value ?? 0))}</span>, "Revenue"]} />
                        <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Top Products */}
                  <div className="bg-white rounded-xl border border-border">
                    <SectionHeader title="Top Products" icon={Package}
                      onExport={() => handleExport("top-products",
                        ["Rank", "Product", "SKU", "Sales", "Revenue"],
                        topProducts.map((p) => [String(p.rank), p.name, p.sku, String(p.sales), formatCurrency(p.revenue)]))}
                      onPrint={() => handlePrint("Top Products Report")} />
                    <DataTable headers={["#", "Product", "SKU", "Sales", "Revenue"]}
                      rows={filteredTopProducts.map((p) => [
                        <span key="r" className="w-6 h-6 rounded-full bg-blue-50 text-blue text-xs font-bold flex items-center justify-center">{p.rank}</span>,
                        <span key="n" className="font-medium">{p.name}</span>,
                        <span key="s" className="text-text-4 font-mono text-xs">{p.sku}</span>,
                        <span key="sa" className="font-semibold">{formatNumber(p.sales)}</span>,
                        <span key="re" className="font-semibold text-blue">{formatCurrency(p.revenue)}</span>,
                      ])} />
                  </div>

                  {/* Payment Methods */}
                  <div className="bg-white rounded-xl border border-border p-5">
                    <SectionHeader title="Payment Methods" icon={CreditCard}
                      onExport={() => handleExport("payment-methods",
                        ["Method", "Share (%)", "Amount"],
                        paymentMethods.map((p) => [p.name, `${p.value}%`, formatCurrency(p.amount)]))}
                      onPrint={() => handlePrint("Payment Methods Report")} />
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={paymentMethods} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                            {paymentMethods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(value) => <span className="font-semibold">{`${value}%`}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {paymentMethods.map((m, i) => (
                        <div key={m.name} className="flex items-center gap-3 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                          <span className="flex-1 text-text-2">{m.name}</span>
                          <span className="font-semibold">{formatCurrency(m.amount)}</span>
                          <span className="text-text-4 text-xs">{m.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ TAX REPORTS ═══ */}
            {activeTab === "tax" && (
              <div className="space-y-6">
                <KPICards data={taxKpis} />

                {/* VAT Trend Chart */}
                <div className="bg-white rounded-xl border border-border p-5">
                  <SectionHeader title="VAT Trend" subtitle="6 months" icon={BarChart3}
                    onExport={() => handleExport("vat-trend",
                      ["Period", "Collected", "Paid", "Net"],
                      vatReport.map((v) => [v.period, formatCurrency(v.collected), formatCurrency(v.paid), formatCurrency(v.net)]))}
                    onPrint={() => handlePrint("VAT Trend Report")} />
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={vatReport}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v / 1e6).toFixed(1)}M`} />
                        <Tooltip formatter={(value) => <span className="font-semibold">{formatCurrency(Number(value ?? 0))}</span>} />
                        <Bar dataKey="collected" fill="#2563EB" name="Collected" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="paid" fill="#EF4444" name="Paid" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="net" fill="#10B981" name="Net" radius={[4, 4, 0, 0]} />
                        <Legend />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Tax Rate Breakdown */}
                  <div className="bg-white rounded-xl border border-border">
                    <SectionHeader title="Tax Rate Breakdown" icon={Percent}
                      onExport={() => handleExport("tax-rate-breakdown",
                        ["Rate", "Collected", "Paid", "Net"],
                        taxRateBreakdown.map((t) => [t.rate, formatCurrency(t.collected), formatCurrency(t.paid), formatCurrency(t.net)]))}
                      onPrint={() => handlePrint("Tax Rate Breakdown")} />
                    <DataTable headers={["Rate", "Collected", "Paid", "Net"]}
                      rows={taxRateBreakdown.map((t) => [
                        <span key="r" className="font-medium">{t.rate}</span>,
                        <span key="c" className="text-green-600 font-semibold">{formatCurrency(t.collected)}</span>,
                        <span key="p" className="text-red font-semibold">{formatCurrency(t.paid)}</span>,
                        <span key="n" className={`font-semibold ${t.net >= 0 ? "text-green-600" : "text-red"}`}>{formatCurrency(t.net)}</span>,
                      ])} />
                  </div>

                  {/* Summary Cards */}
                  <div className="bg-white rounded-xl border border-border p-5">
                    <SectionHeader title="Tax Summary" icon={Receipt}
                      onPrint={() => handlePrint("Tax Summary")} />
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-5 text-center">
                        <p className="text-xs text-text-4 uppercase tracking-wider font-semibold">Total VAT Collected</p>
                        <p className="text-2xl font-bold text-blue mt-1">₦1,383,750</p>
                        <p className="text-xs text-text-4 mt-1">Period: Last 30 days</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <p className="text-[10px] text-text-4 uppercase font-semibold">Filing Period</p>
                          <p className="text-lg font-bold text-green-600 mt-1">Monthly</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 text-center">
                          <p className="text-[10px] text-text-4 uppercase font-semibold">Next Filing</p>
                          <p className="text-lg font-bold text-yellow-700 mt-1">Jul 15, 2026</p>
                        </div>
                      </div>
                      <div className="p-4 border border-border rounded-lg">
                        <p className="text-sm font-medium text-text-1">VAT Rate Applied</p>
                        <p className="text-xs text-text-4 mt-1">Standard rate of 7.5% on all taxable goods and services. Zero-rated items (exports) are tracked separately.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ VENDOR REPORTS ═══ */}
            {activeTab === "vendor" && (
              <div className="space-y-6">
                <KPICards data={vendorKpis} />

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Top Vendors */}
                  <div className="bg-white rounded-xl border border-border">
                    <SectionHeader title="Top Vendors by Sales" icon={Store}
                      onExport={() => handleExport("top-vendors",
                        ["Rank", "Vendor", "Sales", "Commission", "Orders", "Rating"],
                        topVendors.map((v) => [String(v.rank), v.name, formatCurrency(v.sales), formatCurrency(v.commission), String(v.orders), String(v.rating)]))}
                      onPrint={() => handlePrint("Top Vendors Report")} />
                    <DataTable headers={["#", "Vendor", "Sales", "Commission", "Orders", "Rating"]}
                      rows={topVendors.map((v) => [
                        <span key="r" className="w-6 h-6 rounded-full bg-orange-50 text-orange text-xs font-bold flex items-center justify-center">{v.rank}</span>,
                        <span key="n" className="font-medium">{v.name}</span>,
                        <span key="s" className="font-semibold">{formatCurrency(v.sales)}</span>,
                        <span key="c" className="text-green-600 font-semibold">{formatCurrency(v.commission)}</span>,
                        <span key="o" className="text-text-3">{formatNumber(v.orders)}</span>,
                        <span key="rt" className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>{v.rating}</span>
                        </span>,
                      ])} />
                  </div>

                  {/* Commission Tiers */}
                  <div className="bg-white rounded-xl border border-border p-5">
                    <SectionHeader title="Commission by Tier" icon={Percent}
                      onExport={() => handleExport("commission-tiers",
                        ["Tier", "Vendors", "Revenue", "Commission"],
                        vendorCommissionRates.map((c) => [c.tier, String(c.vendors), formatCurrency(c.revenue), formatCurrency(c.commission)]))}
                      onPrint={() => handlePrint("Commission Tiers")} />
                    <div className="space-y-4">
                      {vendorCommissionRates.map((tier) => (
                        <div key={tier.tier} className="p-4 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm text-text-1">{tier.tier}</span>
                            <span className="text-xs text-text-4">{tier.vendors} vendors</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-3">Revenue: {formatCurrency(tier.revenue)}</span>
                            <span className="font-semibold text-orange">Commission: {formatCurrency(tier.commission)}</span>
                          </div>
                          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange rounded-full" style={{ width: `${(tier.commission / vendorCommissionRates.reduce((s, t) => s + t.commission, 0)) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vendor Performance Chart */}
                <div className="bg-white rounded-xl border border-border p-5">
                  <SectionHeader title="Vendor Performance Overview" icon={BarChart3}
                    onPrint={() => handlePrint("Vendor Performance")} />
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topVendors.slice(0, 6)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v / 1e6).toFixed(0)}M`} />
                        <Tooltip formatter={(value) => <span className="font-semibold">{formatCurrency(Number(value ?? 0))}</span>} />
                        <Bar dataKey="sales" fill="#FF6B00" name="Sales" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="commission" fill="#2563EB" name="Commission" radius={[4, 4, 0, 0]} />
                        <Legend />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ INVENTORY REPORTS ═══ */}
            {activeTab === "inventory" && (
              <div className="space-y-6">
                <KPICards data={inventoryKpis} />

                {/* Low Stock Alerts */}
                <div className="bg-white rounded-xl border border-border">
                  <SectionHeader title="Low Stock Alerts" subtitle={`${filteredLowStock.length} items`} icon={AlertTriangle}
                    onExport={() => handleExport("low-stock",
                      ["Product", "SKU", "Stock", "Threshold", "Warehouse"],
                      lowStockAlerts.map((i) => [i.name, i.sku, String(i.stock), String(i.threshold), i.warehouse]))}
                    onPrint={() => handlePrint("Low Stock Alerts")} />
                  <DataTable headers={["Product", "SKU", "Stock", "Threshold", "Warehouse", "Status"]}
                    rows={filteredLowStock.map((item) => [
                      <span key="n" className="font-medium">{item.name}</span>,
                      <span key="s" className="text-text-4 font-mono text-xs">{item.sku}</span>,
                      <span key="st" className={`font-bold ${item.stock === 0 ? "text-red" : item.stock <= 3 ? "text-orange" : "text-yellow-600"}`}>{item.stock}</span>,
                      <span key="th" className="text-text-3">{item.threshold}</span>,
                      <span key="w" className="text-text-3">{item.warehouse}</span>,
                      <span key="st2"><StatusBadge status={item.stock === 0 ? "critical" : "low"} /></span>,
                    ])} />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Inventory Valuation */}
                  <div className="bg-white rounded-xl border border-border p-5">
                    <SectionHeader title="Inventory Valuation" icon={Package}
                      onExport={() => handleExport("inventory-valuation",
                        ["Category", "Value", "Items", "Share (%)"],
                        inventoryValuation.map((c) => [c.category, formatCurrency(c.value), formatNumber(c.items), `${c.pct}%`]))}
                      onPrint={() => handlePrint("Inventory Valuation")} />
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={inventoryValuation} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}>
                            {inventoryValuation.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(value) => <span className="font-semibold">{formatCurrency(Number(value ?? 0))}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {inventoryValuation.map((c, i) => (
                        <div key={c.category} className="flex items-center gap-3 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                          <span className="flex-1 text-text-2">{c.category}</span>
                          <span className="font-semibold">{formatCurrency(c.value)}</span>
                          <span className="text-text-4 text-xs">{c.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stock Movement */}
                  <div className="bg-white rounded-xl border border-border p-5">
                    <SectionHeader title="Stock Movement" subtitle="6 months" icon={BarChart3}
                      onExport={() => handleExport("stock-movement",
                        ["Month", "Inbound", "Outbound", "Returns"],
                        stockMovement.map((m) => [m.month, formatNumber(m.inbound), formatNumber(m.outbound), formatNumber(m.returns)]))}
                      onPrint={() => handlePrint("Stock Movement")} />
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stockMovement}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="inbound" stroke="#2563EB" strokeWidth={2} name="Inbound" />
                          <Line type="monotone" dataKey="outbound" stroke="#FF6B00" strokeWidth={2} name="Outbound" />
                          <Line type="monotone" dataKey="returns" stroke="#EF4444" strokeWidth={2} name="Returns" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ SHIPPING REPORTS ═══ */}
            {activeTab === "shipping" && (
              <div className="space-y-6">
                <KPICards data={shippingKpis} />

                {/* Shipments by Carrier */}
                <div className="bg-white rounded-xl border border-border">
                  <SectionHeader title="Shipments by Carrier" icon={Truck}
                    onExport={() => handleExport("shipments-by-carrier",
                      ["Carrier", "Shipments", "On-Time", "On-Time %", "Avg Days", "Cost"],
                      shipmentsByCarrier.map((c) => [c.carrier, String(c.shipments), String(c.onTime), `${((c.onTime / c.shipments) * 100).toFixed(1)}%`, String(c.avgDays), formatCurrency(c.cost)]))}
                    onPrint={() => handlePrint("Shipments by Carrier")} />
                  <DataTable headers={["Carrier", "Shipments", "On-Time", "On-Time %", "Avg (Days)", "Cost"]}
                    rows={shipmentsByCarrier.map((c) => [
                      <span key="n" className="font-medium">{c.carrier}</span>,
                      <span key="sh" className="font-semibold">{formatNumber(c.shipments)}</span>,
                      <span key="ot" className="text-green-600">{formatNumber(c.onTime)}</span>,
                      <span key="otp" className="font-semibold">{((c.onTime / c.shipments) * 100).toFixed(1)}%</span>,
                      <span key="d" className="text-text-3">{c.avgDays}</span>,
                      <span key="co" className="font-semibold text-blue">{formatCurrency(c.cost)}</span>,
                    ])} />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Delivery Performance */}
                  <div className="bg-white rounded-xl border border-border p-5">
                    <SectionHeader title="Delivery Performance" icon={Timer}
                      onExport={() => handleExport("delivery-performance",
                        ["Month", "On-Time (%)", "Delayed (%)", "Damaged (%)"],
                        deliveryPerformance.map((d) => [d.month, `${d.onTime}%`, `${d.delayed}%`, `${d.damaged}%`]))}
                      onPrint={() => handlePrint("Delivery Performance")} />
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deliveryPerformance}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                          <Tooltip formatter={(value) => <span className="font-semibold">{`${value}%`}</span>} />
                          <Legend />
                          <Bar dataKey="onTime" fill="#10B981" name="On-Time" radius={[4, 4, 0, 0]} stackId="a" />
                          <Bar dataKey="delayed" fill="#F59E0B" name="Delayed" radius={[4, 4, 0, 0]} stackId="a" />
                          <Bar dataKey="damaged" fill="#EF4444" name="Damaged" radius={[4, 4, 0, 0]} stackId="a" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Shipping Cost Analysis */}
                  <div className="bg-white rounded-xl border border-border p-5">
                    <SectionHeader title="Shipping Cost by Zone" icon={DollarSign}
                      onExport={() => handleExport("shipping-cost",
                        ["Zone", "Shipments", "Avg Cost", "Total Cost"],
                        shippingCostAnalysis.map((z) => [z.zone, String(z.shipments), formatCurrency(z.avgCost), formatCurrency(z.totalCost)]))}
                      onPrint={() => handlePrint("Shipping Cost Analysis")} />
                    <div className="space-y-3">
                      {shippingCostAnalysis.map((zone) => (
                        <div key={zone.zone} className="flex items-center gap-3 text-sm">
                          <MapPin size={14} className="text-text-4 shrink-0" />
                          <span className="flex-1 text-text-2">{zone.zone}</span>
                          <span className="text-text-4 text-xs">{formatNumber(zone.shipments)} shipments</span>
                          <span className="font-semibold w-20 text-right">{formatCurrency(zone.totalCost)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ WAREHOUSE REPORTS ═══ */}
            {activeTab === "warehouse" && (
              <div className="space-y-6">
                <KPICards data={warehouseKpis} />

                {/* Warehouse Capacity */}
                <div className="bg-white rounded-xl border border-border">
                  <SectionHeader title="Warehouse Capacity & Utilization" icon={Warehouse}
                    onExport={() => handleExport("warehouse-capacity",
                      ["Warehouse", "Location", "Capacity (sq ft)", "Used (sq ft)", "Utilization (%)"],
                      warehouseCapacity.map((w) => [w.name, w.location, formatNumber(w.capacity), formatNumber(w.used), `${w.utilization}%`]))}
                    onPrint={() => handlePrint("Warehouse Capacity")} />
                  <DataTable headers={["Warehouse", "Location", "Capacity", "Used", "Utilization", "Status"]}
                    rows={warehouseCapacity.map((w) => [
                      <span key="n" className="font-medium">{w.name}</span>,
                      <span key="l" className="text-text-3">{w.location}</span>,
                      <span key="c" className="font-semibold">{formatNumber(w.capacity)} sq ft</span>,
                      <span key="u" className="text-text-3">{formatNumber(w.used)} sq ft</span>,
                      <span key="ut" className="font-semibold">{w.utilization}%</span>,
                      <span key="st"><StatusBadge status={w.utilization >= 80 ? "active" : "normal"} /></span>,
                    ])} />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Inventory by Location (stacked bar) */}
                  <div className="bg-white rounded-xl border border-border p-5">
                    <SectionHeader title="Inventory by Location" icon={MapPin}
                      onPrint={() => handlePrint("Inventory by Location")} />
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={inventoryByLocation}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="lagos" fill="#2563EB" name="Lagos" stackId="a" />
                          <Bar dataKey="ph" fill="#10B981" name="Port Harcourt" stackId="a" />
                          <Bar dataKey="abuja" fill="#F59E0B" name="Abuja" stackId="a" />
                          <Bar dataKey="warri" fill="#EF4444" name="Warri" stackId="a" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Fulfillment Rate */}
                  <div className="bg-white rounded-xl border border-border p-5">
                    <SectionHeader title="Fulfillment Rate" icon={CheckCircle}
                      onExport={() => handleExport("fulfillment-rate",
                        ["Month", "Orders", "Fulfilled", "Rate (%)"],
                        fulfillmentRates.map((f) => [f.month, formatNumber(f.orders), formatNumber(f.fulfilled), `${f.rate}%`]))}
                      onPrint={() => handlePrint("Fulfillment Rate")} />
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={fulfillmentRates}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} domain={[90, 100]} tickFormatter={(v) => `${v}%`} />
                          <Tooltip formatter={(value) => <span className="font-semibold">{`${value}%`}</span>} />
                          <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={3} name="Fulfillment Rate" dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-green-600">96.8%</p>
                        <p className="text-[10px] text-text-4">Current Rate</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-lg font-bold text-blue">1,788</p>
                        <p className="text-[10px] text-text-4">Fulfilled</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-lg font-bold text-orange">59</p>
                        <p className="text-[10px] text-text-4">Unfulfilled</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
