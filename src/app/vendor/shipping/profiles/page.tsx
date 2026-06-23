"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus, Edit3, Trash2, ToggleLeft, ToggleRight,
  Package, Truck, MapPin, Star, Search, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

interface ShippingProfile {
  id: string;
  name: string;
  carriers: string[];
  enabled: boolean;
  isDefault: boolean;
  assignedProducts: number;
  regions: string[];
  estimatedDays: string;
}

const demoProfiles: ShippingProfile[] = [
  {
    id: "sp-1", name: "Standard Delivery",
    carriers: ["Kauvex Logistics", "DHL", "FedEx"],
    enabled: true, isDefault: true, assignedProducts: 24,
    regions: ["Lagos", "Abuja", "Port Harcourt", "Ibadan"],
    estimatedDays: "2-5",
  },
  {
    id: "sp-2", name: "Express Shipping",
    carriers: ["DHL", "FedEx"],
    enabled: true, isDefault: false, assignedProducts: 8,
    regions: ["Lagos", "Abuja", "Port Harcourt"],
    estimatedDays: "1-2",
  },
  {
    id: "sp-3", name: "Economy",
    carriers: ["Kauvex Logistics"],
    enabled: false, isDefault: false, assignedProducts: 15,
    regions: ["All Nigeria"],
    estimatedDays: "5-10",
  },
  {
    id: "sp-4", name: "International",
    carriers: ["DHL", "FedEx", "Aramex"],
    enabled: true, isDefault: false, assignedProducts: 6,
    regions: ["USA", "UK", "Canada", "UAE"],
    estimatedDays: "7-14",
  },
];

export default function ShippingProfilesPage() {
  const [profiles, setProfiles] = useState<ShippingProfile[]>(demoProfiles);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const toggleProfile = (id: string) => {
    setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const deleteProfile = (id: string) => {
    if (confirm("Delete this shipping profile?")) {
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      showToast("Profile deleted", "success");
    }
  };

  const setDefault = (id: string) => {
    setProfiles((prev) => prev.map((p) => ({ ...p, isDefault: p.id === id })));
    showToast("Default profile updated", "success");
  };

  const filtered = profiles.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.carriers.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <VendorShell title="Shipping Profiles" subtitle="Manage shipping rate profiles, carriers, and coverage">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm text-white shadow-lg ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search profiles..."
            className="w-full h-9 pl-9 pr-3 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
          />
        </div>
        <Link href="/vendor/shipping/profiles/new">
          <Button>
            <Plus size={15} className="mr-1.5" /> Create New Profile
          </Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 mb-1">No Shipping Profiles</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first shipping profile to start managing rates and carriers.</p>
          <Link href="/vendor/shipping/profiles/new">
            <Button><Plus size={16} className="mr-2" /> Create Shipping Profile</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((profile) => (
            <div key={profile.id} className={`bg-white rounded-xl p-5 border transition-all ${
              profile.enabled ? "border-gray-200" : "border-gray-100 opacity-60"
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Truck size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-900">{profile.name}</h4>
                      {profile.isDefault && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <Star size={10} /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {profile.carriers.join(", ")} &middot; {profile.regions.slice(0, 2).join(", ")}
                      {profile.regions.length > 2 && ` +${profile.regions.length - 2} more`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleProfile(profile.id)} className="text-gray-400 hover:text-purple-600">
                    {profile.enabled ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                  </button>
                  <Link href={`/vendor/shipping/profiles/${profile.id}`}>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                      <Edit3 size={14} className="text-gray-400" />
                    </button>
                  </Link>
                  <button onClick={() => deleteProfile(profile.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                  <Package size={14} className="text-gray-400" />
                  <div><span className="text-gray-400">Products:</span> <span className="font-semibold text-gray-800">{profile.assignedProducts}</span></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                  <Truck size={14} className="text-gray-400" />
                  <div><span className="text-gray-400">Carriers:</span> <span className="font-semibold text-gray-800">{profile.carriers.length}</span></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <div><span className="text-gray-400">Regions:</span> <span className="font-semibold text-gray-800">{profile.regions.length}</span></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-gray-400">Est:</span>
                  <span className="font-semibold text-gray-800">{profile.estimatedDays} days</span>
                </div>
              </div>
              {!profile.isDefault && (
                <button
                  onClick={() => setDefault(profile.id)}
                  className="mt-3 text-[10px] text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <Star size={10} /> Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </VendorShell>
  );
}
