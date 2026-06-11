"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Plus, Search, Edit2, Eye, Package, Truck,
  ToggleLeft, ToggleRight, Warehouse, MapPin,
  Loader2,
} from "lucide-react";

interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: "standard" | "fulfillment_center" | "dropoff_zone" | "pickup_point";
  city: string;
  country: string;
  status: "active" | "inactive";
  inventory_count: number;
  active_shipments: number;
  storage_used: number;
  address: string;
  contact_name: string;
  phone: string;
  email: string;
}

const typeLabels: Record<string, string> = {
  standard: "Standard",
  fulfillment_center: "Fulfillment Center",
  dropoff_zone: "Dropoff Zone",
  pickup_point: "Pickup Point",
};

const seedWarehouses: Omit<Warehouse, "id">[] = [
  { name: "Port Harcourt Main Warehouse", code: "PH-MAIN", type: "standard", city: "Port Harcourt", country: "NG", status: "active", inventory_count: 850, active_shipments: 24, storage_used: 65, address: "42 Ada George Road", contact_name: "Chidi Okoro", phone: "+234 803 123 4567", email: "ph-wh@kauvex.com" },
  { name: "Lagos Fulfillment Center", code: "LAG-FC", type: "fulfillment_center", city: "Lagos", country: "NG", status: "active", inventory_count: 2300, active_shipments: 87, storage_used: 82, address: "15 Admiralty Way, Lekki", contact_name: "Ada Okafor", phone: "+234 810 234 5678", email: "lagos-fc@kauvex.com" },
  { name: "Abuja Distribution Hub", code: "ABJ-DH", type: "standard", city: "Abuja", country: "NG", status: "active", inventory_count: 1200, active_shipments: 42, storage_used: 45, address: "Plot 22, Wuse Zone 5", contact_name: "Emeka Nwachukwu", phone: "+234 813 345 6789", email: "abuja-dh@kauvex.com" },
  { name: "New York East Warehouse", code: "NYC-EAST", type: "fulfillment_center", city: "New York", country: "US", status: "active", inventory_count: 5600, active_shipments: 156, storage_used: 78, address: "120 Eastern Ave, Brooklyn", contact_name: "James Wilson", phone: "+1 212 555 0142", email: "nyc-east@kauvex.com" },
  { name: "London Metro Dropoff", code: "LON-DO", type: "dropoff_zone", city: "London", country: "GB", status: "active", inventory_count: 0, active_shipments: 12, storage_used: 0, address: "45 King's Cross Rd", contact_name: "Sarah Mitchell", phone: "+44 20 7946 0958", email: "lon-do@kauvex.com" },
  { name: "Warri Pickup Point", code: "WAR-PP", type: "pickup_point", city: "Warri", country: "NG", status: "inactive", inventory_count: 0, active_shipments: 0, storage_used: 0, address: "8 Effurun Roundabout", contact_name: "Blessing Ade", phone: "+234 802 456 7890", email: "warri-pp@kauvex.com" },
  { name: "Lagos Island Dropoff", code: "LAG-DO", type: "dropoff_zone", city: "Lagos", country: "NG", status: "active", inventory_count: 0, active_shipments: 5, storage_used: 0, address: "42 Marina Street", contact_name: "Tunde Balogun", phone: "+234 809 876 5432", email: "lagos-do@kauvex.com" },
];

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadWarehouses(); }, []);

  const loadWarehouses = async () => {
    try {
      const { data } = await insforge.database.from("warehouses").select("*").order("name");
      if (data && data.length > 0) {
        setWarehouses(data);
      } else {
        for (const w of seedWarehouses) await insforge.database.from("warehouses").insert(w);
        const { data: seeded } = await insforge.database.from("warehouses").select("*").order("name");
        if (seeded) setWarehouses(seeded);
      }
    } catch {
      setWarehouses(seedWarehouses.map((w, i) => ({ ...w, id: String(i + 1) })));
    } finally { setLoading(false); }
  };

  const toggleStatus = async (w: Warehouse) => {
    const newStatus = w.status === "active" ? "inactive" : "active";
    try {
      await insforge.database.from("warehouses").update({ status: newStatus }).eq("id", w.id);
      setWarehouses(prev => prev.map(x => x.id === w.id ? { ...x, status: newStatus } : x));
    } catch { /* fallback */ }
  };

  const filtered = search
    ? warehouses.filter(w => w.name.toLowerCase().includes(search.toLowerCase()) || w.code.toLowerCase().includes(search.toLowerCase()) || w.city.toLowerCase().includes(search.toLowerCase()))
    : warehouses;

  if (loading) {
    return (
      <AdminShell title="Warehouses" subtitle="Manage warehouse facilities">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  const activeCount = warehouses.filter(w => w.status === "active").length;
  const totalStorage = warehouses.reduce((s, w) => s + (w.storage_used || 0), 0);
  const totalShipments = warehouses.reduce((s, w) => s + (w.active_shipments || 0), 0);

  return (
    <AdminShell title="Warehouses" subtitle="Manage warehouse facilities">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Warehouses", value: warehouses.length, color: "text-text-1" },
          { label: "Active", value: activeCount, color: "text-green-600" },
          { label: "Storage Used", value: `${totalStorage}%`, color: "text-blue" },
          { label: "Active Shipments", value: totalShipments, color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className={`font-bold text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-4 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, code, or city..." className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue/20" />
          </div>
          <Link href="/admin/warehouses/new" className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2">
            <Plus size={14} /> Add Warehouse
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Warehouse</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Code</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Location</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Type</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Inventory</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Status</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-sm text-text-4">No warehouses found</td></tr>
            ) : filtered.map(w => (
              <tr key={w.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue/10 flex items-center justify-center shrink-0">
                      <Warehouse size={16} className="text-blue" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-text-1">{w.name}</span>
                      <p className="text-[10px] text-text-4">{w.address?.substring(0, 30)}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span className="text-xs font-mono font-medium text-text-2 bg-gray-100 px-2 py-0.5 rounded">{w.code}</span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5 text-sm text-text-2">
                    <MapPin size={12} className="text-text-4" />
                    {w.city}, {w.country}
                  </div>
                </td>
                <td className="p-3 text-center">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-text-3">
                    {typeLabels[w.type] || w.type}
                  </span>
                </td>
                <td className="p-3 text-center text-sm font-semibold text-text-1">{w.inventory_count || 0}</td>
                <td className="p-3 text-center">
                  <button onClick={() => toggleStatus(w)} className="inline-flex items-center gap-1">
                    {w.status === "active" ? (
                      <ToggleRight size={20} className="text-green-600" />
                    ) : (
                      <ToggleLeft size={20} className="text-text-4" />
                    )}
                    <span className={`text-xs font-medium ${w.status === "active" ? "text-green-600" : "text-text-4"}`}>
                      {w.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </button>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/warehouses/${w.id}/edit`} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-3">
                      <Edit2 size={13} />
                    </Link>
                    <Link href={`/admin/warehouses/${w.id}/inventory`} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-3">
                      <Package size={13} />
                    </Link>
                    <Link href={`/admin/warehouses/${w.id}/shipments`} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-3">
                      <Truck size={13} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
