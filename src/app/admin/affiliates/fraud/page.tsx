"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Search, ShieldAlert, AlertTriangle, Ban, Check,
  X, Eye, Flag, Trash2, Shield,
} from "lucide-react";

interface FlaggedClick {
  id: string;
  partner: string;
  partnerId: string;
  trackingId: string;
  ipHash: string;
  fraudType: string;
  evidence: string;
  actionTaken: string;
  date: string;
}

interface BlockedIp {
  id: string;
  ipHash: string;
  reason: string;
  blockedAt: string;
}

interface SelfClickLog {
  id: string;
  partner: string;
  partnerId: string;
  count: number;
  lastClick: string;
  status: string;
}

const flaggedClicks: FlaggedClick[] = [
  { id: "fc1", partner: "Adaobi Nnamdi", partnerId: "p12", trackingId: "ADAOBI22", ipHash: "a1b2c3d4e5...", fraudType: "rate_limit", evidence: "45 clicks in 1 hour from same IP", actionTaken: "flagged", date: "2026-06-10" },
  { id: "fc2", partner: "Femi Adeleke", partnerId: "p10", trackingId: "FEMI05", ipHash: "f6g7h8i9j0...", fraudType: "self_click", evidence: "Click from same device as partner login", actionTaken: "cleared", date: "2026-06-08" },
  { id: "fc3", partner: "Unknown", partnerId: "", trackingId: "BOGUS99", ipHash: "k1l2m3n4o5...", fraudType: "invalid_ref", evidence: "Non-existent tracking ID used 200+ times", actionTaken: "flagged", date: "2026-06-12" },
  { id: "fc4", partner: "Emeka Okafor", partnerId: "p11", trackingId: "EMEKA25", ipHash: "p6q7r8s9t0...", fraudType: "rate_limit", evidence: "28 clicks in 30 minutes", actionTaken: "flagged", date: "2026-06-09" },
  { id: "fc5", partner: "Adaobi Nnamdi", partnerId: "p12", trackingId: "ADAOBI22", ipHash: "u1v2w3x4y5...", fraudType: "self_click", evidence: "Self-referral pattern detected", actionTaken: "suspended", date: "2026-06-11" },
  { id: "fc6", partner: "Bogus Click Bot", partnerId: "", trackingId: "FAKE001", ipHash: "z6a7b8c9d0...", fraudType: "bot_traffic", evidence: "User-agent matches known bot pattern", actionTaken: "flagged", date: "2026-06-12" },
];

const blockedIps: BlockedIp[] = [
  { id: "ip1", ipHash: "a1b2c3d4e5f6...", reason: "Rate limit exceeded (45+ clicks/hour)", blockedAt: "2026-06-10" },
  { id: "ip2", ipHash: "z6a7b8c9d0e1...", reason: "Bot traffic detected", blockedAt: "2026-06-12" },
  { id: "ip3", ipHash: "u1v2w3x4y5z6...", reason: "Self-click abuse (suspended partner)", blockedAt: "2026-06-11" },
];

const selfClickLogs: SelfClickLog[] = [
  { id: "sc1", partner: "Adaobi Nnamdi", partnerId: "p12", count: 47, lastClick: "2026-06-11", status: "suspended" },
  { id: "sc2", partner: "Femi Adeleke", partnerId: "p10", count: 5, lastClick: "2026-06-08", status: "cleared" },
  { id: "sc3", partner: "Emeka Okafor", partnerId: "p11", count: 12, lastClick: "2026-06-09", status: "flagged" },
];

const fraudTypes: Record<string, string> = {
  rate_limit: "Rate Limit",
  self_click: "Self Click",
  invalid_ref: "Invalid Ref",
  bot_traffic: "Bot Traffic",
};

const fraudColors: Record<string, string> = {
  rate_limit: "bg-orange-100 text-orange-700",
  self_click: "bg-red-100 text-red-700",
  invalid_ref: "bg-purple-100 text-purple-700",
  bot_traffic: "bg-blue-100 text-blue-700",
};

const actionColors: Record<string, string> = {
  flagged: "bg-orange-50 text-orange-600",
  cleared: "bg-green-50 text-green-600",
  suspended: "bg-red-50 text-red",
};

