"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import VendorShell from "@/components/vendor/vendor-shell";
import { DollarSign, ShoppingCart, Package, TrendingUp, BarChart3, Settings, Store, Truck, Megaphone, Eye, Plus, CreditCard, Bell, Users, MessageSquare, Heart, Star, Shield, RefreshCw, Wallet, ChevronDown, Clock, Award, ArrowUp, ArrowDown, Zap, X, Sparkles, GraduationCap, Globe, MonitorSmartphone, Percent, AlertTriangle, Target, BookOpen, Lightbulb } from "lucide-react";

const kpis = [
  { label: "Daily Sales", value: "₦284,500", change: "+12.3%", up: true, icon: DollarSign, color: "bg-emerald-100 text-emerald-700" },
  { label: "Buy Box Win Rate", value: "78%", change: "+5.2%", up: true, icon: Target, color: "bg-blue-100 text-blue" },
  { label: "Out of Stock", value: "3", change: "", up: false, icon: AlertTriangle, color: "bg-red-100 text-red-600" },
  { label: "Total Balance", value: "₦1,234,500", change: "+18.5%", up: true, icon: Wallet, color: "bg-purple-100 text-purple-700" },
  { label: "Pending Orders", value: "23", change: "-5", up: false, icon: Clock, color: "bg-amber-100 text-amber-700" },
  { label: "Shipped Orders", value: "133", change: "+12", up: true, icon: Truck, color: "bg-green-100 text-green-700" },
  { label: "Days of Supply", value: "14.2", change: "+2.1", up: true, icon: Package, color: "bg-cyan-100 text-cyan-700" },
  { label: "Conversion Rate", value: "3.2%", change: "+0.4%", up: true, icon: TrendingUp, color: "bg-teal-100 text-teal-700" },
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

const quickActions = [
  { label: "Match Competitive Price", icon: Zap, color: "bg-orange/10 text-orange", desc: "3 products above Buy Box price", href: "/vendor/inventory" },
  { label: "Restock Now", icon: Package, color: "bg-red-100 text-red-600", desc: "2 products approaching stockout", href: "/vendor/inventory/replenishment-alerts" },
  { label: "Promote with Coupons", icon: Percent, color: "bg-green-100 text-green-700", desc: "Create a coupon campaign", href: "/vendor/promotions" },
  { label: "Create a Coupon", icon: Plus, color: "bg-purple-100 text-purple-700", desc: "Discount %, code, expiry", href: "/vendor/promotions" },
];

const growthOpportunities = [
  { label: "New Selection Recommendations", icon: Lightbulb, desc: "5 trending products in your category" },
  { label: "Global Product Demand", icon: Globe, desc: "Expand to UK, CA, AU storefronts" },
  { label: "Categories with Insights", icon: BarChart3, desc: "Category trend data available" },
  { label: "Add More Products", icon: Plus, desc: "Shortcut to product creation" },
];

const onboardingCards = [
  { label: "Free webinars to grow your store", icon: MonitorSmartphone, desc: "Learn from Kauvex experts" },
  { label: "Grow your business globally", icon: Globe, desc: "Expand to other storefronts" },
  { label: "Tutorials and Training", icon: GraduationCap, desc: "Kauvex Seller University" },
];

export default function VendorDashboard() {
  const [activeModule, setActiveModule] = useState("overview");
  const [dismissedCards, setDismissedCards] = useState<string[]>([]);
  const [couponModal, setCouponModal] = useState(false);

  const healthMetrics = [
    { label: "Order Defect Rate", value: "1.2%", target: "< 2%", status: "good" },
    { label: "Late Shipment Rate", value: "2.8%", target: "< 4%", status: "good" },
    { label: "Cancellation Rate", value: "0.5%", target: "< 2.5%", status: "good" },
    { label: "Customer Response", value: "98%", target: "> 90%", status: "good" },
    { label: "Return Rate", value: "3.1%", target: "< 5%", status: "at_risk" },
  ];

  const modules = [
    { label: "Revenue", icon: DollarSign, href: "/vendor/earnings", color: "bg-emerald-500", desc: "Daily, weekly, monthly earnings" },
    { label: "Orders", icon: ShoppingCart, href: "/vendor/orders", color: "bg-blue", desc: "Manage & fulfill orders" },
    { label: "Products", icon: Package, href: "/vendor/products", color: "bg-purple-600", desc: "Add & manage products" },
    { label: "Inventory", icon: BarChart3, href: "/vendor/inventory", color: "bg-cyan-600", desc: "Stock levels & alerts" },
    { label: "Returns", icon: RefreshCw, href: "/vendor/orders", color: "bg-orange", desc: "Returns & refunds" },
    { label: "Advertising", icon: Megaphone, href: "/vendor/advertising", color: "bg-pink-600", desc: "Campaigns & spend" },
    { label: "Analytics", icon: TrendingUp, href: "/vendor/analytics", color: "bg-teal-600", desc: "Performance reports" },
    { label: "Account Health", icon: Shield, href: "/vendor/account-health", color: "bg-red-500", desc: "Performance metrics" },
    { label: "University", icon: GraduationCap, href: "/vendor/university", color: "bg-indigo-600", desc: "Seller training" },
    { label: "B2B Central", icon: Store, href: "/vendor/b2b", color: "bg-violet-600", desc: "Wholesale selling" },
    { label: "Brand Registry", icon: Award, href: "/vendor/brand-registry", color: "bg-amber-500", desc: "Brand protection" },
    { label: "Reports", icon: BarChart3, href: "/vendor/reports", color: "bg-green-600", desc: "Sales & inventory reports" },
  ];

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

        {/* TOP STATUS BAR */}
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

        {/* QUICK ACTION CARDS */}
        <div className="grid lg:grid-cols-4 gap-3">
          {quickActions.map(qa => {
            const Icon = qa.icon;
            return (
              <Link key={qa.label} href={qa.href} className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${qa.color} flex items-center justify-center`}>
                    <Icon size={15} />
                  </div>
                  <span className="text-xs font-bold text-text-1 group-hover:text-orange transition-colors">{qa.label}</span>
                </div>
                <p className="text-[10px] text-text-4">{qa.desc}</p>
              </Link>
            );
          })}
        </div>

        {/* GROWTH OPPORTUNITIES */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-4 text-text-1">
            <Sparkles size={15} className="text-orange" /> Growth Opportunities
          </h3>
          <div className="grid lg:grid-cols-4 gap-3">
            {growthOpportunities.map(go => {
              const Icon = go.icon;
              return (
                <div key={go.label} className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange/10 hover:shadow-sm transition-all cursor-pointer">
                  <Icon size={18} className="text-orange mb-2" />
                  <p className="text-xs font-bold text-text-1 mb-1">{go.label}</p>
                  <p className="text-[10px] text-text-4">{go.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ONBOARDING / TUTORIAL CARDS */}
        {onboardingCards.filter(c => !dismissedCards.includes(c.label)).length > 0 && (
          <div className="grid lg:grid-cols-3 gap-3">
            {onboardingCards.map(card => {
              if (dismissedCards.includes(card.label)) return null;
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white rounded-xl border border-border p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text-1">{card.label}</p>
                    <p className="text-[10px] text-text-4">{card.desc}</p>
                  </div>
                  <button onClick={() => setDismissedCards(prev => [...prev, card.label])} className="p-1 hover:bg-gray-100 rounded shrink-0">
                    <X size={12} className="text-text-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Coupon Modal */}
        {couponModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setCouponModal(false)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Create a Coupon</h3>
                <button onClick={() => setCouponModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Discount %</label>
                  <input type="number" placeholder="10" className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Coupon Code</label>
                  <input placeholder="SUMMER10" className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Expiry Date</label>
                  <input type="date" className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Usage Limit</label>
                  <input type="number" placeholder="100" className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
                </div>
                <button className="w-full h-11 bg-orange text-white font-bold rounded-xl hover:bg-orange/90">Create Coupon</button>
              </div>
            </div>
          </div>
        )}

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
              <Link href="/vendor/account-health" className="text-[10px] text-orange font-semibold hover:underline">Details</Link>
            </div>
            <div className="space-y-3">
              {healthMetrics.map(m => (
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
      </div>
    </VendorShell>
  );
}
