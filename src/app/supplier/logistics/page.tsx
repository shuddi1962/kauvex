"use client";

import { useState } from "react";
import { Package2, Truck, MapPin, ArrowRight, Box, ClipboardCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";

const tabs = [
  { id: "packaging", label: "Packaging", icon: Package2 },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "coverage", label: "Coverage", icon: MapPin },
];

const materials = [
  { item: "Kauvex Branded Box (Medium)", stock: 240, min: 50, unit: "pcs" },
  { item: "Kauvex Branded Box (Large)", stock: 120, min: 30, unit: "pcs" },
  { item: "Kauvex Polybag (S)", stock: 500, min: 100, unit: "pcs" },
  { item: "Kauvex Polybag (M)", stock: 380, min: 100, unit: "pcs" },
  { item: "Kauvex Tape (Clear)", stock: 45, min: 20, unit: "rolls" },
  { item: "Kauvex Label Sheets", stock: 15, min: 25, unit: "sheets" },
  { item: "Kauvex Thank You Cards", stock: 200, min: 50, unit: "pcs" },
  { item: "Kauvex Stickers (Fragile)", stock: 8, min: 20, unit: "rolls" },
];

const deliveries = [
  { id: "DEL-001", customer: "Chidi Okafor", area: "Ikeja", item: "Indomie Chicken Pack x50", status: "pending", method: "Own Rider" },
  { id: "DEL-002", customer: "Aisha Bello", area: "Lekki", item: "Milo Tin 500g x24", status: "in-transit", method: "GIG" },
  { id: "DEL-003", customer: "Emeka Nwosu", area: "VI", item: "Coke 50cl Crate x10", status: "pending", method: "Kwik" },
  { id: "DEL-004", customer: "Funmi Adeyemi", area: "Surulere", item: "Peak Milk 400g x36", status: "delivered", method: "Own Rider" },
  { id: "DEL-005", customer: "Segun Ogun", area: "Ikeja", item: "Dangote Sugar 1kg x20", status: "in-transit", method: "Kauvex Logistics" },
];

const areas = [
  { state: "Lagos", city: "Ikeja", active: true },
  { state: "Lagos", city: "Lekki", active: true },
  { state: "Lagos", city: "Victoria Island", active: true },
  { state: "Lagos", city: "Surulere", active: true },
  { state: "Ogun", city: "Abeokuta", active: false },
];

