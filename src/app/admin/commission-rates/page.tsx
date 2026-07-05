"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Search, Percent, Save, AlertCircle, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";

interface CommissionItem {
  id: string;
  name: string;
  slug: string;
  type: "category" | "subcategory";
  commissionRate: number | null;
  parentId: string | null;
  parentName: string | null;
  productCount: number;
}

export default function CommissionRatesPage() {
  const [items, setItems] = useState<CommissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [rates, setRates] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/commission-rates");
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch {
      setNotification({ type: "error", message: "Failed to load" });
    } finally {
      setLoading(false);
    }
  }

  const categories = items.filter((i) => i.type === "category");
  const subcategories = items.filter((i) => i.type === "subcategory");

  function getRate(id: string): string {
    if (rates[id] !== undefined) return rates[id];
    const item = items.find((i) => i.id === id);
    return String(item?.commissionRate ?? "");
  }

  function setRate(id: string, val: string) {
    setRates((prev) => ({ ...prev, [id]: val }));
  }

  function hasChange(id: string): boolean {
    const item = items.find((i) => i.id === id);
    if (!item) return false;
    const original = String(item.commissionRate ?? "");
    return rates[id] !== undefined && rates[id] !== original;
  }

  async function handleSave(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const val = parseFloat(rates[id]);
    if (isNaN(val) || val < 0 || val > 100) {
      setNotification({ type: "error", message: "Rate must be between 0 and 100" });
      return;
    }
    setSaving(id);
    try {
      const res = await fetch("/api/v1/admin/commission-rates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: item.type, commissionRate: val }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, commissionRate: val } : i))
      );
      setRates((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setNotification({ type: "success", message: `${item.name}: ${val}% saved` });
    } catch {
      setNotification({ type: "error", message: "Failed to save" });
    } finally {
      setSaving(null);
    }
  }

  async function handleSaveAll() {
    const dirty = items.filter((i) => hasChange(i.id));
    if (dirty.length === 0) return;
    for (const item of dirty) {
      await handleSave(item.id);
    }
  }

  function getRateColor(val: number | null | undefined): string {
    const r = val ?? 12;
    if (r >= 20) return "text-red-600";
    if (r >= 15) return "text-orange";
    if (r >= 10) return "text-amber-600";
    return "text-green-600";
  }

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      subcategories.some(
        (s) => s.parentId === c.id && s.name.toLowerCase().includes(search.toLowerCase())
      )
  );

  const dirtyCount = items.filter((i) => hasChange(i.id)).length;
  const dirtyCatCount = categories.filter((i) => hasChange(i.id)).length;
  const dirtySubCount = subcategories.filter((i) => hasChange(i.id)).length;

  const totalItems = items.length;
  const totalCats = categories.length;
  const totalSubs = subcategories.length;

  const avgRate =
    items.length > 0
      ? Math.round(items.reduce((s, i) => s + (i.commissionRate ?? 12), 0) / items.length)
      : 0;

  return (
    <AdminShell
      title="Commission Rates"
      subtitle="Set category & subcategory commission rates — like Amazon, each product category has its own rate"
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
            <button className="ml-auto font-bold text-lg leading-none" onClick={() => setNotification(null)}>
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-4 font-medium uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-navy mt-1">{totalItems}</p>
            <p className="text-[10px] text-text-4">{totalCats} categories · {totalSubs} subcategories</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-4 font-medium uppercase tracking-wide">Average Rate</p>
            <p className="text-2xl font-bold text-navy mt-1">{avgRate}%</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-4 font-medium uppercase tracking-wide">Unsaved Changes</p>
            <p className={`text-2xl font-bold mt-1 ${dirtyCount > 0 ? "text-orange" : "text-green-600"}`}>
              {dirtyCount}
            </p>
            <p className="text-[10px] text-text-4">
              {dirtyCatCount} categories · {dirtySubCount} subcategories
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs text-text-4 font-medium uppercase tracking-wide">Target Blend</p>
            <p className="text-2xl font-bold text-orange mt-1">15-20%</p>
            <p className="text-[10px] text-text-4">Amazon-style take rate</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories or subcategories..."
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-orange"
              />
            </div>
            {dirtyCount > 0 && (
              <button
                onClick={handleSaveAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange text-white text-xs font-semibold rounded-lg hover:bg-orange/90"
              >
                <Save size={13} />
                Save All ({dirtyCount})
              </button>
            )}
            <p className="text-xs text-text-4 ml-auto">{filteredCategories.length} categories</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-text-4 text-xs uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-text-4 text-xs uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-text-4 text-xs uppercase tracking-wider w-[180px]">
                    Commission Rate
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-text-4 text-xs uppercase tracking-wider w-[100px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-text-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-orange border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-text-4">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => {
                    const catSubs = subcategories.filter((s) => s.parentId === cat.id);
                    const isExpanded = expanded[cat.id] !== false;
                    const catRate = rates[cat.id] !== undefined ? rates[cat.id] : String(cat.commissionRate ?? "");
                    const catChanged = hasChange(cat.id);
                    const subChanged = catSubs.some((s) => hasChange(s.id));

                    return (
                      <tr key={cat.id} className={`hover:bg-gray-50/50 ${catChanged || subChanged ? "bg-orange-50/20" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {catSubs.length > 0 && (
                              <button
                                onClick={() => setExpanded((p) => ({ ...p, [cat.id]: !isExpanded }))}
                                className="p-0.5 hover:bg-gray-100 rounded"
                              >
                                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              </button>
                            )}
                            {catSubs.length === 0 && <div className="w-4" />}
                            <span className="font-semibold text-text-1">{cat.name}</span>
                          </div>
                          {isExpanded &&
                            catSubs.map((sub) => {
                              const subRate = rates[sub.id] !== undefined ? rates[sub.id] : String(sub.commissionRate ?? "");
                              const subChanged2 = hasChange(sub.id);
                              return (
                                <div
                                  key={sub.id}
                                  className={`flex items-center gap-2 pl-8 mt-1.5 py-1.5 rounded ${
                                    subChanged2 ? "bg-orange-50" : ""
                                  }`}
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-text-4 shrink-0" />
                                  <span className="text-text-4 text-xs">{sub.name}</span>
                                  <span className="ml-auto flex items-center gap-1">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      step={0.5}
                                      value={subRate}
                                      onChange={(e) => setRate(sub.id, e.target.value)}
                                      onBlur={() => {
                                        if (hasChange(sub.id)) handleSave(sub.id);
                                      }}
                                      className={`w-16 text-center px-1 py-0.5 border rounded text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange/20 ${getRateColor(
                                        parseFloat(subRate) || null
                                      )} ${subChanged2 ? "border-orange bg-orange-50" : "border-border"}`}
                                    />
                                    <Percent size={10} className="text-text-4 shrink-0" />
                                    {subChanged2 && (
                                      <button
                                        onClick={() => handleSave(sub.id)}
                                        disabled={saving === sub.id}
                                        className="p-1 bg-orange text-white rounded hover:bg-orange/90 disabled:opacity-50"
                                      >
                                        {saving === sub.id ? (
                                          <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <Save size={10} />
                                        )}
                                      </button>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            Category
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.5}
                              value={catRate}
                              onChange={(e) => setRate(cat.id, e.target.value)}
                              onBlur={() => {
                                if (hasChange(cat.id)) handleSave(cat.id);
                              }}
                              className={`w-20 text-center px-2 py-1.5 border rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange/20 ${getRateColor(
                                parseFloat(catRate) || null
                              )} ${catChanged ? "border-orange bg-orange-50" : "border-border"}`}
                            />
                            <Percent size={12} className="text-text-4 shrink-0" />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {catChanged && (
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
          <h3 className="font-semibold text-sm text-text-1 mb-2">How Commission Resolution Works</h3>
          <ol className="text-xs text-text-4 space-y-1.5 list-decimal list-inside">
            <li>Check subcategory commission rate (if product has a subcategory)</li>
            <li>Check category commission rate</li>
            <li>Check parent category commission rate</li>
            <li>Fall back to vendor-level commission rate</li>
            <li>Final fallback: platform default <strong>12%</strong></li>
          </ol>
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-text-4">
              <strong className="text-orange">Target blended take rate: 15-20%</strong>
              <br />
              Benchmark: Amazon Electronics 8% · Fashion 15% · Jewelry 20% · Digital 20% · Grocery 5%
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
