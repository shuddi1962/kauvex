"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Search, Percent, Save, AlertCircle, CheckCircle } from "lucide-react";

interface CategoryRate {
  id: string;
  name: string;
  slug: string;
  commissionRate: number | null;
  parentName?: string | null;
  productCount?: number;
}

export default function CommissionRatesPage() {
  const [categories, setCategories] = useState<CategoryRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [edited, setEdited] = useState<Record<string, number>>({});
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/commission-rates");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch {
      setNotification({ type: "error", message: "Failed to load categories" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(categoryId: string) {
    if (edited[categoryId] === undefined) return;
    setSaving(categoryId);
    try {
      const res = await fetch("/api/v1/admin/commission-rates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          commissionRate: edited[categoryId],
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId ? { ...c, commissionRate: edited[categoryId] } : c
        )
      );
      setEdited((prev) => {
        const next = { ...prev };
        delete next[categoryId];
        return next;
      });
      setNotification({ type: "success", message: "Commission rate updated" });
    } catch {
      setNotification({ type: "error", message: "Failed to save" });
    } finally {
      setSaving(null);
    }
  }

  function getDisplayRate(cat: CategoryRate): number {
    return edited[cat.id] ?? cat.commissionRate ?? 12;
  }

  function getRateColor(rate: number): string {
    if (rate >= 20) return "text-red-600";
    if (rate >= 15) return "text-orange";
    if (rate >= 10) return "text-amber-600";
    return "text-green-600";
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.parentName?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    avg: categories.length > 0
      ? Math.round(categories.reduce((s, c) => s + (c.commissionRate ?? 12), 0) / categories.length)
      : 0,
    max: categories.length > 0
      ? Math.max(...categories.map((c) => c.commissionRate ?? 0))
      : 0,
    min: categories.length > 0
      ? Math.min(...categories.map((c) => c.commissionRate ?? 12))
      : 0,
  };

  return (
    <AdminShell
      title="Commission Rates"
      subtitle="Set category-based marketplace commission rates like Amazon — rates apply to vendor sales in each category"
    >
      <div className="space-y-6">
        {notification && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
              notification.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {notification.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {notification.message}
            <button className="ml-auto font-medium" onClick={() => setNotification(null)}>×</button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-4 font-medium uppercase tracking-wide">Average Rate</p>
            <p className="text-2xl font-bold text-navy mt-1">{stats.avg}%</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-4 font-medium uppercase tracking-wide">Highest Rate</p>
            <p className="text-2xl font-bold text-orange mt-1">{stats.max}%</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-4 font-medium uppercase tracking-wide">Lowest Rate</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.min}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-orange"
              />
            </div>
            <p className="text-xs text-text-4 ml-auto">{filtered.length} categories</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-text-4 text-xs uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-4 text-xs uppercase tracking-wider">Parent</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-4 text-xs uppercase tracking-wider">Products</th>
                  <th className="text-center px-4 py-3 font-semibold text-text-4 text-xs uppercase tracking-wider">Commission Rate</th>
                  <th className="text-center px-4 py-3 font-semibold text-text-4 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-text-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-orange border-t-transparent rounded-full animate-spin" />
                        Loading categories...
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-text-4">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  filtered.map((cat) => {
                    const rate = getDisplayRate(cat);
                    const hasChanges = edited[cat.id] !== undefined;
                    return (
                      <tr key={cat.id} className={`hover:bg-gray-50/50 ${hasChanges ? "bg-orange-50/30" : ""}`}>
                        <td className="px-4 py-3 font-medium text-text-1">{cat.name}</td>
                        <td className="px-4 py-3 text-text-4">{cat.parentName || "-"}</td>
                        <td className="px-4 py-3 text-text-4">{cat.productCount ?? 0}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Percent size={12} className="text-text-4" />
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.5}
                              value={rate}
                              onChange={(e) =>
                                setEdited((prev) => ({
                                  ...prev,
                                  [cat.id]: parseFloat(e.target.value) || 0,
                                }))
                              }
                              className={`w-20 text-center px-2 py-1.5 border rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange/20 ${getRateColor(rate)} ${
                                hasChanges ? "border-orange bg-orange-50" : "border-border"
                              }`}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasChanges && (
                            <button
                              onClick={() => handleSave(cat.id)}
                              disabled={saving === cat.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange text-white text-xs font-semibold rounded-lg hover:bg-orange/90 disabled:opacity-50"
                            >
                              {saving === cat.id ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Save size={12} />
                              )}
                              Save
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-sm text-text-1 mb-2">How Category-Based Commission Works</h3>
          <ul className="text-xs text-text-4 space-y-1.5">
            <li>• When an order is placed, the system checks the product&apos;s category for a commission rate.</li>
            <li>• If the category has no rate set, it checks the parent category.</li>
            <li>• If no category rate is found, the vendor&apos;s default commission rate is used.</li>
            <li>• The final fallback is the platform default rate of 12%.</li>
            <li className="font-medium text-orange mt-2">
              ⚡ Target blended take rate: 15-20% (Amazon: Electronics 8%, Fashion 15%, Jewelry 20%)
            </li>
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
