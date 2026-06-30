"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronRight, LayoutGrid, X } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { KAUVEX_CATEGORIES } from "@/lib/categories";

const quickLinks = [
  { label: "Flash Sale", href: "/deals" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Top Sellers", href: "/shop?sort=bestselling" },
  { label: "Brands", href: "/brands" },
  { label: "B2B/Wholesale", href: "/wholesale" },
  { label: "Manufacturers", href: "/manufacturers/search" },
  { label: "Gift Cards", href: "/shop" },
  { label: "Today's Deals", href: "/deals" },
  { label: "Clearance", href: "/deals" },
];

export default function CategoryNav() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  const hoveredCat = KAUVEX_CATEGORIES.find(c => c.id === activeDept);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-[#0A1628] hidden lg:block">
        <div className="w-full max-w-[1440px] mx-auto px-4 flex items-center h-12">
          {/* All Departments - Mega Menu */}
          <div className="relative"
            onMouseLeave={() => { setMegaOpen(false); setActiveDept(null); }}
          >
            <button
              onMouseEnter={() => setMegaOpen(true)}
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white h-12 px-6 flex items-center gap-2 font-bold text-sm transition-colors"
            >
              <LayoutGrid size={16} />
              All Categories
              <ChevronDown size={14} className={`transition-transform ${megaOpen ? "rotate-180" : ""}`} />
            </button>

            {megaOpen && (
              <div className="absolute top-full left-0 bg-white rounded-b-xl shadow-strong z-50 flex" style={{ width: "860px" }}>
                {/* Category List */}
                <div className="w-[270px] border-r border-border py-2">
                  {KAUVEX_CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setActiveDept(cat.id)}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                        activeDept === cat.id ? "bg-orange-50 text-[#FF6B00]" : "text-text-2 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-sm font-medium flex-1">{cat.name}</span>
                      <ChevronRight size={14} className="text-text-4" />
                    </div>
                  ))}
                </div>

                {/* Subcategories + Banner */}
                <div className="flex-1 p-5">
                  {hoveredCat ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-base text-text-1">{hoveredCat.name}</h3>
                        <Link
                          href={`/category/${hoveredCat.slug}`}
                          className="text-xs text-[#FF6B00] font-semibold hover:underline flex items-center gap-1"
                        >
                          View All <ChevronRight size={12} />
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-4">
                        {hoveredCat.subcategories.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/category/${hoveredCat.slug}/${sub.slug}`}
                            className="text-sm text-text-3 hover:text-[#FF6B00] transition-colors py-1"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                      <div className="relative rounded-lg overflow-hidden h-[140px] mt-2">
                        <Image
                          src={hoveredCat.image}
                          alt={hoveredCat.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/70 to-transparent flex items-center">
                          <div className="pl-5">
                            <p className="text-white font-bold text-sm">Shop {hoveredCat.name}</p>
                            <Link
                              href={`/category/${hoveredCat.slug}`}
                              className="text-xs text-[#FF6B00] hover:text-orange-300 mt-1 inline-flex items-center gap-1 transition-colors"
                            >
                              Explore Now <ChevronRight size={12} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-text-4 text-sm">
                      <div className="text-center">
                        <LayoutGrid size={32} className="mx-auto mb-2 text-text-4/40" />
                        Hover a category to explore
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-1 ml-4 overflow-x-auto hide-scrollbar">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="whitespace-nowrap text-white/80 hover:text-white text-[13px] font-medium px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Category Strip */}
      <div className="lg:hidden bg-white border-b border-border">
        <div className="w-full max-w-[1440px] mx-auto px-4 h-11 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-1.5 shrink-0 bg-[#FF6B00]/10 text-[#FF6B00] text-xs font-bold px-3 py-1.5 rounded-lg"
          >
            <LayoutGrid size={14} />
            Categories
          </button>
          {quickLinks.slice(0, 5).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="shrink-0 text-xs text-text-3 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Mega Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="w-[85%] max-w-[360px] bg-white h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-[#0A1628] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A1628] to-[#FF6B00] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="font-bold text-sm">All Categories</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="p-3">
              <p className="px-3 py-2 text-xs text-text-4 font-bold uppercase tracking-wider">Shop by Category</p>
              {KAUVEX_CATEGORIES.map((cat) => {
                const isExpanded = activeDept === cat.id;
                return (
                  <div key={cat.id}>
                    <button
                      onClick={() => setActiveDept(isExpanded ? null : cat.id)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-sm text-text-2 font-medium flex-1 text-left">{cat.name}</span>
                      <ChevronDown size={14} className={`text-text-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    {isExpanded && (
                      <div className="pl-10 pb-2 space-y-1">
                        <Link
                          href={`/category/${cat.slug}`}
                          className="block text-sm text-[#FF6B00] font-medium py-1.5"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          View All {cat.name}
                        </Link>
                        {cat.subcategories.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/category/${cat.slug}/${sub.slug}`}
                            className="block text-sm text-text-3 py-1.5 hover:text-[#FF6B00] transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
