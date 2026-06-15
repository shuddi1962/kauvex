"use client";

import { useState } from "react";
import {
  CreditCard, DollarSign, TrendingUp, Wallet, AlertTriangle,
  Plus, X, Save, Search, CheckCircle, XCircle, Clock, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/admin-shell";

const creditTabs = [
  { id: "applications", label: "Applications" },
  { id: "lines", label: "Credit Lines" },
  { id: "transactions", label: "Transactions" },
];

const seedApplications = [
  { id: "1", company: "TechStar Ltd", requested_limit: 5000000, approved_limit: 3500000, status: "approved", applied_date: "2026-02-15", reviewed_by: "Admin", notes: "Strong financials, approved at 70%" },
  { id: "2", company: "Niger Delta Oil", requested_limit: 15000000, approved_limit: 10000000, status: "approved", applied_date: "2026-02-20", reviewed_by: "Admin", notes: "High volume vendor, 67% approval" },
  { id: "3", company: "Apex Holdings", requested_limit: 8000000, approved_limit: 0, status: "under_review", applied_date: "2026-03-01", reviewed_by: null, notes: "Awaiting financial statements" },
  { id: "4", company: "Glamour Beauty", requested_limit: 2000000, approved_limit: 1500000, status: "approved", applied_date: "2026-03-10", reviewed_by: "Admin", notes: "Good payment history, 75% approved" },
  { id: "5", company: "AutoParts NG", requested_limit: 6000000, approved_limit: 0, status: "pending", applied_date: "2026-03-20", reviewed_by: null, notes: "Recently registered" },
  { id: "6", company: "BuildMaster Inc", requested_limit: 12000000, approved_limit: 0, status: "rejected", applied_date: "2026-03-25", reviewed_by: "Admin", notes: "Insufficient trading history" },
  { id: "7", company: "ElectroWorld", requested_limit: 3000000, approved_limit: 2500000, status: "approved", applied_date: "2026-04-01", reviewed_by: "Admin", notes: "Approved at 83%" },
  { id: "8", company: "Swift Logistics", requested_limit: 4000000, approved_limit: 0, status: "under_review", applied_date: "2026-04-05", reviewed_by: null, notes: "Verifying turnover documents" },
  { id: "9", company: "FarmFresh Ltd", requested_limit: 1500000, approved_limit: 1000000, status: "approved", applied_date: "2026-04-10", reviewed_by: "Admin", notes: "Small vendor, conservative limit" },
];

const seedCreditLines = [
  { id: "1", company: "TechStar Ltd", credit_limit: 3500000, credit_used: 2100000, interest_rate: 18.5, payment_terms: "Net 30", status: "active", start_date: "2026-03-01" },
  { id: "2", company: "Niger Delta Oil", credit_limit: 10000000, credit_used: 8500000, interest_rate: 15.0, payment_terms: "Net 45", status: "active", start_date: "2026-03-01" },
  { id: "3", company: "Glamour Beauty", credit_limit: 1500000, credit_used: 450000, interest_rate: 20.0, payment_terms: "Net 15", status: "active", start_date: "2026-04-01" },
  { id: "4", company: "ElectroWorld", credit_limit: 2500000, credit_used: 2500000, interest_rate: 19.0, payment_terms: "Net 30", status: "at_risk", start_date: "2026-04-01" },
  { id: "5", company: "FarmFresh Ltd", credit_limit: 1000000, credit_used: 200000, interest_rate: 22.0, payment_terms: "Net 15", status: "active", start_date: "2026-04-15" },
  { id: "6", company: "Port Security Ltd", credit_limit: 7500000, credit_used: 3200000, interest_rate: 16.5, payment_terms: "Net 30", status: "active", start_date: "2026-02-01" },
  { id: "7", company: "Swift Logistics", credit_limit: 2000000, credit_used: 1800000, interest_rate: 21.0, payment_terms: "Net 15", status: "at_risk", start_date: "2026-03-15" },
  { id: "8", company: "AutoParts NG", credit_limit: 3000000, credit_used: 0, interest_rate: 18.0, payment_terms: "Net 30", status: "pending", start_date: null },
];

const seedTransactions = [
  { id: "1", company: "Niger Delta Oil", type: "drawdown", amount: 2000000, date: "2026-03-05", description: "Inventory purchase drawdown" },
  { id: "2", company: "TechStar Ltd", type: "drawdown", amount: 1500000, date: "2026-03-10", description: "Bulk order financing" },
  { id: "3", company: "Niger Delta Oil", type: "payment", amount: -1000000, date: "2026-03-28", description: "Partial repayment" },
  { id: "4", company: "TechStar Ltd", type: "drawdown", amount: 600000, date: "2026-04-01", description: "Marketing campaign financing" },
  { id: "5", company: "ElectroWorld", type: "drawdown", amount: 2500000, date: "2026-04-05", description: "Full limit drawdown" },
  { id: "6", company: "Port Security Ltd", type: "drawdown", amount: 3200000, date: "2026-04-08", description: "Equipment purchase" },
  { id: "7", company: "Glamour Beauty", type: "drawdown", amount: 450000, date: "2026-04-12", description: "Seasonal stock financing" },
  { id: "8", company: "Niger Delta Oil", type: "payment", amount: -2000000, date: "2026-04-15", description: "Settlement - March drawdown" },
  { id: "9", company: "Swift Logistics", type: "drawdown", amount: 1800000, date: "2026-04-18", description: "Fleet fuel financing" },
  { id: "10", company: "FarmFresh Ltd", type: "drawdown", amount: 200000, date: "2026-04-22", description: "First drawdown" },
];

const appStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    approved: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red",
    under_review: "bg-yellow-50 text-yellow-700",
    pending: "bg-gray-50 text-gray-600",
  };
  return styles[status] || "bg-gray-50 text-gray-500";
};

