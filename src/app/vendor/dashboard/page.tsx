"use client";

import { useState } from "react";
import Link from "next/link";
import VendorShell from "@/components/vendor/vendor-shell";
import {
  DollarSign, ShoppingCart, Package, TrendingUp, BarChart3, Settings,
  Store, Truck, Megaphone, Eye, Plus, CreditCard, Bell, Users,
  MessageSquare, Heart, Star, Shield, RefreshCw, Wallet,
  ChevronDown, Clock, Award, ArrowUp, ArrowDown, Zap,
} from "lucide-react";

const kpis = [
  { label: "Daily Sales", value: "₦284,500", change: "+12.3%", up: true, icon: DollarSign, color: "bg-emerald-100 text-emerald-700" },
  { label: "Weekly Sales", value: "₦1,890,000", change: "+8.7%", up: true, icon: TrendingUp, color: "bg-blue-100 text-blue" },
  { label: "Monthly Sales", value: "₦4,250,000", change: "+18.5%", up: true, icon: DollarSign, color: "bg-purple-100 text-purple-700" },
  { label: "Pending Orders", value: "23", change: "-5", up: false, icon: Clock, color: "bg-amber-100 text-amber-700" },
  { label: "Shipped Orders", value: "133", change: "+12", up: true, icon: Truck, color: "bg-green-100 text-green-700" },
  { label: "Returned Orders", value: "4", change: "-2", up: false, icon: RefreshCw, color: "bg-red-100 text-red-600" },
  { label: "Conversion Rate", value: "3.2%", change: "+0.4%", up: true, icon: TrendingUp, color: "bg-cyan-100 text-cyan-700" },
  { label: "Profit Margin", value: "34%", change: "+2.1%", up: true, icon: Wallet, color: "bg-teal-100 text-teal-700" },
];

const topProducts = [
  { name: "Marine GPS Navigator", sales: 234, revenue: "₦11,700,000", rating: 4.8 },
  { name: "Yacht Anchor Chain", sales: 189, revenue: "₦5,670,000", rating: 4.6 },
  { name: "LED Navigation Light", sales: 156, revenue: "₦2,340,000", rating: 4.9 },
  { name: "Marine VHF Radio", sales: 134, revenue: "₦4,020,000", rating: 4.7 },
  { name: "Boat Cover Heavy Duty", sales: 98, revenue: "₦2,940,000", rating: 4.5 },
];

const recentOrders = [
  { id: "ORD-2024-3841", customer: "John D.", items: 3, total: "₦234,500", status: "Shipped", date: "2h ago" },
  { id: "ORD-2024-3840", customer: "Sarah M.", items: 1, total: "₦89,000", status: "Pending", date: "4h ago" },
  { id: "ORD-2024-3839", customer: "TechCorp Ltd", items: 5, total: "₦567,000", status: "Processing", date: "6h ago" },
  { id: "ORD-2024-3838", customer: "MarinePro", items: 2, total: "₦178,000", status: "Delivered", date: "1d ago" },
];

const modules = [
  { label: "Revenue", icon: DollarSign, href: "/vendor/earnings", color: "bg-emerald-500", desc: "Daily, weekly, monthly earnings" },
  { label: "Orders", icon: ShoppingCart, href: "/vendor/orders", color: "bg-blue", desc: "Manage & fulfill orders" },
  { label: "Products", icon: Package, href: "/vendor/products", color: "bg-purple-600", desc: "Add & manage products" },
  { label: "Inventory", icon: BarChart3, href: "/vendor/products", color: "bg-cyan-600", desc: "Stock levels & alerts" },
  { label: "Returns", icon: RefreshCw, href: "/vendor/orders", color: "bg-orange", desc: "Returns & refunds" },
  { label: "Advertising", icon: Megaphone, href: "/vendor/advertising", color: "bg-pink-600", desc: "Campaigns & spend" },
  { label: "Analytics", icon: TrendingUp, href: "/vendor/analytics", color: "bg-teal-600", desc: "Performance reports" },
  { label: "Reviews", icon: Star, href: "/vendor/dashboard", color: "bg-amber-500", desc: "Customer feedback" },
  { label: "Messages", icon: MessageSquare, href: "/vendor/dashboard", color: "bg-indigo-600", desc: "Customer inbox" },
  { label: "Payments", icon: Wallet, href: "/vendor/earnings", color: "bg-green-600", desc: "Payouts & history" },
  { label: "Account Health", icon: Shield, href: "/vendor/dashboard", color: "bg-red-500", desc: "Performance metrics" },
  { label: "Subscription", icon: CreditCard, href: "/vendor/subscription", color: "bg-violet-600", desc: "Plan & billing" },
];

