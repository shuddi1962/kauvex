"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Image, Wallet, DollarSign, TrendingUp, Eye, Edit, Trash2, Plus, Search, Gavel } from "lucide-react";
import AdminShell from "@/components/admin/admin-shell";

interface NftToken {
  id: string;
  title: string;
  creator: string;
  blockchain: string;
  tokenStandard: string;
  price: string;
  status: string;
  sales: number;
  createdAt: string;
}

export default function AdminNFTPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const tokens: NftToken[] = [
    { id: "t1", title: "Cyber Lagos #001", creator: "ArtByKemi", blockchain: "Ethereum", tokenStandard: "ERC-721", price: "0.5 ETH", status: "active", sales: 1, createdAt: "1 day ago" },
    { id: "t2", title: "Abstract Dreams", creator: "DesignHouseNG", blockchain: "Polygon", tokenStandard: "ERC-1155", price: "0.25 ETH", status: "active", sales: 3, createdAt: "3 days ago" },
    { id: "t3", title: "Queen of the Nile", creator: "CultureArt", blockchain: "Ethereum", tokenStandard: "ERC-721", price: "1.2 ETH", status: "active", sales: 0, createdAt: "1 week ago" },
    { id: "t4", title: "Neon Genesis", creator: "SketchLab", blockchain: "Polygon", tokenStandard: "ERC-1155", price: "0.08 ETH", status: "draft", sales: 0, createdAt: "2 weeks ago" },
  ];

  return (
    <AdminShell title="NFT Marketplace" subtitle="Manage NFT tokens, sales, auctions, and creator wallets">
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto">
          {["overview", "tokens", "sales", "auctions", "wallets"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all capitalize ${activeTab === tab ? 'bg-blue text-white' : 'bg-white text-text-3 border border-border hover:bg-off-white'}`}>
              {tab === "overview" ? "Overview" : `${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total NFTs", value: "156", icon: Image, color: "bg-purple-50 text-purple-600" },
            { label: "Active Auctions", value: "12", icon: Gavel, color: "bg-indigo-50 text-indigo-600" },
            { label: "Total Sales", value: "847", icon: TrendingUp, color: "bg-green-50 text-green-700" },
            { label: "Volume (ETH)", value: "1,234.5", icon: DollarSign, color: "bg-orange-50 text-orange" },
          ].map(kpi => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white rounded-xl border border-border p-4">
                <div className={`w-9 h-9 rounded-lg ${kpi.color} flex items-center justify-center mb-2`}><Icon size={16} /></div>
                <p className="text-xl font-bold text-text-1">{kpi.value}</p>
                <p className="text-xs text-text-4">{kpi.label}</p>
              </div>
            );
          })}
        </div>

        {activeTab === "tokens" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex-1 relative max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                <input placeholder="Search NFTs..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" />
              </div>
              <Button size="sm"><Plus size={14} className="mr-1" /> Mint NFT</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-off-white">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-text-4">NFT</th>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Creator</th>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Blockchain</th>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Standard</th>
                  <th className="text-right px-5 py-3 font-medium text-text-4">Price</th>
                  <th className="text-center px-5 py-3 font-medium text-text-4">Sales</th>
                  <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-text-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tokens.map(t => (
                  <tr key={t.id} className="hover:bg-off-white">
                    <td className="px-5 py-3 font-medium text-text-1">{t.title}</td>
                    <td className="px-5 py-3 text-text-4">{t.creator}</td>
                    <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">{t.blockchain}</span></td>
                    <td className="px-5 py-3 text-xs text-text-4 font-mono">{t.tokenStandard}</td>
                    <td className="px-5 py-3 text-right font-medium">{t.price}</td>
                    <td className="px-5 py-3 text-center">{t.sales}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-text-4'}`}>{t.status}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded"><Eye size={14} className="text-text-4" /></button>
                        <button className="p-1.5 hover:bg-gray-100 rounded"><Edit size={14} className="text-text-4" /></button>
                        <button className="p-1.5 hover:bg-gray-100 rounded"><Trash2 size={14} className="text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-bold text-text-1 mb-3">Recent NFT Mints</h3>
              <div className="space-y-3">
                {tokens.slice(0, 3).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-off-white rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-text-1">{t.title}</p>
                      <p className="text-xs text-text-4">by {t.creator} · {t.blockchain}</p>
                    </div>
                    <span className="text-xs font-medium text-purple-600">{t.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-bold text-text-1 mb-3">Connected Wallets</h3>
              <div className="text-center py-6">
                <Wallet size={40} className="mx-auto mb-3 text-text-3" />
                <p className="font-medium text-text-1 mb-1">28 Creator Wallets</p>
                <p className="text-sm text-text-4">Wallets connected for royalty payouts</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
