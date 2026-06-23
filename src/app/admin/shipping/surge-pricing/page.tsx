"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Plus, Search, Loader2, X, ToggleLeft, ToggleRight, Clock,
} from "lucide-react";

interface SurgePeriod {
  id: string;
  name: string;
  start_datetime: string;
  end_datetime: string;
  surge_multiplier: number;
  applicable_tiers: string[];
  applicable_regions: string[];
  is_active: boolean;
  created_at: string;
}

const tierOptions = ["economy", "standard", "express", "same_day"];

function isCurrentlyActive(period: SurgePeriod): boolean {
  if (!period.is_active) return false;
  const now = new Date();
  const start = new Date(period.start_datetime);
  const end = new Date(period.end_datetime);
  return now >= start && now <= end;
}

export default function SurgePricingPage() {
  const [periods, setPeriods] = useState<SurgePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SurgePeriod | null>(null);
  const [form, setForm] = useState({
    name: "",
    start_datetime: "",
    end_datetime: "",
    surge_multiplier: "1.5",
    applicable_tiers: [] as string[],
    applicable_regions: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const loadPeriods = useCallback(async () => {
    try {
      const { data } = await insforge
        .database
        .from("kv_ship_surge_periods")
        .select("*")
        .order("start_datetime", { ascending: false });
      if (data) setPeriods(data);
    } catch (e) {
      console.error("Failed to load surge periods:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPeriods(); }, [loadPeriods]);

  const filtered = search
    ? periods.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : periods;

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      start_datetime: "",
      end_datetime: "",
      surge_multiplier: "1.5",
      applicable_tiers: [],
      applicable_regions: "",
      is_active: true,
    });
    setShowModal(true);
  };

  const openEdit = (p: SurgePeriod) => {
    setEditing(p);
    setForm({
      name: p.name,
      start_datetime: p.start_datetime.slice(0, 16),
      end_datetime: p.end_datetime.slice(0, 16),
      surge_multiplier: String(p.surge_multiplier),
      applicable_tiers: p.applicable_tiers || [],
      applicable_regions: (p.applicable_regions || []).join(", "),
      is_active: p.is_active,
    });
    setShowModal(true);
  };

  const toggleTier = (tier: string) => {
    setForm((prev) => ({
      ...prev,
      applicable_tiers: prev.applicable_tiers.includes(tier)
        ? prev.applicable_tiers.filter((t) => t !== tier)
        : [...prev.applicable_tiers, tier],
    }));
  };

  const save = async () => {
    if (!form.name.trim() || !form.start_datetime || !form.end_datetime) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      start_datetime: new Date(form.start_datetime).toISOString(),
      end_datetime: new Date(form.end_datetime).toISOString(),
      surge_multiplier: parseFloat(form.surge_multiplier) || 1.5,
      applicable_tiers: form.applicable_tiers,
      applicable_regions: form.applicable_regions
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean),
      is_active: form.is_active,
    };
    try {
      if (editing) {
        await insforge
          .database
          .from("kv_ship_surge_periods")
          .update(payload)
          .eq("id", editing.id);
        setPeriods((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...payload } : p))
        );
      } else {
        const { data } = await insforge
          .database
          .from("kv_ship_surge_periods")
          .insert(payload)
          .select("*");
        if (data?.[0]) setPeriods((prev) => [data[0], ...prev]);
      }
      setShowModal(false);
    } catch (e) {
      console.error("Failed to save surge period:", e);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (period: SurgePeriod) => {
    const next = !period.is_active;
    try {
      await insforge
        .database
        .from("kv_ship_surge_periods")
        .update({ is_active: next })
        .eq("id", period.id);
      setPeriods((prev) =>
        prev.map((p) => (p.id === period.id ? { ...p, is_active: next } : p))
      );
    } catch (e) {
      console.error("Failed to toggle:", e);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Surge Pricing" subtitle="Configure peak-time shipping surge multipliers">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Surge Pricing" subtitle="Configure peak-time shipping surge multipliers">
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue/20"
          />
        </div>
        <button
          onClick={openCreate}
          className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={14} /> Create Surge Period
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Name</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Start</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">End</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Multiplier</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Tiers</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Regions</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Active</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-sm text-text-4">No surge periods configured</td>
              </tr>
            ) : (
              filtered.map((period) => {
                const nowActive = isCurrentlyActive(period);
                return (
                  <tr
                    key={period.id}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                      nowActive ? "bg-green-50" : ""
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {nowActive && <Clock size={13} className="text-green-600" />}
                        <span className="text-sm font-semibold text-text-1">{period.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-text-3">
                      {new Date(period.start_datetime).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm text-text-3">
                      {new Date(period.end_datetime).toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-sm font-bold text-orange">{period.surge_multiplier}x</span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {(period.applicable_tiers || []).map((tier) => (
                          <span
                            key={tier}
                            className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue rounded-full font-medium capitalize"
                          >
                            {tier.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-text-3 max-w-[160px] truncate">
                      {(period.applicable_regions || []).join(", ") || "\u2014"}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          period.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-text-4"
                        }`}
                      >
                        {period.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleActive(period)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                          {period.is_active ? (
                            <ToggleRight size={16} className="text-green-600" />
                          ) : (
                            <ToggleLeft size={16} className="text-text-4" />
                          )}
                        </button>
                        <button onClick={() => openEdit(period)} className="text-xs text-blue font-semibold hover:underline">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-[520px] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">{editing ? "Edit Surge Period" : "Create Surge Period"}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-4 hover:text-text-2"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-2 mb-1.5">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Black Friday 2026"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Start Date/Time *</label>
                  <input
                    type="datetime-local"
                    value={form.start_datetime}
                    onChange={(e) => setForm({ ...form, start_datetime: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">End Date/Time *</label>
                  <input
                    type="datetime-local"
                    value={form.end_datetime}
                    onChange={(e) => setForm({ ...form, end_datetime: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-2 mb-1.5">Surge Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={form.surge_multiplier}
                  onChange={(e) => setForm({ ...form, surge_multiplier: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-2 mb-1.5">Applicable Tiers</label>
                <div className="flex flex-wrap gap-2">
                  {tierOptions.map((tier) => (
                    <button
                      key={tier}
                      onClick={() => toggleTier(tier)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-all ${
                        form.applicable_tiers.includes(tier)
                          ? "border-blue bg-blue-50 text-blue"
                          : "border-gray-200 text-text-3 hover:border-gray-300"
                      }`}
                    >
                      {tier.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-2 mb-1.5">Applicable Regions</label>
                <input
                  value={form.applicable_regions}
                  onChange={(e) => setForm({ ...form, applicable_regions: e.target.value })}
                  placeholder="e.g. NG, US, GB (comma-separated)"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
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
                disabled={
                  saving || !form.name.trim() || !form.start_datetime || !form.end_datetime
                }
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
