"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  History,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  Truck,
  Bell,
  Wifi,
  WifiOff,
  Fuel,
  MapPin,
  Route,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Star,
  Wallet,
  Search,
  Shield,
  BarChart3,
  CircleUser,
  CreditCard,
  Key,
  ShieldCheck,
  Plug,
  Box,
  ShoppingCart,
  FileText,
  Calendar,
  Globe,
  AlertTriangle,
} from "lucide-react";

type NavItem = {
  icon: React.ElementType;
  label: string;
  href: string;
  tab?: string;
  badge?: string;
};

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/logistics/dashboard", tab: "available" },
    ],
  },
  {
    label: "Deliveries",
    items: [
      { icon: ClipboardList, label: "Available Jobs", href: "/logistics/dashboard", tab: "available", badge: "12" },
      { icon: Package, label: "Active Jobs", href: "/logistics/dashboard", tab: "active" },
      { icon: History, label: "Job History", href: "/logistics/dashboard", tab: "history" },
    ],
  },
  {
    label: "Earnings",
    items: [
      { icon: DollarSign, label: "Earnings", href: "/logistics/dashboard", tab: "earnings" },
      { icon: Wallet, label: "Payouts", href: "/logistics/dashboard", tab: "earnings" },
    ],
  },
  {
    label: "Performance",
    items: [
      { icon: TrendingUp, label: "Performance", href: "/logistics/dashboard", tab: "performance" },
      { icon: Star, label: "Ratings", href: "/logistics/dashboard", tab: "performance" },
      { icon: BarChart3, label: "Analytics", href: "/logistics/dashboard", tab: "performance" },
    ],
  },
  {
    label: "Fuel",
    items: [
      { icon: Fuel, label: "Fuel Dashboard", href: "/logistics/fuel" },
      { icon: Route, label: "Profitability", href: "/logistics/fuel/profitability" },
      { icon: MapPin, label: "Fuel Stations", href: "/logistics/fuel" },
    ],
  },
  {
    label: "Platform",
    items: [
      { icon: Plug, label: "Integrations", href: "/logistics/dashboard", tab: "settings" },
      { icon: Key, label: "API Access", href: "/logistics/dashboard", tab: "settings" },
      { icon: ShieldCheck, label: "Insurance", href: "/logistics/dashboard", tab: "settings" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { icon: Box, label: "Boxes & Packaging", href: "/logistics/dashboard", tab: "settings" },
      { icon: ShoppingCart, label: "Products", href: "/logistics/dashboard", tab: "settings" },
      { icon: FileText, label: "Packing Slips", href: "/logistics/dashboard", tab: "settings" },
    ],
  },
  {
    label: "Account",
    items: [
      { icon: CircleUser, label: "Profile", href: "/logistics/dashboard", tab: "settings" },
      { icon: Bell, label: "Notifications", href: "/logistics/dashboard", tab: "settings" },
      { icon: Shield, label: "Security", href: "/logistics/dashboard", tab: "settings" },
      { icon: CreditCard, label: "Payout Method", href: "/logistics/dashboard", tab: "settings" },
    ],
  },
];

interface LogisticsPartnerShellProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function LogisticsPartnerShell({ children, activeTab, onTabChange }: LogisticsPartnerShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(
    NAV_SECTIONS.map((s) => s.label)
  );
  const [online, setOnline] = useState(true);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isLinkActive = (item: { href: string; tab?: string }) => {
    if (item.tab && onTabChange) {
      return activeTab === item.tab;
    }
    return pathname === item.href || pathname?.startsWith(item.href + "/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7FA]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 h-full bg-[#0A1628] text-white transition-all duration-300 flex flex-col
          ${mobileOpen ? "w-60 translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarOpen ? "lg:w-60" : "lg:w-16"}
          ${!mobileOpen && !sidebarOpen ? "lg:w-16" : ""}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 shrink-0">
          {sidebarOpen ? (
            <Link href="/logistics/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#FF6B00] rounded-lg flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight block leading-tight">KAUVEX</span>
                <span className="text-[9px] text-white/40 uppercase tracking-widest">Logistics Partner</span>
              </div>
            </Link>
          ) : (
            <Link href="/logistics/dashboard" className="flex items-center justify-center w-full">
              <div className="w-9 h-9 bg-[#FF6B00] rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
            </Link>
          )}
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileOpen(false);
              } else {
                setSidebarOpen(!sidebarOpen);
              }
            }}
            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${!sidebarOpen ? "hidden lg:flex" : ""}`}
          >
            {mobileOpen || sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Online Status */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-white/10">
            <button
              onClick={() => setOnline(!online)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                online
                  ? "bg-green-500/15 text-green-400 border border-green-500/20"
                  : "bg-red-500/15 text-red-400 border border-red-500/20"
              }`}
            >
              {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {online ? "Online — Accepting Jobs" : "Offline — Not Accepting"}
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {sidebarOpen && (
                <button
                  onClick={() => toggleSection(section.label)}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30 hover:text-white/50 transition-colors"
                >
                  <span>{section.label}</span>
                  {expandedSections.includes(section.label) ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              )}
              {(expandedSections.includes(section.label) || !sidebarOpen) &&
                section.items.map((item) => {
                  const isActive = isLinkActive(item);
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        if (item.tab && onTabChange) {
                          onTabChange(item.tab);
                        }
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 group ${
                        isActive
                          ? "bg-[#FF6B00] text-white font-medium"
                          : "text-white/60 hover:bg-white/8 hover:text-white"
                      }`}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <item.icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-white" : "text-white/50 group-hover:text-white"
                        }`}
                      />
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                      {sidebarOpen && item.badge && (
                        <span className="ml-auto bg-[#FF6B00] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>

        {/* Earnings Quick View */}
        {sidebarOpen && (
          <div className="px-3 py-3 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Today&apos;s Earnings</span>
                <span className="font-bold text-green-400">₦12,450</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Pending</span>
                <span className="font-bold text-[#FF6B00]">₦23,400</span>
              </div>
            </div>
          </div>
        )}

        {/* User Chip */}
        <div className="border-t border-white/10 p-2 shrink-0">
          <div className={`flex items-center gap-2.5 ${sidebarOpen ? "px-2" : "justify-center"} py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors`}>
            <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center text-white text-xs font-bold shrink-0">
              JD
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">John Doe</div>
                <div className="text-[10px] text-white/40 flex items-center gap-1">
                  <Truck className="w-2.5 h-2.5" /> Verified Partner
                </div>
              </div>
            )}
            {sidebarOpen && (
              <button className="p-1 text-white/30 hover:text-white/60">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center gap-2">
              <h1 className="font-semibold text-[15px] text-[#0F172A]">
                {activeTab === "available" && "Available Jobs"}
                {activeTab === "active" && "Active Jobs"}
                {activeTab === "history" && "Job History"}
                {activeTab === "earnings" && "Earnings"}
                {activeTab === "performance" && "Performance"}
                {activeTab === "fuel" && "Fuel & Profitability"}
                {activeTab === "settings" && "Settings"}
              </h1>
              <span className="text-xs text-[#94A3B8]">/ Overview</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-[#F5F7FA] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-sm text-[#94A3B8] cursor-text w-56">
              <Search className="w-3.5 h-3.5" />
              <span className="text-xs">Search jobs, earnings...</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6B00] rounded-full" />
            </button>

            {/* Rating Badge */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-semibold text-amber-700">4.9</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
