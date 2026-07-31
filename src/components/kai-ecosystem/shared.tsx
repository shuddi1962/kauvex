"use client";

import { useCallback, useEffect, useState } from "react";

export function useKaiResource(endpoint: string) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/kai-ecosystem/${endpoint}`);
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
      const res = await fetch(`/api/v1/kai-ecosystem/${endpoint}`, {
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
      const res = await fetch(`/api/v1/kai-ecosystem/${endpoint}/${id}`, {
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
    const res = await fetch(`/api/v1/kai-ecosystem/${endpoint}/${id}`, { method: "DELETE" });
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return { rows, loading, error, submitting, fetchRows, createRow, updateRow, deleteRow };
}

export { PageHeader, StatCard, StatusBadge, Modal, Field, DataTable, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, fmtMoney, initials } from "@/components/business-os/shared";
