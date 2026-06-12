"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { insforge } from "@/lib/insforge";

interface MenuItem {
  id?: string;
  label: string;
  href?: string;
  icon?: string;
  image_url?: string;
  description?: string;
  badge_text?: string;
  is_mega?: boolean;
  column_count?: number;
  children: MenuItem[];
}

const staticCategories = [
  {
    label: "Electronics",
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

export default function MegaMenu() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [dbMenuItems, setDbMenuItems] = useState<MenuItem[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchMenu = async () => {
      const { data } = await insforge.database
        .from("menu_items")
        .select("*")
        .eq("menu_type", "header")
        .eq("status", "active")
        .order("sort_order", { ascending: true });

      if (data && data.length > 0) {
        const buildTree = (items: any[], parentId: string | null = null): MenuItem[] =>
          items
            .filter((i) => (parentId === null ? !i.parent_id : i.parent_id === parentId))
            .map((i) => ({ ...i, children: buildTree(items, i.id) }));
        setDbMenuItems(buildTree(data));
      }
    };
    fetchMenu();
  }, []);

  const menuItems = dbMenuItems.length > 0 ? dbMenuItems : staticCategories;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = (label: string) => {
    clearTimeout(timeoutRef.current);
    setOpenMenu(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenMenu(null), 200);
  };

  return (
    <div ref={menuRef} className="bg-navy text-white">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <nav className="flex items-center gap-0">
          {menuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isMega = item.is_mega || (hasChildren && item.children.length > 4);

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href || "#"}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors ${openMenu === item.label ? "bg-white/10 text-white" : ""}`}
                >
                  {item.icon && <span className="text-base">{item.icon}</span>}
                  {item.label}
                  {item.badge_text && (
                    <span className="text-[9px] bg-orange text-white px-1.5 py-0.5 rounded-full font-bold">{item.badge_text}</span>
                  )}
                  {hasChildren && <ChevronDown size={12} className="text-white/40" />}
                </Link>

                {hasChildren && openMenu === item.label && (
                  <div
                    className={`absolute top-full left-0 bg-white rounded-b-xl shadow-strong border border-border z-50 ${
                      isMega ? "w-[700px] lg:w-[900px]" : "w-56"
                    }`}
                    onMouseEnter={() => clearTimeout(timeoutRef.current)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {isMega ? (
                      <div className="grid grid-cols-3 gap-0 p-6">
                        {item.children.map((child) => (
                          <div key={child.label}>
                            <Link href={child.href || "#"} className="block group">
                              {child.image_url && (
                                <div className="relative h-24 rounded-lg overflow-hidden mb-2">
                                  <Image src={child.image_url} alt={child.label} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                                </div>
                              )}
                              <p className="font-semibold text-xs text-text-1 group-hover:text-orange transition-colors">
                                {child.icon && <span className="mr-1.5">{child.icon}</span>}
                                {child.label}
                              </p>
                              {child.description && (
                                <p className="text-[10px] text-text-4 mt-0.5 leading-relaxed">{child.description}</p>
                              )}
                            </Link>
                            {child.children && child.children.length > 0 && (
                              <div className="mt-1.5 space-y-0.5">
                                {child.children.map((sub) => (
                                  <Link key={sub.label} href={sub.href || "#"} className="block text-[11px] text-text-4 hover:text-orange transition-colors py-0.5">
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-2">
                        {item.children.map((child) => (
                          <Link key={child.label} href={child.href || "#"} className="block px-4 py-2 text-xs text-text-2 hover:bg-orange-50 hover:text-orange transition-colors">
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
