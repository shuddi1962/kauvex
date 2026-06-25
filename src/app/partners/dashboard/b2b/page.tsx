"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2, Users, Handshake, DollarSign, TrendingUp, Plus,
  BarChart3, ArrowUp, ArrowDown, X, Loader2, Trash2, ChevronDown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface B2bReferral {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  industry: string;
  deal_size: string;
  pipeline_stage: string;
  referral_date: string;
  first_payment_date: string | null;
  recurring_commission_rate: number;
  total_earned: number;
  notes: string | null;
  status: string;
}

interface B2bStats {
  totalReferrals: number;
  closedDeals: number;
  totalCommission: number;
  conversionRate: number;
  pipeline: Record<string, number>;
  monthlyEarnings: { month: string; amount: number }[];
}

const stageColors: Record<string, string> = {
  lead: "text-blue-700 bg-blue-50",
  meeting: "text-purple-700 bg-purple-50",
  proposal: "text-amber-700 bg-amber-50",
  closed: "text-green-700 bg-green-50",
  lost: "text-red-700 bg-red-50",
};

const stageBarColors: Record<string, string> = {
  lead: "#3b82f6",
  meeting: "#8b5cf6",
  proposal: "#f59e0b",
  closed: "#22c55e",
  lost: "#ef4444",
};

const STAGES = ["lead", "meeting", "proposal", "closed", "lost"];

