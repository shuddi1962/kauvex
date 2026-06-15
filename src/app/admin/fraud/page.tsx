"use client";

import { useState } from "react";
import {
  ShieldAlert, AlertTriangle, Search, X, CheckCircle, XCircle,
  Clock, Shield, UserCheck, Eye, FileText, CreditCard, MessageSquare, ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/admin-shell";

const fraudTabs = [
  { id: "flagged", label: "Flagged Items" },
  { id: "rules", label: "Rules" },
  { id: "analytics", label: "Analytics" },
];

const seedFraudChecks = [
  { id: "1", entity_type: "return", entity_id: "RET-2026-042", risk_score: 92, risk_level: "critical", indicators: ["Frequent Returner", "Item Not Returned", "Value Mismatch"], flagged_by: "AI Engine", action_taken: "Blocked", description: "Customer has returned 8 items in 30 days. Value exceeds threshold." },
  { id: "2", entity_type: "order", entity_id: "ORD-8899", risk_score: 78, risk_level: "high", indicators: ["New Account", "High Value", "Shipping Mismatch"], flagged_by: "AI Engine", action_taken: "Reviewing", description: "New account (created 2hrs ago) placed 450K order with mismatched shipping country." },
  { id: "3", entity_type: "payment", entity_id: "PAY-003", risk_score: 85, risk_level: "high", indicators: ["Card BIN Suspicious", "Multiple Attempts", "Geo Mismatch"], flagged_by: "AI Engine", action_taken: "Flagged", description: "Card from different country than IP. 3 failed attempts before success." },
  { id: "4", entity_type: "account", entity_id: "USR-5521", risk_score: 65, risk_level: "medium", indicators: ["Duplicate Email", "Suspicious Pattern"], flagged_by: "System", action_taken: "Watched", description: "Account shares email domain with 12 other flagged accounts." },
  { id: "5", entity_type: "review", entity_id: "REV-1209", risk_score: 45, risk_level: "low", indicators: ["New Reviewer"], flagged_by: "AI Engine", action_taken: "Approved", description: "First review for new account — content looks legitimate." },
  { id: "6", entity_type: "return", entity_id: "RET-2026-043", risk_score: 95, risk_level: "critical", indicators: ["Frequent Returner", "Item Not Returned", "Wrong Item Claimed", "High Value"], flagged_by: "AI Engine", action_taken: "Blocked", description: "Claimed wrong item received. Same pattern as previous blocked returns." },
  { id: "7", entity_type: "order", entity_id: "ORD-8902", risk_score: 55, risk_level: "medium", indicators: ["Address Anomaly"], flagged_by: "System", action_taken: "Reviewed", description: "PO Box address for high-value electronics. Manual review passed." },
  { id: "8", entity_type: "payment", entity_id: "PAY-007", risk_score: 88, risk_level: "high", indicators: ["Chargeback History", "Card BIN Suspicious"], flagged_by: "AI Engine", action_taken: "Flagged", description: "Card associated with 2 previous chargebacks." },
  { id: "9", entity_type: "account", entity_id: "USR-5589", risk_score: 35, risk_level: "low", indicators: ["Unusual Login"], flagged_by: "System", action_taken: "Approved", description: "Login from new device — 2FA verified successfully." },
  { id: "10", entity_type: "review", entity_id: "REV-1215", risk_score: 72, risk_level: "medium", indicators: ["Copy-Paste Content", "Multiple Reviews"], flagged_by: "AI Engine", action_taken: "Flagged", description: "Identical review text posted for 5 different products." },
  { id: "11", entity_type: "return", entity_id: "RET-2026-044", risk_score: 30, risk_level: "low", indicators: [], flagged_by: "Auto-Rule", action_taken: "Approved", description: "Standard return request within policy. No risk indicators." },
  { id: "12", entity_type: "order", entity_id: "ORD-8910", risk_score: 98, risk_level: "critical", indicators: ["Bulk Order", "New Account", "High Value", "Shipping Mismatch", "Card BIN Suspicious"], flagged_by: "AI Engine", action_taken: "Blocked", description: "100 units of high-end smartphones from newly created account. BIN flagged." },
];

const riskBadge = (level: string) => {
  const styles: Record<string, string> = {
    critical: "bg-red-600 text-white",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-white",
    low: "bg-green-500 text-white",
  };
  return styles[level] || "bg-gray-500 text-white";
};

const entityIcon = (type: string) => {
  const icons: Record<string, any> = {
    return: ShoppingBag,
    order: FileText,
    payment: CreditCard,
    account: Shield,
    review: MessageSquare,
  };
  return icons[type] || Eye;
};

const entityColor = (type: string) => {
  const colors: Record<string, string> = {
    return: "bg-red-50 text-red",
    order: "bg-blue-50 text-blue",
    payment: "bg-purple-50 text-purple-700",
    account: "bg-green-50 text-green-700",
    review: "bg-yellow-50 text-yellow-700",
  };
  return colors[type] || "bg-gray-50 text-gray-500";
};

const seedRules = [
  { id: "1", name: "Frequent Returner", threshold: ">5 returns in 30 days", severity: "critical", enabled: true, triggers: 28 },
  { id: "2", name: "New Account High Value", threshold: "Order >200K within 24hr of signup", severity: "high", enabled: true, triggers: 15 },
  { id: "3", name: "Card BIN Watchlist", threshold: "BIN matches known fraud list", severity: "high", enabled: true, triggers: 42 },
  { id: "4", name: "Shipping Mismatch", threshold: "IP country ≠ shipping country", severity: "medium", enabled: true, triggers: 89 },
  { id: "5", name: "Duplicate Review Content", threshold: ">80% content overlap with existing", severity: "medium", enabled: true, triggers: 34 },
  { id: "6", name: "Chargeback Velocity", threshold: ">2 chargebacks per card", severity: "critical", enabled: true, triggers: 12 },
  { id: "7", name: "Address Anomaly", threshold: "PO Box or invalid address pattern", severity: "low", enabled: true, triggers: 156 },
  { id: "8", name: "Bulk Order Suspicion", threshold: ">5 identical items per order", severity: "medium", enabled: false, triggers: 0 },
];

export default function FraudPage() {
  const [activeTab, setActiveTab] = useState("flagged");
  const [checks] = useState(seedFraudChecks);
  const [rules] = useState(seedRules);
  const [search, setSearch] = useState("");
  const [showActionModal, setShowActionModal] = useState<any>(null);

  const totalChecks = checks.length;
  const highRisk = checks.filter((c) => c.risk_level === "high").length;
  const mediumRisk = checks.filter((c) => c.risk_level === "medium").length;
  const lowRisk = checks.filter((c) => c.risk_level === "low").length;
  const critical = checks.filter((c) => c.risk_level === "critical").length;

  const kpis = [
    { label: "Total Checks", value: totalChecks, icon: ShieldAlert, color: "text-blue" },
    { label: "Critical", value: critical, icon: AlertTriangle, color: "text-red" },
    { label: "High Risk", value: highRisk, icon: ShieldAlert, color: "text-orange-500" },
    { label: "Medium Risk", value: mediumRisk, icon: Clock, color: "text-yellow-600" },
    { label: "Low Risk", value: lowRisk, icon: CheckCircle, color: "text-green-600" },
  ];

  const filteredChecks = checks.filter((c) =>
    !search || c.entity_id.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action === "Blocked") return "bg-red-50 text-red";
    if (action === "Flagged" || action === "Flagged") return "bg-orange-50 text-orange-700";
    if (action === "Reviewing" || action === "Watched" || action === "Reviewed") return "bg-yellow-50 text-yellow-700";
    return "bg-green-50 text-green-700";
  };

  return (
    <AdminShell title="Returns Fraud AI" subtitle="AI-powered fraud detection for returns, orders, payments, accounts, and reviews">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl text-text-1">Fraud Detection</h1>
          <div className="flex gap-2">
            <input placeholder="Search entities..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 px-3 rounded-lg border border-border text-sm w-[220px] focus:outline-none focus:border-blue" />
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {fraudTabs.map((tab) => (
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

        {activeTab === "flagged" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1 flex items-center gap-2"><ShieldAlert size={18} /> Flagged Items</h3>
              <span className="text-xs text-text-4">{filteredChecks.length} items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Entity</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Entity ID</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Risk Score</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Level</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Indicators</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Flagged By</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Action</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredChecks.map((c) => {
                    const EntityIcon = entityIcon(c.entity_type);
                    return (
                      <tr key={c.id} className="hover:bg-off-white transition-colors">
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${entityColor(c.entity_type)}`}>
                            <EntityIcon size={10} /> {c.entity_type}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs font-medium text-text-1">{c.entity_id}</td>
                        <td className="px-5 py-3 text-right font-semibold text-text-1">{c.risk_score}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${riskBadge(c.risk_level)}`}>{c.risk_level}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            {c.indicators.length > 0 ? c.indicators.map((ind) => (
                              <span key={ind} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap">{ind}</span>
                            )) : <span className="text-xs text-text-4">None</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-text-3 text-xs">{c.flagged_by}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getActionColor(c.action_taken)}`}>{c.action_taken}</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button onClick={() => setShowActionModal(c)} className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Eye size={14} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "rules" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1 flex items-center gap-2"><Shield size={18} /> Detection Rules</h3>
              <span className="text-xs text-text-4">{rules.filter((r) => r.enabled).length} active</span>
            </div>
            <div className="divide-y divide-border">
              {rules.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-5 py-4 hover:bg-off-white transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text-1">{r.name}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${riskBadge(r.severity)}`}>{r.severity}</span>
                    </div>
                    <p className="text-xs text-text-4 mt-0.5">{r.threshold}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-text-3">{r.triggers} triggers</span>
                    <div className={`w-10 h-6 rounded-full transition-colors ${r.enabled ? "bg-blue" : "bg-gray-200"} relative cursor-pointer`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${r.enabled ? "left-5" : "left-1"}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2"><AlertTriangle size={18} /> Risk Distribution</h3>
              <div className="space-y-3">
                {[
                  { level: "Critical", count: critical, color: "bg-red-600" },
                  { level: "High", count: highRisk, color: "bg-orange-500" },
                  { level: "Medium", count: mediumRisk, color: "bg-yellow-500" },
                  { level: "Low", count: lowRisk, color: "bg-green-500" },
                ].map((r) => (
                  <div key={r.level} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${r.color}`} />
                    <span className="text-sm text-text-2 flex-1">{r.level}</span>
                    <span className="text-sm font-semibold text-text-1">{r.count}</span>
                    <div className="h-2 w-24 bg-off-white rounded-full overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full`} style={{ width: `${(r.count / totalChecks) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2"><FileText size={18} /> By Entity Type</h3>
              <div className="space-y-3">
                {["return", "order", "payment", "account", "review"].map((type) => {
                  const count = checks.filter((c) => c.entity_type === type).length;
                  const EntityIcon = entityIcon(type);
                  return (
                    <div key={type} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <EntityIcon size={14} className="text-text-4" />
                      <span className="text-sm text-text-2 flex-1 capitalize">{type}</span>
                      <span className="text-sm font-semibold text-text-1">{count}</span>
                      <span className="text-xs text-text-4">({((count / totalChecks) * 100).toFixed(0)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {showActionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowActionModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[500px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-syne font-bold text-lg">Fraud Check Detail</h2>
              <button onClick={() => setShowActionModal(null)} className="p-2 rounded-lg hover:bg-off-white text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${riskBadge(showActionModal.risk_level)}`}>{showActionModal.risk_level}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${entityColor(showActionModal.entity_type)}`}>{showActionModal.entity_type}</span>
                <span className="text-sm font-mono font-medium text-text-2">{showActionModal.entity_id}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Risk Score</p><p className="text-lg font-bold mt-0.5">{showActionModal.risk_score}/100</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Action Taken</p><span className={`text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${getActionColor(showActionModal.action_taken)}`}>{showActionModal.action_taken}</span></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Flagged By</p><p className="text-sm mt-0.5">{showActionModal.flagged_by}</p></div>
              </div>
              <div>
                <p className="text-[10px] text-text-4 uppercase font-semibold mb-1">Description</p>
                <p className="text-sm text-text-2 bg-off-white rounded-lg p-3">{showActionModal.description}</p>
              </div>
              {showActionModal.indicators.length > 0 && (
                <div>
                  <p className="text-[10px] text-text-4 uppercase font-semibold mb-1">Indicators</p>
                  <div className="flex flex-wrap gap-1">
                    {showActionModal.indicators.map((ind: string) => (
                      <span key={ind} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{ind}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 p-5 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={() => setShowActionModal(null)}>Close</Button>
              {showActionModal.action_taken !== "Blocked" && (
                <Button className="flex-1 bg-red hover:bg-red/90" onClick={() => setShowActionModal(null)}>
                  <XCircle size={14} className="mr-1" /> Block Entity
                </Button>
              )}
              {showActionModal.action_taken !== "Approved" && showActionModal.action_taken !== "Blocked" && (
                <Button className="flex-1" onClick={() => setShowActionModal(null)}>
                  <CheckCircle size={14} className="mr-1" /> Approve
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
