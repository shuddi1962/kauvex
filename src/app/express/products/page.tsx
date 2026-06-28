"use client";

import { useState } from "react";
import { Package, Plus, Edit3, Trash2, Search } from "lucide-react";

const DEMO_PRODUCTS = [
  { id: 1, name: "iPhone 15 Pro Max", sku: "IPH-15PM-256", weight: 0.22, hsCode: "8517.13.00", value: 850000 },
  { id: 2, name: "Ankara Fabric (3 yards)", sku: "ANK-FAB-3Y", weight: 0.45, hsCode: "5208.21.00", value: 12000 },
  { id: 3, name: "Shea Butter (500g)", sku: "SHB-500G", weight: 0.55, hsCode: "1515.90.00", value: 8500 },
  { id: 4, name: "Leather Handbag", sku: "LHB-001", weight: 0.8, hsCode: "4202.21.00", value: 45000 },
  { id: 5, name: "Wireless Earbuds", sku: "WED-001", weight: 0.05, hsCode: "8518.30.00", value: 25000 },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  const filtered = DEMO_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Product Catalogue</h1>
          <p className="text-gray-500 mt-1">
            Save product details to auto-fill shipment customs declarations
          </p>
        </div>
        <button className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name or SKU..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Weight
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                HS Code
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Value (₦)
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-[#0A1628]">{p.name}</td>
                <td className="px-5 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                <td className="px-5 py-3 text-gray-500">{p.weight} kg</td>
                <td className="px-5 py-3 text-gray-500 font-mono text-xs">{p.hsCode}</td>
                <td className="px-5 py-3 text-gray-500">₦{p.value.toLocaleString()}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
