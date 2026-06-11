"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Truck, Search, ToggleLeft, ToggleRight, Plus,
  Edit2, Trash2, Loader2, X, Wifi, WifiOff,
} from "lucide-react";

interface Carrier {
  id: string;
  name: string;
  code: string;
  type: string;
  supports_tracking: boolean;
  supports_labels: boolean;
  api_connected: boolean;
  coverage: string;
  status: "active" | "inactive";
}

const typeLabels: Record<string, string> = {
  standard: "Standard",
  express: "Express",
  international: "International",
  freight: "Freight",
  same_day: "Same Day",
};

const seedCarriers: Omit<Carrier, "id">[] = [
  { name: "DHL Express", code: "dhl", type: "international", supports_tracking: true, supports_labels: true, api_connected: true, coverage: "Worldwide", status: "active" },
  { name: "FedEx", code: "fedex", type: "international", supports_tracking: true, supports_labels: true, api_connected: true, coverage: "Worldwide", status: "active" },
  { name: "UPS", code: "ups", type: "international", supports_tracking: true, supports_labels: true, api_connected: false, coverage: "Worldwide", status: "active" },
  { name: "GIG Logistics", code: "gig", type: "standard", supports_tracking: true, supports_labels: false, api_connected: true, coverage: "Nigeria (Nationwide)", status: "active" },
  { name: "Kwik Delivery", code: "kwik", type: "same_day", supports_tracking: true, supports_labels: false, api_connected: true, coverage: "Lagos, Abuja, PH", status: "active" },
  { name: "In-house Riders", code: "inhouse", type: "standard", supports_tracking: false, supports_labels: false, api_connected: false, coverage: "Port Harcourt Metro", status: "active" },
  { name: "USPS", code: "usps", type: "standard", supports_tracking: true, supports_labels: true, api_connected: false, coverage: "United States", status: "inactive" },
  { name: "Royal Mail", code: "royal-mail", type: "standard", supports_tracking: true, supports_labels: true, api_connected: false, coverage: "United Kingdom", status: "inactive" },
];

