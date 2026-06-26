"use client";

import { useState, useEffect } from "react";
import {
  Package, DollarSign, TrendingUp, Clock, Users, Lock,
  MapPin, Truck, Eye, Search, Filter, Download, MoreHorizontal,
  ArrowUpRight, ArrowDownRight, Zap, BarChart3, CheckCircle,
  AlertTriangle, Plus, ExternalLink, RefreshCw, ChevronDown,
  Settings,
} from "lucide-react";

const shipments = [
  { id: "1", waybill: "KX-EX-10001", sender: "Chidi Okafor", receiver: "Amina Bello", from: "Lagos", to: "Abuja", service: "express", status: "delivered", amount: 12500, weight: "2.3kg", date: "2026-06-23", time: "10:30" },
  { id: "2", waybill: "KX-EX-10002", sender: "Tunde Adeyemi", receiver: "Grace Eze", from: "Port Harcourt", to: "Lagos", service: "standard", status: "in_transit", amount: 8500, weight: "1.1kg", date: "2026-06-23", time: "14:00" },
  { id: "3", waybill: "KX-EX-10003", sender: "Kunle Ajayi", receiver: "Musa Abdullahi", from: "Abuja", to: "Kano", service: "same_day", status: "out_for_delivery", amount: 18000, weight: "4.5kg", date: "2026-06-23", time: "07:00" },
  { id: "4", waybill: "KX-EX-10004", sender: "Blessing Okonkwo", receiver: "Emeka Nwachukwu", from: "Lagos", to: "Port Harcourt", service: "economy", status: "picked_up", amount: 6500, weight: "0.8kg", date: "2026-06-23", time: "09:00" },
  { id: "5", waybill: "KX-EX-10005", sender: "Ngozi Eze", receiver: "Yusuf Hassan", from: "Warri", to: "Benin", service: "express", status: "pending", amount: 11000, weight: "3.2kg", date: "2026-06-23", time: "08:30" },
  { id: "6", waybill: "KX-EX-10006", sender: "Adaeze Chukwu", receiver: "Ibrahim Musa", from: "Lagos", to: "Abuja", service: "same_day", status: "delivered", amount: 22000, weight: "5.1kg", date: "2026-06-23", time: "06:15" },
  { id: "7", waybill: "KX-EX-10007", sender: "Emeka Obi", receiver: "Fatima Bello", from: "Enugu", to: "Lagos", service: "standard", status: "in_transit", amount: 9200, weight: "2.0kg", date: "2026-06-23", time: "11:45" },
  { id: "8", waybill: "KX-EX-10008", sender: "Amina Yusuf", receiver: "Chukwuemeka O.", from: "Kano", to: "Lagos", service: "express", status: "delivered", amount: 14500, weight: "1.8kg", date: "2026-06-22", time: "16:20" },
  { id: "9", waybill: "KX-EX-10009", sender: "Tola Adebayo", receiver: "Ngozi Okafor", from: "Lagos", to: "Ibadan", service: "economy", status: "cancelled", amount: 5500, weight: "0.5kg", date: "2026-06-22", time: "13:00" },
  { id: "10", waybill: "KX-EX-10010", sender: "Yemi Oladipo", receiver: "Blessing Amadi", from: "Abuja", to: "PH", service: "standard", status: "pending", amount: 10000, weight: "2.7kg", date: "2026-06-23", time: "09:15" },
];