export default function VendorDashboard() {
  const [activeModule, setActiveModule] = useState("overview");

  return (
    <VendorShell title="Seller Central" subtitle="Manage your entire business from one dashboard">
      <div className="space-y-6">
        {/* Module Navigation */}
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button onClick={() => setActiveModule("overview")} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeModule === "overview" ? "bg-orange text-white" : "bg-gray-100 text-text-3 hover:bg-gray-200"
            }`}>Overview</button>
            {modules.map(m => {
              const Icon = m.icon;
              return (
                <Link key={m.label} href={m.href} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-text-3 hover:bg-gray-200 transition-all">
                  <Icon size={12} /> {m.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map(kpi => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center`}>
                    <Icon size={15} />
                  </div>
                  <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${kpi.up ? "text-green-600" : "text-red-500"}`}>
                    {kpi.up ? <ArrowUp size={10} /> : <ArrowDown size={10} />} {kpi.change}
                  </span>
                </div>
                <p className="font-bold text-lg text-text-1">{kpi.value}</p>
                <p className="text-[10px] text-text-4">{kpi.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top Selling Products */}
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm flex items-center gap-2 text-text-1">
                <Award size={15} className="text-orange" /> Top Selling
              </h3>
              <Link href="/vendor/products" className="text-[10px] text-orange font-semibold hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-text-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-1 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 text-[9px] text-text-4">
                      <span>{p.sales} sold</span>
                      <span>★ {p.rating}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-700">{p.revenue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm flex items-center gap-2 text-text-1">
                <ShoppingCart size={15} className="text-orange" /> Recent Orders
              </h3>
              <Link href="/vendor/orders" className="text-[10px] text-orange font-semibold hover:underline">View All</Link>
            </div>
            <div className="space-y-2">
              {recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-text-1 truncate">{o.customer}</p>
                      <span className={`text-[8px] px-1 py-0.5 rounded-full font-medium ${
                        o.status === "Shipped" ? "bg-green-100 text-green-700" :
                        o.status === "Delivered" ? "bg-blue-100 text-blue" :
                        o.status === "Processing" ? "bg-amber-100 text-amber-700" :
                        "bg-gray-100 text-text-4"
                      }`}>{o.status}</span>
                    </div>
                    <p className="text-[9px] text-text-4">{o.id} · {o.items} items · {o.date}</p>
                  </div>
                  <span className="text-xs font-bold text-text-1 ml-2">{o.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Account Health */}
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm flex items-center gap-2 text-text-1">
                <Shield size={15} className="text-orange" /> Account Health
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Order Defect Rate", value: "1.2%", target: "< 2%", status: "good" },
                { label: "Late Shipment Rate", value: "2.8%", target: "< 4%", status: "good" },
                { label: "Cancellation Rate", value: "0.5%", target: "< 2.5%", status: "good" },
                { label: "Customer Response", value: "98%", target: "> 90%", status: "good" },
                { label: "Return Rate", value: "3.1%", target: "< 5%", status: "at_risk" },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between text-xs">
                  <span className="text-text-4">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-1">{m.value}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                      m.status === "good" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>{m.target}</span>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "85%" }} />
                  </div>
                  <span className="text-[10px] font-bold text-green-700">85%</span>
                </div>
                <p className="text-[9px] text-text-4">Overall Health Score — Good standing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ad Spend & Store Followers */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm flex items-center gap-2 mb-4 text-text-1">
              <Megaphone size={15} className="text-orange" /> Ad Spend
            </h3>
            <div className="flex items-end gap-6">
              <div>
                <p className="text-2xl font-bold text-text-1">₦156,000</p>
                <p className="text-xs text-text-4">This month</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-4">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue" /> CPC: ₦450</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange" /> CPM: ₦12,500</span>
              </div>
            </div>
            <div className="mt-3 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-border">
              <span className="text-[10px] text-text-4">Ad performance chart</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm flex items-center gap-2 mb-4 text-text-1">
              <Heart size={15} className="text-orange" /> Store Followers
            </h3>
            <div className="flex items-end gap-6">
              <div>
                <p className="text-2xl font-bold text-text-1">1,247</p>
                <p className="text-xs text-text-4">Total followers</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
                <ArrowUp size={12} /> +12 this week
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {["Product Launch", "Flash Sale", "New Arrival"].map(alert => (
                <span key={alert} className="text-[9px] bg-gray-100 text-text-4 px-2 py-1 rounded-lg">{alert}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </VendorShell>
  );
}
