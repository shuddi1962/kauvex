"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Phone, Heart, ShoppingCart, User, Menu, X, ChevronDown, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Deals", href: "/deals" },
  { label: "Brands", href: "/brands" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [isSticky, setIsSticky] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items } = useCartStore();
  const cartItems = items;

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 120);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const total = cartItems.reduce((s, i) => {
    const price = i.variant?.salePrice || i.variant?.price || i.product.salePrice || i.product.regularPrice;
    return s + price * i.quantity;
  }, 0);

  return (
    <div>
      <header className={`bg-white z-40 transition-shadow duration-300 ${isSticky ? "sticky top-0 shadow-navbar" : ""}`}>
        <div className="container-kauvex flex items-center gap-4 lg:gap-8 py-3.5">
          <button className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>

          <Link href="/" className="flex items-center gap-1 shrink-0">
            <span className="font-display font-extrabold text-2xl text-navy tracking-tight">
              KAU<span className="text-orange relative">V<span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-orange rounded-full" /></span>EX
            </span>
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="flex w-full rounded-xl overflow-hidden border border-border focus-within:border-orange/50 transition-colors shadow-sm">
              <button className="flex items-center gap-1 bg-gray-50 px-3.5 text-xs font-medium text-text-3 border-r border-border shrink-0">
                All Categories
                <ChevronDown size={12} />
              </button>
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                className="flex-1 px-4 text-sm outline-none placeholder:text-text-4/60"
              />
              <button className="bg-orange hover:bg-orange/90 text-white px-6 flex items-center justify-center transition-colors">
                <Search size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <a href="tel:+18001234567" className="hidden lg:flex items-center gap-2 text-sm">
              <span className="w-9 h-9 rounded-lg bg-orange/10 flex items-center justify-center text-orange">
                <Phone size={16} />
              </span>
              <span className="leading-tight">
                <span className="block text-text-4 text-[10px]">24/7 Support</span>
                <span className="font-semibold text-text-1 text-xs">(800) 123-4567</span>
              </span>
            </a>

            <Link href="/account/wishlist" aria-label="Wishlist" className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Heart size={20} className="text-text-3 hover:text-orange transition-colors" />
              <span className="absolute top-0.5 right-0.5 bg-orange text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
            </Link>

            <div className="relative">
              <button
                aria-label="Cart"
                onClick={() => setCartOpen(v => !v)}
                className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ShoppingCart size={20} className="text-text-3 hover:text-orange transition-colors" />
                {cartItems.length > 0 && <span className="absolute top-0.5 right-0.5 bg-orange text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
                </span>}
              </button>

              {cartOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-modal border border-border z-50 p-4 animate-in">
                  <p className="font-display font-bold text-sm mb-3">Your Cart</p>
                  {cartItems.length === 0 ? (
                    <div className="py-8 text-center">
                      <ShoppingBag size={32} className="mx-auto text-text-4 mb-2" />
                      <p className="text-xs text-text-4">Your cart is empty</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {cartItems.map((item) => {
                          const itemImage = item.variant?.image || item.product.images?.[0]?.url || "";
                          const itemPrice = item.variant?.salePrice || item.variant?.price || item.product.salePrice || item.product.regularPrice;
                          return (
                            <div key={`${item.product.id}-${item.variant?.id || ""}`} className="flex gap-3">
                              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0 relative">
                                {itemImage && <Image src={itemImage} alt={item.product.name} fill className="object-cover" unoptimized />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-text-1 leading-tight line-clamp-1">{item.product.name}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs text-text-4">Qty: {item.quantity}</span>
                                  <span className="text-orange font-bold text-xs font-display">${itemPrice.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between border-t border-border mt-4 pt-3">
                        <span className="text-sm font-medium text-text-1">Subtotal</span>
                        <span className="font-display font-bold text-lg text-orange">${total.toFixed(2)}</span>
                      </div>
                      <Link href="/checkout" className="block w-full mt-3 bg-orange hover:bg-orange/90 text-white text-sm font-bold rounded-xl py-3 text-center transition-all shadow-lg shadow-orange/20">
                        Checkout
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link href="/account" className="hidden sm:flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <User size={20} className="text-text-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)}>
          <div className="bg-white w-72 h-full p-5" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMobileOpen(false)} className="mb-4 p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link key={l.label} href={l.href} className="px-3 py-2.5 text-sm font-medium text-text-2 hover:bg-orange-50 hover:text-orange rounded-lg transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
)}
    </div>
  );
}