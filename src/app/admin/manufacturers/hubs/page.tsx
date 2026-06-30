"use client";

import { useState } from "react";
import {
  Building2, Globe, Plus, Search, Edit, Trash2, Save, X,
  MapPin, ChevronDown, Loader2, CheckCircle, AlertTriangle,
  Filter, Tag,
} from "lucide-react";
import AdminShell from "@/components/admin/admin-shell";

const countryFlags: Record<string, string> = {
  "China": "🇨🇳", "India": "🇮🇳", "Nigeria": "🇳🇬", "USA": "🇺🇸",
  "UK": "🇬🇧", "Germany": "🇩🇪", "UAE": "🇦🇪", "Ghana": "🇬🇭",
  "South Africa": "🇿🇦", "Japan": "🇯🇵", "Turkey": "🇹🇷", "Vietnam": "🇻🇳",
  "Bangladesh": "🇧🇩", "Brazil": "🇧🇷", "France": "🇫🇷",
};

const allCategories = [
  "Textiles & Apparel", "Electronics & Components", "Machinery & Industrial",
  "Automotive Parts", "Food & Beverage", "Pharmaceuticals",
  "Chemicals & Plastics", "Building Materials", "Furniture & Woodwork",
  "Metals & Alloys", "Ceramics & Glass", "Footwear & Leather",
  "Packaging & Printing", "Toys & Consumer Goods", "Energy & Solar",
];

interface Hub {
  id: string;
  country: string;
  city: string;
  name: string;
  categories: string[];
  active: boolean;
  manufacturerCount: number;
  established: string;
}

const seedHubs: Hub[] = [
  { id: "h1", country: "China", city: "Shenzhen", name: "Shenzhen Electronics Hub", categories: ["Electronics & Components", "Machinery & Industrial"], active: true, manufacturerCount: 12400, established: "2023-01-15" },
  { id: "h2", country: "China", city: "Guangzhou", name: "Guangzhou Consumer Goods Hub", categories: ["Consumer Goods", "Packaging & Printing", "Chemicals & Plastics"], active: true, manufacturerCount: 15600, established: "2023-01-15" },
  { id: "h3", country: "India", city: "Tiruppur", name: "Tiruppur Textile Hub", categories: ["Textiles & Apparel", "Footwear & Leather"], active: true, manufacturerCount: 5800, established: "2023-06-01" },
  { id: "h4", country: "Nigeria", city: "Aba", name: "Aba Manufacturing Hub", categories: ["Textiles & Apparel", "Footwear & Leather"], active: true, manufacturerCount: 3200, established: "2024-02-10" },
  { id: "h5", country: "Nigeria", city: "Lagos", name: "Lagos Industrial Hub", categories: ["Food & Beverage", "Packaging & Printing", "Building Materials"], active: true, manufacturerCount: 2800, established: "2024-05-20" },
  { id: "h6", country: "Turkey", city: "Istanbul", name: "Istanbul Ceramics Hub", categories: ["Ceramics & Glass", "Textiles & Apparel"], active: true, manufacturerCount: 7400, established: "2023-09-01" },
  { id: "h7", country: "Vietnam", city: "Ho Chi Minh City", name: "HCM Footwear & Electronics Hub", categories: ["Footwear & Leather", "Electronics & Components"], active: true, manufacturerCount: 6100, established: "2024-01-12" },
  { id: "h8", country: "Bangladesh", city: "Dhaka", name: "Dhaka Garment Hub", categories: ["Textiles & Apparel"], active: true, manufacturerCount: 4300, established: "2024-03-05" },
  { id: "h9", country: "Germany", city: "Munich", name: "Munich Precision Engineering Hub", categories: ["Machinery & Industrial", "Automotive Parts"], active: true, manufacturerCount: 2100, established: "2023-11-01" },
  { id: "h10", country: "South Africa", city: "Johannesburg", name: "JHB Steel & Mining Hub", categories: ["Metals & Alloys", "Building Materials"], active: false, manufacturerCount: 1500, established: "2025-06-15" },
];

const hubStatusColors: Record<string, string> = {
  true: "bg-green-50 text-green-700 border-green-200",
  false: "bg-gray-100 text-gray-600 border-gray-200",
};

