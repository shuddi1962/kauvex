"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Monitor,
  Shirt,
  Home,
  Heart,
  Baby,
  Bike,
  Car,
  Briefcase,
  Cog,
  Menu,
  X,
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";

const departments = [
  {
    name: "Electronics & Technology",
    slug: "electronics",
    icon: Monitor,
    featured: true,
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=300&fit=crop",
    subcategories: [
      { name: "Smartphones & Tablets", slug: "smartphones" },
      { name: "Laptops & Computers", slug: "laptops" },
      { name: "Audio & Headphones", slug: "audio" },
      { name: "Wearables", slug: "wearables" },
      { name: "Gaming", slug: "gaming" },
      { name: "TV & Home Theater", slug: "tv-home-theater" },
      { name: "Cameras", slug: "cameras" },
      { name: "Smart Home", slug: "smart-home" },
    ],
  },
  {
    name: "Fashion & Apparel",
    slug: "fashion",
    icon: Shirt,
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop",
    subcategories: [
      { name: "Men's Clothing", slug: "mens-clothing" },
      { name: "Women's Clothing", slug: "womens-clothing" },
      { name: "Shoes", slug: "shoes" },
      { name: "Bags & Accessories", slug: "bags-accessories" },
      { name: "Jewelry & Watches", slug: "jewelry-watches" },
      { name: "Kids' Fashion", slug: "kids-fashion" },
    ],
  },
  {
    name: "Home & Living",
    slug: "home-living",
    icon: Home,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    subcategories: [
      { name: "Furniture", slug: "furniture" },
      { name: "Kitchen & Dining", slug: "kitchen-dining" },
      { name: "Bedding & Bath", slug: "bedding-bath" },
      { name: "Home Decor", slug: "home-decor" },
      { name: "Appliances", slug: "appliances" },
      { name: "Lighting", slug: "lighting" },
    ],
  },
  {
    name: "Health & Beauty",
    slug: "health-beauty",
    icon: Heart,
    image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=300&fit=crop",
    subcategories: [
      { name: "Skincare", slug: "skincare" },
      { name: "Hair Care", slug: "hair-care" },
      { name: "Makeup", slug: "makeup" },
      { name: "Fragrances", slug: "fragrances" },
      { name: "Personal Care", slug: "personal-care" },
      { name: "Supplements", slug: "supplements" },
    ],
  },
  {
    name: "Mother & Baby",
    slug: "mother-baby",
    icon: Baby,
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=300&fit=crop",
    subcategories: [
      { name: "Baby Gear", slug: "baby-gear" },
      { name: "Diapering", slug: "diapering" },
      { name: "Feeding", slug: "feeding" },
      { name: "Nursery", slug: "nursery" },
      { name: "Toys & Activity", slug: "toys-activity" },
      { name: "Maternity", slug: "maternity" },
    ],
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    icon: Bike,
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&fit=crop",
    subcategories: [
      { name: "Fitness Equipment", slug: "fitness-equipment" },
      { name: "Sports Gear", slug: "sports-gear" },
      { name: "Camping & Hiking", slug: "camping-hiking" },
      { name: "Cycling", slug: "cycling" },
      { name: "Outdoor Recreation", slug: "outdoor-recreation" },
    ],
  },
  {
    name: "Automotive",
    slug: "automotive",
    icon: Car,
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&h=300&fit=crop",
    subcategories: [
      { name: "Car Accessories", slug: "car-accessories" },
      { name: "Tools & Equipment", slug: "tools-equipment" },
      { name: "Motorcycle Parts", slug: "motorcycle-parts" },
      { name: "Car Care", slug: "car-care" },
      { name: "Navigation & Electronics", slug: "navigation-electronics" },
    ],
  },
  {
    name: "Office & Stationery",
    slug: "office-stationery",
    icon: Briefcase,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
    subcategories: [
      { name: "Office Supplies", slug: "office-supplies" },
      { name: "Paper Products", slug: "paper-products" },
      { name: "Writing Instruments", slug: "writing-instruments" },
      { name: "Desk Organization", slug: "desk-organization" },
      { name: "Printing & Binding", slug: "printing-binding" },
    ],
  },
  {
    name: "Industrial & B2B",
    slug: "industrial-b2b",
    icon: Cog,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
    subcategories: [
      { name: "Safety Equipment", slug: "safety-equipment" },
      { name: "Tools & Hardware", slug: "tools-hardware" },
      { name: "Packaging", slug: "packaging" },
      { name: "Industrial Supplies", slug: "industrial-supplies" },
      { name: "Cleaning Equipment", slug: "cleaning-equipment" },
    ],
  },
];

