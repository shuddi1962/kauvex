"use client";
import { useState } from "react";
import Link from "next/link";
import VendorShell from "@/components/vendor/vendor-shell";
import { Search, Plus, Upload, Package, X, Check, ChevronRight, AlertCircle, FileSpreadsheet, List } from "lucide-react";

const demoResults = [
  { id: 1, name: "Marine GPS Navigator 7-inch", brand: "Garmin", price: "₦45,000 - ₦55,000", sellers: 12, image: null, category: "Electronics > Marine GPS", gated: false },
  { id: 2, name: "Yacht Anchor Chain 12mm", brand: "Rocna", price: "₦28,000 - ₦35,000", sellers: 8, image: null, category: "Marine > Anchoring", gated: true },
  { id: 3, name: "LED Navigation Light Set", brand: "Attwood", price: "₦12,000 - ₦18,000", sellers: 15, image: null, category: "Marine > Lighting", gated: false },
  { id: 4, name: "Marine VHF Radio DSC", brand: "Standard Horizon", price: "₦32,000 - ₦42,000", sellers: 6, image: null, category: "Electronics > Marine Radio", gated: true },
  { id: 5, name: "Boat Cover Heavy Duty", brand: "Carver", price: "₦25,000 - ₦38,000", sellers: 4, image: null, category: "Marine > Covers", gated: false },
];

export default function AddProductPage() {
  const [search, setSearch] = useState("");
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = search.trim() ? demoResults.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <VendorShell title="Add Product" subtitle="List a new product for sale on Kauvex">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-orange text-white rounded-full font-bold">1</span>
          <span className="font-semibold text-text-1">Find or create</span>
          <ChevronRight size={14} className="text-text-4" />
          <span className="px-3 py-1.5 bg-gray-100 text-text-4 rounded-full font-bold">2</span>
          <span className="text-text-4">Set price & details</span>
          <ChevronRight size={14} className="text-text-4" />
          <span className="px-3 py-1.5 bg-gray-100 text-text-4 rounded-full font-bold">3</span>
          <span className="text-text-4">Publish</span>
        </div>

        {/* Search card */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-bold text-lg text-text-1 mb-1">Find your product in Kauvex&apos;s catalog</h2>
          <p className="text-sm text-text-4 mb-4">Search the shared catalog to see if your product already exists. If it does, you can start selling immediately.</p>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-4" />
            <input value={search} onChange={e => { setSearch(e.target.value); setSearched(false); setSelected(null); }}
              placeholder="Search by product name, brand, or category..."
              className="w-full h-12 pl-10 pr-4 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange/20" />
          </div>
          <button onClick={() => setSearched(true)} className="mt-3 w-full h-10 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 transition-colors">
            Search Catalog
          </button>
        </div>

        {/* Search results */}
        {searched && search.trim() && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold text-text-1">{filtered.length} products found</p>
              <span className="text-[10px] text-text-4">Category/Brand gating may apply</span>
            </div>
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <Package size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-text-4">No catalog matches. You can add a new product instead.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map(p => (
                  <div key={p.id} className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${selected === p.id ? "bg-orange-50 border-l-2 border-orange" : ""}`}
                    onClick={() => setSelected(selected === p.id ? null : p.id)}>
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <Package size={20} className="text-text-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-text-1 truncate">{p.name}</p>
                        {p.gated && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium shrink-0">Gated</span>}
                      </div>
                      <p className="text-xs text-text-4">{p.brand} · {p.category}</p>
                      <p className="text-xs text-text-4 mt-0.5">{p.price} · {p.sellers} sellers</p>
                    </div>
                    {selected === p.id ? (
                      <div className="w-7 h-7 rounded-full bg-orange flex items-center justify-center shrink-0">
                        <Check size={14} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full border-2 border-border shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
            {filtered.length > 0 && (
              <div className="p-4 border-t border-border">
                <Link href={selected ? "/vendor/catalog" : "#"}
                  className={`w-full h-11 flex items-center justify-center gap-2 text-sm font-bold rounded-xl transition-colors ${
                    selected ? "bg-orange text-white hover:bg-orange/90" : "bg-gray-100 text-text-4 cursor-not-allowed"
                  }`}>
                  <Plus size={15} /> Sell This Product
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Three paths */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/vendor/catalog" className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Search size={18} />
            </div>
            <h3 className="font-bold text-sm text-text-1 mb-1">Search & Match</h3>
            <p className="text-xs text-text-4">Find your product in the shared catalog and start selling with one click.</p>
          </Link>
          <Link href="/vendor/products" className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus size={18} />
            </div>
            <h3 className="font-bold text-sm text-text-1 mb-1">Add New Product</h3>
            <p className="text-xs text-text-4">Create a brand new listing from scratch with all details.</p>
          </Link>
          <Link href="/vendor/products/bulk-upload" className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload size={18} />
            </div>
            <h3 className="font-bold text-sm text-text-1 mb-1">Bulk Upload</h3>
            <p className="text-xs text-text-4">Upload multiple products at once using a CSV file.</p>
          </Link>
        </div>

        {/* Category/Brand Gating Info */}
        <div className="bg-amber-50 border border-amber/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-800 mb-0.5">Category & Brand Gating</p>
            <p className="text-[10px] text-amber-700">Some categories and brands require approval before you can list products. If your category or brand is gated, you&apos;ll need to submit an approval request with documentation. <Link href="/vendor/products/approval-request" className="font-bold hover:underline">Submit Approval Request</Link></p>
          </div>
        </div>

        {/* Quick switch */}
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4">
          <FileSpreadsheet size={20} className="text-text-4" />
          <div className="flex-1">
            <p className="text-xs font-bold text-text-1">Have a list of products?</p>
            <p className="text-[10px] text-text-4">Use the bulk upload tool to add many products at once.</p>
          </div>
          <Link href="/vendor/products/bulk-upload" className="shrink-0 px-4 py-2 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90">
            Bulk Upload
          </Link>
        </div>
      </div>
    </VendorShell>
  );
}
