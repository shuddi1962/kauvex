"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Package, Plus, Edit2, Trash2, Search, DollarSign, Globe, Check } from "lucide-react";

interface PackagingFee {
  id: string;
  packagingType: string;
  packagingSize: string;
  countryCode: string;
  fee: number;
  currency: string;
  description: string;
  isActive: boolean;
}

const PACKAGING_TYPES = [
  { id: "letter", name: "Letter / Document", icon: "📄", sizes: ["XS"] },
  { id: "small", name: "Small Parcel", icon: "📦", sizes: ["S"] },
  { id: "medium", name: "Medium Parcel", icon: "📫", sizes: ["M"] },
  { id: "large", name: "Large Parcel", icon: "📬", sizes: ["L"] },
  { id: "xlarge", name: "Extra Large", icon: "🚚", sizes: ["XL"] },
  { id: "fragile", name: "Fragile Pack", icon: "🛡️", sizes: ["M+", "L+"] },
  { id: "cold", name: "Cold Chain", icon: "❄️", sizes: ["M", "L"] },
  { id: "custom", name: "Custom / Special", icon: "🔧", sizes: ["Custom"] },
];

const COUNTRIES = [
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "AE", name: "UAE", currency: "AED" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "GH", name: "Ghana", currency: "GHS" },
  { code: "KE", name: "Kenya", currency: "KES" },
  { code: "ZA", name: "South Africa", currency: "ZAR" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR" },
  { code: "BR", name: "Brazil", currency: "BRL" },
  { code: "JP", name: "Japan", currency: "JPY" },
  { code: "FR", name: "France", currency: "EUR" },
];

const seedFees: PackagingFee[] = [
  { id: "f1", packagingType: "letter", packagingSize: "XS", countryCode: "NG", fee: 300, currency: "NGN", description: "Document envelope for letters and papers", isActive: true },
  { id: "f2", packagingType: "small", packagingSize: "S", countryCode: "NG", fee: 500, currency: "NGN", description: "Small corrugated box for accessories", isActive: true },
  { id: "f3", packagingType: "medium", packagingSize: "M", countryCode: "NG", fee: 800, currency: "NGN", description: "Medium box — most popular size", isActive: true },
  { id: "f4", packagingType: "large", packagingSize: "L", countryCode: "NG", fee: 1200, currency: "NGN", description: "Large box for bigger items", isActive: true },
  { id: "f5", packagingType: "xlarge", packagingSize: "XL", countryCode: "NG", fee: 2000, currency: "NGN", description: "Extra large for oversized items", isActive: true },
  { id: "f6", packagingType: "fragile", packagingSize: "M+", countryCode: "NG", fee: 1500, currency: "NGN", description: "Double protection for breakables", isActive: true },
  { id: "f7", packagingType: "cold", packagingSize: "M", countryCode: "NG", fee: 2500, currency: "NGN", description: "Insulated temperature-controlled pack", isActive: true },
  { id: "f8", packagingType: "custom", packagingSize: "Custom", countryCode: "NG", fee: 3000, currency: "NGN", description: "Special sizing or custom materials", isActive: true },
  { id: "f9", packagingType: "letter", packagingSize: "XS", countryCode: "GB", fee: 3.50, currency: "GBP", description: "Document envelope", isActive: true },
  { id: "f10", packagingType: "small", packagingSize: "S", countryCode: "GB", fee: 5.00, currency: "GBP", description: "Small box", isActive: true },
  { id: "f11", packagingType: "medium", packagingSize: "M", countryCode: "GB", fee: 8.50, currency: "GBP", description: "Medium box", isActive: true },
  { id: "f12", packagingType: "large", packagingSize: "L", countryCode: "GB", fee: 12.00, currency: "GBP", description: "Large box", isActive: true },
  { id: "f13", packagingType: "fragile", packagingSize: "M+", countryCode: "GB", fee: 15.00, currency: "GBP", description: "Fragile protection pack", isActive: true },
  { id: "f14", packagingType: "letter", packagingSize: "XS", countryCode: "US", fee: 4.00, currency: "USD", description: "Document envelope", isActive: true },
  { id: "f15", packagingType: "small", packagingSize: "S", countryCode: "US", fee: 6.00, currency: "USD", description: "Small box", isActive: true },
  { id: "f16", packagingType: "medium", packagingSize: "M", countryCode: "US", fee: 10.00, currency: "USD", description: "Medium box", isActive: true },
  { id: "f17", packagingType: "large", packagingSize: "L", countryCode: "US", fee: 15.00, currency: "USD", description: "Large box", isActive: true },
  { id: "f18", packagingType: "fragile", packagingSize: "M+", countryCode: "US", fee: 18.00, currency: "USD", description: "Fragile protection pack", isActive: true },
];

