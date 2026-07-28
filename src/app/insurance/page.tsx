"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight, Loader2, Shield, CheckCircle,
  ArrowRight, DollarSign, Star, FileText,
  Phone, Mail, Send, Filter, Building2,
  Heart, Waves, Factory, Users, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CoverageCategory = "all" | "asset" | "liability" | "marine" | "construction" | "health";

interface Insurer {
  id: string;
  name: string;
  logo: string;
  coverageTypes: string[];
  premiumRange: string;
  premiumLow: number;
  premiumHigh: number;
  claimRatio: string;
  rating: number;
  reviewCount: number;
  category: CoverageCategory[];
  features: string[];
  aMBestRating: string;
}

const insurers: Insurer[] = [
  {
    id: "leadway", name: "Leadway Assurance", logo: "LW",
    coverageTypes: ["Asset All-Risk", "Marine Cargo", "Construction All-Risk", "Motor", "Health"],
    premiumRange: "₦50K - ₦5M",
    premiumLow: 50000, premiumHigh: 5000000,
    claimRatio: "78%", rating: 4.7, reviewCount: 12530,
    category: ["asset", "marine", "construction", "health"],
    features: ["98% claim settlement", "Nationwide branches", "24/7 claims line", "Digital policy management"],
    aMBestRating: "A-"
  },
  {
    id: "aiico", name: "AIICO Insurance", logo: "AI",
    coverageTypes: ["Asset All-Risk", "Marine & Aviation", "Liability", "Group Life", "Health"],
    premiumRange: "₦35K - ₦4.2M",
    premiumLow: 35000, premiumHigh: 4200000,
    claimRatio: "82%", rating: 4.5, reviewCount: 9870,
    category: ["asset", "marine", "liability", "health"],
    features: ["65+ years experience", "Investment-linked plans", "Multi-line discounts", "Online claims portal"],
    aMBestRating: "A"
  },
  {
    id: "axa", name: "AXA Mansard", logo: "AX",
    coverageTypes: ["Asset All-Risk", "Public Liability", "Marine Cargo", "Engineering", "Health"],
    premiumRange: "₦40K - ₦6M",
    premiumLow: 40000, premiumHigh: 6000000,
    claimRatio: "75%", rating: 4.8, reviewCount: 15340,
    category: ["asset", "liability", "marine", "construction", "health"],
    features: ["Global AXA network", "Digital self-service", "Fast-track claims under ₦500K", "Wellness program"],
    aMBestRating: "A+"
  },
  {
    id: "custodian", name: "Custodian Insurance", logo: "CI",
    coverageTypes: ["Asset All-Risk", "Marine Cargo", "Contractors All-Risk", "Liability", "Health"],
    premiumRange: "₦45K - ₦3.8M",
    premiumLow: 45000, premiumHigh: 3800000,
    claimRatio: "80%", rating: 4.4, reviewCount: 7650,
    category: ["asset", "marine", "construction", "liability", "health"],
    features: ["Full replacement cost", "Business interruption", "Dedicated account manager", "Risk assessment included"],
    aMBestRating: "A-"
  },
  {
    id: "nem", name: "NEM Insurance", logo: "NM",
    coverageTypes: ["Asset All-Risk", "Marine Cargo", "Burglary", "Fire & Special Perils", "Health"],
    premiumRange: "₦30K - ₦3.5M",
    premiumLow: 30000, premiumHigh: 3500000,
    claimRatio: "83%", rating: 4.3, reviewCount: 6540,
    category: ["asset", "marine", "health"],
    features: ["Earned premium refund", "Automatic indexation", "Survey included", "Loss of use cover"],
    aMBestRating: "B++"
  },
  {
    id: "allianz", name: "Allianz Nigeria", logo: "AZ",
    coverageTypes: ["Asset All-Risk", "Liability", "Marine Hull", "Engineering", "Cyber Risk"],
    premiumRange: "₦60K - ₦10M",
    premiumLow: 60000, premiumHigh: 10000000,
    claimRatio: "72%", rating: 4.6, reviewCount: 4820,
    category: ["asset", "liability", "marine", "construction"],
    features: ["Global Allianz network", "Cyber insurance specialist", "Risk engineering", "Multi-year discounts"],
    aMBestRating: "A+"
  },
  {
    id: "nsia", name: "NSIA Insurance", logo: "NS",
    coverageTypes: ["Asset All-Risk", "Marine Cargo", "Construction", "Motor", "Health"],
    premiumRange: "₦25K - ₦2.8M",
    premiumLow: 25000, premiumHigh: 2800000,
    claimRatio: "85%", rating: 4.2, reviewCount: 4390,
    category: ["asset", "marine", "construction", "health"],
    features: ["Affordable premiums", "Fast claims processing", "Branch network", "Flexible payment plans"],
    aMBestRating: "B+"
  },
];

const categoryLabels: Record<CoverageCategory, string> = {
  "all": "All Categories",
  "asset": "Asset Insurance",
  "liability": "Liability",
  "marine": "Marine",
  "construction": "Construction",
  "health": "Health",
};

const categoryIcons: Record<CoverageCategory, typeof Shield> = {
  "all": Shield,
  "asset": Building2,
  "liability": Shield,
  "marine": Waves,
  "construction": Factory,
  "health": Heart,
};

const quoteRequestFields = [
  { id: "fullName", label: "Full Name", type: "text", placeholder: "John Doe" },
  { id: "email", label: "Email Address", type: "email", placeholder: "john@example.com" },
  { id: "phone", label: "Phone Number", type: "tel", placeholder: "+234 800 000 0000" },
  { id: "company", label: "Company Name", type: "text", placeholder: "Your Company Ltd" },
];

