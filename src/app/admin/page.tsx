"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Package,
  BarChart3,
  Image,
  Shield,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  ShoppingBag,
  UserPlus,
  Activity,
  Palette,
  AlertTriangle,
  RefreshCw,
  Download,
} from "lucide-react";
import AdminShell from "@/components/admin/admin-shell";

const kpis = [
  { label: "Today's Revenue", value: "₦2,450,000", change: "+12.5%", trend: "up" as const, icon: DollarSign, color: "bg-blue-50 text-blue" },
  { label: "Orders Today", value: "47", change: "+8.3%", trend: "up" as const, icon: ShoppingBag, color: "bg-emerald-50 text-emerald-600" },
  { label: "New Customers", value: "23", change: "+15.2%", trend: "up" as const, icon: UserPlus, color: "bg-violet-50 text-violet-600" },
  { label: "Active Sessions", value: "142", change: "-3.1%", trend: "down" as const, icon: Eye, color: "bg-amber-50 text-amber-600" },
];

const recentOrders = [
  { id: "ORD-001247", customer: "John Okafor", amount: "₦345,000", status: "Processing", time: "5 min ago", avatar: "JO" },
  { id: "ORD-001246", customer: "Amina Bello", amount: "₦128,500", status: "Pending", time: "22 min ago", avatar: "AB" },
  { id: "ORD-001245", customer: "David Chen", amount: "₦2,450,000", status: "Shipped", time: "1 hr ago", avatar: "DC" },
  { id: "ORD-001244", customer: "Grace Nwankwo", amount: "₦67,800", status: "Delivered", time: "3 hrs ago", avatar: "GN" },
  { id: "ORD-001243", customer: "Emmanuel Ude", amount: "₦890,000", status: "Processing", time: "5 hrs ago", avatar: "EU" },
];

export default function AdminDashboard() {
  const statusColor = (status: string) => {
    switch (status) {
      case "Processing": return "bg-blue-50 text-blue-700";
      case "Pending": return "bg-amber-50 text-amber-700";
      case "Shipped": return "bg-violet-50 text-violet-700";
      case "Delivered": return "bg-emerald-50 text-emerald-700";
      default: return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <AdminShell title="Dashboard" subtitle="Welcome back, Admin">
      {/* Quick Date Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {["Today", "7 Days", "30 Days", "90 Days"].map((period, i) => (
            <button
              key={period}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                i === 0 ? "bg-blue text-white" : "bg-white text-text-3 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={13} /> Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-soft transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${
                  kpi.trend === "up" ? "text-emerald-600" : "text-red"
                }`}>
                  {kpi.trend === "up" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {kpi.change}
                </div>
              </div>
              <p className="font-bold text-2xl text-text-1 tracking-tight">{kpi.value}</p>
              <p className="text-xs text-text-4 mt-0.5">{kpi.label}</p>
              <div className="mt-3 h-8 bg-gray-50 rounded-lg flex items-end gap-[2px] px-2 pb-1.5">
                {[40, 65, 45, 70, 55, 80, 60, 90, 75, 85, 70, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-blue/15 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-sm text-text-1">Revenue Overview</h3>
              <p className="text-[11px] text-text-4 mt-0.5">Last 7 days performance</p>
            </div>
            <select className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[200px] bg-gray-50 rounded-lg flex items-end justify-between gap-2 px-4 pb-4 pt-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
              const h = [60, 75, 55, 85, 70, 90, 65][i];
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gradient-to-t from-blue to-blue-400 rounded-md transition-all hover:opacity-80 cursor-pointer" style={{ height: `${h}%` }} />
                  <span className="text-[10px] text-text-4 font-medium">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm text-text-1 mb-1">Orders by Status</h3>
          <p className="text-[11px] text-text-4 mb-5">Current order distribution</p>
          <div className="space-y-4">
            {[
              { status: "Pending", count: 12, color: "bg-amber-400", pct: 25 },
              { status: "Processing", count: 8, color: "bg-blue", pct: 17 },
              { status: "Shipped", count: 15, color: "bg-violet-500", pct: 31 },
              { status: "Delivered", count: 9, color: "bg-emerald-500", pct: 19 },
              { status: "Cancelled", count: 3, color: "bg-red", pct: 6 },
            ].map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-sm text-text-2">{item.status}</span>
                  </div>
                  <span className="text-sm font-semibold text-text-1">{item.count}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm text-text-1 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Add Product", icon: Package, href: "/admin/products", color: "bg-blue" },
              { label: "New Order", icon: ShoppingCart, href: "/admin/orders", color: "bg-emerald-600" },
              { label: "Banners", icon: Image, href: "/admin/banners", color: "bg-violet-600" },
              { label: "Homepage", icon: Palette, href: "/admin/homepage", color: "bg-red" },
              { label: "Reports", icon: BarChart3, href: "/admin/analytics", color: "bg-amber-600" },
              { label: "Roles", icon: Shield, href: "/admin/roles", color: "bg-navy" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 hover:shadow-soft transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className="text-[11px] font-medium text-text-2 text-center">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-text-1">Recent Orders</h3>
              <p className="text-[11px] text-text-4 mt-0.5">Latest customer orders</p>
            </div>
            <Link href="/admin/orders" className="text-xs text-blue hover:underline font-medium">View All</Link>
          </div>
          <div className="space-y-0">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-text-3">{order.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-1">{order.customer}</p>
                    <p className="text-[11px] text-text-4">{order.id} · {order.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text-1">{order.amount}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Current Visitors", value: "142", icon: Eye, color: "text-blue" },
          { label: "Active Chats", value: "8", icon: Activity, color: "text-emerald-600" },
          { label: "Orders (1hr)", value: "12", icon: ShoppingBag, color: "text-violet-600" },
          { label: "Revenue (1hr)", value: "₦485K", icon: DollarSign, color: "text-amber-600" },
        ].map((widget) => {
          const Icon = widget.icon;
          return (
            <div key={widget.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-soft transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                <Icon size={18} className={widget.color} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xl text-text-1 tracking-tight">{widget.value}</p>
                <p className="text-[11px] text-text-4 truncate">{widget.label}</p>
              </div>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Health Score Badge */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <AlertTriangle size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-1">Site Health Score: 94/100</p>
            <p className="text-[11px] text-text-4">All systems operational. Last check 3 min ago.</p>
          </div>
        </div>
        <Link href="/admin/site-doctor" className="text-xs text-blue font-medium hover:underline">
          View Details
        </Link>
      </div>
    </AdminShell>
  );
}
