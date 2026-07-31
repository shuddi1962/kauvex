"use client";

import { useState, useCallback, useEffect, ReactNode } from "react";
import { X, Search, Loader2, Inbox, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOS_STATUS_STYLES } from "@/lib/business-os";

// ---------- Data hook ----------

export function useBosResource(endpoint: string) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/business-os/${endpoint}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load");
      }
      const data = await res.json();
      setRows(data.data?.rows ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const createRow = async (data: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/business-os/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to create");
      setRows((prev) => [json.data, ...prev]);
      return json.data;
    } finally {
      setSubmitting(false);
    }
  };

  const updateRow = async (id: string, data: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/business-os/${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to update");
      setRows((prev) => prev.map((r) => (r.id === id ? json.data : r)));
      return json.data;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRow = async (id: string) => {
    const res = await fetch(`/api/v1/business-os/${endpoint}/${id}`, { method: "DELETE" });
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return { rows, loading, error, submitting, fetchRows, createRow, updateRow, deleteRow };
}

// ---------- Page header ----------

export function PageHeader({ title, subtitle, icon, actions }: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-11 h-11 rounded-xl bg-kauvex-orange/10 text-kauvex-orange flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-kauvex-navy">{title}</h1>
          {subtitle && <p className="text-sm text-text-3 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ---------- Stat card ----------

export function StatCard({ label, value, icon, hint }: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-4 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-text-3">{label}</p>
        <p className="text-2xl font-bold text-kauvex-navy mt-1">{value}</p>
        {hint && <p className="text-[11px] text-text-3 mt-1">{hint}</p>}
      </div>
      {icon && <div className="w-9 h-9 rounded-lg bg-kauvex-navy/5 text-kauvex-orange flex items-center justify-center">{icon}</div>}
    </div>
  );
}

// ---------- Status badge ----------

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-xs text-text-3">—</span>;
  const style = BOS_STATUS_STYLES[status] ?? BOS_STATUS_STYLES[status.toLowerCase()] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold", style.cls)}>
      {style.label}
    </span>
  );
}

// ---------- Modal ----------

export function Modal({ open, onClose, title, children, wide }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 lg:p-10">
      <div className={cn("w-full rounded-xl bg-white shadow-xl", wide ? "max-w-3xl" : "max-w-lg")}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-kauvex-navy">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-text-3 hover:text-kauvex-navy rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ---------- Form field ----------

export function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-2 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export const inputCls = "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-kauvex-navy placeholder:text-text-3/70 focus:outline-none focus:ring-2 focus:ring-kauvex-orange/40 focus:border-kauvex-orange";
export const selectCls = inputCls;
export const btnPrimary = "inline-flex items-center gap-2 rounded-lg bg-kauvex-orange px-4 py-2 text-sm font-semibold text-white hover:bg-kauvex-orange/90 transition-colors";
export const btnSecondary = "inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-kauvex-navy hover:bg-gray-50 transition-colors";

// ---------- Table ----------

export function DataTable<T extends { id: string }>({ columns, rows, loading, onEdit, empty }: {
  columns: { header: string; render: (row: T) => ReactNode }[];
  rows: T[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  empty?: string;
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-border p-10 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-kauvex-orange animate-spin" />
        <p className="text-sm text-text-3">Loading...</p>
      </div>
    );
  }
  if (!rows.length) {
    return (
      <div className="bg-white rounded-xl border border-border p-10 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-kauvex-navy/5 flex items-center justify-center">
          <Inbox className="w-5 h-5 text-text-3" />
        </div>
        <p className="text-sm text-text-3">{empty ?? "No records yet"}</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50/70">
              {columns.map((c, i) => (
                <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-text-3 whitespace-nowrap">
                  {c.header}
                </th>
              ))}
              {onEdit && <th className="px-4 py-3 text-right text-xs font-semibold text-text-3">Action</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-gray-50/60 transition-colors">
                {columns.map((c, i) => (
                  <td key={i} className="px-4 py-3 text-text-2 align-middle">{c.render(row)}</td>
                ))}
                {onEdit && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onEdit(row)} className="text-xs font-semibold text-kauvex-orange hover:underline">
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Search + new button row ----------

export function Toolbar({ onSearch, onNew, newLabel }: { onSearch?: (q: string) => void; onNew?: () => void; newLabel?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {onSearch && (
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
          <input
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search..."
            className={cn(inputCls, "pl-9")}
          />
        </div>
      )}
      <div className="ml-auto" />
      {onNew && (
        <button onClick={onNew} className={btnPrimary}>
          <Plus className="w-4 h-4" /> {newLabel ?? "New"}
        </button>
      )}
    </div>
  );
}

// ---------- Currency / date formatters ----------

export function fmtMoney(v?: number | string | null, currency = "NGN") {
  const n = Number(v || 0);
  if (currency === "NGN") return `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
  if (currency === "USD") return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (currency === "GBP") return `£${n.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${currency}`;
}

export function fmtDate(v?: string | null) {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function initials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}