export default function SupplierLogisticsPage() {
  const [activeTab, setActiveTab] = useState("packaging");

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      "in-transit": "bg-blue-100 text-blue-700",
      delivered: "bg-green-100 text-green-700",
    };
    return map[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1628] text-white px-6 py-4">
        <h1 className="text-xl font-bold">Kauvex Supplier Portal</h1>
        <p className="text-sm text-gray-400">Lagos Wholesale Mart</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0A1628]">Logistics</h2>
          <div className="flex gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#FF6B00] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#FF6B00]'}`}>
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "packaging" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue flex items-center justify-center"><Box size={20} /></div>
                  <div>
                    <p className="text-2xl font-bold text-[#0A1628]">{materials.reduce((s, m) => s + m.stock, 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Units in Stock</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"><ClipboardCheck size={20} /></div>
                  <div>
                    <p className="text-2xl font-bold text-[#0A1628]">{materials.filter(m => m.stock < m.min).length}</p>
                    <p className="text-sm text-gray-500">Items Below Minimum</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><ShieldCheck size={20} /></div>
                  <div>
                    <p className="text-2xl font-bold text-[#0A1628]">87%</p>
                    <p className="text-sm text-gray-500">Compliance Score</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-[#0A1628]">Materials Inventory</h3>
                <Link href="/supplier/logistics/packaging" className="flex items-center gap-1 text-sm text-[#FF6B00] hover:underline">
                  Manage <ArrowRight size={14} />
                </Link>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-gray-500">Item</th>
                    <th className="text-right px-5 py-3 font-medium text-gray-500">Stock</th>
                    <th className="text-right px-5 py-3 font-medium text-gray-500">Min</th>
                    <th className="text-right px-5 py-3 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {materials.map((m, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-[#0A1628]">{m.item}</td>
                      <td className="px-5 py-3 text-right">{m.stock}</td>
                      <td className="px-5 py-3 text-right text-gray-500">{m.min}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${m.stock >= m.min ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {m.stock >= m.min ? "OK" : "Low Stock"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-[#0A1628] mb-3">Packaging Standards</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-1">•</span> All products must be shipped in Kauvex-branded packaging</li>
                <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-1">•</span> Fragile items must include bubble wrap or void fill (minimum 2&quot; clearance)</li>
                <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-1">•</span> Perishable goods require insulated lining + ice packs</li>
                <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-1">•</span> Each package must have a Kauvex shipping label on the top face</li>
                <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-1">•</span> Liquids must be sealed in leak-proof bags before boxing</li>
                <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-1">•</span> Maximum weight per box: 25kg (medium), 40kg (large)</li>
                <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-1">•</span> Include packing slip inside each shipment</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "delivery" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-3"><Truck size={20} /></div>
                <p className="text-2xl font-bold text-[#0A1628]">{deliveries.filter(d => d.status === "delivered").length}</p>
                <p className="text-sm text-gray-500">Delivered Today</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue flex items-center justify-center mb-3"><MapPin size={20} /></div>
                <p className="text-2xl font-bold text-[#0A1628]">{deliveries.filter(d => d.status !== "delivered").length}</p>
                <p className="text-sm text-gray-500">Active Deliveries</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3"><ShieldCheck size={20} /></div>
                <p className="text-2xl font-bold text-[#0A1628]">94%</p>
                <p className="text-sm text-gray-500">On-Time Rate</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-[#0A1628]">Active Deliveries Today</h3>
                <Link href="/supplier/logistics/delivery" className="flex items-center gap-1 text-sm text-[#FF6B00] hover:underline">
                  Manage <ArrowRight size={14} />
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {deliveries.map(d => (
                  <div key={d.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#0A1628]">{d.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(d.status)}`}>{d.status}</span>
                      </div>
                      <p className="text-sm text-gray-600">{d.item}</p>
                      <p className="text-xs text-gray-400">{d.customer} • {d.area} • via {d.method}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-[#0A1628] mb-3">Delivery Method</h3>
              <p className="text-sm text-gray-600 mb-2">Current method: <span className="font-medium text-[#0A1628]">Own Rider + GIG</span></p>
              <Link href="/supplier/logistics/delivery" className="text-sm text-[#FF6B00] hover:underline">Change Settings →</Link>
            </div>
          </div>
        )}

        {activeTab === "coverage" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue flex items-center justify-center mb-3"><MapPin size={20} /></div>
                <p className="text-2xl font-bold text-[#0A1628]">{areas.filter(a => a.active).length}</p>
                <p className="text-sm text-gray-500">Active Coverage Areas</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-3"><ShieldCheck size={20} /></div>
                <p className="text-2xl font-bold text-[#0A1628]">{new Set(areas.map(a => a.state)).size}</p>
                <p className="text-sm text-gray-500">States Covered</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center mb-3"><Truck size={20} /></div>
                <p className="text-2xl font-bold text-[#0A1628]">25 km</p>
                <p className="text-sm text-gray-500">Avg. Delivery Radius</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-[#0A1628]">Coverage Areas</h3>
                <Link href="/supplier/coverage" className="text-sm text-[#FF6B00] hover:underline">Manage Coverage →</Link>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-gray-500">State</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500">City</th>
                    <th className="text-center px-5 py-3 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {areas.map((a, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-[#0A1628]">{a.state}</td>
                      <td className="px-5 py-3 text-gray-600">{a.city}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${a.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {a.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
