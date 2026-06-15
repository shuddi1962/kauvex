"use client";

import { useState } from "react";
import {
  Shield, FileText, TrendingUp, DollarSign, PieChart,
  Plus, X, Save, Search, Eye, AlertCircle, CheckCircle, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/admin-shell";

const insTabs = [
  { id: "policies", label: "Policies" },
  { id: "claims", label: "Claims" },
  { id: "analytics", label: "Analytics" },
];

const seedPolicies = [
  { id: "1", policy_number: "POL-2026-001", type: "shipment", customer: "TechStar Ltd", coverage_amount: 500000, premium: 12500, start_date: "2026-01-01", end_date: "2026-12-31", status: "active", terms: "Coverage for loss/damage during transit. Max claim per shipment." },
  { id: "2", policy_number: "POL-2026-002", type: "product_protection", customer: "Niger Delta Oil", coverage_amount: 2000000, premium: 45000, start_date: "2026-02-01", end_date: "2026-07-31", status: "active", terms: "Covers manufacturing defects and breakage within 6 months." },
  { id: "3", policy_number: "POL-2026-003", type: "extended_warranty", customer: "Apex Holdings", coverage_amount: 3500000, premium: 82000, start_date: "2026-03-01", end_date: "2028-02-28", status: "active", terms: "Extended warranty: 2-year coverage beyond manufacturer warranty." },
  { id: "4", policy_number: "POL-2026-004", type: "liability", customer: "Port Security Ltd", coverage_amount: 10000000, premium: 210000, start_date: "2026-01-15", end_date: "2026-07-14", status: "active", terms: "General liability: third-party property damage and bodily injury." },
  { id: "5", policy_number: "POL-2026-005", type: "shipment", customer: "Swift Logistics", coverage_amount: 750000, premium: 18750, start_date: "2026-03-15", end_date: "2026-09-14", status: "expired", terms: "Coverage for loss/damage during transit. Max claim per shipment." },
  { id: "6", policy_number: "POL-2026-006", type: "product_protection", customer: "Glamour Beauty", coverage_amount: 1200000, premium: 28000, start_date: "2026-04-01", end_date: "2026-09-30", status: "active", terms: "Covers manufacturing defects and breakage within 6 months." },
  { id: "7", policy_number: "POL-2026-007", type: "extended_warranty", customer: "AutoParts NG", coverage_amount: 4800000, premium: 115000, start_date: "2026-02-15", end_date: "2028-02-14", status: "active", terms: "Extended warranty: 2-year coverage beyond manufacturer warranty." },
  { id: "8", policy_number: "POL-2026-008", type: "shipment", customer: "FarmFresh Ltd", coverage_amount: 300000, premium: 8000, start_date: "2026-04-10", end_date: "2026-10-09", status: "pending", terms: "Coverage for loss/damage during transit. Max claim per shipment." },
  { id: "9", policy_number: "POL-2026-009", type: "liability", customer: "BuildMaster Inc", coverage_amount: 15000000, premium: 320000, start_date: "2026-05-01", end_date: "2027-04-30", status: "active", terms: "General liability: third-party property damage and bodily injury." },
  { id: "10", policy_number: "POL-2026-010", type: "product_protection", customer: "ElectroWorld", coverage_amount: 900000, premium: 21000, start_date: "2026-04-15", end_date: "2026-10-14", status: "active", terms: "Covers manufacturing defects and breakage within 6 months." },
];

const seedClaims = [
  { id: "1", claim_number: "CLM-2026-001", policy_number: "POL-2026-001", customer: "TechStar Ltd", claim_amount: 120000, approved_amount: 108000, status: "paid", filed_date: "2026-03-10", resolved_date: "2026-03-25", description: "Shipment damaged in transit — water exposure" },
  { id: "2", claim_number: "CLM-2026-002", policy_number: "POL-2026-002", customer: "Niger Delta Oil", claim_amount: 450000, approved_amount: 0, status: "rejected", filed_date: "2026-03-20", resolved_date: "2026-04-02", description: "Alleged defect — determined to be customer misuse" },
  { id: "3", claim_number: "CLM-2026-003", policy_number: "POL-2026-003", customer: "Apex Holdings", claim_amount: 850000, approved_amount: 765000, status: "approved", filed_date: "2026-04-01", resolved_date: null, description: "Product failure within warranty period" },
  { id: "4", claim_number: "CLM-2026-004", policy_number: "POL-2026-004", customer: "Port Security Ltd", claim_amount: 2000000, approved_amount: 0, status: "under_review", filed_date: "2026-04-08", resolved_date: null, description: "Third-party property damage claim — investigation ongoing" },
  { id: "5", claim_number: "CLM-2026-005", policy_number: "POL-2026-006", customer: "Glamour Beauty", claim_amount: 85000, approved_amount: 85000, status: "paid", filed_date: "2026-04-12", resolved_date: "2026-04-18", description: "Broken product upon delivery — immediate payout" },
  { id: "6", claim_number: "CLM-2026-006", policy_number: "POL-2026-007", customer: "AutoParts NG", claim_amount: 320000, approved_amount: 0, status: "submitted", filed_date: "2026-04-20", resolved_date: null, description: "Warranty claim for engine component failure" },
  { id: "7", claim_number: "CLM-2026-007", policy_number: "POL-2026-009", customer: "BuildMaster Inc", claim_amount: 1500000, approved_amount: 1350000, status: "approved", filed_date: "2026-05-05", resolved_date: null, description: "Liability claim for onsite accident" },
  { id: "8", claim_number: "CLM-2026-008", policy_number: "POL-2026-010", customer: "ElectroWorld", claim_amount: 65000, approved_amount: 0, status: "under_review", filed_date: "2026-05-10", resolved_date: null, description: "Defective electronics — awaiting assessment report" },
];

const typeLabels: Record<string, string> = {
  shipment: "Shipment",
  product_protection: "Product Protection",
  extended_warranty: "Extended Warranty",
  liability: "Liability",
};

const typeColors: Record<string, string> = {
  shipment: "bg-purple-50 text-purple-700",
  product_protection: "bg-blue-50 text-blue",
  extended_warranty: "bg-green-50 text-green-700",
  liability: "bg-orange-50 text-orange-700",
};

const claimStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    paid: "bg-green-50 text-green-700",
    approved: "bg-blue-50 text-blue",
    under_review: "bg-yellow-50 text-yellow-700",
    rejected: "bg-red-50 text-red",
    submitted: "bg-gray-50 text-gray-600",
  };
  return styles[status] || "bg-gray-50 text-gray-500";
};

