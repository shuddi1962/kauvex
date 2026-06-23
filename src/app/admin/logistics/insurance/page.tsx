"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Loader2, ShieldCheck, DollarSign, FileText, PieChart,
  Check, X, AlertTriangle,
} from "lucide-react";

interface InsurancePolicy {
  id?: string;
  shipment_type: string;
  declared_value: number;
  premium_amount: number;
  premium_rate: number;
  status: string;
  claim_status: string | null;
  claim_amount: number | null;
  created_at: string;
}

const statusBadges: Record<string, string> = {
  active: "bg-blue-50 text-blue-600",
  claimed: "bg-orange-50 text-orange-600",
  expired: "bg-gray-100 text-text-4",
};

const claimStatusBadges: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
};

export default function InsurancePage() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await insforge.database.from("kv_ship_insurance_reserve").select("*").order("created_at", { ascending: false });
      if (data) setPolicies(data);
    } catch (e) {
      console.error("Failed to load insurance data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAction = async (id: string, action: "approved" | "rejected") => {
    setClaimLoading(id);
    try {
      await insforge.database.from("kv_ship_insurance_reserve").update({ claim_status: action }).eq("id", id);
      setPolicies(policies.map(p => p.id === id ? { ...p, claim_status: action } : p));
    } catch (e) {
      console.error("Failed to update claim:", e);
    } finally {
      setClaimLoading(null);
    }
  };

  const totalPremiums = policies
    .filter(p => p.status === "active")
    .reduce((s, p) => s + p.premium_amount, 0);

  const totalClaimsPaid = policies
    .filter(p => p.claim_status === "approved")
    .reduce((s, p) => s + (p.claim_amount || 0), 0);

  const activePolicies = policies.filter(p => p.status === "active").length;
  const reserveBalance = totalPremiums - totalClaimsPaid;

  if (loading) {
    return (
      <AdminShell title="Insurance & Liability" subtitle="Shipping insurance reserve management">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Insurance & Liability" subtitle="Shipping insurance reserve management">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Premiums Collected", value: totalPremiums, prefix: "$", icon: DollarSign, color: "text-blue" },
          { label: "Total Claims Paid", value: totalClaimsPaid, prefix: "$", icon: FileText, color: "text-orange" },
          { label: "Active Policies", value: activePolicies, icon: ShieldCheck, color: "text-green-600" },
          { label: "Reserve Balance", value: reserveBalance, prefix: "$", icon: PieChart, color: reserveBalance >= 0 ? "text-green-600" : "text-red" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} className={s.color} />
                <p className="text-xs text-text-4">{s.label}</p>
              </div>
              <p className={`font-bold text-2xl ${s.color}`}>
                {s.prefix || ""}{typeof s.value === "number" ? s.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : s.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-sm text-text-1">Insurance Policies</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Shipment Type</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Declared Value</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Premium</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Rate</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Status</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Claim Status</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Created</th>
            </tr>
          </thead>
          <tbody>
            {policies.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-sm text-text-4">No insurance policies found</td></tr>
            ) : policies.map(p => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-3">
                  <span className="text-sm font-medium text-text-1">{p.shipment_type}</span>
                </td>
                <td className="p-3 text-right text-sm font-semibold text-text-1">
                  ${p.declared_value.toLocaleString()}
                </td>
                <td className="p-3 text-right text-sm text-text-2">
                  ${p.premium_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-right text-sm text-text-4">
                  {(p.premium_rate * 100).toFixed(2)}%
                </td>
                <td className="p-3 text-center">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadges[p.status] || "bg-gray-100 text-text-4"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {p.claim_status ? (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${claimStatusBadges[p.claim_status] || "bg-gray-100 text-text-4"}`}>
                      {p.claim_status}
                    </span>
                  ) : (
                    <span className="text-[10px] text-text-4">—</span>
                  )}
                </td>
                <td className="p-3">
                  <span className="text-xs text-text-4">{new Date(p.created_at).toLocaleDateString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-text-1">Claims Management</h3>
          <span className="text-xs text-text-4">{policies.filter(p => p.claim_status === "pending").length} pending</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Policy ID</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Declared Value</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Claim Amount</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Claim Status</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.filter(p => p.claim_status).length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-sm text-text-4">No claims found</td></tr>
            ) : policies.filter(p => p.claim_status).map(p => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-3">
                  <span className="text-xs font-mono font-medium text-text-1">{p.id?.slice(0, 8)}</span>
                </td>
                <td className="p-3 text-right text-sm font-semibold text-text-1">
                  ${p.declared_value.toLocaleString()}
                </td>
                <td className="p-3 text-right text-sm font-semibold text-text-1">
                  ${(p.claim_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-center">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${claimStatusBadges[p.claim_status!] || "bg-gray-100 text-text-4"}`}>
                    {p.claim_status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {p.claim_status === "pending" ? (
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleClaimAction(p.id!, "approved")}
                        disabled={claimLoading === p.id}
                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        {claimLoading === p.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      </button>
                      <button
                        onClick={() => handleClaimAction(p.id!, "rejected")}
                        disabled={claimLoading === p.id}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-text-4 italic">{p.claim_status === "approved" ? "Approved" : "Rejected"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
