"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import { Loader2, Plus, X, Save, Edit2, Package, Gift, Box } from "lucide-react";

interface PackagingElement {
  id: string;
  category: string;
  name: string;
  size_code: string;
  unit_cost: number;
  is_kauvex_branded: boolean;
  is_active: boolean;
}

interface PackagingAddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  available_for: string;
  is_active: boolean;
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  outer: { label: "Outer", color: "bg-blue-50 text-blue" },
  inner: { label: "Inner", color: "bg-green-50 text-green-700" },
  seal: { label: "Seal", color: "bg-purple-50 text-purple-600" },
  insert: { label: "Insert", color: "bg-orange-50 text-orange" },
  label: { label: "Label", color: "bg-red-50 text-red" },
};

const seedElements: PackagingElement[] = [
  { id: "1", category: "outer", name: "Standard Corrugated Box", size_code: "BOX-M", unit_cost: 450, is_kauvex_branded: true, is_active: true },
  { id: "2", category: "outer", name: "Large Shipping Box", size_code: "BOX-L", unit_cost: 850, is_kauvex_branded: true, is_active: true },
  { id: "3", category: "inner", name: "Bubble Wrap Roll", size_code: "BW-30", unit_cost: 320, is_kauvex_branded: false, is_active: true },
  { id: "4", category: "inner", name: "Kraft Paper Filler", size_code: "KP-5KG", unit_cost: 180, is_kauvex_branded: false, is_active: true },
  { id: "5", category: "seal", name: "Tamper-Evident Tape", size_code: "TAPE-2", unit_cost: 90, is_kauvex_branded: true, is_active: true },
  { id: "6", category: "insert", name: "Thank You Card", size_code: "TYC-A5", unit_cost: 45, is_kauvex_branded: true, is_active: true },
  { id: "7", category: "label", name: "Shipping Label 4x6", size_code: "LBL-4X6", unit_cost: 25, is_kauvex_branded: false, is_active: true },
];

const seedAddOns: PackagingAddOn[] = [
  { id: "a1", name: "Gift Wrapping", description: "Premium gift wrap with ribbon", price: 1500, available_for: "all", is_active: true },
  { id: "a2", name: "Fragile Handling", description: "Extra fragile tape and cushioning", price: 800, available_for: "all", is_active: true },
  { id: "a3", name: "Express Packaging", description: "Priority packaging for express orders", price: 2000, available_for: "express", is_active: true },
  { id: "a4", name: "Branded Box", description: "Custom Kauvex-branded premium box", price: 2500, available_for: "kauvex_originals", is_active: false },
];

