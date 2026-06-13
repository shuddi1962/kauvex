"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  MapPin, Search, Loader2, Clock, Phone, Mail,
  ToggleLeft, ToggleRight, Package, Plus, Warehouse,
} from "lucide-react";

interface DropoffZone {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  contact_name: string;
  contact_phone: string;
  operating_hours: string;
  status: string;
  vendor_count: number;
}

const seedZones: DropoffZone[] = [
  { id: "1", name: "Lagos Drop-off Hub", code: "LOS-DO1", address: "25 Warehouse Road, Apapa", city: "Lagos", state: "Lagos", country: "NG", contact_name: "Mr. Adebayo", contact_phone: "+234 802 111 2222", operating_hours: "Mon-Sat 8am-6pm", status: "active", vendor_count: 24 },
  { id: "2", name: "Abuja Central Drop-off", code: "ABV-DO1", address: "Plot 7, Central Business District", city: "Abuja", state: "FCT", country: "NG", contact_name: "Hauwa Mohammed", contact_phone: "+234 803 222 3333", operating_hours: "Mon-Fri 8am-5pm", status: "active", vendor_count: 18 },
  { id: "3", name: "Port Harcourt Drop-off", code: "PHC-DO1", address: "42 Ada George Road", city: "Port Harcourt", state: "Rivers", country: "NG", contact_name: "Chidi Okoro", contact_phone: "+234 803 333 4444", operating_hours: "Mon-Sat 9am-6pm", status: "active", vendor_count: 12 },
  { id: "4", name: "London Receiving Centre", code: "LON-DO1", address: "15 Industrial Estate, Barking", city: "London", state: "England", country: "GB", contact_name: "James Wilson", contact_phone: "+44 7700 123456", operating_hours: "Mon-Fri 9am-5pm", status: "inactive", vendor_count: 5 },
  { id: "5", name: "Warri Drop-off Point", code: "WAR-DO1", address: "8 Effurun Roundabout", city: "Warri", state: "Delta", country: "NG", contact_name: "Blessing Ade", contact_phone: "+234 806 444 5555", operating_hours: "Mon-Sat 9am-5pm", status: "active", vendor_count: 7 },
];

export default function DropoffZonesPage() {
  const [zones, setZones] = useState<DropoffZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setTimeout(() => { setZones(seedZones); setLoading(false); }, 500);
  }, []);

  const toggleStatus = (z: DropoffZone) => {
    setZones(prev => prev.map(x => x.id === z.id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x));
  };

  const filtered = search
    ? zones.filter(z =>
        z.name.toLowerCase().includes(search.toLowerCase()) ||
        z.city.toLowerCase().includes(search.toLowerCase()) ||
        z.country.toLowerCase().includes(search.toLowerCase())
      )
    : zones;

  if (loading) {
    return (
      <AdminShell title="Drop-off Zones" subtitle="Manage vendor inventory drop-off locations">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Drop-off Zones" subtitle="Manage vendor inventory drop-off locations">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Zones", value: zones.length, icon: Warehouse },
          { label: "Active", value: zones.filter(z => z.status === "active").length, color: "text-green-600" },
          { label: "Inactive", value: zones.filter(z => z.status === "inactive").length, color: "text-text-4" },
          { label: "Active Vendors", value: zones.reduce((a, z) => a + (z.status === "active" ? z.vendor_count : 0), 0), color: "text-blue" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            {s.icon && <s.icon size={16} className="text-text-4 mb-1" />}
            <p className={`font-bold text-xl ${s.color || "text-text-1"}`}>{s.value}</p>
            <p className="text-[10px] text-text-4">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drop-off zones..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 h-9 px-4 bg-blue text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors">
          <Plus size={14} /> Add Zone
        </button>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(z => (
          <div key={z.id} className={`bg-white rounded-xl border p-5 transition-shadow hover:shadow-sm ${
            z.status === "active" ? "border-gray-200" : "border-gray-200 opacity-70"
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
                  <MapPin size={18} className="text-orange" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-text-1">{z.name}</h4>
                  <p className="text-[10px] text-text-4">Code: {z.code}</p>
                </div>
              </div>
              <button onClick={() => toggleStatus(z)}>
                {z.status === "active" ? (
                  <ToggleRight size={20} className="text-green-600" />
                ) : (
                  <ToggleLeft size={20} className="text-text-4" />
                )}
              </button>
            </div>

            <p className="text-xs text-text-3 mb-3">{z.address}</p>

            <div className="grid grid-cols-2 gap-2 text-xs text-text-3 mb-3">
              <div className="flex items-center gap-1.5">
                <MapPin size={11} className="text-text-4 shrink-0" />
                <span>{z.city}, {z.state || z.country}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={11} className="text-text-4 shrink-0" />
                <span className="truncate">{z.operating_hours}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={11} className="text-text-4 shrink-0" />
                <span>{z.contact_phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={11} className="text-text-4 shrink-0" />
                <span className="truncate">{z.contact_name}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-[10px] text-text-4">
                <Package size={10} />
                <span>{z.vendor_count} vendors use this zone</span>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                z.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-text-4"
              }`}>
                {z.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-text-4">
          No drop-off zones found
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-base mb-1">Add Drop-off Zone</h3>
            <p className="text-xs text-text-4 mb-4">Create a new location where vendors can drop off inventory.</p>
            <div className="space-y-3">
              {[
                { label: "Zone Name", placeholder: "e.g. Lagos Drop-off Hub" },
                { label: "Code", placeholder: "e.g. LOS-DO1" },
                { label: "Address", placeholder: "e.g. 25 Warehouse Road" },
                { label: "City", placeholder: "e.g. Lagos" },
                { label: "Country", placeholder: "e.g. NG" },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-[11px] font-medium text-text-3 mb-1 block">{f.label}</label>
                  <input placeholder={f.placeholder} className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 h-9 border border-gray-200 rounded-lg text-xs font-medium text-text-3 hover:bg-gray-50">Cancel</button>
              <button className="flex-1 h-9 bg-orange text-white rounded-lg text-xs font-medium hover:bg-orange/90">Create Zone</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
