"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown, Eye, SlidersHorizontal, ChevronLeft, ChevronRight, DollarSign } from "lucide-react";
import Link from "next/link";

interface ConfiguratorSession {
  id: string;
  configuratorType: string;
  configuration: Record<string, any> | null;
  aiRenderUrl: string | null;
  costEstimateMin: number | null;
  costEstimateMax: number | null;
  currencyCode: string;
  status: string;
  quotesReceived: number;
  createdAt: string;
}

const TYPE_OPTIONS = ["all", "boat", "solar", "cctv", "house", "kitchen", "dredging", "security", "farm", "factory"];
const STATUS_OPTIONS = ["all", "draft", "quoted", "ordered", "in_production"];

export default function ConfiguratorsPage() {
  const [sessions, setSessions] = useState<ConfiguratorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSessions = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", "15");

    fetch(`/api/v1/kpn/configurators?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setSessions(res.data.data || res.data || []);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSessions(); }, [page, typeFilter, statusFilter]);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-50 text-gray-600",
      quoted: "bg-blue-50 text-blue-700",
      ordered: "bg-green-50 text-green-700",
      in_production: "bg-amber-50 text-amber-700",
    };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status] || "bg-gray-50 text-gray-600"}`}>{status}</span>;
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search configurator sessions..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange"
          />
        </div>
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="appearance-none h-10 pl-3 pr-8 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-kauvex-orange"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="appearance-none h-10 pl-3 pr-8 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-kauvex-orange"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Status" : s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Summary */}
      {!loading && sessions.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-6">
          {TYPE_OPTIONS.filter((t) => t !== "all").map((type) => {
            const count = sessions.filter((s) => s.configuratorType === type).length;
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() => { setTypeFilter(type); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${typeFilter === type ? "bg-kauvex-orange text-white border-kauvex-orange" : "bg-white text-gray-600 border-gray-200 hover:border-kauvex-orange"}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Configuration</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Cost Estimate</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Quotes</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                    <SlidersHorizontal size={32} className="mx-auto text-gray-300 mb-2" />
                    No configurator sessions found
                  </td>
                </tr>
              ) : (
                sessions.map((session) => {
                  const config = session.configuration || {};
                  const summary = Object.entries(config).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(", ");
                  return (
                    <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 text-sm font-medium text-kauvex-navy">
                          <SlidersHorizontal size={14} className="text-kauvex-orange" />
                          {session.configuratorType.charAt(0).toUpperCase() + session.configuratorType.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{summary || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {session.costEstimateMin != null ? (
                          <span className="flex items-center gap-1">
                            <DollarSign size={12} className="text-green-500" />
                            {session.currencyCode} {session.costEstimateMin.toLocaleString()} – {session.costEstimateMax?.toLocaleString()}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{session.quotesReceived}</td>
                      <td className="px-4 py-3">{statusBadge(session.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(session.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-kauvex-navy" title="View details">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30">
              <ChevronLeft size={15} className="text-gray-500" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30">
              <ChevronRight size={15} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
