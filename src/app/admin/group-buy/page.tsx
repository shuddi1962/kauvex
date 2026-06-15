"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Clock, TrendingDown, Plus, Eye, CheckCircle, XCircle, Search } from "lucide-react";
import AdminShell from "@/components/admin/admin-shell";

interface GroupBuyDeal {
  id: string;
  product: string;
  vendor: string;
  regularPrice: string;
  groupPrice: string;
  target: number;
  current: number;
  discount: number;
  status: "active" | "reached" | "expired" | "cancelled";
  endsIn: string;
  created: string;
}

export default function AdminGroupBuyPage() {
  const [activeTab, setActiveTab] = useState("active");

  const deals: GroupBuyDeal[] = [
    { id: "g1", product: "Blender Pro 2000W", vendor: "Kitchen World", regularPrice: "₦45,000", groupPrice: "₦32,000", target: 5, current: 3, discount: 29, status: "active", endsIn: "18h 24m", created: "2 days ago" },
    { id: "g2", product: "Wireless Earbuds Pro", vendor: "TechHub NG", regularPrice: "₦25,000", groupPrice: "₦18,000", target: 10, current: 7, discount: 28, status: "active", endsIn: "1d 6h", created: "3 days ago" },
    { id: "g3", product: "Smart Watch S3", vendor: "Gadget Galaxy", regularPrice: "₦85,000", groupPrice: "₦62,000", target: 5, current: 5, discount: 27, status: "reached", endsIn: "-", created: "5 days ago" },
    { id: "g4", product: "Portable Speaker Boom", vendor: "AudioPro NG", regularPrice: "₦35,000", groupPrice: "₦24,500", target: 8, current: 2, discount: 30, status: "active", endsIn: "3d 8h", created: "1 week ago" },
    { id: "g5", product: "Yoga Mat Premium", vendor: "FitLife Store", regularPrice: "₦12,000", groupPrice: "₦8,500", target: 6, current: 1, discount: 29, status: "expired", endsIn: "-", created: "2 weeks ago" },
  ];

  const filteredDeals = activeTab === "active" ? deals.filter(d => d.status === "active")
    : activeTab === "reached" ? deals.filter(d => d.status === "reached")
    : activeTab === "expired" ? deals.filter(d => d.status === "expired" || d.status === "cancelled")
    : deals;

  return (
    <AdminShell title="Group Buy" subtitle="Manage group buying deals across all vendors">
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto">
          {["active", "reached", "expired", "all"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all capitalize ${activeTab === tab ? 'bg-blue text-white' : 'bg-white text-text-3 border border-border hover:bg-off-white'}`}>
              {tab === "all" ? "All Deals" : `${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Active Deals", value: "24", icon: TrendingDown, color: "bg-blue-50 text-blue" },
            { label: "Targets Reached", value: "18", icon: CheckCircle, color: "bg-green-50 text-green-700" },
            { label: "Total Participants", value: "1,247", icon: Users, color: "bg-purple-50 text-purple-600" },
            { label: "Expired", value: "7", icon: XCircle, color: "bg-gray-100 text-text-4" },
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

        <div className="bg-white rounded-xl border border-border">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex-1 relative max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input placeholder="Search deals..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" />
            </div>
            <Button size="sm"><Plus size={14} className="mr-1" /> New Deal</Button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-off-white">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-text-4">Product</th>
                <th className="text-left px-5 py-3 font-medium text-text-4">Vendor</th>
                <th className="text-right px-5 py-3 font-medium text-text-4">Regular</th>
                <th className="text-right px-5 py-3 font-medium text-text-4">Group Price</th>
                <th className="text-center px-5 py-3 font-medium text-text-4">Discount</th>
                <th className="text-center px-5 py-3 font-medium text-text-4">Progress</th>
                <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                <th className="text-right px-5 py-3 font-medium text-text-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDeals.map(d => (
                <tr key={d.id} className="hover:bg-off-white">
                  <td className="px-5 py-3 font-medium text-text-1">{d.product}</td>
                  <td className="px-5 py-3 text-text-4">{d.vendor}</td>
                  <td className="px-5 py-3 text-right text-text-4 line-through">{d.regularPrice}</td>
                  <td className="px-5 py-3 text-right font-medium text-orange">{d.groupPrice}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs font-bold text-green-700">-{d.discount}%</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(d.current / d.target) * 100}%` }} />
                      </div>
                      <span className="text-xs text-text-4">{d.current}/{d.target}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === 'active' ? 'bg-green-50 text-green-700' : d.status === 'reached' ? 'bg-blue-50 text-blue' : 'bg-gray-100 text-text-4'}`}>{d.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded"><Eye size={14} className="text-text-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
