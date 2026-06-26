"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Check, Shield, Truck, Clock, Info, ArrowRight } from "lucide-react";
import { PACKAGING_OPTIONS, PackagingOption, PackagingSize, suggestPackaging } from "@/lib/logistics/packaging-options";

interface Selection {
  type: string;
  size: string;
  qty: number;
}

export default function PackagingSelectorPage() {
  const [selection, setSelection] = useState<Selection>({ type: "", size: "", qty: 1 });
  const [showInfo, setShowInfo] = useState<string | null>(null);

  const selectedOption = PACKAGING_OPTIONS.find((p) => p.type === selection.type);
  const totalFee = 0; // Will be calculated from API based on country

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/express/book" className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Choose Your Packaging</h1>
            <p className="text-sm text-gray-500">Select the best protection for your shipment</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
            Pickup
          </div>
          <div className="h-px w-12 bg-gray-300" />
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
            Drop-off
          </div>
          <div className="h-px w-12 bg-gray-300" />
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
            Package
          </div>
          <div className="h-px w-12 bg-gray-300" />
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-6 h-6 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xs">4</span>
            Payment
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Who chooses packaging?</p>
            <p className="text-sm text-amber-700 mt-1">
              <strong>Express senders</strong> (Kauvex Express, same-day, intercity, international): YOU choose your packaging here.
              <br />
              <strong>Marketplace orders</strong>: Packaging is automatically selected by the seller or warehouse — no choice needed.
            </p>
          </div>
        </div>

        {/* Packaging Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PACKAGING_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => setSelection({ ...selection, type: option.type, size: option.sizes[0]?.code || "" })}
              className={`text-left rounded-xl border-2 p-5 transition-all relative ${
                selection.type === option.type
                  ? "border-blue-600 bg-blue-50 shadow-md"
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
                <div className="absolute top-3 left-3 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          ))}
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
              <h3 className="font-medium text-gray-900 mb-3">Choose Size</h3>
              <div className="flex gap-3">
                {selectedOption.sizes.map((size) => (
                  <button
                    key={size.code}
                    onClick={() => setSelection({ ...selection, size: size.code })}
                    className={`px-4 py-3 rounded-lg border-2 text-sm transition-all ${
                      selection.size === size.code
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-medium">{size.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{size.dimensions}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelection({ ...selection, qty: Math.max(1, selection.qty - 1) })}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-lg font-medium w-12 text-center">{selection.qty}</span>
                <button
                  onClick={() => setSelection({ ...selection, qty: selection.qty + 1 })}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Protection Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">What&apos;s Included</h3>
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

            {/* Price */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500">Packaging Fee</p>
                <p className="text-2xl font-bold text-gray-900">Calculated at checkout</p>
                <p className="text-xs text-gray-400">Based on your country and delivery destination</p>
              </div>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                Continue to Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Shield, label: "Protective Materials", desc: "All packaging includes inner protection" },
            { icon: Truck, label: "Carrier Approved", desc: "Meets all carrier packaging requirements" },
            { icon: Clock, label: "Quick Selection", desc: "Under 30 seconds to choose" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
              <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
