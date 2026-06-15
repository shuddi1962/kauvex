"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Globe, ShoppingBag, TrendingUp, Link as LinkIcon, Plus } from "lucide-react";

export default function VendorDropshippingPage() {
  const tabs = [
    { id: "import", label: "Import Products" },
    { id: "my-products", label: "My Dropship Products" },
    { id: "orders", label: "Orders" },
    { id: "sources", label: "Connected Sources" },
    { id: "pricing", label: "Pricing Rules" },
  ];

  const [activeTab, setActiveTab] = useState("import");

  const sources = [
    { name: "CJDropshipping", status: "connected", type: "shared" },
    { name: "AliExpress", status: "connected", type: "shared" },
    { name: "eBay", status: "connect", type: "oauth" },
    { name: "Etsy", status: "connect", type: "oauth" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2a4a] text-white px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Dropshipping Marketplace</h1>
          <p className="text-gray-400 text-sm">Import products from connected sources, set your price, and sell without holding inventory.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-[#FF6B00] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#FF6B00]'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "import" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input placeholder="Search across CJDropshipping, AliExpress, eBay, Etsy..." className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]" />
              </div>
              <select className="h-11 px-3 rounded-lg border border-gray-200 text-sm bg-white">
                <option>All Sources</option><option>CJDropshipping</option><option>AliExpress</option><option>eBay</option><option>Etsy</option>
              </select>
              <Button className="bg-[#FF6B00] hover:bg-[#e86000]"><Search size={16} className="mr-1" /> Search</Button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {sources.map(s => (
                <div key={s.name} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Globe size={20} className="text-gray-400" />
                    {s.status === "connected" ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Connected</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Connect</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[#0A1628]">{s.name}</h3>
                  <p className="text-xs text-gray-400">{s.type === 'shared' ? 'Shared connection' : 'Your account via OAuth'}</p>
                  {s.status === "connect" && (
                    <Button size="sm" variant="outline" className="w-full mt-3"><LinkIcon size={12} className="mr-1" /> Connect</Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "my-products" && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-[#0A1628]">Dropship Products</h3>
              <span className="text-xs text-gray-400">0 products</span>
            </div>
            <div className="p-8 text-center text-gray-400">
              <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-[#0A1628] mb-1">No dropship products yet</p>
              <p className="text-sm">Search and import products from your connected sources.</p>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            <TrendingUp size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-[#0A1628] mb-1">No dropship orders yet</p>
            <p className="text-sm">Orders containing dropship products will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
