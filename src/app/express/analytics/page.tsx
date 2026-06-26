"use client";

import { useState } from "react";
import { Calendar, TrendingUp, TrendingDown, Package, DollarSign, Truck, Clock, Leaf, MapPin, Download, Filter } from "lucide-react";

const SHIPMENT_BREAKDOWN = [
  { label: "Total Shipped", value: "12,847", change: "+12.3%", up: true },
  { label: "Delivered", value: "11,902", change: "+14.1%", up: true },
  { label: "In Transit", value: "623", change: "+5.2%", up: true },
  { label: "Exceptions", value: "142", change: "-8.3%", up: false },
  { label: "Returns", value: "180", change: "+2.1%", up: true },
  { label: "Avg. Cost/Shipment", value: "$3.76", change: "-4.2%", up: false },
];

const VOLUME_DATA = [
  { month: "Jan", value: 820 },
  { month: "Feb", value: 950 },
  { month: "Mar", value: 1100 },
  { month: "Apr", value: 980 },
  { month: "May", value: 1250 },
  { month: "Jun", value: 1400 },
  { month: "Jul", value: 1350 },
  { month: "Aug", value: 1500 },
  { month: "Sep", value: 1420 },
  { month: "Oct", value: 1600 },
  { month: "Nov", value: 1750 },
  { month: "Dec", value: 1847 },
];

const SPEND_DATA = [
  { month: "Jan", thisYear: 3100, lastYear: 2800 },
  { month: "Feb", thisYear: 3500, lastYear: 3000 },
  { month: "Mar", thisYear: 4200, lastYear: 3500 },
  { month: "Apr", thisYear: 3800, lastYear: 3200 },
  { month: "May", thisYear: 4800, lastYear: 3800 },
  { month: "Jun", thisYear: 5200, lastYear: 4100 },
  { month: "Jul", thisYear: 5000, lastYear: 4300 },
  { month: "Aug", thisYear: 5600, lastYear: 4500 },
  { month: "Sep", thisYear: 5300, lastYear: 4200 },
  { month: "Oct", thisYear: 6000, lastYear: 4800 },
  { month: "Nov", thisYear: 6500, lastYear: 5100 },
  { month: "Dec", thisYear: 7200, lastYear: 5400 },
];

const CATEGORIES = [
  { name: "Electronics", pct: 28, color: "#FF6B00" },
  { name: "Fashion", pct: 22, color: "#0A1628" },
  { name: "Documents", pct: 18, color: "#3B82F6" },
  { name: "Health", pct: 14, color: "#10B981" },
  { name: "Home & Garden", pct: 10, color: "#8B5CF6" },
  { name: "Other", pct: 8, color: "#9CA3AF" },
];

const DELIVERY_TIMES = [
  { city: "Lagos", avg: 0.8, p50: 0.7, p95: 1.5 },
  { city: "Abuja", avg: 1.2, p50: 1.0, p95: 2.0 },
  { city: "PH", avg: 1.5, p50: 1.3, p95: 2.5 },
  { city: "Accra", avg: 2.1, p50: 1.9, p95: 3.5 },
  { city: "Nairobi", avg: 3.2, p50: 2.8, p95: 5.0 },
  { city: "Johannesburg", avg: 4.5, p50: 4.0, p95: 6.5 },
  { city: "Dubai", avg: 2.8, p50: 2.5, p95: 4.0 },
  { city: "London", avg: 3.8, p50: 3.5, p95: 5.5 },
];

const CARRIERS = [
  { name: "GIG Logistics", shipments: 4200, onTime: 94, cost: 3.2, rating: 4.5 },
  { name: "FedEx", shipments: 2800, onTime: 97, cost: 4.8, rating: 4.7 },
  { name: "DHL Express", shipments: 2100, onTime: 96, cost: 5.5, rating: 4.6 },
  { name: "Aramex", shipments: 1500, onTime: 93, cost: 4.2, rating: 4.3 },
  { name: "Kwik Delivery", shipments: 1200, onTime: 89, cost: 2.8, rating: 4.1 },
  { name: "Local Partners", shipments: 1047, onTime: 86, cost: 2.5, rating: 3.9 },
];

const COST_BREAKDOWN = [
  { label: "Shipping Fees", value: 48291, color: "#FF6B00" },
  { label: "Insurance", value: 4200, color: "#3B82F6" },
  { label: "Packaging", value: 2800, color: "#10B981" },
  { label: "Fuel Surcharge", value: 3600, color: "#8B5CF6" },
  { label: "Customs & Duties", value: 1900, color: "#F59E0B" },
];

const CARBON_DATA = [
  { month: "Jan", co2: 12.5, offset: 3.2 },
  { month: "Feb", co2: 14.1, offset: 4.0 },
  { month: "Mar", co2: 16.2, offset: 5.1 },
  { month: "Apr", co2: 14.8, offset: 4.5 },
  { month: "May", co2: 18.5, offset: 6.2 },
  { month: "Jun", co2: 20.1, offset: 7.0 },
];

