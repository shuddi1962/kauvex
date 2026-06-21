"use client";

import { useState } from "react";
import { Globe, ShoppingBag, RefreshCw, DollarSign, Link as LinkIcon, Unlink, CheckCircle, X, ExternalLink, Settings, ToggleLeft, AlertCircle } from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";

const channels = [
  { id: "ebay", name: "eBay", icon: Globe, color: "bg-blue-100 text-blue", connected: true, lastSync: "2026-06-20 14:30", productsSynced: 24, ordersToday: 5 },
  { id: "etsy", name: "Etsy", icon: ShoppingBag, color: "bg-orange-100 text-orange-700", connected: true, lastSync: "2026-06-20 13:15", productsSynced: 18, ordersToday: 3 },
  { id: "shopify", name: "Shopify", icon: ShoppingBag, color: "bg-green-100 text-green-700", connected: false, lastSync: "-", productsSynced: 0, ordersToday: 0 },
  { id: "walmart", name: "Walmart", icon: Globe, color: "bg-blue-100 text-blue", connected: false, lastSync: "-", productsSynced: 0, ordersToday: 0 },
];

const demoProducts = [
  { id: "P-001", name: "Marine GPS Navigator", sku: "GPS-1001", price: "₦65,000", ebay: true, etsy: true },
  { id: "P-002", name: "Yacht Anchor Chain 20mm", sku: "ANC-2001", price: "₦45,000", ebay: true, etsy: false },
  { id: "P-003", name: "LED Navigation Lights (Set)", sku: "LED-3001", price: "₦12,500", ebay: false, etsy: true },
  { id: "P-004", name: "Marine VHF Radio", sku: "VHF-4001", price: "₦38,000", ebay: true, etsy: true },
  { id: "P-005", name: "Boat Cover Heavy Duty", sku: "COV-5001", price: "₦22,000", ebay: false, etsy: false },
];

