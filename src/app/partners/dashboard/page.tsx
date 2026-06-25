"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  DollarSign, ShoppingCart, Package, MousePointerClick, TrendingUp, Clock,
  Store, Link2, Search, FileText, CreditCard, Calendar, ArrowUp, ArrowDown,
  Zap, Users, Eye,
} from "lucide-react";

const dateRanges = ["7d", "30d", "90d", "Custom"] as const;

const earningsChartData = [
  { date: "Jun 1", commissions: 320, bonuses: 80, pending: 150 },
  { date: "Jun 2", commissions: 280, bonuses: 60, pending: 120 },
  { date: "Jun 3", commissions: 450, bonuses: 100, pending: 200 },
  { date: "Jun 4", commissions: 380, bonuses: 90, pending: 170 },
  { date: "Jun 5", commissions: 520, bonuses: 120, pending: 230 },
  { date: "Jun 6", commissions: 490, bonuses: 110, pending: 190 },
  { date: "Jun 7", commissions: 610, bonuses: 140, pending: 260 },
  { date: "Jun 8", commissions: 580, bonuses: 130, pending: 220 },
  { date: "Jun 9", commissions: 720, bonuses: 160, pending: 300 },
  { date: "Jun 10", commissions: 650, bonuses: 150, pending: 280 },
  { date: "Jun 11", commissions: 810, bonuses: 180, pending: 340 },
  { date: "Jun 12", commissions: 760, bonuses: 170, pending: 310 },
  { date: "Jun 13", commissions: 920, bonuses: 200, pending: 380 },
  { date: "Jun 14", commissions: 880, bonuses: 190, pending: 350 },
  { date: "Jun 15", commissions: 1050, bonuses: 220, pending: 420 },
  { date: "Jun 16", commissions: 980, bonuses: 210, pending: 390 },
  { date: "Jun 17", commissions: 1150, bonuses: 240, pending: 460 },
  { date: "Jun 18", commissions: 1080, bonuses: 230, pending: 430 },
  { date: "Jun 19", commissions: 1250, bonuses: 260, pending: 500 },
  { date: "Jun 20", commissions: 1180, bonuses: 250, pending: 470 },
  { date: "Jun 21", commissions: 1350, bonuses: 280, pending: 540 },
  { date: "Jun 22", commissions: 1280, bonuses: 270, pending: 510 },
  { date: "Jun 23", commissions: 1420, bonuses: 300, pending: 580 },
  { date: "Jun 24", commissions: 1380, bonuses: 290, pending: 550 },
  { date: "Jun 25", commissions: 1560, bonuses: 320, pending: 620 },
];

const summaryCardsData = [
  { label: "Total Items Shipped", value: "1,284", icon: Package, change: "+12.4%", up: true },
  { label: "Total Earnings", value: "$18,420", sub: "$14,200 confirmed · $4,220 pending", icon: DollarSign, change: "+18.2%", up: true },
  { label: "Total Ordered Items", value: "2,156", icon: ShoppingCart, change: "+9.7%", up: true },
  { label: "Total Clicks", value: "45,892", icon: MousePointerClick, change: "+22.1%", up: true },
  { label: "Conversion Rate", value: "4.7%", icon: TrendingUp, change: "+0.8%", up: true },
];

const quickLinks = [
  { label: "Search Products", href: "/catalog", icon: Search },
  { label: "Browse Catalog", href: "/catalog", icon: Eye },
  { label: "My Storefront", href: "/partners/dashboard/storefront", icon: Store },
  { label: "Create Link", href: "/partners/dashboard/quick-links", icon: Link2 },
  { label: "Reports", href: "/partners/dashboard/reports/summary", icon: FileText },
  { label: "Payment Info", href: "/partners/dashboard/settings", icon: CreditCard },
];

const quickStats = [
  { label: "Today's Earnings", value: "$156.00", icon: DollarSign, color: "bg-emerald-100 text-emerald-700" },
  { label: "This Week", value: "$982.40", icon: Calendar, color: "bg-blue-100 text-blue" },
  { label: "This Month", value: "$4,215.80", icon: TrendingUp, color: "bg-purple-100 text-purple-700" },
  { label: "All Time", value: "$18,420.00", icon: DollarSign, color: "bg-amber-100 text-amber-700" },
  { label: "Pending Payout", value: "$4,220.00", icon: Clock, color: "bg-orange-100 text-orange" },
  { label: "Clicks Today", value: "847", icon: MousePointerClick, color: "bg-cyan-100 text-cyan-700" },
];

