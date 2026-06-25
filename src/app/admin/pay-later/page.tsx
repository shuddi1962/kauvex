"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  CreditCard, Search, Eye, TrendingUp, DollarSign,
  AlertTriangle, Users, X, Check, Clock, Ban, BarChart3,
  Settings, Loader2, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BnplMetrics {
  totalActive: number;
  totalOutstanding: number;
  overdueCount: number;
  overdueAmount: number;
  completedThisMonth: number;
  lateFeesCollected: number;
  averageRepaymentRate: number;
}

interface Agreement {
  id: string;
  customerId: string;
  orderId: string;
  totalAmount: number;
  installmentCount: number;
  installmentAmount: number;
  status: string;
  totalPaid: number;
  totalOutstanding: number;
  missedPaymentCount: number;
  lateFeesAccrued: number;
  createdAt: string;
}

interface BnplConfig {
  minOrderValue: number;
  installmentCount: number;
  installmentIntervalDays: number;
  firstPaymentPercent: number;
  lateFeeAmount: number;
  lateFeeGraceDays: number;
  newCustomerLimit: number;
  creditCheckThreshold: number;
}

const tabs = ["Overview", "Agreements", "Configuration", "Risk Monitor"];

export default function PayLaterAdminPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [metrics, setMetrics] = useState<BnplMetrics | null>(null);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [config, setConfig] = useState<BnplConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsRes, agreementsRes, configRes] = await Promise.all([
        fetch("/api/v1/admin/affiliates/analytics").catch(() => null),
        fetch("/api/v1/pay/bnpl/agreements").catch(() => null),
        fetch("/api/v1/pay/bnpl/config").catch(() => null),
      ]);

      if (agreementsRes?.ok) {
        const json = await agreementsRes.json();
        setAgreements(json.data?.agreements || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const filteredAgreements = agreements.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search && !a.orderId.toLowerCase().includes(search.toLowerCase()) && !a.customerId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalOutstanding = agreements.reduce((s, a) => s + a.totalOutstanding, 0);
  const overdueAgreements = agreements.filter((a) => a.status === "overdue" || a.status === "defaulted");
  const activeAgreements = agreements.filter((a) => a.status === "active");
  const completedAgreements = agreements.filter((a) => a.status === "completed");

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-blue-50 text-blue",
      completed: "bg-green-50 text-green-600",
      overdue: "bg-yellow-50 text-yellow-700",
      defaulted: "bg-red-50 text-red",
      cancelled: "bg-gray-100 text-gray-500",
    };
    return colors[status] || "bg-gray-100 text-gray-500";
  };

  if (loading) {
    return (
      <AdminShell title="Pay Later (BNPL)" subtitle="Buy Now Pay Later management">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-kauvex-orange" size={32} />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Pay Later (BNPL)" subtitle="Buy Now Pay Later management">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 w-fit border border-gray-200">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-kauvex-orange text-white" : "text-text-3 hover:bg-gray-50"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "Overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Active Agreements", value: activeAgreements.length, icon: CreditCard, color: "text-blue" },
              { label: "Total Outstanding", value: `₦${(totalOutstanding / 1e6).toFixed(1)}M`, icon: DollarSign, color: "text-kauvex-orange" },
              { label: "Overdue", value: overdueAgreements.length, icon: AlertTriangle, color: "text-red" },
              { label: "Completed", value: completedAgreements.length, icon: Check, color: "text-green-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon size={16} className={s.color} />
                  <span className="text-xs text-text-4">{s.label}</span>
                </div>
                <p className="text-xl font-bold text-text-1">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-kauvex-orange" /> Portfolio Health
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Active", value: activeAgreements.length, pct: agreements.length > 0 ? Math.round((activeAgreements.length / agreements.length) * 100) : 0, color: "bg-blue" },
                  { label: "Overdue", value: overdueAgreements.length, pct: agreements.length > 0 ? Math.round((overdueAgreements.length / agreements.length) * 100) : 0, color: "bg-red" },
                  { label: "Completed", value: completedAgreements.length, pct: agreements.length > 0 ? Math.round((completedAgreements.length / agreements.length) * 100) : 0, color: "bg-green-500" },
                ].map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-3">{b.label}</span>
                      <span className="font-semibold">{b.value} ({b.pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red" /> Overdue by Age
              </h3>
              <div className="space-y-2">
                {[
                  { label: "1-7 days", count: overdueAgreements.filter((a) => a.missedPaymentCount <= 1).length },
                  { label: "8-14 days", count: overdueAgreements.filter((a) => a.missedPaymentCount === 2).length },
                  { label: "15-30 days", count: overdueAgreements.filter((a) => a.missedPaymentCount >= 3 && a.missedPaymentCount <= 4).length },
                  { label: "30+ days", count: overdueAgreements.filter((a) => a.missedPaymentCount > 4).length },
                ].map((b) => (
                  <div key={b.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-text-3">{b.label}</span>
                    <span className="text-xs font-semibold">{b.count} agreements</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agreements Tab */}
      {activeTab === "Agreements" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agreements..." className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-kauvex-orange" />
            </div>
            {["all", "active", "completed", "overdue", "defaulted"].map((f) => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-3 py-2 text-xs rounded-lg border capitalize ${statusFilter === f ? "bg-kauvex-orange text-white border-kauvex-orange" : "bg-white border-gray-200 text-text-3"}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Agreement ID", "Customer", "Total", "Paid", "Outstanding", "Status", "Installments", ""].map((h) => (
                      <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAgreements.length === 0 ? (
                    <tr><td colSpan={8} className="p-8 text-center text-text-4 text-sm">No agreements found.</td></tr>
                  ) : filteredAgreements.map((a) => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs font-semibold text-kauvex-orange">{a.id.slice(0, 8)}</td>
                      <td className="p-3 text-xs">{a.customerId.slice(0, 8)}...</td>
                      <td className="p-3 font-semibold">₦{a.totalAmount.toLocaleString()}</td>
                      <td className="p-3 font-semibold text-green-600">₦{a.totalPaid.toLocaleString()}</td>
                      <td className="p-3 font-semibold text-kauvex-orange">₦{a.totalOutstanding.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(a.status)}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs">{a.installmentCount}</td>
                      <td className="p-3">
                        <button className="text-xs text-kauvex-orange hover:underline flex items-center gap-1">
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === "Configuration" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Settings size={18} className="text-kauvex-orange" /> BNPL Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Minimum Order Value", key: "min_order_value", suffix: "₦" },
              { label: "Installment Count", key: "installment_count", suffix: "" },
              { label: "Installment Interval (days)", key: "installment_interval_days", suffix: "" },
              { label: "First Payment %", key: "first_payment_percent", suffix: "%" },
              { label: "Late Fee Amount", key: "late_fee_amount", suffix: "₦" },
              { label: "Grace Period (days)", key: "late_fee_grace_days", suffix: "" },
              { label: "New Customer Limit", key: "new_customer_limit", suffix: "₦" },
              { label: "Credit Check Threshold", key: "credit_check_threshold", suffix: "₦" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs font-medium text-text-3 mb-1 block">{field.label}</label>
                <div className="flex items-center gap-2">
                  {field.suffix && <span className="text-sm text-text-4">{field.suffix}</span>}
                  <input type="number" defaultValue={0} className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange" />
                </div>
              </div>
            ))}
          </div>
          <Button variant="cta" className="mt-6">Save Configuration</Button>
        </div>
      )}

      {/* Risk Monitor Tab */}
      {activeTab === "Risk Monitor" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red" /> At-Risk Customers
            </h3>
            <div className="space-y-2">
              {agreements.filter((a) => a.missedPaymentCount >= 2).length === 0 ? (
                <p className="text-sm text-text-4 py-4 text-center">No at-risk customers</p>
              ) : (
                agreements.filter((a) => a.missedPaymentCount >= 2).map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{a.customerId.slice(0, 8)}...</p>
                      <p className="text-xs text-text-4">Missed {a.missedPaymentCount} payments</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red">₦{a.totalOutstanding.toLocaleString()}</p>
                      <button className="text-xs text-kauvex-orange hover:underline">Suspend + Contact</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