export default function PackagingFeesPage() {
  const [fees, setFees] = useState<PackagingFee[]>(seedFees);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFee, setEditFee] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newFee, setNewFee] = useState({ packagingType: "medium", packagingSize: "M", countryCode: "NG", fee: 0, description: "" });

  const filtered = fees.filter((f) => {
    const matchSearch = !search || f.packagingType.includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase());
    const matchCountry = countryFilter === "all" || f.countryCode === countryFilter;
    return matchSearch && matchCountry;
  });

  const handleSave = (id: string) => {
    setFees(fees.map((f) => f.id === id ? { ...f, fee: editFee } : f));
    setEditingId(null);
  };

  const handleAdd = () => {
    const country = COUNTRIES.find((c) => c.code === newFee.countryCode);
    setFees([...fees, {
      id: `f${Date.now()}`,
      ...newFee,
      currency: country?.currency || "NGN",
      isActive: true,
    }]);
    setShowAdd(false);
    setNewFee({ packagingType: "medium", packagingSize: "M", countryCode: "NG", fee: 0, description: "" });
  };

  const handleDelete = (id: string) => {
    setFees(fees.filter((f) => f.id !== id));
  };

  const handleToggle = (id: string) => {
    setFees(fees.map((f) => f.id === id ? { ...f, isActive: !f.isActive } : f));
  };

  const getTypeIcon = (type: string) => PACKAGING_TYPES.find((p) => p.id === type)?.icon || "📦";
  const getTypeName = (type: string) => PACKAGING_TYPES.find((p) => p.id === type)?.name || type;
  const getCountryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name || code;

  return (
    <AdminShell title="Packaging Fees" subtitle="Manage Express packaging options and pricing">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Packaging Fees</h1>
              <p className="text-sm text-gray-500">Manage packaging fees per type, size, and country</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-orange text-white rounded-lg font-medium flex items-center gap-2 hover:bg-orange-600">
            <Plus className="w-4 h-4" /> Add Fee
          </button>
        </div>

        {/* Packaging Type Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {PACKAGING_TYPES.map((pkg) => {
            const count = fees.filter((f) => f.packagingType === pkg.id).length;
            const avgFee = fees.filter((f) => f.packagingType === pkg.id).reduce((sum, f) => sum + f.fee, 0) / (count || 1);
            return (
              <div key={pkg.id} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <span className="text-3xl block mb-2">{pkg.icon}</span>
                <p className="font-semibold text-sm text-gray-900">{pkg.name}</p>
                <p className="text-xs text-gray-500">{count} countries configured</p>
                <p className="text-xs font-medium text-orange mt-1">From {fees.find((f) => f.packagingType === pkg.id)?.currency} {avgFee.toFixed(0)}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search packaging type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Countries</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Fees Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Size</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Country</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Fee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((fee) => (
                <tr key={fee.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getTypeIcon(fee.packagingType)}</span>
                      <span className="text-sm font-medium text-gray-900">{getTypeName(fee.packagingType)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{fee.packagingSize}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-700">{getCountryName(fee.countryCode)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editingId === fee.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editFee}
                          onChange={(e) => setEditFee(parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button onClick={() => handleSave(fee.id)} className="text-green-600 hover:text-green-700">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-gray-900">{fee.currency} {fee.fee.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{fee.description}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(fee.id)} className={`px-2 py-1 rounded-full text-xs font-medium ${fee.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {fee.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditingId(fee.id); setEditFee(fee.fee); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <button onClick={() => handleDelete(fee.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No packaging fees found</p>
            </div>
          )}
        </div>

        {/* Add Fee Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add Packaging Fee</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Packaging Type</label>
                  <select value={newFee.packagingType} onChange={(e) => {
                    const pkg = PACKAGING_TYPES.find((p) => p.id === e.target.value);
                    setNewFee({ ...newFee, packagingType: e.target.value, packagingSize: pkg?.sizes[0] || "M" });
                  }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    {PACKAGING_TYPES.map((p) => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <select value={newFee.packagingSize} onChange={(e) => setNewFee({ ...newFee, packagingSize: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    {PACKAGING_TYPES.find((p) => p.id === newFee.packagingType)?.sizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select value={newFee.countryCode} onChange={(e) => setNewFee({ ...newFee, countryCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee</label>
                  <input type="number" value={newFee.fee} onChange={(e) => setNewFee({ ...newFee, fee: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input type="text" value={newFee.description} onChange={(e) => setNewFee({ ...newFee, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                <button onClick={handleAdd} className="px-4 py-2 bg-orange text-white rounded-lg text-sm font-medium hover:bg-orange-600">Add Fee</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
