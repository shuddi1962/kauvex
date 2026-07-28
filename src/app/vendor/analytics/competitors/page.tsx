"use client";

import { useState } from "react";
import { Search, TrendingUp, Tag, BarChart3, Info } from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";
import { SimpleBarChart, PeriodSelector } from "@/components/vendor/analytics";

const priceComparisons = [
  { product: "Wireless Bluetooth Earbuds Pro", yourPrice: 49900, avgPrice: 54200, minPrice: 42500, maxPrice: 64900 },
  { product: "Smart Home Security Camera", yourPrice: 40000, avgPrice: 38500, minPrice: 32000, maxPrice: 48000 },
  { product: "Ergonomic Office Chair", yourPrice: 60000, avgPrice: 69500, minPrice: 55000, maxPrice: 85000 },
  { product: "Noise Cancelling Headphones", yourPrice: 50000, avgPrice: 54000, minPrice: 42000, maxPrice: 72000 },
  { product: "Portable Power Bank 20000mAh", yourPrice: 30000, avgPrice: 28500, minPrice: 22000, maxPrice: 38000 },
];

const categoryGrowth = [
  { category: "Electronics", growth: 18.5, color: "#FF6B00" },
  { category: "Home & Kitchen", growth: 14.2, color: "#0A1628" },
  { category: "Fashion", growth: 12.8, color: "#7C3AED" },
  { category: "Health & Beauty", growth: 11.3, color: "#059669" },
  { category: "Sports & Outdoors", growth: 9.7, color: "#D97706" },
  { category: "Books & Media", growth: 6.4, color: "#3B82F6" },
  { category: "Automotive", growth: 5.1, color: "#EF4444" },
];

const searchTrends = [
  { keyword: "wireless earbuds", growth: 34, volume: 12500 },
  { keyword: "smart home camera", growth: 28, volume: 9800 },
  { keyword: "noise cancelling headphones", growth: 22, volume: 7800 },
  { keyword: "power bank", growth: 19, volume: 6500 },
  { keyword: "mechanical keyboard", growth: 17, volume: 5200 },
  { keyword: "ergonomic chair", growth: 15, volume: 4800 },
  { keyword: "usb c hub", growth: 14, volume: 3900 },
  { keyword: "wireless charger", growth: 12, volume: 3500 },
  { keyword: "webcam 4k", growth: 10, volume: 2800 },
  { keyword: "laptop stand", growth: 8, volume: 2100 },
];

const formatNgn = (v: number) => `₦${(v / 1000).toFixed(0)}K`;

export default function AnalyticsCompetitors() {
  const [period, setPeriod] = useState("30d");

  return (
    <VendorShell title="Competitor Intelligence" subtitle="Market trends and positioning">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <Info size={12} className="text-blue-600 shrink-0" />
            <p className="text-[10px] text-blue-700">
              All data is anonymized and aggregated across the platform. No individual competitor data is shown.
            </p>
          </div>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* Price Comparison */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-bold text-sm text-text-1 flex items-center gap-2 mb-4">
            <Tag size={15} className="text-orange" /> Price Comparison — Your Price vs Category Average
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-3 py-2 font-semibold text-text-4 text-[10px]">Product</th>
                  <th className="text-right px-3 py-2 font-semibold text-text-4 text-[10px]">Your Price</th>
                  <th className="text-right px-3 py-2 font-semibold text-text-4 text-[10px]">Avg Price</th>
                  <th className="text-right px-3 py-2 font-semibold text-text-4 text-[10px]">Min</th>
                  <th className="text-right px-3 py-2 font-semibold text-text-4 text-[10px]">Max</th>
                  <th className="text-right px-3 py-2 font-semibold text-text-4 text-[10px]">vs Avg</th>
                </tr>
              </thead>
              <tbody>
                {priceComparisons.map((p) => {
                  const diff = p.yourPrice - p.avgPrice;
                  const diffPct = ((diff / p.avgPrice) * 100).toFixed(1);
                  return (
                    <tr key={p.product} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-semibold text-text-1">{p.product}</td>
                      <td className="px-3 py-2.5 text-right font-medium">{formatNgn(p.yourPrice)}</td>
                      <td className="px-3 py-2.5 text-right text-text-3">{formatNgn(p.avgPrice)}</td>
                      <td className="px-3 py-2.5 text-right text-green-600">{formatNgn(p.minPrice)}</td>
                      <td className="px-3 py-2.5 text-right text-red-500">{formatNgn(p.maxPrice)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`font-semibold ${diff <= 0 ? "text-green-600" : "text-orange"}`}>
                          {diff <= 0 ? "-" : "+"}{diffPct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Category Growth */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm text-text-1 flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-orange" /> Category Growth Trends
            </h3>
            <p className="text-[10px] text-text-4 mb-4">Year-over-year growth by category on Kauvex</p>
            <SimpleBarChart
              data={categoryGrowth.map((c) => ({ label: c.category, value: c.growth, color: c.color }))}
              height={260}
              horizontal
              formatValue={(v) => `${v.toFixed(1)}%`}
            />
          </div>

          {/* Search Keyword Trends */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm text-text-1 flex items-center gap-2 mb-4">
              <Search size={15} className="text-orange" /> Top Search Keywords
            </h3>
            <p className="text-[10px] text-text-4 mb-4">Highest growth search terms on Kauvex</p>
            <div className="space-y-2">
              {searchTrends.map((s) => (
                <div key={s.keyword} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-text-1">{s.keyword}</span>
                      <span className="text-[10px] font-semibold text-green-600">+{s.growth}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange rounded-full"
                          style={{ width: `${(s.volume / Math.max(...searchTrends.map((x) => x.volume))) * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-text-4 w-12 text-right">{s.volume.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </VendorShell>
  );
}
