"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import VendorShell from "@/components/vendor/vendor-shell";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Megaphone, DollarSign, TrendingUp, Target,
  Eye, MousePointerClick, ShoppingCart, BarChart3, Download,
  Loader2, Calendar, AlertCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const formatNaira = (n: number) => `\u20A6${n.toLocaleString()}`;
const formatNumber = (n: number) => n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : n.toLocaleString();

const demoCampaign = {
  id: "CAMP-001",
  name: "Yamaha Engine Spring Sale",
  type: "Sponsored Products",
  status: "active",
  budget: 200000,
  spend: 143200,
  sales: 458240,
  acos: 31.25,
  orders: 120,
  impressions: 45200,
  clicks: 2340,
  ctr: 5.18,
  cpc: 61.2,
  conversionRate: 5.13,
  startDate: "2026-03-01",
  endDate: "2026-03-31",
  dailyBudget: 6667,
};

const demoChartData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (29 - i));
  const spend = Math.floor(Math.random() * 8000) + 1000;
  const sales = Math.floor(spend * (2 + Math.random() * 3));
  const impressions = Math.floor(Math.random() * 3000) + 500;
  const clicks = Math.floor(impressions * (0.02 + Math.random() * 0.05));
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    spend, sales, impressions, clicks,
  };
});

const demoAdGroups = [
  { id: "AG-001", name: "Outboard Engines", status: "active", impressions: 18200, clicks: 980, spend: 58700, sales: 198400, orders: 48, acos: 29.59 },
  { id: "AG-002", name: "Marine Electronics", status: "active", impressions: 12400, clicks: 620, spend: 38900, sales: 142800, orders: 35, acos: 27.24 },
  { id: "AG-003", name: "Boat Accessories", status: "paused", impressions: 8600, clicks: 410, spend: 25400, sales: 72400, orders: 22, acos: 35.08 },
  { id: "AG-004", name: "Safety Equipment", status: "active", impressions: 6000, clicks: 330, spend: 20200, sales: 44640, orders: 15, acos: 45.25 },
];

const demoSplitByPlacement = [
  { placement: "Top of Search", impressions: 18900, clicks: 1240, spend: 75800, sales: 268400, orders: 62 },
  { placement: "Rest of Search", impressions: 15200, clicks: 680, spend: 40200, sales: 128640, orders: 36 },
  { placement: "Product Pages", impressions: 11100, clicks: 420, spend: 27200, sales: 61200, orders: 22 },
];

const demoSplitByHit = [
  { date: "2026-03-01", searchTerm: "yamaha outboard", clicks: 45, impressions: 820, spend: 2800, sales: 120000, orders: 3 },
  { date: "2026-03-02", searchTerm: "marine engine", clicks: 38, impressions: 650, spend: 2300, sales: 85000, orders: 2 },
  { date: "2026-03-03", searchTerm: "boat motor", clicks: 52, impressions: 1100, spend: 3450, sales: 95000, orders: 2 },
  { date: "2026-03-04", searchTerm: "outboard motor price", clicks: 29, impressions: 480, spend: 1800, sales: 0, orders: 0 },
  { date: "2026-03-05", searchTerm: "yamaha f150", clicks: 61, impressions: 920, spend: 3900, sales: 158240, orders: 4 },
  { date: "2026-03-06", searchTerm: "marine navigation", clicks: 18, impressions: 340, spend: 1100, sales: 45000, orders: 1 },
  { date: "2026-03-07", searchTerm: "boat parts", clicks: 15, impressions: 280, spend: 850, sales: 0, orders: 0 },
  { date: "2026-03-08", searchTerm: "marine led lights", clicks: 22, impressions: 410, spend: 1400, sales: 22500, orders: 2 },
];

