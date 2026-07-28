"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight, Leaf, Trees, Cloud, ShoppingBag,
  Factory, Ship, Truck, BarChart3, TrendingDown,
  ExternalLink, Sun, Wind, Droplets, Recycle,
  Award, Globe, ArrowUpRight, Zap, Footprints,
  Download, RefreshCw, CheckCircle, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Tab = "overview" | "carbon" | "initiatives" | "reports";

const tabs: { id: Tab; label: string; icon: typeof Leaf }[] = [
  { id: "overview", label: "Overview", icon: Leaf },
  { id: "carbon", label: "Carbon Tracker", icon: Cloud },
  { id: "initiatives", label: "Green Initiatives", icon: Trees },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

const industryBreakdown = [
  { name: "Construction", co2: 4520, trees: 12000, offset: 3100, efficiency: "B", orders: 8450, icon: Factory },
  { name: "Marine & Shipping", co2: 3800, trees: 8500, offset: 2500, efficiency: "C", orders: 3200, icon: Ship },
  { name: "Oil & Gas", co2: 6200, trees: 15000, offset: 4800, efficiency: "C", orders: 2100, icon: Truck },
  { name: "Manufacturing", co2: 5100, trees: 11000, offset: 3500, efficiency: "B", orders: 12400, icon: Factory },
  { name: "Agriculture", co2: 2800, trees: 25000, offset: 4200, efficiency: "A", orders: 6800, icon: Leaf },
  { name: "Transportation", co2: 4800, trees: 8000, offset: 2900, efficiency: "B", orders: 5200, icon: Truck },
  { name: "ICT & Technology", co2: 1200, trees: 4500, offset: 900, efficiency: "A", orders: 18400, icon: Cloud },
  { name: "Power & Energy", co2: 7200, trees: 18000, offset: 5500, efficiency: "C", orders: 3600, icon: Zap },
];

const monthlyTrend = [
  { month: "Jan", co2: 980, orders: 1850, trees: 1200, energy: 450 },
  { month: "Feb", co2: 1020, orders: 2100, trees: 1400, energy: 480 },
  { month: "Mar", co2: 950, orders: 2350, trees: 1600, energy: 520 },
  { month: "Apr", co2: 1080, orders: 2200, trees: 1800, energy: 500 },
  { month: "May", co2: 1120, orders: 2600, trees: 2100, energy: 550 },
  { month: "Jun", co2: 1050, orders: 2800, trees: 2400, energy: 580 },
  { month: "Jul", co2: 1150, orders: 2950, trees: 2600, energy: 600 },
  { month: "Aug", co2: 1100, orders: 3100, trees: 2800, energy: 620 },
  { month: "Sep", co2: 1080, orders: 3400, trees: 3000, energy: 640 },
  { month: "Oct", co2: 1140, orders: 3700, trees: 3200, energy: 660 },
  { month: "Nov", co2: 1060, orders: 3900, trees: 3500, energy: 680 },
  { month: "Dec", co2: 980, orders: 3500, trees: 4500, energy: 700 },
];

const initiatives = [
  {
    id: "tree-planting", title: "Tree Planting Initiative",
    description: "One tree planted for every order shipped through Kauvex. Partnered with local reforestation NGOs across Nigeria and Africa.",
    icon: Trees, color: "bg-green-50 text-green-600",
    stat: "45,200", statLabel: "Trees Planted", progress: 72,
    target: "100,000 by 2027",
  },
  {
    id: "solar-warehouses", title: "Solar-Powered Warehouses",
    description: "Transitioning all Kauvex fulfillment centers to solar energy. 3 warehouses already 100% solar-powered.",
    icon: Sun, color: "bg-yellow-50 text-yellow-600",
    stat: "3", statLabel: "Solar Warehouses", progress: 43,
    target: "7 by 2028",
  },
  {
    id: "eco-packaging", title: "Eco-Friendly Packaging",
    description: "Eliminating single-use plastics. All Kauvex Express packaging is now 100% biodegradable or recycled.",
    icon: Recycle, color: "bg-teal-50 text-teal-600",
    stat: "100%", statLabel: "Biodegradable", progress: 100,
    target: "Zero plastic by 2026",
  },
  {
    id: "electric-fleet", title: "Electric Delivery Fleet",
    description: "Electric vans and bikes for last-mile delivery in Lagos, Abuja, and Port Harcourt. Reducing urban emissions.",
    icon: Truck, color: "bg-blue-50 text-blue-600",
    stat: "24", statLabel: "EV Fleet", progress: 34,
    target: "100 EVs by 2029",
  },
  {
    id: "carbon-offsets", title: "Carbon Offset Program",
    description: "Verified carbon credits from afforestation and clean energy projects. Available for vendors and customers at checkout.",
    icon: Cloud, color: "bg-emerald-50 text-emerald-600",
    stat: "8,320t", statLabel: "CO2 Offsets", progress: 55,
    target: "15,000t by 2027",
  },
  {
    id: "waste-reduction", title: "Waste Reduction Program",
    description: "Warehouse waste sorting, composting, and recycling partnerships. Zero waste to landfill goal for all facilities.",
    icon: Droplets, color: "bg-cyan-50 text-cyan-600",
    stat: "68%", statLabel: "Waste Diverted", progress: 68,
    target: "90% by 2028",
  },
];

const metrics = [
  { label: "Total CO₂ Footprint", value: 12450, unit: "tonnes", icon: Footprints, color: "bg-blue-50 text-blue-600" },
  { label: "Trees Planted", value: 45200, unit: "", icon: Trees, color: "bg-green-50 text-green-600" },
  { label: "Carbon Offsets", value: 8320, unit: "tonnes", icon: Cloud, color: "bg-emerald-50 text-emerald-600" },
  { label: "Eco-Friendly Orders", value: 28456, unit: "", icon: ShoppingBag, color: "bg-teal-50 text-teal-600" },
  { label: "Renewable Energy", value: 43, unit: "%", icon: Sun, color: "bg-yellow-50 text-yellow-600" },
  { label: "Waste Diverted", value: 68, unit: "%", icon: Recycle, color: "bg-cyan-50 text-cyan-600" },
];

function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{value.toLocaleString()}{suffix}</>;
}

