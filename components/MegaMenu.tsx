"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";

const categories = [
  {
    label: "Electronics & Technology",
    icon: "💻",
    href: "/category/electronics",
    children: [
      { label: "Smartphones & Accessories", href: "/category/electronics/smartphones" },
      { label: "Laptops & Computers", href: "/category/electronics/laptops" },
      { label: "Tablets & E-Readers", href: "/category/electronics/tablets" },
      { label: "Smart Home & IoT", href: "/category/electronics/smart-home" },
      { label: "Audio & Headphones", href: "/category/electronics/audio" },
      { label: "Cameras & Photography", href: "/category/electronics/cameras" },
      { label: "Gaming & Consoles", href: "/category/electronics/gaming" },
      { label: "Wearables & Smartwatches", href: "/category/electronics/wearables" },
      { label: "TV & Home Entertainment", href: "/category/electronics/tv-entertainment" },
      { label: "Computer Components", href: "/category/electronics/computer-components" },
      { label: "Networking Equipment", href: "/category/electronics/networking" },
      { label: "Power Banks & Chargers", href: "/category/electronics/power-banks" },
      { label: "Cables & Adapters", href: "/category/electronics/cables-adapters" },
    ],
  },
  {
    label: "Fashion & Apparel",
    icon: "👕",
    href: "/category/fashion",
    children: [
      { label: "Men's Clothing", href: "/category/fashion/mens-clothing" },
      { label: "Women's Clothing", href: "/category/fashion/womens-clothing" },
      { label: "Children's Clothing", href: "/category/fashion/kids-clothing" },
      { label: "Shoes & Footwear", href: "/category/fashion/shoes" },
      { label: "Bags & Luggage", href: "/category/fashion/bags-luggage" },
      { label: "Watches & Jewellery", href: "/category/fashion/watches-jewellery" },
      { label: "Sunglasses & Eyewear", href: "/category/fashion/eyewear" },
      { label: "Sportswear & Activewear", href: "/category/fashion/sportswear" },
      { label: "Underwear & Loungewear", href: "/category/fashion/underwear" },
      { label: "Traditional & Cultural Wear", href: "/category/fashion/traditional-wear" },
    ],
  },
  {
    label: "Home & Living",
    icon: "🏠",
    href: "/category/home-living",
    children: [
      { label: "Furniture", href: "/category/home-living/furniture" },
      { label: "Kitchen & Dining", href: "/category/home-living/kitchen-dining" },
      { label: "Bedding & Bath", href: "/category/home-living/bedding-bath" },
      { label: "Home Decor", href: "/category/home-living/home-decor" },
      { label: "Lighting", href: "/category/home-living/lighting" },
      { label: "Storage & Organisation", href: "/category/home-living/storage-org" },
      { label: "Garden & Outdoor", href: "/category/home-living/garden-outdoor" },
      { label: "Cleaning & Laundry", href: "/category/home-living/cleaning-laundry" },
      { label: "DIY & Tools", href: "/category/home-living/diy-tools" },
      { label: "Home Security", href: "/category/home-living/home-security" },
    ],
  },
  {
    label: "Health & Beauty",
    icon: "✨",
    href: "/category/health-beauty",
    children: [
      { label: "Skincare", href: "/category/health-beauty/skincare" },
      { label: "Hair Care", href: "/category/health-beauty/hair-care" },
      { label: "Makeup & Cosmetics", href: "/category/health-beauty/makeup" },
      { label: "Men's Grooming", href: "/category/health-beauty/mens-grooming" },
      { label: "Vitamins & Supplements", href: "/category/health-beauty/supplements" },
      { label: "Medical Devices", href: "/category/health-beauty/medical-devices" },
      { label: "Dental Care", href: "/category/health-beauty/dental-care" },
      { label: "Fragrances", href: "/category/health-beauty/fragrances" },
      { label: "Fitness Equipment", href: "/category/health-beauty/fitness-equipment" },
      { label: "Wellness", href: "/category/health-beauty/wellness" },
    ],
  },
  {
    label: "Mother & Baby",
    icon: "👶",
    href: "/category/mother-baby",
    children: [
      { label: "Baby Clothing", href: "/category/mother-baby/baby-clothing" },
      { label: "Toys & Games", href: "/category/mother-baby/toys-games" },
      { label: "Pushchairs & Car Seats", href: "/category/mother-baby/pushchairs-car-seats" },
      { label: "Baby Food & Formula", href: "/category/mother-baby/baby-food" },
      { label: "Nursery Furniture", href: "/category/mother-baby/nursery-furniture" },
      { label: "Educational Toys", href: "/category/mother-baby/educational-toys" },
      { label: "Board Games", href: "/category/mother-baby/board-games" },
    ],
  },
  {
    label: "Sports & Outdoors",
    icon: "⚽",
    href: "/category/sports-outdoors",
    children: [
      { label: "Football & Team Sports", href: "/category/sports-outdoors/football" },
      { label: "Swimming & Water Sports", href: "/category/sports-outdoors/swimming" },
      { label: "Cycling", href: "/category/sports-outdoors/cycling" },
      { label: "Camping & Hiking", href: "/category/sports-outdoors/camping-hiking" },
      { label: "Fishing", href: "/category/sports-outdoors/fishing" },
      { label: "Boxing & Martial Arts", href: "/category/sports-outdoors/boxing-martial-arts" },
      { label: "Running & Athletics", href: "/category/sports-outdoors/running-athletics" },
    ],
  },
  {
    label: "Automotive",
    icon: "🚗",
    href: "/category/automotive",
    children: [
      { label: "Car Accessories", href: "/category/automotive/car-accessories" },
      { label: "Motorcycle Parts", href: "/category/automotive/motorcycle-parts" },
      { label: "Car Electronics", href: "/category/automotive/car-electronics" },
      { label: "Tyres & Wheels", href: "/category/automotive/tyres-wheels" },
      { label: "Car Care & Cleaning", href: "/category/automotive/car-care" },
      { label: "Commercial Vehicle Parts", href: "/category/automotive/commercial-parts" },
    ],
  },
  {
    label: "Office & Stationery",
    icon: "💼",
    href: "/category/office-stationery",
    children: [
      { label: "Office Furniture", href: "/category/office-stationery/office-furniture" },
      { label: "Printers & Scanners", href: "/category/office-stationery/printers-scanners" },
      { label: "Stationery & Supplies", href: "/category/office-stationery/stationery" },
      { label: "Whiteboards & Display", href: "/category/office-stationery/whiteboards-display" },
      { label: "Business Machines", href: "/category/office-stationery/business-machines" },
    ],
  },
  {
    label: "Digital Products",
    icon: "📦",
    href: "/category/digital-products",
    children: [
      { label: "Software & Licenses", href: "/category/digital-products/software-licenses" },
      { label: "Gift Cards & Vouchers", href: "/category/digital-products/gift-cards" },
      { label: "Online Courses", href: "/category/digital-products/online-courses" },
      { label: "E-Books", href: "/category/digital-products/ebooks" },
    ],
  },
  {
    label: "Industrial & B2B",
    icon: "🏭",
    href: "/category/industrial-b2b",
    children: [
      { label: "Safety Equipment & PPE", href: "/category/industrial-b2b/safety-ppe" },
      { label: "Electrical & Industrial", href: "/category/industrial-b2b/electrical-industrial" },
      { label: "Construction Materials", href: "/category/industrial-b2b/construction" },
      { label: "Packaging & Shipping", href: "/category/industrial-b2b/packaging" },
      { label: "Agricultural Equipment", href: "/category/industrial-b2b/agricultural" },
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

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Deals", href: "/deals" },
  { label: "Brands", href: "/brands" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

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
              key={link.label}
              href={link.href}
              className="whitespace-nowrap text-text-2 hover:text-orange text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
            >
              {link.label}
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