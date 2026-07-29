"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight, TrendingUp, ShoppingCart, DollarSign, Users,
  Package, BarChart3, Search, MapPin, Star, Clock, Briefcase,
  Award, ArrowUpRight, ArrowDownRight, Truck, Globe, Building2,
  Zap, Target, Layers, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const industries = [
  "All Industries", "Construction", "Marine", "Oil & Gas", "Agriculture",
  "Manufacturing", "ICT", "Power & Energy", "Transportation", "Security",
  "Mining", "Healthcare", "Education",
];

const countries = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "UAE", "UK",
  "USA", "Canada", "Australia", "Germany", "France", "India",
  "Saudi Arabia", "Brazil", "Japan",
];

const overviewStats = [
  {
    section: "Demand Intelligence",
    icon: ShoppingCart,
    iconColor: "text-[#FF6B00]",
    bgColor: "bg-[#FFF4EC]",
    cards: [
      { label: "Total Monthly Searches", value: "2.4M", change: "+18.3%", trend: "up" },
      { label: "Top Searched Product", value: "Excavators", sub: "142K searches/mo" },
      { label: "Fastest Growing Category", value: "Solar Equipment", sub: "+47% MoM", trend: "up" },
    ],
  },
  {
    section: "Pricing Intelligence",
    icon: DollarSign,
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
    cards: [
      { label: "Avg Selling Price (All)", value: "$24,800", change: "+3.2%", trend: "up" },
      { label: "Price Range", value: "$500 - $4.5M", sub: "Across 13 industries" },
      { label: "Price Trend Index", value: "107.4", sub: "Base 100 — Up 7.4% YoY", trend: "up" },
    ],
  },
  {
    section: "Supply Intelligence",
    icon: Package,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    cards: [
      { label: "Active Suppliers", value: "18,742", change: "+12.1%", trend: "up" },
      { label: "Avg Supplier Rating", value: "4.3 ★", sub: "Across 15 countries" },
      { label: "Avg Lead Time", value: "14.6 days", change: "-2.1d", trend: "down" },
    ],
  },
  {
    section: "Project Intelligence",
    icon: Briefcase,
    iconColor: "text-violet-600",
    bgColor: "bg-violet-50",
    cards: [
      { label: "Active Projects", value: "3,892", change: "+8.7%", trend: "up" },
      { label: "Total Budgets (Live)", value: "$12.4B", sub: "Avg $3.2M per project" },
      { label: "Avg Winning Bid", value: "$2.8M", change: "-4.1%", trend: "down" },
    ],
  },
  {
    section: "Professional Intelligence",
    icon: Users,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-50",
    cards: [
      { label: "Pro Types Listed", value: "287", sub: "Across 15 industry hubs" },
      { label: "Avg Daily Rate", value: "$420", change: "+5.9%", trend: "up" },
      { label: "Supply/Demand Gap", value: "1:3.4", sub: "Shortage in 8 categories" },
    ],
  },
  {
    section: "Export/Import Intelligence",
    icon: Globe,
    iconColor: "text-cyan-600",
    bgColor: "bg-cyan-50",
    cards: [
      { label: "Top Import Category", value: "Industrial Machinery", sub: "34% of imports" },
      { label: "Top Export Category", value: "Agricultural Produce", sub: "28% of exports" },
      { label: "Top Source Country", value: "China", sub: "41% of total import value" },
    ],
  },
];

