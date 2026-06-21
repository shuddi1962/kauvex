"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Save, X, Check, Minus, Plus, Globe, ChevronDown,
  ArrowLeft, DollarSign, Package, AlertCircle,
} from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";

const conditions = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Used - Like New" },
  { value: "good", label: "Used - Good" },
  { value: "acceptable", label: "Used - Acceptable" },
  { value: "refurbished", label: "Refurbished" },
  { value: "collectible", label: "Collectible" },
];

const fulfillmentTypes = [
  { value: "merchant", label: "Merchant Fulfilled" },
  { value: "fbk", label: "FBK (Kauvex Fulfilled)" },
];

const storefronts = [
  { key: "global", label: "Global (USD)", currency: "USD" },
  { key: "ng", label: "Nigeria (NGN)", currency: "NGN" },
  { key: "uk", label: "UK (GBP)", currency: "GBP" },
  { key: "ca", label: "Canada (CAD)", currency: "CAD" },
  { key: "au", label: "Australia (AUD)", currency: "AUD" },
  { key: "ae", label: "UAE (AED)", currency: "AED" },
];

const demoStorefrontOffers = [
  { id: 1, storefront: "Global (USD)", currency: "USD", quantity: 50, yourPrice: 49.99, currentLowest: 44.99, checked: true },
  { id: 2, storefront: "Nigeria (NGN)", currency: "NGN", quantity: 100, yourPrice: 75000, currentLowest: 72000, checked: true },
  { id: 3, storefront: "UK (GBP)", currency: "GBP", quantity: 30, yourPrice: 39.99, currentLowest: 37.50, checked: false },
  { id: 4, storefront: "Canada (CAD)", currency: "CAD", quantity: 40, yourPrice: 67.99, currentLowest: 65.00, checked: true },
  { id: 5, storefront: "Australia (AUD)", currency: "AUD", quantity: 25, yourPrice: 74.99, currentLowest: 72.00, checked: false },
  { id: 6, storefront: "UAE (AED)", currency: "AED", quantity: 60, yourPrice: 183.50, currentLowest: 179.99, checked: false },
];