export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState("policies");
  const [policies] = useState(seedPolicies);
  const [claims] = useState(seedClaims);
  const [search, setSearch] = useState("");
  const [showPolicyModal, setShowPolicyModal] = useState<any>(null);

  const activePolicies = policies.filter((p) => p.status === "active").length;
  const totalPremium = policies.reduce((s, p) => s + p.premium, 0);
  const claimsFiled = claims.length;
  const claimsPaid = claims.filter((c) => c.status === "paid").length;
  const totalApproved = claims.filter((c) => c.status === "paid" || c.status === "approved").reduce((s, c) => s + c.approved_amount, 0);
  const totalClaimed = claims.reduce((s, c) => s + c.claim_amount, 0);
  const payoutRatio = totalClaimed > 0 ? ((totalApproved / totalClaimed) * 100).toFixed(1) : "0";

  const kpis = [
    { label: "Active Policies", value: activePolicies, icon: Shield, color: "text-blue" },
    { label: "Total Premium", value: `₦${(totalPremium / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-green-600" },
    { label: "Claims Filed", value: claimsFiled, icon: FileText, color: "text-orange-500" },
    { label: "Claims Paid", value: claimsPaid, icon: CheckCircle, color: "text-green-600" },
    { label: "Payout Ratio", value: `${payoutRatio}%`, icon: PieChart, color: "text-purple-600" },
  ];

  const filteredPolicies = policies.filter((p) =>
    !search || p.policy_number.toLowerCase().includes(search.toLowerCase()) || p.customer.toLowerCase().includes(search.toLowerCase())
  );

  const filteredClaims = claims.filter((c) =>
    !search || c.claim_number.toLowerCase().includes(search.toLowerCase()) || c.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Marketplace Insurance" subtitle="Policies, claims management, and payout analytics">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl text-text-1">Insurance</h1>
          <div className="flex gap-2">
            <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 px-3 rounded-lg border border-border text-sm w-[200px] focus:outline-none focus:border-blue" />
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {insTabs.map((tab) => (
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

        {activeTab === "policies" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1 flex items-center gap-2"><Shield size={18} /> Insurance Policies</h3>
              <span className="text-xs text-text-4">{filteredPolicies.length} policies</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Policy #</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Type</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Customer</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Coverage</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Premium</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Period</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPolicies.map((p) => (
                    <tr key={p.id} className="hover:bg-off-white transition-colors">
                      <td className="px-5 py-3 font-mono text-xs font-medium text-text-1">{p.policy_number}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeColors[p.type]}`}>{typeLabels[p.type]}</span>
                      </td>
                      <td className="px-5 py-3 font-medium text-text-1">{p.customer}</td>
                      <td className="px-5 py-3 text-right font-semibold text-text-1">₦{(p.coverage_amount / 1000).toFixed(0)}K</td>
                      <td className="px-5 py-3 text-right text-text-3">₦{(p.premium / 1000).toFixed(0)}K</td>
                      <td className="px-5 py-3 text-xs text-text-4">{p.start_date} — {p.end_date}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.status === "active" ? "bg-green-50 text-green-700" : p.status === "expired" ? "bg-gray-50 text-gray-500" : "bg-yellow-50 text-yellow-700"}`}>{p.status}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button onClick={() => setShowPolicyModal(p)} className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Eye size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "claims" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1 flex items-center gap-2"><FileText size={18} /> Claims</h3>
              <span className="text-xs text-text-4">{filteredClaims.length} claims</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Claim #</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Policy</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Customer</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Claim Amount</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Approved</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Filed</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Resolved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredClaims.map((c) => (
                    <tr key={c.id} className="hover:bg-off-white transition-colors">
                      <td className="px-5 py-3 font-mono text-xs font-medium text-text-1">{c.claim_number}</td>
                      <td className="px-5 py-3 font-mono text-xs text-text-3">{c.policy_number}</td>
                      <td className="px-5 py-3 font-medium text-text-1">{c.customer}</td>
                      <td className="px-5 py-3 text-right font-semibold text-text-1">₦{(c.claim_amount / 1000).toFixed(0)}K</td>
                      <td className="px-5 py-3 text-right font-semibold text-text-1">{c.approved_amount > 0 ? `₦${(c.approved_amount / 1000).toFixed(0)}K` : "-"}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${claimStatusBadge(c.status)}`}>{c.status.replace("_", " ")}</span>
                      </td>
                      <td className="px-5 py-3 text-text-4 text-xs">{c.filed_date}</td>
                      <td className="px-5 py-3 text-text-4 text-xs">{c.resolved_date || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2"><TrendingUp size={18} /> Claims by Type</h3>
              <div className="space-y-3">
                {[
                  { type: "Shipment", total: 2, paid: 1, pct: 50 },
                  { type: "Product Protection", total: 3, paid: 1, pct: 33 },
                  { type: "Extended Warranty", total: 2, paid: 0, pct: 0 },
                  { type: "Liability", total: 1, paid: 0, pct: 0 },
                ].map((t) => (
                  <div key={t.type} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <div className="w-2 h-2 rounded-full bg-blue" />
                    <span className="text-sm text-text-2 flex-1">{t.type}</span>
                    <span className="text-xs text-text-4">{t.paid}/{t.total} paid</span>
                    <span className={`text-xs font-semibold ${t.pct > 0 ? "text-green-600" : "text-text-4"}`}>{t.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2"><AlertCircle size={18} /> Pending Actions</h3>
              <div className="space-y-3">
                {claims.filter((c) => c.status === "submitted" || c.status === "under_review").map((c) => (
                  <div key={c.id} className="p-3 rounded-lg border border-border flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-1">{c.claim_number}</p>
                      <p className="text-xs text-text-4">{c.customer} · {c.status.replace("_", " ")}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${claimStatusBadge(c.status)}`}>{c.status.replace("_", " ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPolicyModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[500px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-syne font-bold text-lg">{showPolicyModal.policy_number}</h2>
              <button onClick={() => setShowPolicyModal(null)} className="p-2 rounded-lg hover:bg-off-white text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Type</p><span className={`text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${typeColors[showPolicyModal.type]}`}>{typeLabels[showPolicyModal.type]}</span></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Status</p><span className={`text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${showPolicyModal.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>{showPolicyModal.status}</span></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Customer</p><p className="text-sm font-medium mt-0.5">{showPolicyModal.customer}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Coverage Amount</p><p className="text-sm font-bold mt-0.5">₦{showPolicyModal.coverage_amount.toLocaleString()}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Premium</p><p className="text-sm mt-0.5">₦{showPolicyModal.premium.toLocaleString()}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Period</p><p className="text-sm mt-0.5">{showPolicyModal.start_date} — {showPolicyModal.end_date}</p></div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-[10px] text-text-4 uppercase font-semibold mb-2">Terms & Conditions</p>
                <p className="text-sm text-text-2">{showPolicyModal.terms}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
