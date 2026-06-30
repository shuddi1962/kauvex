"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Package, ArrowLeft, Search, Filter, ChevronDown, ShoppingCart,
  Star, Grid, List, Eye,
} from "lucide-react";

interface CatalogProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  retailPrice: string;
  wholesalePrice: string;
  moq: number;
  stock: string;
  rating: number;
}

const seedProducts: CatalogProduct[] = [
  { id: "p1", name: "Hikvision 4CH DVR", sku: "CCTV-DVR-004", category: "CCTV", retailPrice: "$249", wholesalePrice: "$185", moq: 10, stock: "In Stock", rating: 4.8 },
  { id: "p2", name: "Solar Panel 300W Mono", sku: "SOL-PNL-300", category: "Solar", retailPrice: "$165", wholesalePrice: "$120", moq: 20, stock: "In Stock", rating: 4.6 },
  { id: "p3", name: "Network Switch 24-Port", sku: "NET-SW-024", category: "Networking", retailPrice: "$129", wholesalePrice: "$95", moq: 15, stock: "In Stock", rating: 4.5 },
  { id: "p4", name: "Fire Alarm Panel 8-Zone", sku: "FIRE-PNL-008", category: "Fire Safety", retailPrice: "$420", wholesalePrice: "$320", moq: 5, stock: "Low Stock", rating: 4.9 },
  { id: "p5", name: "Access Control Terminal", sku: "ACC-TRS-001", category: "Access Control", retailPrice: "$325", wholesalePrice: "$245", moq: 8, stock: "In Stock", rating: 4.7 },
  { id: "p6", name: "CCTV Camera 4MP Bullet", sku: "CCTV-CAM-4MP", category: "CCTV", retailPrice: "$89", wholesalePrice: "$62", moq: 20, stock: "In Stock", rating: 4.4 },
  { id: "p7", name: "UPS 3KVA Online", sku: "UPS-3KVA-01", category: "Power", retailPrice: "$580", wholesalePrice: "$440", moq: 3, stock: "In Stock", rating: 4.8 },
  { id: "p8", name: "Safety Helmet (Box of 12)", sku: "SAFE-HLM-12", category: "PPE", retailPrice: "$96", wholesalePrice: "$68", moq: 10, stock: "In Stock", rating: 4.3 },
];

export default function WholesaleCatalogPage() {
  const [products] = useState<CatalogProduct[]>(seedProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = [...new Set(products.map((p) => p.category))];
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/wholesale/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={16} className="text-gray-500" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Wholesale Catalog</h2>
            <p className="text-xs text-gray-500">Browse wholesale pricing (login required for orders)</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20" />
          </div>
          <div className="relative">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white">
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-[#0A1628] text-white" : "bg-white text-gray-500"}`}><Grid size={14} /></button>
            <button onClick={() => setViewMode("list")} className={`p-2 ${viewMode === "list" ? "bg-[#0A1628] text-white" : "bg-white text-gray-500"}`}><List size={14} /></button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <Package size={32} className="text-gray-300" />
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-gray-400 font-medium">{product.sku}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{product.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] text-gray-500">{product.rating}</span>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 line-through">{product.retailPrice}</p>
                      <p className="text-lg font-bold text-[#FF6B00]">{product.wholesalePrice}</p>
                    </div>
                    <span className="text-[10px] text-gray-500">MOQ: {product.moq}</span>
                  </div>
                  <span className={`mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${product.stock === "In Stock" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {product.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Product</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">SKU</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Category</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Retail</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Wholesale</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">MOQ</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{product.sku}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 line-through">{product.retailPrice}</td>
                    <td className="px-4 py-3 text-xs font-bold text-[#FF6B00]">{product.wholesalePrice}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{product.moq}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${product.stock === "In Stock" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{product.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="px-3 py-1 bg-[#FF6B00] text-white rounded-lg text-[10px] font-semibold hover:bg-[#e55f00] flex items-center gap-1 ml-auto">
                        <ShoppingCart size={10} /> Add to Quote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
