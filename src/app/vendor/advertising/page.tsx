"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Megaphone, Plus, BarChart3, TrendingUp, DollarSign,
  Target, Eye, MousePointerClick, Download, Calendar,
  Search, ChevronLeft, ChevronRight, MoreHorizontal,
  Play, Pause, Trash2, Loader2, AlertCircle, ArrowUpDown,
  Filter,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import VendorShell from "@/components/vendor/vendor-shell";

const formatNaira = (n: number) => {
  if (n >= 1e6) return `\u20A6${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `\u20A6${(n / 1e3).toFixed(0)}K`;
  return `\u20A6${n.toLocaleString()}`;
};

const formatNumber = (n: number) => n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : n.toLocaleString();

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  paused: "bg-blue-50 text-blue",
  ended: "bg-gray-100 text-gray-500",
  draft: "bg-gray-100 text-text-4",
  pending_review: "bg-yellow-50 text-yellow-700",
};

const demoCampaigns = [
  { id: "CAMP-001", name: "Yamaha Engine Spring Sale", status: "active", startDate: "2026-03-01", endDate: "2026-03-31", budget: 200000, spend: 143200, sales: 458240, acos: 31.25, orders: 120 },
  { id: "CAMP-002", name: "Commercial Kitchen Expo", status: "active", startDate: "2026-02-15", endDate: "2026-04-15", budget: 300000, spend: 210800, sales: 864280, acos: 24.39, orders: 180 },
  { id: "CAMP-003", name: "Marine Electronics", status: "paused", startDate: "2026-01-01", endDate: "2026-03-01", budget: 180000, spend: 98000, sales: 274400, acos: 35.71, orders: 65 },
  { id: "CAMP-004", name: "Marine Accessories Pack", status: "draft", startDate: "", endDate: null, budget: 100000, spend: 0, sales: 0, acos: 0, orders: 0 },
  { id: "CAMP-005", name: "End of Season Sale", status: "pending_review", startDate: "2026-04-01", endDate: "2026-04-30", budget: 250000, spend: 0, sales: 0, acos: 0, orders: 0 },
  { id: "CAMP-006", name: "Security Camera Bundle", status: "active", startDate: "2026-02-01", endDate: "2026-06-30", budget: 150000, spend: 87500, sales: 312000, acos: 28.04, orders: 78 },
  { id: "CAMP-007", name: "Fire Alarm Promotion", status: "paused", startDate: "2026-01-15", endDate: "2026-03-15", budget: 120000, spend: 65400, sales: 189600, acos: 34.49, orders: 42 },
  { id: "CAMP-008", name: "Summer Sale 2026", status: "active", startDate: "2026-04-01", endDate: "2026-04-30", budget: 350000, spend: 0, sales: 0, acos: 0, orders: 0 },
];

const generateChartData = (days: number) =>
  Array.from({ length: days }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
    const spend = Math.floor(Math.random() * 12000) + 2000;
    const sales = Math.floor(spend * (2 + Math.random() * 3));
    return { date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), spend, sales };
  });

const datePresets = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "custom", label: "Custom" },
];

export default function VendorAdvertisingPage() {
  const [campaigns] = useState(demoCampaigns);
  const [datePreset, setDatePreset] = useState("30");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const chartData = useMemo(() => generateChartData(Number(datePreset) || 30), [datePreset]);

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalSales = campaigns.reduce((s, c) => s + c.sales, 0);
  const totalOrders = campaigns.reduce((s, c) => s + c.orders, 0);
  const activeCount = campaigns.filter((c) => c.status === "active").length;
  const overallACOS = totalSales > 0 ? (totalSpend / totalSales) * 100 : 0;

  const filtered = useMemo(() => {
    let list = campaigns;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") list = list.filter((c) => c.status === statusFilter);
    return list;
  }, [campaigns, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handlePageSizeChange = (val: number) => {
    setPageSize(val);
    setPage(1);
  };

  const togglePause = (id: string, currentStatus: string) => {
    setActionLoading(id);
    setTimeout(() => setActionLoading(null), 800);
  };

  const exportCSV = () => {
    const headers = "Campaign,Status,Start Date,End Date,Budget,Spend,Sales,ACOS,Orders\n";
    const rows = campaigns.map((c) =>
      `${c.name},${c.status},${c.startDate || "N/A"},${c.endDate || "N/A"},${c.budget},${c.spend},${c.sales},${c.acos.toFixed(2)},${c.orders}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "campaigns.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <VendorShell title="Advertising" subtitle="Manage your ad campaigns and promotions">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Campaigns", value: activeCount, icon: Megaphone, color: "text-green-600", bg: "bg-green-50" },
            { label: "Total Spend", value: formatNaira(totalSpend), icon: DollarSign, color: "text-blue", bg: "bg-blue-50" },
            { label: "Total Sales", value: formatNaira(totalSales), icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "ACOS", value: `${overallACOS.toFixed(1)}%`, icon: Target, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={16} className={stat.color} />
                </div>
                <div>
                  <p className="text-lg font-bold text-text-1">{stat.value}</p>
                  <p className="text-[10px] text-text-4">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input
                type="text" placeholder="Search campaigns..."
                value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-56 h-9 pl-9 pr-3 text-xs rounded-lg border border-border focus:outline-none focus:border-blue"
              />
            </div>
            <select
              value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 px-3 text-xs rounded-lg border border-border bg-white text-text-1"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="ended">Ended</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            {/* Date Range */}
            <div className="flex items-center gap-1 bg-white border border-border rounded-lg p-0.5">
              {datePresets.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setDatePreset(p.value)}
                  className={`px-2.5 py-1.5 text-[10px] rounded-md transition-colors ${
                    datePreset === p.value ? "bg-blue text-white font-medium" : "text-text-4 hover:text-text-2"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {datePreset === "custom" && (
              <div className="flex items-center gap-1">
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="h-8 px-2 text-[10px] rounded-lg border border-border" />
                <span className="text-[10px] text-text-4">-</span>
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="h-8 px-2 text-[10px] rounded-lg border border-border" />
              </div>
            )}
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download size={14} className="mr-1" /> Export CSV
            </Button>
            <Link href="/vendor/advertising/campaigns/new">
              <Button size="sm"><Plus size={16} className="mr-1" /> Create Campaign</Button>
            </Link>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-text-1 flex items-center gap-2">
              <BarChart3 size={15} className="text-text-4" /> Spend vs Sales
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#999" />
                <YAxis tick={{ fontSize: 10 }} stroke="#999" tickFormatter={(v: any) => `\u20A6${(Number(v) / 1e3).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    formatNaira(Number(value)),
                    name === "spend" ? "Spend" : "Sales",
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Line type="monotone" dataKey="spend" stroke="#EF4444" strokeWidth={2} dot={false} name="Spend" />
                <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} dot={false} name="Sales" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-text-4 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Campaign Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Start Date</th>
                  <th className="px-4 py-3 text-left font-semibold">End Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Budget</th>
                  <th className="px-4 py-3 text-right font-semibold">Spend</th>
                  <th className="px-4 py-3 text-right font-semibold">Sales</th>
                  <th className="px-4 py-3 text-right font-semibold">ACOS</th>
                  <th className="px-4 py-3 text-right font-semibold">Orders</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paginated.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/vendor/advertising/campaigns/${campaign.id}`} className="text-sm font-medium text-text-1 hover:text-blue transition-colors">
                        {campaign.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[campaign.status] || "bg-gray-100 text-text-4"}`}>
                        {campaign.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-2">{campaign.startDate || "-"}</td>
                    <td className="px-4 py-3 text-xs text-text-2">{campaign.endDate || "-"}</td>
                    <td className="px-4 py-3 text-xs text-right text-text-2 font-medium">{formatNaira(campaign.budget)}</td>
                    <td className="px-4 py-3 text-xs text-right text-text-2">{formatNaira(campaign.spend)}</td>
                    <td className="px-4 py-3 text-xs text-right text-green-600 font-medium">{formatNaira(campaign.sales)}</td>
                    <td className="px-4 py-3 text-xs text-right">
                      <span className={`font-medium ${campaign.acos > 30 ? "text-red" : campaign.acos > 20 ? "text-amber-600" : "text-green-600"}`}>
                        {campaign.acos > 0 ? `${campaign.acos.toFixed(1)}%` : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-right text-text-2">{campaign.orders || "-"}</td>
                    <td className="px-4 py-3 text-center relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === campaign.id ? null : campaign.id); }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal size={14} className="text-text-4" />
                      </button>
                      {menuOpen === campaign.id && (
                        <div className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-lg border border-border py-1 z-10" onClick={(e) => e.stopPropagation()}>
                          {(campaign.status === "active" || campaign.status === "paused") && (
                            <button
                              onClick={() => { togglePause(campaign.id, campaign.status); setMenuOpen(null); }}
                              disabled={actionLoading === campaign.id}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-text-2 hover:bg-gray-50 disabled:opacity-50"
                            >
                              {actionLoading === campaign.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : campaign.status === "active" ? (
                                <Pause size={14} />
                              ) : (
                                <Play size={14} />
                              )}
                              {campaign.status === "active" ? "Pause" : "Resume"}
                            </button>
                          )}
                          <Link
                            href={`/vendor/advertising/campaigns/${campaign.id}`}
                            onClick={() => setMenuOpen(null)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-text-2 hover:bg-gray-50"
                          >
                            <Eye size={14} /> View Details
                          </Link>
                          <button
                            onClick={() => { setMenuOpen(null); }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={14} /> End Campaign
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <Megaphone size={32} className="text-text-4/30 mx-auto mb-2" />
                      <p className="text-sm text-text-4">No campaigns found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer: Pagination + Disclaimer */}
          <div className="px-4 py-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-4">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-7 px-2 text-[10px] rounded-lg border border-border bg-white text-text-1"
              >
                {[10, 25, 50, 100].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="text-[10px] text-text-4 ml-2">
                {filtered.length > 0
                  ? `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filtered.length)} of ${filtered.length}`
                  : "0 results"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} className="text-text-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-[10px] rounded-lg font-medium transition-colors ${
                    page === p ? "bg-blue text-white" : "text-text-4 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              {totalPages > 5 && <span className="text-[10px] text-text-4 px-1">...</span>}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} className="text-text-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          <p>Campaign status is current, but other data could be delayed up to 12 hours. Metrics are refreshed periodically throughout the day.</p>
        </div>
      </div>
    </VendorShell>
  );
}
