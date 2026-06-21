"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Bell, BellOff, Plus, Trash2, Save, Mail, MessageSquare,
  Package, AlertTriangle, ToggleLeft, ToggleRight,
} from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";

const demoProducts = [
  { id: 1, sku: "GPS-MAR-7", name: "Marine GPS Navigator 7-inch", currentQty: 50, threshold: 10, emailAlert: true, smsAlert: false },
  { id: 2, sku: "ANCH-12MM", name: "Yacht Anchor Chain 12mm", currentQty: 120, threshold: 20, emailAlert: true, smsAlert: true },
  { id: 3, sku: "LED-NAV-SET", name: "LED Navigation Light Set", currentQty: 0, threshold: 15, emailAlert: true, smsAlert: false },
  { id: 4, sku: "VHF-RADIO-DSC", name: "Marine VHF Radio DSC", currentQty: 15, threshold: 5, emailAlert: false, smsAlert: false },
  { id: 5, sku: "COVER-HVY-DTY", name: "Boat Cover Heavy Duty", currentQty: 5, threshold: 10, emailAlert: true, smsAlert: true },
  { id: 6, sku: "FISH-FD-50LB", name: "Premium Fish Food 50lb", currentQty: 200, threshold: 50, emailAlert: true, smsAlert: false },
  { id: 7, sku: "ROD-FIBER-12", name: "Fiberglass Fishing Rod 12ft", currentQty: 8, threshold: 5, emailAlert: false, smsAlert: true },
  { id: 8, sku: "ECHO-SOUNDER", name: "Fishfinder Echo Sounder", currentQty: 0, threshold: 20, emailAlert: true, smsAlert: false },
];

export default function ReplenishmentAlertsPage() {
  const [products, setProducts] = useState(demoProducts);
  const [newSku, setNewSku] = useState("");
  const [newThreshold, setNewThreshold] = useState(10);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const updateThreshold = (id: number, val: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, threshold: Math.max(0, val) } : p));
  };

  const toggleEmail = (id: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, emailAlert: !p.emailAlert } : p));
    showToast("success", "Email alert preference updated");
  };

  const toggleSms = (id: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, smsAlert: !p.smsAlert } : p));
    showToast("success", "SMS alert preference updated");
  };

  const removeProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast("success", "Product removed from alerts");
  };

  const addProduct = () => {
    if (!newSku.trim()) { showToast("error", "Enter a product SKU"); return; }
    const newId = Math.max(...products.map(p => p.id)) + 1;
    setProducts(prev => [...prev, {
      id: newId,
      sku: newSku.trim().toUpperCase(),
      name: `New Product (${newSku.trim()})`,
      currentQty: 0,
      threshold: newThreshold,
      emailAlert: true,
      smsAlert: false,
    }]);
    setNewSku("");
    showToast("success", "Product added to replenishment alerts");
  };

  const needsReplenishment = (product: typeof demoProducts[0]) => product.currentQty <= product.threshold;

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
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-text-2 block mb-1">Product SKU</label>
              <input value={newSku} onChange={e => setNewSku(e.target.value)} onKeyDown={e => e.key === "Enter" && addProduct()}
                placeholder="Enter SKU" className="w-full h-10 px-3 text-sm border border-border rounded-lg font-mono" />
            </div>
            <div className="w-32">
              <label className="text-xs font-semibold text-text-2 block mb-1">Reorder Threshold</label>
              <input type="number" value={newThreshold} onChange={e => setNewThreshold(Number(e.target.value) || 0)}
                className="w-full h-10 px-3 text-sm border border-border rounded-lg" />
            </div>
            <button onClick={addProduct}
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
          <button onClick={() => showToast("success", "All alert preferences saved")}
            className="flex items-center gap-1.5 px-4 h-9 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90 transition-colors">
            <Save size={13} /> Save All
          </button>
        </div>
      </div>
    </VendorShell>
  );
}
