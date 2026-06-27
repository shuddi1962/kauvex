"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Send,
  MapPin,
  BarChart3,
  Clock,
  Package,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Zap,
  Upload,
  Repeat,
  FileText,
  Bell,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Route,
  Leaf,
  RotateCcw,
  Shield,
  Receipt,
  Search,
  Bookmark,
  Building2,
  CreditCard,
  Key,
  Plug,
  UserPlus,
  ChevronUp,
  Map,
  PackageCheck,
  MessageSquareWarning,
  Layers,
  Briefcase,
  Paintbrush,
  CircleUser,
  Globe,
  MapPinned,
  History,
  Fuel,
} from "lucide-react";

const TIER_BADGES: Record<string, { label: string; color: string }> = {
  personal: { label: "Personal", color: "bg-gray-200 text-gray-700" },
  business_bronze: { label: "Business Bronze", color: "bg-amber-100 text-amber-700" },
  business_silver: { label: "Business Silver", color: "bg-gray-100 text-gray-600" },
  business_gold: { label: "Business Gold", color: "bg-yellow-100 text-yellow-700" },
  business_platinum: { label: "Business Platinum", color: "bg-purple-100 text-purple-700" },
  enterprise: { label: "Enterprise", color: "bg-[#0A1628] text-white" },
};

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/express/dashboard/overview" },
    ],
  },
  {
    label: "Ship",
    items: [
      { icon: Send, label: "Quick Ship", href: "/express/dashboard/ship" },
      { icon: Upload, label: "Bulk Upload", href: "/express/dashboard/bulk-upload" },
      { icon: Repeat, label: "Recurring Shipments", href: "/express/dashboard/recurring" },
      { icon: FileText, label: "Saved Templates", href: "/express/dashboard/templates" },
    ],
  },
  {
    label: "Track",
    items: [
      { icon: PackageCheck, label: "Active Shipments", href: "/express/track" },
      { icon: Map, label: "Shipment Map (live)", href: "/express/track/map" },
      { icon: Bell, label: "Delivery Alerts", href: "/express/track/alerts" },
    ],
  },
  {
    label: "Fuel",
    items: [
      { icon: Fuel, label: "Fuel Dashboard", href: "/express/fuel" },
      { icon: MapPin, label: "Fuel Stations", href: "/express/fuel-stations" },
      { icon: Route, label: "Route Impact", href: "/express/fuel/route-impact" },
      { icon: DollarSign, label: "Cost Planner", href: "/express/fuel/cost-planner" },
      { icon: History, label: "Fuel History", href: "/express/fuel/history" },
      { icon: Bell, label: "Price Alerts", href: "/express/fuel/alerts" },
      { icon: TrendingUp, label: "Fuel Tracker", href: "/express/fuel-tracker" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { icon: BarChart3, label: "Overview", href: "/express/analytics" },
      { icon: TrendingUp, label: "Shipment Trends", href: "/express/analytics#trends" },
      { icon: DollarSign, label: "Cost Analysis", href: "/express/analytics#cost" },
      { icon: Route, label: "Route Performance", href: "/express/analytics#routes" },
      { icon: Clock, label: "Delivery Success", href: "/express/analytics#delivery" },
      { icon: Leaf, label: "Carbon Footprint", href: "/express/analytics#carbon" },
    ],
  },
  {
    label: "History",
    items: [
      { icon: History, label: "All Shipments", href: "/express/history" },
      { icon: RotateCcw, label: "Returns", href: "/express/returns" },
      { icon: Shield, label: "Claims", href: "/express/claims" },
      { icon: Receipt, label: "Invoices", href: "/express/invoices" },
    ],
  },
  {
    label: "Lockers",
    items: [
      { icon: Search, label: "Find a Locker", href: "/express/lockers/map" },
      { icon: Bookmark, label: "My Locker Bookings", href: "/express/lockers" },
      { icon: Layers, label: "Locker History", href: "/express/lockers/history" },
    ],
  },
  {
    label: "Address Book",
    items: [
      { icon: CircleUser, label: "Saved Contacts", href: "/express/address-book/contacts" },
      { icon: MapPinned, label: "Frequent Destinations", href: "/express/address-book/destinations" },
    ],
  },
  {
    label: "Business",
    showForTier: ["business_bronze", "business_silver", "business_gold", "business_platinum", "enterprise"],
    items: [
      { icon: Users, label: "Team Members", href: "/express/team" },
      { icon: CreditCard, label: "Billing", href: "/express/billing" },
      { icon: Key, label: "API Keys", href: "/express/api-keys" },
      { icon: Plug, label: "Integrations", href: "/express/integrations" },
      { icon: Paintbrush, label: "Custom Branding", href: "/express/branding" },
    ],
  },
  {
    label: "Settings",
    items: [
      { icon: CircleUser, label: "Profile", href: "/express/settings/profile" },
      { icon: Bell, label: "Notifications", href: "/express/settings/notifications" },
      { icon: CreditCard, label: "Payment Methods", href: "/express/settings/payments" },
      { icon: Shield, label: "Security", href: "/express/settings/security" },
    ],
  },
];

