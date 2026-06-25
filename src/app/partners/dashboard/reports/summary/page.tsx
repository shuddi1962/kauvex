"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  DollarSign, ShoppingCart, MousePointerClick, TrendingUp,
  ArrowUp, ArrowDown, ChevronRight, ExternalLink,
} from "lucide-react";

const dateRanges = ["7d", "30d", "90d", "Custom"] as const;

const earningsChartData = [
  { date: "Jun 1", commissions: 320, bonuses: 80 },
  { date: "Jun 2", commissions: 280, bonuses: 60 },
  { date: "Jun 3", commissions: 450, bonuses: 100 },
  { date: "Jun 4", commissions: 380, bonuses: 90 },
  { date: "Jun 5", commissions: 520, bonuses: 120 },
  { date: "Jun 6", commissions: 490, bonuses: 110 },
  { date: "Jun 7", commissions: 610, bonuses: 140 },
  { date: "Jun 8", commissions: 580, bonuses: 130 },
  { date: "Jun 9", commissions: 720, bonuses: 160 },
  { date: "Jun 10", commissions: 650, bonuses: 150 },
  { date: "Jun 11", commissions: 810, bonuses: 180 },
  { date: "Jun 12", commissions: 760, bonuses: 170 },
  { date: "Jun 13", commissions: 920, bonuses: 200 },
  { date: "Jun 14", commissions: 880, bonuses: 190 },
  { date: "Jun 15", commissions: 1050, bonuses: 220 },
  { date: "Jun 16", commissions: 980, bonuses: 210 },
  { date: "Jun 17", commissions: 1150, bonuses: 240 },
  { date: "Jun 18", commissions: 1080, bonuses: 230 },
  { date: "Jun 19", commissions: 1250, bonuses: 260 },
  { date: "Jun 20", commissions: 1180, bonuses: 250 },
  { date: "Jun 21", commissions: 1350, bonuses: 280 },
  { date: "Jun 22", commissions: 1280, bonuses: 270 },
  { date: "Jun 23", commissions: 1420, bonuses: 300 },
  { date: "Jun 24", commissions: 1380, bonuses: 290 },
  { date: "Jun 25", commissions: 1560, bonuses: 320 },
];

const summaryStatCards = [
  { label: "Total Earnings", value: "$18,420", sub: "$14,200 confirmed · $4,220 pending", icon: DollarSign, change: "+18.2%", up: true },
  { label: "Total Orders", value: "2,156", icon: ShoppingCart, change: "+9.7%", up: true },
  { label: "Total Clicks", value: "45,892", icon: MousePointerClick, change: "+22.1%", up: true },
  { label: "Conversion Rate", value: "4.7%", icon: TrendingUp, change: "+0.8%", up: true },
];

const recentOrders = [
  { id: "ORD-7842", product: "Wireless Noise-Cancelling Headphones", commission: "$34.50", date: "Jun 25, 2026", status: "Paid" },
  { id: "ORD-7839", product: "Smart Home Security Camera Kit", commission: "$22.80", date: "Jun 24, 2026", status: "Paid" },
  { id: "ORD-7821", product: "Ergonomic Office Chair Pro", commission: "$67.20", date: "Jun 23, 2026", status: "Pending" },
  { id: "ORD-7805", product: "Portable Bluetooth Speaker", commission: "$12.40", date: "Jun 21, 2026", status: "Paid" },
  { id: "ORD-7792", product: "Mechanical Gaming Keyboard RGB", commission: "$28.90", date: "Jun 20, 2026", status: "Paid" },
];

export default function ReportsSummary() {
  const [selectedRange, setSelectedRange] = useState<"7d" | "30d" | "90d" | "Custom">("30d");

  const chartSeries = [
    { dataKey: "commissions", name: "Commissions", color: "#22c55e" },
    { dataKey: "bonuses", name: "Bonuses", color: "#3b82f6" },
  ];

  const filteredData = selectedRange === "7d" ? earningsChartData.slice(-7) : earningsChartData;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#0A1628]">Reports Summary</h1>
        <p className="text-xs text-gray-500">Overview of affiliate earnings, orders, and conversion metrics</p>
      </div>

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryStatCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-3.5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                  <Icon size={13} />
                </div>
                <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${card.up ? "text-green-600" : "text-red-500"}`}>
                  {card.up ? <ArrowUp size={9} /> : <ArrowDown size={9} />} {card.change}
                </span>
              </div>
              <p className="font-bold text-sm text-[#0A1628]">{card.value}</p>
              {card.sub && <p className="text-[9px] text-gray-400 mt-0.5">{card.sub}</p>}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
            <DollarSign size={15} className="text-[#FF6B00]" /> Earnings Over Time
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData}>
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

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-[#0A1628] flex items-center gap-2">
              <ShoppingCart size={14} className="text-[#FF6B00]" /> Recent Orders
            </h3>
            <Link href="/partners/dashboard/reports/orders" className="text-[10px] text-[#FF6B00] font-semibold hover:underline flex items-center gap-0.5">
              View All <ChevronRight size={10} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="min-w-0 flex-1 mr-2">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-mono font-semibold text-gray-700">{order.id}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                      order.status === "Paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>{order.status}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 truncate">{order.product}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-green-700">{order.commission}</p>
                  <p className="text-[8px] text-gray-400">{order.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
