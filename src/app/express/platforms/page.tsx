"use client";

import { useState } from "react";
import { Globe, ShoppingBag, Store, Link2, CheckCircle2, Plus, ExternalLink, RefreshCw } from "lucide-react";

const PLATFORMS = [
  { id: "shopify", name: "Shopify", icon: "🛒", connected: true, orders: 1240, status: "syncing", lastSync: "2 min ago" },
  { id: "woocommerce", name: "WooCommerce", icon: "🏪", connected: true, orders: 860, status: "synced", lastSync: "15 min ago" },
  { id: "ebay", name: "eBay", icon: "📦", connected: false, orders: 0, status: "disconnected", lastSync: null },
  { id: "etsy", name: "Etsy", icon: "🎨", connected: false, orders: 0, status: "disconnected", lastSync: null },
  { id: "amazon", name: "Amazon", icon: "📚", connected: false, orders: 0, status: "disconnected", lastSync: null },
  { id: "bigcommerce", name: "BigCommerce", icon: "🏬", connected: false, orders: 0, status: "disconnected", lastSync: null },
  { id: "wix", name: "Wix", icon: "🌐", connected: false, orders: 0, status: "disconnected", lastSync: null },
  { id: "squarespace", name: "Squarespace", icon: "🖼️", connected: false, orders: 0, status: "disconnected", lastSync: null },
];

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState(PLATFORMS);
  const [search, setSearch] = useState("");

  const filtered = platforms.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const connectedCount = platforms.filter((p) => p.connected).length;
  const totalOrders = platforms.reduce((sum, p) => sum + p.orders, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Platforms</h1>
          <p className="text-gray-500 text-sm mt-1">Connect your sales channels to sync orders and inventory</p>
        </div>
        <button className="bg-[#FF6B00] hover:bg-[#e55f00] text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Connect Platform
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Connected</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">{connectedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Orders Synced</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">{totalOrders.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Available Platforms</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">{platforms.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Search platforms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((platform) => (
          <div key={platform.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{platform.icon}</span>
                <div>
                  <h3 className="font-semibold text-[#0A1628]">{platform.name}</h3>
                  {platform.connected ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">Connected</span>
                      <span className="text-xs text-gray-400 ml-1">· {platform.lastSync}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 mt-1 block">Not connected</span>
                  )}
                </div>
              </div>
              {platform.connected ? (
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Sync now">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Open in new tab">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button className="bg-[#0A1628] hover:bg-[#0A1628]/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                  Connect
                </button>
              )}
            </div>
            {platform.connected && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Orders synced</span>
                  <span className="font-semibold text-[#0A1628]">{platform.orders.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
