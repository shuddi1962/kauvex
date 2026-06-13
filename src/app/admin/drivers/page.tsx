"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Truck, Search, Loader2, Phone, Mail, MapPin,
  Star, Package, ToggleLeft, ToggleRight, Plus,
} from "lucide-react";

interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicle_type?: string;
  license_number?: string;
  warehouse_id?: string;
  status: string;
  total_deliveries: number;
  rating: number;
  is_available: boolean;
  warehouse?: { name: string; city: string };
}

const seedDrivers: Driver[] = [
  { id: "1", name: "Chidi Okoro", phone: "+234 803 123 4567", email: "chidi@example.com", vehicle_type: "Motorcycle", license_number: "LN-001", status: "active", total_deliveries: 342, rating: 4.9, is_available: true, warehouse: { name: "Lagos Warehouse", city: "Lagos" } },
  { id: "2", name: "Ada Okafor", phone: "+234 810 234 5678", email: "ada@example.com", vehicle_type: "Van", license_number: "LN-002", status: "active", total_deliveries: 278, rating: 4.7, is_available: true, warehouse: { name: "Lagos Warehouse", city: "Lagos" } },
  { id: "3", name: "Emeka Nwachukwu", phone: "+234 813 345 6789", email: "emeka@example.com", vehicle_type: "Car", license_number: "LN-003", status: "active", total_deliveries: 156, rating: 4.5, is_available: false, warehouse: { name: "Abuja Warehouse", city: "Abuja" } },
  { id: "4", name: "Blessing Ade", phone: "+234 802 456 7890", email: "blessing@example.com", vehicle_type: "Motorcycle", license_number: "LN-004", status: "inactive", total_deliveries: 89, rating: 4.2, is_available: false, warehouse: { name: "Port Harcourt Warehouse", city: "Port Harcourt" } },
  { id: "5", name: "Tunde Balogun", phone: "+234 808 567 8901", email: "tunde@example.com", vehicle_type: "Truck", license_number: "LN-005", status: "active", total_deliveries: 512, rating: 4.8, is_available: true, warehouse: { name: "Lagos Warehouse", city: "Lagos" } },
  { id: "6", name: "Ngozi Eze", phone: "+234 806 678 9012", email: "ngozi@example.com", vehicle_type: "Van", license_number: "LN-006", status: "on_break", total_deliveries: 201, rating: 4.6, is_available: false, warehouse: { name: "Abuja Warehouse", city: "Abuja" } },
];

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => { loadDrivers(); }, []);

  const loadDrivers = async () => {
    try {
      const { data } = await insforge.database
        .from("delivery_riders")
        .select("*, warehouse:warehouses(name, city)")
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setDrivers(data.map((d: any) => ({
          id: d.id, name: d.name, phone: d.phone, email: d.email,
          vehicle_type: d.vehicle_type, license_number: d.license_number,
          warehouse_id: d.warehouse_id, status: d.status,
          total_deliveries: d.total_deliveries || 0, rating: d.rating || 0,
          is_available: d.is_available, warehouse: d.warehouse,
        })));
      } else {
        setDrivers(seedDrivers);
      }
    } catch {
      setDrivers(seedDrivers);
    } finally { setLoading(false); }
  };

  const toggleStatus = async (d: Driver) => {
    const newStatus = d.status === "active" ? "inactive" : "active";
    try {
      await insforge.database.from("delivery_riders").update({ status: newStatus }).eq("id", d.id);
      setDrivers(prev => prev.map(x => x.id === d.id ? { ...x, status: newStatus } : x));
    } catch { /* fallback */ }
  };

  const filtered = search
    ? drivers.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.phone.includes(search) ||
        d.warehouse?.name.toLowerCase().includes(search.toLowerCase())
      )
    : drivers;

  if (loading) {
    return (
      <AdminShell title="Delivery Drivers" subtitle="Manage delivery personnel">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Delivery Drivers" subtitle="Manage delivery personnel">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total Drivers", value: drivers.length, icon: Truck },
          { label: "Active", value: drivers.filter(d => d.status === "active").length, color: "text-green-600" },
          { label: "On Break", value: drivers.filter(d => d.status === "on_break").length, color: "text-orange" },
          { label: "Available Now", value: drivers.filter(d => d.is_available).length, color: "text-blue" },
          { label: "Avg Rating", value: (drivers.reduce((a, d) => a + d.rating, 0) / Math.max(drivers.length, 1)).toFixed(1), color: "text-yellow-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              {s.icon && <s.icon size={14} className="text-text-4" />}
              <p className={`font-bold text-xl ${s.color || "text-text-1"}`}>{s.value}</p>
            </div>
            <p className="text-[10px] text-text-4">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drivers..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 h-9 px-4 bg-blue text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors">
          <Plus size={14} /> Add Driver
        </button>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(d => (
          <div key={d.id} className={`bg-white rounded-xl border p-4 transition-shadow hover:shadow-sm ${
            d.status === "active" ? "border-gray-200" : "border-gray-200 opacity-70"
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {d.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-text-1">{d.name}</h4>
                  <p className="text-[10px] text-text-4">{d.vehicle_type || "No vehicle"} • {d.license_number || "—"}</p>
                </div>
              </div>
              <button onClick={() => toggleStatus(d)}>
                {d.status === "active" ? (
                  <ToggleRight size={20} className="text-green-600" />
                ) : (
                  <ToggleLeft size={20} className="text-text-4" />
                )}
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-text-3 mb-3">
              <div className="flex items-center gap-2">
                <Phone size={12} className="text-text-4" />
                <span>{d.phone}</span>
              </div>
              {d.email && (
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-text-4" />
                  <span>{d.email}</span>
                </div>
              )}
              {d.warehouse && (
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-text-4" />
                  <span>{d.warehouse.name}, {d.warehouse.city}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3 text-[10px] text-text-4">
                <span className="flex items-center gap-1"><Package size={10} /> {d.total_deliveries}</span>
                <span className="flex items-center gap-1"><Star size={10} className="text-yellow-500" /> {d.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                {d.is_available && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                )}
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  d.status === "active" ? "bg-green-50 text-green-700" :
                  d.status === "on_break" ? "bg-orange-50 text-orange" :
                  "bg-gray-100 text-text-4"
                }`}>
                  {d.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-text-4">
          No drivers found
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-base mb-1">Add New Driver</h3>
            <p className="text-xs text-text-4 mb-4">Enter driver details to create a new delivery personnel record.</p>
            <div className="space-y-3">
              {[
                { label: "Full Name", placeholder: "e.g. John Doe" },
                { label: "Phone", placeholder: "e.g. +234 800 000 0000" },
                { label: "Email", placeholder: "e.g. john@example.com", optional: true },
                { label: "Vehicle Type", placeholder: "e.g. Motorcycle, Van, Truck", optional: true },
                { label: "License Number", placeholder: "e.g. LN-001", optional: true },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-[11px] font-medium text-text-3 mb-1 block">
                    {f.label} {f.optional && <span className="text-text-4">(optional)</span>}
                  </label>
                  <input placeholder={f.placeholder} className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 h-9 border border-gray-200 rounded-lg text-xs font-medium text-text-3 hover:bg-gray-50">Cancel</button>
              <button className="flex-1 h-9 bg-blue text-white rounded-lg text-xs font-medium hover:bg-blue-600">Create Driver</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