export default function ShippingCarriersPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Carrier | null>(null);
  const [form, setForm] = useState({ name: "", code: "", type: "standard", coverage: "", supports_tracking: false, supports_labels: false, api_connected: false, status: "active" as "active" | "inactive" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCarriers(); }, []);

  const loadCarriers = async () => {
    try {
      const { data } = await insforge.database.from("shipping_carriers").select("*").order("name");
      if (data && data.length > 0) setCarriers(data);
      else {
        for (const c of seedCarriers) await insforge.database.from("shipping_carriers").insert(c);
        const { data: seeded } = await insforge.database.from("shipping_carriers").select("*").order("name");
        if (seeded) setCarriers(seeded);
      }
    } catch {
      setCarriers(seedCarriers.map((c, i) => ({ ...c, id: String(i + 1) })));
    } finally { setLoading(false); }
  };

  const toggleStatus = async (c: Carrier) => {
    const newStatus = c.status === "active" ? "inactive" : "active";
    try {
      await insforge.database.from("shipping_carriers").update({ status: newStatus }).eq("id", c.id);
      setCarriers(prev => prev.map(x => x.id === c.id ? { ...x, status: newStatus } : x));
    } catch { /* fallback */ }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", code: "", type: "standard", coverage: "", supports_tracking: false, supports_labels: false, api_connected: false, status: "active" });
    setShowModal(true);
  };

  const openEdit = (c: Carrier) => {
    setEditing(c);
    setForm({ name: c.name, code: c.code, type: c.type, coverage: c.coverage, supports_tracking: c.supports_tracking, supports_labels: c.supports_labels, api_connected: c.api_connected, status: c.status });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) return;
    setSaving(true);
    try {
      if (editing?.id) {
        await insforge.database.from("shipping_carriers").update(form).eq("id", editing.id);
        setCarriers(carriers.map(c => c.id === editing.id ? { ...c, ...form } : c));
      } else {
        const { data } = await insforge.database.from("shipping_carriers").insert(form).select("*");
        if (data?.[0]) setCarriers([...carriers, data[0]]);
      }
      setShowModal(false);
    } catch { /* fallback */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await insforge.database.from("shipping_carriers").delete().eq("id", id);
      setCarriers(carriers.filter(c => c.id !== id));
      setDeleteConfirm(null);
    } catch { /* fallback */ }
  };

  const filtered = search
    ? carriers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
    : carriers;

  if (loading) {
    return (
      <AdminShell title="Shipping Carriers" subtitle="Manage shipping carrier integrations">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Shipping Carriers" subtitle="Manage shipping carrier integrations">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Carriers", value: carriers.length },
          { label: "Active", value: carriers.filter(c => c.status === "active").length, color: "text-green-600" },
          { label: "API Connected", value: carriers.filter(c => c.api_connected).length, color: "text-blue" },
          { label: "Tracking Enabled", value: carriers.filter(c => c.supports_tracking).length, color: "text-purple-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className={`font-bold text-2xl ${s.color || "text-text-1"}`}>{s.value}</p>
            <p className="text-xs text-text-4 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search carriers..." className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue/20" />
          </div>
          <button onClick={openCreate} className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2">
            <Plus size={14} /> Add Carrier
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Carrier</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Code</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Type</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Tracking</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Labels</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Connection</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Status</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-sm text-text-4">No carriers found</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue/10 flex items-center justify-center shrink-0">
                      <Truck size={16} className="text-blue" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-text-1">{c.name}</span>
                      <p className="text-[10px] text-text-4">{c.coverage}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span className="text-xs font-mono font-medium text-text-2 bg-gray-100 px-2 py-0.5 rounded">{c.code}</span>
                </td>
                <td className="p-3 text-center">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-text-3">
                    {typeLabels[c.type] || c.type}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {c.supports_tracking ? (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Yes</span>
                  ) : (
                    <span className="text-xs text-text-4">—</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  {c.supports_labels ? (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Yes</span>
                  ) : (
                    <span className="text-xs text-text-4">—</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <span className="inline-flex items-center gap-1 text-xs font-medium">
                    {c.api_connected ? (
                      <><Wifi size={12} className="text-green-600" /><span className="text-green-600">Connected</span></>
                    ) : (
                      <><WifiOff size={12} className="text-text-4" /><span className="text-text-4">Manual</span></>
                    )}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => toggleStatus(c)} className="inline-flex items-center gap-1">
                    {c.status === "active" ? (
                      <ToggleRight size={20} className="text-green-600" />
                    ) : (
                      <ToggleLeft size={20} className="text-text-4" />
                    )}
                    <span className={`text-xs font-medium ${c.status === "active" ? "text-green-600" : "text-text-4"}`}>
                      {c.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </button>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-3">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 hover:bg-red/10 rounded-lg text-red">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-[500px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-lg">{editing ? "Edit Carrier" : "New Carrier"}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-4 hover:text-text-2"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Carrier Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, code: editing ? form.code : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })} placeholder="e.g. DHL Express" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Code *</label>
                  <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "") })} placeholder="e.g. dhl" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue">
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="international">International</option>
                    <option value="freight">Freight</option>
                    <option value="same_day">Same Day</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Coverage</label>
                  <input value={form.coverage} onChange={e => setForm({ ...form, coverage: e.target.value })} placeholder="e.g. Worldwide" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-blue transition-colors has-[:checked]:border-blue has-[:checked]:bg-blue/5">
                  <input type="checkbox" checked={form.supports_tracking} onChange={e => setForm({ ...form, supports_tracking: e.target.checked })} className="w-4 h-4 rounded border-gray-300 accent-blue" />
                  <div>
                    <p className="text-sm font-medium text-text-1">Supports Tracking</p>
                    <p className="text-[11px] text-text-4">Provides real-time shipment tracking numbers</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-blue transition-colors has-[:checked]:border-blue has-[:checked]:bg-blue/5">
                  <input type="checkbox" checked={form.supports_labels} onChange={e => setForm({ ...form, supports_labels: e.target.checked })} className="w-4 h-4 rounded border-gray-300 accent-blue" />
                  <div>
                    <p className="text-sm font-medium text-text-1">Supports Labels</p>
                    <p className="text-[11px] text-text-4">Can generate shipping labels via API</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-blue transition-colors has-[:checked]:border-blue has-[:checked]:bg-blue/5">
                  <input type="checkbox" checked={form.api_connected} onChange={e => setForm({ ...form, api_connected: e.target.checked })} className="w-4 h-4 rounded border-gray-300 accent-blue" />
                  <div>
                    <p className="text-sm font-medium text-text-1">API Connected</p>
                    <p className="text-[11px] text-text-4">Integration is active and connected</p>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-text-3 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.code} className="flex-1 h-10 rounded-lg bg-blue text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-1.5">
                {saving ? "Saving..." : editing ? "Update" : "Add"} Carrier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl w-[400px] p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-2">Delete Carrier?</h3>
            <p className="text-sm text-text-3 mb-5">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-10 rounded-lg bg-red text-white text-sm font-semibold hover:bg-red/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
