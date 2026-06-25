"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Search, Eye, Check, X, Ban, MessageCircle, TrendingUp,
  UserCheck, Users, DollarSign, ArrowUpDown, Clock,
} from "lucide-react";

interface Partner {
  id: string;
  name: string;
  email: string;
  username: string;
  trackingId: string;
  type: string;
  tier: string;
  status: string;
  clicks30d: number;
  sales30d: number;
  earnings30d: number;
  conversionRate: number;
  joined: string;
}

const seedPartners: Partner[] = [
  { id: "1", name: "Ngozi Eze", email: "ngozi.eze@example.com", username: "ngozi_eze", trackingId: "NGOZI08", type: "influencer", tier: "mega", status: "active", clicks30d: 5200, sales30d: 410, earnings30d: 1840000, conversionRate: 7.9, joined: "2025-07-05" },
  { id: "2", name: "Zainab Yusuf", email: "zainab.y@example.com", username: "zainab_yusuf", trackingId: "ZAINAB15", type: "influencer", tier: "macro", status: "active", clicks30d: 3100, sales30d: 220, earnings30d: 1044000, conversionRate: 7.1, joined: "2025-09-20" },
  { id: "3", name: "Bola Tinubu Ventures", email: "bola.tv@example.com", username: "bola_tv", trackingId: "BOLA30", type: "agency", tier: "enterprise", status: "active", clicks30d: 4200, sales30d: 285, earnings30d: 1125000, conversionRate: 6.8, joined: "2025-10-15" },
  { id: "4", name: "Amara Nwachukwu", email: "amara.n@example.com", username: "amara_n", trackingId: "AMARA10", type: "associate", tier: "premium", status: "active", clicks30d: 2300, sales30d: 156, earnings30d: 630000, conversionRate: 6.8, joined: "2025-11-01" },
  { id: "5", name: "Chidi Okeke", email: "chidi.okeke@example.com", username: "chidi_o", trackingId: "CHIDI20", type: "associate", tier: "standard", status: "active", clicks30d: 1420, sales30d: 85, earnings30d: 342000, conversionRate: 6.0, joined: "2026-01-15" },
  { id: "6", name: "Chinwe Obi", email: "chinwe.o@example.com", username: "chinwe_obi", trackingId: "CHINWE07", type: "influencer", tier: "macro", status: "active", clicks30d: 3400, sales30d: 198, earnings30d: 720000, conversionRate: 5.8, joined: "2025-12-01" },
  { id: "7", name: "Tunde Bakare", email: "tunde.b@example.com", username: "tunde_b", trackingId: "TUNDE12", type: "associate", tier: "standard", status: "active", clicks30d: 1780, sales30d: 95, earnings30d: 288000, conversionRate: 5.3, joined: "2026-02-14" },
  { id: "8", name: "Yemi Ogun", email: "yemi.o@example.com", username: "yemi_ogun", trackingId: "YEMI14", type: "associate", tier: "standard", status: "active", clicks30d: 1600, sales30d: 88, earnings30d: 252000, conversionRate: 5.5, joined: "2026-02-28" },
  { id: "9", name: "Kelechi Ibe", email: "kelechi.i@example.com", username: "kelechi_i", trackingId: "KELECHI18", type: "associate", tier: "premium", status: "active", clicks30d: 1100, sales30d: 55, earnings30d: 198000, conversionRate: 5.0, joined: "2026-05-01" },
  { id: "10", name: "Femi Adeleke", email: "femi.a@example.com", username: "femi_adeleke", trackingId: "FEMI05", type: "associate", tier: "standard", status: "active", clicks30d: 890, sales30d: 42, earnings30d: 110000, conversionRate: 4.7, joined: "2026-03-10" },
  { id: "11", name: "Emeka Okafor", email: "emeka.o@example.com", username: "emeka_o", trackingId: "EMEKA25", type: "b2b_referral", tier: "standard", status: "inactive", clicks30d: 650, sales30d: 28, earnings30d: 78000, conversionRate: 4.3, joined: "2026-04-01" },
  { id: "12", name: "Adaobi Nnamdi", email: "adaobi.n@example.com", username: "adaobi_n", trackingId: "ADAOBI22", type: "associate", tier: "standard", status: "suspended", clicks30d: 430, sales30d: 18, earnings30d: 52000, conversionRate: 4.2, joined: "2026-04-20" },
  { id: "13", name: "Tomiwa Ogunlesi", email: "tomiwa.o@example.com", username: "tomiwa_o", trackingId: "TOMIWA11", type: "influencer", tier: "micro", status: "pending", clicks30d: 0, sales30d: 0, earnings30d: 0, conversionRate: 0, joined: "2026-06-15" },
  { id: "14", name: "Simi Daniel", email: "simi.d@example.com", username: "simi_daniel", trackingId: "SIMI09", type: "influencer", tier: "nano", status: "pending", clicks30d: 0, sales30d: 0, earnings30d: 0, conversionRate: 0, joined: "2026-06-18" },
];

