"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SupplierProductsPage() {
  const [products] = useState([
    { name: "Indomie Chicken Flavor", sku: "IND-001", price: "₦650", stock: 340, status: "active" },
    { name: "Milo Activ-Go 500g", sku: "MIL-001", price: "₦1,200", stock: 28, status: "low_stock" },
    { name: "Peak Milk 400g Tin", sku: "PEAK-001", price: "₦1,500", stock: 0, status: "out_of_stock" },
    { name: "Coca-Cola 50cl Bottle", sku: "COKE-001", price: "₦150", stock: 1200, status: "active" },
  ]);

  const statusStyles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    low_stock: "bg-yellow-100 text-yellow-700",
    out_of_stock: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1628] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Kauvex Supplier Portal</h1>
          <p className="text-sm text-gray-400">Lagos Wholesale Mart</p>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#0A1628]">My Products</h2>
          <Button className="bg-[#FF6B00] hover:bg-[#e86000]"><Plus size={16} className="mr-1" /> Add Product</Button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Product</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">SKU</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Price</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Stock</th>
                <th className="text-center px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.sku} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-[#0A1628]">{p.name}</td>
                  <td className="px-5 py-3 text-gray-500">{p.sku}</td>
                  <td className="px-5 py-3 text-right font-semibold">{p.price}</td>
                  <td className="px-5 py-3 text-right">{p.stock}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[p.status]}`}>{p.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-[#FF6B00] text-sm hover:underline">Update Stock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
