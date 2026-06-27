"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Star,
  X,
  Save,
  MapPin,
  Clock,
  Package,
  FileText,
  Globe,
  TrendingUp,
} from "lucide-react";

interface Destination {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  deliveryInstructions: string;
  usageCount: number;
  lastUsed: string;
}

const MOCK_DESTINATIONS: Destination[] = [
  {
    id: "1",
    label: "Lagos Main Warehouse",
    address: "23 Oshodi Expressway",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    postalCode: "100261",
    deliveryInstructions: "Deliver to loading dock B. Ask for Mr. Chukwuma at reception.",
    usageCount: 142,
    lastUsed: "2026-06-26",
  },
  {
    id: "2",
    label: "London Distribution Hub",
    address: "45 Oxford Street",
    city: "London",
    state: "Greater London",
    country: "United Kingdom",
    postalCode: "W1D 2AR",
    deliveryInstructions: "Ring bell at side entrance. Packages left with concierge if no answer.",
    usageCount: 87,
    lastUsed: "2026-06-25",
  },
  {
    id: "3",
    label: "Dubai Office",
    address: "Sheikh Zayed Road, Tower B",
    city: "Dubai",
    state: "Dubai",
    country: "UAE",
    postalCode: "00000",
    deliveryInstructions: "Floor 12 reception. Security badge required for after-hours delivery.",
    usageCount: 53,
    lastUsed: "2026-06-22",
  },
  {
    id: "4",
    label: "New York Client Drop",
    address: "350 Fifth Avenue",
    city: "New York",
    state: "New York",
    country: "United States",
    postalCode: "10118",
    deliveryInstructions: "Leave with building security desk. Do not leave unattended.",
    usageCount: 34,
    lastUsed: "2026-06-20",
  },
  {
    id: "5",
    label: "Accra Fulfillment Center",
    address: "10 Ring Road Central",
    city: "Accra",
    state: "Greater Accra",
    country: "Ghana",
    postalCode: "00233",
    deliveryInstructions: "Deliver to warehouse gate. Contact +233 24 567 8901 upon arrival.",
    usageCount: 28,
    lastUsed: "2026-06-18",
  },
  {
    id: "6",
    label: "Nairobi Partner Depot",
    address: "Mombasa Road, Industrial Area",
    city: "Nairobi",
    state: "Nairobi County",
    country: "Kenya",
    postalCode: "00100",
    deliveryInstructions: "Use gate 3. Loading bay at rear of building.",
    usageCount: 15,
    lastUsed: "2026-06-14",
  },
  {
    id: "7",
    label: "Abuja Branch Office",
    address: "15 Aguiyi-Ironsi Street",
    city: "Maitama",
    state: "FCT",
    country: "Nigeria",
    postalCode: "900271",
    deliveryInstructions: "Front desk reception. Ask for Amina.",
    usageCount: 9,
    lastUsed: "2026-06-10",
  },
];

const EMPTY_FORM = {
  label: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  deliveryInstructions: "",
};

export default function FrequentDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>(MOCK_DESTINATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const maxUsage = useMemo(
    () => Math.max(...destinations.map((d) => d.usageCount), 1),
    [destinations]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return destinations.filter(
      (d) =>
        d.label.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.address.toLowerCase().includes(q)
    );
  }, [destinations, searchQuery]);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (dest: Destination) => {
    setEditingId(dest.id);
    setFormData({
      label: dest.label,
      address: dest.address,
      city: dest.city,
      state: dest.state,
      country: dest.country,
      postalCode: dest.postalCode,
      deliveryInstructions: dest.deliveryInstructions,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.label || !formData.city || !formData.country) return;
    if (editingId) {
      setDestinations((prev) =>
        prev.map((d) => (d.id === editingId ? { ...d, ...formData } : d))
      );
    } else {
      const newDest: Destination = {
        id: Date.now().toString(),
        ...formData,
        usageCount: 0,
        lastUsed: new Date().toISOString().split("T")[0],
      };
      setDestinations((prev) => [newDest, ...prev]);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleDelete = (id: string) => {
    setDestinations((prev) => prev.filter((d) => d.id !== id));
    setDeleteConfirm(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const inputClass =
    "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#0A1628] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Frequent Destinations</h1>
          <p className="text-sm text-gray-500 mt-1">Your most-used shipping destinations at a glance</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-[#e55f00] transition"
        >
          <Plus className="w-4 h-4" /> Add Destination
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Destinations</p>
              <p className="text-xl font-bold text-[#0A1628]">{destinations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Shipments</p>
              <p className="text-xl font-bold text-[#0A1628]">
                {destinations.reduce((sum, d) => sum + d.usageCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Countries</p>
              <p className="text-xl font-bold text-[#0A1628]">
                {new Set(destinations.map((d) => d.country)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Most Used</p>
              <p className="text-sm font-bold text-[#0A1628] truncate">
                {destinations.length > 0
                  ? destinations.reduce((max, d) => (d.usageCount > max.usageCount ? d : max)).label
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by label, city, country, or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#0A1628]">No Destinations Found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery ? "Try a different search term." : "Add your first destination to get started."}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((dest) => {
          const isTop = dest.usageCount >= maxUsage * 0.7;
          return (
            <div
              key={dest.id}
              className={`bg-white rounded-xl border p-5 transition hover:shadow-md ${
                isTop ? "border-[#FF6B00]/30 ring-1 ring-[#FF6B00]/10" : "border-gray-200"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isTop ? "bg-[#FF6B00]/10" : "bg-[#F5F7FA]"
                    }`}
                  >
                    <MapPin className={`w-5 h-5 ${isTop ? "text-[#FF6B00]" : "text-gray-400"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#0A1628] text-sm">{dest.label}</h3>
                      {isTop && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] text-[10px] font-bold">
                          <Star className="w-3 h-3" /> TOP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {dest.address}, {dest.city}, {dest.state} {dest.postalCode}
                    </p>
                    <p className="text-xs text-gray-400">{dest.country}</p>
                    {dest.deliveryInstructions && (
                      <div className="flex items-start gap-1.5 mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-2">
                        <FileText className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                        <span>{dest.deliveryInstructions}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 lg:gap-8 shrink-0">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Shipments</p>
                    <p className="text-lg font-bold text-[#FF6B00]">{dest.usageCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Last Used</p>
                    <p className="text-xs font-medium text-[#0A1628] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {formatDate(dest.lastUsed)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(dest)}
                      className="p-2 text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/5 rounded-lg transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(dest.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Route usage</span>
                  <span>{dest.usageCount} shipments</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B00] rounded-full transition-all"
                    style={{ width: `${(dest.usageCount / maxUsage) * 100}%` }}
                  />
                </div>
              </div>

              {deleteConfirm === dest.id && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-xs font-medium mb-2">Delete this destination?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 text-xs hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(dest.id)}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowForm(false);
              setEditingId(null);
            }}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#0A1628]">
                {editingId ? "Edit Destination" : "Add New Destination"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">Label *</label>
                <input
                  type="text"
                  placeholder="e.g. Warehouse, Office, Client"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">Address</label>
                <input
                  type="text"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">City *</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">State / Region</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">Country *</label>
                  <input
                    type="text"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">Postal Code</label>
                  <input
                    type="text"
                    placeholder="Postal code"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">Delivery Instructions</label>
                <textarea
                  placeholder="Any special instructions for the courier..."
                  value={formData.deliveryInstructions}
                  onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.label || !formData.city || !formData.country}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-[#e55f00] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Save className="w-4 h-4" />
                {editingId ? "Update Destination" : "Save Destination"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
