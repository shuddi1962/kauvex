"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Package, Check, Shield, Truck, Clock, Info, ArrowRight,
  Box, Ruler, Weight, DollarSign, AlertTriangle, Sparkles,
} from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";
import { PACKAGING_OPTIONS, PackagingOption, PackagingSize, suggestPackaging } from "@/lib/logistics/packaging-options";

interface Selection {
  type: string;
  size: string;
  qty: number;
}

const PACKAGING_PRICES: Record<string, Record<string, number>> = {
  standard_box: { s: 350, m: 450, l: 850 },
  poly_mailer: { s: 80, m: 120, l: 180 },
  bubble_mailer: { s: 150, m: 220, l: 320 },
  tube: { s: 300, m: 450, l: 600 },
  fragile_pack: { m: 800 },
  gift_box: { s: 500, m: 700, l: 1000 },
  heavy_duty: { l: 1200, xl: 1500, xxl: 2000 },
  insulated: { s: 500, m: 800 },
};

const PACKAGING_VISUALS: Record<string, { emoji: string; color: string; bgColor: string }> = {
  standard_box: { emoji: "📦", color: "text-blue-600", bgColor: "bg-blue-50" },
  poly_mailer: { emoji: "🛍️", color: "text-green-600", bgColor: "bg-green-50" },
  bubble_mailer: { emoji: "💌", color: "text-purple-600", bgColor: "bg-purple-50" },
  tube: { emoji: "🗞️", color: "text-amber-600", bgColor: "bg-amber-50" },
  fragile_pack: { emoji: "🔮", color: "text-red-600", bgColor: "bg-red-50" },
  gift_box: { emoji: "🎁", color: "text-pink-600", bgColor: "bg-pink-50" },
  heavy_duty: { emoji: "🏋️", color: "text-gray-700", bgColor: "bg-gray-100" },
  insulated: { emoji: "❄️", color: "text-cyan-600", bgColor: "bg-cyan-50" },
};

function getPrice(type: string, size: string): number {
  return PACKAGING_PRICES[type]?.[size] ?? 0;
}