export default function ExpressDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(
    NAV_SECTIONS.map((s) => s.label)
  );
  const [accountTier] = useState<string>("business_silver");

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const tierBadge = TIER_BADGES[accountTier] || TIER_BADGES.personal;

  const isLinkActive = (href: string) => {
    if (href.includes("#")) {
      const base = href.split("#")[0];
      return pathname === base;
    }
    return pathname === href || pathname?.startsWith(href + "/");
  };

  const visibleSections = NAV_SECTIONS.filter(
    (section) => !section.showForTier || section.showForTier.includes(accountTier)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
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
          ${mobileOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarOpen ? "lg:w-64" : "lg:w-16"}
          ${!mobileOpen && !sidebarOpen ? "lg:w-16" : ""}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 shrink-0">
          {sidebarOpen ? (
            <Link href="/express/dashboard/overview" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">KAUVEX EXPRESS</span>
            </Link>
          ) : (
            <Link href="/express/dashboard/overview" className="flex items-center justify-center w-full">
              <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
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
            {mobileOpen || sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
          {visibleSections.map((section) => (
            <div key={section.label}>
              {sidebarOpen && (
                <button
                  onClick={() => toggleSection(section.label)}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40 hover:text-white/60 transition-colors"
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
                  const isActive = isLinkActive(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
                        isActive
                          ? "bg-[#FF6B00] text-white font-medium"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <item.icon
                        className={`w-4.5 h-4.5 shrink-0 ${
                          isActive ? "text-white" : "text-white/60 group-hover:text-white"
                        }`}
                      />
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  );
                })}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        {sidebarOpen && (
          <div className="border-t border-white/10 p-4 shrink-0">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-white/80">All Systems Online</span>
              </div>
              <p className="text-[11px] text-white/40">Kauvex Express v2.2</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-[#0A1628] border-b border-white/10 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-sm tracking-tight hidden xl:inline">
                KAUVEX EXPRESS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Country / currency selector */}
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-white text-sm">
              <Globe className="w-4 h-4" />
              <span>NGN</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6B00] rounded-full" />
            </button>

            {/* Account */}
            <div className="flex items-center gap-2 ml-1 pl-3 border-l border-white/10">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white text-sm font-bold">
                JD
              </div>
              <div className="hidden md:flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white leading-tight">John Doe</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 w-fit ${tierBadge.color}`}>
                    {tierBadge.label}
                  </span>
                </div>
              </div>
            </div>

            {/* New Shipment CTA */}
            <Link
              href="/express/book"
              className="ml-2 bg-[#FF6B00] hover:bg-[#e55f00] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">New Shipment</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
