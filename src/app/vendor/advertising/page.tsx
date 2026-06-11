"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Megaphone, Plus, ChevronDown, ChevronUp, BarChart3, Eye,
  TrendingUp, TrendingDown, DollarSign, MousePointer, Target,
  Calendar, Wallet, Play, Pause, MoreHorizontal, Trash2,
} from "lucide-react";
import {
  LineChart, Line, ResponsiveContainer, Tooltip,
} from "recharts";

const demoCampaigns = [
  {
    id: "CAMP-001", name: "Yamaha Engine Spring Sale", type: "sponsored_product", status: "active",
    budget: 200000, spent: 143200, impressions: 45200, clicks: 2340, roas: 3.2,
    startDate: "2026-03-01", endDate: "2026-03-31",
    sparkline: [1200, 1450, 1100, 1680, 1520, 1800, 1350, 1900, 1650, 1720, 1480, 2100, 1850, 1600],
  },
  {
    id: "CAMP-003", name: "Commercial Kitchen Expo", type: "display_ad", status: "active",
    budget: 300000, spent: 210800, impressions: 67800, clicks: 3450, roas: 4.1,
    startDate: "2026-02-15", endDate: "2026-04-15",
    sparkline: [2000, 1800, 2200, 1950, 2400, 2100, 2600, 2300, 2500, 2800, 2550, 2900, 3100, 2750],
  },
  {
    id: "CAMP-006", name: "Marine Electronics", type: "sponsored_product", status: "paused",
    budget: 180000, spent: 98000, impressions: 28900, clicks: 1450, roas: 2.8,
    startDate: "2026-01-01", endDate: "2026-03-01",
    sparkline: [800, 950, 1100, 850, 1200, 1050, 900, 1150, 980, 780, 650, 500, 400, 300],
  },
  {
    id: "CAMP-008", name: "Marine Accessories Pack", type: "sponsored_product", status: "draft",
    budget: 100000, spent: 0, impressions: 0, clicks: 0, roas: 0,
    startDate: "", endDate: "",
    sparkline: [],
  },
  {
    id: "CAMP-009", name: "End of Season Sale", type: "sponsored_brand", status: "pending_review",
    budget: 250000, spent: 0, impressions: 0, clicks: 0, roas: 0,
    startDate: "2026-04-01", endDate: "2026-04-30",
    sparkline: [],
  },
];

const typeLabels: Record<string, string> = {
  sponsored_product: "Sponsored Product",
  sponsored_brand: "Sponsored Brand",
  sponsored_store: "Sponsored Store",
  display_ad: "Display Ad",
};

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

