"use client";

import { useState } from "react";
import { Users, Globe, Clock, Repeat, TrendingUp, Award } from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";
import { MetricCard, PeriodSelector } from "@/components/vendor/analytics";

const geography = [
  { country: "Nigeria", city: "Lagos", orders: 1240, flag: "🇳🇬" },
  { country: "Nigeria", city: "Abuja", orders: 380, flag: "🇳🇬" },
  { country: "Nigeria", city: "Port Harcourt", orders: 290, flag: "🇳🇬" },
  { country: "United Kingdom", city: "London", orders: 210, flag: "🇬🇧" },
  { country: "United States", city: "New York", orders: 185, flag: "🇺🇸" },
  { country: "United Kingdom", city: "Manchester", orders: 95, flag: "🇬🇧" },
  { country: "Canada", city: "Toronto", orders: 78, flag: "🇨🇦" },
  { country: "UAE", city: "Dubai", orders: 65, flag: "🇦🇪" },
  { country: "South Africa", city: "Cape Town", orders: 55, flag: "🇿🇦" },
  { country: "United States", city: "Houston", orders: 48, flag: "🇺🇸" },
  { country: "Germany", city: "Berlin", orders: 42, flag: "🇩🇪" },
  { country: "Kenya", city: "Nairobi", orders: 38, flag: "🇰🇪" },
];

const purchaseHeatmap: { day: string; hours: { label: string; value: number }[] }[] = [
  {
    day: "Mon", hours: [
      { label: "0-4", value: 5 }, { label: "4-8", value: 12 }, { label: "8-12", value: 45 },
      { label: "12-16", value: 62 }, { label: "16-20", value: 78 }, { label: "20-24", value: 38 },
    ],
  },
  {
    day: "Tue", hours: [
      { label: "0-4", value: 3 }, { label: "4-8", value: 15 }, { label: "8-12", value: 52 },
      { label: "12-16", value: 58 }, { label: "16-20", value: 82 }, { label: "20-24", value: 35 },
    ],
  },
  {
    day: "Wed", hours: [
      { label: "0-4", value: 4 }, { label: "4-8", value: 10 }, { label: "8-12", value: 48 },
      { label: "12-16", value: 55 }, { label: "16-20", value: 75 }, { label: "20-24", value: 40 },
    ],
  },
  {
    day: "Thu", hours: [
      { label: "0-4", value: 6 }, { label: "4-8", value: 14 }, { label: "8-12", value: 50 },
      { label: "12-16", value: 60 }, { label: "16-20", value: 85 }, { label: "20-24", value: 42 },
    ],
  },
  {
    day: "Fri", hours: [
      { label: "0-4", value: 8 }, { label: "4-8", value: 18 }, { label: "8-12", value: 55 },
      { label: "12-16", value: 65 }, { label: "16-20", value: 92 }, { label: "20-24", value: 48 },
    ],
  },
  {
    day: "Sat", hours: [
      { label: "0-4", value: 10 }, { label: "4-8", value: 8 }, { label: "8-12", value: 35 },
      { label: "12-16", value: 70 }, { label: "16-20", value: 88 }, { label: "20-24", value: 55 },
    ],
  },
  {
    day: "Sun", hours: [
      { label: "0-4", value: 7 }, { label: "4-8", value: 5 }, { label: "8-12", value: 28 },
      { label: "12-16", value: 45 }, { label: "16-20", value: 60 }, { label: "20-24", value: 35 },
    ],
  },
];

const topCustomers = [
  { name: "Emeka O.", orders: 24, spent: 5840000, city: "Lagos" },
  { name: "Sarah M.", orders: 18, spent: 4200000, city: "London" },
  { name: "John D.", orders: 15, spent: 3850000, city: "New York" },
  { name: "Amara K.", orders: 12, spent: 2960000, city: "Abuja" },
  { name: "Michael T.", orders: 10, spent: 2150000, city: "Lagos" },
];

const maxHeatValue = Math.max(...purchaseHeatmap.flatMap((d) => d.hours.map((h) => h.value)));

