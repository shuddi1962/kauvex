"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Bell, BellOff, Plus, Trash2, Save, Mail, MessageSquare,
  Package, AlertTriangle, Loader2, RefreshCw, Search,
} from "lucide-react";
import { insforge } from "@/lib/insforge";
import VendorShell from "@/components/vendor/vendor-shell";

interface AlertProduct {
  id: string;
  sku: string;
  name: string;
  currentQty: number;
  threshold: number;
  emailAlert: boolean;
  smsAlert: boolean;
}

const ALERTS_STORAGE_KEY = "kauvex_replenishment_alerts";

function loadLocalAlerts(): AlertProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAlerts(alerts: AlertProduct[]) {
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch {}
}

export default function ReplenishmentAlertsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<AlertProduct[]>([]);
  const [allProducts, setAllProducts] = useState<{ id: string; name: string; sku: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [newThreshold, setNewThreshold] = useState(10);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await insforge.auth.getCurrentUser();
      if (!user) { setLoading(false); return; }

      const [prodRes, invRes] = await Promise.all([
        insforge.database.from("products").select("id, name, sku, status").eq("vendor_id", user.id).order("name"),
        insforge.database.from("product_inventory").select("product_id, quantity, low_stock_threshold"),
      ]);

      if (prodRes.data) {
        setAllProducts(prodRes.data.map((p: any) => ({ id: p.id, name: p.name, sku: p.sku || "" })));
      }

      const localAlerts = loadLocalAlerts();
      const localIds = new Set(localAlerts.map(a => a.id));

      const dbAlerts: AlertProduct[] = [];
      if (prodRes.data && invRes.data) {
        for (const p of prodRes.data) {
          if (localIds.has(p.id)) continue;
          const inv = invRes.data.find((i: any) => i.product_id === p.id);
          if (inv && inv.low_stock_threshold != null && inv.low_stock_threshold > 0) {
            dbAlerts.push({
              id: p.id,
              sku: p.sku || "",
              name: p.name,
              currentQty: inv.quantity ?? 0,
              threshold: inv.low_stock_threshold,
              emailAlert: true,
              smsAlert: false,
            });
          }
        }
      }

      const merged = [...dbAlerts, ...localAlerts.filter(a => !dbAlerts.some(d => d.id === a.id))];
      setProducts(merged);
    } catch (e: any) {
      console.error("Fetch error:", e);
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const searchedProducts = searchTerm.trim()
    ? allProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10)
    : [];

  const addProduct = (product: { id: string; name: string; sku: string }) => {
    if (products.some(p => p.id === product.id)) {
      showToast("error", "Product already has an alert configured");
      return;
    }
    const newAlert: AlertProduct = {
      id: product.id,
      sku: product.sku,
      name: product.name,
      currentQty: 0,
      threshold: newThreshold,
      emailAlert: true,
      smsAlert: false,
    };
    const updated = [...products, newAlert];
    setProducts(updated);
    saveLocalAlerts(updated.filter(a => a.sku !== "" || true));
    setSearchTerm("");
    setShowSearchResults(false);
    showToast("success", "Product added to replenishment alerts");
  };

  const updateThreshold = (id: string, val: number) => {
    const updated = products.map(p => p.id === id ? { ...p, threshold: Math.max(0, val) } : p);
    setProducts(updated);
    saveLocalAlerts(updated);
  };

  const toggleEmail = (id: string) => {
    const updated = products.map(p => p.id === id ? { ...p, emailAlert: !p.emailAlert } : p);
    setProducts(updated);
    saveLocalAlerts(updated);
    showToast("success", "Email alert preference updated");
  };

  const toggleSms = (id: string) => {
    const updated = products.map(p => p.id === id ? { ...p, smsAlert: !p.smsAlert } : p);
    setProducts(updated);
    saveLocalAlerts(updated);
    showToast("success", "SMS alert preference updated");
  };

  const removeProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveLocalAlerts(updated);
    showToast("success", "Product removed from alerts");
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      for (const p of products) {
        const { error: err } = await insforge.database
          .from("product_inventory")
          .upsert({
            product_id: p.id,
            low_stock_threshold: p.threshold,
            quantity: p.currentQty,
            location_name: "default",
          }, { onConflict: "product_id, location_name" });

        if (err) console.error(`Failed to save threshold for ${p.name}:`, err);
      }

      saveLocalAlerts(products);
      showToast("success", "All thresholds saved to database");
    } catch (e: any) {
      showToast("error", e.message || "Failed to save thresholds");
    } finally {
      setSaving(false);
    }
  };

  const needsReplenishment = (product: AlertProduct) => product.currentQty <= product.threshold;

  if (loading) {
    return (
      <VendorShell title="Replenishment Alerts" subtitle="Set reorder thresholds and get notified when stock is low">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-orange" size={32} />
        </div>
      </VendorShell>
    );
  }

  if (error) {
    return (
      <VendorShell title="Replenishment Alerts" subtitle="Set reorder thresholds and get notified when stock is low">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle size={40} className="text-red-400 mb-3" />
          <p className="text-sm font-semibold text-text-1 mb-1">Failed to load data</p>
          <p className="text-xs text-text-4 mb-4">{error}</p>
          <button onClick={fetchData} className="flex items-center gap-1.5 px-4 h-9 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90 transition-colors">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </VendorShell>
    );
  }

  return (
    <VendorShell title="Replenishment Alerts" subtitle="Set reorder thresholds and get notified when stock is low">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-5">
        {/* Back link */}
        <Link href="/vendor/inventory" className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-4 hover:text-text-1 transition-colors">
          <ArrowLeft size={13} /> Back to Inventory
        </Link>

        {/* Add new product */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-bold text-sm text-text-1 mb-3">Add Product to Alerts</h3>
          <div className="flex items-end gap-3 relative">
            <div className="flex-1 relative">
              <label className="text-xs font-semibold text-text-2 block mb-1">Search Product</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setShowSearchResults(true); }}
                  onFocus={() => setShowSearchResults(true)}
                  placeholder="Search by product name or SKU..."
                  className="w-full h-10 pl-10 pr-4 text-sm border border-border rounded-lg" />
              </div>
              {showSearchResults && searchTerm.trim() && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {searchedProducts.length === 0 ? (
                    <div className="p-3 text-xs text-text-4 text-center">No products found</div>
                  ) : (
                    searchedProducts.map(p => (
                      <button key={p.id} onClick={() => addProduct(p)}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-text-1 hover:bg-gray-50 text-left transition-colors">
                        <Package size={13} className="text-text-4 shrink-0" />
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-[10px] text-text-4 font-mono">{p.sku}</p>
                        </div>
                        <Plus size={13} className="ml-auto text-orange shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="w-32">
              <label className="text-xs font-semibold text-text-2 block mb-1">Reorder Threshold</label>
              <input type="number" value={newThreshold} onChange={e => setNewThreshold(Number(e.target.value) || 0)}
                className="w-full h-10 px-3 text-sm border border-border rounded-lg" />
            </div>
            <button onClick={() => showToast("error", "Select a product from the search results")}
              className="flex items-center gap-1.5 h-10 px-5 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90 transition-colors shrink-0">
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="text-left p-4 text-[10px] font-semibold text-text-4 uppercase">Product</th>
                <th className="text-left p-4 text-[10px] font-semibold text-text-4 uppercase">SKU</th>
                <th className="text-left p-4 text-[10px] font-semibold text-text-4 uppercase">Current Qty</th>
                <th className="text-left p-4 text-[10px] font-semibold text-text-4 uppercase">Reorder Threshold</th>
                <th className="text-left p-4 text-[10px] font-semibold text-text-4 uppercase">Status</th>
                <th className="text-center p-4 text-[10px] font-semibold text-text-4 uppercase">Email Alert</th>
                <th className="text-center p-4 text-[10px] font-semibold text-text-4 uppercase">SMS Alert</th>
                <th className="text-center p-4 text-[10px] font-semibold text-text-4 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const needs = needsReplenishment(p);
                return (
                  <tr key={p.id} className={`border-b border-border hover:bg-gray-50/50 ${needs ? "bg-red-50/30" : ""}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <Package size={15} className={needs ? "text-red-500" : "text-text-4"} />
                        <span className="text-sm font-medium text-text-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono font-semibold text-text-3">{p.sku}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-bold font-mono ${p.currentQty === 0 ? "text-red-600" : needs ? "text-amber-600" : "text-green-700"}`}>
                        {p.currentQty}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateThreshold(p.id, p.threshold - 1)}
                          className="p-1 hover:bg-gray-100 rounded"><span className="text-xs font-bold">-</span></button>
                        <input type="number" value={p.threshold} onChange={e => updateThreshold(p.id, Number(e.target.value) || 0)}
                          className="w-16 h-8 text-center text-xs border border-border rounded-lg font-mono" />
                        <button onClick={() => updateThreshold(p.id, p.threshold + 1)}
                          className="p-1 hover:bg-gray-100 rounded"><span className="text-xs font-bold">+</span></button>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        needs ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                        {needs ? <AlertTriangle size={11} /> : <Package size={11} />}
                        {needs ? "Reorder Needed" : "Stock OK"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => toggleEmail(p.id)}>
                        {p.emailAlert ? (
                          <Bell size={16} className="text-orange" />
                        ) : (
                          <BellOff size={16} className="text-text-4" />
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => toggleSms(p.id)}>
                        {p.smsAlert ? (
                          <MessageSquare size={16} className="text-orange" />
                        ) : (
                          <Mail size={16} className="text-text-4" />
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => removeProduct(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                        <Trash2 size={13} className="text-red-500" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-text-4 text-sm">No products configured for replenishment alerts</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-text-4">
              <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200" />
              <span>Reorder needed: {products.filter(p => needsReplenishment(p)).length} products</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-4">
              <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200" />
              <span>Stock OK: {products.filter(p => !needsReplenishment(p)).length} products</span>
            </div>
          </div>
          <button onClick={saveAll} disabled={saving}
            className="flex items-center gap-1.5 px-4 h-9 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90 transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>
    </VendorShell>
  );
}
