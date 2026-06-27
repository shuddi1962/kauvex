"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Loader2, DollarSign, Filter, Clock, Play,
  CheckCircle, XCircle, AlertTriangle, ArrowUpDown,
} from "lucide-react";

interface PartnerPayout {
  id?: string;
  partner_id: string;
  amount: number;
  deduction_amount: number;
  net_amount: number;
  status: string;
  period: string;
  created_at: string;
}

const statusBadges: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  processing: "bg-blue-50 text-blue-600",
  paid: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-600",
  reversed: "bg-gray-100 text-text-4",
};

const periodOptions = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
const statusOptions = ["pending", "processing", "paid", "failed", "reversed"];

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PartnerPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [runBatchLoading, setRunBatchLoading] = useState(false);
  const [batchSuccess, setBatchSuccess] = useState("");
  const [batchError, setBatchError] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await insforge.database.from("kv_ship_partner_payouts").select("*").order("created_at", { ascending: false });
      if (data) setPayouts(data);
    } catch (e) {
      console.error("Failed to load payouts:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBatch = async () => {
    setRunBatchLoading(true);
    setBatchSuccess("");
    setBatchError("");
    try {
      const pendingIds = payouts
        .filter((p) => p.status === "pending")
        .map((p) => p.id)
        .filter(Boolean) as string[];

      if (pendingIds.length === 0) {
        setBatchError("No pending payouts to process.");
        return;
      }

      const res = await fetch("/api/v1/admin/payouts/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payout_ids: pendingIds }),
      });

      const json = await res.json();

      if (!res.ok) {
        setBatchError(json.error || "Failed to process payout batch.");
        return;
      }

      setBatchSuccess(`Batch initiated. ${pendingIds.length} payout(s) queued for processing.`);
      loadData();
    } catch (err) {
      console.error("Batch payout error:", err);
      setBatchError("Network error. Please try again.");
    } finally {
      setRunBatchLoading(false);
    }
  };

  const filtered = payouts.filter(p => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (periodFilter && p.period !== periodFilter) return false;
    return true;
  });

  const totalPending = payouts
    .filter(p => p.status === "pending")
    .reduce((s, p) => s + p.net_amount, 0);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const totalPaidThisMonth = payouts
    .filter(p => p.status === "paid" && p.period === currentMonth)
    .reduce((s, p) => s + p.net_amount, 0);

  if (loading) {
    return (
      <AdminShell title="Partner Payouts" subtitle="Logistics partner payout management">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Partner Payouts" subtitle="Logistics partner payout management">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Pending", value: totalPending, prefix: "$", icon: Clock, color: "text-amber-600" },
          { label: "Paid This Month", value: totalPaidThisMonth, prefix: "$", icon: CheckCircle, color: "text-green-600" },
          { label: "Total Payouts", value: payouts.length, icon: DollarSign, color: "text-blue" },
          { label: "Failed", value: payouts.filter(p => p.status === "failed").length, icon: XCircle, color: "text-red" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} className={s.color} />
                <p className="text-xs text-text-4">{s.label}</p>
              </div>
              <p className={`font-bold text-2xl ${s.color}`}>
                {s.prefix || ""}{typeof s.value === "number" ? s.value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : s.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-text-4" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select
            value={periodFilter}
            onChange={e => setPeriodFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue"
          >
            <option value="">All Periods</option>
            {periodOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <span className="text-sm text-text-4 ml-1">{filtered.length} payouts</span>
        </div>
        <button
          onClick={handleRunBatch}
          disabled={runBatchLoading}
          className="h-9 px-4 bg-orange text-white text-sm font-semibold rounded-lg hover:bg-orange/90 flex items-center gap-2 disabled:opacity-50"
        >
          {runBatchLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          Run Payout Batch
        </button>
      </div>
      {batchSuccess && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle size={14} />
          {batchSuccess}
        </div>
      )}
      {batchError && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <AlertTriangle size={14} />
          {batchError}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Partner ID</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Amount</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Deductions</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Net Amount</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Status</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Period</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-sm text-text-4">No payouts found</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-3">
                  <span className="text-xs font-mono font-medium text-text-1">{p.partner_id.slice(0, 8)}...</span>
                </td>
                <td className="p-3 text-right text-sm text-text-1">
                  ${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-right text-sm text-red">
                  -${p.deduction_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-right text-sm font-semibold text-text-1">
                  ${p.net_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-center">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadges[p.status] || "bg-gray-100 text-text-4"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span className="text-xs font-mono text-text-3">{p.period}</span>
                </td>
                <td className="p-3">
                  <span className="text-xs text-text-4">{new Date(p.created_at).toLocaleDateString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
