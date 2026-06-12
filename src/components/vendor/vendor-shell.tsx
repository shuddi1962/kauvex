"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Store,
  Megaphone, Settings, Bell, ChevronDown, BarChart3,
  Menu, ArrowLeft, DollarSign, Truck, Sparkles,
} from "lucide-react";

type SectionKey = "dashboard" | "products" | "orders" | "store" | "marketing" | "settings";

interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const topNav: { key: SectionKey; label: string; icon: React.ElementType; groups: NavGroup[] }[] = [
  {
    key: "dashboard", label: "Dashboard", icon: LayoutDashboard,
    groups: [
      { title: "Overview", items: [
        { label: "Dashboard", href: "/vendor/dashboard" },
        { label: "Analytics", href: "/vendor/analytics" },
        { label: "Earnings", href: "/vendor/earnings" },
      ]},
    ],
  },
  {
    key: "products", label: "Products", icon: Package,
    groups: [
      { title: "Products", items: [
        { label: "All Products", href: "/vendor/products" },
        { label: "Add Product", href: "/vendor/products" },
        { label: "Shared Catalog", href: "/vendor/catalog", badge: "Sell" },
      ]},
      { title: "Fulfillment", items: [
        { label: "FBK", href: "/vendor/fbk" },
        { label: "Shipping", href: "/vendor/shipping" },
      ]},
    ],
  },
  {
    key: "orders", label: "Orders", icon: ShoppingCart,
    groups: [
      { title: "Orders", items: [
        { label: "All Orders", href: "/vendor/orders" },
      ]},
    ],
  },
  {
    key: "store", label: "Store", icon: Store,
    groups: [
      { title: "Store Design", items: [
        { label: "Store Builder", href: "/vendor/store-builder" },
        { label: "Shop Settings", href: "/vendor/shop" },
      ]},
      { title: "Content", items: [
        { label: "Custom Pages", href: "/vendor/store-builder" },
      ]},
    ],
  },
  {
    key: "marketing", label: "Marketing", icon: Megaphone,
    groups: [
      { title: "Advertising", items: [
        { label: "Campaigns", href: "/vendor/advertising" },
        { label: "Promotions", href: "/vendor/promotions" },
      ]},
    ],
  },
  {
    key: "settings", label: "Settings", icon: Settings,
    groups: [
      { title: "Account", items: [
        { label: "Profile", href: "/vendor/settings" },
        { label: "Subscription", href: "/vendor/subscription" },
        { label: "Staff", href: "/vendor/dashboard/staff" },
      ]},
    ],
  },
];

function detectSection(pathname: string): SectionKey {
  if (pathname === "/vendor/dashboard" || pathname === "/vendor/analytics" || pathname === "/vendor/earnings") return "dashboard";
  if (pathname.startsWith("/vendor/products") || pathname.startsWith("/vendor/catalog") || pathname.startsWith("/vendor/fbk") || pathname.startsWith("/vendor/shipping")) return "products";
  if (pathname.startsWith("/vendor/orders")) return "orders";
  if (pathname.startsWith("/vendor/store-builder") || pathname.startsWith("/vendor/shop")) return "store";
  if (pathname.startsWith("/vendor/advertising") || pathname.startsWith("/vendor/promotions")) return "marketing";
  if (pathname.startsWith("/vendor/settings") || pathname.startsWith("/vendor/subscription") || pathname.startsWith("/vendor/dashboard/staff")) return "settings";
  return "dashboard";
}

