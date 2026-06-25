"use client";

import { useState } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortKey = "product" | "category" | "clicks" | "orders" | "revenue" | "commission" | "convRate";
type SortDir = "asc" | "desc";

const productData = [
  { product: "Wireless Noise-Cancelling Headphones", category: "Electronics", clicks: 8942, orders: 482, revenue: "$166,290", commission: "$16,629", convRate: "5.4%" },
  { product: "Ergonomic Office Chair Pro", category: "Home", clicks: 6230, orders: 298, revenue: "$200,256", commission: "$20,026", convRate: "4.8%" },
  { product: "Organic Skincare Bundle", category: "Beauty", clicks: 5410, orders: 356, revenue: "$31,844", commission: "$4,776", convRate: "6.6%" },
  { product: "Smart Home Security Camera Kit", category: "Electronics", clicks: 4890, orders: 215, revenue: "$49,020", commission: "$4,902", convRate: "4.4%" },
  { product: "Premium Yoga Mat Set", category: "Sports", clicks: 4120, orders: 187, revenue: "$23,188", commission: "$3,478", convRate: "4.5%" },
  { product: "Designer Canvas Wall Art", category: "Home", clicks: 3780, orders: 165, revenue: "$25,740", commission: "$3,861", convRate: "4.4%" },
  { product: "Mechanical Gaming Keyboard RGB", category: "Electronics", clicks: 3240, orders: 234, revenue: "$44,226", commission: "$6,634", convRate: "7.2%" },
  { product: "Stainless Steel Water Bottle", category: "Sports", clicks: 2910, orders: 142, revenue: "$4,969", commission: "$745", convRate: "4.9%" },
];

export default function PerformanceByProduct() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("clicks");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown size={10} className="text-gray-400" />;
    return sortDir === "asc" ? <ArrowUp size={10} className="text-[#FF6B00]" /> : <ArrowDown size={10} className="text-[#FF6B00]" />;
  };

  const filtered = productData
    .filter((p) =>
      p.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        const cmp = aVal.localeCompare(bVal);
        return sortDir === "asc" ? cmp : -cmp;
      }
      const numA = typeof aVal === "number" ? aVal : parseFloat(String(aVal).replace(/[$,]/g, ""));
      const numB = typeof bVal === "number" ? bVal : parseFloat(String(bVal).replace(/[$,]/g, ""));
      return sortDir === "asc" ? numA - numB : numB - numA;
    });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#0A1628]">Performance by Product</h1>
        <p className="text-xs text-gray-500">Compare product-level affiliate performance metrics</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-8 pl-8 pr-3 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B00] focus:border-[#FF6B00]"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <Th sortable sortKey="product" current={sortKey} dir={sortDir} onClick={handleSort} icon={sortIcon}>Product</Th>
                <Th sortable sortKey="category" current={sortKey} dir={sortDir} onClick={handleSort} icon={sortIcon}>Category</Th>
                <Th sortable sortKey="clicks" current={sortKey} dir={sortDir} onClick={handleSort} icon={sortIcon} align="right">Clicks</Th>
                <Th sortable sortKey="orders" current={sortKey} dir={sortDir} onClick={handleSort} icon={sortIcon} align="right">Orders</Th>
                <Th sortable sortKey="revenue" current={sortKey} dir={sortDir} onClick={handleSort} icon={sortIcon} align="right">Revenue</Th>
                <Th sortable sortKey="commission" current={sortKey} dir={sortDir} onClick={handleSort} icon={sortIcon} align="right">Commission</Th>
                <Th sortable sortKey="convRate" current={sortKey} dir={sortDir} onClick={handleSort} icon={sortIcon} align="right">Conv. Rate</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="text-[11px] font-semibold text-[#0A1628] px-4 py-2.5">{p.product}</td>
                  <td className="text-[10px] text-gray-500 px-4 py-2.5">{p.category}</td>
                  <td className="text-[11px] font-semibold text-gray-800 px-4 py-2.5 text-right">{p.clicks.toLocaleString()}</td>
                  <td className="text-[11px] text-gray-700 px-4 py-2.5 text-right">{p.orders.toLocaleString()}</td>
                  <td className="text-[11px] font-semibold text-gray-800 px-4 py-2.5 text-right">{p.revenue}</td>
                  <td className="text-[11px] font-bold text-green-700 px-4 py-2.5 text-right">{p.commission}</td>
                  <td className="text-[11px] text-gray-700 px-4 py-2.5 text-right">{p.convRate}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-[11px] text-gray-400 py-8">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-gray-400">Showing {filtered.length} of {productData.length} products</p>
    </div>
  );
}

function Th({
  children, sortable, sortKey, current, dir, onClick, icon, align,
}: {
  children: React.ReactNode;
  sortable: boolean;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onClick: (key: SortKey) => void;
  icon: (key: SortKey) => React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`text-[10px] font-semibold text-gray-500 px-4 py-2.5 ${align === "right" ? "text-right" : "text-left"}`}
    >
      <button
        onClick={() => onClick(sortKey)}
        className="inline-flex items-center gap-1 hover:text-[#0A1628] transition-colors"
      >
        {children}
        {sortable && icon(sortKey)}
      </button>
    </th>
  );
}
