"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Globe, FileText, AlertTriangle, CheckCircle, Info, Package } from "lucide-react";

const DDP_COUNTRIES = [
  { code: "NG", name: "Nigeria", required: false, note: "DDU default — buyer pays duties on arrival" },
  { code: "GB", name: "United Kingdom", required: false, note: "DDU default — buyer pays VAT + duties on arrival" },
  { code: "US", name: "United States", required: false, note: "DDU default — buyer pays duties on arrival" },
  { code: "AE", name: "UAE", required: false, note: "DDU default — buyer pays 5% VAT on arrival" },
  { code: "IN", name: "India", required: true, note: "DDP required — all duties prepaid" },
  { code: "AU", name: "Australia", required: false, note: "DDU default — GST collected on arrival" },
  { code: "DE", name: "Germany", required: true, note: "DDP required — EU regulations mandate prepaid duties" },
  { code: "CA", name: "Canada", required: false, note: "DDU default — GST/HST on arrival" },
  { code: "GH", name: "Ghana", required: false, note: "DDU default — buyer pays duties" },
  { code: "KE", name: "Kenya", required: false, note: "DDU default — buyer pays duties" },
  { code: "ZA", name: "South Africa", required: false, note: "DDU default — buyer pays duties" },
  { code: "SA", name: "Saudi Arabia", required: true, note: "DDP required — ZATCA regulations" },
  { code: "BR", name: "Brazil", required: false, note: "DDU default — complex import duties" },
  { code: "JP", name: "Japan", required: false, note: "DDU default — customs duties on arrival" },
  { code: "FR", name: "France", required: true, note: "DDP required — EU regulations" },
];

export default function DDPPage() {
  const [selectedCountry, setSelectedCountry] = useState("DE");
  const selected = DDP_COUNTRIES.find((c) => c.code === selectedCountry);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/logistics" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" /> DDP Compliance
          </h1>
          <p className="text-sm text-gray-500">Delivered Duty Paid — prepay import duties for smoother delivery</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800">DDP vs DDU</p>
          <p className="text-sm text-amber-700 mt-1">
            <strong>DDP (Delivered Duty Paid)</strong>: Seller/platform pre-pays all import duties and taxes. Buyer pays nothing at customs.
            <br />
            <strong>DDU (Delivered Duty Unpaid)</strong>: Buyer pays import duties and taxes upon delivery or at customs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "DDP Required", value: DDP_COUNTRIES.filter((c) => c.required).length, color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
          { label: "DDU Default", value: DDP_COUNTRIES.filter((c) => !c.required).length, color: "text-amber-600 bg-amber-50", icon: AlertTriangle },
          { label: "Total Countries", value: DDP_COUNTRIES.length, color: "text-blue-600 bg-blue-50", icon: Globe },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Country DDP Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DDP_COUNTRIES.map((country) => (
            <div
              key={country.code}
              onClick={() => setSelectedCountry(country.code)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedCountry === country.code
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{country.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  country.required ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {country.required ? "DDP Required" : "DDU Default"}
                </span>
              </div>
              <p className="text-xs text-gray-500">{country.note}</p>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" /> {selected.name} DDP Details
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DDP Mode</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>{selected.required ? "Always DDP" : "Optional DDP"}</option>
                <option>{selected.required ? "Always DDP" : "DDU Default"}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duty Markup (%)</label>
              <input type="number" defaultValue={15} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Auto-charge duties to seller</p>
              <p className="text-xs text-gray-500">If DDP enabled, charge seller the duty amount</p>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative">
              <span className="absolute top-0.5 left-6 w-5 h-5 bg-white rounded-full shadow" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Show DDP option at checkout</p>
              <p className="text-xs text-gray-500">Let buyer choose DDP (prepaid) vs DDU (pay on delivery)</p>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative">
              <span className="absolute top-0.5 left-6 w-5 h-5 bg-white rounded-full shadow" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
