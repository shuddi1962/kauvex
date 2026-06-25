"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  TrendingUp, DollarSign, Users, Globe, BarChart3,
  MousePointerClick, ShoppingCart, Percent, ArrowUpRight,
  Smartphone, Monitor, MapPin,
} from "lucide-react";

const monthlyRevenue = [
  { month: "Jan", revenue: 28000000, cost: 3200000, orders: 420 },
  { month: "Feb", revenue: 32000000, cost: 3800000, orders: 510 },
  { month: "Mar", revenue: 35000000, cost: 4100000, orders: 580 },
  { month: "Apr", revenue: 38000000, cost: 4500000, orders: 620 },
  { month: "May", revenue: 42000000, cost: 4800000, orders: 710 },
  { month: "Jun", revenue: 48000000, cost: 5200000, orders: 850 },
];

const topPartners = [
  { rank: 1, name: "Ngozi Eze", revenue: 9200000, commission: 1840000, sales: 410, clicks: 5200, convRate: 7.9 },
  { rank: 2, name: "Bola Tinubu Ventures", revenue: 7500000, commission: 1125000, sales: 285, clicks: 4200, convRate: 6.8 },
  { rank: 3, name: "Zainab Yusuf", revenue: 5800000, commission: 1044000, sales: 220, clicks: 3100, convRate: 7.1 },
  { rank: 4, name: "Chinwe Obi", revenue: 4800000, commission: 720000, sales: 198, clicks: 3400, convRate: 5.8 },
  { rank: 5, name: "Amara Nwachukwu", revenue: 4200000, commission: 630000, sales: 156, clicks: 2300, convRate: 6.8 },
  { rank: 6, name: "Chidi Okeke", revenue: 2850000, commission: 342000, sales: 85, clicks: 1420, convRate: 6.0 },
  { rank: 7, name: "Tunde Bakare", revenue: 2400000, commission: 288000, sales: 95, clicks: 1780, convRate: 5.3 },
  { rank: 8, name: "Yemi Ogun", revenue: 2100000, commission: 252000, sales: 88, clicks: 1600, convRate: 5.5 },
  { rank: 9, name: "Kelechi Ibe", revenue: 1650000, commission: 198000, sales: 55, clicks: 1100, convRate: 5.0 },
  { rank: 10, name: "Femi Adeleke", revenue: 1100000, commission: 110000, sales: 42, clicks: 890, convRate: 4.7 },
];

const topProducts = [
  { name: "Wireless Bluetooth Headphones", revenue: 5200000, commission: 416000, orders: 185 },
  { name: "Premium Leather Handbag", revenue: 4800000, commission: 480000, orders: 92 },
  { name: "Smart Watch Pro", revenue: 4100000, commission: 328000, orders: 68 },
  { name: "Organic Skincare Set", revenue: 3200000, commission: 384000, orders: 210 },
  { name: "Fitness Tracker Band", revenue: 2800000, commission: 224000, orders: 340 },
];

const trafficSources = [
  { source: "Direct Link", clicks: 14200, percentage: 35 },
  { source: "Instagram", clicks: 9800, percentage: 24 },
  { source: "YouTube", clicks: 6500, percentage: 16 },
  { source: "TikTok", clicks: 4800, percentage: 12 },
  { source: "Twitter/X", clicks: 3200, percentage: 8 },
  { source: "Blog/Website", clicks: 2000, percentage: 5 },
];

const countryBreakdown = [
  { country: "Nigeria", code: "NG", clicks: 28500, percentage: 58 },
  { country: "United Kingdom", code: "UK", clicks: 7200, percentage: 15 },
  { country: "United States", code: "US", clicks: 5400, percentage: 11 },
  { country: "Canada", code: "CA", clicks: 3800, percentage: 8 },
  { country: "Australia", code: "AU", clicks: 2100, percentage: 4 },
  { country: "Other", code: "—", clicks: 2000, percentage: 4 },
];

const conversionByTier = [
  { tier: "Nano", partners: 420, convRate: 3.2, avgOrderValue: 18500 },
  { tier: "Micro", partners: 280, convRate: 4.5, avgOrderValue: 22000 },
  { tier: "Mid", partners: 145, convRate: 5.8, avgOrderValue: 28500 },
  { tier: "Macro", partners: 52, convRate: 7.1, avgOrderValue: 35000 },
  { tier: "Mega", partners: 18, convRate: 8.5, avgOrderValue: 42000 },
  { tier: "Celebrity", partners: 5, convRate: 10.2, avgOrderValue: 58000 },
];

const totalGmv = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
const totalCommission = monthlyRevenue.reduce((s, m) => s + m.cost, 0);
const totalClicks = trafficSources.reduce((s, t) => s + t.clicks, 0);
const totalOrders = monthlyRevenue.reduce((s, m) => s + m.orders, 0);
const roi = totalCommission > 0 ? ((totalGmv - totalCommission) / totalCommission * 100).toFixed(1) : "0";

