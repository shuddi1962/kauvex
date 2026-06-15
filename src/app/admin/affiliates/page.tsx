"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Users, Search, Eye, DollarSign, TrendingUp,
  Link2, ShoppingCart, X, Check, Clock, BarChart3,
  ArrowUpRight, ArrowDownRight, CreditCard,
} from "lucide-react";

interface Affiliate {
  id: string;
  name: string;
  email: string;
  link_code: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commission_rate: number;
  commission_earned: number;
  status: string;
  joined: string;
}

interface Commission {
  id: string;
  affiliate: string;
  order_id: string;
  sale_amount: number;
  commission: number;
  rate: number;
  status: string;
  date: string;
}

interface Payout {
  id: string;
  affiliate: string;
  amount: number;
  payment_method: string;
  account_details: string;
  status: string;
  date: string;
}

const affiliates: Affiliate[] = [
  { id: "1", name: "Chidi Okeke", email: "chidi.okeke@email.com", link_code: "CHIDI20", clicks: 1420, conversions: 85, revenue: 2850000, commission_rate: 12, commission_earned: 342000, status: "active", joined: "2026-01-15" },
  { id: "2", name: "Amara Nwachukwu", email: "amara.n@email.com", link_code: "AMARA10", clicks: 2300, conversions: 156, revenue: 4200000, commission_rate: 15, commission_earned: 630000, status: "active", joined: "2025-11-01" },
  { id: "3", name: "Femi Adeleke", email: "femi.a@email.com", link_code: "FEMI05", clicks: 890, conversions: 42, revenue: 1100000, commission_rate: 10, commission_earned: 110000, status: "active", joined: "2026-03-10" },
  { id: "4", name: "Zainab Yusuf", email: "zainab.y@email.com", link_code: "ZAINAB15", clicks: 3100, conversions: 220, revenue: 5800000, commission_rate: 18, commission_earned: 1044000, status: "active", joined: "2025-09-20" },
  { id: "5", name: "Emeka Okafor", email: "emeka.o@email.com", link_code: "EMEKA25", clicks: 650, conversions: 28, revenue: 780000, commission_rate: 10, commission_earned: 78000, status: "inactive", joined: "2026-04-01" },
  { id: "6", name: "Tunde Bakare", email: "tunde.b@email.com", link_code: "TUNDE12", clicks: 1780, conversions: 95, revenue: 2400000, commission_rate: 12, commission_earned: 288000, status: "active", joined: "2026-02-14" },
  { id: "7", name: "Ngozi Eze", email: "ngozi.e@email.com", link_code: "NGOZI08", clicks: 5200, conversions: 410, revenue: 9200000, commission_rate: 20, commission_earned: 1840000, status: "active", joined: "2025-07-05" },
  { id: "8", name: "Kelechi Ibe", email: "kelechi.i@email.com", link_code: "KELECHI18", clicks: 1100, conversions: 55, revenue: 1650000, commission_rate: 12, commission_earned: 198000, status: "active", joined: "2026-05-01" },
  { id: "9", name: "Bola Tinubu Ventures", email: "bola.tv@email.com", link_code: "BOLA30", clicks: 4200, conversions: 285, revenue: 7500000, commission_rate: 15, commission_earned: 1125000, status: "active", joined: "2025-10-15" },
  { id: "10", name: "Adaobi Nnamdi", email: "adaobi.n@email.com", link_code: "ADAOBI22", clicks: 430, conversions: 18, revenue: 520000, commission_rate: 10, commission_earned: 52000, status: "suspended", joined: "2026-04-20" },
  { id: "11", name: "Yemi Ogun", email: "yemi.o@email.com", link_code: "YEMI14", clicks: 1600, conversions: 88, revenue: 2100000, commission_rate: 12, commission_earned: 252000, status: "active", joined: "2026-02-28" },
  { id: "12", name: "Chinwe Obi", email: "chinwe.o@email.com", link_code: "CHINWE07", clicks: 3400, conversions: 198, revenue: 4800000, commission_rate: 15, commission_earned: 720000, status: "active", joined: "2025-12-01" },
];