export default function AdminPackagingPage() {
  const [tab, setTab] = useState<"elements" | "addons">("elements");
  const [elements, setElements] = useState<PackagingElement[]>([]);
  const [addOns, setAddOns] = useState<PackagingAddOn[]>([]);
  const [loading, setLoading] = useState(true);

  // Element modal
  const [showElementModal, setShowElementModal] = useState(false);
  const [editElement, setEditElement] = useState<PackagingElement | null>(null);
  const [elementForm, setElementForm] = useState({ category: "outer", name: "", size_code: "", unit_cost: 0, is_kauvex_branded: false, is_active: true });

  // Add-on modal
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [editAddon, setEditAddon] = useState<PackagingAddOn | null>(null);
  const [addonForm, setAddonForm] = useState({ name: "", description: "", price: 0, available_for: "all", is_active: true });

  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [eRes, aRes] = await Promise.all([
        insforge.database.from("kv_ship_packaging_elements").select("*").order("category"),
        insforge.database.from("kv_ship_packaging_add_ons").select("*").order("name"),
      ]);
      if (eRes.data && eRes.data.length > 0) setElements(eRes.data);
      else setElements(seedElements);
      if (aRes.data && aRes.data.length > 0) setAddOns(aRes.data);
      else setAddOns(seedAddOns);
    } catch {
      setElements(seedElements);
      setAddOns(seedAddOns);
    } finally { setLoading(false); }
  };

  const openElementModal = (el?: PackagingElement) => {
    if (el) {
      setEditElement(el);
      setElementForm({ category: el.category, name: el.name, size_code: el.size_code, unit_cost: el.unit_cost, is_kauvex_branded: el.is_kauvex_branded, is_active: el.is_active });
    } else {
      setEditElement(null);
      setElementForm({ category: "outer", name: "", size_code: "", unit_cost: 0, is_kauvex_branded: false, is_active: true });
    }
    setShowElementModal(true);
  };

  const saveElement = async () => {
    if (!elementForm.name.trim()) return;
    setSaving(true);
    try {
      if (editElement) {
        await insforge.database.from("kv_ship_packaging_elements").update(elementForm).eq("id", editElement.id);
        setElements(prev => prev.map(e => e.id === editElement.id ? { ...e, ...elementForm } : e));
      } else {
        const { data } = await insforge.database.from("kv_ship_packaging_elements").insert(elementForm).select();
        if (data) setElements(prev => [...prev, data[0]]);
      }
      setShowElementModal(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const openAddonModal = (a?: PackagingAddOn) => {
    if (a) {
      setEditAddon(a);
      setAddonForm({ name: a.name, description: a.description, price: a.price, available_for: a.available_for, is_active: a.is_active });
    } else {
      setEditAddon(null);
      setAddonForm({ name: "", description: "", price: 0, available_for: "all", is_active: true });
    }
    setShowAddonModal(true);
  };

  const saveAddon = async () => {
    if (!addonForm.name.trim()) return;
    setSaving(true);
    try {
      if (editAddon) {
        await insforge.database.from("kv_ship_packaging_add_ons").update(addonForm).eq("id", editAddon.id);
        setAddOns(prev => prev.map(a => a.id === editAddon.id ? { ...a, ...addonForm } : a));
      } else {
        const { data } = await insforge.database.from("kv_ship_packaging_add_ons").insert(addonForm).select();
        if (data) setAddOns(prev => [...prev, data[0]]);
      }
      setShowAddonModal(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <AdminShell title="Packaging Elements" subtitle="Manage packaging materials and add-ons">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Packaging Elements" subtitle="Manage packaging materials and add-ons">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: "elements" as const, label: "Elements", icon: Package },
            { key: "addons" as const, label: "Add-Ons", icon: Gift },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-white text-text-1 shadow-sm" : "text-text-4 hover:text-text-2"}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Elements Tab */}
        {tab === "elements" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-4">{elements.length} packaging elements</p>
              <button onClick={() => openElementModal()} className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2"><Plus size={14} /> Add Element</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Category", "Name", "Size Code", "Unit Cost", "Branded", "Status", "Actions"].map(h => (
                      <th key={h} className="p-3 text-left text-xs font-medium text-text-4 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {elements.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-text-4">No elements found</td></tr>
                  ) : (
                    elements.map(el => {
                      const cat = categoryConfig[el.category] || { label: el.category, color: "bg-gray-100 text-gray-600" };
                      return (
                        <tr key={el.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cat.color}`}>{cat.label}</span></td>
                          <td className="p-3 font-medium text-text-1">{el.name}</td>
                          <td className="p-3 font-mono text-xs text-text-4">{el.size_code}</td>
                          <td className="p-3 font-semibold text-text-1">₦{el.unit_cost.toLocaleString()}</td>
                          <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${el.is_kauvex_branded ? "bg-orange-50 text-orange" : "bg-gray-100 text-text-4"}`}>{el.is_kauvex_branded ? "Kauvex" : "Generic"}</span></td>
                          <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${el.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{el.is_active ? "Active" : "Inactive"}</span></td>
                          <td className="p-3"><button onClick={() => openElementModal(el)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit2 size={13} className="text-text-4" /></button></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Add-Ons Tab */}
        {tab === "addons" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-4">{addOns.length} packaging add-ons</p>
              <button onClick={() => openAddonModal()} className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2"><Plus size={14} /> Add Add-On</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addOns.length === 0 ? (
                <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-text-4">No add-ons found</div>
              ) : (
                addOns.map(a => (
                  <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Gift size={16} className="text-blue" />
                        <h4 className="font-semibold text-sm text-text-1">{a.name}</h4>
                      </div>
                      <button onClick={() => openAddonModal(a)} className="p-1 hover:bg-gray-100 rounded-lg"><Edit2 size={13} className="text-text-4" /></button>
                    </div>
                    <p className="text-xs text-text-4 mb-3">{a.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-1">₦{a.price.toLocaleString()}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${a.available_for === "all" ? "bg-blue-50 text-blue" : "bg-orange-50 text-orange"}`}>{a.available_for === "all" ? "All Orders" : a.available_for}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${a.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{a.is_active ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Element Modal */}
      {showElementModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowElementModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[480px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-lg">{editElement ? "Edit Element" : "Add Packaging Element"}</h2>
              <button onClick={() => setShowElementModal(false)} className="p-2 rounded-lg hover:bg-gray-50 text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-2 mb-1 block">Category</label>
                  <select value={elementForm.category} onChange={e => setElementForm({ ...elementForm, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue">
                    <option value="outer">Outer</option>
                    <option value="inner">Inner</option>
                    <option value="seal">Seal</option>
                    <option value="insert">Insert</option>
                    <option value="label">Label</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 mb-1 block">Size Code</label>
                  <input value={elementForm.size_code} onChange={e => setElementForm({ ...elementForm, size_code: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" placeholder="e.g. BOX-M" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Name</label>
                <input value={elementForm.name} onChange={e => setElementForm({ ...elementForm, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" placeholder="e.g. Standard Corrugated Box" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Unit Cost (₦)</label>
                <input type="number" value={elementForm.unit_cost} onChange={e => setElementForm({ ...elementForm, unit_cost: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={elementForm.is_kauvex_branded} onChange={e => setElementForm({ ...elementForm, is_kauvex_branded: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue focus:ring-blue" />
                  <span className="text-sm text-text-2">Kauvex Branded</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={elementForm.is_active} onChange={e => setElementForm({ ...elementForm, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue focus:ring-blue" />
                  <span className="text-sm text-text-2">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100">
              <button onClick={() => setShowElementModal(false)} className="flex-1 h-10 rounded-lg border border-gray-200 text-sm text-text-3 hover:bg-gray-50">Cancel</button>
              <button onClick={saveElement} disabled={saving || !elementForm.name}
                className="flex-1 h-10 rounded-lg bg-blue text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-40 flex items-center justify-center gap-1.5">
                <Save size={14} /> {saving ? "Saving..." : editElement ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add-On Modal */}
      {showAddonModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAddonModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[480px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-lg">{editAddon ? "Edit Add-On" : "Add Packaging Add-On"}</h2>
              <button onClick={() => setShowAddonModal(false)} className="p-2 rounded-lg hover:bg-gray-50 text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Name</label>
                <input value={addonForm.name} onChange={e => setAddonForm({ ...addonForm, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" placeholder="e.g. Gift Wrapping" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Description</label>
                <textarea value={addonForm.description} onChange={e => setAddonForm({ ...addonForm, description: e.target.value })}
                  className="w-full h-20 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue resize-none" placeholder="Describe this add-on..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-2 mb-1 block">Price (₦)</label>
                  <input type="number" value={addonForm.price} onChange={e => setAddonForm({ ...addonForm, price: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 mb-1 block">Available For</label>
                  <select value={addonForm.available_for} onChange={e => setAddonForm({ ...addonForm, available_for: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue">
                    <option value="all">All Orders</option>
                    <option value="express">Express Only</option>
                    <option value="kauvex_originals">Kauvex Originals</option>
                    <option value="b2b">B2B Only</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={addonForm.is_active} onChange={e => setAddonForm({ ...addonForm, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue focus:ring-blue" />
                <span className="text-sm text-text-2">Active</span>
              </label>
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100">
              <button onClick={() => setShowAddonModal(false)} className="flex-1 h-10 rounded-lg border border-gray-200 text-sm text-text-3 hover:bg-gray-50">Cancel</button>
              <button onClick={saveAddon} disabled={saving || !addonForm.name}
                className="flex-1 h-10 rounded-lg bg-blue text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-40 flex items-center justify-center gap-1.5">
                <Save size={14} /> {saving ? "Saving..." : editAddon ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