type DetailTab = "overview" | "ad_groups" | "search_terms" | "placements";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  const campaign = { ...demoCampaign, id: campaignId };

  const chartData = demoChartData;

  const totalImpressions = demoAdGroups.reduce((s, g) => s + g.impressions, 0);
  const totalClicks = demoAdGroups.reduce((s, g) => s + g.clicks, 0);
  const totalSpend = demoAdGroups.reduce((s, g) => s + g.spend, 0);
  const totalSales = demoAdGroups.reduce((s, g) => s + g.sales, 0);
  const totalOrders = demoAdGroups.reduce((s, g) => s + g.orders, 0);
  const overallACOS = totalSales > 0 ? (totalSpend / totalSales) * 100 : 0;
  const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const overallCVR = totalClicks > 0 ? (totalOrders / totalClicks) * 100 : 0;

  const tabs: { key: DetailTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "ad_groups", label: "Ad Groups" },
    { key: "search_terms", label: "Search Terms" },
    { key: "placements", label: "Placements" },
  ];

  const exportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Impressions", campaign.impressions],
      ["Clicks", campaign.clicks],
      ["Spend", campaign.spend],
      ["Sales", campaign.sales],
      ["Orders", campaign.orders],
      ["ACOS", `${campaign.acos}%`],
      ["CTR", `${campaign.ctr}%`],
    ].map((r) => r.join(",")).join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `campaign-${campaign.id}-metrics.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <VendorShell title={campaign.name} subtitle="Campaign performance details">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/vendor/advertising">
            <Button variant="outline" size="sm"><ArrowLeft size={14} className="mr-1" /> All Campaigns</Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
              campaign.status === "active" ? "bg-green-50 text-green-700" : campaign.status === "paused" ? "bg-blue-50 text-blue" : "bg-gray-100 text-gray-500"
            }`}>{campaign.status}</span>
            <Button variant="outline" size="sm" onClick={exportCSV}><Download size={14} className="mr-1" /> Export</Button>
          </div>
        </div>

        {/* Campaign Info Bar */}
        <div className="bg-navbg rounded-xl border border-border/40 p-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <div><span className="text-text-4">Type</span><span className="ml-2 font-medium">{campaign.type}</span></div>
          <div><span className="text-text-4">Budget</span><span className="ml-2 font-medium">{formatNaira(campaign.budget)}</span></div>
          <div><span className="text-text-4">Spend</span><span className="ml-2 font-medium">{formatNaira(campaign.spend)}</span></div>
          <div><span className="text-text-4">Remaining</span><span className="ml-2 font-medium text-green-600">{formatNaira(campaign.budget - campaign.spend)}</span></div>
          <div><span className="text-text-4">Start</span><span className="ml-2 font-medium">{campaign.startDate}</span></div>
          <div><span className="text-text-4">End</span><span className="ml-2 font-medium">{campaign.endDate}</span></div>
          <div><span className="text-text-4">Daily Budget</span><span className="ml-2 font-medium">{formatNaira(campaign.dailyBudget)}</span></div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Impressions", value: formatNumber(campaign.impressions), icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Clicks", value: formatNumber(campaign.clicks), icon: MousePointerClick, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Spend", value: formatNaira(campaign.spend), icon: DollarSign, color: "text-red", bg: "bg-red-50" },
            { label: "Sales", value: formatNaira(campaign.sales), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Orders", value: campaign.orders.toString(), icon: ShoppingCart, color: "text-green-600", bg: "bg-green-50" },
            { label: "ACOS", value: `${campaign.acos}%`, icon: Target, color: campaign.acos > 30 ? "text-red" : "text-amber-600", bg: "bg-amber-50" },
            { label: "CTR", value: `${campaign.ctr}%`, icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "CPC", value: formatNaira(Math.round(campaign.cpc)), icon: MousePointerClick, color: "text-pink-600", bg: "bg-pink-50" },
            { label: "CVR", value: `${campaign.conversionRate}%`, icon: Target, color: "text-teal-600", bg: "bg-teal-50" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl border border-border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-text-4">{kpi.label}</span>
                <div className={`p-1 rounded-lg ${kpi.bg}`}><kpi.icon size={12} className={kpi.color} /></div>
              </div>
              <div className="text-sm font-bold text-text-1">{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-xs rounded-md font-medium transition-colors ${
                activeTab === tab.key ? "bg-white text-text-1 shadow-sm" : "text-text-4 hover:text-text-2"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spend vs Sales Chart */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm text-text-1 mb-4">Spend vs Sales</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#999" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#999" tickFormatter={(v: any) => `\u20A6${(Number(v) / 1e3).toFixed(0)}K`} />
                    <Tooltip formatter={(value: any) => formatNaira(Number(value))} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Line type="monotone" dataKey="spend" stroke="#EF4444" strokeWidth={2} dot={false} name="Spend" />
                    <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} dot={false} name="Sales" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Impressions & Clicks Chart */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm text-text-1 mb-4">Impressions &amp; Clicks</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#999" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#999" tickFormatter={(v: any) => `${(Number(v) / 1e3).toFixed(0)}K`} />
                    <Tooltip formatter={(value: any) => String(Number(value).toLocaleString())} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar dataKey="impressions" fill="#2563EB" radius={[4, 4, 0, 0]} name="Impressions" />
                    <Bar dataKey="clicks" fill="#FF6B00" radius={[4, 4, 0, 0]} name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Breakdown Table */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-sm text-text-1">Daily Breakdown</h3>
              </div>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-text-4 text-[10px] uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="px-3 py-2.5 text-left font-semibold">Date</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Impressions</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Clicks</th>
                      <th className="px-3 py-2.5 text-right font-semibold">CTR</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Spend</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {chartData.slice().reverse().map((m, idx) => {
                      const ctr = m.impressions > 0 ? ((m.clicks / m.impressions) * 100).toFixed(2) : "0.00";
                      return (
                        <tr key={idx} className="hover:bg-gray-50/40">
                          <td className="px-3 py-2 text-xs text-text-2">{m.date}</td>
                          <td className="px-3 py-2 text-xs text-right text-text-2">{m.impressions.toLocaleString()}</td>
                          <td className="px-3 py-2 text-xs text-right text-text-2">{m.clicks.toLocaleString()}</td>
                          <td className="px-3 py-2 text-xs text-right text-text-2">{ctr}%</td>
                          <td className="px-3 py-2 text-xs text-right text-text-2">{formatNaira(m.spend)}</td>
                          <td className="px-3 py-2 text-xs text-right font-medium text-green-600">{formatNaira(m.sales)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Ad Groups */}
        {activeTab === "ad_groups" && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-sm text-text-1">Ad Group Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-text-4 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Ad Group</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Impressions</th>
                    <th className="px-4 py-3 text-right font-semibold">Clicks</th>
                    <th className="px-4 py-3 text-right font-semibold">Spend</th>
                    <th className="px-4 py-3 text-right font-semibold">Sales</th>
                    <th className="px-4 py-3 text-right font-semibold">Orders</th>
                    <th className="px-4 py-3 text-right font-semibold">ACOS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {demoAdGroups.map((ag) => {
                    const agAcos = ag.sales > 0 ? (ag.spend / ag.sales) * 100 : 0;
                    return (
                      <tr key={ag.id} className="hover:bg-gray-50/40">
                        <td className="px-4 py-3 text-xs font-medium text-text-1">{ag.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium capitalize ${
                            ag.status === "active" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue"
                          }`}>{ag.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-right text-text-2">{formatNumber(ag.impressions)}</td>
                        <td className="px-4 py-3 text-xs text-right text-text-2">{formatNumber(ag.clicks)}</td>
                        <td className="px-4 py-3 text-xs text-right text-text-2">{formatNaira(ag.spend)}</td>
                        <td className="px-4 py-3 text-xs text-right text-green-600 font-medium">{formatNaira(ag.sales)}</td>
                        <td className="px-4 py-3 text-xs text-right text-text-2">{ag.orders}</td>
                        <td className="px-4 py-3 text-xs text-right">
                          <span className={`font-medium ${agAcos > 30 ? "text-red" : agAcos > 20 ? "text-amber-600" : "text-green-600"}`}>
                            {agAcos.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 text-xs font-semibold">
                  <tr>
                    <td className="px-4 py-3 text-text-1">Total</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right text-text-1">{formatNumber(totalImpressions)}</td>
                    <td className="px-4 py-3 text-right text-text-1">{formatNumber(totalClicks)}</td>
                    <td className="px-4 py-3 text-right text-text-1">{formatNaira(totalSpend)}</td>
                    <td className="px-4 py-3 text-right text-green-600">{formatNaira(totalSales)}</td>
                    <td className="px-4 py-3 text-right text-text-1">{totalOrders}</td>
                    <td className="px-4 py-3 text-right">{overallACOS.toFixed(1)}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Search Terms */}
        {activeTab === "search_terms" && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-sm text-text-1">Search Term Report</h3>
              <span className="text-[10px] text-text-4">Which search terms triggered your ads</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-text-4 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Search Term</th>
                    <th className="px-4 py-3 text-right font-semibold">Impressions</th>
                    <th className="px-4 py-3 text-right font-semibold">Clicks</th>
                    <th className="px-4 py-3 text-right font-semibold">Spend</th>
                    <th className="px-4 py-3 text-right font-semibold">Sales</th>
                    <th className="px-4 py-3 text-right font-semibold">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {demoSplitByHit.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/40">
                      <td className="px-4 py-3 text-xs text-text-2">{row.date}</td>
                      <td className="px-4 py-3 text-xs font-medium text-text-1">{row.searchTerm}</td>
                      <td className="px-4 py-3 text-xs text-right text-text-2">{formatNumber(row.impressions)}</td>
                      <td className="px-4 py-3 text-xs text-right text-text-2">{row.clicks}</td>
                      <td className="px-4 py-3 text-xs text-right text-text-2">{formatNaira(row.spend)}</td>
                      <td className="px-4 py-3 text-xs text-right font-medium text-green-600">{formatNaira(row.sales)}</td>
                      <td className="px-4 py-3 text-xs text-right text-text-2">{row.orders || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Placements */}
        {activeTab === "placements" && (
          <div className="space-y-6">
            {/* Placement Table */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-sm text-text-1">Placement Report</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-text-4 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Placement</th>
                      <th className="px-4 py-3 text-right font-semibold">Impressions</th>
                      <th className="px-4 py-3 text-right font-semibold">Clicks</th>
                      <th className="px-4 py-3 text-right font-semibold">CTR</th>
                      <th className="px-4 py-3 text-right font-semibold">Spend</th>
                      <th className="px-4 py-3 text-right font-semibold">Sales</th>
                      <th className="px-4 py-3 text-right font-semibold">Orders</th>
                      <th className="px-4 py-3 text-right font-semibold">ACOS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                  {demoSplitByPlacement.map((row, i) => {
                    const ctr = row.impressions > 0 ? ((row.clicks / row.impressions) * 100).toFixed(2) : "0.00";
                    const acos = row.sales > 0 ? (row.spend / row.sales) * 100 : 0;
                    return (
                      <tr key={i} className="hover:bg-gray-50/40">
                        <td className="px-4 py-3 text-xs font-medium text-text-1">{row.placement}</td>
                        <td className="px-4 py-3 text-xs text-right text-text-2">{formatNumber(row.impressions)}</td>
                        <td className="px-4 py-3 text-xs text-right text-text-2">{formatNumber(row.clicks)}</td>
                        <td className="px-4 py-3 text-xs text-right text-text-2">{ctr}%</td>
                        <td className="px-4 py-3 text-xs text-right text-text-2">{formatNaira(row.spend)}</td>
                        <td className="px-4 py-3 text-xs text-right font-medium text-green-600">{formatNaira(row.sales)}</td>
                        <td className="px-4 py-3 text-xs text-right text-text-2">{row.orders}</td>
                        <td className="px-4 py-3 text-xs text-right">
                          <span className={`font-medium ${acos > 30 ? "text-red" : acos > 20 ? "text-amber-600" : "text-green-600"}`}>
                            {acos.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Placement Distribution */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm text-text-1 mb-4">Placement Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demoSplitByPlacement}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="placement" tick={{ fontSize: 10 }} stroke="#999" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#999" tickFormatter={(v: any) => `${(Number(v) / 1e3).toFixed(0)}K`} />
                    <Tooltip formatter={(value: any) => String(Number(value).toLocaleString())} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar dataKey="impressions" fill="#2563EB" radius={[4, 4, 0, 0]} name="Impressions" />
                    <Bar dataKey="clicks" fill="#FF6B00" radius={[4, 4, 0, 0]} name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <p>Campaign status is current, but other data could be delayed up to 12 hours. Metrics are refreshed periodically throughout the day.</p>
        </div>
      </div>
    </VendorShell>
  );
}
