"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Search, Globe, Package, Users, RefreshCw, ExternalLink, CheckCircle2, Clock } from "lucide-react";

interface VirtualAddress {
  id: string;
  userId: string;
  countryCode: string;
  city: string;
  streetAddress: string;
  unitIdentifier: string;
  isActive: boolean;
  packagesReceived: number;
  packagesForwarded: number;
  createdAt: string;
}

const HUB_NAMES: Record<string, string> = {
  GB: "London, UK", US: "Newark, USA", CN: "Shenzhen, China",
  CA: "Toronto, Canada", AE: "Dubai, UAE", DE: "Frankfurt, Germany",
};

const FLAGS: Record<string, string> = {
  GB: "\ud83c\uddec\ud83c\udde7", US: "\ud83c\uddfa\ud83c\uddf8", CN: "\ud83c\udde8\ud83c\uddf3",
  CA: "\ud83c\udde8\ud83c\udde6", AE: "\ud83c\udde6\ud83c\uddea", DE: "\ud83c\udde9\ud83c\uddea",
};

export default function VirtualAddressesAdminPage() {
  const [addresses, setAddresses] = useState<VirtualAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/logistics/virtual-addresses?action=hubs");
      await res.json();
      setAddresses([]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = addresses.filter((a) => {
    if (filterCountry !== "all" && a.countryCode !== filterCountry) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.unitIdentifier.toLowerCase().includes(q) || a.city.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPackages = addresses.reduce((s, a) => s + a.packagesReceived, 0);
  const totalForwarded = addresses.reduce((s, a) => s + a.packagesForwarded, 0);
  const countries = [...new Set(addresses.map((a) => a.countryCode))];

  return (
    <AdminShell title="Virtual Addresses" subtitle="Manage customer virtual addresses and package forwarding">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Addresses</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">{addresses.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Countries Active</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">{countries.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Packages Received</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">{totalPackages}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Packages Forwarded</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{totalForwarded}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by unit ID or city..."
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/20"
          />
        </div>
        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none"
        >
          <option value="all">All Countries</option>
          {Object.entries(HUB_NAMES).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
        <button onClick={loadData} className="h-9 px-3 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-1.5">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-gray-400" size={24} />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Unit ID</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Country</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">City</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Received</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Forwarded</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-gray-400">
                    {addresses.length === 0 ? "No virtual addresses assigned yet" : "No results found"}
                  </td>
                </tr>
              ) : (
                filtered.map((addr) => (
                  <tr key={addr.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <span className="text-sm font-mono font-semibold text-[#0A1628]">{addr.unitIdentifier}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span>{FLAGS[addr.countryCode] || "\ud83c\uddf3"}</span>
                        <span className="text-sm">{addr.countryCode}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{addr.city}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${addr.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {addr.isActive ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {addr.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3 text-sm font-medium text-[#0A1628]">{addr.packagesReceived}</td>
                    <td className="p-3 text-sm font-medium text-green-600">{addr.packagesForwarded}</td>
                    <td className="p-3 text-sm text-gray-400">{new Date(addr.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
