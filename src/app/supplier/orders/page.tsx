"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Truck } from "lucide-react";

export default function SupplierOrdersPage() {
  const [orders] = useState([
    { id: "KAU-2847", product: "Indomie Chicken Pack x50", customer: "Chidi Okafor", amount: "₦32,500", status: "pending", deadline: "Confirm within 2 hours" },
    { id: "KAU-2841", product: "Milo Tin 500g x24", customer: "Aisha Bello", amount: "₦28,800", status: "preparing", deadline: "Ship today" },
    { id: "KAU-2835", product: "Coke 50cl Crate x10", customer: "Emeka Nwosu", amount: "₦15,000", status: "shipped", deadline: "In transit" },
    { id: "KAU-2829", product: "Peak Milk 400g x36", customer: "Funmi Adeyemi", amount: "₦54,000", status: "delivered", deadline: "Completed" },
  ]);

  const tabs = [
    { id: "new", label: "New Orders", count: 1 },
    { id: "preparing", label: "Preparing", count: 1 },
    { id: "shipped", label: "Shipped", count: 1 },
    { id: "completed", label: "Completed", count: 1 },
    { id: "all", label: "All Orders" },
  ];

  const [activeTab, setActiveTab] = useState("new");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1628] text-white px-6 py-4">
        <h1 className="text-xl font-bold">Kauvex Supplier Portal</h1>
        <p className="text-sm text-gray-400">Lagos Wholesale Mart</p>
      </div>
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-[#0A1628]">Orders</h2>

        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-[#FF6B00] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#FF6B00]'}`}>
              {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {orders.filter(o => activeTab === 'all' || o.status === activeTab).map(order => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-[#0A1628]">{order.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : order.status === 'preparing' ? 'bg-blue-100 text-blue-700' : order.status === 'shipped' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {order.status}
                  </span>
                </div>
                <p className="font-medium">{order.product}</p>
                <p className="text-sm text-gray-500">{order.customer} • {order.amount}</p>
                <p className="text-xs text-gray-400 mt-1">{order.deadline}</p>
              </div>
              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700"><CheckCircle size={14} className="mr-1" /> Confirm Order</Button>
                )}
                {order.status === 'preparing' && (
                  <Button size="sm" className="bg-[#FF6B00] hover:bg-[#e86000]"><Truck size={14} className="mr-1" /> Mark Shipped</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
