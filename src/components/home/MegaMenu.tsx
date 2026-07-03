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
  children?: MenuItem[];
}

const staticCategories = [
  {
    label: "Electronics & Technology",
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
    href: "/category/home-living",
    children: [
      { label: "Furniture", href: "/category/home-living/furniture" },
      { label: "Kitchen & Dining", href: "/category/home-living/kitchen-dining" },
      { label: "Bedding & Bath", href: "/category/home-living/bedding-bath" },
      { label: "Home Décor", href: "/category/home-living/home-decor" },
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
    href: "/category/industrial-b2b",
    children: [
      { label: "Safety Equipment & PPE", href: "/category/industrial-b2b/safety-ppe" },
      { label: "Electrical & Industrial", href: "/category/industrial-b2b/electrical-industrial" },
      { label: "Construction Materials", href: "/category/industrial-b2b/construction" },
      { label: "Packaging & Shipping Supplies", href: "/category/industrial-b2b/packaging" },
      { label: "Agricultural Equipment", href: "/category/industrial-b2b/agricultural" },
    ],
  },
  {
    label: "Ship",
    href: "/express",
    is_mega: true,
    children: [
      {
        label: "Kauvex Express",
        href: "/express",
        description: "Send packages anywhere, anytime. Instant quotes & booking",
      },
      {
        label: "Track Shipment",
        href: "/express/track",
        description: "Real-time tracking by waybill number — no login required",
      },
      {
        label: "Express for Business",
        href: "/express/business",
        description: "Volume discounts, API access, team accounts",
      },
      {
        label: "Logistics Network",
        href: "/logistics",
        description: "Nigeria's largest independent delivery network",
      },
      {
        label: "Become a Partner",
        href: "/logistics/register",
        description: "Register as a rider, driver, courier or freight company",
      },
      {
        label: "FBK (Fulfillment)",
        href: "/vendor/fbk",
        description: "Store your inventory with Kauvex — we pick, pack & ship",
      },
      {
        label: "Shipping Profiles",
        href: "/vendor/shipping/profiles",
        description: "Set your delivery rules, rates, and coverage zones",
      },
      {
        label: "Partner Login",
        href: "/logistics/login",
        description: "Logistics partner dashboard sign-in",
      },
    ],
  },
  {
    label: "Explore",
    href: "#",
    is_mega: true,
    children: [
      {
        label: "Kauvex Live",
        href: "/live",
        icon: "🔴",
        description: "Shop live with your favourite vendors",
      },
      {
        label: "Group Buy",
        href: "/group-buy",
        icon: "🤝",
        description: "Buy together, save more on every deal",
      },
      {
        label: "POD Marketplace",
        href: "/pod-marketplace",
        icon: "🎨",
        description: "Browse & license designs for POD products",
      },
      {
        label: "Art Marketplace",
        href: "/art-marketplace",
        icon: "🖼️",
        description: "Buy and sell digital art & illustrations",
      },
      {
        label: "Concierge AI",
        href: "/concierge",
        icon: "✨",
        description: "AI-powered personal shopping assistant",
      },
      {
        label: "Request Product",
        href: "/request-product",
        icon: "📦",
        description: "Can't find it? We'll source it for you",
      },
      {
        label: "NFT Marketplace",
        href: "/nft-marketplace",
        icon: "🌟",
        description: "Buy, sell & collect unique digital artworks as NFTs",
      },
      {
        label: "Supplier Portal",
        href: "/supplier/register",
        icon: "🏭",
        description: "Register as a local supplier and manage your products",
      },
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

  const menuItems: MenuItem[] = dbMenuItems.length > 0 ? dbMenuItems : staticCategories as MenuItem[];

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
            const children = item.children ?? [];
            const hasChildren = children.length > 0;
            const isMega = item.is_mega || (hasChildren && children.length > 4);

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
                        {children.map((child) => (
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
                                {child.children.map((sub: MenuItem) => (
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
                        {children.map((child) => (
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