const categoryData = [
  { industry: "Construction", searches: "342K", avgPrice: "$85,000", suppliers: 2840, projects: 612, pros: 42, imports: "$2.1B", exports: "$890M", growth: "+22%", trend: "up" },
  { industry: "Marine", searches: "128K", avgPrice: "$210,000", suppliers: 940, projects: 215, pros: 28, imports: "$1.8B", exports: "$450M", growth: "+15%", trend: "up" },
  { industry: "Oil & Gas", searches: "295K", avgPrice: "$450,000", suppliers: 1240, projects: 387, pros: 56, imports: "$4.2B", exports: "$3.8B", growth: "+8%", trend: "up" },
  { industry: "Agriculture", searches: "410K", avgPrice: "$18,500", suppliers: 4520, projects: 895, pros: 34, imports: "$950M", exports: "$2.4B", growth: "+31%", trend: "up" },
  { industry: "Manufacturing", searches: "267K", avgPrice: "$95,000", suppliers: 3680, projects: 521, pros: 38, imports: "$3.6B", exports: "$1.9B", growth: "+11%", trend: "up" },
  { industry: "ICT", searches: "385K", avgPrice: "$12,000", suppliers: 2150, projects: 724, pros: 45, imports: "$2.8B", exports: "$1.2B", growth: "+27%", trend: "up" },
  { industry: "Power & Energy", searches: "198K", avgPrice: "$175,000", suppliers: 980, projects: 298, pros: 32, imports: "$3.1B", exports: "$520M", growth: "+19%", trend: "up" },
  { industry: "Transportation", searches: "156K", avgPrice: "$320,000", suppliers: 1120, projects: 186, pros: 24, imports: "$2.4B", exports: "$680M", growth: "+13%", trend: "up" },
  { industry: "Security", searches: "89K", avgPrice: "$8,500", suppliers: 760, projects: 142, pros: 18, imports: "$620M", exports: "$180M", growth: "+35%", trend: "up" },
  { industry: "Mining", searches: "74K", avgPrice: "$520,000", suppliers: 410, projects: 98, pros: 14, imports: "$1.5B", exports: "$2.1B", growth: "+7%", trend: "up" },
  { industry: "Healthcare", searches: "112K", avgPrice: "$45,000", suppliers: 650, projects: 167, pros: 22, imports: "$1.1B", exports: "$240M", growth: "+24%", trend: "up" },
  { industry: "Education", searches: "48K", avgPrice: "$3,200", suppliers: 320, projects: 85, pros: 16, imports: "$280M", exports: "$95M", growth: "+18%", trend: "up" },
];

const trendData = [
  { month: "Jan", demand: 100, pricing: 100, supply: 100, projects: 100 },
  { month: "Feb", demand: 108, pricing: 101, supply: 103, projects: 105 },
  { month: "Mar", demand: 115, pricing: 103, supply: 107, projects: 112 },
  { month: "Apr", demand: 120, pricing: 104, supply: 110, projects: 118 },
  { month: "May", demand: 132, pricing: 106, supply: 114, projects: 125 },
  { month: "Jun", demand: 145, pricing: 107, supply: 118, projects: 138 },
  { month: "Jul", demand: 158, pricing: 108, supply: 122, projects: 145 },
];

const regionalDemand = [
  { region: "West Africa", share: 38, topProduct: "Excavators", growth: "+24%" },
  { region: "East Africa", share: 18, topProduct: "Solar Panels", growth: "+41%" },
  { region: "Southern Africa", share: 22, topProduct: "Mining Equipment", growth: "+12%" },
  { region: "Middle East", share: 12, topProduct: "Oil & Gas Machinery", growth: "+9%" },
  { region: "Europe", share: 6, topProduct: "ICT Hardware", growth: "+15%" },
  { region: "Asia", share: 4, topProduct: "Marine Engines", growth: "+19%" },
];

const topImports = [
  { category: "Industrial Machinery", value: "$4.2B", source: "China", share: 34 },
  { category: "Oil & Gas Equipment", value: "$3.8B", source: "USA", share: 28 },
  { category: "ICT Hardware", value: "$2.8B", source: "China", share: 22 },
  { category: "Power Generators", value: "$2.1B", source: "Germany", share: 17 },
  { category: "Marine Engines", value: "$1.5B", source: "Japan", share: 12 },
];

const topExports = [
  { category: "Agricultural Produce", value: "$2.4B", destination: "EU", share: 28 },
  { category: "Crude Oil Equipment", value: "$1.8B", destination: "Asia", share: 21 },
  { category: "Mined Minerals", value: "$1.2B", destination: "China", share: 14 },
  { category: "Manufactured Goods", value: "$890M", destination: "Africa", share: 10 },
  { category: "Textiles & Raw Mats", value: "$620M", destination: "EU", share: 7 },
];

const topDemandedPros = [
  { role: "Civil Engineers", demand: 2450, avgRate: "$450", gap: "High" },
  { role: "Project Managers", demand: 1890, avgRate: "$520", gap: "High" },
  { role: "Electrical Engineers", demand: 1620, avgRate: "$480", gap: "Medium" },
  { role: "Heavy Equipment Operators", demand: 1420, avgRate: "$280", gap: "High" },
  { role: "Marine Engineers", demand: 870, avgRate: "$550", gap: "Medium" },
  { role: "Safety Officers", demand: 760, avgRate: "$320", gap: "Low" },
];

const fastestCategories = [
  { name: "Solar Equipment", growth: "+47%", revenue: "$890M", drivers: "Energy crisis, govt incentives" },
  { name: "Security Systems", growth: "+35%", revenue: "$620M", drivers: "Urbanization, insurgency" },
  { name: "Agri-Tech", growth: "+31%", revenue: "$1.2B", drivers: "Food security push" },
  { name: "ICT Hardware", growth: "+27%", revenue: "$2.8B", drivers: "Digital transformation" },
  { name: "Healthcare Equipment", growth: "+24%", revenue: "$1.1B", drivers: "Post-pandemic investment" },
];

