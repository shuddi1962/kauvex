"use client";

import { useState, useEffect } from "react";
import { Percent, Plus, Search, Edit3, Trash2, ToggleLeft, ToggleRight, Loader2, Package, Tag, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { insforge } from "@/lib/insforge";

interface Bundle {
  id: string;
  name: string;
  slug: string;
  discount_type: string;
  discount_value: number;
  status: string;
  products: any[];
  created_at: string;
}

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", discountType: "percentage", discountValue: "", productIds: [] as string[] });
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await insforge.database.from("bundles").select("*").order("created_at", { ascending: false });
        setBundles(data || []);
        const { data: prodData } = await insforge.database.from("products").select("id, name, sku, regular_price").limit(50);
        setProducts(prodData || []);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "inactive" : "active";
    await insforge.database.from("bundles").update({ status: newStatus }).eq("id", id);
    setBundles((prev) => prev.map((b) => b.id === id ? { ...b, status: newStatus } : b));
  };

  const deleteBundle = async (id: string) => {
    if (!confirm("Delete this bundle?")) return;
    await insforge.database.from("bundles").delete().eq("id", id);
    setBundles((prev) => prev.filter((b) => b.id !== id));
  };

  const createBundle = async () => {
    if (!form.name || !form.discountValue) return;
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
    const { data } = await insforge.database.from("bundles").insert({
      name: form.name,
      slug,
      description: form.description || null,
      discount_type: form.discountType,
      discount_value: Number(form.discountValue),
      products: form.productIds,
      status: "active",
    }).select("*").single();

    if (data) {
      setBundles((prev) => [data, ...prev]);
      setShowCreate(false);
      setForm({ name: "", description: "", discountType: "percentage", discountValue: "", productIds: [] });
    }
  };

  const filtered = bundles.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Percent size={20} className="text-purple-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Product Bundles</h1>
              <p className="text-sm text-gray-500">Create discounted multi-product bundles</p>
            </div>
          </div>
          <Button onClick={() => setShowCreate(true)}><Plus size={16} className="mr-2" /> New Bundle</Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {/* Search */}
        <div className="relative max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search bundles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2"><Tag size={16} className="text-purple-600" /> New Bundle</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Bundle Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Discount Type</label>
                <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Discount Value</label>
                <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-2 font-medium">Select Products</label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                {products.map((p: any) => (
                  <label key={p.id} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" checked={form.productIds.includes(p.id)}
                      onChange={(e) => setForm((prev) => ({
                        ...prev,
                        productIds: e.target.checked ? [...prev.productIds, p.id] : prev.productIds.filter((id) => id !== p.id)
                      }))}
                      className="rounded border-gray-300 text-purple-600" />
                    <span className="text-sm text-gray-700">{p.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">${p.regular_price}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={createBundle}>Create Bundle</Button>
              <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Bundle List */}
        {filtered.map((bundle) => (
          <div key={bundle.id} className="bg-white rounded-xl p-5 border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package size={18} className="text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">{bundle.name}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <span>Discount: {bundle.discount_type === "percentage" ? `${bundle.discount_value}%` : `$${bundle.discount_value}`}</span>
                  <span>•</span>
                  <span>Products: {(bundle.products || []).length}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${bundle.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {bundle.status}
              </span>
              <button onClick={() => toggleStatus(bundle.id, bundle.status)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                {bundle.status === "active" ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} className="text-gray-400" />}
              </button>
              <button onClick={() => deleteBundle(bundle.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-red-400" /></button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Percent size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-1">No bundles yet</h3>
            <p className="text-sm text-gray-500">Create your first product bundle to offer discounts on combined purchases.</p>
          </div>
        )}
      </div>
    </div>
  );
}