const MAP_ROUTES = [
  { from: "Lagos", to: "Abuja", count: 1240, color: "#FF6B00" },
  { from: "Lagos", to: "Accra", count: 560, color: "#3B82F6" },
  { from: "Lagos", to: "Nairobi", count: 320, color: "#10B981" },
  { from: "Abuja", to: "Kano", count: 430, color: "#8B5CF6" },
  { from: "Lagos", to: "PH", count: 890, color: "#F59E0B" },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d");
  const maxVol = Math.max(...VOLUME_DATA.map((d) => d.value));
  const maxSpend = Math.max(...SPEND_DATA.map((d) => Math.max(d.thisYear, d.lastYear)));
  const totalCarbon = CARBON_DATA.reduce((a, d) => a + d.co2, 0);
  const totalOffset = CARBON_DATA.reduce((a, d) => a + d.offset, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive shipping analytics and insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {["7d", "30d", "90d", "12m"].map((r) => (
              <button key={r} onClick={() => setDateRange(r)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${dateRange === r ? "bg-white shadow text-[#0A1628]" : "text-gray-500 hover:text-gray-700"}`}>{r}</button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg text-xs font-medium text-gray-600"><Download className="w-3.5 h-3.5" />Export</button>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {SHIPMENT_BREAKDOWN.map((b) => (
          <div key={b.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{b.label}</p>
            <p className="text-xl font-bold text-[#0A1628]">{b.value}</p>
            <span className={`text-xs font-medium ${b.up ? "text-green-600" : "text-red-600"}`}>{b.change}</span>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-[#0A1628] mb-5">Shipment Volume</h3>
          <div className="flex items-end gap-2 h-44">
            {VOLUME_DATA.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500 font-medium">{d.value}</span>
                <div className="w-full bg-[#FF6B00] rounded-t-md transition-all duration-500" style={{ height: `${(d.value / maxVol) * 100}%` }} />
                <span className="text-[10px] text-gray-400">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spend Line Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-[#0A1628]">Spend Over Time</h3>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />This Year</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300" />Last Year</span>
            </div>
          </div>
          <div className="relative h-44">
            <svg viewBox="0 0 600 160" className="w-full h-full" preserveAspectRatio="none">
              {[0, 1, 2, 3].map((i) => <line key={i} x1="0" y1={i * 53} x2="600" y2={i * 53} stroke="#F3F4F6" strokeWidth="1" />)}
              <polyline fill="none" stroke="#D1D5DB" strokeWidth="2" strokeDasharray="4 4" points={SPEND_DATA.map((d, i) => `${(i / 11) * 600},${160 - (d.lastYear / maxSpend) * 140}`).join(" ")} />
              <polyline fill="none" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" points={SPEND_DATA.map((d, i) => `${(i / 11) * 600},${160 - (d.thisYear / maxSpend) * 140}`).join(" ")} />
              {SPEND_DATA.map((d, i) => <circle key={i} cx={(i / 11) * 600} cy={160 - (d.thisYear / maxSpend) * 140} r="3" fill="#FF6B00" />)}
            </svg>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-[#0A1628] mb-5">Categories</h3>
          <div className="relative mx-auto w-36 h-36 mb-4">
            <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(${CATEGORIES.map((c, i) => { const off = CATEGORIES.slice(0, i).reduce((a, x) => a + x.pct, 0); return `${c.color} ${off}% ${off + c.pct}%`; }).join(", ")})` }} />
            <div className="absolute inset-5 bg-white rounded-full flex items-center justify-center flex-col">
              <span className="text-lg font-bold text-[#0A1628]">6</span>
              <span className="text-[10px] text-gray-500">Categories</span>
            </div>
          </div>
          <div className="space-y-1.5">
            {CATEGORIES.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-xs text-gray-600 flex-1">{c.name}</span>
                <span className="text-xs font-semibold text-gray-800">{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Times */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-[#0A1628] mb-5">Avg. Delivery Time (days)</h3>
          <div className="space-y-3">
            {DELIVERY_TIMES.map((d) => (
              <div key={d.city} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-24 shrink-0">{d.city}</span>
                <div className="flex-1 flex items-center gap-1">
                  <div className="bg-[#FF6B00] rounded h-4" style={{ width: `${(d.avg / 7) * 100}%` }} />
                  <span className="text-[11px] font-bold text-[#0A1628] ml-1">{d.avg}d</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-[#0A1628] mb-5">Cost Breakdown</h3>
          <div className="relative mx-auto w-36 h-36 mb-4">
            <div className="w-full h-full rounded-full" style={{ background: `conic-gradient(${COST_BREAKDOWN.map((c, i) => { const off = COST_BREAKDOWN.slice(0, i).reduce((a, x) => a + x.value, 0); const total = COST_BREAKDOWN.reduce((a, x) => a + x.value, 0); return `${c.color} ${(off / total) * 100}% ${((off + c.value) / total) * 100}%`; }).join(", ")})` }} />
            <div className="absolute inset-5 bg-white rounded-full flex items-center justify-center flex-col">
              <span className="text-sm font-bold text-[#0A1628]">$60.8K</span>
              <span className="text-[10px] text-gray-500">Total</span>
            </div>
          </div>
          <div className="space-y-1.5">
            {COST_BREAKDOWN.map((c) => (
              <div key={c.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-xs text-gray-600 flex-1">{c.label}</span>
                <span className="text-xs font-semibold text-gray-800">${(c.value / 1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carrier Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-[#0A1628] mb-5">Carrier Performance Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Carrier</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">Shipments</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">On-Time %</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">Avg Cost</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">Rating</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 w-40">On-Time Bar</th>
              </tr>
            </thead>
            <tbody>
              {CARRIERS.map((c) => (
                <tr key={c.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-[#0A1628]">{c.name}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{c.shipments.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold" style={{ color: c.onTime >= 95 ? "#10B981" : c.onTime >= 90 ? "#F59E0B" : "#EF4444" }}>{c.onTime}%</td>
                  <td className="py-3 px-4 text-right text-gray-600">${c.cost.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-[#FF6B00]">{"★".repeat(Math.floor(c.rating))}</span>
                    <span className="text-gray-300">{"★".repeat(5 - Math.floor(c.rating))}</span>
                    <span className="text-xs text-gray-500 ml-1">{c.rating}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${c.onTime >= 95 ? "bg-green-500" : c.onTime >= 90 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${c.onTime}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Carbon + Map Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carbon Footprint */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Leaf className="w-4.5 h-4.5 text-green-600" />
            <h3 className="text-sm font-semibold text-[#0A1628]">Carbon Footprint</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-green-700">{totalCarbon.toFixed(1)}</p>
              <p className="text-[11px] text-green-600">Total CO2 (tons)</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-blue-700">{totalOffset.toFixed(1)}</p>
              <p className="text-[11px] text-blue-600">Offset (tons)</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-[#FF6B00]">{((totalOffset / totalCarbon) * 100).toFixed(0)}%</p>
              <p className="text-[11px] text-[#FF6B00]">Offset Rate</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-28">
            {CARBON_DATA.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5">
                  <div className="flex-1 bg-red-300 rounded-t" style={{ height: `${(d.co2 / 22) * 100}px` }} />
                  <div className="flex-1 bg-green-400 rounded-t" style={{ height: `${(d.offset / 22) * 100}px` }} />
                </div>
                <span className="text-[10px] text-gray-400">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-300" />CO2 Emitted</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400" />CO2 Offset</span>
          </div>
        </div>

        {/* Map Analytics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-4.5 h-4.5 text-[#FF6B00]" />
            <h3 className="text-sm font-semibold text-[#0A1628]">Route Analytics</h3>
          </div>
          <div className="relative bg-[#0A1628] rounded-xl h-44 mb-4 overflow-hidden">
            <svg viewBox="0 0 400 180" className="w-full h-full">
              <circle cx="80" cy="120" r="4" fill="#FF6B00" /><text x="80" y="140" textAnchor="middle" fill="white" fontSize="9" opacity="0.6">Lagos</text>
              <circle cx="180" cy="50" r="4" fill="#3B82F6" /><text x="180" y="40" textAnchor="middle" fill="white" fontSize="9" opacity="0.6">Abuja</text>
              <circle cx="320" cy="30" r="3" fill="#10B981" /><text x="320" y="20" textAnchor="middle" fill="white" fontSize="9" opacity="0.6">Accra</text>
              <circle cx="280" cy="140" r="3" fill="#8B5CF6" /><text x="280" y="160" textAnchor="middle" fill="white" fontSize="9" opacity="0.6">PH</text>
              <line x1="80" y1="120" x2="180" y2="50" stroke="#FF6B00" strokeWidth="2" opacity="0.6" />
              <line x1="80" y1="120" x2="320" y2="30" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
              <line x1="180" y1="50" x2="320" y2="30" stroke="#10B981" strokeWidth="1.5" opacity="0.5" />
              <line x1="80" y1="120" x2="280" y2="140" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.5" />
            </svg>
          </div>
          <div className="space-y-2">
            {MAP_ROUTES.map((r) => (
              <div key={`${r.from}-${r.to}`} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                <span className="text-xs font-medium text-[#0A1628] flex-1">{r.from} → {r.to}</span>
                <span className="text-xs text-gray-500">{r.count.toLocaleString()} shipments</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
