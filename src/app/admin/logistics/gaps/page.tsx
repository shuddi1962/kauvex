"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import { Loader2, AlertTriangle, MapPin, Users, Target, CheckCircle2 } from "lucide-react";

interface CoverageGap {
  id: string;
  city: string;
  state: string;
  country: string;
  gap_severity: string;
  demand_score: number;
  partner_count: number;
  recruitment_campaign_launched: boolean;
}

const severityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-red-50 text-red" },
  moderate: { label: "Moderate", color: "bg-orange-50 text-orange" },
  minor: { label: "Minor", color: "bg-yellow-50 text-yellow-700" },
};

const seedGaps: CoverageGap[] = [
  { id: "1", city: "Kano", state: "Kano", country: "Nigeria", gap_severity: "critical", demand_score: 95, partner_count: 0, recruitment_campaign_launched: false },
  { id: "2", city: "Ibadan", state: "Oyo", country: "Nigeria", gap_severity: "critical", demand_score: 88, partner_count: 1, recruitment_campaign_launched: false },
  { id: "3", city: "Enugu", state: "Enugu", country: "Nigeria", gap_severity: "moderate", demand_score: 76, partner_count: 2, recruitment_campaign_launched: true },
  { id: "4", city: "Benin City", state: "Edo", country: "Nigeria", gap_severity: "moderate", demand_score: 72, partner_count: 1, recruitment_campaign_launched: false },
  { id: "5", city: "Onitsha", state: "Anambra", country: "Nigeria", gap_severity: "critical", demand_score: 68, partner_count: 0, recruitment_campaign_launched: false },
  { id: "6", city: "Kaduna", state: "Kaduna", country: "Nigeria", gap_severity: "minor", demand_score: 55, partner_count: 3, recruitment_campaign_launched: true },
  { id: "7", city: "Jos", state: "Plateau", country: "Nigeria", gap_severity: "minor", demand_score: 48, partner_count: 2, recruitment_campaign_launched: false },
  { id: "8", city: "Maiduguri", state: "Borno", country: "Nigeria", gap_severity: "critical", demand_score: 42, partner_count: 0, recruitment_campaign_launched: false },
];

export default function AdminCoverageGapsPage() {
  const [gaps, setGaps] = useState<CoverageGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await insforge.database
        .from("kv_ship_coverage_gaps")
        .select("*")
        .order("demand_score", { ascending: false });
      if (data && data.length > 0) {
        setGaps(data);
      } else {
        setGaps(seedGaps);
      }
    } catch {
      setGaps(seedGaps);
    } finally { setLoading(false); }
  };

  const launchRecruitment = async (gap: CoverageGap) => {
    if (!confirm(`Launch recruitment campaign for ${gap.city}, ${gap.state}?`)) return;
    setLaunching(gap.id);
    try {
      await insforge.database
        .from("kv_ship_coverage_gaps")
        .update({ recruitment_campaign_launched: true })
        .eq("id", gap.id);
      setGaps(prev => prev.map(g => g.id === gap.id ? { ...g, recruitment_campaign_launched: true } : g));
    } catch (err) { console.error(err); }
    finally { setLaunching(null); }
  };

  const criticalCount = gaps.filter(g => g.gap_severity === "critical").length;
  const zeroPartnerCount = gaps.filter(g => g.partner_count === 0).length;

  return (
    <AdminShell title="Coverage Gaps" subtitle="Identify and resolve network coverage gaps">
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Critical Gaps", value: criticalCount, icon: AlertTriangle, color: "text-red" },
            { label: "Total Gaps", value: gaps.length, icon: Target, color: "text-orange" },
            { label: "Cities With Zero Partners", value: zeroPartnerCount, icon: Users, color: "text-blue" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon size={16} className={s.color} />
                <p className="text-xl font-bold text-text-1">{s.value}</p>
              </div>
              <p className="text-[11px] text-text-4">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["City", "State", "Country", "Severity", "Demand Score", "Partners", "Recruitment", "Actions"].map(h => (
                    <th key={h} className="p-3 text-left text-xs font-medium text-text-4 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gaps.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-text-4">No coverage gaps found</td></tr>
                ) : (
                  gaps.map(g => {
                    const sev = severityConfig[g.gap_severity] || { label: g.gap_severity, color: "bg-gray-100 text-gray-600" };
                    return (
                      <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-text-4" />
                            <span className="font-medium text-text-1">{g.city}</span>
                          </div>
                        </td>
                        <td className="p-3 text-text-3">{g.state}</td>
                        <td className="p-3 text-text-4">{g.country}</td>
                        <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sev.color}`}>{sev.label}</span></td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${g.demand_score >= 80 ? "bg-red" : g.demand_score >= 60 ? "bg-orange" : "bg-yellow-400"}`}
                                style={{ width: `${g.demand_score}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-text-2">{g.demand_score}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`text-sm font-semibold ${g.partner_count === 0 ? "text-red" : "text-text-1"}`}>{g.partner_count}</span>
                        </td>
                        <td className="p-3">
                          {g.recruitment_campaign_launched ? (
                            <span className="flex items-center gap-1 text-[10px] text-green-700 font-medium"><CheckCircle2 size={12} /> Launched</span>
                          ) : (
                            <span className="text-[10px] text-text-4">Not started</span>
                          )}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => launchRecruitment(g)}
                            disabled={g.recruitment_campaign_launched || launching === g.id}
                            className="text-[11px] px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-blue text-white hover:bg-blue-600"
                          >
                            {launching === g.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : g.recruitment_campaign_launched ? "Launched" : "Launch Recruitment"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
