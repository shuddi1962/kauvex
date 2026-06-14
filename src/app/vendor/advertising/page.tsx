"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Megaphone, Plus, ChevronDown, ChevronUp, BarChart3, Eye,
  TrendingUp, TrendingDown, DollarSign, MousePointer, Target,
  Calendar, Wallet, Play, Pause, MoreHorizontal, Trash2,
  Loader2, AlertCircle,
} from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";
import {
  LineChart, Line, ResponsiveContainer, Tooltip,
} from "recharts";

interface Campaign {
  id: string;
  vendorId: string;
  name: string;
  type: string;
  status: string;
  budget: number;
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  budgetType: string;
  bidAmount: number;
  bidType: string;
  targetType: string;
}

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

const demoCampaigns: Campaign[] = [
  {
    id: "CAMP-001", vendorId: "vendor-1", name: "Yamaha Engine Spring Sale", type: "sponsored_product", status: "active",
    budget: 200000, totalSpent: 143200, totalImpressions: 45200, totalClicks: 2340, totalConversions: 120, totalRevenue: 458240,
    startDate: "2026-03-01", endDate: "2026-03-31", createdAt: "2026-02-20", budgetType: "daily", bidAmount: 500, bidType: "auto", targetType: "automatic",
  },
  {
    id: "CAMP-002", vendorId: "vendor-1", name: "Commercial Kitchen Expo", type: "display_ad", status: "active",
    budget: 300000, totalSpent: 210800, totalImpressions: 67800, totalClicks: 3450, totalConversions: 180, totalRevenue: 864280,
    startDate: "2026-02-15", endDate: "2026-04-15", createdAt: "2026-02-10", budgetType: "daily", bidAmount: 800, bidType: "manual", targetType: "automatic",
  },
  {
    id: "CAMP-003", vendorId: "vendor-1", name: "Marine Electronics", type: "sponsored_product", status: "paused",
    budget: 180000, totalSpent: 98000, totalImpressions: 28900, totalClicks: 1450, totalConversions: 65, totalRevenue: 274400,
    startDate: "2026-01-01", endDate: "2026-03-01", createdAt: "2025-12-28", budgetType: "daily", bidAmount: 400, bidType: "auto", targetType: "manual",
  },
  {
    id: "CAMP-004", vendorId: "vendor-1", name: "Marine Accessories Pack", type: "sponsored_product", status: "draft",
    budget: 100000, totalSpent: 0, totalImpressions: 0, totalClicks: 0, totalConversions: 0, totalRevenue: 0,
    startDate: "", endDate: null, createdAt: "2026-03-10", budgetType: "daily", bidAmount: 300, bidType: "auto", targetType: "automatic",
  },
  {
    id: "CAMP-005", vendorId: "vendor-1", name: "End of Season Sale", type: "sponsored_brand", status: "pending_review",
    budget: 250000, totalSpent: 0, totalImpressions: 0, totalClicks: 0, totalConversions: 0, totalRevenue: 0,
    startDate: "2026-04-01", endDate: "2026-04-30", createdAt: "2026-03-15", budgetType: "daily", bidAmount: 600, bidType: "manual", targetType: "automatic",
  },
];

function generateSparkline(): number[] {
  return Array.from({ length: 14 }, () => Math.floor(Math.random() * 2000) + 500);
}