export default function AnalyticsCustomers() {
  const [period, setPeriod] = useState("30d");

  const formatNgn = (v: number) => {
    if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
    return `₦${(v / 1_000).toFixed(0)}K`;
  };

  const heatColor = (val: number) => {
    const intensity = val / maxHeatValue;
    if (intensity > 0.8) return "bg-orange text-white";
    if (intensity > 0.6) return "bg-orange/70 text-white";
    if (intensity > 0.4) return "bg-orange/40 text-text-1";
    if (intensity > 0.2) return "bg-orange/20 text-text-2";
    return "bg-gray-100 text-text-4";
  };

  return (
    <VendorShell title="Customer Analytics" subtitle="Understand your customers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-4">Customer insights and behavior patterns</p>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard value="1,847" label="Total Customers" change="+12.4%" up icon={Users} color="bg-purple-100 text-purple-700" />
          <MetricCard value="34.2%" label="Repeat Purchase Rate" change="+5.1%" up icon={Repeat} color="bg-blue-100 text-blue" />
          <MetricCard value="3.2" label="Avg Orders Per Customer" change="+0.4" up icon={TrendingUp} color="bg-emerald-100 text-emerald-700" />
          <MetricCard value="₦423K" label="Avg Lifetime Value" change="+8.3%" up icon={Award} color="bg-amber-100 text-amber-700" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Geography */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm text-text-1 flex items-center gap-2 mb-4">
              <Globe size={15} className="text-orange" /> Customer Geography
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {geography.map((g) => (
                <div key={`${g.city}-${g.country}`} className="flex items-center gap-3 py-1.5">
                  <span className="text-base">{g.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-1">{g.city}, {g.country}</p>
                    <div className="flex items-center gap-2 text-[9px] text-text-4">
                      <span>{g.orders} orders</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange rounded-full"
                        style={{ width: `${(g.orders / Math.max(...geography.map((x) => x.orders))) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-text-1 w-12 text-right">
                      {((g.orders / geography.reduce((s, x) => s + x.orders, 0)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Time Heatmap */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm text-text-1 flex items-center gap-2 mb-4">
              <Clock size={15} className="text-orange" /> Purchase Time Heatmap
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="px-1 py-1 text-[9px] text-text-4 font-medium text-left">Day</th>
                    {purchaseHeatmap[0].hours.map((h) => (
                      <th key={h.label} className="px-1 py-1 text-[9px] text-text-4 font-medium text-center">{h.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {purchaseHeatmap.map((row) => (
                    <tr key={row.day}>
                      <td className="px-1 py-1 text-[10px] font-semibold text-text-2">{row.day}</td>
                      {row.hours.map((h) => (
                        <td key={h.label} className="px-1 py-1">
                          <div className={`w-full h-7 rounded flex items-center justify-center text-[9px] font-medium ${heatColor(h.value)}`}>
                            {h.value}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end gap-2 mt-3">
              <span className="text-[9px] text-text-4">Low</span>
              <div className="flex gap-0.5">
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((i) => (
                  <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: i > 0.8 ? "#FF6B00" : `rgba(255,107,0,${i})` }} />
                ))}
              </div>
              <span className="text-[9px] text-text-4">High</span>
            </div>
          </div>
        </div>

        {/* New vs Returning */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-bold text-sm text-text-1 flex items-center gap-2 mb-4">
            <Users size={15} className="text-orange" /> New vs Returning Customers
          </h3>
          <div className="flex items-center gap-8">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#FF6B00" strokeWidth="3" strokeDasharray={`${34.2 * 2} ${100 - 34.2 * 2}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-bold text-text-1">34.2%</p>
                  <p className="text-[8px] text-text-4 -mt-1">Returning</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-2 font-medium">New Customers</span>
                  <span className="font-bold text-text-1">65.8%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange rounded-full" style={{ width: "65.8%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-2 font-medium">Returning Customers</span>
                  <span className="font-bold text-text-1">34.2%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-navy rounded-full" style={{ width: "34.2%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-text-1 flex items-center gap-2">
              <Award size={15} className="text-orange" /> Top Customers by Lifetime Value
            </h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-2 py-2 font-semibold text-text-4 text-[10px]">#</th>
                <th className="text-left px-2 py-2 font-semibold text-text-4 text-[10px]">Customer</th>
                <th className="text-left px-2 py-2 font-semibold text-text-4 text-[10px]">Location</th>
                <th className="text-right px-2 py-2 font-semibold text-text-4 text-[10px]">Orders</th>
                <th className="text-right px-2 py-2 font-semibold text-text-4 text-[10px]">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c, i) => (
                <tr key={c.name} className="border-b border-border last:border-0">
                  <td className="px-2 py-2.5">
                    <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-text-4">{i + 1}</span>
                  </td>
                  <td className="px-2 py-2.5">
                    <p className="font-semibold text-text-1">{c.name}</p>
                  </td>
                  <td className="px-2 py-2.5 text-text-4">{c.city}</td>
                  <td className="px-2 py-2.5 text-right font-medium">{c.orders}</td>
                  <td className="px-2 py-2.5 text-right font-semibold text-green-700">{formatNgn(c.spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </VendorShell>
  );
}
