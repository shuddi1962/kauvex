"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Filter, Download } from "lucide-react";
import { insforge } from "@/lib/insforge";

interface AuditEntry {
  id: string;
  user_id: string | null;
  user_role: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ACTION_OPTIONS = ["create", "update", "delete", "view", "login", "logout", "export"];
const RESOURCE_OPTIONS = ["products", "orders", "vendors", "storefronts", "users", "settings", "roles", "permissions", "warehouses", "campaigns", "coupons", "api_keys", "webhooks"];

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 25, total: 0, totalPages: 0 });

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterResource, setFilterResource] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Expanded rows
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "25");
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (filterUser) params.set("userId", filterUser);
      if (filterAction) params.set("action", filterAction);
      if (filterResource) params.set("resource", filterResource);

      const res = await fetch(`/api/admin/audit-log?${params.toString()}`);
      const json = await res.json();
      if (json.data) {
        setEntries(json.data);
        setPagination(json.pagination);
      }
    } catch {
      console.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, filterUser, filterAction, filterResource]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchLogs(page);
  };

  const diffKeys = (oldVal: Record<string, unknown> | null, newVal: Record<string, unknown> | null): string[] => {
    const keys = new Set<string>();
    if (oldVal) Object.keys(oldVal).forEach((k) => keys.add(k));
    if (newVal) Object.keys(newVal).forEach((k) => keys.add(k));
    return Array.from(keys).sort();
  };

  const formatValue = (val: unknown): string => {
    if (val === null || val === undefined) return "<em>null</em>";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      create: "bg-green-50 text-green-700",
      update: "bg-blue-50 text-blue-700",
      delete: "bg-red-50 text-red-700",
      view: "bg-gray-100 text-gray-600",
      login: "bg-purple-50 text-purple-700",
      logout: "bg-gray-50 text-gray-500",
      export: "bg-yellow-50 text-yellow-700",
    };
    return styles[action] || "bg-gray-100 text-gray-600";
  };

  return (
    <AdminShell title="Audit Log" subtitle="Track all administrative actions and changes">
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input
              type="text"
              placeholder="Search by user, resource, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-blue"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${showFilters ? "bg-blue text-white border-blue" : "bg-white border-gray-200 text-text-3 hover:border-gray-300"}`}
            >
              <Filter size={14} /> Filters {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium bg-white border border-gray-200 text-text-3 hover:border-gray-300">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-4 uppercase mb-1 block">Date From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-4 uppercase mb-1 block">Date To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-4 uppercase mb-1 block">User ID</label>
              <input type="text" value={filterUser} onChange={(e) => setFilterUser(e.target.value)} placeholder="user@example.com" className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-4 uppercase mb-1 block">Action</label>
              <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue">
                <option value="">All actions</option>
                {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-text-4 uppercase mb-1 block">Resource</label>
              <select value={filterResource} onChange={(e) => setFilterResource(e.target.value)} className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue">
                <option value="">All resources</option>
                {RESOURCE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Timestamp</th>
                  <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">User</th>
                  <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Action</th>
                  <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Resource</th>
                  <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Details</th>
                  <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-text-4">Loading audit logs...</td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-text-4">No audit log entries found.</td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <>
                      <tr
                        key={entry.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                        onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      >
                        <td className="p-3 text-xs text-text-3 whitespace-nowrap font-mono">
                          {new Date(entry.created_at).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <div className="text-sm text-text-1 font-medium">
                            {entry.user_id ? (
                              <span className="font-mono text-xs">{entry.user_id.slice(0, 8)}...</span>
                            ) : (
                              <span className="text-text-4 italic">System</span>
                            )}
                          </div>
                          {entry.user_role && (
                            <span className="text-[10px] text-text-4">{entry.user_role}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getActionBadge(entry.action)}`}>
                            {entry.action}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="text-sm text-text-1">{entry.resource}</div>
                          {entry.resource_id && (
                            <span className="text-[10px] text-text-4 font-mono">ID: {entry.resource_id.slice(0, 8)}...</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-text-2">
                              {entry.old_value || entry.new_value ? "Changes detected" : "—"}
                            </span>
                            {(entry.old_value || entry.new_value) && (
                              <span className="text-text-4">
                                {expandedId === entry.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-xs text-text-4 font-mono">{entry.ip_address || "—"}</td>
                      </tr>
                      {expandedId === entry.id && (entry.old_value || entry.new_value) && (
                        <tr key={`${entry.id}-diff`}>
                          <td colSpan={6} className="p-4 bg-gray-50 border-b border-gray-100">
                            <div className="text-xs font-semibold text-text-4 uppercase mb-2">Value Changes</div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="p-2 text-left font-semibold text-text-4">Field</th>
                                    <th className="p-2 text-left font-semibold text-text-4">Old Value</th>
                                    <th className="p-2 text-left font-semibold text-text-4">New Value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {diffKeys(entry.old_value, entry.new_value).map((key) => (
                                    <tr key={key} className="border-b border-gray-100">
                                      <td className="p-2 font-medium text-text-2">{key}</td>
                                      <td className="p-2 text-text-4 font-mono max-w-[300px] truncate" title={formatValue(entry.old_value?.[key] ?? null)}>
                                        {formatValue(entry.old_value?.[key] ?? null)}
                                      </td>
                                      <td className="p-2 text-text-2 font-mono max-w-[300px] truncate" title={formatValue(entry.new_value?.[key] ?? null)}>
                                        {formatValue(entry.new_value?.[key] ?? null)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-4">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-text-3 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${pageNum === pagination.page ? "bg-blue text-white" : "hover:bg-gray-100 text-text-3"}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-text-3 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
