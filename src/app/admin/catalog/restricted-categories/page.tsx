"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Plus, Search, X, ToggleLeft, ToggleRight, Edit2, Trash2,
  Shield, AlertTriangle, FileText,
} from "lucide-react";

const categoryOptions = [
  "Electronics", "CCTV & Surveillance", "Marine Equipment",
  "Fire Safety", "Medical Devices", "Automotive Parts",
  "Food & Beverages", "Chemicals", "Pharmaceuticals",
  "Children's Products", "Weapons & Ammunition",
];

const brandOptions = [
  "Hikvision", "Dahua", "Bosch", "Honeywell", "Samsung",
  "Yamaha", "Mercury", "Suzuki", "Tohatsu", "ZKTeco",
];

const documentOptions = [
  "Purchase Invoice",
  "Brand Authorization Letter",
  "Certificate of Authenticity",
  "Import Duty Receipt",
  "NAFDAC Registration",
  "SON Certificate",
  "FCC Compliance",
  "CE Marking Certificate",
];

const conditionOptions = ["New", "Used", "Refurbished", "Open Box", "Certified Pre-Owned"];

interface Restriction {
  id: number;
  type: "category" | "brand";
  name: string;
  documents: string[];
  conditions: string[];
  active: boolean;
  created_at: string;
}

const defaultRestrictions: Restriction[] = [
  { id: 1, type: "category", name: "CCTV & Surveillance", documents: ["Purchase Invoice", "Brand Authorization Letter"], conditions: ["New"], active: true, created_at: "2026-05-01" },
  { id: 2, type: "category", name: "Pharmaceuticals", documents: ["NAFDAC Registration", "Purchase Invoice"], conditions: ["New"], active: true, created_at: "2026-05-03" },
  { id: 3, type: "brand", name: "Hikvision", documents: ["Brand Authorization Letter", "Certificate of Authenticity"], conditions: ["New"], active: true, created_at: "2026-05-05" },
  { id: 4, type: "brand", name: "Dahua", documents: ["Brand Authorization Letter"], conditions: ["New", "Refurbished"], active: true, created_at: "2026-05-08" },
  { id: 5, type: "category", name: "Medical Devices", documents: ["SON Certificate", "Import Duty Receipt"], conditions: ["New"], active: false, created_at: "2026-05-10" },
  { id: 6, type: "brand", name: "Bosch", documents: ["Brand Authorization Letter", "Certificate of Authenticity"], conditions: ["New", "Used", "Refurbished"], active: true, created_at: "2026-05-12" },
  { id: 7, type: "category", name: "Chemicals", documents: ["SON Certificate", "Import Duty Receipt", "NAFDAC Registration"], conditions: ["New"], active: false, created_at: "2026-05-15" },
  { id: 8, type: "brand", name: "Yamaha", documents: ["Brand Authorization Letter"], conditions: ["New"], active: true, created_at: "2026-05-18" },
];

