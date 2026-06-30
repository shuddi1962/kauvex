"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2, Package, ShoppingCart, FileText, CreditCard, Users,
  TrendingUp, ArrowUp, ArrowDown, Clock, CheckCircle2, AlertCircle,
  BarChart3, Loader2, Search, Filter, ChevronRight, DollarSign,
  Truck, Globe, Star, Phone, Mail, MessageSquare
} from "lucide-react";

interface WholesaleStats {
  totalOrders: number;
  pendingOrders: number;
  totalSpent: string;
  outstandingBalance: string;
  creditLimit: string;
  creditUsed: string;
  netTermsDays: number;
  recentOrders: Array<{
    id: string;
    date: string;
    items: number;
    total: string;
    status: string;
  }>;
  topProducts: Array<{
    name: string;
    sku: string;
    lastPrice: string;
    units: number;
  }>;
}

const navItems = [
  { label: "Overview", href: "/wholesale/dashboard", icon: Building2 },
  { label: "Orders", href: "/wholesale/dashboard/orders", icon: ShoppingCart },
  { label: "Catalog", href: "/wholesale/dashboard/catalog", icon: Package },
  { label: "Quotes", href: "/wholesale/dashboard/quotes", icon: FileText },
  { label: "Invoices", href: "/wholesale/dashboard/invoices", icon: CreditCard },
  { label: "Account", href: "/wholesale/dashboard/account", icon: Users },
];

