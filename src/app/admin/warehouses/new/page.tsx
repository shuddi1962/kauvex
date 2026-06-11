"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Save, ArrowLeft, ToggleLeft, ToggleRight, Loader2,
} from "lucide-react";
import Link from "next/link";

type WhType = "standard" | "fulfillment_center" | "dropoff_zone" | "pickup_point";

export default function NewWarehousePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "standard" as WhType,
    address: "",
    city: "",
    state: "",
    country: "US",
    postal_code: "",
    contact_name: "",
    phone: "",
    email: "",
    status: true,
    is_pickup_point: false,
    is_dropoff_zone: false,
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm(prev => ({ ...prev, [key]: value }));

  const generateCode = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return parts[0].substring(0, 3).toUpperCase() + "-" + parts[parts.length - 1].substring(0, 3).toUpperCase();
    return name.substring(0, 6).toUpperCase();
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const code = form.code || generateCode(form.name);
    const payload = {
      name: form.name,
      code,
      type: form.type,
      address: form.address,
      city: form.city,
      state: form.state,
      country: form.country,
      postal_code: form.postal_code,
      contact_name: form.contact_name,
      phone: form.phone,
      email: form.email,
      status: form.status ? "active" : "inactive",
      is_pickup_point: form.type === "pickup_point" ? true : form.is_pickup_point,
      is_dropoff_zone: form.type === "dropoff_zone" ? true : form.is_dropoff_zone,
      inventory_count: 0,
      active_shipments: 0,
      storage_used: 0,
    };
    try {
      const { error } = await insforge.database.from("warehouses").insert(payload);
      if (!error) {
        setSaved(true);
        setTimeout(() => router.push("/admin/warehouses"), 1500);
      }
    } catch { /* fallback */ } finally { setSaving(false); }
  };

  return (
    <AdminShell title="New Warehouse" subtitle="Create a new warehouse facility">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/warehouses" className="p-2 hover:bg-gray-100 rounded-lg text-text-4 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h2 className="font-bold text-lg text-text-1">{form.name || "New Warehouse"}</h2>
            <p className="text-xs text-text-4">Warehouse code: {form.code || generateCode(form.name) || "—"}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !form.name.trim()}
          className={`h-9 px-5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            saved ? "bg-green-600 text-white" : "bg-blue text-white hover:bg-blue-600 disabled:opacity-50"
          }`}
        >
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : saved ? "Created!" : <><Save size={14} /> Save Warehouse</>}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-3xl">
        <div className="space-y-5">
          <h3 className="font-bold text-base text-text-1">General Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Warehouse Name *</label>
              <input
                value={form.name}
                onChange={e => {
                  update("name", e.target.value);
                  if (!form.code) update("code", generateCode(e.target.value));
                }}
                placeholder="e.g. Port Harcourt Main Warehouse"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Warehouse Code</label>
              <input
                value={form.code}
                onChange={e => update("code", e.target.value.toUpperCase())}
                placeholder="PH-MAIN"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-2 block mb-1">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {(["standard", "fulfillment_center", "dropoff_zone", "pickup_point"] as WhType[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update("type", t)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    form.type === t
                      ? "border-blue bg-blue/5 text-blue"
                      : "border-gray-200 text-text-3 hover:border-gray-300"
                  }`}
                >
                  {t === "fulfillment_center" ? "Fulfillment" : t === "dropoff_zone" ? "Dropoff" : t === "pickup_point" ? "Pickup" : "Standard"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-2 block mb-1">Address</label>
            <input
              value={form.address}
              onChange={e => update("address", e.target.value)}
              placeholder="Street address"
              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">City</label>
              <input value={form.city} onChange={e => update("city", e.target.value)} placeholder="City" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">State/Province</label>
              <input value={form.state} onChange={e => update("state", e.target.value)} placeholder="State" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Country</label>
              <select value={form.country} onChange={e => update("country", e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue">
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="NG">Nigeria</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="IT">Italy</option>
                <option value="ES">Spain</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Postal Code</label>
              <input value={form.postal_code} onChange={e => update("postal_code", e.target.value)} placeholder="e.g. 500001" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
            </div>
          </div>
        </div>

        <div className="space-y-5 mt-8 pt-6 border-t border-gray-100">
          <h3 className="font-bold text-base text-text-1">Contact Information</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Contact Name</label>
              <input value={form.contact_name} onChange={e => update("contact_name", e.target.value)} placeholder="Full name" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Phone</label>
              <input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="Phone number" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="Email address" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
            </div>
          </div>
        </div>

        <div className="space-y-5 mt-8 pt-6 border-t border-gray-100">
          <h3 className="font-bold text-base text-text-1">Status & Flags</h3>

          <div className="flex gap-6">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 flex-1">
              <span className="text-sm font-medium text-text-1">Active</span>
              <button onClick={() => update("status", !form.status)}>
                {form.status ? <ToggleRight size={24} className="text-blue" /> : <ToggleLeft size={24} className="text-text-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 flex-1">
              <div>
                <span className="text-sm font-medium text-text-1">Pickup Point</span>
                <p className="text-[10px] text-text-4">Customers can pick up orders here</p>
              </div>
              <input
                type="checkbox"
                checked={form.is_pickup_point}
                onChange={e => update("is_pickup_point", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-blue"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 flex-1">
              <div>
                <span className="text-sm font-medium text-text-1">Dropoff Zone</span>
                <p className="text-[10px] text-text-4">Drop off shipments here</p>
              </div>
              <input
                type="checkbox"
                checked={form.is_dropoff_zone}
                onChange={e => update("is_dropoff_zone", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-blue"
              />
            </div>
          </div>
        </div>

        {saved && (
          <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium text-center">
            Warehouse created successfully! Redirecting...
          </div>
        )}
      </div>
    </AdminShell>
  );
}
