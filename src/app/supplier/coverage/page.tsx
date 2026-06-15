"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export default function SupplierCoveragePage() {
  const [areas] = useState([
    { country: "Nigeria", state: "Lagos", city: "Ikeja", active: true },
    { country: "Nigeria", state: "Lagos", city: "Lekki", active: true },
    { country: "Nigeria", state: "Lagos", city: "Victoria Island", active: true },
    { country: "Nigeria", state: "Lagos", city: "Surulere", active: true },
    { country: "Nigeria", state: "Ogun", city: "Abeokuta", active: false },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1628] text-white px-6 py-4">
        <h1 className="text-xl font-bold">Kauvex Supplier Portal</h1>
        <p className="text-sm text-gray-400">Lagos Wholesale Mart</p>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0A1628]">Delivery Coverage Areas</h2>
          <Button className="bg-[#FF6B00] hover:bg-[#e86000]"><Plus size={16} className="mr-1" /> Add Area</Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Country</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">State</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">City</th>
                <th className="text-center px-5 py-3 font-medium text-gray-500">Active</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {areas.map((a, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{a.country}</td>
                  <td className="px-5 py-3">{a.state}</td>
                  <td className="px-5 py-3">{a.city}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${a.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {a.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">How Coverage Works</p>
          <p className="text-sm text-blue-700 mt-1">Customers can only order your products if their delivery address is within your active coverage areas. Add all cities and states you can deliver to.</p>
        </div>
      </div>
    </div>
  );
}