export default function VendorAdvertisingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/ads?vendorId=vendor-1");
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setCampaigns(json.data);
      } else {
        setCampaigns(demoCampaigns);
      }
    } catch {
      setCampaigns(demoCampaigns);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const updateCampaignStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/v1/ads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
      } else {
        setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: status === "active" ? "paused" : "active" } : c));
      }
    } catch {
      setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: status === "active" ? "paused" : "active" } : c));
    } finally {
      setActionLoading(null);
    }
  };

  const togglePause = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "paused" : "active";
    setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: nextStatus } : c));
    updateCampaignStatus(id, nextStatus);
  };

  const endCampaign = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/v1/ads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ended" }),
      });
      if (res.ok) {
        setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: "ended" } : c));
      } else {
        setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: "ended" } : c));
      }
    } catch {
      setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: "ended" } : c));
    } finally {
      setActionLoading(null);
    }
  };

  const totalSpent = campaigns.reduce((s, c) => s + c.totalSpent, 0);
  const activeCount = campaigns.filter((c) => c.status === "active").length;
  const totalImpressions = campaigns.reduce((s, c) => s + c.totalImpressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.totalClicks, 0);
  const avgROAS = totalSpent > 0
    ? (campaigns.filter((c) => c.totalRevenue > 0).reduce((s, c) => s + (c.totalRevenue / c.totalSpent) * c.totalSpent, 0) / totalSpent).toFixed(1)
    : "0.0";

  const formatNaira = (n: number) => {
    if (n >= 1e6) return `₦${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `₦${(n / 1e3).toFixed(0)}K`;
    return `₦${n.toLocaleString()}`;
  };

  const formatNumber = (n: number) => n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : n.toLocaleString();

  const sparklineData = useCallback((id: string) => {
    const key = `sparkline-${id}`;
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(key);
      if (cached) return JSON.parse(cached);
    }
    const data = generateSparkline();
    if (typeof window !== "undefined") {
      sessionStorage.setItem(key, JSON.stringify(data));
    }
    return data;
  }, []);

  return (
    <VendorShell title="Advertising" subtitle="Manage your ad campaigns and promotions">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-text-4">Manage your ad campaigns and promotions</p>
        <div className="flex items-center gap-2">
          <Link href="/vendor/advertising/wallet">
            <Button variant="outline" size="sm"><Wallet size={14} className="mr-1" /> Ad Wallet</Button>
          </Link>
          <Link href="/vendor/advertising/new">
            <Button size="sm"><Plus size={16} className="mr-1" /> Create Campaign</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-text-4" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <AlertCircle size={48} className="text-red/50 mx-auto mb-3" />
            <h3 className="font-semibold text-sm text-text-1 mb-1">Failed to load campaigns</h3>
            <p className="text-xs text-text-4 mb-4">{error}</p>
            <Button onClick={fetchCampaigns}><TrendingUp size={14} className="mr-1" /> Retry</Button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Active Campaigns", value: activeCount, icon: Megaphone, color: "text-green-600", bg: "bg-green-50", change: `${campaigns.filter(c => c.status === "active").length} active` },
                { label: "Total Spent", value: formatNaira(totalSpent), icon: DollarSign, color: "text-blue", bg: "bg-blue-50", change: `${((totalSpent / campaigns.reduce((s, c) => s + c.budget, 0)) * 100).toFixed(1)}% of budget` },
                { label: "Total Impressions", value: formatNumber(totalImpressions), icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50", change: `Avg ${totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0"}% CTR` },
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
              {campaigns.map((campaign) => {
                const roas = campaign.totalSpent > 0 ? campaign.totalRevenue / campaign.totalSpent : 0;
                const sparkline = sparklineData(campaign.id);
                return (
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
                          <p className="font-semibold text-text-1">{formatNaira(campaign.totalSpent)}</p>
                          <p className="text-text-4">{formatNaira(campaign.budget)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-text-1">{formatNumber(campaign.totalImpressions)}</p>
                          <p className="text-text-4">Impressions</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-text-1">{formatNumber(campaign.totalClicks)}</p>
                          <p className="text-text-4">Clicks</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${roas >= 3 ? "text-green-600" : roas >= 1 ? "text-amber-600" : "text-red"}`}>{roas.toFixed(1)}x</p>
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
                              href={`/vendor/advertising/analytics?campaignId=${campaign.id}`}
                              onClick={() => setMenuOpen(null)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-text-2 hover:bg-gray-50"
                            >
                              <BarChart3 size={14} /> Analytics
                            </Link>
                            <button onClick={() => { setMenuOpen(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-text-2 hover:bg-gray-50">
                              <Eye size={14} /> Edit
                            </button>
                            <button
                              onClick={() => { if (confirm("End this campaign?")) { endCampaign(campaign.id); } setMenuOpen(null); }}
                              disabled={actionLoading === campaign.id}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red hover:bg-red-50 disabled:opacity-50"
                            >
                              {actionLoading === campaign.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              End Campaign
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
                            {sparkline.length > 0 ? (
                              <div className="h-[100px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={sparkline.map((v: number, i: number) => ({ day: i + 1, value: v }))}>
                                    <Line type="monotone" dataKey="value" stroke="#0A1628" strokeWidth={2} dot={false} />
                                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(value: unknown) => [formatNumber(Number(value)), "Impressions"]} />
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
                                { label: "Start", value: campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "TBD" },
                                { label: "End", value: campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : "TBD" },
                                { label: "Budget", value: formatNaira(campaign.budget) },
                                { label: "Spent", value: formatNaira(campaign.totalSpent) },
                                { label: "CPC", value: campaign.totalClicks > 0 ? formatNaira(Math.round(campaign.totalSpent / campaign.totalClicks)) : "N/A" },
                                { label: "CTR", value: campaign.totalImpressions > 0 ? `${((campaign.totalClicks / campaign.totalImpressions) * 100).toFixed(2)}%` : "N/A" },
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
                );
              })}
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
          </>
        )}
      </div>
    </VendorShell>
  );
}
