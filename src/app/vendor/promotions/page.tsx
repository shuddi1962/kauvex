"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, Loader2 } from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";

interface Coupon {
  id: number;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  usageLimit: number;
  used: number;
  active: boolean;
  expires: string;
}

export default function VendorPromotionsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percentage", value: "", minOrder: "", usageLimit: "", expires: "" });

  useEffect(() => {
    fetch("/api/v1/vendor/promotions")
      .then((r) => r.json())
      .then((data) => setCoupons(Array.isArray(data) ? data : data?.coupons ?? []))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: number) => {
    const coupon = coupons.find((c) => c.id === id);
    if (!coupon) return;
    fetch(`/api/v1/vendor/promotions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    }).then(() => setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c)));
  };

  const remove = (id: number) => {
    if (!confirm("Delete coupon?")) return;
    fetch(`/api/v1/vendor/promotions/${id}`, { method: "DELETE" })
      .then(() => setCoupons((prev) => prev.filter((c) => c.id !== id)));
  };

  const addCoupon = () => {
    if (!form.code) { alert("Coupon code required."); return; }
    fetch("/api/v1/vendor/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: form.code.toUpperCase(), type: form.type, value: Number(form.value) || 0, minOrder: Number(form.minOrder) || 0, usageLimit: Number(form.usageLimit) || 100, expires: form.expires || "2025-12-31" }),
    }).then((r) => r.json()).then((newCoupon) => {
      setCoupons((prev) => [...prev, { ...newCoupon, id: newCoupon.id ?? Date.now(), used: newCoupon.used ?? 0, active: true }]);
      setForm({ code: "", type: "percentage", value: "", minOrder: "", usageLimit: "", expires: "" });
      setShowAdd(false);
      alert("Coupon created!");
    });
  };

  return (
    <VendorShell title="Promotions" subtitle="Create and manage coupons and deals">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{loading ? <Loader2 size={14} className="animate-spin inline" /> : `${coupons.length} coupons`}</p>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"><Plus size={16} /> Create Coupon</button>
      </div>

      <div className="max-w-5xl mx-auto space-y-4">
        {showAdd && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
            <h3 className="font-semibold text-sm">New Coupon</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <input placeholder="Coupon Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="h-10 px-3 text-sm border border-gray-200 rounded-lg font-mono uppercase" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-10 px-3 text-sm border border-gray-200 rounded-lg">
                <option value="percentage">Percentage Off</option>
                <option value="fixed">Fixed Amount</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
              {form.type !== "free_shipping" && <input placeholder={form.type === "percentage" ? "Discount %" : "Amount (₦)"} type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="h-10 px-3 text-sm border border-gray-200 rounded-lg" />}
              <input placeholder="Min Order (₦)" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="h-10 px-3 text-sm border border-gray-200 rounded-lg" />
              <input placeholder="Usage Limit" type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="h-10 px-3 text-sm border border-gray-200 rounded-lg" />
              <input type="date" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} className="h-10 px-3 text-sm border border-gray-200 rounded-lg" />
            </div>
            <div className="flex gap-2">
              <button onClick={addCoupon} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg">Create</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-gray-200 text-sm rounded-lg">Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Loader2 size={24} className="animate-spin text-gray-400 mx-auto" />
            <p className="text-sm text-gray-400 mt-2">Loading coupons...</p>
          </div>
        ) : coupons.map((c) => (
          <div key={c.id} className={`bg-white rounded-xl p-5 border ${c.active ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><Tag size={20} className="text-purple-600" /></div>
                <div>
                  <p className="font-mono font-bold text-lg">{c.code}</p>
                  <p className="text-xs text-gray-400">{c.type === "percentage" ? `${c.value}% off` : c.type === "fixed" ? `₦${c.value.toLocaleString()} off` : "Free shipping"} · Min order ₦{c.minOrder.toLocaleString()} · Expires {c.expires}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                  <p className="text-sm font-semibold">{c.used}/{c.usageLimit}</p>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${(c.used / c.usageLimit) * 100}%` }} /></div>
                </div>
                <button onClick={() => toggle(c.id)}>{c.active ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}</button>
                <button onClick={() => remove(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-red-600" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </VendorShell>
  );
}
