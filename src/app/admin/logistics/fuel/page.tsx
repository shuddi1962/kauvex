"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Fuel,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Building2,
  Loader2,
} from "lucide-react";

interface FuelStation {
  id: string;
  name: string;
  city: string;
  country_code: string;
  latitude: number;
  longitude: number;
  fuel_type: string;
  price: number;
  currency_code: string;
  last_updated: string;
  created_at: string;
}

const CITIES = ["All Cities", "Lagos", "Abuja", "Port Harcourt"];
const FUEL_TYPES = ["All Types", "petrol", "diesel"];
const COUNTRIES = ["NG", "GB", "US", "AE", "IN", "AU", "DE", "CA", "GH", "KE", "ZA", "SA", "BR", "JP", "FR"];

const emptyStation = {
  name: "",
  city: "",
  country_code: "NG",
  latitude: 0,
  longitude: 0,
  fuel_type: "petrol",
  price: 0,
  currency_code: "NGN",
};

export default function AdminFuelStationsPage() {
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All Cities");
  const [fuelFilter, setFuelFilter] = useState("All Types");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FuelStation | null>(null);
  const [form, setForm] = useState(emptyStation);
  const [saving, setSaving] = useState(false);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cityFilter !== "All Cities") params.set("city", cityFilter);
      if (fuelFilter !== "All Types") params.set("fuel_type", fuelFilter);
      const res = await fetch(`/api/v1/admin/logistics/fuel-stations?${params.toString()}`);
      const json = await res.json();
      setStations(json.data || []);
    } catch {
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityFilter, fuelFilter]);

  const filtered = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  const avgPrice = filtered.length
    ? filtered.reduce((sum, s) => sum + Number(s.price), 0) / filtered.length
    : 0;

  const petrolStations = filtered.filter((s) => s.fuel_type === "petrol");
  const dieselStations = filtered.filter((s) => s.fuel_type === "diesel");

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await fetch("/api/v1/admin/logistics/fuel-stations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, id: editing.id }),
        });
      } else {
        await fetch("/api/v1/admin/logistics/fuel-stations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      setShowModal(false);
      setEditing(null);
      setForm(emptyStation);
      fetchStations();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this fuel station?")) return;
    await fetch(`/api/v1/admin/logistics/fuel-stations?id=${id}`, { method: "DELETE" });
    fetchStations();
  };

  const openEdit = (station: FuelStation) => {
    setEditing(station);
    setForm({
      name: station.name,
      city: station.city,
      country_code: station.country_code,
      latitude: Number(station.latitude),
      longitude: Number(station.longitude),
      fuel_type: station.fuel_type,
      price: Number(station.price),
      currency_code: station.currency_code,
    });
    setShowModal(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyStation);
    setShowModal(true);
  };

  return (
    <AdminShell>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]">Fuel Stations Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage fuel station partners and pricing for Express fleet operations
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchStations}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-[#e65c00] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Station
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Fuel className="w-3.5 h-3.5" />
              Total Stations
            </div>
            <div className="text-2xl font-bold text-[#0A1628]">{filtered.length}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Building2 className="w-3.5 h-3.5" />
              Cities Covered
            </div>
            <div className="text-2xl font-bold text-[#0A1628]">
              {new Set(filtered.map((s) => s.city)).size}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-orange-600 text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Avg Petrol ₦/L
            </div>
            <div className="text-2xl font-bold text-[#FF6B00]">
              {petrolStations.length ? `₦${avgPrice.toFixed(0)}` : "—"}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-blue-600 text-xs mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              Diesel Stations
            </div>
            <div className="text-2xl font-bold text-blue-600">{dieselStations.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by station name or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="h-10 rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] appearance-none cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <select
                value={fuelFilter}
                onChange={(e) => setFuelFilter(e.target.value)}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] appearance-none cursor-pointer"
              >
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f === "All Types" ? f : f.charAt(0).toUpperCase() + f.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Station</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">City</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Country</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Fuel Type</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Price/L</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Coordinates</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Updated</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <Loader2 className="w-6 h-6 text-gray-300 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading stations...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <Fuel className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No fuel stations found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((station) => (
                    <tr key={station.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded flex items-center justify-center ${
                              station.fuel_type === "diesel" ? "bg-blue-100" : "bg-orange-100"
                            }`}
                          >
                            <Fuel
                              className={`w-3.5 h-3.5 ${
                                station.fuel_type === "diesel" ? "text-blue-600" : "text-[#FF6B00]"
                              }`}
                            />
                          </div>
                          <span className="text-sm font-medium text-[#0A1628]">{station.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {station.city}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{station.country_code}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            station.fuel_type === "diesel"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-orange-50 text-[#FF6B00]"
                          }`}
                        >
                          {station.fuel_type.charAt(0).toUpperCase() + station.fuel_type.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-sm font-bold text-[#0A1628]">
                          ₦{Number(station.price).toFixed(0)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400 font-mono">
                        {Number(station.latitude).toFixed(4)}, {Number(station.longitude).toFixed(4)}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400">
                        {new Date(station.last_updated).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(station)}
                            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(station.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#0A1628]">
                  {editing ? "Edit Fuel Station" : "Add Fuel Station"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-md hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Station Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. NNPC Mega Station"
                    className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="e.g. Lagos"
                      className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Country</label>
                    <select
                      value={form.country_code}
                      onChange={(e) => setForm({ ...form, country_code: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] appearance-none"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={form.latitude || ""}
                      onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })}
                      className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={form.longitude || ""}
                      onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })}
                      className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Fuel Type</label>
                    <select
                      value={form.fuel_type}
                      onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] appearance-none"
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Price/L</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price || ""}
                      onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                      className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Currency</label>
                    <select
                      value={form.currency_code}
                      onChange={(e) => setForm({ ...form, currency_code: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] appearance-none"
                    >
                      <option value="NGN">NGN</option>
                      <option value="GBP">GBP</option>
                      <option value="USD">USD</option>
                      <option value="AED">AED</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.city || !form.price}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-[#e65c00] transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
