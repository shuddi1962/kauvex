"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Palette, ShoppingBag, TrendingUp, Download, Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import AdminShell from "@/components/admin/admin-shell";

interface PodDesign {
  id: string;
  name: string;
  creator: string;
  category: string;
  status: "active" | "draft";
  licensePrice: string;
  products: number;
  licenses: number;
  createdAt: string;
}

interface PodProduct {
  id: string;
  name: string;
  design: string;
  productType: string;
  retailPrice: string;
  baseCost: string;
  orders: number;
  status: string;
}

export default function AdminPODPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const designs: PodDesign[] = [
    { id: "d1", name: "Geometric Waves", creator: "ArtByKemi", category: "Abstract", status: "active", licensePrice: "₦5,000", products: 3, licenses: 12, createdAt: "2 days ago" },
    { id: "d2", name: "Tropical Vibes", creator: "DesignHouseNG", category: "Nature", status: "active", licensePrice: "₦3,500", products: 2, licenses: 8, createdAt: "5 days ago" },
    { id: "d3", name: "Minimalist Lines", creator: "SketchLab", category: "Minimalist", status: "draft", licensePrice: "₦4,000", products: 0, licenses: 0, createdAt: "1 week ago" },
  ];

  const products: PodProduct[] = [
    { id: "p1", name: "Wave Pattern T-Shirt", design: "Geometric Waves", productType: "T-Shirt", retailPrice: "₦12,000", baseCost: "₦4,500", orders: 34, status: "active" },
    { id: "p2", name: "Tropical Mug", design: "Tropical Vibes", productType: "Mug", retailPrice: "₦6,500", baseCost: "₦2,200", orders: 18, status: "active" },
    { id: "p3", name: "Lines Canvas Print", design: "Minimalist Lines", productType: "Canvas", retailPrice: "₦18,000", baseCost: "₦6,000", orders: 0, status: "draft" },
  ];

  return (
    <AdminShell title="Print on Demand" subtitle="Manage POD designs, products, and orders across all vendors">
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto">
          {["overview", "designs", "products", "orders", "vendors"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all capitalize ${activeTab === tab ? 'bg-blue text-white' : 'bg-white text-text-3 border border-border hover:bg-off-white'}`}>
              {tab === "overview" ? "Overview" : `${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Designs", value: "156", icon: Palette, color: "bg-purple-50 text-purple-600" },
            { label: "POD Products", value: "342", icon: ShoppingBag, color: "bg-blue-50 text-blue" },
            { label: "POD Orders", value: "891", icon: TrendingUp, color: "bg-green-50 text-green-700" },
            { label: "Total Revenue", value: "₦4.2M", icon: Download, color: "bg-orange-50 text-orange" },
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

        {activeTab === "designs" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-text-1">All Designs</h3>
              <Button size="sm"><Plus size={14} className="mr-1" /> Add Design</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-off-white">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Design</th>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Creator</th>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Category</th>
                  <th className="text-right px-5 py-3 font-medium text-text-4">License Price</th>
                  <th className="text-center px-5 py-3 font-medium text-text-4">Products</th>
                  <th className="text-center px-5 py-3 font-medium text-text-4">Licenses</th>
                  <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-text-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {designs.map(d => (
                  <tr key={d.id} className="hover:bg-off-white">
                    <td className="px-5 py-3 font-medium text-text-1">{d.name}</td>
                    <td className="px-5 py-3 text-text-4">{d.creator}</td>
                    <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-text-4">{d.category}</span></td>
                    <td className="px-5 py-3 text-right">{d.licensePrice}</td>
                    <td className="px-5 py-3 text-center">{d.products}</td>
                    <td className="px-5 py-3 text-center">{d.licenses}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-text-4'}`}>{d.status}</span>
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

        {activeTab === "products" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-text-1">POD Products</h3>
              <Button size="sm"><Plus size={14} className="mr-1" /> Add Product</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-off-white">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Product</th>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Design</th>
                  <th className="text-left px-5 py-3 font-medium text-text-4">Type</th>
                  <th className="text-right px-5 py-3 font-medium text-text-4">Retail</th>
                  <th className="text-right px-5 py-3 font-medium text-text-4">Cost</th>
                  <th className="text-center px-5 py-3 font-medium text-text-4">Orders</th>
                  <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                  <th className="text-right px-5 py-3 font-medium text-text-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-off-white">
                    <td className="px-5 py-3 font-medium text-text-1">{p.name}</td>
                    <td className="px-5 py-3 text-text-4">{p.design}</td>
                    <td className="px-5 py-3 text-text-4">{p.productType}</td>
                    <td className="px-5 py-3 text-right font-medium">{p.retailPrice}</td>
                    <td className="px-5 py-3 text-right text-text-4">{p.baseCost}</td>
                    <td className="px-5 py-3 text-center">{p.orders}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-text-4'}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded"><Eye size={14} className="text-text-4" /></button>
                        <button className="p-1.5 hover:bg-gray-100 rounded"><Edit size={14} className="text-text-4" /></button>
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
              <h3 className="font-bold text-text-1 mb-3">Latest Designs</h3>
              <div className="space-y-3">
                {designs.slice(0, 3).map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-off-white rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-text-1">{d.name}</p>
                      <p className="text-xs text-text-4">by {d.creator} · {d.createdAt}</p>
                    </div>
                    <span className="text-xs font-medium text-text-4">{d.licensePrice}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-bold text-text-1 mb-3">Top POD Products</h3>
              <div className="space-y-3">
                {products.filter(p => p.status === "active").map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-off-white rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-text-1">{p.name}</p>
                      <p className="text-xs text-text-4">{p.orders} orders · {p.productType}</p>
                    </div>
                    <span className="text-xs font-medium text-green-700">{p.retailPrice}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
