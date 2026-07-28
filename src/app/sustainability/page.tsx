"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight, Leaf, Trees, Cloud, ShoppingBag,
  ArrowRight, Factory, Ship, Truck, Building2,
  Tractor, Cpu, TrendingDown, BarChart3, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statsCards = [
  { label: "Total CO2 Tracked", value: "12,450", unit: "tonnes", icon: Cloud, color: "bg-blue-50 text-blue-600", change: "+8.2% vs last month" },
  { label: "Trees Planted", value: "45,200", unit: "", icon: Trees, color: "bg-green-50 text-green-600", change: "+2,300 this month" },
  { label: "Carbon Offsets", value: "8,320", unit: "tonnes", icon: Leaf, color: "bg-emerald-50 text-emerald-600", change: "15% of total emissions" },
  { label: "Eco-Friendly Orders", value: "28,456", unit: "", icon: ShoppingBag, color: "bg-teal-50 text-teal-600", change: "34% of all orders" },
];

const industryData = [
  { name: "Construction", co2: 4520, trees: 12000, offset: 3100, efficiency: "B" },
  { name: "Marine & Shipping", co2: 3800, trees: 8500, offset: 2500, efficiency: "C" },
  { name: "Oil & Gas", co2: 6200, trees: 15000, offset: 4800, efficiency: "C" },
  { name: "Industrial Manufacturing", co2: 5100, trees: 11000, offset: 3500, efficiency: "B" },
  { name: "Agriculture", co2: 2800, trees: 25000, offset: 4200, efficiency: "A" },
  { name: "Transportation & Logistics", co2: 4800, trees: 8000, offset: 2900, efficiency: "B" },
  { name: "ICT & Technology", co2: 1200, trees: 4500, offset: 900, efficiency: "A" },
  { name: "Power & Energy", co2: 7200, trees: 18000, offset: 5500, efficiency: "C" },
];

const monthlyTrend = [
  { month: "Jan", co2: 980, orders: 1850 },
  { month: "Feb", co2: 1020, orders: 2100 },
  { month: "Mar", co2: 950, orders: 2350 },
  { month: "Apr", co2: 1080, orders: 2200 },
  { month: "May", co2: 1120, orders: 2600 },
  { month: "Jun", co2: 1050, orders: 2800 },
  { month: "Jul", co2: 1150, orders: 2950 },
  { month: "Aug", co2: 1100, orders: 3100 },
];

export default function SustainabilityPage() {
  const [chartView, setChartView] = useState<"co2" | "orders">("co2");

  const maxCo2 = Math.max(...monthlyTrend.map((m) => m.co2));
  const maxOrders = Math.max(...monthlyTrend.map((m) => m.orders));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Sustainability Dashboard</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center">
            <Leaf size={28} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1628]">Sustainability Dashboard</h1>
            <p className="text-gray-500 mt-1">Track your environmental impact and carbon footprint across operations</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">
                  {s.value}
                  {s.unit && <span className="text-sm font-normal text-gray-400 ml-1">{s.unit}</span>}
                </p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.change}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#0A1628]">Monthly Trend</h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setChartView("co2")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    chartView === "co2" ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  CO2 (tonnes)
                </button>
                <button
                  onClick={() => setChartView("orders")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    chartView === "orders" ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  Eco Orders
                </button>
              </div>
            </div>
            <div className="flex items-end gap-2 h-40">
              {monthlyTrend.map((m) => {
                const max = chartView === "co2" ? maxCo2 : maxOrders;
                const val = chartView === "co2" ? m.co2 : m.orders;
                const height = (val / max) * 100;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400">{chartView === "co2" ? m.co2 : m.orders}</span>
                    <div
                      className="w-full rounded-md bg-[#FF6B00]/80 hover:bg-[#FF6B00] transition-colors"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[10px] text-gray-500">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-[#0A1628] mb-4">Industry Breakdown</h2>
            <div className="space-y-3">
              {industryData.slice(0, 6).map((ind) => (
                <div key={ind.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#0A1628]">{ind.name}</span>
                    <Badge variant={ind.efficiency === "A" ? "success" : ind.efficiency === "B" ? "warning" : "error"}>
                      {ind.efficiency}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#0A1628]">{ind.co2.toLocaleString()}t CO2</p>
                    <p className="text-[10px] text-gray-400">{ind.trees.toLocaleString()} trees</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="font-bold text-[#0A1628] mb-4">Per-Industry Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Industry</th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">CO2 (tonnes)</th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">Trees Planted</th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">Offsets (tonnes)</th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {industryData.map((ind) => (
                  <tr key={ind.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-[#0A1628]">{ind.name}</td>
                    <td className="py-3 px-2 text-right">{ind.co2.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right">{ind.trees.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right">{ind.offset.toLocaleString()}</td>
                    <td className="py-3 px-2 text-right">
                      <Badge variant={ind.efficiency === "A" ? "success" : ind.efficiency === "B" ? "warning" : "error"}>
                        {ind.efficiency}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white">
          <div className="flex items-center gap-4 flex-wrap justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Offset Your Carbon Footprint</h3>
              <p className="text-green-100 text-sm max-w-xl">
                Join our tree planting initiative. For every order, we plant a tree. 
                You can offset additional emissions through verified carbon credits.
              </p>
            </div>
            <Link href="/express/carbon">
              <Button className="bg-white text-green-700 hover:bg-green-50">
                Offset Now <ExternalLink size={14} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
