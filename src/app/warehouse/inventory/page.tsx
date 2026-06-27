"use client";

import { useState, useEffect } from "react";
import { Package, MapPin, BarChart3, CheckCircle2, AlertTriangle, Search, Loader2 } from "lucide-react";

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

export default function WarehouseInventoryPage() {
  const [search, setSearch] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [bins, setBins] = useState<BinZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/warehouses")
      .then(r => r.json())
      .then(json => {
        const items = json.data?.inventory || [];
        setInventory(items.map((i: any) => ({
          id: i.id,
          product: i.product,
          vendor: i.vendor,
          sku: i.sku,
          bin: i.bin,
          onHand: i.onHand,
          reserved: i.reserved,
          available: i.available,
          inbound: i.inbound,
        })));
        const zones = json.data?.bins || [];
        setBins(zones.map((z: any) => ({
          id: z.id,
          name: z.name,
          total: z.total,
          used: z.used,
          utilization: z.utilization,
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = inventory.filter(i =>
    i.product.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#FF6B00]" />
      </div>
    );
  }

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