export default function WholesaleDashboard() {
  const [stats, setStats] = useState<WholesaleStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: "$0",
    outstandingBalance: "$0",
    creditLimit: "$0",
    creditUsed: "$0",
    netTermsDays: 30,
    recentOrders: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("Overview");

  useEffect(() => {
    setStats({
      totalOrders: 47,
      pendingOrders: 3,
      totalSpent: "$128,450",
      outstandingBalance: "$12,300",
      creditLimit: "$50,000",
      creditUsed: "$12,300",
      netTermsDays: 30,
      recentOrders: [
        { id: "WS-2847", date: "2026-06-28", items: 12, total: "$4,250", status: "delivered" },
        { id: "WS-2831", date: "2026-06-25", items: 8, total: "$2,800", status: "in_transit" },
        { id: "WS-2819", date: "2026-06-22", items: 24, total: "$8,900", status: "processing" },
        { id: "WS-2805", date: "2026-06-18", items: 6, total: "$1,950", status: "delivered" },
        { id: "WS-2798", date: "2026-06-15", items: 15, total: "$5,600", status: "delivered" },
      ],
      topProducts: [
        { name: "Hikvision 4CH DVR", sku: "CCTV-DVR-004", lastPrice: "$185", units: 48 },
        { name: "Solar Panel 300W Mono", sku: "SOL-PNL-300", lastPrice: "$120", units: 36 },
        { name: "Network Switch 24-Port", sku: "NET-SW-024", lastPrice: "$95", units: 30 },
        { name: "Fire Alarm Panel 8-Zone", sku: "FIRE-PNL-008", lastPrice: "$320", units: 18 },
        { name: "Access Control Terminal", sku: "ACC-TRS-001", lastPrice: "$245", units: 24 },
      ],
    });
    setLoading(false);
  }, []);

  const statusColors: Record<string, string> = {
    delivered: "bg-emerald-50 text-emerald-700",
    in_transit: "bg-blue-50 text-blue-700",
    processing: "bg-amber-50 text-amber-700",
    pending: "bg-gray-50 text-gray-600",
  };

  const creditPercent = stats.creditLimit !== "$0"
    ? (parseFloat(stats.creditUsed.replace(/[$,]/g, "")) / parseFloat(stats.creditLimit.replace(/[$,]/g, ""))) * 100
    : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-sm font-bold text-[#0A1628]">Wholesale Portal</h1>
          <p className="text-[10px] text-gray-500 mt-0.5">B2B Dashboard</p>
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
                    ? "bg-[#0A1628] text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#0A1628]"
                }`}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link href="/wholesale" className="flex items-center gap-2 text-[10px] text-gray-400 hover:text-gray-600">
            <Globe size={11} /> Back to Wholesale Info
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0A1628]">Welcome back, Business!</h2>
              <p className="text-xs text-gray-500">Here&apos;s your wholesale account overview.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/shop"
                className="px-4 py-2 bg-[#FF6B00] text-white text-xs font-semibold rounded-lg hover:bg-[#e55f00] transition-colors flex items-center gap-1.5"
              >
                <Package size={12} /> Browse Catalog
              </Link>
              <div className="w-8 h-8 rounded-full bg-[#0A1628] flex items-center justify-center">
                <span className="text-xs font-bold text-white">WS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "bg-blue-100 text-blue-600", sub: "All time" },
              { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "bg-amber-100 text-amber-700", sub: "Processing" },
              { label: "Total Spent", value: stats.totalSpent, icon: DollarSign, color: "bg-emerald-100 text-emerald-700", sub: "Lifetime" },
              { label: "Outstanding Balance", value: stats.outstandingBalance, icon: CreditCard, color: "bg-purple-100 text-purple-700", sub: `NET ${stats.netTermsDays}` },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-xl bg-white shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#0A1628]">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{card.sub}</p>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Credit Overview */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                  <CreditCard size={15} className="text-[#FF6B00]" /> Credit & Payment Overview
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-[10px] text-gray-500 uppercase">Credit Limit</p>
                    <p className="text-lg font-bold text-[#0A1628]">{stats.creditLimit}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-[10px] text-gray-500 uppercase">Credit Used</p>
                    <p className="text-lg font-bold text-[#0A1628]">{stats.creditUsed}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-[10px] text-gray-500 uppercase">Available</p>
                    <p className="text-lg font-bold text-emerald-600">
                      ${((parseFloat(stats.creditLimit.replace(/[$,]/g, "")) - parseFloat(stats.creditUsed.replace(/[$,]/g, "")))).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-500">Credit Utilization</span>
                    <span className="text-[10px] font-semibold text-[#0A1628]">{creditPercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${creditPercent > 80 ? "bg-red-500" : creditPercent > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${creditPercent}%` }}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">NET {stats.netTermsDays} payment terms &bull; Next payment due: Jul 15, 2026</p>
              </div>

              {/* Recent Orders */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#0A1628] flex items-center gap-2">
                    <ShoppingCart size={15} className="text-[#FF6B00]" /> Recent Orders
                  </h3>
                  <Link href="/wholesale/dashboard/orders" className="text-[10px] text-[#FF6B00] font-semibold hover:underline">View All</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase">Order</th>
                        <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase">Date</th>
                        <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase">Items</th>
                        <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase">Total</th>
                        <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-3 py-2.5 text-xs font-semibold text-[#0A1628]">{order.id}</td>
                          <td className="px-3 py-2.5 text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="px-3 py-2.5 text-xs text-gray-600">{order.items} items</td>
                          <td className="px-3 py-2.5 text-xs font-medium text-[#0A1628]">{order.total}</td>
                          <td className="px-3 py-2.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || "bg-gray-50 text-gray-600"}`}>
                              {order.status.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Top Products */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                  <Star size={15} className="text-[#FF6B00]" /> Frequently Ordered
                </h3>
                <div className="space-y-3">
                  {stats.topProducts.map((p) => (
                    <div key={p.sku} className="p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-[#0A1628]">{p.name}</p>
                        <p className="text-xs font-bold text-[#0A1628]">{p.lastPrice}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-gray-400">{p.sku}</p>
                        <p className="text-[10px] text-gray-500">{p.units} units ordered</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#0A1628] mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { label: "Request a Quote", href: "/quote", icon: FileText, color: "text-blue-600" },
                    { label: "Track Shipment", href: "/track-order", icon: Truck, color: "text-emerald-600" },
                    { label: "Contact Account Manager", href: "/contact", icon: Phone, color: "text-purple-600" },
                    { label: "Download Invoice", href: "#", icon: FileText, color: "text-amber-600" },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={action.label}
                        href={action.href}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <Icon size={14} className={action.color} />
                        <span className="text-xs font-medium text-gray-700 group-hover:text-[#0A1628]">{action.label}</span>
                        <ChevronRight size={12} className="text-gray-300 ml-auto group-hover:text-[#FF6B00]" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Account Manager */}
              <div className="rounded-xl bg-gradient-to-br from-[#0A1628] to-[#1a2a4a] p-5 text-white">
                <h3 className="text-sm font-bold mb-3">Your Account Manager</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Users size={16} className="text-white/80" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Adebayo O.</p>
                    <p className="text-[10px] text-white/50">Senior B2B Account Manager</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-white/70">
                  <div className="flex items-center gap-2"><Mail size={11} /> adebayo@kauvex.com</div>
                  <div className="flex items-center gap-2"><Phone size={11} /> +234 801 234 5678</div>
                </div>
                <Link href="/contact" className="mt-3 w-full block text-center py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors">
                  Send Message
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
