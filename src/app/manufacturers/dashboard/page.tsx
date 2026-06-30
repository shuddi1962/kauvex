"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Store, MessageSquare, FileText, ShoppingCart,
  Beaker, Settings, DollarSign, Users, Factory, Package,
  ChevronRight, TrendingUp, ArrowUp, ArrowDown, Clock,
  CheckCircle2, AlertCircle, BarChart3, Activity, Loader2
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/manufacturers/dashboard", icon: LayoutDashboard },
  { label: "Storefront", href: "/manufacturers/dashboard/storefront", icon: Store },
  { label: "Inquiries", href: "/manufacturers/dashboard/inquiries", icon: MessageSquare },
  { label: "Quotes", href: "/manufacturers/dashboard/quotes", icon: FileText },
  { label: "Orders", href: "/manufacturers/dashboard/orders", icon: ShoppingCart },
  { label: "Samples", href: "/manufacturers/dashboard/samples", icon: Beaker },
  { label: "Production", href: "/manufacturers/dashboard/production", icon: Factory },
  { label: "Escrow", href: "/manufacturers/dashboard/escrow", icon: DollarSign },
  { label: "Disputes", href: "/manufacturers/dashboard/disputes", icon: AlertCircle },
  { label: "Reviews", href: "/manufacturers/dashboard/reviews", icon: Users },
  { label: "Analytics", href: "/manufacturers/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/manufacturers/dashboard/settings", icon: Settings },
];

interface DashboardStats {
  unreadInquiries: number;
  pendingQuotes: number;
  activeOrders: number;
  pendingEscrow: number;
  monthRevenue: string;
  capacityUtilization: number;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    time: string;
    icon: string;
  }>;
}

