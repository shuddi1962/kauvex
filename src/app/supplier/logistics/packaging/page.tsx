"use client";

import { useState } from "react";
import { Box, ClipboardCheck, ShieldCheck, AlertTriangle, Package2, Send, Plus } from "lucide-react";

const materials = [
  { item: "Kauvex Branded Box (Small)", sku: "KVX-BOX-S", stock: 500, min: 100, unit: "pcs", cost: "₦150" },
  { item: "Kauvex Branded Box (Medium)", sku: "KVX-BOX-M", stock: 240, min: 50, unit: "pcs", cost: "₦250" },
  { item: "Kauvex Branded Box (Large)", sku: "KVX-BOX-L", stock: 120, min: 30, unit: "pcs", cost: "₦400" },
  { item: "Kauvex Polybag (Small)", sku: "KVX-PBG-S", stock: 500, min: 100, unit: "pcs", cost: "₦30" },
  { item: "Kauvex Polybag (Medium)", sku: "KVX-PBG-M", stock: 380, min: 100, unit: "pcs", cost: "₦45" },
  { item: "Kauvex Polybag (Large)", sku: "KVX-PBG-L", stock: 200, min: 80, unit: "pcs", cost: "₦60" },
  { item: "Kauvex Tape (Clear)", sku: "KVX-TPE-C", stock: 45, min: 20, unit: "rolls", cost: "₦350" },
  { item: "Kauvex Tape (Brown)", sku: "KVX-TPE-B", stock: 30, min: 20, unit: "rolls", cost: "₦350" },
  { item: "Kauvex Label Sheets (A4)", sku: "KVX-LBL-A4", stock: 15, min: 25, unit: "sheets", cost: "₦120" },
  { item: "Kauvex Thank You Cards", sku: "KVX-THC", stock: 200, min: 50, unit: "pcs", cost: "₦25" },
  { item: "Kauvex Stickers (Fragile)", sku: "KVX-STK-F", stock: 8, min: 20, unit: "rolls", cost: "₦500" },
  { item: "Kauvex Stickers (This Side Up)", sku: "KVX-STK-U", stock: 12, min: 20, unit: "rolls", cost: "₦500" },
  { item: "Bubble Wrap Roll", sku: "KVX-BWR", stock: 6, min: 10, unit: "rolls", cost: "₦1,200" },
  { item: "Void Fill Pack (5kg)", sku: "KVX-VFL", stock: 18, min: 5, unit: "packs", cost: "₦800" },
];

const itemOptions = [
  "Kauvex Branded Box (Small)",
  "Kauvex Branded Box (Medium)",
  "Kauvex Branded Box (Large)",
  "Kauvex Polybag (Small)",
  "Kauvex Polybag (Medium)",
  "Kauvex Polybag (Large)",
  "Kauvex Tape (Clear)",
  "Kauvex Tape (Brown)",
  "Kauvex Label Sheets (A4)",
  "Kauvex Thank You Cards",
  "Kauvex Stickers (Fragile)",
  "Kauvex Stickers (This Side Up)",
  "Bubble Wrap Roll",
  "Void Fill Pack (5kg)",
];

export default function SupplierPackagingPage() {
  const [requestItem, setRequestItem] = useState("");
  const [requestQty, setRequestQty] = useState("");
  const [deliveryAddr, setDeliveryAddr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
      setRequestItem("");
      setRequestQty("");
      setDeliveryAddr("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1628] text-white px-6 py-4">
        <h1 className="text-xl font-bold">Kauvex Supplier Portal</h1>
        <p className="text-sm text-gray-400">Lagos Wholesale Mart</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0A1628]">Packaging Management</h2>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#FF6B00] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e86000] transition-all">
            <Plus size={16} /> Request Materials
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue flex items-center justify-center mb-3"><Package2 size={20} /></div>
            <p className="text-2xl font-bold text-[#0A1628]">{materials.reduce((s, m) => s + m.stock, 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Units in Stock</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue flex items-center justify-center mb-3"><Box size={20} /></div>
            <p className="text-2xl font-bold text-[#0A1628]">{materials.length}</p>
            <p className="text-sm text-gray-500">Unique SKUs</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center mb-3"><AlertTriangle size={20} /></div>
            <p className="text-2xl font-bold text-[#0A1628]">{materials.filter(m => m.stock < m.min).length}</p>
            <p className="text-sm text-gray-500">Items Below Minimum</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-3"><ClipboardCheck size={20} /></div>
            <p className="text-2xl font-bold text-[#0A1628]">87%</p>
            <p className="text-sm text-gray-500">Compliance Score</p>
          </div>
        </div>

        {/* Request Materials Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-[#0A1628] text-lg mb-4">Request Packaging Materials</h3>
            {submitted ? (
              <div className="flex items-center gap-3 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                <ShieldCheck size={20} />
                <span className="font-medium">Request submitted successfully! Your materials will be delivered within 2-3 business days.</span>
              </div>
            ) : (
              <form onSubmit={handleRequest} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
                  <select value={requestItem} onChange={e => setRequestItem(e.target.value)} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent">
                    <option value="">Select item...</option>
                    {itemOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input type="number" min={1} value={requestQty} onChange={e => setRequestQty(e.target.value)} required placeholder="e.g. 50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <textarea value={deliveryAddr} onChange={e => setDeliveryAddr(e.target.value)} required placeholder="Enter your warehouse or store address" rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent" />
                </div>
                <div className="col-span-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="submit"
                    className="flex items-center gap-2 bg-[#FF6B00] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e86000] transition-all">
                    <Send size={16} /> Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Materials Inventory Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-[#0A1628]">Materials Inventory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Item</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">SKU</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Stock</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Min</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Unit Cost</th>
                  <th className="text-center px-5 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {materials.map((m, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-[#0A1628]">{m.item}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{m.sku}</td>
                    <td className="px-5 py-3 text-right">{m.stock} {m.unit}</td>
                    <td className="px-5 py-3 text-right text-gray-500">{m.min} {m.unit}</td>
                    <td className="px-5 py-3 text-right">{m.cost}</td>
                    <td className="px-5 py-3 text-center">
                      {m.stock === 0 ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Out of Stock</span>
                      ) : m.stock < m.min ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Low Stock</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">In Stock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Packaging Standards + Compliance Side by Side */}
        <div className="grid grid-cols-2 gap-6">
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
              <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-1">•</span> Use Kauvex thank you card for all customer orders</li>
              <li className="flex items-start gap-2"><span className="text-[#FF6B00] mt-1">•</span> Apply Fragile stickers on all sides for glass/electronics</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-[#0A1628] mb-4">Compliance Status</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#FF6B00" strokeWidth="3"
                    strokeDasharray={`${87 * 2.44} ${100 * 2.44}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#0A1628]">87%</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Last Audit Date</span>
                <span className="font-medium text-[#0A1628]">June 15, 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Audit Frequency</span>
                <span className="font-medium text-[#0A1628]">Monthly</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Outstanding Issues</span>
                <span className="font-medium text-red-500">3</span>
              </div>
              <div className="border-t border-gray-100 pt-3 mt-3">
                <p className="font-medium text-[#0A1628] mb-2">Issues to Resolve:</p>
                <ul className="space-y-1 text-gray-600">
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span> 2 shipments missing packing slip (resolved)</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-400 mt-1">•</span> Below minimum stock for label sheets</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-400 mt-1">•</span> Below minimum stock for fragile stickers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
