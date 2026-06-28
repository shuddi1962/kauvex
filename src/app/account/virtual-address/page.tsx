"use client";

import { useState, useEffect } from "react";
import {
  Home, Package, Globe, Copy, CheckCircle2, ArrowRight, Plus,
  Box, RefreshCw, Trash2, ExternalLink, AlertCircle, Check,
} from "lucide-react";

interface VirtualAddress {
  id: string;
  countryCode: string;
  city: string;
  streetAddress: string;
  unitIdentifier: string;
  isActive: boolean;
  packagesReceived: number;
  packagesForwarded: number;
  fullAddress: string;
}

interface PackageItem {
  id: string;
  storeName: string;
  trackingNumber: string;
  description: string;
  declaredValue: number;
  currency: string;
  weightKg: number | null;
  status: string;
  receivedAt: string | null;
}

const COUNTRIES = [
  { code: "GB", name: "United Kingdom", flag: "\ud83c\uddec\ud83c\udde7", time: "3\u20135 days" },
  { code: "US", name: "United States", flag: "\ud83c\uddfa\ud83c\uddf8", time: "4\u20137 days" },
  { code: "CN", name: "China", flag: "\ud83c\udde8\ud83c\uddf3", time: "7\u201314 days" },
  { code: "CA", name: "Canada", flag: "\ud83c\udde8\ud83c\udde6", time: "5\u20138 days" },
  { code: "AE", name: "UAE", flag: "\ud83c\udde6\ud83c\uddea", time: "3\u20135 days" },
  { code: "DE", name: "Germany", flag: "\ud83c\udde9\ud83c\uddea", time: "5\u20138 days" },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  awaiting_arrival: { label: "In Transit to Hub", color: "text-blue-600", bg: "bg-blue-50" },
  received: { label: "Received at Hub", color: "text-green-600", bg: "bg-green-50" },
  queued_for_forwarding: { label: "Queued for Forwarding", color: "text-orange-600", bg: "bg-orange-50" },
  shipped: { label: "Shipped to You", color: "text-purple-600", bg: "bg-purple-50" },
  delivered: { label: "Delivered", color: "text-green-700", bg: "bg-green-100" },
};

export default function VirtualAddressPage() {
  const [addresses, setAddresses] = useState<VirtualAddress[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [activeTab, setActiveTab] = useState<"addresses" | "packages">("addresses");
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userId = "current-user";
      const [addrRes, pkgRes] = await Promise.all([
        fetch(`/api/v1/logistics/virtual-addresses?userId=${userId}`),
        fetch(`/api/v1/logistics/virtual-addresses/packages?userId=${userId}`),
      ]);
      const addrData = await addrRes.json();
      const pkgData = await pkgRes.json();
      setAddresses(addrData.addresses || []);
      setPackages(pkgData.packages || []);
    } catch (e) {
      console.error("Failed to load:", e);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = (address: VirtualAddress) => {
    navigator.clipboard.writeText(address.fullAddress);
    setCopiedId(address.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddAddress = async () => {
    if (!selectedCountry) return;
    try {
      const res = await fetch("/api/v1/logistics/virtual-addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "current-user", countryCode: selectedCountry }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setSelectedCountry("");
        loadData();
      }
    } catch (e) {
      console.error("Failed to add address:", e);
    }
  };

  const togglePackage = (id: string) => {
    setSelectedPackages((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const existingCountries = addresses.map((a) => a.countryCode);
  const availableCountries = COUNTRIES.filter((c) => !existingCountries.includes(c.code));

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Virtual Addresses</h1>
          <p className="text-gray-500 text-sm mt-1">Shop from international stores — we ship to your door</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#FF6B00] hover:bg-[#e55f00] text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Get New Address
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Active Addresses</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">{addresses.filter((a) => a.isActive).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Packages Received</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">{addresses.reduce((s, a) => s + a.packagesReceived, 0)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Packages Forwarded</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">{addresses.reduce((s, a) => s + a.packagesForwarded, 0)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pending Packages</p>
          <p className="text-2xl font-bold text-[#FF6B00] mt-1">{packages.filter((p) => ["awaiting_arrival", "received"].includes(p.status)).length}</p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab("addresses")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "addresses" ? "bg-white text-[#0A1628] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          My Addresses
        </button>
        <button
          onClick={() => setActiveTab("packages")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "packages" ? "bg-white text-[#0A1628] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          My Packages ({packages.length})
        </button>
      </div>

      {activeTab === "addresses" && (
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#0A1628] mb-2">No Virtual Addresses Yet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Get a virtual address in UK, USA, China, or Canada. Shop from any store that ships domestically — we forward to your door.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#FF6B00] hover:bg-[#e55f00] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                Get Your First Address
              </button>
            </div>
          ) : (
            addresses.map((addr) => {
              const country = COUNTRIES.find((c) => c.code === addr.countryCode);
              return (
                <div key={addr.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{country?.flag || "\ud83c\uddf3"}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[#0A1628]">{country?.name || addr.countryCode}</h3>
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">ACTIVE</span>
                        </div>
                        <div className="mt-2 bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-600 whitespace-pre-line">
                          {addr.fullAddress}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>Received: {addr.packagesReceived}</span>
                          <span>Forwarded: {addr.packagesForwarded}</span>
                          <span>Transit: {country?.time}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => copyAddress(addr)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {copiedId === addr.id ? (
                        <><Check className="w-3.5 h-3.5 text-green-500" /> Copied</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copy Address</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "packages" && (
        <div className="space-y-4">
          {packages.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#0A1628] mb-2">No Packages Yet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Shop from any online store using your Kauvex virtual address. Packages will appear here when they arrive at our hub.
              </p>
            </div>
          ) : (
            <>
              {selectedPackages.length > 0 && (
                <div className="bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#0A1628]">{selectedPackages.length} package(s) selected</span>
                  <div className="flex gap-2">
                    <button className="bg-[#FF6B00] hover:bg-[#e55f00] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                      Consolidate & Ship
                    </button>
                    <button className="bg-white border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                      Ship Individually
                    </button>
                  </div>
                </div>
              )}
              {packages.map((pkg) => {
                const status = STATUS_MAP[pkg.status] || STATUS_MAP.awaiting_arrival;
                return (
                  <div key={pkg.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedPackages.includes(pkg.id)}
                        onChange={() => togglePackage(pkg.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-[#0A1628]">{pkg.storeName}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-[#0A1628]">{pkg.currency} {pkg.declaredValue.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>Tracking: {pkg.trackingNumber}</span>
                          {pkg.weightKg && <span>Weight: {pkg.weightKg} kg</span>}
                          <span>Added: {new Date(pkg.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl w-[480px] p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#0A1628] mb-4">Get a Virtual Address</h3>
            <p className="text-sm text-gray-500 mb-5">Choose a country to get your personal shipping address.</p>
            <div className="grid grid-cols-2 gap-3">
              {COUNTRIES.map((c) => {
                const hasAddress = existingCountries.includes(c.code);
                return (
                  <button
                    key={c.code}
                    disabled={hasAddress}
                    onClick={() => setSelectedCountry(c.code)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      hasAddress
                        ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                        : selectedCountry === c.code
                        ? "border-[#FF6B00] bg-[#FF6B00]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <p className="text-sm font-semibold text-[#0A1628] mt-2">{c.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.time}</p>
                    {hasAddress && <p className="text-[10px] text-gray-400 mt-1">Already have address</p>}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAddress}
                disabled={!selectedCountry}
                className="flex-1 h-10 rounded-lg bg-[#FF6B00] text-white text-sm font-semibold hover:bg-[#e55f00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Get Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
