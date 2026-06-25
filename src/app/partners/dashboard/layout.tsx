"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Link2, Store, Megaphone, BarChart3,
  PieChart, Settings, HelpCircle, Bell, LogOut, Menu, X,
  ChevronDown, ChevronRight, TrendingUp, MousePointerClick,
  ShoppingCart, LayoutDashboard, UserCheck, Building2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

const navItems = [
  { label: "Dashboard", href: "/partners/dashboard", icon: LayoutDashboard },
  { label: "Quick Link Creator", href: "/partners/dashboard/quick-links", icon: Link2 },
  { label: "My Storefront", href: "/partners/dashboard/storefront", icon: Store, badge: "Influencers" },
  { label: "Promotions", href: "/partners/dashboard/promotions", icon: Megaphone },
  {
    label: "Reports", icon: BarChart3, children: [
      { label: "Summary", href: "/partners/dashboard/reports/summary" },
      { label: "Orders", href: "/partners/dashboard/reports/orders" },
      { label: "Clicks", href: "/partners/dashboard/reports/clicks" },
      { label: "By Product", href: "/partners/dashboard/reports/by-product" },
      { label: "By Category", href: "/partners/dashboard/reports/by-category" },
    ],
  },
  { label: "Content Insights", href: "/partners/dashboard/content-insights", icon: TrendingUp },
  { label: "B2B Dashboard", href: "/partners/dashboard/b2b", icon: Building2, badge: "B2B" },
  { label: "Settings", href: "/partners/dashboard/settings", icon: Settings },
  { label: "Help", href: "/partners/dashboard/help", icon: HelpCircle },
];

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Reports"]);
  const { user, signOut } = useAuthStore();
  const partnerType = user?.partnerType || "associate";

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === "/partners/dashboard") return pathname === "/partners/dashboard";
    return pathname.startsWith(href);
  };

  const hasActiveChild = (children: { href: string }[]) =>
    children.some((c) => pathname.startsWith(c.href));

  const trackingId = user?.name
    ? `KAV-${user.name.replace(/\s+/g, "").toUpperCase().slice(0, 6)}-${user.id.slice(0, 4).toUpperCase()}`
    : "KAV-XXXX-XXXX";

  const accountType = user?.partnerType === "influencer"
    ? "Influencer Partner"
    : user?.partnerType === "b2b_referral"
    ? "B2B Referral Partner"
    : "Associate Partner";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {mobileNavOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* TOP BAR */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#0A1628] text-white z-40 flex items-center px-4 gap-3 shadow-lg">
        <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg">
          <Menu size={18} />
        </button>

        <Link href="/partners/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#FF6B00] flex items-center justify-center">
            <UserCheck size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">KAIN</span>
        </Link>

        <div className="flex-1" />

        <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5">
          <Link2 size={12} className="text-white/50" />
          <span className="text-[10px] font-mono font-semibold text-white/80">{trackingId}</span>
        </div>

        <Link href="/partners/dashboard/settings" className="relative p-1.5 hover:bg-white/10 rounded-lg">
          <Bell size={15} className="text-white/60" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#FF6B00] text-white text-[7px] font-bold rounded-full flex items-center justify-center">5</span>
        </Link>

        <div className="flex items-center gap-2 pl-2 ml-1 border-l border-white/10">
          <span className="text-[8px] bg-[#FF6B00]/20 text-[#FF6B00] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">{accountType}</span>
        </div>

        <button
          onClick={() => signOut()}
          className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
          title="Sign Out"
        >
          <LogOut size={14} />
        </button>
      </div>

      <div className="flex flex-1 pt-14 min-h-0">
        {/* SIDEBAR */}
        <aside className={`${
          sidebarOpen ? "w-[220px]" : "w-0 lg:w-[52px]"
        } bg-[#0A1628] border-r border-white/5 shrink-0 overflow-y-auto transition-all duration-200 ${
          mobileNavOpen ? "fixed left-0 top-14 bottom-0 z-30 w-[220px]" : "hidden lg:block"
        }`}>
          <div className="flex items-center justify-between h-10 px-3 border-b border-white/5">
            {sidebarOpen && (
              <span className="text-[9px] font-semibold text-white/30 uppercase tracking-wider">Navigation</span>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-white/5 rounded text-white/30 hidden lg:block">
              <ChevronRight size={12} className={`transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          <nav className="py-3 px-2 space-y-1">
            {navItems
              .filter((item) => {
                if (item.badge === "Influencers" && partnerType !== "influencer") return false;
                if (item.badge === "B2B" && partnerType !== "b2b_referral") return false;
                return true;
              })
              .map((item) => {
              const Icon = item.icon;
              if ("children" in item && item.children) {
                const expanded = expandedMenus.includes(item.label);
                const childActive = hasActiveChild(item.children);
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                        childActive
                          ? "bg-[#FF6B00]/15 text-[#FF6B00] font-semibold"
                          : "text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon size={15} className="shrink-0" />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </>
                      )}
                    </button>
                    {sidebarOpen && expanded && (
                      <div className="ml-6 mt-0.5 space-y-0.5 border-l border-white/5 pl-2">
                        {item.children.map((child) => {
                          const active = isActive(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-all ${
                                active
                                  ? "text-[#FF6B00] font-semibold bg-[#FF6B00]/10"
                                  : "text-white/40 hover:text-white/70"
                              }`}
                            >
                              <div className={`w-1 h-1 rounded-full ${active ? "bg-[#FF6B00]" : "bg-white/20"}`} />
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                    active
                      ? "bg-[#FF6B00]/15 text-[#FF6B00] font-semibold"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon size={15} className="shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-[7px] bg-[#FF6B00] text-white px-1.5 py-0.5 rounded-full font-bold uppercase">{item.badge}</span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* MAIN */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
