"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight, Loader2, AlertCircle, Shield,
  CheckCircle, ArrowRight, DollarSign, Building2,
  Users, FileText, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const assetTypes = [
  "Construction Equipment",
  "Marine Equipment",
  "Industrial Machinery",
  "Agricultural Machinery",
  "ICT Equipment",
  "Power & Energy Equipment",
  "Transportation Equipment",
  "Real Estate / Facility",
];

interface InsuranceQuote {
  id: string;
  insurer: string;
  logo: string;
  coverageType: string;
  annualPremium: number;
  coverageAmount: number;
  deductible: number;
  keyFeatures: string[];
  rating: number;
}

const sampleQuotes: InsuranceQuote[] = [
  {
    id: "1", insurer: "Kauvex Insurance", coverageType: "Comprehensive Equipment",
    annualPremium: 2450, coverageAmount: 100000, deductible: 500,
    keyFeatures: ["All-risk coverage", "Worldwide protection", "No depreciation", "24/7 claims"],
    rating: 4.8,
  },
  {
    id: "2", insurer: "AXA Mansard", coverageType: "Asset All-Risk",
    annualPremium: 3200, coverageAmount: 100000, deductible: 1000,
    keyFeatures: ["Third-party liability", "Fire & theft", "Natural disaster cover", "Claims within 48hrs"],
    rating: 4.5,
  },
  {
    id: "3", insurer: "Leadway Assurance", coverageType: "Industrial Equipment",
    annualPremium: 2800, coverageAmount: 100000, deductible: 750,
    keyFeatures: ["Mechanical breakdown", "Electrical damage", "Accidental damage", "Emergency repair cover"],
    rating: 4.3,
  },
  {
    id: "4", insurer: "NEM Insurance", coverageType: "Plant & Machinery",
    annualPremium: 2150, coverageAmount: 100000, deductible: 250,
    keyFeatures: ["Earned premium refund", "Automatic indexation", "Loss of use cover", "Survey included"],
    rating: 4.1,
  },
  {
    id: "5", insurer: "Custodian Insurance", coverageType: "Comprehensive Asset",
    annualPremium: 3600, coverageAmount: 100000, deductible: 1200,
    keyFeatures: ["Full replacement cost", "Business interruption", "Worldwide cover", "Dedicated account mgr"],
    rating: 4.6,
  },
];

export default function InsurancePage() {
  const [quotes, setQuotes] = useState<InsuranceQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assetType, setAssetType] = useState("Construction Equipment");
  const [assetValue, setAssetValue] = useState("100000");

  useEffect(() => {
    fetch(`/api/v1/kpn/insurance?type=${assetType}&value=${assetValue}`)
      .then((r) => { if (!r.ok) throw new Error("Failed to load quotes"); return r.json(); })
      .then((d) => setQuotes(Array.isArray(d) ? d : d.data || sampleQuotes))
      .catch(() => setQuotes(sampleQuotes))
      .finally(() => setLoading(false));
  }, [assetType, assetValue]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Insurance</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
            <Shield size={28} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1628]">Asset Insurance Marketplace</h1>
            <p className="text-gray-500 mt-1">Compare and buy insurance for your industrial equipment and assets</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="font-bold text-[#0A1628] mb-4">Get a Quote</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Asset Type</label>
              <select
                value={assetType}
                onChange={(e) => { setAssetType(e.target.value); setLoading(true); }}
                className="w-full h-11 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
              >
                {assetTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Asset Value ($)</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={assetValue}
                  onChange={(e) => { setAssetValue(e.target.value); setLoading(true); }}
                  className="w-full h-11 pl-8 pr-3 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-[#FF6B00]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Shield size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0A1628] mb-2">No Quotes Available</h3>
            <p className="text-sm text-gray-500">Try a different asset type or value.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">
              Showing {quotes.length} quotes for <strong>{assetType}</strong> valued at <strong>${Number(assetValue).toLocaleString()}</strong>
            </p>
            {quotes.map((q) => (
              <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Shield size={22} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[#0A1628]">{q.insurer}</h3>
                        <Badge variant="info">{q.coverageType}</Badge>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{q.rating}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mt-2">
                      <span className="text-2xl font-bold text-[#FF6B00]">${q.annualPremium.toLocaleString()}<span className="text-sm font-normal text-gray-400">/yr</span></span>
                      <span className="text-gray-500">Coverage: <strong>${q.coverageAmount.toLocaleString()}</strong></span>
                      <span className="text-gray-500">Deductible: <strong>${q.deductible.toLocaleString()}</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {q.keyFeatures.map((f) => (
                        <span key={f} className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                          <CheckCircle size={10} className="text-green-500" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Button>
                      Buy Now <ArrowRight size={14} className="ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
