"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, Download, Star, DollarSign, Users, TrendingUp, Eye, Edit, Trash2, Plus, Search } from "lucide-react";
import AdminShell from "@/components/admin/admin-shell";

interface ArtListing {
  id: string;
  title: string;
  creator: string;
  category: string;
  price: string;
  status: "active" | "draft";
  sales: number;
  earnings: string;
  createdAt: string;
}

export default function AdminArtMarketplacePage() {
  const [activeTab, setActiveTab] = useState("overview");

  const listings: ArtListing[] = [
    { id: "a1", title: "Sunset Over Lagos", creator: "ArtByKemi", category: "Digital Art", price: "₦12,000", status: "active", sales: 45, earnings: "₦432,000", createdAt: "1 week ago" },
    { id: "a2", title: "Abstract Harmony", creator: "DesignHouseNG", category: "Abstract", price: "₦8,500", status: "active", sales: 23, earnings: "₦156,400", createdAt: "2 weeks ago" },
    { id: "a3", title: "African Queen", creator: "CultureArt", category: "Portrait", price: "₦15,000", status: "active", sales: 67, earnings: "₦804,000", createdAt: "3 weeks ago" },
    { id: "a4", title: "Neon Dreams", creator: "SketchLab", category: "Digital Art", price: "₦6,500", status: "draft", sales: 0, earnings: "₦0", createdAt: "1 month ago" },
  ];

  return (
    <AdminShell title="Art Marketplace" subtitle="Manage digital art listings, creators, and sales">
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto">
          {["overview", "listings", "creators", "sales", "pending"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all capitalize ${activeTab === tab ? 'bg-blue text-white' : 'bg-white text-text-3 border border-border hover:bg-off-white'}`}>
              {tab === "overview" ? "Overview" : `${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Artworks", value: "234", icon: Image, color: "bg-purple-50 text-purple-600" },
            { label: "Active Creators", value: "28", icon: Users, color: "bg-blue-50 text-blue" },
            { label: "Total Sales", value: "1,847", icon: TrendingUp, color: "bg-green-50 text-green-700" },
            { label: "Revenue", value: "₦12.5M", icon: DollarSign, color: "bg-orange-50 text-orange" },
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

        {activeTab === "listings" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex-1 relative max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                <input placeholder="Search artworks..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" />
              </div>
              <Button size="sm"><Plus size={14} className="mr-1" /> Add Artwork</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-off-white">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Artwork</th>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Creator</th>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Category</th>
                  <th className="text-right px-5 py-3 font-medium text-text-4">Price</th>
                  <th className="text-center px-5 py-3 font-medium text-text-4">Sales</th>
                  <th className="text-right px-5 py-3 font-medium text-text-4">Earnings</th>
                  <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-text-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listings.map(a => (
                  <tr key={a.id} className="hover:bg-off-white">
                    <td className="px-5 py-3 font-medium text-text-1">{a.title}</td>
                    <td className="px-5 py-3 text-text-4">{a.creator}</td>
                    <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-text-4">{a.category}</span></td>
                    <td className="px-5 py-3 text-right font-medium">{a.price}</td>
                    <td className="px-5 py-3 text-center">{a.sales}</td>
                    <td className="px-5 py-3 text-right font-medium text-green-700">{a.earnings}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-text-4'}`}>{a.status}</span>
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
              <h3 className="font-bold text-text-1 mb-3">Top Selling Artworks</h3>
              <div className="space-y-3">
                {listings.filter(a => a.status === "active").sort((a, b) => b.sales - a.sales).slice(0, 3).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-off-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Image size={16} className="text-text-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-text-1">{a.title}</p>
                        <p className="text-xs text-text-4">by {a.creator}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-text-1">{a.price}</p>
                      <p className="text-xs text-text-4">{a.sales} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-bold text-text-1 mb-3">Revenue Breakdown</h3>
              <div className="text-center py-6">
                <p className="text-3xl font-bold text-text-1">₦12.5M</p>
                <p className="text-sm text-text-4 mt-1">Total marketplace revenue</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-4">Creator earnings</span>
                  <span className="font-medium text-text-1">₦10.0M (80%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-4">Kauvex commission</span>
                  <span className="font-medium text-text-1">₦2.5M (20%)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
