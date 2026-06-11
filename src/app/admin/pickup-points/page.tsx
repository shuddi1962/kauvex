"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  MapPin, Clock, Phone, Mail, ToggleLeft, ToggleRight,
  Search, Loader2, Package,
} from "lucide-react";

interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  hours: string;
  contact_name: string;
  phone: string;
  email: string;
  status: "active" | "inactive";
  inventory_count: number;
}

const seedPickupPoints: Omit<PickupPoint, "id">[] = [
  { name: "Port Harcourt Pickup", address: "42 Ada George Road", city: "Port Harcourt", state: "Rivers", country: "NG", hours: "Mon-Fri 9am-6pm, Sat 10am-3pm", contact_name: "Chidi Okoro", phone: "+234 803 123 4567", email: "ph-pickup@kauvex.com", status: "active", inventory_count: 0 },
  { name: "Lagos Lekki Pickup", address: "15 Admiralty Way, Lekki Phase 1", city: "Lagos", state: "Lagos", country: "NG", hours: "Mon-Sat 9am-7pm", contact_name: "Ada Okafor", phone: "+234 810 234 5678", email: "lagos-pickup@kauvex.com", status: "active", inventory_count: 0 },
  { name: "Abuja Wuse Pickup", address: "Plot 22, Wuse Zone 5", city: "Abuja", state: "FCT", country: "NG", hours: "Mon-Fri 8am-5pm", contact_name: "Emeka Nwachukwu", phone: "+234 813 345 6789", email: "abuja-pickup@kauvex.com", status: "active", inventory_count: 0 },
  { name: "Warri Pickup Point", address: "8 Effurun Roundabout", city: "Warri", state: "Delta", country: "NG", hours: "Mon-Sat 9am-5pm", contact_name: "Blessing Ade", phone: "+234 802 456 7890", email: "warri-pickup@kauvex.com", status: "inactive", inventory_count: 0 },
];

export default function PickupPointsPage() {
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadPoints(); }, []);

  const loadPoints = async () => {
    try {
      const { data } = await insforge.database
        .from("warehouses")
        .select("*")
        .eq("is_pickup_point", true)
        .order("name");
      if (data && data.length > 0) {
        setPoints(data.map((w: any) => ({
          id: w.id,
          name: w.name,
          address: w.address || "",
          city: w.city || "",
          state: w.state || "",
          country: w.country || "",
          hours: w.hours || "Mon-Fri 9am-6pm",
          contact_name: w.contact_name || "",
          phone: w.phone || "",
          email: w.email || "",
          status: w.status,
          inventory_count: w.inventory_count || 0,
        })));
      } else {
        setPoints(seedPickupPoints.map((p, i) => ({ ...p, id: String(i + 1) })));
      }
    } catch {
      setPoints(seedPickupPoints.map((p, i) => ({ ...p, id: String(i + 1) })));
    } finally { setLoading(false); }
  };

  const toggleStatus = async (p: PickupPoint) => {
    const newStatus = p.status === "active" ? "inactive" : "active";
    try {
      await insforge.database.from("warehouses").update({ status: newStatus }).eq("id", p.id);
      setPoints(prev => prev.map(x => x.id === p.id ? { ...x, status: newStatus } : x));
    } catch { /* fallback */ }
  };

  const filtered = search
    ? points.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()))
    : points;

  if (loading) {
    return (
      <AdminShell title="Pickup Points" subtitle="Manage customer pickup locations">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Pickup Points" subtitle="Manage customer pickup locations">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Pickup Points", value: points.length },
          { label: "Active", value: points.filter(p => p.status === "active").length, color: "text-green-600" },
          { label: "Inactive", value: points.filter(p => p.status === "inactive").length, color: "text-text-4" },
          { label: "Countries", value: [...new Set(points.map(p => p.country))].length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className={`font-bold text-2xl ${s.color || "text-text-1"}`}>{s.value}</p>
            <p className="text-xs text-text-4 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative w-full sm:w-64 mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pickup points..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(p => (
          <div key={p.id} className={`bg-white rounded-xl border p-4 transition-shadow hover:shadow-sm ${p.status === "active" ? "border-gray-200" : "border-gray-200 opacity-70"}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center">
                  <MapPin size={18} className="text-blue" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-text-1">{p.name}</h4>
                  <p className="text-[10px] text-text-4">{p.city}, {p.state || p.country}</p>
                </div>
              </div>
              <button onClick={() => toggleStatus(p)}>
                {p.status === "active" ? (
                  <ToggleRight size={20} className="text-green-600" />
                ) : (
                  <ToggleLeft size={20} className="text-text-4" />
                )}
              </button>
            </div>

            <p className="text-xs text-text-3 mb-3">{p.address}</p>

            <div className="space-y-1.5 text-xs text-text-3">
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-text-4" />
                <span>{p.hours || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={12} className="text-text-4" />
                <span>{p.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-text-4" />
                <span>{p.email || "—"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-[10px] text-text-4 flex items-center gap-1">
                <Package size={10} /> Contact: {p.contact_name || "—"}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                p.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-text-4"
              }`}>
                {p.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-text-4 mt-3">
          No pickup points found
        </div>
      )}
    </AdminShell>
  );
}
