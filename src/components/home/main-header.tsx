"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import SmartSearch from "@/components/search/SmartSearch";

export default function MainHeader() {
  const { getItemCount } = useCartStore();
  const { wishlistItems } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="bg-white border-b border-border">
        <div className="w-full max-w-[1440px] mx-auto px-4 h-[68px] flex items-center gap-4 lg:gap-6">
          {/* Mobile menu toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <span className="font-bold text-2xl text-navy tracking-tight">
              KAU<span className="relative">V<span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-orange rounded-full" /></span>EX
            </span>
          </Link>

          {/* Smart Search */}
          <SmartSearch />

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            <Link href="/account/wishlist" className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group relative">
              <Heart size={20} className="text-text-3 group-hover:text-orange transition-colors" />
              <span className="text-[10px] text-text-4 hidden lg:block">Wishlist</span>
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 right-0.5 w-4 h-4 bg-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link href="/cart" className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group relative">
              <ShoppingCart size={20} className="text-text-3 group-hover:text-orange transition-colors" />
              <span className="text-[10px] text-text-4 hidden lg:block">Cart</span>
              {getItemCount() > 0 && (
                <span className="absolute -top-0.5 right-0.5 w-4 h-4 bg-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>

            <Link href="/account" className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group">
              <User size={20} className="text-text-3 group-hover:text-orange transition-colors" />
              <span className="text-[10px] text-text-4 hidden lg:block">Account</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