export default function VendorPackagingSelectorPage() {
  const [selection, setSelection] = useState<Selection>({ type: "", size: "", qty: 1 });
  const [showInfo, setShowInfo] = useState<string | null>(null);
  const [itemWeight, setItemWeight] = useState<number>(0);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const selectedOption = PACKAGING_OPTIONS.find((p) => p.type === selection.type);
  const selectedSize = selectedOption?.sizes.find((s) => s.code === selection.size);
  const unitPrice = getPrice(selection.type, selection.size);
  const totalPrice = unitPrice * selection.qty;

  const suggestion = itemWeight > 0 ? suggestPackaging(itemWeight) : null;

  const handleApplySuggestion = () => {
    if (suggestion) {
      setSelection({ type: suggestion.type, size: suggestion.size, qty: 1 });
      setShowSuggestion(false);
    }
  };

  return (
    <VendorShell title="Packaging Selector" subtitle="Choose the right packaging for your FBM orders">
      <div className="max-w-5xl">
        {/* Back Link */}
        <Link
          href="/vendor/logistics/packaging-guide"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Packaging Guide
        </Link>

        {/* Smart Suggestor */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Smart Packaging Suggestor</h3>
              <p className="text-xs text-gray-500 mb-3">
                Enter your item weight and we will recommend the best packaging option.
              </p>
              <div className="flex items-end gap-3">
                <div className="flex-1 max-w-[200px]">
                  <label className="text-[10px] text-gray-400 mb-1 block">Item Weight (kg)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={itemWeight || ""}
                    onChange={(e) => setItemWeight(Number(e.target.value))}
                    placeholder="e.g. 2.5"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-purple-400"
                  />
                </div>
                <button
                  onClick={() => setShowSuggestion(true)}
                  disabled={!itemWeight}
                  className="h-9 px-4 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Suggest
                </button>
              </div>
              {showSuggestion && suggestion && (
                <div className="mt-3 bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Recommended: {PACKAGING_OPTIONS.find((p) => p.type === suggestion.type)?.name} ({suggestion.size.toUpperCase()})
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{suggestion.reason}</p>
                    </div>
                    <button
                      onClick={handleApplySuggestion}
                      className="h-8 px-3 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">FBM Vendor Packaging</p>
            <p className="text-sm text-amber-700 mt-1">
              As a <strong>merchant-fulfilled vendor</strong>, you pack and ship orders yourself.
              Choose packaging that protects your products and reflects your brand quality.
              For <strong>FBK orders</strong>, Kauvex handles packaging at the warehouse.
            </p>
          </div>
        </div>

        {/* Packaging Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PACKAGING_OPTIONS.map((option) => {
            const visual = PACKAGING_VISUALS[option.type];
            return (
              <button
                key={option.type}
                onClick={() => setSelection({ ...selection, type: option.type, size: option.sizes[0]?.code || "" })}
                className={`text-left rounded-xl border-2 p-5 transition-all relative ${
                  selection.type === option.type
                    ? "border-purple-600 bg-purple-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                {option.badge && (
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium ${
                    option.badge === "Most Popular" ? "bg-blue-100 text-blue-700" :
                    option.badge === "Cheapest Option" ? "bg-green-100 text-green-700" :
                    "bg-purple-100 text-purple-700"
                  }`}>
                    {option.badge}
                  </span>
                )}
                <div className="text-4xl mb-3">{option.icon}</div>
                <h3 className="font-semibold text-gray-900 text-lg">{option.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                <div className="mt-3 text-xs text-gray-600">
                  <p className="font-medium mb-1">Best for:</p>
                  <div className="flex flex-wrap gap-1">
                    {option.bestFor.slice(0, 3).map((item) => (
                      <span key={item} className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{item}</span>
                    ))}
                    {option.bestFor.length > 3 && <span className="text-gray-400">+{option.bestFor.length - 3}</span>}
                  </div>
                </div>
                {selection.type === option.type && (
                  <div className="absolute top-3 left-3 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Option Details */}
        {selectedOption && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="text-5xl">{selectedOption.icon}</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{selectedOption.name}</h2>
                <p className="text-gray-500 mt-1">{selectedOption.description}</p>
                {selectedOption.note && (
                  <p className="text-sm text-amber-600 mt-2 bg-amber-50 rounded-lg px-3 py-1.5 inline-block">{selectedOption.note}</p>
                )}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Ruler size={16} className="text-gray-400" />
                Choose Size
              </h3>
              <div className="flex gap-3 flex-wrap">
                {selectedOption.sizes.map((size) => {
                  const price = getPrice(selection.type, size.code);
                  return (
                    <button
                      key={size.code}
                      onClick={() => setSelection({ ...selection, size: size.code })}
                      className={`px-4 py-3 rounded-lg border-2 text-sm transition-all min-w-[120px] ${
                        selection.size === size.code
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-medium">{size.label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{size.dimensions}</p>
                      {price > 0 && (
                        <p className="text-purple-600 font-semibold text-xs mt-1">₦{price.toLocaleString()}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Package size={16} className="text-gray-400" />
                Quantity
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelection({ ...selection, qty: Math.max(1, selection.qty - 1) })}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-lg font-medium"
                >
                  -
                </button>
                <span className="text-lg font-medium w-12 text-center">{selection.qty}</span>
                <button
                  onClick={() => setSelection({ ...selection, qty: selection.qty + 1 })}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-lg font-medium"
                >
                  +
                </button>
                <span className="text-sm text-gray-400 ml-2">
                  (₦{unitPrice.toLocaleString()} each)
                </span>
              </div>
            </div>

            {/* Protection Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Shield size={16} className="text-gray-400" />
                What&apos;s Included
              </h3>
              <p className="text-sm text-gray-600">{selectedOption.innerProtection}</p>
            </div>

            {/* Full Best For */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Ideal For</h3>
              <div className="flex flex-wrap gap-2">
                {selectedOption.bestFor.map((item) => (
                  <span key={item} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">{item}</span>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Packaging Cost</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-gray-900">₦{totalPrice.toLocaleString()}</p>
                    {selection.qty > 1 && (
                      <p className="text-sm text-gray-400">
                        {selection.qty} × ₦{unitPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Added to your shipping cost per order</p>
                </div>
                <Link
                  href="/vendor/logistics/shipments"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center gap-2"
                >
                  Start Shipping <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Reference Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign size={16} className="text-purple-600" />
              Quick Price Reference
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-3 text-left text-[10px] font-semibold text-gray-400 uppercase">Packaging</th>
                  <th className="p-3 text-left text-[10px] font-semibold text-gray-400 uppercase">Size</th>
                  <th className="p-3 text-left text-[10px] font-semibold text-gray-400 uppercase">Dimensions</th>
                  <th className="p-3 text-left text-[10px] font-semibold text-gray-400 uppercase">Max Weight</th>
                  <th className="p-3 text-left text-[10px] font-semibold text-gray-400 uppercase">Unit Cost</th>
                </tr>
              </thead>
              <tbody>
                {PACKAGING_OPTIONS.map((option) =>
                  option.sizes.map((size, idx) => {
                    const price = getPrice(option.type, size.code);
                    const visual = PACKAGING_VISUALS[option.type];
                    return (
                      <tr key={`${option.type}-${size.code}`} className="border-b border-gray-100 hover:bg-gray-50/50">
                        {idx === 0 && (
                          <td className="p-3" rowSpan={option.sizes.length}>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{option.icon}</span>
                              <span className="font-medium text-gray-900">{option.name}</span>
                            </div>
                          </td>
                        )}
                        <td className="p-3 text-gray-700">{size.label}</td>
                        <td className="p-3 text-gray-500 text-xs">{size.dimensions}</td>
                        <td className="p-3 text-gray-500 text-xs">
                          {option.type === "heavy_duty" ? "50kg" : option.type === "insulated" ? "5kg" : "—"}
                        </td>
                        <td className="p-3 font-semibold text-gray-900">
                          {price > 0 ? `₦${price.toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Shield, label: "Protective Materials", desc: "All packaging includes inner protection" },
            { icon: Truck, label: "Carrier Approved", desc: "Meets all carrier packaging requirements" },
            { icon: Clock, label: "Quick Selection", desc: "Under 30 seconds to choose" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
              <Icon className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </VendorShell>
  );
}
