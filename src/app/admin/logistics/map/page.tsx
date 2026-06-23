"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import { Loader2, MapPin, Truck, Building2, Users, Wifi, WifiOff } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  city: string;
  tier: string;
  lat: number;
  lng: number;
  is_online: boolean;
}

const seedPartners: Partner[] = [
  { id: "1", name: "Lagos Hub - Ikeja", city: "Lagos", tier: "tier_1", lat: 6.6018, lng: 3.3515, is_online: true },
  { id: "2", name: "Abuja Hub - Wuse", city: "Abuja", tier: "tier_1", lat: 9.0765, lng: 7.3986, is_online: true },
  { id: "3", name: "Port Harcourt Hub", city: "Port Harcourt", tier: "tier_1", lat: 4.8156, lng: 7.0498, is_online: true },
  { id: "4", name: "Kano Spoke", city: "Kano", tier: "tier_2", lat: 12.0024, lng: 8.5922, is_online: false },
  { id: "5", name: "Ibadan Spoke", city: "Ibadan", tier: "tier_2", lat: 7.3775, lng: 3.9470, is_online: true },
  { id: "6", name: "Enugu Spoke", city: "Enugu", tier: "tier_2", lat: 6.4483, lng: 7.5088, is_online: true },
  { id: "7", name: "Benin Spoke", city: "Benin City", tier: "live", lat: 6.3176, lng: 5.6145, is_online: false },
  { id: "8", name: "Warri Spoke", city: "Warri", tier: "live", lat: 5.5173, lng: 5.7506, is_online: true },
];

const tierLabels: Record<string, string> = {
  tier_1: "Tier 1",
  tier_2: "Tier 2",
  live: "Live",
};

export default function AdminNetworkMapPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await insforge.database
        .from("kv_logistics_partners")
        .select("*")
        .order("name");
      if (data && data.length > 0) {
        setPartners(data);
      } else {
        setPartners(seedPartners);
      }
    } catch {
      setPartners(seedPartners);
    } finally { setLoading(false); }
  };

  const filtered = filterTier ? partners.filter(p => p.tier === filterTier) : partners;
  const onlinePartners = filtered.filter(p => p.is_online);

  const hubs = partners.filter(p => p.tier === "tier_1").length;
  const activeDeliveries = 124;

  return (
    <AdminShell title="Network Map" subtitle="Real-time logistics partner network visualization">
      <div className="space-y-6">
        {/* Stats overlay row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Deliveries", value: activeDeliveries, icon: Truck, color: "text-blue" },
            { label: "Online Partners", value: partners.filter(p => p.is_online).length, icon: Wifi, color: "text-green-600" },
            { label: "Hubs", value: hubs, icon: Building2, color: "text-orange" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon size={16} className={s.color} />
                <p className="text-xl font-bold text-text-1">{s.value}</p>
              </div>
              <p className="text-[11px] text-text-4">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Map Area */}
          <div className="flex-1">
            <div className="relative bg-gray-50 rounded-xl border border-gray-200 overflow-hidden" style={{ minHeight: 480 }}>
              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6b7280" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Center placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={48} className="mx-auto text-text-4 mb-3 opacity-30" />
                  <p className="text-lg font-semibold text-text-4">Interactive Map Coming Soon</p>
                  <p className="text-sm text-text-4 mt-1">Mapbox integration will render partner locations here</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-text-4">{onlinePartners.length} online partners in view</span>
                  </div>
                </div>
              </div>

              {/* Dots overlay */}
              <div className="relative z-10 w-full h-full p-6">
                <div className="grid grid-cols-5 gap-3">
                  {filtered.slice(0, 10).map((p, i) => (
                    <div
                      key={p.id}
                      className={`w-3 h-3 rounded-full ${p.is_online ? "bg-green-500" : "bg-gray-300"} animate-pulse`}
                      style={{ animationDelay: `${i * 0.3}s`, marginTop: `${(i % 5) * 30}px`, marginLeft: `${(i * 7) % 20}px` }}
                      title={`${p.name} (${p.lat.toFixed(4)}, ${p.lng.toFixed(4)})`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Partner Sidebar */}
          <div className="w-80 shrink-0">
            {/* Filter buttons */}
            <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-lg">
              {[
                { key: null, label: "All" },
                { key: "tier_1", label: "Tier 1" },
                { key: "tier_2", label: "Tier 2" },
                { key: "live", label: "Live" },
              ].map(t => (
                <button key={t.label} onClick={() => setFilterTier(t.key)}
                  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterTier === t.key ? "bg-white text-text-1 shadow-sm" : "text-text-4 hover:text-text-2"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Partner list */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {loading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-blue" size={24} /></div>
              ) : partners.length === 0 ? (
                <div className="text-center py-12 text-sm text-text-4">No partners found</div>
              ) : (
                filtered.map(p => (
                  <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1 ${p.is_online ? "bg-green-500" : "bg-gray-300"}`} />
                        <div>
                          <h4 className="text-sm font-semibold text-text-1">{p.name}</h4>
                          <p className="text-[10px] text-text-4">{p.city}</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-text-4 font-medium">{tierLabels[p.tier] || p.tier}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-text-4">
                      <MapPin size={10} />
                      <span>{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1">
                      {p.is_online ? (
                        <span className="flex items-center gap-1 text-[10px] text-green-700 font-medium"><Wifi size={10} /> Online</span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-text-4"><WifiOff size={10} /> Offline</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
