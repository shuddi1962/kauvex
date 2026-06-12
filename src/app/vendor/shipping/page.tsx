"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Edit3, Trash2, MapPin, Truck, Package, Loader2,
  CheckCircle2, Globe, Clock, DollarSign, ArrowLeft,
  ToggleLeft, ToggleRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { insforge } from "@/lib/insforge";
import VendorShell from "@/components/vendor/vendor-shell";

interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  flatRate: number;
  freeAbove: number;
  estimatedDays: string;
  enabled: boolean;
}

const NIGERIAN_REGIONS = [
  "Lagos Island", "Lagos Mainland", "Ikeja", "Lekki", "Victoria Island",
  "Ogun", "Oyo", "Osun", "Ondo", "Ekiti",
  "Anambra", "Enugu", "Imo", "Abia", "Ebonyi",
  "Rivers", "Delta", "Bayelsa", "Edo", "Cross River", "Akwa Ibom",
  "FCT", "Kaduna", "Kano", "Katsina", "Plateau", "Bauchi",
  "Benue", "Nasarawa", "Kogi", "Kwara", "Niger",
  "Borno", "Yobe", "Adamawa", "Taraba", "Gombe",
  "Jigawa", "Kebbi", "Sokoto", "Zamfara",
];

export default function VendorShippingPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "", regions: [] as string[], flatRate: "", freeAbove: "", estimatedDays: ""
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await insforge.auth.getUser();
        if (user) {
          const { data: vendorData } = await insforge.database
            .from("vendors")
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (vendorData) {
            const { data: shippingData } = await insforge.database
              .from("shipping_rules")
              .select("*")
              .eq("vendor_id", vendorData.id);

            if (shippingData && shippingData.length > 0) {
              setZones(shippingData.map((z: any) => ({
                id: z.id,
                name: z.name,
                regions: z.countries || [],
                flatRate: Number(z.price),
                freeAbove: Number(z.free_threshold || 0),
                estimatedDays: z.estimated_days?.toString() || "3-5",
                enabled: z.is_active,
              })));
            }
          }
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleZone = (id: string) => {
    setZones((prev) => prev.map((z) => z.id === id ? { ...z, enabled: !z.enabled } : z));
    setSaved(false);
  };

  const deleteZone = (id: string) => {
    if (confirm("Delete this shipping zone?")) {
      setZones((prev) => prev.filter((z) => z.id !== id));
      setSaved(false);
    }
  };

  const startEdit = (zone: ShippingZone) => {
    setEditingId(zone.id);
    setForm({
      name: zone.name,
      regions: zone.regions,
      flatRate: zone.flatRate.toString(),
      freeAbove: zone.freeAbove.toString(),
      estimatedDays: zone.estimatedDays,
    });
  };

  const toggleRegion = (region: string) => {
    setForm((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
    }));
  };

  const addOrUpdateZone = () => {
    if (!form.name || !form.flatRate) return;
    const zone: ShippingZone = {
      id: editingId || Date.now().toString(),
      name: form.name,
      regions: form.regions,
      flatRate: Number(form.flatRate),
      freeAbove: Number(form.freeAbove) || 0,
      estimatedDays: form.estimatedDays || "3-5",
      enabled: true,
    };

    if (editingId) {
      setZones((prev) => prev.map((z) => z.id === editingId ? zone : z));
    } else {
      setZones((prev) => [...prev, zone]);
    }

    setForm({ name: "", regions: [], flatRate: "", freeAbove: "", estimatedDays: "" });
    setEditingId(null);
    setShowAdd(false);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await insforge.auth.getUser();
      if (user) {
        const { data: vendorData } = await insforge.database
          .from("vendors")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (vendorData) {
          await insforge.database.from("shipping_rules")
            .delete()
            .eq("vendor_id", vendorData.id);

          for (const zone of zones) {
            await insforge.database.from("shipping_rules").insert({
              vendor_id: vendorData.id,
              name: zone.name,
              carrier: "custom",
              countries: zone.regions,
              price: zone.flatRate,
              free_threshold: zone.freeAbove || null,
              estimated_days: zone.estimatedDays ? parseInt(zone.estimatedDays) : null,
              is_active: zone.enabled,
            });
          }
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save shipping zones");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <VendorShell title="Shipping" subtitle="Configure delivery areas, rates, and estimated times">
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-purple-600" />
        </div>
      </VendorShell>
    );
  }

  return (
    <VendorShell title="Shipping" subtitle="Configure delivery areas, rates, and estimated times">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
              <CheckCircle2 size={14} /> Saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => { setShowAdd(true); setEditingId(null); setForm({ name: "", regions: [], flatRate: "", freeAbove: "", estimatedDays: "" }); }}>
            <Plus size={16} className="mr-2" /> Add Zone
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Package size={16} className="mr-2" />
            {saving ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-4">
        {/* Add/Edit Form */}
        {(showAdd || editingId) && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Truck size={16} className="text-purple-600" />
              {editingId ? "Edit Shipping Zone" : "New Shipping Zone"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Zone Name</label>
                <input placeholder="e.g. Lagos Metro" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Flat Rate (₦)</label>
                <input placeholder="e.g. 2500" type="number" value={form.flatRate}
                  onChange={(e) => setForm({ ...form, flatRate: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Free Above (₦)</label>
                <input placeholder="e.g. 50000" type="number" value={form.freeAbove}
                  onChange={(e) => setForm({ ...form, freeAbove: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Est. Days</label>
                <input placeholder="e.g. 3-5" value={form.estimatedDays}
                  onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-2 font-medium">Covered Regions</label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {NIGERIAN_REGIONS.map((region) => (
                  <button
                    key={region}
                    onClick={() => toggleRegion(region)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                      form.regions.includes(region)
                        ? "bg-purple-100 border-purple-300 text-purple-700"
                        : "bg-white border-gray-200 text-gray-500 hover:border-purple-300"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addOrUpdateZone}>
                {editingId ? "Update Zone" : "Add Zone"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setShowAdd(false); setEditingId(null); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Zone List */}
        {zones.length === 0 && !showAdd && (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-1">No Shipping Zones</h3>
            <p className="text-sm text-gray-500 mb-4">Add your first shipping zone to start delivering products.</p>
            <Button onClick={() => setShowAdd(true)}>
              <Plus size={16} className="mr-2" /> Add Shipping Zone
            </Button>
          </div>
        )}

        {zones.map((zone) => (
          <div key={zone.id} className={`bg-white rounded-xl p-5 border transition-all ${
            zone.enabled ? "border-gray-200" : "border-gray-100 opacity-60"
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin size={18} className="text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{zone.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{zone.regions.slice(0, 4).join(", ")}
                    {zone.regions.length > 4 && ` +${zone.regions.length - 4} more`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleZone(zone.id)} className="text-gray-400 hover:text-purple-600">
                  {zone.enabled ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => startEdit(zone)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <Edit3 size={14} className="text-gray-400" />
                </button>
                <button onClick={() => deleteZone(zone.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                <DollarSign size={14} className="text-gray-400" />
                <div><span className="text-gray-400">Flat Rate:</span> <span className="font-semibold text-gray-800">₦{zone.flatRate.toLocaleString()}</span></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                <Globe size={14} className="text-gray-400" />
                <div><span className="text-gray-400">Free above:</span> <span className="font-semibold text-gray-800">{zone.freeAbove > 0 ? `₦${zone.freeAbove.toLocaleString()}` : "N/A"}</span></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <div><span className="text-gray-400">Delivery:</span> <span className="font-semibold text-gray-800">{zone.estimatedDays} days</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </VendorShell>
  );
}