function StatCard({ label, value, sub, change, trend, icon: Icon, iconColor, bgColor }: {
  label: string; value: string; sub?: string; change?: string; trend?: string;
  icon: any; iconColor: string; bgColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon size={18} className={iconColor} />
        </div>
        {change && (
          <Badge variant={trend === "up" ? "success" : "warning"} className="text-[10px] px-2 py-0.5">
            {trend === "up" ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
            {change}
          </Badge>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-[#0A1628]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function MarketplaceIntelligencePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [chartHover, setChartHover] = useState<number | null>(null);

  const filteredCategories = selectedIndustry === "All Industries"
    ? categoryData
    : categoryData.filter((c) => c.industry === selectedIndustry);

  const maxDemand = Math.max(...trendData.map((d) => d.demand));
  const maxPricing = Math.max(...trendData.map((d) => d.pricing));
  const maxSupply = Math.max(...trendData.map((d) => d.supply));
  const maxProjects = Math.max(...trendData.map((d) => d.projects));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/marketplace" className="hover:text-[#FF6B00]">Marketplace</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Industry Intelligence</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1628]">Marketplace Intelligence</h1>
            <p className="text-gray-500 mt-1">Data-driven insights across demand, pricing, supply, projects, professionals, and trade</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="navy" className="text-xs">Last updated: Today 06:00 UTC</Badge>
            <Button variant="outline" size="sm"><Activity size={14} className="mr-1" /> Export</Button>
          </div>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {[
            { id: "overview", label: "Overview", icon: Layers },
            { id: "categories", label: "Categories", icon: BarChart3 },
            { id: "trends", label: "Trends", icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#FF6B00] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#FF6B00]"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8">
            {overviewStats.map((section) => (
              <div key={section.section}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-lg ${section.bgColor} flex items-center justify-center`}>
                    <section.icon size={16} className={section.iconColor} />
                  </div>
                  <h2 className="text-lg font-bold text-[#0A1628]">{section.section}</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.cards.map((card, i) => (
                    <StatCard key={i} {...card} icon={section.icon} iconColor={section.iconColor} bgColor={section.bgColor} />
                  ))}
                </div>
              </div>
            ))}

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-[#FF6B00]" />
                  Regional Demand Breakdown
                </h3>
                <div className="space-y-4">
                  {regionalDemand.map((r) => (
                    <div key={r.region}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-medium text-[#0A1628]">{r.region}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{r.topProduct}</span>
                          <span className="text-xs font-semibold text-green-600">{r.growth}</span>
                          <span className="text-sm font-bold text-[#FF6B00]">{r.share}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-[#FF6B00] h-2 rounded-full transition-all" style={{ width: `${r.share * 2}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                  <Zap size={16} className="text-[#FF6B00]" />
                  Fastest Growing Sub-Categories
                </h3>
                <div className="space-y-4">
                  {fastestCategories.map((c, i) => (
                    <div key={c.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#FF6B00] text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <div>
                          <p className="text-sm font-semibold text-[#0A1628]">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.drivers}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">{c.growth}</p>
                        <p className="text-xs text-gray-400">{c.revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                  <Truck size={16} className="text-[#FF6B00]" />
                  Top Imports by Value
                </h3>
                <div className="space-y-3">
                  {topImports.map((imp) => (
                    <div key={imp.category} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="text-sm font-semibold text-[#0A1628]">{imp.category}</p>
                        <p className="text-xs text-gray-400">Source: {imp.source}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#FF6B00]">{imp.value}</p>
                        <p className="text-xs text-gray-400">{imp.share}% of total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                  <Award size={16} className="text-[#FF6B00]" />
                  Top Exports by Value
                </h3>
                <div className="space-y-3">
                  {topExports.map((exp) => (
                    <div key={exp.category} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="text-sm font-semibold text-[#0A1628]">{exp.category}</p>
                        <p className="text-xs text-gray-400">Destination: {exp.destination}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">{exp.value}</p>
                        <p className="text-xs text-gray-400">{exp.share}% of total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                <Star size={16} className="text-[#FF6B00]" />
                Top Demanded Professionals
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 font-semibold text-[#0A1628]">Role</th>
                      <th className="text-right py-3 font-semibold text-[#0A1628]">Open Positions</th>
                      <th className="text-right py-3 font-semibold text-[#0A1628]">Avg Daily Rate</th>
                      <th className="text-right py-3 font-semibold text-[#0A1628]">Supply Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDemandedPros.map((pro) => (
                      <tr key={pro.role} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 font-medium text-[#0A1628]">{pro.role}</td>
                        <td className="py-3 text-right font-semibold">{pro.demand.toLocaleString()}</td>
                        <td className="py-3 text-right">${pro.avgRate}/day</td>
                        <td className="py-3 text-right">
                          <Badge variant={pro.gap === "High" ? "error" : pro.gap === "Medium" ? "warning" : "success"} className="text-[10px]">{pro.gap}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
              >
                {industries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input placeholder="Search categories..." className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]" />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 ml-auto">
                <Building2 size={14} />
                <span>{filteredCategories.length} industries</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3.5 px-4 font-semibold text-[#0A1628]">Industry</th>
                      <th className="text-right py-3.5 px-4 font-semibold text-[#0A1628]">Monthly Searches</th>
                      <th className="text-right py-3.5 px-4 font-semibold text-[#0A1628]">Avg Price</th>
                      <th className="text-right py-3.5 px-4 font-semibold text-[#0A1628]">Active Suppliers</th>
                      <th className="text-right py-3.5 px-4 font-semibold text-[#0A1628]">Active Projects</th>
                      <th className="text-right py-3.5 px-4 font-semibold text-[#0A1628]">Pro Types</th>
                      <th className="text-right py-3.5 px-4 font-semibold text-[#0A1628]">Imports (Annual)</th>
                      <th className="text-right py-3.5 px-4 font-semibold text-[#0A1628]">Exports (Annual)</th>
                      <th className="text-right py-3.5 px-4 font-semibold text-[#0A1628]">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((c, i) => (
                      <tr key={c.industry} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === 0 ? "" : ""}`}>
                        <td className="py-3.5 px-4 font-semibold text-[#0A1628]">{c.industry}</td>
                        <td className="py-3.5 px-4 text-right">{c.searches}</td>
                        <td className="py-3.5 px-4 text-right font-medium">{c.avgPrice}</td>
                        <td className="py-3.5 px-4 text-right">{c.suppliers.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right">{c.projects.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right">{c.pros}</td>
                        <td className="py-3.5 px-4 text-right font-medium text-[#FF6B00]">{c.imports}</td>
                        <td className="py-3.5 px-4 text-right font-medium text-green-600">{c.exports}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`inline-flex items-center gap-0.5 font-semibold ${c.trend === "up" ? "text-green-600" : "text-red-500"}`}>
                            {c.trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {c.growth}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mt-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingCart size={16} className="text-[#FF6B00]" />
                  <h3 className="font-bold text-[#0A1628] text-sm">Highest Demand</h3>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">Agriculture</p>
                <p className="text-sm text-gray-400">410K monthly searches</p>
                <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-[#FF6B00] h-2 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={16} className="text-emerald-600" />
                  <h3 className="font-bold text-[#0A1628] text-sm">Highest Avg Price</h3>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">Mining</p>
                <p className="text-sm text-gray-400">$520K avg equipment price</p>
                <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={16} className="text-violet-600" />
                  <h3 className="font-bold text-[#0A1628] text-sm">Most Suppliers</h3>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">Agriculture</p>
                <p className="text-sm text-gray-400">4,520 active suppliers</p>
                <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "trends" && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={16} className="text-[#FF6B00]" />
                    <h3 className="font-bold text-[#0A1628]">Demand Index</h3>
                  </div>
                  <Badge variant="success" className="text-[10px]">+58% YTD</Badge>
                </div>
                <div className="relative h-48">
                  <div className="absolute inset-0 flex items-end justify-between px-2">
                    {trendData.map((d, i) => (
                      <div
                        key={d.month}
                        className="flex flex-col items-center gap-1 flex-1"
                        onMouseEnter={() => setChartHover(i)}
                        onMouseLeave={() => setChartHover(null)}
                      >
                        <div className="relative">
                          {chartHover === i && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A1628] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                              {d.demand}
                            </div>
                          )}
                          <div
                            className="w-8 sm:w-10 rounded-t-md bg-[#FF6B00] hover:bg-[#FF6B00]/80 transition-all cursor-pointer"
                            style={{ height: `${(d.demand / maxDemand) * 160}px` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400 border-t border-gray-100 pt-3">
                  <span>Jan 2026</span>
                  <span>Jul 2026</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-600" />
                    <h3 className="font-bold text-[#0A1628]">Pricing Index</h3>
                  </div>
                  <Badge variant="warning" className="text-[10px]">+8% YTD</Badge>
                </div>
                <div className="relative h-48">
                  <div className="absolute inset-0 flex items-end justify-between px-2">
                    {trendData.map((d, i) => (
                      <div key={d.month} className="flex flex-col items-center gap-1 flex-1">
                        <div
                          className="w-8 sm:w-10 rounded-t-md bg-emerald-500 hover:bg-emerald-400 transition-all cursor-pointer"
                          style={{ height: `${(d.pricing / maxPricing) * 160}px` }}
                        />
                        <span className="text-[10px] text-gray-400 mt-1">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400 border-t border-gray-100 pt-3">
                  <span>Jan 2026</span>
                  <span>Jul 2026</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-blue-600" />
                    <h3 className="font-bold text-[#0A1628]">Supply Index</h3>
                  </div>
                  <Badge variant="success" className="text-[10px]">+22% YTD</Badge>
                </div>
                <div className="relative h-48">
                  <div className="absolute inset-0 flex items-end justify-between px-2">
                    {trendData.map((d, i) => (
                      <div key={d.month} className="flex flex-col items-center gap-1 flex-1">
                        <div
                          className="w-8 sm:w-10 rounded-t-md bg-blue-500 hover:bg-blue-400 transition-all cursor-pointer"
                          style={{ height: `${(d.supply / maxSupply) * 160}px` }}
                        />
                        <span className="text-[10px] text-gray-400 mt-1">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400 border-t border-gray-100 pt-3">
                  <span>Jan 2026</span>
                  <span>Jul 2026</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-violet-600" />
                    <h3 className="font-bold text-[#0A1628]">Project Activity Index</h3>
                  </div>
                  <Badge variant="success" className="text-[10px]">+45% YTD</Badge>
                </div>
                <div className="relative h-48">
                  <div className="absolute inset-0 flex items-end justify-between px-2">
                    {trendData.map((d, i) => (
                      <div key={d.month} className="flex flex-col items-center gap-1 flex-1">
                        <div
                          className="w-8 sm:w-10 rounded-t-md bg-violet-500 hover:bg-violet-400 transition-all cursor-pointer"
                          style={{ height: `${(d.projects / maxProjects) * 160}px` }}
                        />
                        <span className="text-[10px] text-gray-400 mt-1">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400 border-t border-gray-100 pt-3">
                  <span>Jan 2026</span>
                  <span>Jul 2026</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-[#FF6B00]" />
                  <h3 className="font-bold text-[#0A1628]">All Indexes — Combined View (Base 100)</h3>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#FF6B00]" /> Demand</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" /> Pricing</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-500" /> Supply</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-violet-500" /> Projects</div>
                </div>
              </div>
              <div className="relative h-64">
                <div className="absolute inset-0 flex items-end justify-between px-2">
                  {trendData.map((d, i) => {
                    const maxAll = Math.max(maxDemand, maxPricing, maxSupply, maxProjects);
                    return (
                      <div key={d.month} className="flex items-end gap-1 flex-1 h-full">
                        <div className="flex flex-col items-center justify-end flex-1 h-full">
                          <div className="w-3 sm:w-4 rounded-t-sm bg-[#FF6B00] transition-all" style={{ height: `${(d.demand / maxAll) * 200}px` }} />
                          <div className="w-3 sm:w-4 rounded-t-sm bg-emerald-500 transition-all" style={{ height: `${(d.pricing / maxAll) * 200}px` }} />
                          <div className="w-3 sm:w-4 rounded-t-sm bg-blue-500 transition-all" style={{ height: `${(d.supply / maxAll) * 200}px` }} />
                          <div className="w-3 sm:w-4 rounded-t-sm bg-violet-500 transition-all" style={{ height: `${(d.projects / maxAll) * 200}px` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400 border-t border-gray-100 pt-3">
                <span>Jan 2026</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul 2026</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-green-600" />
                  <h4 className="font-semibold text-[#0A1628] text-sm">Fastest Rising</h4>
                </div>
                <p className="text-lg font-bold text-[#0A1628]">Demand Index</p>
                <p className="text-xs text-gray-400">+58% YTD — driven by Agriculture & ICT</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className="text-amber-600" />
                  <h4 className="font-semibold text-[#0A1628] text-sm">Most Volatile</h4>
                </div>
                <p className="text-lg font-bold text-[#0A1628]">Pricing Index</p>
                <p className="text-xs text-gray-400">±3.2% MoM — impacted by fuel & FX</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={16} className="text-blue-600" />
                  <h4 className="font-semibold text-[#0A1628] text-sm">Steady Growth</h4>
                </div>
                <p className="text-lg font-bold text-[#0A1628]">Supply Index</p>
                <p className="text-xs text-gray-400">+22% YTD — supplier base expanding</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