const recentReferrals = [
  { id: 1, name: "Alex M.", orders: 3, earnings: "$84.50", date: "2h ago" },
  { id: 2, name: "Jessica K.", orders: 1, earnings: "$22.00", date: "5h ago" },
  { id: 3, name: "Ryan T.", orders: 5, earnings: "$165.30", date: "1d ago" },
  { id: 4, name: "Emily R.", orders: 2, earnings: "$48.00", date: "1d ago" },
  { id: 5, name: "David L.", orders: 7, earnings: "$210.80", date: "2d ago" },
];

export default function PartnersDashboard() {
  const [selectedRange, setSelectedRange] = useState<"7d" | "30d" | "90d" | "Custom">("30d");

  const chartSeries = [
    { dataKey: "commissions", name: "Commissions", color: "#22c55e" },
    { dataKey: "bonuses", name: "Bonuses", color: "#3b82f6" },
    { dataKey: "pending", name: "Pending", color: "#FF6B00" },
  ];

  const chartData = useMemo(() => {
    if (selectedRange === "7d") return earningsChartData.slice(-7);
    if (selectedRange === "90d") return earningsChartData;
    return earningsChartData;
  }, [selectedRange]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-lg font-bold text-[#0A1628]">Partner Dashboard</h1>
        <p className="text-xs text-gray-500">Track your affiliate performance, earnings, and referrals</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-sm transition-shadow">
              <div className={`w-7 h-7 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                <Icon size={13} />
              </div>
              <p className="text-[10px] text-gray-500">{stat.label}</p>
              <p className="font-bold text-sm text-[#0A1628]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Earnings Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-[#0A1628] flex items-center gap-2">
              <DollarSign size={15} className="text-[#FF6B00]" /> Earnings Overview
            </h3>
            <div className="flex items-center gap-1">
              {dateRanges.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRange(r)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    selectedRange === r
                      ? "bg-[#FF6B00] text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 11 }}
                  formatter={(value: any) => [`$${value}`, undefined]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {chartSeries.map((s) => (
                  <Line
                    key={s.dataKey}
                    type="monotone"
                    dataKey={s.dataKey}
                    name={s.name}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="space-y-3">
          {summaryCardsData.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-3.5 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                      <Icon size={13} />
                    </div>
                    <span className="text-[10px] text-gray-500">{card.label}</span>
                  </div>
                  <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${card.up ? "text-green-600" : "text-red-500"}`}>
                    {card.up ? <ArrowUp size={9} /> : <ArrowDown size={9} />} {card.change}
                  </span>
                </div>
                <p className="font-bold text-sm text-[#0A1628] ml-9">{card.value}</p>
                {card.sub && <p className="text-[9px] text-gray-400 ml-9">{card.sub}</p>}
              </div>
            );
          })}
          <p className="text-[9px] text-gray-400 text-right">Last updated: Jun 25, 2026 13:45 UTC</p>
        </div>
      </div>

      {/* Quick Links + Recent Referrals */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Quick Links */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm text-[#0A1628] mb-3 flex items-center gap-2">
            <Zap size={14} className="text-[#FF6B00]" /> Quick Links
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 hover:bg-[#FF6B00]/5 hover:border-[#FF6B00]/20 border border-transparent transition-all"
                >
                  <Icon size={14} className="text-gray-500 shrink-0" />
                  <span className="text-[11px] font-medium text-gray-700">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-[#0A1628] flex items-center gap-2">
              <Users size={14} className="text-[#FF6B00]" /> Recent Referrals
            </h3>
            <Link href="/partners/dashboard/reports/summary" className="text-[10px] text-[#FF6B00] font-semibold hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {recentReferrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center text-[9px] font-bold">
                    {r.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{r.name}</p>
                    <p className="text-[9px] text-gray-400">{r.orders} orders · {r.date}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-700">{r.earnings}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
