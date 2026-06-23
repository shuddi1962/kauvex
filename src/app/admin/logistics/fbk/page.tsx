"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Loader2, DollarSign, AlertTriangle, Building2, Package,
  TrendingUp, ShieldOff, Store, Warehouse,
} from "lucide-react";

interface FbkDebt {
  id?: string;
  vendor_id: string;
  debt_type: string;
  amount: number;
  interest_amount: number;
  status: string;
  period: string;
  created_at?: string;
}

const debtStatusBadges: Record<string, string> = {
  outstanding: "bg-red-50 text-red-600",
  partial: "bg-orange-50 text-orange-600",
  cleared: "bg-green-50 text-green-700",
  written_off: "bg-gray-100 text-text-4",
};

export default function LogisticsFbkPage() {
  const [debts, setDebts] = useState<FbkDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const [fbkEnrolledCount, setFbkEnrolledCount] = useState(0);
  const [totalUnits, setTotalUnits] = useState(0);
  const [slowMovingAlerts, setSlowMovingAlerts] = useState(0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [debtsRes, enrollRes, inventoryRes] = await Promise.all([
        insforge.database.from("kv_ship_fbk_debt").select("*").order("created_at", { ascending: false }),
        insforge.database.from("fbk_enrollments").select("*", { count: "exact", head: true }),
        insforge.database.from("warehouse_inventory").select("*"),
      ]);

      if (debtsRes.data) setDebts(debtsRes.data);
      if (enrollRes.count) setFbkEnrolledCount(enrollRes.count);
      if (inventoryRes.data) {
        setTotalUnits(inventoryRes.data.length);
        setSlowMovingAlerts(inventoryRes.data.filter((i: Record<string, unknown>) => {
          const daysInStorage = i.days_in_storage as number || 0;
          return daysInStorage > 90;
        }).length);
      }
    } catch (e) {
      console.error("Failed to load FBK oversight data:", e);
    } finally {
      setLoading(false);
    }
  };

  const totalOutstanding = debts
    .filter(d => d.status === "outstanding" || d.status === "partial")
    .reduce((s, d) => s + d.amount, 0);

  const vendorsWithDebt = new Set(
    debts.filter(d => d.status === "outstanding" || d.status === "partial").map(d => d.vendor_id)
  ).size;

  const totalCleared = debts
    .filter(d => d.status === "cleared")
    .reduce((s, d) => s + d.amount, 0);

  if (loading) {
    return (
      <AdminShell title="FBK Oversight" subtitle="Fulfillment by KAUVEX oversight dashboard">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="FBK Oversight" subtitle="Fulfillment by KAUVEX oversight dashboard">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "FBK-Enrolled Vendors", value: fbkEnrolledCount, icon: Store, color: "text-blue" },
          { label: "Total Units in Warehouse", value: totalUnits, icon: Warehouse, color: "text-purple-600" },
          { label: "Slow-Moving Alerts (>90d)", value: slowMovingAlerts, icon: AlertTriangle, color: slowMovingAlerts > 0 ? "text-orange" : "text-green-600" },
          { label: "Active Vendors", value: fbkEnrolledCount, icon: Building2, color: "text-green-600" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} className={s.color} />
                <p className="text-xs text-text-4">{s.label}</p>
              </div>
              <p className={`font-bold text-2xl ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Outstanding Debt", value: totalOutstanding, prefix: "$", icon: DollarSign, color: "text-red" },
          { label: "Vendors with Debt", value: vendorsWithDebt, icon: AlertTriangle, color: "text-orange" },
          { label: "Total Cleared", value: totalCleared, prefix: "$", icon: TrendingUp, color: "text-green-600" },
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-text-1">FBK Debt Records</h3>
          <span className="text-xs text-text-4">{debts.length} records</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Vendor ID</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Debt Type</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Amount</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Interest</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Status</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Period</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Created</th>
            </tr>
          </thead>
          <tbody>
            {debts.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-sm text-text-4">No debt records found</td></tr>
            ) : debts.map(d => (
              <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-3">
                  <span className="text-xs font-mono font-medium text-text-1">{d.vendor_id.slice(0, 8)}...</span>
                </td>
                <td className="p-3">
                  <span className="text-sm text-text-2">{d.debt_type}</span>
                </td>
                <td className="p-3 text-right text-sm font-semibold text-text-1">
                  ${d.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-right text-sm text-text-2">
                  ${d.interest_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-center">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${debtStatusBadges[d.status] || "bg-gray-100 text-text-4"}`}>
                    {d.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <span className="text-xs font-mono text-text-3">{d.period}</span>
                </td>
                <td className="p-3">
                  <span className="text-xs text-text-4">{d.created_at ? new Date(d.created_at).toLocaleDateString() : "—"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