export default function ProductOfferPage() {
  const params = useParams();
  const [sellerSku, setSellerSku] = useState("");
  const [yourPrice, setYourPrice] = useState(49.99);
  const [condition, setCondition] = useState("new");
  const [fulfillment, setFulfillment] = useState("merchant");
  const [offers, setOffers] = useState(demoStorefrontOffers);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleCheck = (id: number) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, checked: !o.checked } : o));
  };

  const matchLowestPrice = () => {
    const minLowest = Math.min(...offers.filter(o => o.checked).map(o => o.currentLowest));
    setYourPrice(minLowest);
    setOffers(prev => prev.map(o => o.checked ? { ...o, yourPrice: o.currentLowest } : o));
    showToast("success", "Prices matched to lowest competitor price");
  };

  const matchRowPrice = (id: number) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, yourPrice: o.currentLowest } : o));
    showToast("success", "Price matched for this storefront");
  };

  const updateOfferPrice = (id: number, price: number) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, yourPrice: price } : o));
  };

  const updateOfferQty = (id: number, qty: number) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, quantity: Math.max(0, qty) } : o));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      const checked = offers.filter(o => o.checked);
      showToast("success", `Offer published to ${checked.length} storefront(s)`);
      setSaving(false);
    }, 1000);
  };

  const checkedCount = offers.filter(o => o.checked).length;

  return (
    <VendorShell title="Create Offer" subtitle={`Product ID: ${params.id}`}>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back link */}
        <Link href={`/vendor/products/${params.id}/edit`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-4 hover:text-text-1 transition-colors">
          <ArrowLeft size={13} /> Back to Product
        </Link>

        {/* Offer Settings Card */}
        <div className="bg-white rounded-xl border border-border p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-text-1">Offer Settings</h3>
            <button onClick={matchLowestPrice} className="flex items-center gap-1.5 px-4 h-9 bg-orange/10 text-orange text-xs font-bold rounded-xl hover:bg-orange/20 transition-colors">
              <Minus size={13} /> Match Lowest Price
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Seller SKU</label>
              <input value={sellerSku} onChange={e => setSellerSku(e.target.value)} placeholder="Your custom SKU"
                className="w-full h-10 px-3 border border-border rounded-lg text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Your Price ({offers.find(o => o.checked)?.currency || "USD"})</label>
              <input type="number" step="0.01" value={yourPrice} onChange={e => setYourPrice(Number(e.target.value) || 0)}
                className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Item Condition</label>
              <select value={condition} onChange={e => setCondition(e.target.value)}
                className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white">
                {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Fulfillment Channel</label>
              <select value={fulfillment} onChange={e => setFulfillment(e.target.value)}
                className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white">
                {fulfillmentTypes.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Multi-Storefront Offers Table */}
        <div className="bg-white rounded-xl border border-border overflow-x-auto">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-text-1">Storefront Offers</h3>
              <p className="text-xs text-text-4 mt-0.5">Configure pricing per storefront. Checked storefronts will be published.</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-text-4">
                <input type="checkbox" checked={checkedCount === offers.length} onChange={() => {
                  const all = checkedCount === offers.length;
                  setOffers(prev => prev.map(o => ({ ...o, checked: !all })));
                }} className="rounded" />
                {checkedCount === offers.length ? "Deselect All" : "Select All"}
              </label>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase w-10">
                  <input type="checkbox" checked={checkedCount === offers.length} onChange={() => {
                    const all = checkedCount === offers.length;
                    setOffers(prev => prev.map(o => ({ ...o, checked: !all })));
                  }} className="rounded" />
                </th>
                <th className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase">Storefront</th>
                <th className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase">Currency</th>
                <th className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase">Quantity</th>
                <th className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase">Your Price</th>
                <th className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase">Current Lowest</th>
                <th className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(o => (
                <tr key={o.id} className={`border-b border-border hover:bg-gray-50/50 transition-colors ${o.checked ? "" : "opacity-50"}`}>
                  <td className="p-3">
                    <input type="checkbox" checked={o.checked} onChange={() => toggleCheck(o.id)} className="rounded" />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Globe size={13} className="text-text-4" />
                      <span className="font-medium text-text-1">{o.storefront}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-xs font-mono font-semibold text-text-3">{o.currency}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateOfferQty(o.id, o.quantity - 1)} className="p-1 hover:bg-gray-100 rounded"><Minus size={12} /></button>
                      <input type="number" value={o.quantity} onChange={e => updateOfferQty(o.id, Number(e.target.value) || 0)}
                        className="w-16 h-8 text-center text-xs border border-border rounded-lg" />
                      <button onClick={() => updateOfferQty(o.id, o.quantity + 1)} className="p-1 hover:bg-gray-100 rounded"><Plus size={12} /></button>
                    </div>
                  </td>
                  <td className="p-3">
                    <input type="number" step="0.01" value={o.yourPrice} onChange={e => updateOfferPrice(o.id, Number(e.target.value) || 0)}
                      className="w-24 h-8 px-2 text-xs border border-border rounded-lg font-mono" />
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-semibold text-red-600 font-mono">{o.currency === "USD" ? "$" : o.currency === "NGN" ? "₦" : o.currency === "GBP" ? "£" : o.currency === "CAD" ? "C$" : o.currency === "AUD" ? "A$" : "د.إ"}{o.currentLowest.toFixed(2)}</span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => matchRowPrice(o.id)}
                      className="flex items-center gap-1 px-2.5 h-7 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                      <Minus size={11} /> Match
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary + Publish */}
        <div className="bg-white rounded-xl border border-border p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange/10 flex items-center justify-center">
              <Package size={16} className="text-orange" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-1">Publishing to {checkedCount} storefront{checkedCount !== 1 ? "s" : ""}</p>
              <p className="text-xs text-text-4">Offer will be live once published</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving || checkedCount === 0}
            className="flex items-center gap-2 px-6 h-10 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90 transition-colors disabled:opacity-50">
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving ? "Publishing..." : "Save and Publish"}
          </button>
        </div>
      </div>
    </VendorShell>
  );
}
