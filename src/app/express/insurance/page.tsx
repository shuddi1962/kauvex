"use client";

import { useState } from "react";
import {
  Shield,
  Check,
  ArrowRight,
  FileText,
  Clock,
  AlertCircle,
  Upload,
} from "lucide-react";

const TIERS = [
  {
    name: "Basic Cover",
    rate: "0.5%",
    rateLabel: "of item value",
    features: [
      "Loss in transit",
      "Theft coverage",
      "Up to ₦100,000 value",
      "Standard claims (10 business days)",
    ],
    featured: false,
  },
  {
    name: "Comprehensive",
    rate: "1.2%",
    rateLabel: "of item value",
    features: [
      "Loss + damage coverage",
      "Theft + natural events",
      "Up to ₦5,000,000 value",
      "Express claims (5 business days)",
      "Door-to-door protection",
    ],
    featured: true,
    badge: "Recommended",
  },
  {
    name: "High-Value",
    rate: "2.0%",
    rateLabel: "of item value",
    features: [
      "Full all-risk coverage",
      "Luxury / electronics specialist",
      "No upper value limit",
      "Priority claims (48 hours)",
      "Dedicated claims agent",
    ],
    featured: false,
  },
];

const CLAIM_TYPES = [
  "Lost package",
  "Damaged goods",
  "Theft",
  "Wrong item delivered",
  "Partial damage",
];

export default function InsurancePage() {
  const [selectedTier, setSelectedTier] = useState<string>("Comprehensive");
  const [claimForm, setClaimForm] = useState({
    tracking: "",
    type: "",
    description: "",
  });
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimSubmitted(true);
    setTimeout(() => setClaimSubmitted(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2744] rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-8 h-8 text-[#FF6B00]" />
          <h1 className="text-2xl font-bold">Shipment Insurance</h1>
        </div>
        <p className="text-white/60 max-w-xl">
          Protect every shipment with comprehensive coverage — claims paid within 5 business days.
        </p>
      </div>

      {/* Tier Cards */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Choose Your Coverage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative border-2 rounded-xl p-6 transition-all cursor-pointer ${
                selectedTier === tier.name
                  ? "border-[#FF6B00] shadow-lg"
                  : tier.featured
                  ? "border-[#0A1628]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedTier(tier.name)}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0A1628] text-white text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  {tier.badge}
                </div>
              )}
              <h3 className="font-semibold text-[#0A1628]">{tier.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-[#0A1628]">{tier.rate}</span>
                <span className="text-sm text-gray-500 ml-1">{tier.rateLabel}</span>
              </div>
              <ul className="space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full mt-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  selectedTier === tier.name
                    ? "bg-[#FF6B00] text-white"
                    : tier.featured
                    ? "bg-[#0A1628] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {selectedTier === tier.name ? "Selected" : "Select"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">How Claims Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "1", title: "File Claim", desc: "Submit online with tracking number and photos", icon: FileText },
            { step: "2", title: "Review", desc: "Our team reviews within 24 hours", icon: Clock },
            { step: "3", title: "Approval", desc: "Approved claims paid within 5 business days", icon: Check },
            { step: "4", title: "Payout", desc: "Direct bank transfer or wallet credit", icon: ArrowRight },
          ].map((s) => (
            <div key={s.step} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <div className="w-10 h-10 bg-[#FF6B00]/10 text-[#FF6B00] rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-sm">
                {s.step}
              </div>
              <h3 className="font-semibold text-sm text-[#0A1628]">{s.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* File a Claim */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">File a Claim</h2>
        {claimSubmitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <Check className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800">Claim Submitted</h3>
            <p className="text-sm text-green-600 mt-1">
              We&apos;ll review your claim and respond within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitClaim} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={claimForm.tracking}
                  onChange={(e) => setClaimForm({ ...claimForm, tracking: e.target.value })}
                  placeholder="KVX-XXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Claim Type</label>
                <select
                  value={claimForm.type}
                  onChange={(e) => setClaimForm({ ...claimForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                >
                  <option value="">Select type...</option>
                  {CLAIM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={claimForm.description}
                onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                placeholder="Provide as much detail as possible, including when you noticed the issue..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Evidence</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#FF6B00] transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Drop photos or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
              </div>
            </div>
            <button
              type="submit"
              className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              Submit Claim
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