const typeColors: Record<string, string> = {
  influencer: "bg-purple-100 text-purple-700",
  associate: "bg-blue-100 text-blue-700",
  agency: "bg-orange-100 text-orange-700",
  b2b_referral: "bg-green-100 text-green-700",
};

const tierColors: Record<string, string> = {
  nano: "bg-gray-100 text-gray-600",
  micro: "bg-amber-100 text-amber-700",
  mid: "bg-blue-100 text-blue-700",
  macro: "bg-purple-100 text-purple-700",
  mega: "bg-red-100 text-red-700",
  celebrity: "bg-yellow-100 text-yellow-700",
  standard: "bg-gray-100 text-gray-600",
  premium: "bg-indigo-100 text-indigo-700",
  enterprise: "bg-orange-100 text-orange-700",
};

export default function AdminAffiliatesPartnersPage() {
  const [partners, setPartners] = useState(seedPartners);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = partners.filter((p) => {
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.trackingId.toLowerCase().includes(search.toLowerCase()) && !p.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: partners.length,
    active: partners.filter((p) => p.status === "active").length,
    pending: partners.filter((p) => p.status === "pending").length,
    totalEarnings: partners.reduce((s, p) => s + p.earnings30d, 0),
  };

  return (
    <AdminShell title="Partners" subtitle="All affiliate & influencer partners">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1"><Users size={15} className="text-blue" /><span className="text-[10px] text-gray-500 font-medium">Total Partners</span></div>
            <p className="text-xl font-bold text-[#0A1628]">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1"><UserCheck size={15} className="text-green-600" /><span className="text-[10px] text-gray-500 font-medium">Active</span></div>
            <p className="text-xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1"><Clock size={15} className="text-amber-600" /><span className="text-[10px] text-gray-500 font-medium">Pending Approval</span></div>
            <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1"><DollarSign size={15} className="text-purple-600" /><span className="text-[10px] text-gray-500 font-medium">30d Earnings</span></div>
            <p className="text-xl font-bold text-purple-600">₦{(stats.totalEarnings / 1e6).toFixed(1)}M</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, tracking ID, or email..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">All Types</option>
            <option value="associate">Associate</option>
            <option value="influencer">Influencer</option>
            <option value="agency">Agency</option>
            <option value="b2b_referral">B2B Referral</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <span className="text-xs text-gray-400">{filtered.length} partner{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Partner", "Type", "Tier", "Tracking ID", "Status", "Clicks (30d)", "Sales (30d)", "Earnings (30d)", "Conv. Rate", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center text-xs font-bold text-orange">
                        {p.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[#0A1628]">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[p.type] || "bg-gray-100 text-gray-600"}`}>
                      {p.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tierColors[p.tier] || "bg-gray-100 text-gray-600"}`}>
                      {p.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded text-blue">{p.trackingId}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "active" ? <span className="flex items-center gap-1 text-[10px] text-green-600"><Check size={10} /> Active</span> :
                     p.status === "pending" ? <span className="flex items-center gap-1 text-[10px] text-amber-600"><Clock size={10} /> Pending</span> :
                     p.status === "suspended" ? <span className="flex items-center gap-1 text-[10px] text-red"><Ban size={10} /> Suspended</span> :
                     <span className="flex items-center gap-1 text-[10px] text-gray-500"><X size={10} /> Inactive</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-sm">{p.clicks30d.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-sm">{p.sales30d}</td>
                  <td className="px-4 py-3 font-semibold text-sm text-green-600">₦{(p.earnings30d / 1e3).toFixed(0)}K</td>
                  <td className="px-4 py-3 text-xs">{p.conversionRate > 0 ? `${p.conversionRate}%` : "—"}</td>
                  <td className="px-4 py-3 text-[10px] text-gray-500">{p.joined}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600" title="View details"><Eye size={14} /></button>
                      {p.status === "pending" && (
                        <button className="p-1.5 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600" title="Approve"><Check size={14} /></button>
                      )}
                      {p.status === "active" && (
                        <>
                          <button className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red" title="Suspend"><Ban size={14} /></button>
                          <button className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue" title="Send message"><MessageCircle size={14} /></button>
                        </>
                      )}
                      {p.status === "suspended" && (
                        <button className="p-1.5 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600" title="Reactivate"><TrendingUp size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-400">No partners found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