const serviceConfig: Record<string, { label: string; color: string; bg: string }> = {
  economy: { label: "Economy", color: "text-gray-400", bg: "bg-gray-400/10" },
  standard: { label: "Standard", color: "text-blue", bg: "bg-blue/10" },
  express: { label: "Express", color: "text-orange", bg: "bg-orange/10" },
  same_day: { label: "Same Day", color: "text-green", bg: "bg-green/10" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "text-gray-400", bg: "bg-gray-400/10", icon: Clock },
  picked_up: { label: "Picked Up", color: "text-blue", bg: "bg-blue/10", icon: Package },
  in_transit: { label: "In Transit", color: "text-yellow", bg: "bg-yellow/10", icon: Truck },
  out_for_delivery: { label: "Out for Delivery", color: "text-orange", bg: "bg-orange/10", icon: MapPin },
  delivered: { label: "Delivered", color: "text-green", bg: "bg-green/10", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red", bg: "bg-red/10", icon: AlertTriangle },
};

const businessAccounts = [
  { id: "BA-001", name: "TechPro Solutions Ltd", contact: "Chidi Okafor", shipments: 234, monthlySpend: 2890000, status: "active", tier: "enterprise" },
  { id: "BA-002", name: "Global Security Systems", contact: "Tunde Adeyemi", shipments: 189, monthlySpend: 2100000, status: "active", tier: "business" },
  { id: "BA-003", name: "SunPower Electronics", contact: "Kunle Ajayi", shipments: 156, monthlySpend: 1780000, status: "active", tier: "business" },
  { id: "BA-004", name: "Abuja Solar Distributors", contact: "Musa Abdullahi", shipments: 98, monthlySpend: 1200000, status: "active", tier: "standard" },
  { id: "BA-005", name: "PH Marine Supplies", contact: "Grace Eze", shipments: 67, monthlySpend: 890000, status: "inactive", tier: "standard" },
];

const lockerStats = [
  { id: "LAG-01", name: "Lagos Island Hub", total: 48, occupied: 44, available: 4, utilization: 92 },
  { id: "LAG-02", name: "Lagos Mainland Hub", total: 36, occupied: 28, available: 8, utilization: 78 },
  { id: "ABJ-01", name: "Abuja Central Hub", total: 32, occupied: 25, available: 7, utilization: 78 },
  { id: "PHC-01", name: "PH Hub", total: 24, occupied: 11, available: 13, utilization: 46 },
];

const pricingTiers = [
  { name: "Economy", base: 1500, perKg: 200, min: 1500, max: 8000, sla: "3-5 days" },
  { name: "Standard", base: 2500, perKg: 350, min: 2500, max: 15000, sla: "2-3 days" },
  { name: "Express", base: 4000, perKg: 600, min: 4000, max: 25000, sla: "1-2 days" },
  { name: "Same Day", base: 6000, perKg: 1000, min: 6000, max: 40000, sla: "Same day" },
];

export default function AdminExpressManagementPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "shipments" | "accounts" | "lockers" | "pricing">("overview");
  const [filterService, setFilterService] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const totalShipments = shipments.length;
  const totalRevenue = shipments.reduce((sum, s) => sum + s.amount, 0);
  const activeShipments = shipments.filter((s) => ["picked_up", "in_transit", "out_for_delivery"].includes(s.status)).length;
  const deliveredCount = shipments.filter((s) => s.status === "delivered").length;

  const filteredShipments = shipments.filter((s) => {
    if (filterService !== "all" && s.service !== filterService) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (searchQuery && !s.waybill.toLowerCase().includes(searchQuery.toLowerCase()) && !s.sender.toLowerCase().includes(searchQuery.toLowerCase()) && !s.receiver.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-gray-900/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-orange/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-orange" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Kauvex Express Management</h1>
              <p className="text-[10px] text-white/40 mt-0.5">Manage shipments, business accounts, lockers, and pricing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 text-xs">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange text-white text-xs font-medium">
              <Plus className="h-3.5 w-3.5" />
              New Shipment
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex items-center gap-1 border-b border-white/10 -mb-4">
          {(["overview", "shipments", "accounts", "lockers", "pricing"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-medium capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-orange text-orange"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              {tab === "overview" && <BarChart3 className="inline h-3.5 w-3.5 mr-1.5" />}
              {tab === "shipments" && <Package className="inline h-3.5 w-3.5 mr-1.5" />}
              {tab === "accounts" && <Users className="inline h-3.5 w-3.5 mr-1.5" />}
              {tab === "lockers" && <Lock className="inline h-3.5 w-3.5 mr-1.5" />}
              {tab === "pricing" && <DollarSign className="inline h-3.5 w-3.5 mr-1.5" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Shipments", value: "2,847", change: "+12.3%", up: true, icon: Package, color: "text-orange" },
                { label: "Revenue (MTD)", value: "$28,475", change: "+18.2%", up: true, icon: DollarSign, color: "text-green" },
                { label: "Active in Transit", value: "342", change: "+5.1%", up: true, icon: Truck, color: "text-blue" },
                { label: "Avg Delivery Time", value: "42min", change: "-3min", up: false, icon: Clock, color: "text-cyan-400" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/5 border border-white/10 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-9 w-9 rounded-lg ${stat.color === "text-orange" ? "bg-orange/10" : stat.color === "text-green" ? "bg-green/10" : stat.color === "text-blue" ? "bg-blue/10" : "bg-cyan-400/10"} flex items-center justify-center`}>
                      <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${stat.up ? "text-green" : "text-red"}`}>
                      {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Service breakdown + Recent shipments */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 rounded-xl bg-white/5 border border-white/10 p-5">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Recent Shipments</h3>
                <div className="space-y-2">
                  {shipments.slice(0, 6).map((s) => {
                    const st = statusConfig[s.status];
                    const sv = serviceConfig[s.service];
                    return (
                      <div key={s.id} className="flex items-center gap-4 rounded-lg bg-white/5 px-4 py-3 hover:bg-white/8 transition-colors">
                        <div className="w-24">
                          <div className="text-xs font-mono font-bold text-white">{s.waybill}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-white/80">{s.sender} → {s.receiver}</div>
                          <div className="text-[10px] text-white/40">{s.from} → {s.to}</div>
                        </div>
                        <div className={`rounded px-2 py-0.5 text-[10px] font-medium ${sv.bg} ${sv.color}`}>{sv.label}</div>
                        <div className={`flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-medium ${st.bg} ${st.color}`}>
                          <st.icon className="h-3 w-3" />
                          {st.label}
                        </div>
                        <div className="text-xs font-bold text-white w-20 text-right">₦{s.amount.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                  <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Service Mix</h3>
                  <div className="space-y-3">
                    {Object.entries(serviceConfig).map(([key, cfg]) => {
                      const count = shipments.filter((s) => s.service === key).length;
                      const pct = Math.round((count / shipments.length) * 100);
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className={cfg.color}>{cfg.label}</span>
                            <span className="text-white/50">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${cfg.color === "text-orange" ? "bg-orange" : cfg.color === "text-green" ? "bg-green" : cfg.color === "text-blue" ? "bg-blue" : "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                  <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Status Summary</h3>
                  <div className="space-y-2">
                    {Object.entries(statusConfig).map(([key, cfg]) => {
                      const count = shipments.filter((s) => s.status === key).length;
                      if (count === 0) return null;
                      return (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <cfg.icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                            <span className="text-white/60">{cfg.label}</span>
                          </div>
                          <span className="font-bold text-white">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shipments Tab */}
        {activeTab === "shipments" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search waybill, sender, receiver..."
                  className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-orange/50"
                />
              </div>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="all">All Services</option>
                <option value="economy">Economy</option>
                <option value="standard">Standard</option>
                <option value="express">Express</option>
                <option value="same_day">Same Day</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span className="text-xs text-white/30 ml-auto">{filteredShipments.length} results</span>
            </div>

            {/* Table */}
            <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Waybill</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Route</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Sender</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Receiver</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Service</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Weight</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.map((s) => {
                    const st = statusConfig[s.status];
                    const sv = serviceConfig[s.service];
                    return (
                      <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono font-bold text-orange">{s.waybill}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-white/80">{s.from} → {s.to}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-white/70">{s.sender}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-white/70">{s.receiver}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${sv.bg} ${sv.color}`}>{sv.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium ${st.bg} ${st.color}`}>
                            <st.icon className="h-3 w-3" />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-white">₦{s.amount.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-white/50">{s.weight}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Business Accounts Tab */}
        {activeTab === "accounts" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Business Accounts ({businessAccounts.length})</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange text-white text-xs font-medium">
                <Plus className="h-3.5 w-3.5" />
                Add Account
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {businessAccounts.map((account) => (
                <div key={account.id} className="flex items-center gap-6 rounded-xl bg-white/5 border border-white/10 px-6 py-4 hover:bg-white/8 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-orange/10 flex items-center justify-center text-sm font-bold text-orange">
                    {account.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{account.name}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${
                        account.tier === "enterprise" ? "bg-yellow/10 text-yellow" : account.tier === "business" ? "bg-blue/10 text-blue" : "bg-white/10 text-white/50"
                      }`}>{account.tier}</span>
                    </div>
                    <div className="text-[10px] text-white/40 mt-0.5">{account.id} — Contact: {account.contact}</div>
                  </div>
                  <div className="text-right w-24">
                    <div className="text-xs font-bold text-white">{account.shipments}</div>
                    <div className="text-[10px] text-white/40">shipments</div>
                  </div>
                  <div className="text-right w-32">
                    <div className="text-xs font-bold text-green">₦{account.monthlySpend.toLocaleString()}</div>
                    <div className="text-[10px] text-white/40">monthly</div>
                  </div>
                  <div className={`flex items-center gap-1.5 ${
                    account.status === "active" ? "text-green" : "text-white/30"
                  }`}>
                    <div className={`h-2 w-2 rounded-full ${account.status === "active" ? "bg-green" : "bg-white/30"}`} />
                    <span className="text-xs capitalize">{account.status}</span>
                  </div>
                  <button className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-white">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lockers Tab */}
        {activeTab === "lockers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Locker Network ({lockerStats.length} hubs)</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 text-xs">
                <MapPin className="h-3.5 w-3.5" />
                View on Map
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {lockerStats.map((locker) => (
                <div key={locker.id} className="rounded-xl bg-white/5 border border-white/10 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                        <Lock className="h-4.5 w-4.5 text-cyan-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{locker.name}</div>
                        <div className="text-[10px] text-white/40">{locker.id}</div>
                      </div>
                    </div>
                    <div className={`text-2xl font-black ${locker.utilization > 85 ? "text-red" : locker.utilization > 60 ? "text-yellow" : "text-green"}`}>
                      {locker.utilization}%
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{locker.total}</div>
                      <div className="text-[10px] text-white/40">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange">{locker.occupied}</div>
                      <div className="text-[10px] text-white/40">Occupied</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green">{locker.available}</div>
                      <div className="text-[10px] text-white/40">Available</div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${locker.utilization > 85 ? "bg-red" : locker.utilization > 60 ? "bg-yellow" : "bg-green"}`}
                      style={{ width: `${locker.utilization}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === "pricing" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Express Pricing Tiers</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange text-white text-xs font-medium">
                <Settings className="h-3.5 w-3.5" />
                Edit Pricing
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {pricingTiers.map((tier) => (
                <div key={tier.name} className={`rounded-xl border p-5 ${
                  tier.name === "Express" ? "bg-orange/5 border-orange/30" : "bg-white/5 border-white/10"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-sm font-bold ${tier.name === "Express" ? "text-orange" : "text-white"}`}>{tier.name}</h4>
                    {tier.name === "Express" && (
                      <span className="rounded bg-orange/20 px-1.5 py-0.5 text-[9px] font-bold text-orange">POPULAR</span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] text-white/40">Base Fee</div>
                      <div className="text-lg font-bold text-white">₦{tier.base.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40">Per Kg</div>
                      <div className="text-sm font-bold text-white">₦{tier.perKg}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40">Min / Max</div>
                      <div className="text-xs text-white/70">₦{tier.min.toLocaleString()} — ₦{tier.max.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40">SLA</div>
                      <div className="text-xs font-bold text-green">{tier.sla}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