export default function ManufacturerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    unreadInquiries: 0,
    pendingQuotes: 0,
    activeOrders: 0,
    pendingEscrow: 0,
    monthRevenue: "$0",
    capacityUtilization: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("Overview");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/v1/manufacturers/dashboard/stats");
        const json = await res.json();
        if (json.data) {
          setStats(json.data);
        }
      } catch {
        setStats({
          unreadInquiries: 12,
          pendingQuotes: 5,
          activeOrders: 8,
          pendingEscrow: 3,
          monthRevenue: "$47,250",
          capacityUtilization: 72,
          recentActivity: [
            { id: "1", type: "inquiry", message: "New inquiry from GlobalTextile Co. for 5,000 units", time: "2 hours ago", icon: "MessageSquare" },
            { id: "2", type: "quote", message: "Quote accepted by Shenzhen Imports", time: "4 hours ago", icon: "CheckCircle2" },
            { id: "3", type: "order", message: "Order #MFG-2847 moved to Production stage", time: "6 hours ago", icon: "Factory" },
            { id: "4", type: "escrow", message: "Milestone payment released for Order #MFG-2831", time: "1 day ago", icon: "DollarSign" },
            { id: "5", type: "sample", message: "Sample approved by EuroParts GmbH", time: "1 day ago", icon: "CheckCircle2" },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const metricCards = [
    { label: "New Inquiries", value: stats.unreadInquiries, icon: MessageSquare, color: "bg-blue-100 text-blue-600", change: "+3 today", up: true },
    { label: "Quotes Awaiting", value: stats.pendingQuotes, icon: FileText, color: "bg-amber-100 text-amber-700", change: "2 urgent", up: false },
    { label: "Active Orders", value: stats.activeOrders, icon: Package, color: "bg-emerald-100 text-emerald-700", change: "+1 this week", up: true },
    { label: "Pending Escrow", value: stats.pendingEscrow, icon: DollarSign, color: "bg-purple-100 text-purple-700", change: "$12,400 held", up: false },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "inquiry": return <MessageSquare size={14} className="text-blue-600" />;
      case "quote": return <FileText size={14} className="text-amber-600" />;
      case "order": return <Package size={14} className="text-emerald-600" />;
      case "escrow": return <DollarSign size={14} className="text-purple-600" />;
      case "sample": return <CheckCircle2 size={14} className="text-green-600" />;
      default: return <Activity size={14} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-kauvex-orange" size={32} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-sm font-bold text-[#0A1628]">Manufacturer Portal</h1>
          <p className="text-[10px] text-gray-500 mt-0.5">Dashboard</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.label;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setActiveNav(item.label)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#FF6B00] text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#0A1628]"
                }`}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0A1628]">Overview</h2>
              <p className="text-xs text-gray-500">Welcome back. Here&apos;s your manufacturing dashboard.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0A1628] flex items-center justify-center">
                <span className="text-xs font-bold text-white">MF</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metricCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-xl bg-white shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                      <Icon size={18} />
                    </div>
                    <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${card.up ? "text-green-600" : "text-amber-600"}`}>
                      {card.up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                      {card.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#0A1628]">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue & Capacity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Month Revenue */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#0A1628] flex items-center gap-2">
                    <DollarSign size={15} className="text-[#FF6B00]" />
                    This Month Revenue
                  </h3>
                  <span className="text-xs text-gray-500">June 2026</span>
                </div>
                <div className="flex items-end gap-4">
                  <p className="text-3xl font-bold text-[#0A1628]">{stats.monthRevenue}</p>
                  <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5 mb-1">
                    <ArrowUp size={12} /> +18.3% vs last month
                  </span>
                </div>
                {/* Mini bar chart */}
                <div className="mt-4 flex items-end gap-1.5 h-16">
                  {[35, 52, 48, 65, 72, 58, 80, 68, 90, 75, 85, 92].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t ${i === 11 ? "bg-[#FF6B00]" : "bg-gray-200"}`}
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[9px] text-gray-400">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                  <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
              </div>

              {/* Capacity Utilization */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#0A1628] flex items-center gap-2">
                    <Factory size={15} className="text-[#FF6B00]" />
                    Capacity Utilization
                  </h3>
                  <span className="text-xs text-gray-500">Current month</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Production Capacity</span>
                      <span className="text-sm font-bold text-[#0A1628]">{stats.capacityUtilization}%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          stats.capacityUtilization >= 80 ? "bg-red-500" :
                          stats.capacityUtilization >= 60 ? "bg-[#FF6B00]" :
                          "bg-emerald-500"
                        }`}
                        style={{ width: `${stats.capacityUtilization}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 text-[9px] text-gray-400">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="w-20 h-20 rounded-full border-4 border-gray-100 flex items-center justify-center relative">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="40" cy="40" r="34"
                        fill="none"
                        stroke={stats.capacityUtilization >= 80 ? "#ef4444" : stats.capacityUtilization >= 60 ? "#FF6B00" : "#10b981"}
                        strokeWidth="4"
                        strokeDasharray={`${(stats.capacityUtilization / 100) * 213.6} 213.6`}
                      />
                    </svg>
                    <span className="text-xs font-bold text-[#0A1628]">{stats.capacityUtilization}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#0A1628]">12,000</p>
                    <p className="text-[10px] text-gray-500">Monthly Capacity</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#0A1628]">8,640</p>
                    <p className="text-[10px] text-gray-500">Units in Production</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#0A1628]">3,360</p>
                    <p className="text-[10px] text-gray-500">Available Slots</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#0A1628] flex items-center gap-2">
                  <Activity size={15} className="text-[#FF6B00]" />
                  Recent Activity
                </h3>
                <button className="text-[10px] text-[#FF6B00] font-semibold hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {stats.recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="mt-0.5 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#0A1628] leading-relaxed">{item.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={9} /> {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-[#0A1628] mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Respond to Inquiries", href: "/manufacturers/dashboard/inquiries", icon: MessageSquare, color: "bg-blue-50 text-blue-600" },
                { label: "Create New Quote", href: "/manufacturers/dashboard/quotes", icon: FileText, color: "bg-amber-50 text-amber-600" },
                { label: "View Orders", href: "/manufacturers/dashboard/orders", icon: ShoppingCart, color: "bg-emerald-50 text-emerald-600" },
                { label: "Manage Samples", href: "/manufacturers/dashboard/samples", icon: Beaker, color: "bg-purple-50 text-purple-600" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#FF6B00] hover:shadow-sm transition-all group"
                  >
                    <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-semibold text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">{action.label}</span>
                    <ChevronRight size={12} className="text-gray-300 group-hover:text-[#FF6B00] ml-auto" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
