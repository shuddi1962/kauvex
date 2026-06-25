"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Search, DollarSign, Check, Clock, XCircle, AlertTriangle,
  Ban, Play, Download, Loader2,
} from "lucide-react";

interface PayoutRecord {
  id: string;
  partner: string;
  partnerId: string;
  periodStart: string;
  periodEnd: string;
  commissionAmount: number;
  bountyAmount: number;
  reversalAmount: number;
  taxWithheld: number;
  netAmount: number;
  payoutMethod: string;
  gatewayRef: string;
  status: string;
  failureReason?: string;
  date: string;
}

const pendingPayouts: PayoutRecord[] = [
  { id: "pp1", partner: "Chinwe Obi", partnerId: "p5", periodStart: "2026-05-01", periodEnd: "2026-05-31", commissionAmount: 125000, bountyAmount: 15000, reversalAmount: 0, taxWithheld: 7000, netAmount: 133000, payoutMethod: "Mobile Money", gatewayRef: "", status: "pending", date: "2026-06-10" },
  { id: "pp2", partner: "Bola Tinubu Ventures", partnerId: "p3", periodStart: "2026-05-01", periodEnd: "2026-05-31", commissionAmount: 420000, bountyAmount: 0, reversalAmount: 5000, taxWithheld: 20750, netAmount: 394250, payoutMethod: "Bank Transfer", gatewayRef: "", status: "pending", date: "2026-06-12" },
  { id: "pp3", partner: "Zainab Yusuf", partnerId: "p4", periodStart: "2026-05-01", periodEnd: "2026-05-31", commissionAmount: 280000, bountyAmount: 25000, reversalAmount: 0, taxWithheld: 15250, netAmount: 289750, payoutMethod: "Bank Transfer", gatewayRef: "", status: "processing", date: "2026-06-09" },
  { id: "pp4", partner: "Ngozi Eze", partnerId: "p1", periodStart: "2026-05-01", periodEnd: "2026-05-31", commissionAmount: 680000, bountyAmount: 50000, reversalAmount: 0, taxWithheld: 36500, netAmount: 693500, payoutMethod: "Bank Transfer", gatewayRef: "", status: "pending", date: "2026-06-15" },
];

const payoutHistory: PayoutRecord[] = [
  { id: "h1", partner: "Ngozi Eze", partnerId: "p1", periodStart: "2026-04-01", periodEnd: "2026-04-30", commissionAmount: 350000, bountyAmount: 0, reversalAmount: 0, taxWithheld: 17500, netAmount: 332500, payoutMethod: "Bank Transfer", gatewayRef: "GTB-PAY-001", status: "completed", date: "2026-06-01" },
  { id: "h2", partner: "Amara Nwachukwu", partnerId: "p2", periodStart: "2026-04-01", periodEnd: "2026-04-30", commissionAmount: 180000, bountyAmount: 10000, reversalAmount: 2000, taxWithheld: 9400, netAmount: 178600, payoutMethod: "Bank Transfer", gatewayRef: "ACC-PAY-002", status: "completed", date: "2026-06-02" },
  { id: "h3", partner: "Tunde Bakare", partnerId: "p6", periodStart: "2026-04-01", periodEnd: "2026-04-30", commissionAmount: 75000, bountyAmount: 0, reversalAmount: 0, taxWithheld: 3750, netAmount: 71250, payoutMethod: "Bank Transfer", gatewayRef: "UBA-PAY-003", status: "completed", date: "2026-05-30" },
  { id: "h4", partner: "Chidi Okeke", partnerId: "p7", periodStart: "2026-04-01", periodEnd: "2026-04-30", commissionAmount: 45000, bountyAmount: 5000, reversalAmount: 0, taxWithheld: 2500, netAmount: 47500, payoutMethod: "Mobile Money", gatewayRef: "MTN-PAY-004", status: "completed", date: "2026-05-28" },
  { id: "h5", partner: "Kelechi Ibe", partnerId: "p9", periodStart: "2026-04-01", periodEnd: "2026-04-30", commissionAmount: 55000, bountyAmount: 0, reversalAmount: 0, taxWithheld: 2750, netAmount: 52250, payoutMethod: "Mobile Money", gatewayRef: "MTN-PAY-005", status: "completed", date: "2026-06-05" },
];

