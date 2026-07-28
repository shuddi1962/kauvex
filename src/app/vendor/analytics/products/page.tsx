"use client";

import { useState, useMemo } from "react";
import { Package, ArrowUp, ArrowDown, AlertTriangle } from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";
import { DataTable, PeriodSelector } from "@/components/vendor/analytics";
import type { Column } from "@/components/vendor/analytics";

interface ProductRow {
  id: string;
  name: string;
  views: number;
  addToCarts: number;
  purchases: number;
  conversionRate: number;
  revenue: number;
  returnRate: number;
  stock: number;
  status: string;
}

const mockProducts: ProductRow[] = [
  { id: "P-001", name: "Wireless Bluetooth Earbuds Pro", views: 12500, addToCarts: 2340, purchases: 189, conversionRate: 1.51, revenue: 9450000, returnRate: 2.1, stock: 340, status: "active" },
  { id: "P-002", name: "Smart Home Security Camera", views: 9800, addToCarts: 1850, purchases: 152, conversionRate: 1.55, revenue: 6080000, returnRate: 3.8, stock: 120, status: "active" },
  { id: "P-003", name: "Ergonomic Office Chair", views: 7200, addToCarts: 1120, purchases: 98, conversionRate: 1.36, revenue: 5880000, returnRate: 5.2, stock: 45, status: "active" },
  { id: "P-004", name: "Noise Cancelling Headphones", views: 8900, addToCarts: 1560, purchases: 87, conversionRate: 0.98, revenue: 4350000, returnRate: 4.5, stock: 210, status: "active" },
  { id: "P-005", name: "Portable Power Bank 20000mAh", views: 6400, addToCarts: 980, purchases: 76, conversionRate: 1.19, revenue: 2280000, returnRate: 1.8, stock: 500, status: "active" },
  { id: "P-006", name: "Wireless Charging Pad", views: 5100, addToCarts: 720, purchases: 54, conversionRate: 1.06, revenue: 1080000, returnRate: 3.2, stock: 8, status: "active" },
  { id: "P-007", name: "Bluetooth Speaker Waterproof", views: 4800, addToCarts: 690, purchases: 48, conversionRate: 1.00, revenue: 1440000, returnRate: 6.8, stock: 0, status: "inactive" },
  { id: "P-008", name: "USB-C Hub 7-in-1", views: 3900, addToCarts: 540, purchases: 42, conversionRate: 1.08, revenue: 840000, returnRate: 2.5, stock: 180, status: "active" },
  { id: "P-009", name: "Mechanical Keyboard RGB", views: 5600, addToCarts: 810, purchases: 63, conversionRate: 1.13, revenue: 1890000, returnRate: 4.0, stock: 65, status: "active" },
  { id: "P-010", name: "Wireless Mouse Ergonomic", views: 4300, addToCarts: 620, purchases: 51, conversionRate: 1.19, revenue: 765000, returnRate: 3.5, stock: 290, status: "active" },
  { id: "P-011", name: "4K Webcam with Microphone", views: 3500, addToCarts: 480, purchases: 38, conversionRate: 1.09, revenue: 1140000, returnRate: 7.2, stock: 15, status: "active" },
  { id: "P-012", name: "Laptop Stand Adjustable", views: 2900, addToCarts: 410, purchases: 32, conversionRate: 1.10, revenue: 640000, returnRate: 2.8, stock: 95, status: "active" },
];

export default function AnalyticsProducts() {
  const [period, setPeriod] = useState("30d");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    let items = [...mockProducts];
    if (sortKey) {
      items.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey];
        const bVal = (b as Record<string, unknown>)[sortKey];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }
    return items;
  }, [sortKey, sortDir]);

  const formatNgn = (v: number) => {
    if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `₦${(v / 1_000).toFixed(1)}K`;
    return `₦${v}`;
  };

  const columns: Column<ProductRow>[] = [
    { key: "name", label: "Product", width: "25%", render: (p) => (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center shrink-0">
          <Package size={12} className="text-text-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-text-1 truncate">{p.name}</p>
          <p className="text-[9px] text-text-4">{p.id}</p>
        </div>
        {p.stock <= 10 && (
          <span className="text-[8px] bg-red-100 text-red-600 px-1 py-0.5 rounded-full font-medium flex items-center gap-0.5 shrink-0">
            <AlertTriangle size={8} /> Low Stock
          </span>
        )}
      </div>
    )},
    { key: "views", label: "Views", render: (p) => p.views.toLocaleString() },
    { key: "addToCarts", label: "Add to Cart", render: (p) => p.addToCarts.toLocaleString() },
    { key: "purchases", label: "Purchases", render: (p) => p.purchases.toLocaleString() },
    { key: "conversionRate", label: "CVR", render: (p) => (
      <span className="font-medium">{p.conversionRate}%</span>
    )},
    { key: "revenue", label: "Revenue", align: "right", render: (p) => (
      <span className="font-semibold text-text-1">{formatNgn(p.revenue)}</span>
    )},
    { key: "returnRate", label: "Return Rate", render: (p) => (
      <div className="flex items-center gap-1">
        <span className={p.returnRate >= 5 ? "text-red-600 font-semibold" : ""}>{p.returnRate}%</span>
        {p.returnRate >= 5 && (
          <span className="text-[8px] bg-red-100 text-red-600 px-1 py-0.5 rounded-full font-medium">High</span>
        )}
      </div>
    )},
  ];

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <VendorShell title="Product Analytics" subtitle="Product-level performance data">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-4">{mockProducts.length} products with sales data</p>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Total Views", value: mockProducts.reduce((s, p) => s + p.views, 0).toLocaleString() },
            { label: "Total Purchases", value: mockProducts.reduce((s, p) => s + p.purchases, 0).toLocaleString() },
            { label: "Avg CVR", value: `${(mockProducts.reduce((s, p) => s + p.conversionRate, 0) / mockProducts.length).toFixed(2)}%` },
            { label: "Low Stock Items", value: String(mockProducts.filter((p) => p.stock <= 10).length), color: "text-red-600" },
            { label: "High Return Rate", value: String(mockProducts.filter((p) => p.returnRate >= 5).length), color: "text-red-600" },
          ].map((chip) => (
            <div key={chip.label} className="bg-white border border-border rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="text-[10px] text-text-4">{chip.label}</span>
              <span className={`text-xs font-bold ${chip.color || "text-text-1"}`}>{chip.value}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`text-${col.align || "left"} px-3 py-2.5 font-semibold text-text-4 cursor-pointer hover:text-text-2 select-none`}
                      style={col.width ? { width: col.width } : undefined}
                      onClick={() => handleSort(col.key)}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {sortKey === col.key && (
                          sortDir === "asc" ? <ArrowUp size={10} /> : <ArrowDown size={10} />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className={`text-${col.align || "left"} px-3 py-2.5 text-text-2`}>
                        {col.render ? col.render(p) : String((p as Record<string, unknown>)[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </VendorShell>
  );
}
