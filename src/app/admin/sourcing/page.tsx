"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Package, Users, Plus, CheckCircle, AlertCircle, Clock } from "lucide-react";
import AdminShell from "@/components/admin/admin-shell";

export default function AdminSourcingPage() {
  const tabs = [
    { id: "research", label: "Product Research" },
    { id: "requests", label: "Customer Requests" },
    { id: "suppliers", label: "Supplier Outreach" },
    { id: "active", label: "Active Sourcing" },
    { id: "analytics", label: "Analytics" },
  ];

  const [activeTab, setActiveTab] = useState("research");

  const researchItems = [
    { name: "Wireless Charging Pad 3-in-1", category: "Electronics", estPrice: "₦12,000", estCost: "₦5,000", margin: 58.3, demand: 85, competition: "Medium", status: "research" },
    { name: "Organic Shea Butter Set", category: "Beauty", estPrice: "₦8,500", estCost: "₦3,200", margin: 62.4, demand: 72, competition: "Low", status: "approved" },
    { name: "Smart LED Strip Lights", category: "Electronics", estPrice: "₦15,000", estCost: "₦6,500", margin: 56.7, demand: 91, competition: "High", status: "research" },
    { name: "Reusable Silicone Food Lids", category: "Home", estPrice: "₦4,500", estCost: "₦1,800", margin: 60.0, demand: 45, competition: "Low", status: "sourcing" },
  ];

  const customerRequests = [
    { id: "KVR-2847", product: "Sony WH-1000XM5", customer: "chidi@email.com", budget: "₦250,000-₦350,000", status: "found", created: "2 hours ago" },
    { id: "KVR-2846", product: "Nike Air Max 90 Size 44", customer: "tunde@email.com", budget: "₦45,000-₦60,000", status: "searching", created: "1 day ago" },
    { id: "KVR-2845", product: "Instant Pot Duo 6qt", customer: "funmi@email.com", budget: "₦80,000-₦120,000", status: "pending", created: "3 days ago" },
  ];

  return (
    <AdminShell title="Product Sourcing" subtitle="Research, source, and list new products">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-blue text-white' : 'bg-white text-text-3 border border-border hover:bg-off-white'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <Button size="sm"><Plus size={14} className="mr-1" /> New Research</Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "In Research", value: "12", icon: Search, color: "bg-blue-50 text-blue" },
            { label: "Approved to Source", value: "5", icon: CheckCircle, color: "bg-green-50 text-green-700" },
            { label: "Active Sourcing", value: "3", icon: Package, color: "bg-orange-50 text-orange" },
            { label: "Customer Requests", value: "8", icon: Users, color: "bg-purple-50 text-purple-700" },
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

        {activeTab === "research" && (
          <div className="bg-white rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-off-white">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Product</th>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Category</th>
                  <th className="text-right px-5 py-3 font-medium text-text-4">Est. Price</th>
                  <th className="text-right px-5 py-3 font-medium text-text-4">Est. Cost</th>
                  <th className="text-right px-5 py-3 font-medium text-text-4">Margin</th>
                  <th className="text-center px-5 py-3 font-medium text-text-4">Demand</th>
                  <th className="text-center px-5 py-3 font-medium text-text-4">Competition</th>
                  <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {researchItems.map(r => (
                  <tr key={r.name} className="hover:bg-off-white">
                    <td className="px-5 py-3 font-medium text-text-1">{r.name}</td>
                    <td className="px-5 py-3 text-text-4">{r.category}</td>
                    <td className="px-5 py-3 text-right">{r.estPrice}</td>
                    <td className="px-5 py-3 text-right text-text-4">{r.estCost}</td>
                    <td className="px-5 py-3 text-right font-semibold text-green-600">{r.margin}%</td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                          <div className={`h-1.5 rounded-full ${r.demand > 80 ? 'bg-green-500' : r.demand > 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${r.demand}%` }} />
                        </div>
                        <span className="text-xs text-text-4">{r.demand}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.competition === 'Low' ? 'bg-green-50 text-green-700' : r.competition === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>{r.competition}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'research' ? 'bg-blue-50 text-blue' : r.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange'}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "requests" && (
          <div className="bg-white rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-off-white">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Request ID</th>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Product</th>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Customer</th>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Budget</th>
                  <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-text-4">Created</th>
                  <th className="text-right px-5 py-3 font-medium text-text-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customerRequests.map(r => (
                  <tr key={r.id} className="hover:bg-off-white">
                    <td className="px-5 py-3 font-mono text-xs font-medium">{r.id}</td>
                    <td className="px-5 py-3 font-medium text-text-1">{r.product}</td>
                    <td className="px-5 py-3 text-text-4">{r.customer}</td>
                    <td className="px-5 py-3">{r.budget}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'found' ? 'bg-green-50 text-green-700' : r.status === 'searching' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{r.status}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-text-4">{r.created}</td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="outline">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