interface VendorShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function VendorShell({ children, title, subtitle }: VendorShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState<SectionKey | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeSection = detectSection(pathname);
  const currentSection = topNav.find(s => s.key === activeSection);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setDropdownOpen(null);
  }, [pathname]);

  const isActiveLink = (href: string) => {
    if (href === "/vendor/dashboard") return pathname === "/vendor/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-off-white overflow-hidden">
      {mobileNavOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* TOP NAV */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-navy text-white z-40 flex items-center px-3 gap-1 shadow-lg">
        <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg">
          <Menu size={18} />
        </button>

        <Link href="/vendor/dashboard" className="flex items-center gap-2 px-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
            <Store size={14} className="text-white" />
          </div>
          <span className="font-bold text-xs tracking-tight hidden sm:block">Vendor Hub</span>
        </Link>

        <div ref={dropdownRef} className="flex-1 flex items-center gap-0.5 overflow-x-auto no-scrollbar">
          {topNav.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.key;
            const isOpen = dropdownOpen === sec.key;
            return (
              <div key={sec.key} className="relative">
                <button
                  onClick={() => setDropdownOpen(isOpen ? null : sec.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive || isOpen ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  }`}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{sec.label}</span>
                  <ChevronDown size={10} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-border py-2 min-w-[180px] z-50">
                    {sec.groups.map((group) => (
                      <div key={group.title}>
                        <p className="px-3 py-1 text-[9px] text-gray-500 uppercase tracking-wider font-semibold">{group.title}</p>
                        {group.items.map((item) => {
                          const active = isActiveLink(item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setDropdownOpen(null)}
                              className={`flex items-center gap-2 px-3 py-1.5 text-xs transition-all ${
                                active ? "bg-purple-50 text-purple-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="ml-auto text-[8px] bg-purple-600 text-white px-1 py-0.5 rounded-full font-bold">{item.badge}</span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="relative p-1.5 hover:bg-white/10 rounded-lg">
            <Bell size={15} className="text-white/60" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-purple-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center">3</span>
          </button>
          <div className="flex items-center gap-2 pl-2 ml-1 border-l border-white/10">
            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">VS</span>
            </div>
            <span className="text-[10px] font-semibold hidden lg:block">Vendor</span>
            <ChevronDown size={12} className="text-white/40" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 pt-14 min-h-0">
        {/* LEFT SIDEBAR (compact, collapsed by default) */}
        <aside className={`${
          sidebarOpen ? "w-[180px]" : "w-0 lg:w-[48px]"
        } bg-white border-r border-border shrink-0 overflow-y-auto transition-all duration-200 ${
          mobileNavOpen ? "fixed left-0 top-14 bottom-0 z-30 w-[200px]" : "hidden lg:block"
        }`}>
          <div className={`flex items-center ${sidebarOpen ? "justify-between px-3" : "justify-center"} h-10 border-b border-border`}>
            {sidebarOpen && (
              <span className="text-[9px] font-semibold text-text-4 uppercase tracking-wider">
                {currentSection?.label || ""}
              </span>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-100 rounded">
              <ChevronDown size={12} className={`text-text-4 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          <nav className="py-2 px-1.5 space-y-3">
            {currentSection?.groups.map((group) => (
              <div key={group.title}>
                {sidebarOpen && (
                  <p className="px-2 mb-0.5 text-[9px] text-text-4 uppercase tracking-wider font-semibold">{group.title}</p>
                )}
                {group.items.slice(0, sidebarOpen ? undefined : 1).map((item) => {
                  const active = isActiveLink(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                        active
                          ? "bg-purple-50 text-purple-700 font-semibold"
                          : "text-text-3 hover:bg-gray-50 hover:text-text-1"
                      }`}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      {!sidebarOpen && (
                        <div className={`w-1.5 h-1.5 rounded-full ${active ? "bg-purple-600" : "bg-text-4"}`} />
                      )}
                      {sidebarOpen && <span>{item.label}</span>}
                      {sidebarOpen && item.badge && (
                        <span className="ml-auto text-[8px] bg-purple-600 text-white px-1 py-0.5 rounded-full font-bold">{item.badge}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* MAIN */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-border px-6 py-3 flex items-center gap-3 shrink-0">
            <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-lg text-text-4">
              <ArrowLeft size={15} />
            </button>
            <div>
              <h1 className="font-bold text-base text-text-1 leading-tight">{title}</h1>
              {subtitle && <p className="text-[11px] text-text-4 -mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