const commissions: Commission[] = [
  { id: "1", affiliate: "Ngozi Eze", order_id: "ORD-101", sale_amount: 350000, commission: 70000, rate: 20, status: "paid", date: "2026-06-01" },
  { id: "2", affiliate: "Amara Nwachukwu", order_id: "ORD-102", sale_amount: 280000, commission: 42000, rate: 15, status: "paid", date: "2026-06-02" },
  { id: "3", affiliate: "Bola Tinubu Ventures", order_id: "ORD-103", sale_amount: 520000, commission: 78000, rate: 15, status: "pending", date: "2026-06-05" },
  { id: "4", affiliate: "Zainab Yusuf", order_id: "ORD-104", sale_amount: 180000, commission: 32400, rate: 18, status: "paid", date: "2026-06-03" },
  { id: "5", affiliate: "Chinwe Obi", order_id: "ORD-105", sale_amount: 420000, commission: 63000, rate: 15, status: "pending", date: "2026-06-07" },
  { id: "6", affiliate: "Tunde Bakare", order_id: "ORD-106", sale_amount: 95000, commission: 11400, rate: 12, status: "paid", date: "2026-05-28" },
  { id: "7", affiliate: "Ngozi Eze", order_id: "ORD-107", sale_amount: 680000, commission: 136000, rate: 20, status: "pending", date: "2026-06-08" },
  { id: "8", affiliate: "Chidi Okeke", order_id: "ORD-108", sale_amount: 150000, commission: 18000, rate: 12, status: "paid", date: "2026-05-25" },
  { id: "9", affiliate: "Yemi Ogun", order_id: "ORD-109", sale_amount: 210000, commission: 25200, rate: 12, status: "pending", date: "2026-06-09" },
  { id: "10", affiliate: "Zainab Yusuf", order_id: "ORD-110", sale_amount: 450000, commission: 81000, rate: 18, status: "pending", date: "2026-06-10" },
  { id: "11", affiliate: "Kelechi Ibe", order_id: "ORD-111", sale_amount: 125000, commission: 15000, rate: 12, status: "paid", date: "2026-05-30" },
  { id: "12", affiliate: "Femi Adeleke", order_id: "ORD-112", sale_amount: 88000, commission: 8800, rate: 10, status: "pending", date: "2026-06-06" },
];

const payouts: Payout[] = [
  { id: "1", affiliate: "Ngozi Eze", amount: 350000, payment_method: "Bank Transfer", account_details: "GTBank · 0123456789", status: "completed", date: "2026-06-01" },
  { id: "2", affiliate: "Amara Nwachukwu", amount: 180000, payment_method: "Bank Transfer", account_details: "Access Bank · 0234567891", status: "completed", date: "2026-06-02" },
  { id: "3", affiliate: "Chinwe Obi", amount: 120000, payment_method: "Mobile Money", account_details: "MTN MoMo · 08031234567", status: "pending", date: "2026-06-10" },
  { id: "4", affiliate: "Tunde Bakare", amount: 75000, payment_method: "Bank Transfer", account_details: "UBA · 0345678912", status: "completed", date: "2026-05-30" },
  { id: "5", affiliate: "Zainab Yusuf", amount: 280000, payment_method: "Bank Transfer", account_details: "First Bank · 0456789123", status: "processing", date: "2026-06-09" },
  { id: "6", affiliate: "Chidi Okeke", amount: 45000, payment_method: "Mobile Money", account_details: "Airtel Money · 08099887766", status: "completed", date: "2026-05-28" },
  { id: "7", affiliate: "Bola Tinubu Ventures", amount: 420000, payment_method: "Bank Transfer", account_details: "GTBank · 0567891234", status: "pending", date: "2026-06-12" },
  { id: "8", affiliate: "Kelechi Ibe", amount: 55000, payment_method: "Mobile Money", account_details: "MTN MoMo · 08123456789", status: "completed", date: "2026-06-05" },
];

const tabs = ["Overview", "Affiliates", "Commissions", "Payouts"];

