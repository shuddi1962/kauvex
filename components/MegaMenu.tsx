"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";

const categories = [
  {
    label: "Electronics",
    icon: "💻",
    href: "/category/electronics",
    children: [
      { label: "Phones & Tablets", href: "/category/phones" },
      { label: "Laptops & Computers", href: "/category/computers" },
      { label: "Audio & Headphones", href: "/category/audio" },
      { label: "Smart Home", href: "/category/smart-home" },
      { label: "Accessories", href: "/category/accessories" },
      { label: "Cameras", href: "/category/cameras" },
      { label: "Gaming", href: "/category/gaming" },
      { label: "Wearables", href: "/category/wearables" },
    ],
  },
  {
    label: "Marine",
    icon: "⛵",
    href: "/category/marine",
    children: [
      { label: "Boat Engines", href: "/category/boat-engines" },
      { label: "GPS & Navigation", href: "/category/gps-navigation" },
      { label: "Fishing Equipment", href: "/category/fishing" },
      { label: "Safety Gear", href: "/category/marine-safety" },
      { label: "Boat Parts", href: "/category/boat-parts" },
      { label: "Marine Electronics", href: "/category/marine-electronics" },
    ],
  },
  {
    label: "Fashion",
    icon: "👕",
    href: "/category/fashion",
    children: [
      { label: "Men's Clothing", href: "/category/men-clothing" },
      { label: "Women's Clothing", href: "/category/women-clothing" },
      { label: "Kids & Baby", href: "/category/kids" },
      { label: "Shoes", href: "/category/shoes" },
      { label: "Accessories", href: "/category/fashion-accessories" },
      { label: "Luxury", href: "/category/luxury" },
    ],
  },
  {
    label: "Industrial",
    icon: "🏭",
    href: "/category/industrial",
    children: [
      { label: "Machinery", href: "/category/machinery" },
      { label: "Construction", href: "/category/construction" },
      { label: "Safety Equipment", href: "/category/safety-equipment" },
      { label: "Tools", href: "/category/tools" },
      { label: "Raw Materials", href: "/category/raw-materials" },
    ],
  },
  {
    label: "Automotive",
    icon: "🚗",
    href: "/category/automotive",
    children: [
      { label: "Tires & Wheels", href: "/category/tires" },
      { label: "Batteries", href: "/category/batteries" },
      { label: "Spare Parts", href: "/category/spare-parts" },
      { label: "Car Accessories", href: "/category/car-accessories" },
      { label: "Motorcycle Parts", href: "/category/motorcycle-parts" },
    ],
  },
  {
    label: "ICT",
    icon: "🖥️",
    href: "/category/ict",
    children: [
      { label: "Laptops", href: "/category/laptops" },
      { label: "Servers & Networking", href: "/category/servers" },
      { label: "Software", href: "/category/software" },
      { label: "IT Accessories", href: "/category/it-accessories" },
      { label: "Office Equipment", href: "/category/office-equipment" },
    ],
  },
];

const exploreLinks = [
  { label: "Kauvex Live", icon: "🔴", href: "/live", desc: "Shop live with vendors" },
  { label: "Group Buy", icon: "🤝", href: "/group-buy", desc: "Buy together, save more" },
  { label: "POD Marketplace", icon: "🎨", href: "/pod-marketplace", desc: "Design & print on demand" },
  { label: "Art Marketplace", icon: "🖼️", href: "/art-marketplace", desc: "Digital art & illustrations" },
  { label: "Concierge AI", icon: "✨", href: "/concierge", desc: "AI shopping assistant" },
  { label: "NFT Marketplace", icon: "🌟", href: "/nft-marketplace", desc: "Collect digital artworks" },
  { label: "Kauvex Express", icon: "🚚", href: "/express", desc: "Send packages worldwide" },
  { label: "FBK Fulfillment", icon: "📦", href: "/vendor/fbk", desc: "We pick, pack & ship" },
];

const navLinks = ["Home", "Shop", "Deals", "Brands", "Blog", "Contact"];

export default function MegaMenu() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeCatIndex, setActiveCatIndex] = useState(0);

  return (
    <nav className="bg-navy hidden lg:block">
      <div className="container-kauvex flex items-center">
        <div
          className="relative"
          onMouseEnter={() => setOpenMenu("categories")}
          onMouseLeave={() => { setOpenMenu(null); setActiveCatIndex(0); }}
        >
          <button className="flex items-center gap-2 bg-orange text-white font-bold text-sm px-6 h-12 hover:bg-orange/90 transition-colors">
            <Menu size={16} />
            All Categories
            <ChevronDown size={14} className={`transition-transform ${openMenu === "categories" ? "rotate-180" : ""}`} />
          </button>

          {openMenu === "categories" && (
            <div
              className="absolute top-full left-0 bg-white rounded-b-xl shadow-modal border border-border z-50 flex"
              style={{ width: 860 }}
              onMouseEnter={() => setOpenMenu("categories")}
              onMouseLeave={() => { setOpenMenu(null); setActiveCatIndex(0); }}
            >
              <div className="w-[270px] border-r border-border py-2">
                {categories.map((cat, i) => (
                  <div
                    key={cat.label}
                    onMouseEnter={() => setActiveCatIndex(i)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      activeCatIndex === i ? "bg-orange-50 text-orange" : "text-text-2 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-sm font-medium flex-1">{cat.label}</span>
                    <ChevronRight size={14} className="text-text-4" />
                  </div>
                ))}
              </div>

              <div className="flex-1 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-base text-text-1">{categories[activeCatIndex].label}</h3>
                  <Link href={categories[activeCatIndex].href} className="text-xs text-orange font-semibold hover:underline flex items-center gap-1">
                    View All <ChevronRight size={12} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  {categories[activeCatIndex].children.map((child) => (
                    <Link key={child.label} href={child.href} className="text-sm text-text-3 hover:text-orange transition-colors py-1">
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-1 ml-6 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link}
              href={link === "Home" ? "/" : `/${link.toLowerCase()}`}
              className="whitespace-nowrap text-text-2 hover:text-orange text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
            >
              {link}
            </Link>
          ))}

          <div
            className="relative"
            onMouseEnter={() => setOpenMenu("explore")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button className="whitespace-nowrap text-text-2 hover:text-orange text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-1">
              Explore <ChevronDown size={12} />
            </button>

            {openMenu === "explore" && (
              <div
                className="absolute top-full right-0 bg-white rounded-xl shadow-modal border border-border z-50 p-5"
                style={{ width: 500 }}
                onMouseEnter={() => setOpenMenu("explore")}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <div className="grid grid-cols-2 gap-3">
                  {exploreLinks.map((item) => (
                    <Link key={item.label} href={item.href} className="flex items-start gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors group">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-text-1 group-hover:text-orange transition-colors">{item.label}</p>
                        <p className="text-[11px] text-text-4 mt-0.5">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}