export default function SustainabilityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [chartMetric, setChartMetric] = useState<"co2" | "orders" | "trees" | "energy">("co2");
  const [co2Saved, setCo2Saved] = useState(0);
  const [treesCount, setTreesCount] = useState(0);
  const [wasteReduced, setWasteReduced] = useState(0);
  const [renewablePct, setRenewablePct] = useState(0);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const t1 = setInterval(() => {
      setCo2Saved((v) => Math.min(v + 0.5, 12450));
    }, 300);
    const t2 = setInterval(() => {
      setTreesCount((v) => Math.min(v + 2, 45200));
    }, 150);
    const t3 = setInterval(() => {
      setWasteReduced((v) => Math.min(v + 0.2, 68));
    }, 500);
    const t4 = setInterval(() => {
      setRenewablePct((v) => Math.min(v + 0.1, 43));
    }, 800);
    return () => {
      clearInterval(t1); clearInterval(t2); clearInterval(t3); clearInterval(t4);
    };
  }, []);

  const maxChart = useMemo(() => {
    const vals = monthlyTrend.map((m) => m[chartMetric]);
    return Math.max(...vals);
  }, [chartMetric]);

  const chartColor = useMemo(() => {
    switch (chartMetric) {
      case "co2": return "bg-blue-500";
      case "orders": return "bg-[#FF6B00]";
      case "trees": return "bg-green-500";
      case "energy": return "bg-yellow-500";
    }
  }, [chartMetric]);

  const totalImpact = useMemo(() => {
    return {
      totalCo2: monthlyTrend.reduce((a, m) => a + m.co2, 0),
      totalOrders: monthlyTrend.reduce((a, m) => a + m.orders, 0),
      totalTrees: monthlyTrend.reduce((a, m) => a + m.trees, 0),
      totalEnergy: monthlyTrend.reduce((a, m) => a + m.energy, 0),
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Sustainability Dashboard</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#0A1628] to-[#162040] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-3xl">
            <div className="w-14 h-14 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center mb-4">
              <Leaf size={28} className="text-[#FF6B00]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Sustainability Dashboard</h1>
            <p className="text-gray-300 text-lg">
              Real-time environmental impact tracking. See how Kauvex and its community
              are driving positive change across Africa.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="bg-white rounded-xl border border-gray-200 p-1 shadow-md mb-6 inline-flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? "bg-[#FF6B00] text-white" : "text-gray-500 hover:text-[#0A1628]"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {metrics.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${m.color}`}>
                      <Icon size={18} />
                    </div>
                    <p className="text-xl font-bold text-[#0A1628]">
                      <AnimatedCounter target={m.value} />
                      {m.unit && <span className="text-xs font-normal text-gray-400 ml-1">{m.unit}</span>}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{m.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[#0A1628]">2026 Monthly Trend</h2>
                  <div className="flex gap-1">
                    {(["co2", "orders", "trees", "energy"] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => setChartMetric(k)}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                          chartMetric === k
                            ? "bg-[#0A1628] text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {k === "co2" ? "CO₂" : k === "orders" ? "Orders" : k === "trees" ? "Trees" : "Energy"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-48">
                  {monthlyTrend.map((m) => {
                    const height = (m[chartMetric] / maxChart) * 100;
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1 justify-end">
                        <span className="text-[9px] text-gray-400">{m[chartMetric]}</span>
                        <div
                          className={`w-full rounded-t-md transition-all duration-500 ${chartColor}`}
                          style={{ height: `${height}%`, minHeight: height > 0 ? "4px" : "0" }}
                        />
                        <span className="text-[9px] text-gray-500">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span>Total CO₂: <strong className="text-[#0A1628]">{totalImpact.totalCo2.toLocaleString()}t</strong></span>
                  <span>Eco Orders: <strong className="text-[#0A1628]">{totalImpact.totalOrders.toLocaleString()}</strong></span>
                  <span>Trees: <strong className="text-[#0A1628]">{totalImpact.totalTrees.toLocaleString()}</strong></span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-[#0A1628] mb-4">Industry Emissions Breakdown</h2>
                <div className="space-y-2">
                  {industryBreakdown.map((ind) => {
                    const Icon = ind.icon;
                    const barWidth = (ind.co2 / 7200) * 100;
                    return (
                      <div key={ind.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <Icon size={12} className="text-gray-400" />
                            <span className="text-[#0A1628] font-medium">{ind.name}</span>
                            <Badge
                              variant={ind.efficiency === "A" ? "success" : ind.efficiency === "B" ? "warning" : "error"}
                            >
                              {ind.efficiency}
                            </Badge>
                          </div>
                          <span className="text-gray-500">{ind.co2.toLocaleString()}t</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#FF6B00] transition-all duration-700"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 sm:p-8 text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Heart size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Our Planet, Our Commitment</h3>
                    <p className="text-green-100 text-sm max-w-lg">
                      Every order shipped through Kauvex contributes to reforestation and carbon offset projects.
                      Join us in building a sustainable future for African commerce.
                    </p>
                  </div>
                </div>
                <Link href="/express/carbon">
                  <Button className="bg-white text-green-700 hover:bg-green-50 shrink-0">
                    View Carbon Tracker <ArrowUpRight size={14} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "carbon" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Footprints size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0A1628]">
                      <AnimatedCounter target={Math.round(co2Saved)} />
                      <span className="text-sm font-normal text-gray-400 ml-1">tonnes</span>
                    </p>
                    <p className="text-xs text-gray-500">Total CO₂ Tracked</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingDown size={12} /> 8.2% vs last month
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <Cloud size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0A1628]">
                      <AnimatedCounter target={8320} />
                      <span className="text-sm font-normal text-gray-400 ml-1">tonnes</span>
                    </p>
                    <p className="text-xs text-gray-500">Carbon Offsets</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${(8320 / 12450) * 100}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{((8320 / 12450) * 100).toFixed(0)}% offset rate</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                    <Zap size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0A1628]">
                      <AnimatedCounter target={7120} />
                      <span className="text-sm font-normal text-gray-400 ml-1">MWh</span>
                    </p>
                    <p className="text-xs text-gray-500">Renewable Energy Generated</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Saved 2,850t CO₂ equivalent</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-[#0A1628] mb-4">Per-Industry Carbon Data</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Industry</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">CO₂ (tonnes)</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">Trees Planted</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">Offsets</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">Orders</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">Efficiency</th>
                      <th className="text-right py-3 px-2 text-gray-500 font-medium">Per Order (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {industryBreakdown.map((ind) => (
                      <tr key={ind.name} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium text-[#0A1628]">{ind.name}</td>
                        <td className="py-3 px-2 text-right">{ind.co2.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right">{ind.trees.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right">{ind.offset.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right">{ind.orders.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right">
                          <Badge
                            variant={ind.efficiency === "A" ? "success" : ind.efficiency === "B" ? "warning" : "error"}
                          >
                            {ind.efficiency}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right font-medium">
                          {((ind.co2 * 1000) / ind.orders).toFixed(1)} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <RefreshCw size={18} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Live Tracking Active</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Carbon data updates in real-time from shipping, warehouse, and energy systems.
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "initiatives" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {initiatives.map((init) => {
                const Icon = init.icon;
                return (
                  <div key={init.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${init.color}`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="font-semibold text-[#0A1628]">{init.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 mb-3">{init.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-[#0A1628]">{init.stat}</span>
                      <span className="text-[10px] text-gray-400">{init.statLabel}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#FF6B00] transition-all duration-1000"
                        style={{ width: `${init.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-gray-400">{init.progress}% complete</span>
                      <span className="text-[10px] text-gray-500 font-medium">{init.target}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-[#0A1628] to-[#162040] rounded-xl p-6 sm:p-8 text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center shrink-0">
                    <Award size={24} className="text-[#FF6B00]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Offset Your Carbon Footprint</h3>
                    <p className="text-gray-300 text-sm max-w-lg">
                      Join our tree planting initiative. For every order, we plant a tree.
                      You can offset additional emissions through verified carbon credits.
                    </p>
                  </div>
                </div>
                <Link href="/express/carbon">
                  <Button className="bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90">
                    Offset Now <ExternalLink size={14} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Annual Sustainability Report 2025",
                  desc: "Comprehensive overview of environmental impact, carbon footprint, green initiatives, and community engagement for FY 2025.",
                  date: "Published Jan 2026", icon: BarChart3, color: "bg-blue-50 text-blue-600",
                },
                {
                  title: "Carbon Footprint Analysis Q2 2026",
                  desc: "Detailed emissions breakdown by industry, logistics route, and warehouse operations. Includes offset recommendations.",
                  date: "Published Jul 2026", icon: Cloud, color: "bg-emerald-50 text-emerald-600",
                },
                {
                  title: "Tree Planting Impact Report",
                  desc: "Progress report on the Kauvex reforestation partnership. 45,200+ trees planted across 12 sites in 5 countries.",
                  date: "Published Jun 2026", icon: Trees, color: "bg-green-50 text-green-600",
                },
                {
                  title: "Renewable Energy Transition Whitepaper",
                  desc: "Technical overview of Kauvex warehouse solar installations, EV fleet rollout, and energy efficiency metrics.",
                  date: "Published May 2026", icon: Sun, color: "bg-yellow-50 text-yellow-600",
                },
                {
                  title: "Waste Reduction & Circular Economy Report",
                  desc: "Progress toward zero-waste operations. Packaging optimization, recycling partnerships, and material recovery rates.",
                  date: "Published Apr 2026", icon: Recycle, color: "bg-teal-50 text-teal-600",
                },
                {
                  title: "Community & Social Impact Report 2025",
                  desc: "Education, healthcare, and economic empowerment programs supported by Kauvex sustainability revenue.",
                  date: "Published Mar 2026", icon: Heart, color: "bg-red-50 text-red-600",
                },
              ].map((report) => {
                const Icon = report.icon;
                return (
                  <div key={report.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.color}`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-[#0A1628]">{report.title}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{report.date}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">{report.desc}</p>
                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Download size={14} className="mr-1.5" /> Download PDF
                      </Button>
                      <Button size="sm" variant="ghost">
                        View Online <ArrowUpRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 sm:p-8 text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Sustainable Development Goals</h3>
                    <p className="text-green-100 text-sm max-w-lg">
                      Kauvex sustainability initiatives align with UN SDG 7 (Clean Energy), SDG 12 (Responsible Consumption),
                      SDG 13 (Climate Action), and SDG 15 (Life on Land).
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[7, 12, 13, 15].map((g) => (
                    <span key={g} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