export default function AffiliatesPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const totalAffiliates = affiliates.length;
  const activeAffiliates = affiliates.filter((a) => a.status === "active").length;
  const totalCommission = commissions.reduce((s, c) => s + c.commission, 0);
  const pendingPayouts = payouts.filter((p) => p.status === "pending" || p.status === "processing").reduce((s, p) => s + p.amount, 0);
  const totalClicks = affiliates.reduce((s, a) => s + a.clicks, 0);
  const totalConversions = affiliates.reduce((s, a) => s + a.conversions, 0);
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : "0";

  const filteredAffiliates = affiliates.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.link_code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredCommissions = commissions.filter((c) => {
    if (search && !c.affiliate.toLowerCase().includes(search.toLowerCase()) && !c.order_id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredPayouts = payouts.filter((p) => {
    if (search && !p.affiliate.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminShell title="Affiliate Marketing" subtitle="Manage affiliate network and commissions">
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 w-fit border border-gray-200">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-blue text-white" : "text-text-3 hover:bg-gray-50"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Total Affiliates", value: totalAffiliates, icon: Users, color: "text-blue" },
              { label: "Active Affiliates", value: activeAffiliates, icon: Users, color: "text-green-600" },
              { label: "Total Commissions", value: `₦${(totalCommission / 1e6).toFixed(1)}M`, icon: DollarSign, color: "text-purple-600" },
              { label: "Pending Payouts", value: `₦${(pendingPayouts / 1e3).toFixed(0)}K`, icon: CreditCard, color: "text-orange" },
              { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "text-blue" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2"><s.icon size={16} className={s.color} /><span className="text-xs text-text-4">{s.label}</span></div>
                <p className="text-xl font-bold text-text-1">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-blue" /> Top Performers</h3>
              <div className="space-y-2">
                {affiliates.sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((a, i) => (
                  <div key={a.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <span className="w-5 h-5 rounded-full bg-blue text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-1 truncate">{a.name}</p>
                      <p className="text-[10px] text-text-4">{a.conversions} conversions · ₦{(a.revenue / 1e6).toFixed(1)}M</p>
                    </div>
                    <span className="text-xs font-bold text-green-600">+₦{(a.commission_earned / 1e3).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><BarChart3 size={16} className="text-blue" /> Network Performance</h3>
              <div className="space-y-3">
                {[
                  { label: "Total Clicks", value: totalClicks.toLocaleString(), pct: 100, color: "bg-blue" },
                  { label: "Total Conversions", value: totalConversions.toLocaleString(), pct: Math.round((totalConversions / totalClicks) * 100), color: "bg-green-500" },
                  { label: "Total Revenue Generated", value: `₦${(affiliates.reduce((s, a) => s + a.revenue, 0) / 1e6).toFixed(1)}M`, pct: 85, color: "bg-orange" },
                ].map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-text-3">{b.label}</span><span className="font-semibold">{b.value}</span></div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.pct}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Affiliates" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search affiliates..." className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
            </div>
            {["all", "active", "inactive", "suspended"].map((f) => (
              <button key={f} onClick={() => setFilterStatus(f)} className={`px-3 py-2 text-xs rounded-lg border capitalize ${filterStatus === f ? "bg-blue text-white border-blue" : "bg-white border-gray-200 text-text-3"}`}>{f}</button>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Affiliate", "Link Code", "Clicks", "Conv.", "Revenue", "Comm. Rate", "Earned", "Status"].map((h) => (
                      <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAffiliates.map((a) => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-medium text-text-1">{a.name}</p>
                        <p className="text-[10px] text-text-4">{a.email}</p>
                      </td>
                      <td className="p-3"><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-blue">/{a.link_code}</span></td>
                      <td className="p-3 font-semibold">{a.clicks.toLocaleString()}</td>
                      <td className="p-3">{a.conversions}</td>
                      <td className="p-3 font-semibold">₦{(a.revenue / 1e6).toFixed(1)}M</td>
                      <td className="p-3 text-xs">{a.commission_rate}%</td>
                      <td className="p-3 font-semibold text-green-600">₦{(a.commission_earned / 1e3).toFixed(0)}K</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${a.status === "active" ? "bg-green-50 text-green-600" : a.status === "inactive" ? "bg-gray-100 text-text-4" : "bg-red-50 text-red"}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Commissions" && (
        <div className="space-y-4">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search commissions..." className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Affiliate", "Order", "Sale Amount", "Rate", "Commission", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCommissions.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 font-medium text-text-1">{c.affiliate}</td>
                      <td className="p-3 font-mono text-xs text-blue">{c.order_id}</td>
                      <td className="p-3 font-semibold">₦{c.sale_amount.toLocaleString()}</td>
                      <td className="p-3 text-xs">{c.rate}%</td>
                      <td className="p-3 font-semibold text-green-600">₦{c.commission.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${c.status === "paid" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue"}`}>
                          {c.status === "paid" ? <Check size={10} /> : <Clock size={10} />}
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-text-3">{c.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Payouts" && (
        <div className="space-y-4">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payouts..." className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Affiliate", "Amount", "Payment Method", "Account", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPayouts.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 font-medium text-text-1">{p.affiliate}</td>
                      <td className="p-3 font-semibold">₦{p.amount.toLocaleString()}</td>
                      <td className="p-3 text-xs">{p.payment_method}</td>
                      <td className="p-3 text-[10px] text-text-4">{p.account_details}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${p.status === "completed" ? "bg-green-50 text-green-600" : p.status === "processing" ? "bg-orange-50 text-orange" : "bg-blue-50 text-blue"}`}>
                          {p.status === "completed" ? <Check size={10} /> : p.status === "processing" ? <Clock size={10} /> : <ArrowUpRight size={10} />}
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-text-3">{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