export default function RestrictedCategoriesPage() {
  const [restrictions, setRestrictions] = useState<Restriction[]>(defaultRestrictions);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "category" | "brand">("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Restriction | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  const [form, setForm] = useState({
    type: "category" as "category" | "brand",
    name: "",
    documents: [] as string[],
    conditions: [] as string[],
    active: true,
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const filtered = restrictions.filter(r => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ type: "category", name: "", documents: [], conditions: ["New"], active: true });
    setShowModal(true);
  };

  const openEdit = (r: Restriction) => {
    setEditing(r);
    setForm({ type: r.type, name: r.name, documents: [...r.documents], conditions: [...r.conditions], active: r.active });
    setShowModal(true);
  };

  const toggleDoc = (doc: string) => {
    setForm(prev => ({
      ...prev,
      documents: prev.documents.includes(doc) ? prev.documents.filter(d => d !== doc) : [...prev.documents, doc],
    }));
  };

  const toggleCondition = (cond: string) => {
    setForm(prev => ({
      ...prev,
      conditions: prev.conditions.includes(cond) ? prev.conditions.filter(c => c !== cond) : [...prev.conditions, cond],
    }));
  };

  const handleSave = () => {
    if (!form.name) { showToast("Please select a category or brand", "error"); return; }
    if (form.documents.length === 0) { showToast("Select at least one required document", "error"); return; }
    if (form.conditions.length === 0) { showToast("Select at least one allowed condition", "error"); return; }

    if (editing) {
      setRestrictions(prev => prev.map(r => r.id === editing.id ? { ...r, ...form } : r));
      showToast("Restriction updated");
    } else {
      const newRestriction: Restriction = {
        id: Math.max(...restrictions.map(r => r.id)) + 1,
        ...form,
        created_at: new Date().toISOString().slice(0, 10),
      };
      setRestrictions(prev => [newRestriction, ...prev]);
      showToast("Restriction added");
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      setRestrictions(prev => prev.filter(r => r.id !== deleteId));
      showToast("Restriction removed");
      setDeleteId(null);
    }
  };

  const toggleActive = (r: Restriction) => {
    setRestrictions(prev => prev.map(item => item.id === r.id ? { ...item, active: !item.active } : item));
  };

  return (
    <AdminShell title="Restricted Categories & Brands" subtitle="Manage catalog restrictions for regulated categories and brands">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Restrictions", value: restrictions.length, color: "#1641C4" },
          { label: "Category Rules", value: restrictions.filter(r => r.type === "category").length, color: "#F59E0B" },
          { label: "Brand Rules", value: restrictions.filter(r => r.type === "brand").length, color: "#8B5CF6" },
          { label: "Active", value: restrictions.filter(r => r.active).length, color: "#10B981" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full -translate-y-1/2 translate-x-1/2 opacity-10" style={{ backgroundColor: s.color }} />
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-text-4">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(["all", "category", "brand"] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-xs rounded-md capitalize ${typeFilter === t ? "bg-white shadow-sm font-medium" : "text-text-4"}`}>{t}</button>
            ))}
          </div>
        </div>
        <button onClick={openCreate} className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2 shrink-0">
          <Plus size={14} /> Add Restriction
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-text-4">Type</th>
              <th className="text-left px-5 py-3 font-medium text-text-4">Name</th>
              <th className="text-left px-5 py-3 font-medium text-text-4">Required Documents</th>
              <th className="text-left px-5 py-3 font-medium text-text-4">Allowed Conditions</th>
              <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
              <th className="text-right px-5 py-3 font-medium text-text-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${r.type === "category" ? "bg-blue-50 text-blue" : "bg-purple-50 text-purple-700"}`}>
                    <Shield size={10} /> {r.type === "category" ? "Category" : "Brand"}
                  </span>
                </td>
                <td className="px-5 py-3 font-medium text-text-1">{r.name}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.documents.map(d => (
                      <span key={d} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange">
                        <FileText size={8} /> {d}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.conditions.map(c => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700">{c}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3 text-center">
                  <button onClick={() => toggleActive(r)} className="mx-auto">
                    {r.active ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} className="text-gray-300" />}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-4 hover:text-blue"><Edit2 size={13} /></button>
                    <button onClick={() => setDeleteId(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-text-4 hover:text-red"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-text-4">No restrictions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[580px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-lg">{editing ? "Edit Restriction" : "Add Restriction"}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-4 hover:text-text-2"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Type & Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Type</label>
                  <select value={form.type} onChange={e => { setForm({ ...form, type: e.target.value as "category" | "brand", name: "" }); }}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue">
                    <option value="category">Category</option>
                    <option value="brand">Brand</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">{form.type === "category" ? "Category" : "Brand"} *</label>
                  <select value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue">
                    <option value="">Select {form.type}...</option>
                    {(form.type === "category" ? categoryOptions : brandOptions).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <label className="text-sm font-medium text-text-2 block mb-2">Required Documents *</label>
                <div className="grid grid-cols-2 gap-2">
                  {documentOptions.map(doc => (
                    <label key={doc} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" checked={form.documents.includes(doc)} onChange={() => toggleDoc(doc)} className="rounded border-gray-300" />
                      <span className="text-sm text-text-2">{doc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Allowed Conditions */}
              <div>
                <label className="text-sm font-medium text-text-2 block mb-2">Allowed Conditions *</label>
                <div className="flex flex-wrap gap-2">
                  {conditionOptions.map(cond => (
                    <button key={cond} onClick={() => toggleCondition(cond)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${form.conditions.includes(cond) ? "bg-blue text-white border-blue" : "border-gray-200 text-text-3 hover:border-blue hover:text-blue"}`}>
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-text-1">Active</span>
                <button onClick={() => setForm({ ...form, active: !form.active })}>
                  {form.active ? <ToggleRight size={24} className="text-blue" /> : <ToggleLeft size={24} className="text-text-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-text-3 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 h-10 rounded-lg bg-blue text-white text-sm font-semibold hover:bg-blue-600">{editing ? "Update" : "Add"} Restriction</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl w-[400px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><AlertTriangle size={18} className="text-red" /></div>
              <div>
                <h3 className="font-semibold text-lg">Remove Restriction?</h3>
                <p className="text-sm text-text-3">Vendors will no longer be restricted for this item.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setDeleteId(null)} className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-text-3 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 h-10 rounded-lg bg-red text-white text-sm font-semibold hover:bg-red/90">Remove</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
