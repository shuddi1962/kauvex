"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown, Eye, Plus, CheckCircle, XCircle, ChevronLeft, ChevronRight, Building2 } from "lucide-react";

interface Hub {
  id: string;
  hubName: string;
  hubSlug: string;
  subdomain: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  productCategories: string[];
  professionalCategories: string[];
  configuratorsAvailable: string[];
  pillarsAvailable: string[];
  createdAt: string;
}

export default function HubsPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editHub, setEditHub] = useState<Hub | null>(null);
  const [formData, setFormData] = useState({
    hubName: "",
    hubSlug: "",
    subdomain: "",
    description: "",
    sortOrder: 0,
    pillarsAvailable: "",
    productCategories: "",
    professionalCategories: "",
  });

  const fetchHubs = () => {
    setLoading(true);
    fetch("/api/v1/kpn/hubs")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setHubs(res.data || []);
      })
      .catch(() => setHubs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHubs(); }, []);

  const toggleActive = async (hub: Hub) => {
    await fetch(`/api/v1/kpn/hubs/${hub.hubSlug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !hub.isActive }),
    });
    fetchHubs();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/v1/kpn/hubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        sortOrder: Number(formData.sortOrder),
        pillarsAvailable: formData.pillarsAvailable.split(",").map((s) => s.trim()).filter(Boolean),
        productCategories: formData.productCategories.split(",").map((s) => s.trim()).filter(Boolean),
        professionalCategories: formData.professionalCategories.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });
    setShowCreateForm(false);
    setFormData({ hubName: "", hubSlug: "", subdomain: "", description: "", sortOrder: 0, pillarsAvailable: "", productCategories: "", professionalCategories: "" });
    fetchHubs();
  };

  const fillEditForm = (hub: Hub) => {
    setEditHub(hub);
    setFormData({
      hubName: hub.hubName,
      hubSlug: hub.hubSlug,
      subdomain: hub.subdomain || "",
      description: hub.description || "",
      sortOrder: hub.sortOrder,
      pillarsAvailable: (hub.pillarsAvailable || []).join(", "),
      productCategories: (hub.productCategories || []).join(", "),
      professionalCategories: (hub.professionalCategories || []).join(", "),
    });
    setShowCreateForm(true);
  };

  const filtered = hubs.filter((h) =>
    h.hubName.toLowerCase().includes(search.toLowerCase()) ||
    h.hubSlug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Actions */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hubs..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange"
          />
        </div>
        <button
          onClick={() => { setEditHub(null); setFormData({ hubName: "", hubSlug: "", subdomain: "", description: "", sortOrder: 0, pillarsAvailable: "", productCategories: "", professionalCategories: "" }); setShowCreateForm(!showCreateForm); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-kauvex-orange text-white rounded-lg text-sm font-medium hover:bg-kauvex-orange/90 transition-colors"
        >
          <Plus size={15} /> {showCreateForm ? "Cancel" : "New Hub"}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-bold text-sm text-kauvex-navy mb-4">{editHub ? "Edit Hub" : "Create New Hub"}</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Hub Name *</label>
              <input
                required
                value={formData.hubName}
                onChange={(e) => setFormData({ ...formData, hubName: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Slug *</label>
              <input
                required
                value={formData.hubSlug}
                onChange={(e) => setFormData({ ...formData, hubSlug: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Subdomain</label>
              <input
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Pillars (comma-separated)</label>
              <input
                value={formData.pillarsAvailable}
                onChange={(e) => setFormData({ ...formData, pillarsAvailable: e.target.value })}
                placeholder="products, professionals, projects..."
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Product Categories (comma-separated)</label>
              <input
                value={formData.productCategories}
                onChange={(e) => setFormData({ ...formData, productCategories: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Professional Categories (comma-separated)</label>
              <input
                value={formData.professionalCategories}
                onChange={(e) => setFormData({ ...formData, professionalCategories: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange"
              />
            </div>
            <div className="md:col-span-3 flex gap-3 pt-2">
              <button type="submit" className="px-6 py-2 bg-kauvex-orange text-white rounded-lg text-sm font-medium hover:bg-kauvex-orange/90">
                {editHub ? "Update Hub" : "Create Hub"}
              </button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Hub</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pillars</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Categories</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Active</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                    <Building2 size={32} className="mx-auto text-gray-300 mb-2" />
                    No hubs found
                  </td>
                </tr>
              ) : (
                filtered.map((hub) => (
                  <tr key={hub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-kauvex-orange/10 to-kauvex-orange/5 flex items-center justify-center">
                          <Building2 size={16} className="text-kauvex-orange" />
                        </div>
                        <div>
                          <p className="font-medium text-kauvex-navy text-sm">{hub.hubName}</p>
                          {hub.subdomain && <p className="text-[11px] text-gray-400">{hub.subdomain}.kauvex.com</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{hub.hubSlug}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{(hub.pillarsAvailable || []).length}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {(hub.productCategories || []).length + (hub.professionalCategories || []).length}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{hub.sortOrder}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(hub)}
                        className={`p-1 rounded-lg transition-colors ${hub.isActive ? "text-green-500 hover:bg-green-50" : "text-gray-300 hover:bg-gray-100"}`}
                      >
                        {hub.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => fillEditForm(hub)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-kauvex-navy"
                        title="Edit"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