export default function VendorAdvertisingPage() {
  const [campaigns, setCampaigns] = useState(demoCampaigns);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const activeCount = campaigns.filter((c) => c.status === "active").length;
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const avgROAS = totalSpent > 0 ? (campaigns.filter((c) => c.roas > 0).reduce((s, c) => s + c.roas * c.spent, 0) / totalSpent).toFixed(1) : "0.0";

  const formatNaira = (n: number) => {
    if (n >= 1e6) return `₦${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `₦${(n / 1e3).toFixed(0)}K`;
    return `₦${n.toLocaleString()}`;
  };

  const formatNumber = (n: number) => n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : n.toLocaleString();

  const togglePause = (id: string) => {
    setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: c.status === "active" ? "paused" : "active" } : c));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-1">Advertising</h1>
            <p className="text-sm text-text-4">Manage your ad campaigns and promotions</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/vendor/advertising/wallet">
              <Button variant="outline" size="sm"><Wallet size={14} className="mr-1" /> Ad Wallet</Button>
            </Link>
            <Link href="/vendor/advertising/new">
              <Button size="sm"><Plus size={16} className="mr-1" /> Create Campaign</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Campaigns", value: activeCount, icon: Megaphone, color: "text-green-600", bg: "bg-green-50", change: "+2 this month" },
            { label: "Total Spent", value: formatNaira(totalSpent), icon: DollarSign, color: "text-blue", bg: "bg-blue-50", change: "18.3% of budget" },
            { label: "Total Impressions", value: formatNumber(totalImpressions), icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50", change: "Avg 4.2% CTR" },
            { label: "Avg ROAS", value: `${avgROAS}x`, icon: Target, color: "text-amber-600", bg: "bg-amber-50", change: "Target: 3.0x" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={16} className={stat.color} />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-text-1">{stat.value}</p>
                  <p className="text-[10px] text-text-4">{stat.label}</p>
                </div>
              </div>
              <p className="text-[10px] text-green-600 font-medium">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Campaigns List */}
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors" onClick={() => setExpanded(expanded === campaign.id ? null : campaign.id)}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
                    {expanded === campaign.id ? <ChevronUp size={16} className="text-text-4" /> : <ChevronDown size={16} className="text-text-4" />}
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-text-1 truncate">{campaign.name}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize shrink-0 ${statusColors[campaign.status]}`}>{campaign.status.replace(/_/g, " ")}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${typeColors[campaign.type]}`}>{typeLabels[campaign.type]}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-6 text-xs text-text-2">
                  <div className="text-right">
                    <p className="font-semibold text-text-1">{formatNaira(campaign.spent)}</p>
                    <p className="text-text-4">{formatNaira(campaign.budget)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text-1">{formatNumber(campaign.impressions)}</p>
                    <p className="text-text-4">Impressions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text-1">{formatNumber(campaign.clicks)}</p>
                    <p className="text-text-4">Clicks</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${campaign.roas >= 3 ? "text-green-600" : campaign.roas >= 1 ? "text-amber-600" : "text-red"}`}>{campaign.roas}x</p>
                    <p className="text-text-4">ROAS</p>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === campaign.id ? null : campaign.id); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal size={16} className="text-text-4" />
                  </button>
                  {menuOpen === campaign.id && (
                    <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10" onClick={(e) => e.stopPropagation()}>
                      {(campaign.status === "active" || campaign.status === "paused") && (
                        <button onClick={() => { togglePause(campaign.id); setMenuOpen(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-text-2 hover:bg-gray-50">
                          {campaign.status === "active" ? <Pause size={14} /> : <Play size={14} />}
                          {campaign.status === "active" ? "Pause" : "Resume"}
                        </button>
                      )}
                      <button onClick={() => { alert(`View analytics for: ${campaign.name}`); setMenuOpen(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-text-2 hover:bg-gray-50">
                        <BarChart3 size={14} /> Analytics
                      </button>
                      <button onClick={() => { alert(`Edit campaign: ${campaign.name}`); setMenuOpen(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-text-2 hover:bg-gray-50">
                        <Eye size={14} /> Edit
                      </button>
                      <button onClick={() => { if (confirm("End this campaign?")) { setCampaigns((prev) => prev.map((c) => c.id === campaign.id ? { ...c, status: "ended" } : c)); } setMenuOpen(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red hover:bg-red-50">
                        <Trash2 size={14} /> End Campaign
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {expanded === campaign.id && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold text-text-2 mb-2">Performance (Last 14 Days)</p>
                      {campaign.sparkline.length > 0 ? (
                        <div className="h-[100px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={campaign.sparkline.map((v, i) => ({ day: i + 1, value: v }))}>
                              <Line type="monotone" dataKey="value" stroke="#0A1628" strokeWidth={2} dot={false} />
                              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(value: number) => [formatNumber(value), "Impressions"]} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[100px] flex items-center justify-center bg-gray-50 rounded-lg">
                          <p className="text-xs text-text-4">No data yet &mdash; campaign hasn&apos;t launched</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-text-2 mb-2">Campaign Details</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Start", value: campaign.startDate || "TBD" },
                          { label: "End", value: campaign.endDate || "TBD" },
                          { label: "Budget", value: formatNaira(campaign.budget) },
                          { label: "Spent", value: formatNaira(campaign.spent) },
                          { label: "CPC", value: campaign.clicks > 0 ? formatNaira(Math.round(campaign.spent / campaign.clicks)) : "N/A" },
                          { label: "CTR", value: campaign.impressions > 0 ? `${((campaign.clicks / campaign.impressions) * 100).toFixed(2)}%` : "N/A" },
                        ].map((d) => (
                          <div key={d.label} className="bg-gray-50 rounded-lg p-2">
                            <p className="text-[9px] text-text-4">{d.label}</p>
                            <p className="text-xs font-semibold text-text-1">{d.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {campaigns.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Megaphone size={48} className="text-text-4/30 mx-auto mb-3" />
              <h3 className="font-semibold text-sm text-text-1 mb-1">No campaigns yet</h3>
              <p className="text-xs text-text-4 mb-4">Create your first ad campaign to start promoting your products</p>
              <Link href="/vendor/advertising/new">
                <Button><Plus size={16} className="mr-1" /> Create Campaign</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
