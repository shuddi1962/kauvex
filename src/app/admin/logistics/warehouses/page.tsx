"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Warehouse, MapPin, Package, Users, Truck, BarChart3, Loader2, Search } from "lucide-react";

interface WarehouseItem {
  id: string;
  name: string;
  city: string;
  type: string;
  capacityUsed: number;
  staffCount: number;
  activeInbounds: number;
  activeOutbounds: number;
  status: "active" | "maintenance" | "inactive";
}

const seedWarehouses: WarehouseItem[] = [
  { id: "W1", name: "Lagos Main Fulfillment Center", city: "Lagos, Ikeja", type: "FBK", capacityUsed: 78, staffCount: 24, activeInbounds: 5, activeOutbounds: 120, status: "active" },
  { id: "W2", name: "Abuja Logistics Hub", city: "Abuja, Wuse", type: "Cross-Dock", capacityUsed: 55, staffCount: 12, activeInbounds: 3, activeOutbounds: 45, status: "active" },
  { id: "W3", name: "Port Harcourt Distribution", city: "Port Harcourt", type: "FBK", capacityUsed: 42, staffCount: 8, activeInbounds: 2, activeOutbounds: 30, status: "active" },
  { id: "W4", name: "Ibadan Forward Stocking", city: "Ibadan", type: "Forward Stock", capacityUsed: 30, staffCount: 5, activeInbounds: 1, activeOutbounds: 15, status: "active" },
  { id: "W5", name: "Lagos Returns Center", city: "Lagos, Apapa", type: "Returns", capacityUsed: 60, staffCount: 6, activeInbounds: 8, activeOutbounds: 10, status: "active" },
  { id: "W6", name: "Kano Hub", city: "Kano", type: "Cross-Dock", capacityUsed: 20, staffCount: 4, activeInbounds: 0, activeOutbounds: 8, status: "maintenance" },
];

export default function AdminWarehousesPage() {
  const [warehouses] = useState(seedWarehouses);
  const [search, setSearch] = useState("");

  const filtered = warehouses.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) || w.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Warehouses" subtitle="All Kauvex warehouse locations">
      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search warehouses..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-[#0A1628]">{warehouses.length}</div>
            <p className="text-sm text-gray-500">Total Warehouses</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{warehouses.filter(w => w.status === "active").length}</div>
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{warehouses.reduce((a, w) => a + w.staffCount, 0)}</div>
            <p className="text-sm text-gray-500">Total Staff</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-orange">{warehouses.reduce((a, w) => a + w.activeOutbounds, 0)}</div>
            <p className="text-sm text-gray-500">Active Outbounds</p>
          </div>
        </div>

        {/* Warehouse Cards */}
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((w) => (
            <div key={w.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center">
                    <Warehouse size={20} className="text-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#0A1628]">{w.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} /> {w.city}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  w.status === "active" ? "bg-green-100 text-green-700" :
                  w.status === "maintenance" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                }`}>{w.status}</span>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Capacity</span>
                  <span>{w.capacityUsed}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${w.capacityUsed > 80 ? "bg-orange" : w.capacityUsed > 50 ? "bg-blue-500" : "bg-green-500"}`}
                    style={{ width: `${w.capacityUsed}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-[#0A1628]">{w.staffCount}</p>
                  <p className="text-[10px] text-gray-500"><Users size={10} className="inline mr-0.5" /> Staff</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-600">{w.activeInbounds}</p>
                  <p className="text-[10px] text-gray-500"><Truck size={10} className="inline mr-0.5" /> Inbound</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-orange">{w.activeOutbounds}</p>
                  <p className="text-[10px] text-gray-500"><Package size={10} className="inline mr-0.5" /> Outbound</p>
                </div>
              </div>

              <button className="w-full mt-3 text-xs text-orange hover:bg-orange-50 py-1.5 rounded-lg border border-orange/20">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
