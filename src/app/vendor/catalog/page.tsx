"use client";

import { useState } from "react";
import Link from "next/link";
import VendorShell from "@/components/vendor/vendor-shell";
import { Search, Plus, Package, DollarSign, Star, ShoppingCart, Tag, Filter, Grid3X3, List, ChevronDown, Check, X } from "lucide-react";

const catalogProducts = [
  { id: "SP001", title: "Samsung Galaxy S30", brand: "Samsung", category: "Electronics", price: "$899", sellers: 4, rating: 4.7, image: "📱" },
  { id: "SP002", title: "Apple MacBook Pro 16", brand: "Apple", category: "Electronics", price: "$2,499", sellers: 3, rating: 4.9, image: "💻" },
  { id: "SP003", title: "Sony WH-1000XM5", brand: "Sony", category: "Electronics", price: "$349", sellers: 5, rating: 4.8, image: "🎧" },
  { id: "SP004", title: "Nike Air Max 270", brand: "Nike", category: "Fashion", price: "$150", sellers: 6, rating: 4.5, image: "👟" },
  { id: "SP005", title: "Rolex Submariner", brand: "Rolex", category: "Luxury", price: "$9,500", sellers: 2, rating: 4.9, image: "⌚" },
  { id: "SP006", title: "Dyson V15 Detect", brand: "Dyson", category: "Home", price: "$749", sellers: 3, rating: 4.6, image: "🧹" },
  { id: "SP007", title: "Toyota OEM Brake Pads", brand: "Toyota", category: "Automotive", price: "$89", sellers: 4, rating: 4.4, image: "🚗" },
  { id: "SP008", title: "Marine GPS Chartplotter", brand: "Garmin", category: "Marine", price: "$1,299", sellers: 2, rating: 4.8, image: "🚤" },
  { id: "SP009", title: "iPhone 15 Pro Max", brand: "Apple", category: "Electronics", price: "$1,199", sellers: 7, rating: 4.7, image: "📱" },
  { id: "SP010", title: "Canon EOS R5", brand: "Canon", category: "Electronics", price: "$3,899", sellers: 3, rating: 4.9, image: "📷" },
];

interface SellModalProps {
  product: typeof catalogProducts[0] | null;
  onClose: () => void;
}

function SellModal({ product, onClose }: SellModalProps) {
  if (!product) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-text-1">Sell This Product</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
          <span className="text-2xl">{product.image}</span>
          <div>
            <p className="text-sm font-bold text-text-1">{product.title}</p>
            <p className="text-xs text-text-4">{product.brand} · {product.category}</p>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-text-2 block mb-1">Your Price (USD)</label>
            <input type="number" placeholder="0.00" className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Quantity</label>
              <input type="number" placeholder="1" className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Condition</label>
              <select className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 bg-white">
                <option>New</option>
                <option>Like New</option>
                <option>Used - Good</option>
                <option>Refurbished</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Shipping Method</label>
              <select className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 bg-white">
                <option>Merchant Fulfilled</option>
                <option>FBK (Kauvex Fulfilled)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Delivery (days)</label>
              <input type="number" placeholder="5" className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-text-2 block mb-1">Warranty</label>
            <select className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 bg-white">
              <option>No Warranty</option>
              <option>3 Months</option>
              <option>6 Months</option>
              <option>1 Year</option>
              <option>2 Years</option>
            </select>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber/20 rounded-xl p-3 flex items-start gap-2 mb-4">
          <Tag size={14} className="text-amber shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">Platform commission: 12%. Your estimated earnings: <strong>$791.12</strong> at $899 selling price.</p>
        </div>
        <button className="w-full h-11 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 transition-colors flex items-center justify-center gap-2">
          <ShoppingCart size={15} /> List This Product
        </button>
      </div>
    </div>
  );
}

export default function VendorCatalog() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sellProduct, setSellProduct] = useState<typeof catalogProducts[0] | null>(null);

  const filtered = catalogProducts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <VendorShell title="Shared Catalog" subtitle="Browse products and start selling existing catalog items">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search catalog by name, brand, or category..."
              className="w-full h-10 pl-9 pr-3 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange/20" />
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded ${view === "grid" ? "bg-white shadow-sm" : "hover:bg-white/50"}`}>
              <Grid3X3 size={15} className="text-text-3" />
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded ${view === "list" ? "bg-white shadow-sm" : "hover:bg-white/50"}`}>
              <List size={15} className="text-text-3" />
            </button>
          </div>
        </div>

        <div className={`${view === "grid" ? "grid grid-cols-2 lg:grid-cols-5 gap-3" : "space-y-2"}`}>
          {filtered.map(product => (
            <div key={product.id} className={`bg-white rounded-xl border border-border hover:shadow-md transition-all ${
              view === "list" ? "flex items-center gap-4 p-3" : "p-4"
            }`}>
              <div className={`${view === "list" ? "flex items-center gap-4 flex-1" : "space-y-3"}`}>
                <div className={`${view === "list" ? "" : "flex justify-center"}`}>
                  <span className="text-3xl">{product.image}</span>
                </div>
                <div className={view === "list" ? "flex-1" : ""}>
                  <p className="text-xs font-bold text-text-1 leading-tight">{product.title}</p>
                  <p className="text-[10px] text-text-4">{product.brand} · {product.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-orange">{product.price}</span>
                    <span className="text-[10px] text-text-4 flex items-center gap-0.5">★ {product.rating}</span>
                    <span className="text-[10px] text-text-4">{product.sellers} sellers</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSellProduct(product)} className={`mt-3 w-full h-8 bg-orange text-white text-[10px] font-bold rounded-lg hover:bg-orange/90 transition-colors flex items-center justify-center gap-1 ${
                view === "list" ? "mt-0 w-auto px-4 shrink-0" : ""
              }`}>
                <Plus size={11} /> Sell This
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl border border-border p-4 flex items-center gap-3">
          <Package size={16} className="text-text-4" />
          <p className="text-xs text-text-4 flex-1">Can&apos;t find your product? You can create a new catalog product instead.</p>
          <Link href="/vendor/products/create" className="flex items-center gap-1 text-xs font-semibold text-orange hover:underline">
            <Plus size={12} /> Create New Product
          </Link>
        </div>
      </div>

      {sellProduct && <SellModal product={sellProduct} onClose={() => setSellProduct(null)} />}
    </VendorShell>
  );
}
