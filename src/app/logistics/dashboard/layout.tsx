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
  Clock,
  Fuel,
  BarChart3,
} from "lucide-react";
import { DashboardProvider, useDashboard } from "./dashboard-context";

const tabs = [
  { id: "available" as const, label: "Available Jobs", icon: ClipboardList, badge: "live" },
  { id: "active" as const, label: "My Active Jobs", icon: Package },
  { id: "history" as const, label: "Job History", icon: History },
  { id: "earnings" as const, label: "Earnings", icon: DollarSign },
  { id: "performance" as const, label: "Performance", icon: TrendingUp },
  { id: "fuel" as const, label: "Fuel Calculator", icon: Fuel },
  { id: "fleet" as const, label: "Fleet Management", icon: Truck },
  { id: "delivery-stats" as const, label: "Delivery Stats", icon: BarChart3 },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

const JOB_TYPE_FILTERS = [
  { id: "marketplace", label: "Marketplace", emoji: "🛒" },
  { id: "express", label: "Express", emoji: "⚡" },
  { id: "freight", label: "Freight", emoji: "🏗️" },
  { id: "corporate", label: "Corporate", emoji: "🏢" },
  { id: "locker", label: "Locker", emoji: "📍" },
  { id: "cold_chain", label: "Cold Chain", emoji: "❄️" },
  { id: "document", label: "Document", emoji: "📬" },
];

function DashboardSidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (v: boolean) => void }) {
  const { activeTab, setActiveTab } = useDashboard();
  const [online, setOnline] = useState(true);

  const quickEarnings = { today: 12450, week: 78200, pending: 23400 };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:sticky top-14 z-30 w-64 bg-white border-r border-border h-[calc(100vh-3.5rem)] transition-transform lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange to-orange-600 flex items-center justify-center text-white font-bold text-sm">
              JD
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-1">John Doe</h3>
              <p className="text-[10px] text-text-4 flex items-center gap-1">
                <Truck className="w-3 h-3" /> Rider · Verified
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
              <Wifi className="w-3 h-3" /> Online
            </span>
            <span className="px-2 py-0.5 bg-orange/10 text-orange rounded-full font-medium">4.9 ★</span>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive ? "bg-orange text-white font-medium shadow-sm" : "text-text-3 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge === "live" && (
                  <span className="ml-auto flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Job Type Filters */}
        {sidebarOpen && (
          <div className="px-3 py-2 border-t border-border">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-4 mb-2 px-3">Job Types</p>
            <div className="space-y-0.5">
              {JOB_TYPE_FILTERS.map(jt => (
                <div key={jt.id} className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <span>{jt.emoji}</span>
                  <span>{jt.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-2 text-xs">
              <span className="text-text-4">Today&apos;s Earnings</span>
              <span className="font-bold text-green-700">₦{quickEarnings.today.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-xs">
              <span className="text-text-4">Pending Payout</span>
              <span className="font-bold text-orange">₦{quickEarnings.pending.toLocaleString()}</span>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red hover:bg-red-50 rounded-lg transition-colors mt-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default function LogisticsDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [online, setOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-off-white">
        {/* Top Header */}
        <header className="bg-navy border-b border-white/10 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 text-white/60 hover:text-white">
                <LayoutDashboard className="w-5 h-5" />
              </button>
              <Link href="/logistics/dashboard" className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange" />
                <span className="text-white font-syne font-700 text-sm hidden sm:inline">Kauvex Logistics</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setOnline(!online)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  online ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {online ? "Online" : "Offline"}
              </button>

              <button className="relative p-1.5 text-white/60 hover:text-white transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange rounded-full" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange/20 text-orange flex items-center justify-center text-xs font-bold">
                  JD
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