export default function AdminAffiliatesAnalyticsPage() {
  return (
    <AdminShell title="Analytics" subtitle="Affiliate program performance analytics">
      <div className="space-y-6">
        {/* ROI Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] text-gray-500 mb-1">Total Affiliate GMV</p>
            <p className="text-lg font-bold text-[#0A1628]">₦{(totalGmv / 1e6).toFixed(0)}M</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] text-gray-500 mb-1">Total Commission Paid</p>
            <p className="text-lg font-bold text-orange">₦{(totalCommission / 1e6).toFixed(1)}M</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] text-gray-500 mb-1">Total Orders</p>
            <p className="text-lg font-bold text-[#0A1628]">{totalOrders.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] text-gray-500 mb-1">Total Clicks</p>
            <p className="text-lg font-bold text-blue">{totalClicks.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] text-gray-500 mb-1">ROI</p>
            <p className="text-lg font-bold text-green-600">{roi}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue" /> Affiliate-Driven Revenue Trend
            </h3>
            <div className="space-y-2">
              {monthlyRevenue.map((m) => {
                const maxRev = Math.max(...monthlyRevenue.map((x) => x.revenue));
                const pct = (m.revenue / maxRev) * 100;
                return (
                  <div key={m.month}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 font-medium">{m.month}</span>
                      <div className="flex gap-3">
                        <span className="text-blue font-semibold">₦{(m.revenue / 1e6).toFixed(1)}M</span>
                        <span className="text-orange font-semibold">₦{(m.cost / 1e6).toFixed(1)}M</span>
                        <span className="text-gray-400">{m.orders} orders</span>
                      </div>
                    </div>
                    <div className="h-5 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-blue rounded-l-full transition-all" style={{ width: `${pct}%` }} />
                      <div className="h-full bg-orange/40 transition-all" style={{ width: `${(m.cost / maxRev) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-blue" /> Revenue</span>
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-orange/60" /> Commission Cost</span>
            </div>
          </div>

          {/* Top 10 Partners */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
              <Users size={16} className="text-purple-600" /> Top 10 Partners
            </h3>
            <div className="space-y-1.5">
              {topPartners.map((p) => (
                <div key={p.rank} className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="w-5 h-5 rounded-full bg-gray-100 text-[10px] font-bold flex items-center justify-center text-gray-500">{p.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#0A1628] truncate">{p.name}</p>
                    <p className="text-[9px] text-gray-400">{p.sales} sales · {p.clicks.toLocaleString()} clicks · {p.convRate}% conv</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-green-600">₦{(p.revenue / 1e6).toFixed(1)}M</p>
                    <p className="text-[9px] text-orange">₦{(p.commission / 1e3).toFixed(0)}K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Performing Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
              <ShoppingCart size={16} className="text-green-600" /> Best Performing Products
            </h3>
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#0A1628]">{p.name}</p>
                    <p className="text-[10px] text-gray-400">{p.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-green-600">₦{(p.revenue / 1e6).toFixed(1)}M</p>
                    <p className="text-[10px] text-orange">₦{(p.commission / 1e3).toFixed(0)}K comm.</p>
                  </div>
                  <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(p.revenue / topProducts[0].revenue) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Source Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
              <Globe size={16} className="text-blue" /> Traffic Source Breakdown
            </h3>
            <div className="space-y-2.5">
              {trafficSources.map((t) => (
                <div key={t.source}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{t.source}</span>
                    <span className="text-gray-500">{t.clicks.toLocaleString()} clicks ({t.percentage}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue rounded-full transition-all" style={{ width: `${t.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Country Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-orange" /> Country Breakdown
            </h3>
            <div className="space-y-2.5">
              {countryBreakdown.map((c) => (
                <div key={c.country}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-6 text-[10px] font-mono font-bold text-gray-400">{c.code}</span>
                      <span className="text-gray-600 font-medium">{c.country}</span>
                    </span>
                    <span className="text-gray-500">{c.clicks.toLocaleString()} clicks ({c.percentage}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange rounded-full transition-all" style={{ width: `${c.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Rates by Partner Tier */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
              <Percent size={16} className="text-purple-600" /> Conversion Rates by Partner Tier
            </h3>
            <div className="space-y-3">
              {conversionByTier.map((t) => (
                <div key={t.tier}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">{t.tier}</span>
                      <span className="text-gray-400">({t.partners} partners)</span>
                    </span>
                    <div className="flex gap-3">
                      <span className="font-semibold text-blue">{t.convRate}%</span>
                      <span className="text-gray-400">₦{(t.avgOrderValue / 1e3).toFixed(0)}K AOV</span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue to-purple-600 rounded-full transition-all" style={{ width: `${(t.convRate / conversionByTier[conversionByTier.length - 1].convRate) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
