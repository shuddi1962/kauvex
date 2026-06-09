"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingCart, User, ChevronDown, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { KAUVEX_CATEGORIES } from "@/lib/categories";

export default function MainHeader() {
  const { getItemCount } = useCartStore();
  const { wishlistItems } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [catOpen, setCatOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white border-b border-border">
      <div className="w-full max-w-[1440px] mx-auto px-4 h-[68px] flex items-center gap-4 lg:gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className="font-bold text-2xl text-[#0A1628] tracking-tight">
            KAU<span className="relative">V<span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#FF6B00] rounded-full" /></span>EX
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <div className="flex items-center rounded-lg border-2 border-[#FF6B00]/20 focus-within:border-[#FF6B00] transition-all overflow-hidden">
            <div className="relative">
              <button onClick={() => setCatOpen(!catOpen)}
                className="flex items-center gap-1 h-11 px-4 bg-gray-50 text-xs font-medium text-text-2 hover:bg-gray-100 transition-colors border-r border-gray-200">
                {selectedCategory} <ChevronDown size={12} />
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-strong border border-border z-50 max-h-[300px] overflow-y-auto min-w-[180px] py-1">
                  <button onClick={() => { setSelectedCategory("All Categories"); setCatOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-xs text-text-2 hover:bg-orange-50">All Categories</button>
                  {KAUVEX_CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => { setSelectedCategory(cat.name); setCatOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-xs text-text-2 hover:bg-orange-50">{cat.icon} {cat.name}</button>
                  ))}
                </div>
              )}
            </div>
            <input type="text" placeholder="Search millions of products..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-11 px-4 bg-transparent text-sm text-text-1 placeholder:text-text-4 focus:outline-none" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="p-1.5 mr-1 hover:bg-gray-100 rounded transition-colors">
                <X size={16} className="text-text-4" />
              </button>
            )}
            <button className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 h-11 px-6 transition-colors flex items-center gap-2 shrink-0">
              <Search size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2">
          <Link href="/account/wishlist" className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group relative">
            <Heart size={20} className="text-text-3 group-hover:text-[#FF6B00] transition-colors" />
            <span className="text-[10px] text-text-4 hidden lg:block">Wishlist</span>
            {wishlistItems.length > 0 && (
              <span className="absolute -top-0.5 right-0.5 w-4 h-4 bg-[#FF6B00] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          <Link href="/cart" className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group relative">
            <ShoppingCart size={20} className="text-text-3 group-hover:text-[#FF6B00] transition-colors" />
            <span className="text-[10px] text-text-4 hidden lg:block">Cart</span>
            {getItemCount() > 0 && (
              <span className="absolute -top-0.5 right-0.5 w-4 h-4 bg-[#FF6B00] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {getItemCount()}
              </span>
            )}
          </Link>

          <Link href="/account" className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group">
            <User size={20} className="text-text-3 group-hover:text-[#FF6B00] transition-colors" />
            <span className="text-[10px] text-text-4 hidden lg:block">Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