export default function InsurancePage() {
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CoverageCategory>("all");
  const [sortBy, setSortBy] = useState<"rating" | "claim-ratio" | "premium-low">("rating");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredInsurers = useMemo(() => {
    let list = insurers.filter((i) => {
      if (category !== "all" && !i.category.includes(category)) return false;
      return true;
    });
    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "claim-ratio") {
      list.sort((a, b) => {
        const ra = parseInt(a.claimRatio);
        const rb = parseInt(b.claimRatio);
        return rb - ra;
      });
    }
    if (sortBy === "premium-low") list.sort((a, b) => a.premiumLow - b.premiumLow);
    return list;
  }, [category, sortBy]);

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSent(true);
    setTimeout(() => {
      setShowQuoteForm(false);
      setQuoteSent(false);
      setFormData({});
    }, 3000);
  };

  const categoryList = Object.entries(categoryLabels).slice(1) as [CoverageCategory, string][];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Insurance Marketplace</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#0A1628] to-[#162040] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-3xl">
            <div className="w-14 h-14 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center mb-4">
              <Shield size={28} className="text-[#FF6B00]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Insurance Marketplace</h1>
            <p className="text-gray-300 text-lg">
              Compare top-rated insurers, find the right coverage for your assets,
              operations, and team. Get quotes from Nigeria&apos;s leading providers.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-md mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#0A1628] flex items-center gap-2">
              <Filter size={16} className="text-[#FF6B00]" /> Filter by Category
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuoteForm(!showQuoteForm)}
            >
              <FileText size={14} className="mr-2" /> Request Quote
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                category === "all" ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {categoryList.map(([key, label]) => {
              const Icon = categoryIcons[key];
              return (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    category === key ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showQuoteForm && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-md">
            <h3 className="font-bold text-[#0A1628] mb-4 flex items-center gap-2">
              <FileText size={16} className="text-[#FF6B00]" /> Request a Quote
            </h3>
            {quoteSent ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle size={32} className="text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-medium">Quote request submitted!</p>
                <p className="text-sm text-green-600 mt-1">Insurers will contact you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {quoteRequestFields.map((field) => (
                    <div key={field.id}>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.id] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        required
                        className="w-full h-11 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Coverage Category</label>
                    <select
                      className="w-full h-11 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
                      value={formData.coverCategory || ""}
                      onChange={(e) => setFormData({ ...formData, coverCategory: e.target.value })}
                      required
                    >
                      <option value="">Select category</option>
                      {categoryList.map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Estimated Asset/Sum Value (₦)</label>
                    <input
                      type="number"
                      placeholder="5,000,000"
                      value={formData.assetValue || ""}
                      onChange={(e) => setFormData({ ...formData, assetValue: e.target.value })}
                      required
                      className="w-full h-11 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Additional Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what you need covered..."
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00] resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowQuoteForm(false)}>Cancel</Button>
                  <Button type="submit">
                    <Send size={14} className="mr-2" /> Submit Request
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0A1628]">
              {category === "all" ? "All Insurers" : categoryLabels[category]}
            </h2>
            <p className="text-sm text-gray-400">
              {filteredInsurers.length} insurer{filteredInsurers.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort:</span>
            {(["rating", "claim-ratio", "premium-low"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sortBy === s ? "bg-[#0A1628] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {s === "rating" ? "Rating" : s === "claim-ratio" ? "Claim Ratio" : "Lowest Premium"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#FF6B00]" />
          </div>
        ) : filteredInsurers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Shield size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0A1628] mb-2">No Insurers Found</h3>
            <p className="text-sm text-gray-500">Try a different category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm bg-white">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Insurer</th>
                  <th className="text-left py-3 px-3 text-gray-600 font-semibold">Coverage Types</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-semibold">Premium Range</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-semibold">Claim Ratio</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-semibold">A.M. Best</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-semibold">Rating</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-semibold">Key Features</th>
                  <th className="text-right py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredInsurers.map((i) => (
                  <tr key={i.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0A1628] text-white flex items-center justify-center text-sm font-bold">
                          {i.logo}
                        </div>
                        <span className="font-semibold text-[#0A1628]">{i.name}</span>
                        {i.rating >= 4.7 && <Badge variant="orange">Top Rated</Badge>}
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {i.coverageTypes.map((ct) => (
                          <span key={ct} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded whitespace-nowrap">
                            {ct}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className="font-medium text-[#0A1628]">{i.premiumRange}</span>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className={`font-medium ${parseInt(i.claimRatio) >= 80 ? "text-green-600" : "text-orange-500"}`}>
                        {i.claimRatio}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className="font-mono font-bold text-[#0A1628]">{i.aMBestRating}</span>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{i.rating}</span>
                        <span className="text-gray-400 text-[10px]">({i.reviewCount.toLocaleString()})</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {i.features.slice(0, 3).map((f) => (
                          <span key={f} className="inline-flex items-center gap-0.5 text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                            <CheckCircle size={8} className="text-green-500" /> {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button size="sm">
                        Get Quote <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Shield size={22} className="text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#0A1628]">78%+</p>
                <p className="text-xs text-gray-500">Average claim settlement ratio</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Activity size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#0A1628]">24/7</p>
                <p className="text-xs text-gray-500">Claims support available</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                <Users size={22} className="text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#0A1628]">7+</p>
                <p className="text-xs text-gray-500">NAICOM licensed insurers</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