export default function AdminAffiliatesFraudPage() {
  const [items, setItems] = useState(flaggedClicks);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"flagged" | "blocked" | "self_clicks">("flagged");

  const filtered = items.filter((f) => {
    if (search && !f.partner.toLowerCase().includes(search.toLowerCase()) && !f.trackingId.toLowerCase().includes(search.toLowerCase()) && !f.fraudType.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAction = (id: string, action: "clear" | "flag" | "suspend") => {
    setItems((prev) => prev.map((f) => f.id === id ? {
      ...f, actionTaken: action === "clear" ? "cleared" : action === "suspend" ? "suspended" : "flagged",
    } : f));
  };

  return (
    <AdminShell title="Fraud Management" subtitle="Monitor and manage affiliate fraud">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-[#0A1628]">{flaggedClicks.length}</p>
            <p className="text-[10px] text-gray-500">Total Flagged</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-red">{flaggedClicks.filter((f) => f.actionTaken === "flagged" || f.actionTaken === "suspended").length}</p>
            <p className="text-[10px] text-gray-500">Active Flags</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-green-600">{selfClickLogs.filter((s) => s.status === "cleared").length}</p>
            <p className="text-[10px] text-gray-500">Cleared</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-orange">{blockedIps.length}</p>
            <p className="text-[10px] text-gray-500">Blocked IPs</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200 w-fit">
          {(["flagged", "blocked", "self_clicks"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${activeTab === tab ? "bg-[#FF6B00] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
              {tab === "self_clicks" ? "Self-Click Violations" : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        {activeTab !== "blocked" && (
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by partner or tracking ID..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        )}

        {activeTab === "flagged" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Partner", "Tracking ID", "Fraud Type", "Evidence", "IP Hash", "Action Taken", "Date", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-[#0A1628]">{f.partner || "Unknown"}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-blue">{f.trackingId}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${fraudColors[f.fraudType] || "bg-gray-100 text-gray-600"}`}>
                        {fraudTypes[f.fraudType] || f.fraudType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-500 max-w-[200px] truncate">{f.evidence}</td>
                    <td className="px-4 py-3 text-[9px] font-mono text-gray-400">{f.ipHash}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${actionColors[f.actionTaken] || "bg-gray-100 text-gray-600"}`}>
                        {f.actionTaken}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-500">{f.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {f.actionTaken !== "cleared" && (
                          <button onClick={() => handleAction(f.id, "clear")} className="p-1.5 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600" title="Clear Flag"><Check size={14} /></button>
                        )}
                        {f.actionTaken !== "flagged" && f.actionTaken !== "suspended" && (
                          <button onClick={() => handleAction(f.id, "flag")} className="p-1.5 hover:bg-orange-50 rounded-lg text-gray-400 hover:text-orange" title="Mark as Fraudulent"><Flag size={14} /></button>
                        )}
                        {f.actionTaken !== "suspended" && (
                          <button onClick={() => handleAction(f.id, "suspend")} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red" title="Suspend Partner"><Ban size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">No flagged items</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "blocked" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["IP Hash", "Reason", "Blocked At", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blockedIps.map((ip) => (
                  <tr key={ip.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-[10px] text-gray-500">{ip.ipHash}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{ip.reason}</td>
                    <td className="px-4 py-3 text-[10px] text-gray-500">{ip.blockedAt}</td>
                    <td className="px-4 py-3">
                      <button className="flex items-center gap-1 text-[10px] text-green-600 hover:underline">
                        <Check size={12} /> Unblock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "self_clicks" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Partner", "Self-Click Count", "Last Occurrence", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selfClickLogs.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-sm text-[#0A1628]">{s.partner}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-sm ${s.count > 10 ? "text-red" : "text-orange"}`}>{s.count}</span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-500">{s.lastClick}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.status === "suspended" ? "bg-red-50 text-red" : s.status === "flagged" ? "bg-orange-50 text-orange" : "bg-green-50 text-green-600"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600" title="View details"><Eye size={14} /></button>
                        {s.status !== "suspended" && (
                          <button className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red" title="Suspend"><Ban size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