export default function CreditPage() {
  const [activeTab, setActiveTab] = useState("applications");
  const [applications] = useState(seedApplications);
  const [creditLines] = useState(seedCreditLines);
  const [transactions] = useState(seedTransactions);
  const [search, setSearch] = useState("");
  const [showAppModal, setShowAppModal] = useState<any>(null);
  const [showLineModal, setShowLineModal] = useState<any>(null);

  const totalExtended = creditLines.reduce((s, l) => s + l.credit_limit, 0);
  const activeLines = creditLines.filter((l) => l.status === "active" || l.status === "at_risk").length;
  const avgLimit = totalExtended / creditLines.length;
  const totalUsed = creditLines.reduce((s, l) => s + l.credit_used, 0);
  const utilizationRate = totalExtended > 0 ? ((totalUsed / totalExtended) * 100).toFixed(1) : "0";
  const atRisk = creditLines.filter((l) => l.status === "at_risk").length;

  const kpis = [
    { label: "Total Credit Extended", value: `₦${(totalExtended / 1000000).toFixed(1)}M`, icon: CreditCard, color: "text-blue" },
    { label: "Active Lines", value: activeLines, icon: Wallet, color: "text-green-600" },
    { label: "Avg Credit Limit", value: `₦${(avgLimit / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-purple-600" },
    { label: "Utilization Rate", value: `${utilizationRate}%`, icon: TrendingUp, color: "text-orange-500" },
    { label: "At Risk", value: atRisk, icon: AlertTriangle, color: "text-red" },
  ];

  const utilizationColor = (used: number, limit: number) => {
    const pct = (used / limit) * 100;
    if (pct >= 90) return "bg-red";
    if (pct >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const filteredApplications = applications.filter((a) =>
    !search || a.company.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLines = creditLines.filter((l) =>
    !search || l.company.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTransactions = transactions.filter((t) =>
    !search || t.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Marketplace Credit" subtitle="Credit applications, active credit lines, and transaction history">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl text-text-1">Credit System</h1>
          <div className="flex gap-2">
            <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 px-3 rounded-lg border border-border text-sm w-[200px] focus:outline-none focus:border-blue" />
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {creditTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-blue text-white" : "bg-white text-text-3 border border-border hover:bg-off-white"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Icon size={18} className={kpi.color} />
                  </div>
                </div>
                <p className="text-xl font-bold text-text-1">{kpi.value}</p>
                <p className="text-xs text-text-4 mt-0.5">{kpi.label}</p>
              </div>
            );
          })}
        </div>

        {activeTab === "applications" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1 flex items-center gap-2"><Wallet size={18} /> Credit Applications</h3>
              <span className="text-xs text-text-4">{filteredApplications.length} applications</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Company</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Requested</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Approved</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Applied</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Reviewed By</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredApplications.map((a) => (
                    <tr key={a.id} className="hover:bg-off-white transition-colors">
                      <td className="px-5 py-3 font-medium text-text-1">{a.company}</td>
                      <td className="px-5 py-3 text-right font-semibold text-text-1">₦{(a.requested_limit / 1000000).toFixed(1)}M</td>
                      <td className="px-5 py-3 text-right font-semibold text-text-1">{a.approved_limit > 0 ? `₦${(a.approved_limit / 1000000).toFixed(1)}M` : "-"}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${appStatusBadge(a.status)}`}>{a.status.replace("_", " ")}</span>
                      </td>
                      <td className="px-5 py-3 text-text-4 text-xs">{a.applied_date}</td>
                      <td className="px-5 py-3 text-text-3">{a.reviewed_by || "-"}</td>
                      <td className="px-5 py-3 text-center">
                        <button onClick={() => setShowAppModal(a)} className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Eye size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "lines" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1 flex items-center gap-2"><CreditCard size={18} /> Active Credit Lines</h3>
              <span className="text-xs text-text-4">{filteredLines.length} lines</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Company</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Limit</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Used</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Available</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Utilization</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Rate</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Terms</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLines.map((l) => {
                    const utilPct = (l.credit_used / l.credit_limit) * 100;
                    return (
                      <tr key={l.id} className="hover:bg-off-white transition-colors cursor-pointer" onClick={() => setShowLineModal(l)}>
                        <td className="px-5 py-3 font-medium text-text-1">{l.company}</td>
                        <td className="px-5 py-3 text-right font-semibold text-text-1">₦{(l.credit_limit / 1000000).toFixed(1)}M</td>
                        <td className="px-5 py-3 text-right font-semibold text-text-1">₦{(l.credit_used / 1000000).toFixed(1)}M</td>
                        <td className="px-5 py-3 text-right font-semibold text-text-1">₦{((l.credit_limit - l.credit_used) / 1000000).toFixed(1)}M</td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-off-white rounded-full overflow-hidden max-w-[100px]">
                              <div className={`h-full rounded-full ${utilizationColor(l.credit_used, l.credit_limit)}`} style={{ width: `${utilPct}%` }} />
                            </div>
                            <span className="text-[10px] font-semibold text-text-4">{utilPct.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center text-text-3">{l.interest_rate}%</td>
                        <td className="px-5 py-3 text-text-4 text-xs">{l.payment_terms}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${l.status === "active" ? "bg-green-50 text-green-700" : l.status === "at_risk" ? "bg-red-50 text-red" : "bg-gray-50 text-gray-500"}`}>{l.status.replace("_", " ")}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1 flex items-center gap-2"><TrendingUp size={18} /> Credit Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Company</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Type</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Amount</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Date</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-off-white transition-colors">
                      <td className="px-5 py-3 font-medium text-text-1">{t.company}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${t.type === "drawdown" ? "bg-blue-50 text-blue" : "bg-green-50 text-green-700"}`}>{t.type}</span>
                      </td>
                      <td className={`px-5 py-3 text-right font-semibold ${t.amount > 0 ? "text-text-1" : "text-green-600"}`}>
                        {t.amount > 0 ? `+₦${(t.amount / 1000000).toFixed(2)}M` : `-₦${(Math.abs(t.amount) / 1000000).toFixed(2)}M`}
                      </td>
                      <td className="px-5 py-3 text-text-4 text-xs">{t.date}</td>
                      <td className="px-5 py-3 text-text-3 text-xs">{t.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showAppModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAppModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[480px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-syne font-bold text-lg">{showAppModal.company}</h2>
              <button onClick={() => setShowAppModal(null)} className="p-2 rounded-lg hover:bg-off-white text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Status</p><span className={`text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${appStatusBadge(showAppModal.status)}`}>{showAppModal.status.replace("_", " ")}</span></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Applied</p><p className="text-sm mt-0.5">{showAppModal.applied_date}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Requested Limit</p><p className="text-sm font-bold mt-0.5">₦{showAppModal.requested_limit.toLocaleString()}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Approved Limit</p><p className="text-sm font-bold mt-0.5">{showAppModal.approved_limit > 0 ? `₦${showAppModal.approved_limit.toLocaleString()}` : "N/A"}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Reviewed By</p><p className="text-sm mt-0.5">{showAppModal.reviewed_by || "Not reviewed"}</p></div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-[10px] text-text-4 uppercase font-semibold mb-1">Review Notes</p>
                <p className="text-sm text-text-2">{showAppModal.notes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLineModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowLineModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[480px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-syne font-bold text-lg">{showLineModal.company}</h2>
              <button onClick={() => setShowLineModal(null)} className="p-2 rounded-lg hover:bg-off-white text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Status</p><span className={`text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${showLineModal.status === "active" ? "bg-green-50 text-green-700" : showLineModal.status === "at_risk" ? "bg-red-50 text-red" : "bg-gray-50 text-gray-500"}`}>{showLineModal.status.replace("_", " ")}</span></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Started</p><p className="text-sm mt-0.5">{showLineModal.start_date || "Not started"}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Credit Limit</p><p className="text-sm font-bold mt-0.5">₦{showLineModal.credit_limit.toLocaleString()}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Credit Used</p><p className="text-sm font-bold mt-0.5">₦{showLineModal.credit_used.toLocaleString()}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Available</p><p className="text-sm font-bold mt-0.5 text-green-600">₦{(showLineModal.credit_limit - showLineModal.credit_used).toLocaleString()}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Interest Rate</p><p className="text-sm mt-0.5">{showLineModal.interest_rate}% APR</p></div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-[10px] text-text-4 uppercase font-semibold mb-2">Utilization</p>
                <div className="h-3 bg-off-white rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${utilizationColor(showLineModal.credit_used, showLineModal.credit_limit)}`} style={{ width: `${((showLineModal.credit_used / showLineModal.credit_limit) * 100)}%` }} />
                </div>
                <p className="text-xs text-text-4 mt-1">{((showLineModal.credit_used / showLineModal.credit_limit) * 100).toFixed(0)}% utilized</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
