"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search, ChevronDown, Star, Shield, CheckCircle, XCircle,
  Eye, ArrowUpDown, ChevronLeft, ChevronRight,
} from "lucide-react";

interface Professional {
  id: string;
  companyName: string | null;
  primaryCategory: string;
  verificationTier: string;
  ratingAverage: number | null;
  totalJobsCompleted: number;
  status: string;
  accountType: string;
  createdAt: string;
}

const STATUS_OPTIONS = ["all", "active", "pending", "suspended"];
const TIER_OPTIONS = ["all", "basic", "certified", "gold", "platinum"];

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchProfessionals = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("query", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (tierFilter !== "all") params.set("tier", tierFilter);
    if (sortField) { params.set("sort", sortField); params.set("dir", sortDir); }
    params.set("page", String(page));
    params.set("limit", "15");

    fetch(`/api/v1/kpn/search?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setProfessionals(res.data.data || []);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProfessionals(); }, [page, statusFilter, tierFilter, sortField, sortDir]);

  useEffect(() => {
    const timer = setTimeout(() => { if (page !== 1) setPage(1); else fetchProfessionals(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSort = (field: string) => {
    if (sortField === field) { setSortDir((d) => (d === "asc" ? "desc" : "asc")); }
    else { setSortField(field); setSortDir("desc"); }
  };

  const tierBadge = (tier: string) => {
    const styles: Record<string, string> = {
      basic: "bg-gray-50 text-gray-600",
      certified: "bg-blue-50 text-blue-700",
      gold: "bg-amber-50 text-amber-700",
      platinum: "bg-gradient-to-r from-kauvex-navy to-kauvex-orange text-white",
    };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[tier] || styles.basic}`}>{tier}</span>;
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-50 text-green-700",
      pending: "bg-amber-50 text-amber-700",
      suspended: "bg-red-50 text-red-700",
    };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status] || "bg-gray-50 text-gray-600"}`}>{status}</span>;
  };

  const actionButtons = (prof: Professional) => (
    <div className="flex items-center gap-1">
      <Link
        href={`/admin/kpn/professionals/${prof.id}`}
        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-kauvex-navy"
        title="View"
      >
        <Eye size={14} />
      </Link>
      {prof.status === "pending" && (
        <button
          onClick={async () => {
            await fetch(`/api/v1/kpn/${prof.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "active" }),
            });
            fetchProfessionals();
          }}
          className="p-1.5 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600"
          title="Approve"
        >
          <CheckCircle size={14} />
        </button>
      )}
      {prof.status === "active" && (
        <button
          onClick={async () => {
            await fetch(`/api/v1/kpn/${prof.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "suspended" }),
            });
            fetchProfessionals();
          }}
          className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
          title="Suspend"
        >
          <XCircle size={14} />
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, category..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="appearance-none h-10 pl-3 pr-8 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-kauvex-orange"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={tierFilter}
            onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
            className="appearance-none h-10 pl-3 pr-8 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-kauvex-orange"
          >
            {TIER_OPTIONS.map((t) => (
              <option key={t} value={t}>{t === "all" ? "All Tiers" : t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Professional</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort("verificationTier")} className="flex items-center gap-1 hover:text-kauvex-navy">
                    Tier <ArrowUpDown size={11} />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort("ratingAverage")} className="flex items-center gap-1 hover:text-kauvex-navy">
                    Rating <ArrowUpDown size={11} />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort("totalJobsCompleted")} className="flex items-center gap-1 hover:text-kauvex-navy">
                    Jobs <ArrowUpDown size={11} />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-32" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-24" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-16" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-12" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-8" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-16" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-20" /></td>
                  </tr>
                ))
              ) : professionals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">No professionals found</td>
                </tr>
              ) : (
                professionals.map((prof) => (
                  <tr key={prof.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-kauvex-navy to-kauvex-navy/70 flex items-center justify-center text-white text-xs font-bold">
                          {prof.companyName?.[0] || "P"}
                        </div>
                        <div>
                          <p className="font-medium text-kauvex-navy text-sm">{prof.companyName || "Unnamed"}</p>
                          <p className="text-[11px] text-gray-400">{prof.accountType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{prof.primaryCategory}</td>
                    <td className="px-4 py-3">{tierBadge(prof.verificationTier)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <Star size={12} className="text-amber-400" fill="currentColor" />
                        {prof.ratingAverage?.toFixed(1) || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{prof.totalJobsCompleted}</td>
                    <td className="px-4 py-3">{statusBadge(prof.status)}</td>
                    <td className="px-4 py-3 text-right">{actionButtons(prof)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30"
            >
              <ChevronLeft size={15} className="text-gray-500" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30"
            >
              <ChevronRight size={15} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