export default function ChannelsPage() {
  const [tab, setTab] = useState<"channels" | "sync" | "inventory" | "pricing">("channels");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [syncToggled, setSyncToggled] = useState(true);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const tabs = [
    { id: "channels", label: "Connected Channels", icon: Globe },
    { id: "sync", label: "Product Sync", icon: RefreshCw },
    { id: "inventory", label: "Inventory Sync", icon: Settings },
    { id: "pricing", label: "Price Rules", icon: DollarSign },
  ];

  return (
    <VendorShell title="Multi-Channel Integration" subtitle="Connect and manage your sales channels">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id as typeof tab)} className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? "bg-orange text-white" : "bg-white border border-border text-text-3 hover:border-orange"}`}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Channels Tab */}
        {tab === "channels" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {channels.map((ch) => {
                const Icon = ch.icon;
                return (
                  <div key={ch.id} className={`bg-white rounded-xl border p-5 ${ch.connected ? "border-border" : "border-dashed border-gray-200"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${ch.color} flex items-center justify-center`}>
                        <Icon size={18} />
                      </div>
                      {ch.connected ? (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <CheckCircle size={10} /> Connected
                        </span>
                      ) : (
                        <button onClick={() => showToast(`Connect to ${ch.name}`, "success")} className="text-[10px] bg-gray-100 text-text-4 px-2 py-0.5 rounded-full font-semibold hover:bg-gray-200">
                          + Connect
                        </button>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-text-1">{ch.name}</h3>
                    {ch.connected ? (
                      <div className="mt-3 space-y-1 text-[10px] text-text-4">
                        <p>Last sync: {ch.lastSync}</p>
                        <p>Products synced: {ch.productsSynced}</p>
                        <p>Orders today: {ch.ordersToday}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-text-4 mt-3">Not connected</p>
                    )}
                    {ch.connected && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                        <button onClick={() => showToast(`Syncing ${ch.name}...`, "success")} className="text-[10px] text-orange font-semibold flex items-center gap-1 hover:underline">
                          <RefreshCw size={10} /> Sync Now
                        </button>
                        <button className="text-[10px] text-red-500 font-semibold flex items-center gap-1 hover:underline">
                          <Unlink size={10} /> Disconnect
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Unified Orders Link */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Unified Orders</h3>
                <p className="text-xs text-purple-100 mt-1">View all orders from all connected channels in one place</p>
              </div>
              <button onClick={() => showToast("Opening Unified Orders", "success")} className="flex items-center gap-1.5 px-4 py-2 bg-white text-purple-700 rounded-xl text-sm font-bold hover:bg-purple-50">
                <ExternalLink size={14} /> Open
              </button>
            </div>
          </div>
        )}

        {/* Product Sync Tab */}
        {tab === "sync" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-4">Select products to list on connected channels</p>
              <div className="flex items-center gap-2">
                <select className="px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none">
                  <option>All Channels</option>
                  <option>eBay</option>
                  <option>Etsy</option>
                </select>
                <button onClick={() => showToast("Syncing selected products", "success")} className="px-4 py-2 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 flex items-center gap-1.5">
                  <RefreshCw size={14} /> Sync Selected
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50 text-left">
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">eBay</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Etsy</th>
                  </tr>
                </thead>
                <tbody>
                  {demoProducts.map((p) => (
                    <tr key={p.id} className="border-b border-border hover:bg-gray-50">
                      <td className="px-4 py-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-text-1">{p.name}</p>
                        <p className="text-[10px] text-text-4 font-mono">{p.id}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-4 font-mono">{p.sku}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-text-1">{p.price}</td>
                      <td className="px-4 py-3">
                        {p.ebay ? <CheckCircle size={14} className="text-green-500" /> : <X size={14} className="text-red-300" />}
                      </td>
                      <td className="px-4 py-3">
                        {p.etsy ? <CheckCircle size={14} className="text-green-500" /> : <X size={14} className="text-red-300" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inventory Sync Tab */}
        {tab === "inventory" && (
          <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
            <h3 className="font-bold text-base text-text-1 mb-1">Inventory Sync Settings</h3>
            <p className="text-xs text-text-4 mb-6">Configure how inventory levels are synced across channels</p>

            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-text-1">Enable Automatic Sync</p>
                  <p className="text-xs text-text-4">Sync inventory levels every 30 minutes</p>
                </div>
                <button onClick={() => { setSyncToggled(!syncToggled); showToast(syncToggled ? "Auto-sync disabled" : "Auto-sync enabled", "success"); }} className={`relative w-11 h-6 rounded-full transition-colors ${syncToggled ? "bg-orange" : "bg-gray-200"}`}>
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 shadow-sm transition-transform ${syncToggled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-2 mb-1.5">Default Sync Behavior</label>
                <select className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                  <option>Sync all inventory to all channels</option>
                  <option>Sync per-channel inventory levels</option>
                  <option>Manual sync only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-2 mb-1.5">Low Stock Threshold</label>
                <input type="number" defaultValue={5} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" />
                <p className="text-[10px] text-text-4 mt-1">Products below this threshold will be delisted from channels</p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                {["eBay", "Etsy", "Shopify", "Walmart"].map((ch) => (
                  <label key={ch} className="flex items-center gap-2 text-sm text-text-2">
                    <input type="checkbox" defaultChecked={ch === "eBay" || ch === "Etsy"} className="rounded border-gray-300 text-orange focus:ring-orange-500" />
                    {ch}
                  </label>
                ))}
              </div>

              <button onClick={() => showToast("Inventory sync settings saved", "success")} className="px-6 py-2.5 bg-orange text-white font-bold rounded-xl hover:bg-orange/90">
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {tab === "pricing" && (
          <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
            <h3 className="font-bold text-base text-text-1 mb-1">Price Sync Rules</h3>
            <p className="text-xs text-text-4 mb-6">Define how prices are managed across channels</p>

            <div className="space-y-5">
              <div className="p-4 bg-gray-50 rounded-xl border border-border">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="radio" name="pricing_rule" defaultChecked className="mt-0.5 text-orange focus:ring-orange-500" />
                  <div>
                    <p className="text-sm font-semibold text-text-1">Same Price Across All Channels</p>
                    <p className="text-xs text-text-4">Use the KAUVEX price as the standard across all connected channels</p>
                  </div>
                </label>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-border">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="radio" name="pricing_rule" className="mt-0.5 text-orange focus:ring-orange-500" />
                  <div>
                    <p className="text-sm font-semibold text-text-1">Channel-Specific Pricing</p>
                    <p className="text-xs text-text-4">Set different prices for each channel</p>
                  </div>
                </label>
              </div>

              {channels.filter((ch) => ch.connected).map((ch) => (
                <div key={ch.id} className="flex items-center gap-4 pl-6">
                  <span className="text-xs font-semibold text-text-3 w-16">{ch.name}</span>
                  <input type="text" className="flex-1 px-3 py-2 border border-border rounded-lg text-sm" placeholder={`${ch.name} price`} />
                  <select className="px-3 py-2 border border-border rounded-lg text-sm bg-white">
                    <option>Fixed</option>
                    <option>+% Markup</option>
                    <option>-% Discount</option>
                  </select>
                </div>
              ))}

              <div className="pt-2">
                <label className="block text-sm font-medium text-text-2 mb-1.5">Auto-Repricing Rule</label>
                <select className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-white focus:outline-none">
                  <option>Disabled</option>
                  <option>Match lowest competitor price</option>
                  <option>Maintain 5% above lowest price</option>
                  <option>Maintain 10% below Buy Box price</option>
                </select>
              </div>

              <button onClick={() => showToast("Price rules saved", "success")} className="px-6 py-2.5 bg-orange text-white font-bold rounded-xl hover:bg-orange/90">
                Save Rules
              </button>
            </div>
          </div>
        )}
      </div>
    </VendorShell>
  );
}