export default function B2bPage() {
  const [referrals, setReferrals] = useState<B2bReferral[]>([]);
  const [stats, setStats] = useState<B2bStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    industry: "Technology",
    deal_size: "small",
    notes: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const [refRes, statsRes] = await Promise.all([
        fetch("/api/v1/affiliates/b2b/referrals"),
        fetch("/api/v1/affiliates/b2b/stats"),
      ]);
      if (refRes.ok) {
        const d = await refRes.json();
        setReferrals(d.referrals || []);
      }
      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      }
    } catch (e) {
      console.error("Failed to fetch B2B data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/affiliates/b2b/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ company_name: "", contact_name: "", contact_email: "", industry: "Technology", deal_size: "small", notes: "" });
        fetchData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStageChange = async (id: string, stage: string) => {
    await fetch(`/api/v1/affiliates/b2b/referrals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this referral?")) return;
    await fetch(`/api/v1/affiliates/b2b/referrals/${id}`, { method: "DELETE" });
    fetchData();
  };

  const statCards = [
    { label: "B2B Referrals", value: String(stats?.totalReferrals || 0), icon: Users, change: "Total", up: true },
    { label: "Closed Deals", value: String(stats?.closedDeals || 0), icon: Handshake, change: `${stats?.conversionRate || 0}% close rate`, up: true },
    { label: "Total Commission", value: `$${(stats?.totalCommission || 0).toLocaleString()}`, icon: DollarSign, change: "Lifetime", up: true },
    { label: "Conversion Rate", value: `${stats?.conversionRate || 0}%`, icon: TrendingUp, change: "All time", up: true },
  ];

  const pipelineData = stats?.pipeline
    ? Object.entries(stats.pipeline).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        color: stageBarColors[name] || "#94a3b8",
      }))
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0A1628]">B2B Referral Dashboard</h1>
          <p className="text-xs text-gray-500">Track your business referrals, deals, and B2B commissions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 h-9 px-4 bg-[#FF6B00] text-white font-bold text-[10px] rounded-lg hover:bg-[#FF6B00]/90 transition-colors"
        >
          {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "New Referral"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-bold text-sm text-[#0A1628]">New B2B Referral</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Company Name *</label>
              <input required value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Contact Name *</label>
              <input required value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Contact Email *</label>
              <input required type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Industry</label>
              <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]">
                {["Technology", "Finance", "Healthcare", "Retail", "Manufacturing", "Logistics", "Energy", "Education", "Other"].map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Deal Size</label>
              <select value={form.deal_size} onChange={(e) => setForm({ ...form, deal_size: e.target.value })}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]">
                <option value="small">Small (&lt;$10K)</option>
                <option value="medium">Medium ($10K-$50K)</option>
                <option value="large">Large ($50K-$200K)</option>
                <option value="enterprise">Enterprise ($200K+)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Notes</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="Optional" />
            </div>
          </div>
          <button type="submit" disabled={submitting}
            className="flex items-center gap-1.5 h-9 px-5 bg-[#FF6B00] text-white font-bold text-[10px] rounded-lg hover:bg-[#FF6B00]/90 transition-colors disabled:opacity-50">
            {submitting ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Create Referral
          </button>
        </form>
      )}

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                  <Icon size={15} />
                </div>
                <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${card.up ? "text-green-600" : "text-red-500"}`}>
                  {card.up ? <ArrowUp size={9} /> : <ArrowDown size={9} />} {card.change}
                </span>
              </div>
              <p className="text-[10px] text-gray-500">{card.label}</p>
              <p className="font-bold text-lg text-[#0A1628]">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Pipeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
            <BarChart3 size={14} className="text-[#FF6B00]" /> Sales Pipeline
          </h3>
          {pipelineData.length > 0 ? (
            <div className="flex items-end gap-2 h-32">
              {pipelineData.map((stage) => {
                const maxCount = Math.max(...pipelineData.map((s) => s.count), 1);
                const height = (stage.count / maxCount) * 100;
                return (
                  <div key={stage.name} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-gray-700">{stage.count}</span>
                    <div className="w-full rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${Math.max(height, 8)}%`, background: stage.color }} />
                    <span className="text-[9px] text-gray-500 font-medium">{stage.name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-8">No referrals yet</p>
          )}
        </div>

        {/* Monthly Earnings */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
            <DollarSign size={14} className="text-[#FF6B00]" /> Monthly B2B Earnings
          </h3>
          {stats?.monthlyEarnings && stats.monthlyEarnings.length > 0 ? (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 11 }}
                    formatter={(value: any) => [`$${value}`, undefined]} />
                  <Bar dataKey="amount" fill="#FF6B00" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-8">No earnings data yet</p>
          )}
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
          <Building2 size={14} className="text-[#FF6B00]" /> B2B Referrals
        </h3>
        {referrals.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">No referrals yet. Create your first B2B referral above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3">Company</th>
                  <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3">Contact</th>
                  <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3">Industry</th>
                  <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3">Deal Size</th>
                  <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3">Commission</th>
                  <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3">Stage</th>
                  <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3">Date</th>
                  <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-3">
                      <p className="text-xs font-semibold text-gray-800">{ref.company_name}</p>
                    </td>
                    <td className="py-2.5 pr-3">
                      <p className="text-[11px] text-gray-600">{ref.contact_name}</p>
                      <p className="text-[9px] text-gray-400">{ref.contact_email}</p>
                    </td>
                    <td className="py-2.5 pr-3">
                      <p className="text-[11px] text-gray-600">{ref.industry}</p>
                    </td>
                    <td className="py-2.5 pr-3">
                      <p className="text-xs font-semibold text-gray-800 capitalize">{ref.deal_size}</p>
                    </td>
                    <td className="py-2.5 pr-3">
                      <p className="text-xs font-semibold text-green-700">${(ref.total_earned || 0).toLocaleString()}</p>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="relative">
                        <select
                          value={ref.pipeline_stage}
                          onChange={(e) => handleStageChange(ref.id, e.target.value)}
                          className={`text-[9px] font-semibold px-2 py-0.5 rounded-full appearance-none cursor-pointer pr-5 ${stageColors[ref.pipeline_stage] || "text-gray-600 bg-gray-100"}`}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        <ChevronDown size={8} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <p className="text-[11px] text-gray-500">{ref.referral_date ? new Date(ref.referral_date).toLocaleDateString() : "—"}</p>
                    </td>
                    <td className="py-2.5">
                      <button onClick={() => handleDelete(ref.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
