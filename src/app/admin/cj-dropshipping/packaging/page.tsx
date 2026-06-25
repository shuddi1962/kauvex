"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Package, Save, Loader2, Globe, DollarSign } from "lucide-react";

interface CategoryConfig {
  category: string;
  option: "A" | "B" | "C" | "D";
  priceThreshold: number;
}

const categoryDefaults: CategoryConfig[] = [
  { category: "Electronics", option: "B", priceThreshold: 20000 },
  { category: "Fashion", option: "C", priceThreshold: 15000 },
  { category: "Accessories", option: "A", priceThreshold: 0 },
  { category: "Home & Garden", option: "A", priceThreshold: 0 },
  { category: "Beauty", option: "C", priceThreshold: 10000 },
  { category: "Sports", option: "A", priceThreshold: 0 },
];

const storefrontOverrides: Record<string, string> = {
  "Kauvex UK": "B",
  "Kauvex Nigeria": "A",
};

const options = [
  { value: "A", label: "Option A - Generic Plain (Free)", desc: "CJ uses plain packaging, no branding" },
  { value: "B", label: "Option B - Kauvex Branded (Paid)", desc: "Full Kauvex branded box + inserts, per-order fee" },
  { value: "C", label: "Option C - Branded Insert Only", desc: "Plain outer box + Kauvex branded A5 insert inside" },
  { value: "D", label: "Option D - Local Repackaging Hub", desc: "Ships to local hub for full Kauvex repackaging (future)" },
];

export default function AdminCjPackagingPage() {
  const [configs, setConfigs] = useState<CategoryConfig[]>(categoryDefaults);
  const [saving, setSaving] = useState(false);

  const updateConfig = (idx: number, field: keyof CategoryConfig, value: any) => {
    setConfigs((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  return (
    <AdminShell title="CJ Dropshipping Packaging" subtitle="Configure how CJ Dropshipping packages are handled">
      <div className="space-y-6 max-w-3xl">
        {/* Category Defaults */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2 mb-4">
            <Package size={16} className="text-orange" /> Category Defaults
          </h3>
          <div className="space-y-3">
            {configs.map((cfg, i) => (
              <div key={cfg.category} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-28">
                  <p className="font-medium text-sm text-[#0A1628]">{cfg.category}</p>
                </div>
                <select value={cfg.option} onChange={(e) => updateConfig(i, "option", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                  {options.map((o) => <option key={o.value} value={o.value}>{o.value} - {o.label.split(" (")[0]}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <DollarSign size={12} className="text-gray-400" />
                  <input type="number" value={cfg.priceThreshold} onChange={(e) => updateConfig(i, "priceThreshold", parseInt(e.target.value) || 0)}
                    className="w-24 border border-gray-300 rounded px-2 py-1.5 text-sm" placeholder="Threshold" />
                  <span className="text-[10px] text-gray-500">₦ threshold</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Storefront Overrides */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2 mb-4">
            <Globe size={16} className="text-orange" /> Storefront Overrides
          </h3>
          <div className="space-y-2">
            {Object.entries(storefrontOverrides).map(([storefront, option]) => (
              <div key={storefront} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm w-40">{storefront}</span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Option {option}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Storefront overrides take priority over category defaults.</p>
        </div>

        {/* Option Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-[#0A1628] mb-3">Packaging Options Reference</h3>
          <div className="space-y-2">
            {options.map((o) => (
              <div key={o.value} className="flex items-start gap-3 p-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  o.value === "A" ? "bg-gray-100 text-gray-600" :
                  o.value === "B" ? "bg-green-100 text-green-700" :
                  o.value === "C" ? "bg-yellow-100 text-yellow-700" : "bg-purple-100 text-purple-700"
                }`}>{o.value}</span>
                <div>
                  <p className="text-sm font-medium text-[#0A1628]">{o.label}</p>
                  <p className="text-xs text-gray-500">{o.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => setSaving(true)} className="bg-[#FF6B00] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 flex items-center gap-2">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Configuration
        </button>
      </div>
    </AdminShell>
  );
}
