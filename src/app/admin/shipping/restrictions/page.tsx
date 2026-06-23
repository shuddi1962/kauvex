"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Plus, Search, Loader2, X, ToggleLeft, ToggleRight,
} from "lucide-react";

interface RestrictedItem {
  id: string;
  item_description: string;
  restriction_type: string;
  country_code: string | null;
  restriction_level: string;
  reason: string | null;
  is_active: boolean;
  created_at: string;
}

const typeColors: Record<string, string> = {
  global: "bg-red-50 text-red",
  country_specific: "bg-orange-50 text-orange",
};

const levelColors: Record<string, string> = {
  soft_warning: "bg-yellow-50 text-yellow-700",
  hard_block: "bg-red-50 text-red",
};

export default function RestrictedItemsPage() {
  const [items, setItems] = useState<RestrictedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RestrictedItem | null>(null);
  const [form, setForm] = useState({
    item_description: "",
    restriction_type: "global",
    country_code: "",
    restriction_level: "hard_block",
    reason: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const { data } = await insforge
        .database
        .from("kv_ship_restricted_items")
        .select("*")
        .order("item_description");
      if (data) setItems(data);
    } catch (e) {
      console.error("Failed to load restricted items:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const filtered = search
    ? items.filter(
        (i) =>
          i.item_description.toLowerCase().includes(search.toLowerCase()) ||
          (i.reason || "").toLowerCase().includes(search.toLowerCase())
      )
    : items;

  const openCreate = () => {
    setEditing(null);
    setForm({
      item_description: "",
      restriction_type: "global",
      country_code: "",
      restriction_level: "hard_block",
      reason: "",
      is_active: true,
    });
    setShowModal(true);
  };

  const openEdit = (i: RestrictedItem) => {
    setEditing(i);
    setForm({
      item_description: i.item_description,
      restriction_type: i.restriction_type,
      country_code: i.country_code || "",
      restriction_level: i.restriction_level,
      reason: i.reason || "",
      is_active: i.is_active,
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.item_description.trim()) return;
    setSaving(true);
    const payload = {
      item_description: form.item_description.trim(),
      restriction_type: form.restriction_type,
      country_code: form.restriction_type === "global" ? null : form.country_code.trim() || null,
      restriction_level: form.restriction_level,
      reason: form.reason.trim() || null,
      is_active: form.is_active,
    };
    try {
      if (editing) {
        await insforge
          .database
          .from("kv_ship_restricted_items")
          .update(payload)
          .eq("id", editing.id);
        setItems((prev) =>
          prev.map((i) => (i.id === editing.id ? { ...i, ...payload } : i))
        );
      } else {
        const { data } = await insforge
          .database
          .from("kv_ship_restricted_items")
          .insert(payload)
          .select("*");
        if (data?.[0]) setItems((prev) => [...prev, data[0]]);
      }
      setShowModal(false);
    } catch (e) {
      console.error("Failed to save restricted item:", e);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: RestrictedItem) => {
    const next = !item.is_active;
    try {
      await insforge
        .database
        .from("kv_ship_restricted_items")
        .update({ is_active: next })
        .eq("id", item.id);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: next } : i))
      );
    } catch (e) {
      console.error("Failed to toggle:", e);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Restricted Items" subtitle="Manage globally and country-specific restricted shipping items">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Restricted Items" subtitle="Manage globally and country-specific restricted shipping items">
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by item or reason..."
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue/20"
          />
        </div>
        <button
          onClick={openCreate}
          className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={14} /> Add Restricted Item
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Item</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Type</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Country</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Level</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Reason</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Active</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-text-4">No restricted items found</td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="p-3 text-sm font-semibold text-text-1">{item.item_description}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                        typeColors[item.restriction_type] || "bg-gray-100 text-text-4"
                      }`}
                    >
                      {item.restriction_type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-text-3">
                    {item.restriction_type === "global" ? (
                      <span className="font-medium text-text-2">All Countries</span>
                    ) : (
                      item.country_code || "\u2014"
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                        levelColors[item.restriction_level] || "bg-gray-100 text-text-4"
                      }`}
                    >
                      {item.restriction_level.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-text-3 max-w-[200px] truncate">{item.reason || "\u2014"}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => toggleActive(item)} className="inline-flex items-center gap-1">
                      {item.is_active ? (
                        <ToggleRight size={20} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={20} className="text-text-4" />
                      )}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => openEdit(item)}
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
              <h3 className="font-semibold text-lg">{editing ? "Edit Restricted Item" : "Add Restricted Item"}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-4 hover:text-text-2"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-2 mb-1.5">Item Description *</label>
                <input
                  value={form.item_description}
                  onChange={(e) => setForm({ ...form, item_description: e.target.value })}
                  placeholder="e.g. Lithium-ion batteries"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Restriction Type</label>
                  <select
                    value={form.restriction_type}
                    onChange={(e) => setForm({ ...form, restriction_type: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  >
                    <option value="global">Global</option>
                    <option value="country_specific">Country Specific</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Restriction Level</label>
                  <select
                    value={form.restriction_level}
                    onChange={(e) => setForm({ ...form, restriction_level: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  >
                    <option value="soft_warning">Soft Warning</option>
                    <option value="hard_block">Hard Block</option>
                  </select>
                </div>
              </div>
              {form.restriction_type === "country_specific" && (
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Country Code</label>
                  <input
                    value={form.country_code}
                    onChange={(e) => setForm({ ...form, country_code: e.target.value })}
                    placeholder="e.g. NG, US, GB"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-2 mb-1.5">Reason</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Why is this item restricted?"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-text-2">Active</label>
                <button
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      form.is_active ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
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
                disabled={saving || !form.item_description.trim()}
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
