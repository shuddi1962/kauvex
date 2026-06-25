"use client";

import { useState } from "react";
import VendorShell from "@/components/vendor/vendor-shell";
import { Package, CheckCircle2, XCircle, Save, Plus, X, Loader2, DollarSign, Settings } from "lucide-react";

interface AddOnConfig {
  key: string;
  label: string;
  price: number;
  enabled: boolean;
}

interface PackagingConfig {
  tier: "A" | "B" | "C";
  customBoxSizes: string[];
  customTape: boolean;
  customTissue: boolean;
  customInserts: boolean;
  whiteLabel: boolean;
  giftPackagingEnabled: boolean;
  addOns: AddOnConfig[];
  specialInstructions: string;
}

const addOnOptions: AddOnConfig[] = [
  { key: "tissue_wrap", label: "Tissue Wrap (₦100/order)", price: 100, enabled: false },
  { key: "ribbon", label: "Ribbon Tie (₦50/order)", price: 50, enabled: false },
  { key: "wax_seal", label: "Wax Seal (₦75/order)", price: 75, enabled: false },
  { key: "handwritten_note", label: "Handwritten Thank You (₦150/order)", price: 150, enabled: false },
  { key: "gift_message", label: "Printed Gift Message (₦100/order)", price: 100, enabled: false },
  { key: "fragrance", label: "Fragrance Strip (₦50/order)", price: 50, enabled: false },
  { key: "sample_product", label: "Product Sample (₦50 handling)", price: 50, enabled: false },
  { key: "gift_box", label: "Gift Box Upgrade (₦500/order)", price: 500, enabled: false },
  { key: "premium_bundle", label: "Full Premium Bundle (₦350/order)", price: 350, enabled: false },
];

const boxSizes = ["PKG-BOX-XS", "PKG-BOX-S", "PKG-BOX-M", "PKG-BOX-L", "PKG-BOX-XL", "PKG-BOX-XXL"];

export default function VendorFbkPackagingPage() {
  const [config, setConfig] = useState<PackagingConfig>({
    tier: "A", customBoxSizes: [], customTape: false, customTissue: false, customInserts: false,
    whiteLabel: false, giftPackagingEnabled: true, addOns: addOnOptions, specialInstructions: "",
  });
  const [saving, setSaving] = useState(false);

  const toggleAddOn = (key: string) => {
    setConfig((prev) => ({
      ...prev,
      addOns: prev.addOns.map((a) => a.key === key ? { ...a, enabled: !a.enabled } : a),
    }));
  };

  const toggleBoxSize = (size: string) => {
    setConfig((prev) => ({
      ...prev,
      customBoxSizes: prev.customBoxSizes.includes(size)
        ? prev.customBoxSizes.filter((s) => s !== size)
        : [...prev.customBoxSizes, size],
    }));
  };

  const tierInfo = {
    A: {
      name: "Tier A - Starter (Default)",
      desc: "Kauvex branded packaging, auto-selected materials. No additional charge.",
      surcharge: 0,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    B: {
      name: "Tier B - Professional (Custom)",
      desc: "Ship your own branding materials to warehouse. +₦150/order surcharge.",
      surcharge: 150,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    C: {
      name: "Tier C - Enterprise (White Label)",
      desc: "Zero Kauvex branding anywhere. Enterprise plan only. +₦300/order surcharge.",
      surcharge: 300,
      color: "bg-green-50 text-green-700 border-green-200",
    },
  };

  const currentTier = tierInfo[config.tier];

  return (
    <VendorShell title="FBK Packaging Configuration" subtitle="Customize how Kauvex packs and ships your orders">
      <div className="space-y-6 max-w-3xl">
        {/* Tier Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2 mb-4">
            <Package size={16} className="text-purple-600" /> Packaging Tier
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(["A", "B", "C"] as const).map((t) => {
              const info = tierInfo[t];
              const active = config.tier === t;
              return (
                <button key={t} onClick={() => setConfig((prev) => ({ ...prev, tier: t }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    active ? `${info.color} border-current` : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <p className="font-bold text-sm">{info.name.split(" - ")[0]}</p>
                  <p className="text-[10px] mt-1 opacity-75">{info.name.split(" - ")[1]}</p>
                  {info.surcharge > 0 && <p className="text-xs font-bold mt-2">+₦{info.surcharge}/order</p>}
                  {active && <CheckCircle2 size={14} className="mt-2" />}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-3">{currentTier.desc}</p>
        </div>

        {/* Custom Box Sizes (Tier B/C) */}
        {config.tier !== "A" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-[#0A1628] mb-3">Custom Box Sizes</h3>
            <p className="text-xs text-gray-500 mb-3">Select the box sizes you have shipped to the warehouse:</p>
            <div className="flex flex-wrap gap-2">
              {boxSizes.map((size) => (
                <button key={size} onClick={() => toggleBoxSize(size)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                    config.customBoxSizes.includes(size)
                      ? "bg-purple-50 border-purple-300 text-purple-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}>
                  {size} {config.customBoxSizes.includes(size) && <CheckCircle2 size={10} className="inline ml-1" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Branding Options (Tier B/C) */}
        {config.tier !== "A" && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-[#0A1628] mb-3">Branding Materials</h3>
            <div className="space-y-3">
              {[
                { key: "customTape" as const, label: "Custom branded tape" },
                { key: "customTissue" as const, label: "Custom branded tissue paper" },
                { key: "customInserts" as const, label: "Custom insert/brand cards" },
              ].map((opt) => (
                <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={config[opt.key]} onChange={() => setConfig((prev) => ({ ...prev, [opt.key]: !prev[opt.key] }))}
                    className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
              {config.tier === "C" && (
                <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-gray-100">
                  <input type="checkbox" checked={config.whiteLabel} onChange={() => setConfig((prev) => ({ ...prev, whiteLabel: !prev.whiteLabel }))}
                    className="rounded border-gray-300" />
                  <span className="text-sm font-medium text-green-700">White Label Mode (No Kauvex branding)</span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Premium Add-Ons */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2 mb-3">
            <DollarSign size={16} className="text-orange" /> Premium Add-Ons
          </h3>
          <div className="space-y-2">
            {config.addOns.map((addon) => (
              <label key={addon.key} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={addon.enabled} onChange={() => toggleAddOn(addon.key)}
                    className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">{addon.label}</span>
                </div>
                {addon.enabled && <CheckCircle2 size={14} className="text-green-600" />}
              </label>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-[#0A1628] mb-3">Special Packing Instructions</h3>
          <textarea value={config.specialInstructions} onChange={(e) => setConfig((prev) => ({ ...prev, specialInstructions: e.target.value }))}
            placeholder="Any special instructions for warehouse staff..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm h-24" />
        </div>

        {/* Save Button */}
        <button onClick={() => setSaving(true)} className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Packaging Configuration
        </button>
      </div>
    </VendorShell>
  );
}