const categoryColors = [
  "bg-blue-50 text-blue-700", "bg-purple-50 text-purple-700", "bg-green-50 text-green-700",
  "bg-orange-50 text-orange", "bg-pink-50 text-pink-700", "bg-teal-50 text-teal-700",
  "bg-amber-50 text-amber-700", "bg-red-50 text-red-700", "bg-indigo-50 text-indigo-700",
];

export default function AdminManufacturersHubsPage() {
  const [hubs, setHubs] = useState<Hub[]>(seedHubs);
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHub, setEditingHub] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    country: "Nigeria", city: "", name: "", categories: [] as string[], active: true,
  });

  const filtered = hubs.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCountry = countryFilter === "all" || h.country === countryFilter;
    return matchSearch && matchCountry;
  });

  const resetForm = () => {
    setFormData({ country: "Nigeria", city: "", name: "", categories: [], active: true });
    setEditingHub(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.city) return;
    if (editingHub) {
      setHubs((prev) => prev.map((h) =>
        h.id === editingHub ? { ...h, ...formData } : h
      ));
    } else {
      const newHub: Hub = {
        id: `h${Date.now()}`,
        ...formData,
        manufacturerCount: 0,
        established: new Date().toISOString().split("T")[0],
      };
      setHubs((prev) => [newHub, ...prev]);
    }
    setShowAddModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setHubs((prev) => prev.filter((h) => h.id !== id));
  };

  const handleEdit = (hub: Hub) => {
    setFormData({
      country: hub.country, city: hub.city, name: hub.name,
      categories: hub.categories, active: hub.active,
    });
    setEditingHub(hub.id);
    setShowAddModal(true);
  };

  const toggleCategory = (cat: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  return (
    <AdminShell title="Manufacturing Hubs" subtitle="Manage global manufacturing hub locations">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FF6B00] flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{hubs.length} Manufacturing Hubs</h2>
            <p className="text-xs text-gray-500">{hubs.filter((h) => h.active).length} active across {new Set(hubs.map((h) => h.country)).size} countries</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF6B00] text-white text-sm font-semibold hover:bg-[#e55f00] transition-colors"
        >
          <Plus size={14} /> Add Hub
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search hubs by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
            />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
            >
              <option value="all">All Countries</option>
              {Object.keys(countryFlags).map((c) => (
                <option key={c} value={c}>{countryFlags[c]} {c}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Hubs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Country</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">City</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Hub Name</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Primary Categories</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Manufacturers</th>
                <th className="text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-[11px] text-gray-500 font-semibold uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((hub) => (
                <tr key={hub.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{countryFlags[hub.country] || "🌍"}</span>
                      <span className="text-sm text-gray-700">{hub.country}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-gray-400" />
                      <span className="text-sm text-gray-700">{hub.city}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">{hub.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {hub.categories.slice(0, 2).map((cat, i) => (
                        <span key={cat} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${categoryColors[i % categoryColors.length]}`}>
                          {cat}
                        </span>
                      ))}
                      {hub.categories.length > 2 && (
                        <span className="text-[10px] text-gray-400">+{hub.categories.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-gray-900">{hub.manufacturerCount.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${hubStatusColors[String(hub.active)]}`}>
                      {hub.active ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                      {hub.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(hub)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(hub.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-1">No hubs found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add/Edit Hub Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[520px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="font-bold text-lg text-gray-900">{editingHub ? "Edit Hub" : "Add New Hub"}</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Hub Name *</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Shenzhen Electronics Hub"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Country *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
                  >
                    {Object.keys(countryFlags).map((c) => (
                      <option key={c} value={c}>{countryFlags[c]} {c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">City *</label>
                  <input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Shenzhen"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Primary Categories</label>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat, i) => {
                    const selected = formData.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          selected
                            ? `${categoryColors[i % categoryColors.length]} border-transparent`
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-gray-700">Active</label>
                <button
                  onClick={() => setFormData({ ...formData, active: !formData.active })}
                  className={`w-10 h-5 rounded-full transition-colors ${formData.active ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${formData.active ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-200">
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.city}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF6B00] text-white text-sm font-semibold hover:bg-[#e55f00] transition-colors disabled:opacity-50"
              >
                <Save size={14} /> {editingHub ? "Update Hub" : "Create Hub"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
