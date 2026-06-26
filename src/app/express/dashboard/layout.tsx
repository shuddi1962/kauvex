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
  BookOpen,
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
  History,
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
} from "lucide-react";

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
      { icon: Upload, label: "Bulk Upload", href: "/express/dashboard/ship?tab=bulk" },
      { icon: Repeat, label: "Recurring", href: "/express/dashboard/ship?tab=recurring" },
      { icon: FileText, label: "Templates", href: "/express/dashboard/ship?tab=templates" },
    ],
  },
  {
    label: "Track",
    items: [
      { icon: MapPin, label: "Active Shipments", href: "/express/track/map" },
      { icon: MapPin, label: "Live Map", href: "/express/track/map?view=map" },
      { icon: AlertTriangle, label: "Alerts", href: "/express/track/map?filter=alerts" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { icon: BarChart3, label: "Overview", href: "/express/analytics" },
      { icon: TrendingUp, label: "Trends", href: "/express/analytics?tab=trends" },
      { icon: DollarSign, label: "Cost Analysis", href: "/express/analytics?tab=cost" },
      { icon: Route, label: "Route Performance", href: "/express/analytics?tab=routes" },
      { icon: Clock, label: "Delivery Times", href: "/express/analytics?tab=delivery" },
      { icon: Leaf, label: "Carbon Footprint", href: "/express/analytics?tab=carbon" },
    ],
  },
  {
    label: "History",
    items: [
      { icon: History, label: "All Shipments", href: "/express/tracking/fleet" },
      { icon: RotateCcw, label: "Returns", href: "/express/returns" },
      { icon: Shield, label: "Claims", href: "/express/returns?tab=claims" },
      { icon: Receipt, label: "Invoices", href: "/express/returns?tab=invoices" },
    ],
  },
  {
    label: "Locker Points",
    items: [
      { icon: Search, label: "Find Lockers", href: "/express/dashboard/overview" },
      { icon: Bookmark, label: "My Bookings", href: "/express/dashboard/overview" },
    ],
  },
  { label: "Address Book", items: [{ icon: BookOpen, label: "Addresses", href: "/express/dashboard/overview" }] },
  {
    label: "Business",
    items: [
      { icon: Users, label: "Team", href: "/express/team" },
      { icon: CreditCard, label: "Billing", href: "/express/dashboard/overview" },
      { icon: Key, label: "API Keys", href: "/express/dashboard/overview" },
      { icon: Plug, label: "Integrations", href: "/express/dashboard/overview" },
    ],
  },
  {
    label: "Tools",
    items: [
      { icon: Fuel, label: "Fuel Tracker", href: "/express/fuel-tracker" },
      { icon: DollarSign, label: "Rate Calendar", href: "/express/rates/calendar" },
    ],
  },
  {
    label: "System",
    items: [{ icon: Settings, label: "Settings", href: "/express/dashboard/overview" }],
  },
];

function Fuel(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17" />
      <path d="M15 10h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2v0a2 2 0 0 0 2-2V9l-3-3" />
      <path d="M3 22h12" />
      <path d="M7 8v3" />
    </svg>
  );
}

export default function ExpressDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>(
    NAV_SECTIONS.map((s) => s.label)
  );

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 h-full bg-[#0A1628] text-white transition-all duration-300 flex flex-col ${
          sidebarOpen ? "w-64" : "w-0 lg:w-16"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 shrink-0">
          {sidebarOpen && (
            <Link href="/express/dashboard/overview" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Express</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
          {NAV_SECTIONS.map((section) => (
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
                  const isActive = pathname === item.href || pathname?.startsWith(item.href.split("?")[0] + "/");
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
                        isActive
                          ? "bg-[#FF6B00] text-white font-medium"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-white" : "text-white/60 group-hover:text-white"}`} />
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
              <p className="text-[11px] text-white/40">Kauvex Express v2.0</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search shipments, addresses, settings..."
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm w-80 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:bg-white transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-gray-200 px-1.5 py-0.5 rounded font-mono text-gray-500">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6B00] rounded-full" />
            </button>
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 bg-[#0A1628] rounded-full flex items-center justify-center text-white text-sm font-bold">
                JD
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-800">John Doe</p>
                <p className="text-xs text-gray-500">Business Account</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
