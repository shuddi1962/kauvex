"use client";

import { useState } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, Percent,
  BarChart3, Download, CreditCard, Wallet, PiggyBank,
  Calendar,
} from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";
import { MetricCard, SimpleBarChart, PeriodSelector } from "@/components/vendor/analytics";

const revenueBreakdown = [
  { label: "Gross Revenue", value: 2450000, color: "#0A1628" },
  { label: "Commission Fees", value: -171500, color: "#EF4444" },
  { label: "FBK Fees", value: -73500, color: "#F59E0B" },
  { label: "Advertising Spend", value: -120000, color: "#7C3AED" },
  { label: "Other Fees", value: -24500, color: "#6B7280" },
];

const paymentSchedule = [
  { period: "Jun 1 - Jun 15", status: "Paid", amount: 890000, date: "Jun 20" },
  { period: "Jun 16 - Jun 30", status: "Processing", amount: 1120000, date: "Jul 5" },
  { period: "Jul 1 - Jul 15", status: "Pending", amount: 0, date: "Jul 20" },
];

const formatNgn = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `₦${(v / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `₦${(v / 1_000).toFixed(1)}K`;
  return `₦${v}`;
};

export default function AnalyticsFinancial() {
  const [period, setPeriod] = useState("30d");
  const [toast, setToast] = useState<string | null>(null);

  const netRevenue = revenueBreakdown.reduce((s, r) => s + r.value, 0);
  const grossRevenue = revenueBreakdown[0].value;
  const totalFees = revenueBreakdown.slice(1).reduce((s, r) => s + Math.abs(r.value), 0);
  const taxEstimate = netRevenue * 0.075;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const barData = revenueBreakdown.map((r) => ({
    label: r.label,
    value: Math.abs(r.value),
    color: r.color,
  }));

  return (
    <VendorShell title="Financial Analytics" subtitle="Revenue, fees, and profitability">
      <div className="space-y-6">
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg">
            {toast}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-text-4">Period: {period === "7d" ? "Last 7 days" : period === "30d" ? "Last 30 days" : period === "90d" ? "Last 90 days" : "Last 12 months"}</p>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard value={formatNgn(grossRevenue)} label="Gross Revenue" change="+15.3%" up icon={DollarSign} color="bg-emerald-100 text-emerald-700" />
          <MetricCard value={formatNgn(netRevenue)} label="Net Revenue" change="+12.1%" up icon={Wallet} color="bg-blue-100 text-blue" />
          <MetricCard value={formatNgn(totalFees)} label="Total Fees" change="+8.5%" up={false} icon={BarChart3} color="bg-red-100 text-red-500" sublabel={`${((totalFees / grossRevenue) * 100).toFixed(1)}% of revenue`} />
          <MetricCard value={formatNgn(taxEstimate)} label="Tax Estimate (7.5%)" change="" icon={PiggyBank} color="bg-amber-100 text-amber-700" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue vs Fees */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm text-text-1 flex items-center gap-2 mb-4">
              <BarChart3 size={15} className="text-orange" /> Revenue & Fee Breakdown
            </h3>
            <SimpleBarChart
              data={barData}
              height={250}
              horizontal
              formatValue={(v) => formatNgn(v)}
            />
          </div>

          {/* Fee Details */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="font-bold text-sm text-text-1 flex items-center gap-2 mb-4">
              <Percent size={15} className="text-orange" /> Fee Breakdown
            </h3>
            <div className="space-y-4">
              {revenueBreakdown.slice(1).map((fee) => {
                const pct = ((Math.abs(fee.value) / grossRevenue) * 100).toFixed(1);
                const isNegative = fee.value < 0;
                return (
                  <div key={fee.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-text-2 font-medium">{fee.label}</span>
                      <span className={`font-semibold ${isNegative ? "text-red-500" : "text-green-600"}`}>
                        {isNegative ? "-" : "+"}{formatNgn(Math.abs(fee.value))}
                        <span className="text-[9px] text-text-4 ml-1">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isNegative ? "bg-red-400" : "bg-green-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-r from-navy to-navy/90 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/60 font-medium">Net Profit (est.)</p>
              <p className="text-3xl font-bold mt-1">{formatNgn(netRevenue)}</p>
              <p className="text-xs text-white/70 mt-1">
                After all fees · {((netRevenue / grossRevenue) * 100).toFixed(1)}% margin
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <TrendingUp size={24} className="text-green-400" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-[9px] text-white/50">Commission</p>
              <p className="text-sm font-bold">{formatNgn(171500)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-[9px] text-white/50">FBK Fees</p>
              <p className="text-sm font-bold">{formatNgn(73500)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-[9px] text-white/50">Ads Spend</p>
              <p className="text-sm font-bold">{formatNgn(120000)}</p>
            </div>
          </div>
        </div>

        {/* Payment Schedule */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-text-1 flex items-center gap-2">
              <Calendar size={15} className="text-orange" /> Payment Schedule
            </h3>
            <button
              onClick={() => showToast("Export initiated — check your downloads")}
              className="flex items-center gap-1 text-[10px] font-semibold text-orange hover:text-orange/80 px-3 py-1.5 border border-orange/30 rounded-lg hover:bg-orange-50"
            >
              <Download size={10} /> Export CSV
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2 font-semibold text-text-4 text-[10px]">Period</th>
                <th className="text-right px-3 py-2 font-semibold text-text-4 text-[10px]">Amount</th>
                <th className="text-right px-3 py-2 font-semibold text-text-4 text-[10px]">Expected Date</th>
                <th className="text-right px-3 py-2 font-semibold text-text-4 text-[10px]">Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentSchedule.map((p) => (
                <tr key={p.period} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5 font-semibold text-text-1">{p.period}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-green-700">
                    {p.amount > 0 ? formatNgn(p.amount) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right text-text-3">{p.date}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      p.status === "Paid" ? "bg-green-100 text-green-700" :
                      p.status === "Processing" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-text-4"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </VendorShell>
  );
}
