"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function PODProductsPage() {
  const [products] = useState([
    { name: "Geometric Pattern T-Shirt", type: "T-Shirt", partner: "Printful", price: "₦8,500", cost: "₦4,200", status: "active" },
    { name: "Navy Waves Hoodie", type: "Hoodie", partner: "Printful", price: "₦15,000", cost: "₦7,800", status: "active" },
    { name: "Minimalist Mug Set", type: "Mug", partner: "Printify", price: "₦5,000", cost: "₦2,500", status: "active" },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="w-56 bg-white border-r border-gray-200 p-4 space-y-1 min-h-screen">
          <h2 className="font-bold text-[#0A1628] px-3 mb-4">POD Studio</h2>
          {[
            { label: "Dashboard", href: "/vendor/pod", active: false },
            { label: "Design Studio", href: "/vendor/pod/design-studio", active: false },
            { label: "My Products", href: "/vendor/pod/products", active: true },
            { label: "Orders", href: "/vendor/pod/orders", active: false },
            { label: "Analytics", href: "/vendor/pod/analytics", active: false },
            { label: "Design Marketplace", href: "/pod-marketplace", active: false },
          ].map(l => (
            <Link key={l.label} href={l.href} className={`block px-3 py-2 rounded-lg text-sm ${l.active ? 'bg-[#FF6B00] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{l.label}</Link>
          ))}
        </div>
        <div className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#0A1628]">My POD Products</h1>
            <Button className="bg-[#FF6B00] hover:bg-[#e86000]"><Plus size={16} className="mr-1" /> Create Product</Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Product</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Fulfillment</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Price</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Cost</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Profit</th>
                  <th className="text-center px-5 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.name} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-[#0A1628]">{p.name}</td>
                    <td className="px-5 py-3 text-gray-500">{p.type}</td>
                    <td className="px-5 py-3 text-gray-500">{p.partner}</td>
                    <td className="px-5 py-3 text-right">{p.price}</td>
                    <td className="px-5 py-3 text-right text-gray-500">{p.cost}</td>
                    <td className="px-5 py-3 text-right font-semibold text-green-600">+₦{Number(p.price.replace(/[₦,]/g, '')) - Number(p.cost.replace(/[₦,]/g, ''))}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