const failedPayouts: PayoutRecord[] = [
  { id: "f1", partner: "Femi Adeleke", partnerId: "p10", periodStart: "2026-05-01", periodEnd: "2026-05-31", commissionAmount: 25000, bountyAmount: 0, reversalAmount: 0, taxWithheld: 1250, netAmount: 23750, payoutMethod: "Bank Transfer", gatewayRef: "", status: "failed", failureReason: "Invalid bank account number", date: "2026-06-07" },
  { id: "f2", partner: "Emeka Okafor", partnerId: "p11", periodStart: "2026-05-01", periodEnd: "2026-05-31", commissionAmount: 18000, bountyAmount: 0, reversalAmount: 3000, taxWithheld: 750, netAmount: 14250, payoutMethod: "Mobile Money", gatewayRef: "", status: "failed", failureReason: "MTN MoMo number not registered", date: "2026-06-08" },
];

export default function AdminAffiliatesPayoutsPage() {
  const [search, setSearch] = useState("");
  const [running, setRunning] = useState(false);

  const totalPendingNet = pendingPayouts.reduce((s, p) => s + p.netAmount, 0);
  const totalFailed = failedPayouts.length;

  const filteredHistory = payoutHistory.filter((p) => {
    if (search && !p.partner.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleRunPayout = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 2000);
  };

  return (
    <AdminShell title="Payouts" subtitle="Manage affiliate partner payouts">
      <div className="space-y-6">
        {/* Upcoming Payout Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-[#0A1628] flex items-center gap-2"><Clock size={15} className="text-amber-600" /> Upcoming Payout Run</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">{pendingPayouts.length} payouts · ₦{totalPendingNet.toLocaleString()} total</p>
            </div>
            <button onClick={handleRunPayout} disabled={running} className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50">
              {running ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
              {running ? "Processing..." : "Run Payout"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Partner", "Period", "Commission", "Bounty", "Reversal", "Tax", "Net Amount", "Method", "Status"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingPayouts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-3 py-2.5 font-medium text-xs text-[#0A1628]">{p.partner}</td>
                    <td className="px-3 py-2.5 text-[10px] text-gray-500">{p.periodStart} – {p.periodEnd}</td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-green-600">₦{p.commissionAmount.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-xs text-orange">{p.bountyAmount > 0 ? `₦${p.bountyAmount.toLocaleString()}` : "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-red">{p.reversalAmount > 0 ? `₦${p.reversalAmount.toLocaleString()}` : "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">₦{p.taxWithheld.toLocaleString()}</td>
                    <td className="px-3 py-2.5 font-bold text-sm text-[#0A1628]">₦{p.netAmount.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-[10px] text-gray-500">{p.payoutMethod}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.status === "pending" ? "bg-blue-50 text-blue" : "bg-orange-50 text-orange"}`}>
                        {p.status === "pending" ? <span className="flex items-center gap-1"><Clock size={10} /> Pending</span> : <span className="flex items-center gap-1"><Loader2 size={10} /> Processing</span>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payout History & Failed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* History */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-[#0A1628] flex items-center gap-2"><Check size={15} className="text-green-600" /> Payout History</h3>
              <div className="relative max-w-xs">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-7 pr-2.5 py-1.5 border border-gray-300 rounded-lg text-xs" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Partner", "Net Amount", "Method", "Reference", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left px-3 py-2 font-medium text-gray-500 text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 font-medium text-xs text-[#0A1628]">{p.partner}</td>
                      <td className="px-3 py-2.5 font-semibold text-sm text-[#0A1628]">₦{p.netAmount.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-[10px] text-gray-500">{p.payoutMethod}</td>
                      <td className="px-3 py-2.5 text-[10px] font-mono text-gray-400">{p.gatewayRef}</td>
                      <td className="px-3 py-2.5"><span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-600"><Check size={10} className="inline mr-0.5" /> Completed</span></td>
                      <td className="px-3 py-2.5 text-[10px] text-gray-500">{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Failed Payouts */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-[#0A1628] mb-3 flex items-center gap-2"><AlertTriangle size={15} className="text-red" /> Failed Payouts ({totalFailed})</h3>
            <div className="space-y-2">
              {failedPayouts.map((p) => (
                <div key={p.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-[#0A1628]">{p.partner}</p>
                    <span className="text-xs font-bold text-red">₦{p.netAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-red mb-1">{p.failureReason}</p>
                  <button className="text-[10px] font-medium text-blue hover:underline">Retry Payout</button>
                </div>
              ))}
              {failedPayouts.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No failed payouts</p>}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Total this batch</span>
                <span className="font-bold text-[#0A1628]">₦{totalPendingNet.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-500">Failed amount</span>
                <span className="font-bold text-red">₦{failedPayouts.reduce((s, p) => s + p.netAmount, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