const mainNav = [
  { label: "Home", href: "/" },
  {
    label: "Shop",
    href: "/shop",
    children: [
      { label: "All Products", href: "/shop" },
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Best Sellers", href: "/shop?sort=bestselling" },
      { label: "Brands", href: "/brands" },
    ],
  },
  {
    label: "Deals",
    href: "/deals",
    children: [
      { label: "Flash Sales", href: "/deals" },
      { label: "Clearance", href: "/deals" },
      { label: "Bundle Deals", href: "/deals" },
    ],
  },
  { label: "New Arrivals", href: "/new-arrivals" },
  {
    label: "Express",
    href: "/express",
    children: [
      { label: "Send a Package", href: "/express/book" },
      { label: "Track Shipment", href: "/express/track" },
      { label: "Express for Business", href: "/express/business" },
      { label: "Courier Partner", href: "/logistics/register" },
    ],
  },
  {
    label: "Brands",
    href: "/brands",
    children: [
      { label: "Apple", href: "/brands" },
      { label: "Samsung", href: "/brands" },
      { label: "Nike", href: "/brands" },
      { label: "Sony", href: "/brands" },
      { label: "All Brands", href: "/brands" },
    ],
  },
  {
    label: "Sell",
    href: "/sell",
    children: [
      { label: "Sell on KAUVEX", href: "/sell" },
      { label: "Vendor Dashboard", href: "/vendor/dashboard" },
      { label: "B2B / Wholesale", href: "/wholesale" },
      { label: "Manufacturer Portal", href: "/manufacturers" },
      { label: "Find Manufacturers", href: "/manufacturers/search" },
      { label: "Become a Partner", href: "/sell/partners" },
    ],
  },
  {
    label: "Marketplace",
    href: "#",
    children: [
      { label: "Used Equipment", href: "/marketplace/used-equipment" },
      { label: "Equipment Rental", href: "/marketplace/rentals" },
      { label: "Auctions", href: "/marketplace/auctions" },
      { label: "Procurement", href: "/marketplace/procurement" },
    ],
  },
  {
    label: "Explore",
    href: "#",
    children: [
      { label: "Industries", href: "/industries" },
      { label: "KPN Professionals", href: "/pro" },
      { label: "Project Hub", href: "/projects" },
      { label: "AI Design Studio", href: "/configure" },
      { label: "Asset Registry", href: "/assets" },
      { label: "Workforce", href: "/workforce" },
      { label: "Financing", href: "/financing" },
      { label: "Insurance", href: "/insurance" },
      { label: "Sustainability", href: "/sustainability" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function Navigation() {
  const [deptOpen, setDeptOpen] = useState(false);
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const hoveredDept = departments.find((d) => d.slug === activeDept);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-blue hidden lg:block">
        <div className="w-full max-w-[1440px] mx-auto px-4 flex items-center h-12">
          {/* ALL DEPARTMENTS - Mega Menu */}
          <div className="relative"
            onMouseLeave={() => { setDeptOpen(false); setActiveDept(null); }}
          >
            <button
              onMouseEnter={() => setDeptOpen(true)}
              className="bg-red hover:bg-red-600 text-white h-12 px-6 flex items-center gap-2 font-semibold text-sm transition-colors"
            >
              <LayoutGrid size={16} />
              All Departments
              <ChevronDown size={14} className={`transition-transform ${deptOpen ? "rotate-180" : ""}`} />
            </button>

            {deptOpen && (
              <div className="absolute top-full left-0 bg-white rounded-b-lg shadow-strong z-50 flex" style={{ width: "820px" }}>
                {/* Department List */}
                <div className="w-[260px] border-r border-border py-2">
                  {departments.map((dept) => {
                    const Icon = dept.icon;
                    return (
                      <div
                        key={dept.slug}
                        onMouseEnter={() => setActiveDept(dept.slug)}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                          activeDept === dept.slug ? "bg-blue-50 text-blue" : "text-text-2 hover:bg-gray-50"
                        }`}
                      >
                        <Icon size={16} className={activeDept === dept.slug ? "text-blue" : "text-text-4"} />
                        <span className="text-sm font-medium flex-1">{dept.name}</span>
                        <ChevronRight size={14} className="text-text-4" />
                        {dept.featured && (
                          <span className="text-[9px] bg-red/10 text-red px-1.5 py-0.5 rounded-full font-bold">
                            HOT
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Subcategories + Banner */}
                <div className="flex-1 p-5">
                  {hoveredDept ? (
                    <div>
                      <h3 className="font-bold text-base text-text-1 mb-3">{hoveredDept.name}</h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-4">
                        {hoveredDept.subcategories.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/category/${hoveredDept.slug}`}
                            className="text-sm text-text-3 hover:text-blue transition-colors py-1"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                      {/* Category Banner Image */}
                      <div className="relative rounded-lg overflow-hidden h-[140px] mt-3">
                        <Image
                          src={hoveredDept.image}
                          alt={hoveredDept.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-navy/70 to-transparent flex items-center">
                          <div className="pl-5">
                            <p className="text-white font-bold text-sm">Shop {hoveredDept.name}</p>
                            <Link
                              href={`/category/${hoveredDept.slug}`}
                              className="text-xs text-blue-200 hover:text-white mt-1 inline-flex items-center gap-1 transition-colors"
                            >
                              View All <ChevronRight size={12} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-text-4 text-sm">
                      Hover a department to see subcategories
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Nav Links */}
          <div className="flex items-center h-full ml-1">
            {mainNav.map((item) => (
              <div
                key={item.label}
                className="relative h-full"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 h-full px-4 text-white/90 hover:text-white text-[13px] font-medium transition-colors"
                >
                  {item.label}
                  {item.children && <ChevronDown size={12} />}
                </Link>

                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 bg-white rounded-b-lg shadow-strong border border-border z-50 min-w-[200px] py-1 animate-slide-down">
                    {item.children.map((child) => (
                      <Link
                        key={child.href + child.label}
                        href={child.href}
                        className="block px-4 py-2.5 text-sm text-text-2 hover:bg-blue-50 hover:text-blue transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <div className="lg:hidden bg-blue px-4 h-12 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white flex items-center gap-2"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          <span className="text-sm font-semibold">Menu</span>
        </button>
        <Link href="/shop" className="text-white text-sm font-semibold">
          Shop All
        </Link>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="w-[85%] max-w-[360px] bg-white h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-navy text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A1628] to-[#FF6B00] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="font-bold text-sm">KAUVEX</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="p-3">
              {/* Departments with expandable subcategories */}
              <p className="px-3 py-2 text-xs text-text-4 font-bold uppercase tracking-wider">Departments</p>
              {departments.map((dept) => {
                const Icon = dept.icon;
                const isExpanded = mobileExpanded === dept.slug;
                return (
                  <div key={dept.slug}>
                    <button
                      onClick={() => setMobileExpanded(isExpanded ? null : dept.slug)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Icon size={16} className="text-text-4" />
                      <span className="text-sm text-text-2 font-medium flex-1 text-left">{dept.name}</span>
                      <ChevronDown size={14} className={`text-text-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    {isExpanded && (
                      <div className="pl-10 pb-2 space-y-1">
                        <Link
                          href={`/category/${dept.slug}`}
                          className="block text-sm text-blue font-medium py-1.5"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          View All {dept.name}
                        </Link>
                        {dept.subcategories.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/category/${dept.slug}`}
                            className="block text-sm text-text-3 py-1.5"
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

              <div className="border-t border-border my-3" />
              <p className="px-3 py-2 text-xs text-text-4 font-bold uppercase tracking-wider">Navigate</p>
              {mainNav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block px-3 py-3 text-sm text-text-2 font-medium rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
