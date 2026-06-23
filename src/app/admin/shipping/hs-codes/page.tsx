"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Plus, Search, Loader2, X, FileUp, Download,
} from "lucide-react";

interface HsCode {
  id: string;
  hs_code: string;
  description: string | null;
  category_id: string | null;
  product_id: string | null;
  notes: string | null;
  created_at: string;
}

export default function HsCodesPage() {
  const [codes, setCodes] = useState<HsCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<HsCode | null>(null);
  const [form, setForm] = useState({
    hs_code: "",
    description: "",
    category_id: "",
    product_id: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const loadCodes = useCallback(async () => {
    try {
      const { data } = await insforge
        .database
        .from("kv_ship_hs_codes")
        .select("*")
        .order("hs_code", { ascending: sortDir === "asc" });
      if (data) setCodes(data);
    } catch (e) {
      console.error("Failed to load HS codes:", e);
    } finally {
      setLoading(false);
    }
  }, [sortDir]);

  useEffect(() => { loadCodes(); }, [loadCodes]);

  const filtered = search
    ? codes.filter(
        (c) =>
          c.hs_code.toLowerCase().includes(search.toLowerCase()) ||
          (c.description || "").toLowerCase().includes(search.toLowerCase())
      )
    : codes;

  const openCreate = () => {
    setEditing(null);
    setForm({ hs_code: "", description: "", category_id: "", product_id: "", notes: "" });
    setShowModal(true);
  };

  const openEdit = (c: HsCode) => {
    setEditing(c);
    setForm({
      hs_code: c.hs_code,
      description: c.description || "",
      category_id: c.category_id || "",
      product_id: c.product_id || "",
      notes: c.notes || "",
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.hs_code.trim()) return;
    setSaving(true);
    const payload = {
      hs_code: form.hs_code.trim(),
      description: form.description.trim() || null,
      category_id: form.category_id.trim() || null,
      product_id: form.product_id.trim() || null,
      notes: form.notes.trim() || null,
    };
    try {
      if (editing) {
        await insforge
          .database
          .from("kv_ship_hs_codes")
          .update(payload)
          .eq("id", editing.id);
        setCodes((prev) =>
          prev.map((c) => (c.id === editing.id ? { ...c, ...payload } : c))
        );
      } else {
        const { data } = await insforge
          .database
          .from("kv_ship_hs_codes")
          .insert(payload)
          .select("*");
        if (data?.[0]) setCodes((prev) => [...prev, data[0]]);
      }
      setShowModal(false);
    } catch (e) {
      console.error("Failed to save HS code:", e);
    } finally {
      setSaving(false);
    }
  };

  const toggleSort = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));

  if (loading) {
    return (
      <AdminShell title="HS Codes" subtitle="Harmonized System codes for international shipping">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="HS Codes" subtitle="Harmonized System codes for international shipping">
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by HS code or description..."
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue/20"
          />
        </div>
        <button
          onClick={() => alert("CSV import coming soon")}
          className="h-9 px-4 border border-gray-200 text-text-3 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <FileUp size={14} /> Bulk Import
        </button>
        <button
          onClick={() => alert("Export functionality coming soon")}
          className="h-9 px-4 border border-gray-200 text-text-3 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <Download size={14} /> Export
        </button>
        <button
          onClick={openCreate}
          className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={14} /> Add HS Code
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">
                <button onClick={toggleSort} className="flex items-center gap-1 hover:text-text-2">
                  HS Code {sortDir === "asc" ? "\u2191" : "\u2193"}
                </button>
              </th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Description</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Category ID</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Product ID</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Notes</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-text-4">No HS codes found</td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="p-3">
                    <span className="text-sm font-mono font-semibold text-text-1">{c.hs_code}</span>
                  </td>
                  <td className="p-3 text-sm text-text-2 max-w-[240px] truncate">{c.description || "\u2014"}</td>
                  <td className="p-3 text-xs font-mono text-text-4">{c.category_id ? c.category_id.substring(0, 8) + "..." : "\u2014"}</td>
                  <td className="p-3 text-xs font-mono text-text-4">{c.product_id ? c.product_id.substring(0, 8) + "..." : "\u2014"}</td>
                  <td className="p-3 text-sm text-text-3 max-w-[200px] truncate">{c.notes || "\u2014"}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => openEdit(c)}
                      className="text-xs text-blue font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-[520px] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">{editing ? "Edit HS Code" : "Add HS Code"}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-4 hover:text-text-2"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-2 mb-1.5">HS Code *</label>
                <input
                  value={form.hs_code}
                  onChange={(e) => setForm({ ...form, hs_code: e.target.value })}
                  placeholder="e.g. 8471.30.0100"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-2 mb-1.5">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Product description for this HS code"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Category ID</label>
                  <input
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    placeholder="UUID"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Product ID</label>
                  <input
                    value={form.product_id}
                    onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                    placeholder="UUID"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-2 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-text-3 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !form.hs_code.trim()}
                className="flex-1 h-10 rounded-lg bg-blue text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
