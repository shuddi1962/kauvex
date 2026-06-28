"use client";

import { useState } from "react";
import {
  Home, Package, Copy, Check, Plus, RefreshCw,
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
  createdAt: string;
}

const DEMO_ADDRESSES: VirtualAddress[] = [
  {
    id: "1",
    countryCode: "GB",
    city: "London",
    streetAddress: "123 Commerce Way",
    unitIdentifier: "KVX-A7F2C1",
    isActive: true,
    packagesReceived: 12,
    packagesForwarded: 9,
    fullAddress: "KVX-A7F2C1\nKauvex UK Hub\n123 Commerce Way\nLondon, E1 8AN\nUnited Kingdom",
  },
  {
    id: "2",
    countryCode: "US",
    city: "Newark",
    streetAddress: "222 Market Street",
    unitIdentifier: "KVX-B3D9E4",
    isActive: true,
    packagesReceived: 8,
    packagesForwarded: 6,
    fullAddress: "KVX-B3D9E4\nKauvex US Hub\n222 Market Street\nNewark, NJ 07102\nUnited States",
  },
  {
    id: "3",
    countryCode: "CN",
    city: "Shenzhen",
    streetAddress: "88 Kauvex Park, Longhua District",
    unitIdentifier: "KVX-C1E5F8",
    isActive: true,
    packagesReceived: 23,
    packagesForwarded: 18,
    fullAddress: "KVX-C1E5F8\nKauvex Shenzhen Hub\n88 Kauvex Park, Longhua District\nShenzhen, 518000\nChina",
  },
];

const DEMO_PACKAGES: PackageItem[] = [
  {
    id: "p1",
    storeName: "ASOS",
    trackingNumber: "RN123456789GB",
    description: "Summer dress, Size M — Zara floral midi",
    declaredValue: 45.00,
    currency: "GBP",
    weightKg: 0.4,
    status: "received",
    receivedAt: "2026-06-25T10:30:00Z",
    createdAt: "2026-06-22T14:00:00Z",
  },
  {
    id: "p2",
    storeName: "Amazon US",
    trackingNumber: "TBA123456789012",
    description: "Sony WH-1000XM5 Headphones — Black",
    declaredValue: 298.00,
    currency: "USD",
    weightKg: 0.35,
    status: "received",
    receivedAt: "2026-06-26T09:15:00Z",
    createdAt: "2026-06-20T08:00:00Z",
  },
  {
    id: "p3",
    storeName: "1688.com",
    trackingNumber: "SF1234567890",
    description: "Phone cases (x50), silicone, assorted colors",
    declaredValue: 25.00,
    currency: "CNY",
    weightKg: 2.1,
    status: "received",
    receivedAt: "2026-06-24T16:45:00Z",
    createdAt: "2026-06-18T03:00:00Z",
  },
  {
    id: "p4",
    storeName: "Nike USA",
    trackingNumber: "NKE987654321US",
    description: "Air Max 90 — White/Black, UK Size 9",
    declaredValue: 120.00,
    currency: "USD",
    weightKg: 1.2,
    status: "awaiting_arrival",
    receivedAt: null,
    createdAt: "2026-06-27T12:00:00Z",
  },
  {
    id: "p5",
    storeName: "Amazon UK",
    trackingNumber: "AMZ456789123GB",
    description: "Vitamin D3 supplements (x3), 4000IU",
    declaredValue: 18.50,
    currency: "GBP",
    weightKg: 0.3,
    status: "shipped",
    receivedAt: "2026-06-20T11:00:00Z",
    createdAt: "2026-06-15T09:30:00Z",
  },
  {
    id: "p6",
    storeName: "Shein",
    trackingNumber: "SHEIN789123456",
    description: "Women's handbag — tan leather-look tote",
    declaredValue: 22.00,
    currency: "USD",
    weightKg: 0.6,
    status: "delivered",
    receivedAt: "2026-06-18T14:20:00Z",
    createdAt: "2026-06-10T07:00:00Z",
  },
];

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
  shipped: { label: "On the Way to You", color: "text-purple-600", bg: "bg-purple-50" },
  delivered: { label: "Delivered", color: "text-green-700", bg: "bg-green-100" },
};

export default function VirtualAddressPage() {
  const [addresses] = useState<VirtualAddress[]>(DEMO_ADDRESSES);
  const [packages] = useState<PackageItem[]>(DEMO_PACKAGES);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [activeTab, setActiveTab] = useState<"addresses" | "packages">("addresses");
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);

  const copyAddress = (addr: VirtualAddress) => {
    navigator.clipboard.writeText(addr.fullAddress);
    setCopiedId(addr.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePackage = (id: string) => {
    setSelectedPackages((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const existingCountries = addresses.map((a) => a.countryCode);
  const availableCountries = COUNTRIES.filter((c) => !existingCountries.includes(c.code));

  const pendingCount = packages.filter((p) => ["awaiting_arrival", "received"].includes(p.status)).length;

  return (
    <div className="space-y-6">
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
          <p className="text-xs text-gray-500 uppercase tracking-wide">Forwarded Home</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{addresses.reduce((s, a) => s + a.packagesForwarded, 0)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
          <p className="text-2xl font-bold text-[#FF6B00] mt-1">{pendingCount}</p>
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
          {addresses.map((addr) => {
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
                      <div className="mt-2 bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-600 whitespace-pre-line leading-relaxed">
                        {addr.fullAddress}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span>Received: <strong>{addr.packagesReceived}</strong></span>
                        <span>Forwarded: <strong>{addr.packagesForwarded}</strong></span>
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
          })}
        </div>
      )}

      {activeTab === "packages" && (
        <div className="space-y-4">
          {selectedPackages.length > 0 && (
            <div className="bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-[#0A1628]">{selectedPackages.length} package(s) selected</span>
              <div className="flex gap-2">
                <button className="bg-[#FF6B00] hover:bg-[#e55f00] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                  Consolidate & Ship Home
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
                      <span>Tracking: <span className="font-mono">{pkg.trackingNumber}</span></span>
                      {pkg.weightKg && <span>Weight: {pkg.weightKg} kg</span>}
                      <span>Added: {new Date(pkg.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
                onClick={() => setShowAddModal(false)}
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
