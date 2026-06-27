"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Settings,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Save,
  Eye,
} from "lucide-react";

interface SurchargeRule {
  id: string;
  name: string;
  origin: string;
  destination: string;
  tier: string;
  baselinePrice: number;
  formula: string;
  cap: number;
  minThreshold: number;
  partnerShare: number;
  active: boolean;
}

interface RoutePreview {
  route: string;
  currentFuelPrice: number;
  surchargeAmount: number;
}

const emptyRule: Omit<SurchargeRule, "id"> = {
  name: "",
  origin: "",
  destination: "",
  tier: "TIER_2_DOMESTIC_FREIGHT",
  baselinePrice: 0,
  formula: "((price - baseline) / baseline) * 100",
  cap: 0,
  minThreshold: 0,
  partnerShare: 50,
  active: true,
};

export default function SurchargeRulesPage() {
  const [rules, setRules] = useState<SurchargeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalEnabled, setGlobalEnabled] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyRule);
  const [saving, setSaving] = useState(false);

  const [preview, setPreview] = useState<RoutePreview[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/fuel/surcharge/rules");
        if (!res.ok) throw new Error("Failed to fetch rules");
        const data = await res.json();
        setRules(data.rules || []);
        setGlobalEnabled(data.globalEnabled !== false);
        setPreview(data.preview || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyRule);
    setShowModal(true);
  }

  function openEdit(rule: SurchargeRule) {
    setEditingId(rule.id);
    setForm({ ...rule });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/v1/fuel/surcharge/rules/${editingId}` : "/api/v1/fuel/surcharge/rules";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      if (editingId) {
        setRules((prev) => prev.map((r) => (r.id === editingId ? { ...form, id: editingId } : r)));
      } else {
        setRules((prev) => [...prev, { ...form, id: data.rule?.id || Date.now().toString() }]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this rule?")) return;
    try {
      const res = await fetch(`/api/v1/fuel/surcharge/rules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete error");
    }
  }

  async function toggleGlobal() {
    const newState = !globalEnabled;
    try {
      const res = await fetch("/api/v1/fuel/surcharge/rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ globalEnabled: newState }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      setGlobalEnabled(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Toggle error");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#FF6B00" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-[#FF6B00] text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628]">Surcharge Rules</h1>
            <p className="text-gray-600 mt-1">Create and manage fuel surcharge rules</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleGlobal} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium">
              {globalEnabled ? (
                <ToggleRight className="w-5 h-5 text-green-500" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              )}
              {globalEnabled ? "Surcharges Active" : "Surcharges Disabled"}
            </button>
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-[#e55f00] transition-colors">
              <Plus className="w-4 h-4" /> Add Rule
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#FF6B00]" />
              All Rules
            </h2>
            {rules.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No surcharge rules created yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-500 font-medium">Name</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Route</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Tier</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Cap</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Partner %</th>
                      <th className="text-center py-2 text-gray-500 font-medium">Active</th>
                      <th className="text-center py-2 text-gray-500 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2.5 font-medium text-[#0A1628]">{rule.name}</td>
                        <td className="py-2.5 text-gray-600 text-xs">{rule.origin} → {rule.destination}</td>
                        <td className="py-2.5 text-gray-500 text-xs">{rule.tier}</td>
                        <td className="py-2.5 text-right">₦{rule.cap.toLocaleString()}</td>
                        <td className="py-2.5 text-right">{rule.partnerShare}%</td>
                        <td className="py-2.5 text-center">
                          <span className={`w-2 h-2 rounded-full inline-block ${rule.active ? "bg-green-500" : "bg-gray-300"}`} />
                        </td>
                        <td className="py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openEdit(rule)} className="p-1.5 hover:bg-gray-100 rounded-md">
                              <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                            <button onClick={() => handleDelete(rule.id)} className="p-1.5 hover:bg-red-50 rounded-md">
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#FF6B00]" />
              Route Preview
            </h2>
            {preview.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No preview data</p>
            ) : (
              <div className="space-y-3">
                {preview.map((p, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-[#0A1628]">{p.route}</p>
                        <p className="text-xs text-gray-500">Fuel: ₦{p.currentFuelPrice.toFixed(2)}/L</p>
                      </div>
                      <span className="text-sm font-semibold text-[#FF6B00]">
                        ₦{p.surchargeAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="font-semibold text-[#0A1628]">{editingId ? "Edit Rule" : "Create Rule"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                  <input
                    type="text"
                    value={form.origin}
                    onChange={(e) => setForm({ ...form, origin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                  <input
                    type="text"
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                  <select
                    value={form.tier}
                    onChange={(e) => setForm({ ...form, tier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                  >
                    <option value="TIER_1_LOCAL">Tier 1 — Local</option>
                    <option value="TIER_2_DOMESTIC_FREIGHT">Tier 2 — Domestic Freight</option>
                    <option value="TIER_3_INTERNATIONAL">Tier 3 — International</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Baseline Price (₦/L)</label>
                  <input
                    type="number"
                    value={form.baselinePrice}
                    onChange={(e) => setForm({ ...form, baselinePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                    min={0}
                    step={0.01}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
                <input
                  type="text"
                  value={form.formula}
                  onChange={(e) => setForm({ ...form, formula: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none font-mono text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cap (₦)</label>
                  <input
                    type="number"
                    value={form.cap}
                    onChange={(e) => setForm({ ...form, cap: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Threshold (₦)</label>
                  <input
                    type="number"
                    value={form.minThreshold}
                    onChange={(e) => setForm({ ...form, minThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                    min={0}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner Share (%)</label>
                <input
                  type="number"
                  value={form.partnerShare}
                  onChange={(e) => setForm({ ...form, partnerShare: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                  min={0}
                  max={100}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 text-[#FF6B00] rounded"
                />
                <label htmlFor="active" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[#FF6B00] text-white rounded-lg hover:bg-[#e55f00] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
