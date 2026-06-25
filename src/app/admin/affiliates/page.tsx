"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Users, DollarSign, TrendingUp, CreditCard, ShieldAlert,
  BarChart3, UserCheck, Clock, ArrowUpRight, ArrowDownRight,
  ShoppingCart, Eye, MousePointerClick,
} from "lucide-react";

const statsCards = [
  { label: "Total Partners", value: "2,847", change: "+12.5%", changeUp: true, icon: Users, color: "text-blue" },
  { label: "Active Partners (30d)", value: "1,234", change: "+8.3%", changeUp: true, icon: UserCheck, color: "text-green-600" },
  { label: "Total Commissions Paid", value: "₦52.4M", change: "", changeUp: true, icon: DollarSign, color: "text-purple-600" },
  { label: "Commission Paid This Month", value: "₦4.8M", change: "+15.2%", changeUp: true, icon: CreditCard, color: "text-orange" },
  { label: "Total GMV from Affiliates", value: "₦428M", change: "+22.1%", changeUp: true, icon: TrendingUp, color: "text-emerald-600" },
  { label: "Pending Payout Amount", value: "₦2.3M", change: "-5.1%", changeUp: false, icon: Clock, color: "text-amber-600" },
  { label: "Fraud Flags Count", value: "38", change: "+3", changeUp: false, icon: ShieldAlert, color: "text-red" },
];

const recentCommissions = [
  { partner: "Ngozi Eze", amount: "₦136,000", order: "ORD-107", status: "pending", date: "2026-06-08" },
  { partner: "Chinwe Obi", amount: "₦63,000", order: "ORD-105", status: "pending", date: "2026-06-07" },
  { partner: "Femi Adeleke", amount: "₦8,800", order: "ORD-112", status: "pending", date: "2026-06-06" },
  { partner: "Bola Tinubu Ventures", amount: "₦78,000", order: "ORD-103", status: "pending", date: "2026-06-05" },
  { partner: "Zainab Yusuf", amount: "₦81,000", order: "ORD-110", status: "pending", date: "2026-06-10" },
];

const monthlyTrend = [
  { month: "Jan", gmv: 28000000, commissions: 3200000 },
  { month: "Feb", gmv: 32000000, commissions: 3800000 },
  { month: "Mar", gmv: 35000000, commissions: 4100000 },
  { month: "Apr", gmv: 38000000, commissions: 4500000 },
  { month: "May", gmv: 42000000, commissions: 4800000 },
  { month: "Jun", gmv: 48000000, commissions: 5200000 },
];

export default function AdminAffiliatesPage() {
  return (
    <AdminShell title="Affiliate & Influencer Network" subtitle="Kauvex Affiliate & Influencer Network (KAIN) - Master Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          {statsCards.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={15} className={s.color} />
                <span className="text-[10px] text-gray-500 font-medium">{s.label}</span>
              </div>
              <p className="text-lg font-bold text-[#0A1628]">{s.value}</p>
              {s.change && (
                <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-medium ${s.changeUp ? "text-green-600" : "text-red"}`}>
                  {s.changeUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  <span>{s.change}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-blue" /> Monthly Performance
            </h3>
            <div className="flex items-end gap-3 h-40">
              {monthlyTrend.map((m) => {
                const maxGmv = Math.max(...monthlyTrend.map((x) => x.gmv));
                const gmvPct = (m.gmv / maxGmv) * 100;
                const commPct = (m.commissions / maxGmv) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-end h-32 gap-0.5">
                      <div className="w-full bg-orange/20 rounded-t" style={{ height: `${commPct}%` }} />
                      <div className="w-full bg-blue rounded-t" style={{ height: `${gmvPct}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">{m.month}</span>
                    <div className="flex gap-2 text-[8px] text-gray-400">
                      <span className="text-blue">₦{(m.gmv / 1e6).toFixed(0)}M</span>
                      <span className="text-orange">₦{(m.commissions / 1e6).toFixed(1)}M</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500"><div className="w-3 h-3 rounded bg-blue" /> GMV</div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500"><div className="w-3 h-3 rounded bg-orange/40" /> Commissions</div>
            </div>
          </div>

          {/* Recent Pending Commissions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
              <Clock size={16} className="text-amber-600" /> Pending Commissions
            </h3>
            <div className="space-y-2">
              {recentCommissions.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#0A1628] truncate">{c.partner}</p>
                    <p className="text-[10px] text-gray-400">{c.order} · {c.date}</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 ml-2">{c.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Manage Partners", href: "/admin/affiliates/partners", icon: Users, color: "bg-blue-50 text-blue" },
            { label: "Commissions", href: "/admin/affiliates/commissions", icon: DollarSign, color: "bg-green-50 text-green-600" },
            { label: "Payouts", href: "/admin/affiliates/payouts", icon: CreditCard, color: "bg-purple-50 text-purple-600" },
            { label: "Fraud Log", href: "/admin/affiliates/fraud", icon: ShieldAlert, color: "bg-red-50 text-red" },
          ].map((q) => (
            <a key={q.label} href={q.href} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${q.color}`}>
                <q.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0A1628]">{q.label}</p>
                <p className="text-[10px] text-gray-400">View & manage</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
