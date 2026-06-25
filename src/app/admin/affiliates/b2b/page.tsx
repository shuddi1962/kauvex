"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Building2, Users, Handshake, DollarSign, TrendingUp, Search,
  ChevronDown, ArrowUp, ArrowDown, Loader2, Eye, Trash2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface B2bReferral {
  id: string;
  partner_id: string;
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
  partner_name?: string;
  partner_email?: string;
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

export default function AdminB2bPage() {
  const [referrals, setReferrals] = useState<B2bReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [selectedReferral, setSelectedReferral] = useState<B2bReferral | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/affiliates/b2b");
      if (res.ok) {
        const d = await res.json();
        setReferrals(d.referrals || []);
      }
    } catch (e) {
      console.error("Failed to fetch B2B data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = referrals.filter((r) => {
    if (stageFilter !== "all" && r.pipeline_stage !== stageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.company_name.toLowerCase().includes(q) ||
        r.contact_name.toLowerCase().includes(q) ||
        r.contact_email.toLowerCase().includes(q) ||
        (r.partner_name || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: referrals.length,
    closed: referrals.filter((r) => r.pipeline_stage === "closed").length,
    totalCommission: referrals.reduce((s, r) => s + (r.total_earned || 0), 0),
    conversionRate: referrals.length > 0 ? Math.round((referrals.filter((r) => r.pipeline_stage === "closed").length / referrals.length) * 100) : 0,
  };

  const pipelineData = STAGES.map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    count: referrals.filter((r) => r.pipeline_stage === s).length,
    color: stageBarColors[s],
  }));

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

  return (
    <AdminShell title="B2B Affiliates" subtitle="Manage B2B referral partners, pipeline, and recurring commissions">
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Referrals", value: String(stats.total), icon: Users, color: "text-blue" },
            { label: "Closed Deals", value: String(stats.closed), icon: Handshake, color: "text-green-600" },
            { label: "Total Commission", value: `$${stats.totalCommission.toLocaleString()}`, icon: DollarSign, color: "text-purple-600" },
            { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "text-[#FF6B00]" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={15} className={s.color} />
                <span className="text-[10px] text-gray-500 font-medium">{s.label}</span>
              </div>
              <p className="text-lg font-bold text-[#0A1628]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Pipeline + Chart */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-[#FF6B00]" /> Referral Pipeline
            </h3>
            <div className="flex items-end gap-2 h-32">
              {pipelineData.map((stage) => {
                const maxCount = Math.max(...pipelineData.map((s) => s.count), 1);
                const height = (stage.count / maxCount) * 100;
                return (
                  <div key={stage.name} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-gray-700">{stage.count}</span>
                    <div className="w-full rounded-t-lg" style={{ height: `${Math.max(height, 8)}%`, background: stage.color }} />
                    <span className="text-[9px] text-gray-500 font-medium">{stage.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
              <DollarSign size={14} className="text-[#FF6B00]" /> Commission by Stage
            </h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={STAGES.map((s) => ({
                  name: s.charAt(0).toUpperCase() + s.slice(1),
                  amount: referrals.filter((r) => r.pipeline_stage === s).reduce((sum, r) => sum + (r.total_earned || 0), 0),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 11 }}
                    formatter={(value: any) => [`$${value}`, "Commission"]} />
                  <Bar dataKey="amount" fill="#FF6B00" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company, contact..."
              className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
          </div>
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
            className="h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]">
            <option value="all">All Stages</option>
            {STAGES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-[#FF6B00]" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-12">No B2B referrals found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-[10px] font-semibold text-gray-400 uppercase px-5 py-3">Company</th>
                    <th className="text-[10px] font-semibold text-gray-400 uppercase px-5 py-3">Contact</th>
                    <th className="text-[10px] font-semibold text-gray-400 uppercase px-5 py-3">Industry</th>
                    <th className="text-[10px] font-semibold text-gray-400 uppercase px-5 py-3">Deal Size</th>
                    <th className="text-[10px] font-semibold text-gray-400 uppercase px-5 py-3">Commission</th>
                    <th className="text-[10px] font-semibold text-gray-400 uppercase px-5 py-3">Stage</th>
                    <th className="text-[10px] font-semibold text-gray-400 uppercase px-5 py-3">Date</th>
                    <th className="text-[10px] font-semibold text-gray-400 uppercase px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ref) => (
                    <tr key={ref.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-xs font-semibold text-gray-800">{ref.company_name}</p>
                        {ref.partner_name && <p className="text-[9px] text-gray-400">by {ref.partner_name}</p>}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-[11px] text-gray-600">{ref.contact_name}</p>
                        <p className="text-[9px] text-gray-400">{ref.contact_email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-[11px] text-gray-600">{ref.industry}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-xs font-semibold text-gray-800 capitalize">{ref.deal_size}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-xs font-semibold text-green-700">${(ref.total_earned || 0).toLocaleString()}</p>
                        <p className="text-[9px] text-gray-400">{ref.recurring_commission_rate}% recurring</p>
                      </td>
                      <td className="px-5 py-3">
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
                      <td className="px-5 py-3">
                        <p className="text-[11px] text-gray-500">{ref.referral_date ? new Date(ref.referral_date).toLocaleDateString() : "—"}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedReferral(ref)} className="text-gray-400 hover:text-blue transition-colors">
                            <Eye size={13} />
                          </button>
                          <button onClick={() => handleDelete(ref.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedReferral && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReferral(null)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#0A1628]">{selectedReferral.company_name}</h3>
                <button onClick={() => setSelectedReferral(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-gray-400">Contact:</span> <span className="font-medium">{selectedReferral.contact_name}</span></div>
                <div><span className="text-gray-400">Email:</span> <span className="font-medium">{selectedReferral.contact_email}</span></div>
                <div><span className="text-gray-400">Industry:</span> <span className="font-medium">{selectedReferral.industry}</span></div>
                <div><span className="text-gray-400">Deal Size:</span> <span className="font-medium capitalize">{selectedReferral.deal_size}</span></div>
                <div><span className="text-gray-400">Stage:</span> <span className={`font-semibold px-2 py-0.5 rounded-full text-[9px] ${stageColors[selectedReferral.pipeline_stage]}`}>{selectedReferral.pipeline_stage}</span></div>
                <div><span className="text-gray-400">Commission:</span> <span className="font-medium text-green-700">${(selectedReferral.total_earned || 0).toLocaleString()}</span></div>
                <div><span className="text-gray-400">Recurring Rate:</span> <span className="font-medium">{selectedReferral.recurring_commission_rate}%</span></div>
                <div><span className="text-gray-400">Referred:</span> <span className="font-medium">{selectedReferral.referral_date ? new Date(selectedReferral.referral_date).toLocaleDateString() : "—"}</span></div>
                {selectedReferral.notes && <div className="col-span-2"><span className="text-gray-400">Notes:</span> <span className="font-medium">{selectedReferral.notes}</span></div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function BarChart3({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="12" width="4" height="9" rx="1" /><rect x="10" y="7" width="4" height="14" rx="1" /><rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}
