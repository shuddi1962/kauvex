"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { insforge } from "@/lib/insforge";
import {
  Megaphone, DollarSign, Eye, MousePointer, BarChart3, TrendingUp,
  TrendingDown, CheckCircle2, XCircle, Clock, Filter, Search,
  Settings, Save, Loader2, Plus, ChevronDown, ChevronUp, Calendar,
  Download, RefreshCw, Wallet, Target, Users,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";

const campaignTypes = ["sponsored_product", "sponsored_brand", "sponsored_store", "display_ad"];
const statuses = ["draft", "pending_review", "active", "paused", "ended", "rejected"];

const dailyRevData = [
  { day: "Mon", revenue: 125000, spend: 45000, impressions: 12500, clicks: 340 },
  { day: "Tue", revenue: 142000, spend: 52000, impressions: 14100, clicks: 410 },
  { day: "Wed", revenue: 98000, spend: 38000, impressions: 10200, clicks: 280 },
  { day: "Thu", revenue: 156000, spend: 48000, impressions: 15800, clicks: 520 },
  { day: "Fri", revenue: 172000, spend: 55000, impressions: 17400, clicks: 610 },
  { day: "Sat", revenue: 134000, spend: 42000, impressions: 13100, clicks: 390 },
  { day: "Sun", revenue: 112000, spend: 36000, impressions: 10800, clicks: 310 },
];

const weeklyRevData = [
  { week: "W1", revenue: 780000, spend: 240000, impressions: 78000, clicks: 2400 },
  { week: "W2", revenue: 845000, spend: 265000, impressions: 82300, clicks: 2800 },
  { week: "W3", revenue: 920000, spend: 290000, impressions: 91000, clicks: 3100 },
  { week: "W4", revenue: 890000, spend: 275000, impressions: 88500, clicks: 2950 },
];

const monthlyRevData = [
  { month: "Jan", revenue: 3200000, spend: 980000, impressions: 310000, clicks: 10200 },
  { month: "Feb", revenue: 2850000, spend: 890000, impressions: 278000, clicks: 9500 },
  { month: "Mar", revenue: 3600000, spend: 1100000, impressions: 345000, clicks: 11800 },
  { month: "Apr", revenue: 4100000, spend: 1250000, impressions: 390000, clicks: 13500 },
  { month: "May", revenue: 3850000, spend: 1180000, impressions: 372000, clicks: 12800 },
  { month: "Jun", revenue: 4400000, spend: 1320000, impressions: 418000, clicks: 14600 },
];

const demoCampaigns = [
  { id: "CAMP-001", vendor: "Lagos Marine Tech", name: "Yamaha Engine Spring Sale", type: "sponsored_product", status: "active", budget: 200000, spent: 143200, impressions: 45200, clicks: 2340, ctr: 5.18, roas: 3.2, startDate: "2026-03-01", endDate: "2026-03-31" },
  { id: "CAMP-002", vendor: "SafeHome Nigeria", name: "Home Security Bundle", type: "sponsored_brand", status: "pending_review", budget: 150000, spent: 0, impressions: 0, clicks: 0, ctr: 0, roas: 0, startDate: "2026-04-01", endDate: "2026-04-30" },
  { id: "CAMP-003", vendor: "Kitchen Pro Solutions", name: "Commercial Kitchen Expo", type: "display_ad", status: "active", budget: 300000, spent: 210800, impressions: 67800, clicks: 3450, ctr: 5.09, roas: 4.1, startDate: "2026-02-15", endDate: "2026-04-15" },
  { id: "CAMP-004", vendor: "Delta Boat Works", name: "Custom Boat Showcase", type: "sponsored_store", status: "rejected", budget: 250000, spent: 0, impressions: 0, clicks: 0, ctr: 0, roas: 0, startDate: "2026-03-10", endDate: "2026-04-10" },
  { id: "CAMP-005", vendor: "Fire Safety Plus", name: "Fire Alarm Discount", type: "sponsored_product", status: "draft", budget: 80000, spent: 0, impressions: 0, clicks: 0, ctr: 0, roas: 0, startDate: "2026-04-05", endDate: "2026-05-05" },
  { id: "CAMP-006", vendor: "TechMarine Store", name: "Marine Electronics", type: "sponsored_product", status: "paused", budget: 180000, spent: 98000, impressions: 28900, clicks: 1450, ctr: 5.02, roas: 2.8, startDate: "2026-01-01", endDate: "2026-03-01" },
  { id: "CAMP-007", vendor: "AutoGuard Nigeria", name: "Vehicle Tracker Promo", type: "display_ad", status: "ended", budget: 120000, spent: 120000, impressions: 36500, clicks: 1820, ctr: 4.99, roas: 3.5, startDate: "2026-02-01", endDate: "2026-02-28" },
];

const typeColors: Record<string, string> = {
  sponsored_product: "bg-blue-50 text-blue",
  sponsored_brand: "bg-purple-50 text-purple-700",
  sponsored_store: "bg-emerald-50 text-emerald-700",
  display_ad: "bg-amber-50 text-amber-700",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-text-4",
  pending_review: "bg-yellow-50 text-yellow-700",
  active: "bg-green-50 text-green-700",
  paused: "bg-blue-50 text-blue",
  ended: "bg-gray-100 text-gray-500",
  rejected: "bg-red-50 text-red",
};

const typeLabels: Record<string, string> = {
  sponsored_product: "Sponsored Product",
  sponsored_brand: "Sponsored Brand",
  sponsored_store: "Sponsored Store",
  display_ad: "Display Ad",
};

export default function AdminAdvertisingPage() {
  const [campaigns, setCampaigns] = useState(demoCampaigns);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [chartPeriod, setChartPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  const [adSettings, setAdSettings] = useState({
    maxAdsPerPage: 4,
    adPositions: ["homepage_top", "homepage_middle", "sidebar", "search_results", "category_top"],
    minBidAmount: 5000,
    autoApprove: false,
    adReviewRequired: true,
  });

  const totalSpend = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";
  const totalRevenue = campaigns.reduce((s, c) => s + Math.round(c.spent * c.roas), 0);

  const revenueChartData: Record<string, unknown>[] = chartPeriod === "daily" ? dailyRevData as any : chartPeriod === "weekly" ? weeklyRevData as any : monthlyRevData as any;

  const filteredCampaigns = campaigns.filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterType !== "all" && c.type !== filterType) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.vendor.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleApprove = (id: string) => {
    setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: "active" } : c));
  };

  const handleReject = (id: string) => {
    setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: "rejected" } : c));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      alert("Ad settings saved successfully!");
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const formatNaira = (n: number) => {
    if (n >= 1e6) return `₦${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `₦${(n / 1e3).toFixed(0)}K`;
    return `₦${n.toLocaleString()}`;
  };

  const formatNumber = (n: number) => n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : n.toLocaleString();

  const chartTooltipFormatter = (value: unknown, _name: unknown): any => {
    const n = Number(value);
    if (_name === "revenue") return [formatNaira(n), "Revenue"];
    if (_name === "spend") return [formatNaira(n), "Spend"];
    if (_name === "impressions") return [formatNumber(n), "Impressions"];
    if (_name === "clicks") return [formatNumber(n), "Clicks"];
    return [n, _name];
  };

  return (
    <AdminShell title="Advertising" subtitle="Manage vendor ad campaigns and platform ad settings">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Spend", value: formatNaira(totalSpend), change: "+18.3%", trend: "up", icon: DollarSign, color: "text-blue", bg: "bg-blue-50" },
            { label: "Total Impressions", value: formatNumber(totalImpressions), change: "+12.7%", trend: "up", icon: Eye, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Total Clicks", value: formatNumber(totalClicks), change: "+15.2%", trend: "up", icon: MousePointer, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Avg CTR", value: `${avgCTR}%`, change: "+0.8%", trend: "up", icon: Target, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Total Revenue", value: formatNaira(totalRevenue), change: "+22.4%", trend: "up", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={16} className={stat.color} />
                </div>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.trend === "up" ? "text-green-600" : "text-red"}`}>
                  {stat.trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {stat.change}
                </span>
              </div>
              <p className="text-lg font-bold text-text-1">{stat.value}</p>
              <p className="text-[10px] text-text-4 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-text-1">Ad Revenue & Spend</h3>
              <p className="text-xs text-text-4 mt-0.5">Track advertising performance over time</p>
            </div>
            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button key={p} onClick={() => setChartPeriod(p)} className={`px-3 py-1.5 text-xs rounded-md capitalize transition-colors ${chartPeriod === p ? "bg-white text-text-1 font-medium shadow-sm" : "text-text-4 hover:text-text-2"}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A1628" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0A1628" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey={chartPeriod === "daily" ? "day" : chartPeriod === "weekly" ? "week" : "month"} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <Tooltip formatter={chartTooltipFormatter} labelStyle={{ fontWeight: 600, fontSize: 13 }} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
                <Area type="monotone" dataKey="revenue" stroke="#0A1628" strokeWidth={2} fill="url(#revenueGrad)" name="revenue" />
                <Area type="monotone" dataKey="spend" stroke="#FF6B00" strokeWidth={2} fill="url(#spendGrad)" name="spend" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input type="text" placeholder="Search campaigns or vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-text-4" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue">
                <option value="all">All Statuses</option>
                {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue">
                <option value="all">All Types</option>
                {campaignTypes.map((t) => <option key={t} value={t}>{typeLabels[t]}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => alert("Export feature coming soon")}><Download size={14} className="mr-1" /> Export</Button>
              <Button variant="outline" size="sm" onClick={() => { setFilterStatus("all"); setFilterType("all"); setSearch(""); }}><RefreshCw size={14} className="mr-1" /> Reset</Button>
              <Button size="sm" onClick={() => setShowSettings(!showSettings)}><Settings size={14} className="mr-1" /> Ad Settings</Button>
            </div>
          </div>
        </div>

        {/* Global Ad Settings */}
        {showSettings && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Settings size={15} /> Global Ad Settings</h3>
              <Button size="sm" onClick={saveSettings} disabled={saving}>
                {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-2 block mb-1">Max Ads Per Page</label>
                  <input type="number" value={adSettings.maxAdsPerPage} onChange={(e) => setAdSettings({ ...adSettings, maxAdsPerPage: Number(e.target.value) })} className="w-32 h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-2 block mb-1">Minimum Bid Amount (₦)</label>
                  <input type="number" value={adSettings.minBidAmount} onChange={(e) => setAdSettings({ ...adSettings, minBidAmount: Number(e.target.value) })} className="w-32 h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                </div>
                <div className="space-y-3">
                  {[
                    { key: "autoApprove", label: "Auto-approve all ads" },
                    { key: "adReviewRequired", label: "Require review before publishing" },
                  ].map((tog) => (
                    <label key={tog.key} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={adSettings[tog.key as keyof typeof adSettings] as boolean} onChange={(e) => setAdSettings({ ...adSettings, [tog.key]: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue focus:ring-blue" />
                      <span className="text-sm text-text-2">{tog.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-2 block mb-2">Active Ad Positions</label>
                <div className="space-y-2">
                  {adSettings.adPositions.map((pos) => (
                    <div key={pos} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-text-2 capitalize">{pos.replace(/_/g, " ")}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone size={16} className="text-text-4" />
              <h3 className="font-semibold text-sm">All Campaigns</h3>
              <span className="text-xs text-text-4 bg-gray-100 px-2 py-0.5 rounded-full">{filteredCampaigns.length}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Campaign</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Vendor</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Budget</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Spent</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Impressions</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Clicks</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">CTR</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">ROAS</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <>
                    <tr key={campaign.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {expandedCampaign === campaign.id ? <ChevronUp size={14} className="text-text-4" /> : <ChevronDown size={14} className="text-text-4" />}
                          <div>
                            <p className="text-sm font-medium text-text-1">{campaign.name}</p>
                            <p className="text-[10px] text-text-4 font-mono">{campaign.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-2">{campaign.vendor}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[campaign.type]}`}>{typeLabels[campaign.type]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[campaign.status]}`}>{campaign.status.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-text-1">{formatNaira(campaign.budget)}</td>
                      <td className="px-4 py-3 text-sm text-right text-text-2">{formatNaira(campaign.spent)}</td>
                      <td className="px-4 py-3 text-sm text-right text-text-2">{formatNumber(campaign.impressions)}</td>
                      <td className="px-4 py-3 text-sm text-right text-text-2">{formatNumber(campaign.clicks)}</td>
                      <td className="px-4 py-3 text-sm text-right text-text-2">{campaign.ctr}%</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`font-semibold ${campaign.roas >= 3 ? "text-green-600" : campaign.roas >= 1 ? "text-amber-600" : "text-red"}`}>{campaign.roas}x</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {campaign.status === "pending_review" && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); handleApprove(campaign.id); }} className="p-1.5 hover:bg-green-50 rounded-lg transition-colors" title="Approve"><CheckCircle2 size={15} className="text-green-600" /></button>
                              <button onClick={(e) => { e.stopPropagation(); handleReject(campaign.id); }} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Reject"><XCircle size={15} className="text-red" /></button>
                            </>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); alert(`View details: ${campaign.name}`); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View Details"><BarChart3 size={15} className="text-text-4" /></button>
                        </div>
                      </td>
                    </tr>
                    {expandedCampaign === campaign.id && (
                      <tr key={`${campaign.id}-details`}>
                        <td colSpan={11} className="px-4 py-4 bg-gray-50/50">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-xs font-semibold text-text-2 mb-3">Campaign Performance</h4>
                              <div className="h-[120px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={[
                                    { day: 1, imp: 1200, clicks: 36 }, { day: 2, imp: 1450, clicks: 48 },
                                    { day: 3, imp: 1100, clicks: 32 }, { day: 4, imp: 1680, clicks: 55 },
                                    { day: 5, imp: 1520, clicks: 44 }, { day: 6, imp: 1800, clicks: 62 },
                                    { day: 7, imp: 1350, clicks: 40 },
                                  ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                                    <Line type="monotone" dataKey="imp" stroke="#0A1628" strokeWidth={2} dot={false} name="Impressions" />
                                    <Line type="monotone" dataKey="clicks" stroke="#FF6B00" strokeWidth={2} dot={false} name="Clicks" />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold text-text-2 mb-3">Quick Summary</h4>
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { label: "Start Date", value: campaign.startDate },
                                  { label: "End Date", value: campaign.endDate },
                                  { label: "Budget Used", value: `${Math.round((campaign.spent / campaign.budget) * 100)}%` },
                                  { label: "Cost per Click", value: campaign.clicks > 0 ? formatNaira(Math.round(campaign.spent / campaign.clicks)) : "N/A" },
                                ].map((s) => (
                                  <div key={s.label} className="bg-white rounded-lg p-3 border border-gray-100">
                                    <p className="text-[10px] text-text-4">{s.label}</p>
                                    <p className="text-sm font-semibold text-text-1 mt-0.5">{s.value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {filteredCampaigns.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center">
                      <Megaphone size={32} className="text-text-4/30 mx-auto mb-2" />
                      <p className="text-sm text-text-4">No campaigns match your filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Impressions vs Clicks Chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-sm mb-4">Impressions & Clicks</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                  <Tooltip contentStyle={{ borderRadius: 8 }} />
                  <Bar dataKey="impressions" fill="#0A1628" opacity={0.3} radius={[4, 4, 0, 0]} name="Impressions" />
                  <Bar dataKey="clicks" fill="#FF6B00" radius={[4, 4, 0, 0]} name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Campaign Distribution */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-sm mb-4">Campaign Status Distribution</h3>
            <div className="space-y-3">
              {statuses.map((s) => {
                const count = campaigns.filter((c) => c.status === s).length;
                const pct = campaigns.length > 0 ? (count / campaigns.length) * 100 : 0;
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-text-2 capitalize">{s.replace(/_/g, " ")}</span>
                      <span className="text-text-4 font-medium">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${statusColors[s].split(" ")[0]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
