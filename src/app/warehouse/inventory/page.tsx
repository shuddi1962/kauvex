"use client";

import { useState } from "react";
import { Package, MapPin, BarChart3, CheckCircle2, AlertTriangle, Search } from "lucide-react";

interface InventoryItem {
  id: string;
  product: string;
  vendor: string;
  sku: string;
  bin: string;
  onHand: number;
  reserved: number;
  available: number;
  inbound: number;
}

interface BinZone {
  id: string;
  name: string;
  total: number;
  used: number;
  utilization: number;
}

const seedInventory: InventoryItem[] = [
  { id: "1", product: "Wireless Earbuds Pro", vendor: "TechGadgets NG", sku: "WEB-001", bin: "A-12-3", onHand: 48, reserved: 5, available: 43, inbound: 50 },
  { id: "2", product: "iPhone 15 Case", vendor: "TechGadgets NG", sku: "IPC-002", bin: "B-04-1", onHand: 120, reserved: 12, available: 108, inbound: 0 },
  { id: "3", product: "Men's Running Shoes", vendor: "FashionHub Lagos", sku: "MRS-010", bin: "C-08-2", onHand: 35, reserved: 8, available: 27, inbound: 30 },
  { id: "4", product: "Organic Green Tea Box", vendor: "HomeEssentials Ltd", sku: "OGT-005", bin: "D-02-4", onHand: 200, reserved: 15, available: 185, inbound: 100 },
  { id: "5", product: "Bluetooth Speaker", vendor: "ElectroWorld PLC", sku: "BTS-003", bin: "A-15-1", onHand: 18, reserved: 3, available: 15, inbound: 20 },
  { id: "6", product: "Yoga Mat Premium", vendor: "FashionHub Lagos", sku: "YMP-001", bin: "C-12-1", onHand: 60, reserved: 10, available: 50, inbound: 0 },
];

const seedBins: BinZone[] = [
  { id: "A", name: "Zone A - Electronics", total: 200, used: 185, utilization: 92.5 },
  { id: "B", name: "Zone B - Accessories", total: 150, used: 120, utilization: 80 },
  { id: "C", name: "Zone C - Fashion", total: 180, used: 95, utilization: 52.8 },
  { id: "D", name: "Zone D - General", total: 250, used: 210, utilization: 84 },
  { id: "E", name: "Zone E - Bulk Storage", total: 300, used: 100, utilization: 33.3 },
];

export default function WarehouseInventoryPage() {
  const [search, setSearch] = useState("");
  const [inventory] = useState(seedInventory);
  const [bins] = useState(seedBins);

  const filtered = inventory.filter(i =>
    i.product.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#0A1628]">Inventory</h1>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product or SKU..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <Package size={16} className="text-[#FF6B00]" /> Full Inventory
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase">
            <tr>
              {["Product", "Vendor", "SKU", "Bin", "On Hand", "Reserved", "Available", "Inbound"].map(h => (
                <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-[#0A1628]">{item.product}</td>
                <td className="px-4 py-3 text-gray-500">{item.vendor}</td>
                <td className="px-4 py-3 text-gray-500">{item.sku}</td>
                <td className="px-4 py-3"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">{item.bin}</span></td>
                <td className="px-4 py-3 font-medium">{item.onHand}</td>
                <td className="px-4 py-3 text-yellow-600">{item.reserved}</td>
                <td className="px-4 py-3 font-medium text-green-600">{item.available}</td>
                <td className="px-4 py-3">{item.inbound > 0 ? <span className="text-blue-600">{item.inbound}</span> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bin Management */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <MapPin size={16} className="text-[#FF6B00]" /> Bin Management
          </h3>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          {bins.map((zone) => (
            <div key={zone.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm text-[#0A1628]">{zone.name}</p>
                <span className="text-xs text-gray-500">{zone.used}/{zone.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${zone.utilization > 85 ? "bg-orange" : zone.utilization > 60 ? "bg-blue-500" : "bg-green-500"}`}
                  style={{ width: `${zone.utilization}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">{zone.utilization}% utilized</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cycle Counting */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-[#0A1628] flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-[#FF6B00]" /> Cycle Counting
        </h3>
        <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-800">This Week&apos;s Assignment</p>
            <p className="text-xs text-blue-600">Zone A (Electronics) - 48 bins to count</p>
          </div>
          <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg">Start Count</button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs text-gray-500">
          <div className="bg-green-50 rounded p-2">
            <p className="text-lg font-bold text-green-600">3</p>
            <p>Completed</p>
          </div>
          <div className="bg-yellow-50 rounded p-2">
            <p className="text-lg font-bold text-yellow-600">1</p>
            <p>In Progress</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-lg font-bold text-gray-600">2</p>
            <p>Pending</p>
          </div>
        </div>
      </div>
    </div>
  );
}
