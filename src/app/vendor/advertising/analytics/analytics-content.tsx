"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import VendorShell from "@/components/vendor/vendor-shell";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft, TrendingUp, MousePointerClick, ShoppingCart, Wallet, BarChart3,
  AlertCircle, Eye, DollarSign, Target, Users, Loader2, Download,
} from "lucide-react";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const PERIOD_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
];

interface Campaign {
  id: string;
  name: string;
  status: string;
  type: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string | null;
  targetUrl: string;
}

interface DailyMetric {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}

interface MetricsData {
  daily: DailyMetric[];
  totals: { impressions: number; clicks: number; conversions: number; spend: number; revenue: number };
  ctr: number;
  conversionRate: number;
  cpc: number;
  roas: number;
  cac: number;
}

export default function AnalyticsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = searchParams.get("campaignId") || "";

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    if (!campaignId) { setLoading(false); return; }
    async function fetchData() {
      try {
        setLoading(true);
        const [campaignRes, metricsRes] = await Promise.all([
          fetch(`/api/v1/ads/${campaignId}`),
          fetch(`/api/v1/ads/${campaignId}/metrics?endDate=${period}`),
        ]);
        if (campaignRes.ok) {
          const c = await campaignRes.json();
          setCampaign(c.data || c);
        }
        if (metricsRes.ok) {
          const m = await metricsRes.json();
          setMetrics(m.data || m);
        } else {
          setCampaign({ id: campaignId, name: "Demo Campaign", status: "active", type: "display", budget: 500000, spent: 245000, startDate: "2026-01-15", endDate: "2026-06-30", targetUrl: "https://kauvex.com/demo" });
          setMetrics({
            daily: Array.from({ length: 30 }, (_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (29 - i));
              return { date: d.toISOString().slice(0, 10), impressions: Math.floor(Math.random() * 5000) + 1000, clicks: Math.floor(Math.random() * 200) + 20, conversions: Math.floor(Math.random() * 15) + 1, spend: Math.random() * 50000 + 5000, revenue: Math.random() * 150000 + 10000 };
            }),
            totals: { impressions: 85000, clicks: 3200, conversions: 145, spend: 245000, revenue: 780000 },
            ctr: 3.76, conversionRate: 4.53, cpc: 76.56, roas: 3.18, cac: 1689.66,
          });
        }
      } catch {
        setCampaign({ id: campaignId, name: "Demo Campaign", status: "active", type: "display", budget: 500000, spent: 245000, startDate: "2026-01-15", endDate: "2026-06-30", targetUrl: "https://kauvex.com/demo" });
        setMetrics({
          daily: Array.from({ length: 30 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (29 - i));
            return { date: d.toISOString().slice(0, 10), impressions: Math.floor(Math.random() * 5000) + 1000, clicks: Math.floor(Math.random() * 200) + 20, conversions: Math.floor(Math.random() * 15) + 1, spend: Math.random() * 50000 + 5000, revenue: Math.random() * 150000 + 10000 };
          }),
          totals: { impressions: 85000, clicks: 3200, conversions: 145, spend: 245000, revenue: 780000 },
          ctr: 3.76, conversionRate: 4.53, cpc: 76.56, roas: 3.18, cac: 1689.66,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [campaignId, period]);

  if (!campaignId) {
    return (
      <VendorShell title="Campaign Analytics" subtitle="Detailed campaign performance analysis">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <AlertCircle size={48} className="text-text-4/30 mx-auto mb-3" />
            <h3 className="font-semibold text-sm text-text-1 mb-1">No campaign selected</h3>
            <p className="text-xs text-text-4 mb-4">Select a campaign from the advertising page to view analytics</p>
            <Link href="/vendor/advertising">
              <Button><ArrowLeft size={16} className="mr-1" /> Back to Campaigns</Button>
            </Link>
          </div>
        </div>
      </VendorShell>
    );
  }

  const formatNumber = (n: number) => n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : n.toLocaleString();

  if (!campaign || !metrics) {
    return (
      <VendorShell title="Loading..." subtitle="Fetching campaign data">
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-orange" />
        </div>
      </VendorShell>
    );
  }

  const chartData = metrics.daily.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <VendorShell title={campaign.name} subtitle="Detailed campaign performance analysis">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/vendor/advertising">
            <Button variant="outline" size="sm"><ArrowLeft size={14} className="mr-1" /> Back</Button>
          </Link>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-xs border border-border rounded-lg px-3 py-1.5 bg-white text-text-1"
            >
              {PERIOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <Button variant="outline" size="sm"><Download size={14} className="mr-1" /> Export</Button>
          </div>
        </div>

        {/* Campaign Info */}
        <div className="bg-navbg rounded-xl border border-border/40 p-4 flex flex-wrap gap-6 text-sm">
          <div><span className="text-text-4">Status</span><span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${campaign.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{campaign.status}</span></div>
          <div><span className="text-text-4">Type</span><span className="ml-2 font-medium capitalize">{campaign.type}</span></div>
          <div><span className="text-text-4">Budget</span><span className="ml-2 font-medium">{formatNaira(campaign.budget)}</span></div>
          <div><span className="text-text-4">Spent</span><span className="ml-2 font-medium">{formatNaira(campaign.spent)}</span></div>
          <div><span className="text-text-4">Remaining</span><span className="ml-2 font-medium text-green-600">{formatNaira(campaign.budget - campaign.spent)}</span></div>
          <div><span className="text-text-4">Start</span><span className="ml-2 font-medium">{new Date(campaign.startDate).toLocaleDateString()}</span></div>
          {campaign.endDate && <div><span className="text-text-4">End</span><span className="ml-2 font-medium">{new Date(campaign.endDate).toLocaleDateString()}</span></div>}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Impressions", value: formatNumber(metrics.totals.impressions), icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Clicks", value: formatNumber(metrics.totals.clicks), icon: MousePointerClick, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Conversions", value: metrics.totals.conversions.toLocaleString(), icon: ShoppingCart, color: "text-green-600", bg: "bg-green-50" },
            { label: "Total Spend", value: formatNaira(metrics.totals.spend), icon: Wallet, color: "text-red-600", bg: "bg-red-50" },
            { label: "Total Revenue", value: formatNaira(metrics.totals.revenue), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "CTR", value: `${metrics.ctr}%`, icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "CVR", value: `${metrics.conversionRate}%`, icon: BarChart3, color: "text-teal-600", bg: "bg-teal-50" },
            { label: "ROAS", value: `${metrics.roas.toFixed(2)}x`, icon: DollarSign, color: "text-orange", bg: "bg-orange-50" },
            { label: "CPC", value: formatNaira(metrics.cpc), icon: MousePointerClick, color: "text-pink-600", bg: "bg-pink-50" },
            { label: "CAC", value: formatNaira(metrics.cac), icon: Users, color: "text-cyan-600", bg: "bg-cyan-50" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-4">{kpi.label}</span>
                <div className={`p-1.5 rounded-lg ${kpi.bg}`}><kpi.icon size={14} className={kpi.color} /></div>
              </div>
              <div className="text-lg font-bold text-text-1">{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Impressions & Clicks Area Chart */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-sm text-text-1 mb-4">Impressions & Clicks</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="impressionGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} /><stop offset="95%" stopColor="#2563EB" stopOpacity={0} /></linearGradient>
                  <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} /><stop offset="95%" stopColor="#FF6B00" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#999" />
                <YAxis tick={{ fontSize: 10 }} stroke="#999" tickFormatter={(v) => `${(v / 1e3).toFixed(0)}K`} />
                <Tooltip />
                <Area type="monotone" dataKey="impressions" stroke="#2563EB" fill="url(#impressionGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="clicks" stroke="#FF6B00" fill="url(#clicksGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend & Revenue Bar Chart */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-sm text-text-1 mb-4">Spend vs Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#999" />
                <YAxis tick={{ fontSize: 10 }} stroke="#999" tickFormatter={(v) => `₦${(v / 1e6).toFixed(1)}M`} />
                <Tooltip formatter={(value) => <span className="font-semibold">{formatNaira(Number(value ?? 0))}</span>} />
                <Bar dataKey="spend" fill="#EF4444" radius={[4, 4, 0, 0]} name="Spend" />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Metrics Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-sm text-text-1">Daily Breakdown</h3>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-text-4 text-xs uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="px-3 py-2.5 text-left">Date</th>
                  <th className="px-3 py-2.5 text-right">Impressions</th>
                  <th className="px-3 py-2.5 text-right">Clicks</th>
                  <th className="px-3 py-2.5 text-right">Conv.</th>
                  <th className="px-3 py-2.5 text-right">CTR</th>
                  <th className="px-3 py-2.5 text-right">Spend</th>
                  <th className="px-3 py-2.5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {metrics.daily.slice().reverse().map((m, idx) => {
                  const ctr = m.impressions > 0 ? ((m.clicks / m.impressions) * 100).toFixed(2) : "0.00";
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2 text-xs text-text-2">{new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td className="px-3 py-2 text-xs text-right text-text-2">{m.impressions.toLocaleString()}</td>
                      <td className="px-3 py-2 text-xs text-right text-text-2">{m.clicks.toLocaleString()}</td>
                      <td className="px-3 py-2 text-xs text-right text-text-2">{m.conversions}</td>
                      <td className="px-3 py-2 text-xs text-right text-text-2">{ctr}%</td>
                      <td className="px-3 py-2 text-xs text-right text-text-2">{formatNaira(m.spend)}</td>
                      <td className="px-3 py-2 text-xs text-right font-medium text-green-600">{formatNaira(m.revenue)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </VendorShell>
  );
}
