"use client";

import { useState, useMemo } from "react";
import {
  Search, ArrowUpDown, CheckCircle, Star, Shield, Clock,
  DollarSign, Package, Loader2, ChevronDown, BarChart3,
} from "lucide-react";

const recentRFQs = [
  { id: "RFQ-2026-001", product: "Industrial Grade Steel Sheets (3mm)", quantity: 5000, date: "2026-06-01" },
  { id: "RFQ-2026-002", product: "Smartphone LCD Displays 6.5\"", quantity: 10000, date: "2026-06-03" },
  { id: "RFQ-2026-003", product: "Organic Shea Butter (Refined)", quantity: 20000, date: "2026-05-28" },
  { id: "RFQ-2026-005", product: "Frozen Chicken (Whole)", quantity: 50000, date: "2026-06-05" },
];

interface Quote {
  id: string;
  manufacturerId: string;
  manufacturer: string;
  country: string;
  verified: boolean;
  rating: number;
  unitPrice: number;
  tieredPricing: { minQty: number; maxQty: number | null; price: number }[];
  moq: number;
  leadTimeDays: number;
  sampleCost: number;
  shippingEstimate: number;
}

const quotesData: Record<string, Quote[]> = {
  "RFQ-2026-001": [
    {
      id: "q1", manufacturerId: "m1", manufacturer: "Johannesburg Steel Mills", country: "South Africa", verified: true,
      rating: 4.7, unitPrice: 9.50, moq: 1000, leadTimeDays: 35, sampleCost: 150, shippingEstimate: 4200,
      tieredPricing: [{ minQty: 1, maxQty: 999, price: 11.00 }, { minQty: 1000, maxQty: 4999, price: 9.50 }, { minQty: 5000, maxQty: null, price: 8.20 }],
    },
    {
      id: "q2", manufacturerId: "m2", manufacturer: "Shenzhen Electronics Co", country: "China", verified: true,
      rating: 4.8, unitPrice: 8.80, moq: 2000, leadTimeDays: 45, sampleCost: 80, shippingEstimate: 6500,
      tieredPricing: [{ minQty: 1, maxQty: 1999, price: 10.50 }, { minQty: 2000, maxQty: 4999, price: 8.80 }, { minQty: 5000, maxQty: null, price: 7.50 }],
    },
    {
      id: "q3", manufacturerId: "m3", manufacturer: "Dubai Traders FZE", country: "UAE", verified: true,
      rating: 4.5, unitPrice: 9.20, moq: 500, leadTimeDays: 30, sampleCost: 120, shippingEstimate: 5800,
      tieredPricing: [{ minQty: 1, maxQty: 999, price: 10.00 }, { minQty: 1000, maxQty: 4999, price: 9.20 }, { minQty: 5000, maxQty: null, price: 8.80 }],
    },
    {
      id: "q4", manufacturerId: "m4", manufacturer: "Istanbul Ceramics GmbH", country: "Germany", verified: true,
      rating: 4.9, unitPrice: 10.20, moq: 500, leadTimeDays: 28, sampleCost: 200, shippingEstimate: 7200,
      tieredPricing: [{ minQty: 1, maxQty: 499, price: 12.00 }, { minQty: 500, maxQty: 2999, price: 10.20 }, { minQty: 3000, maxQty: null, price: 9.00 }],
    },
  ],
  "RFQ-2026-002": [
    {
      id: "q5", manufacturerId: "m1", manufacturer: "Shenzhen Electronics Co", country: "China", verified: true,
      rating: 4.8, unitPrice: 12.50, moq: 500, leadTimeDays: 25, sampleCost: 50, shippingEstimate: 8500,
      tieredPricing: [{ minQty: 1, maxQty: 499, price: 15.00 }, { minQty: 500, maxQty: 4999, price: 12.50 }, { minQty: 5000, maxQty: null, price: 10.80 }],
    },
    {
      id: "q6", manufacturerId: "m5", manufacturer: "Tokyo Components Inc", country: "Japan", verified: true,
      rating: 4.9, unitPrice: 14.50, moq: 1000, leadTimeDays: 35, sampleCost: 75, shippingEstimate: 12000,
      tieredPricing: [{ minQty: 1, maxQty: 999, price: 16.00 }, { minQty: 1000, maxQty: 4999, price: 14.50 }, { minQty: 5000, maxQty: null, price: 12.00 }],
    },
    {
      id: "q7", manufacturerId: "m3", manufacturer: "Guangzhou Plastics Ltd", country: "China", verified: false,
      rating: 4.2, unitPrice: 11.00, moq: 2000, leadTimeDays: 40, sampleCost: 40, shippingEstimate: 7800,
      tieredPricing: [{ minQty: 1, maxQty: 1999, price: 13.50 }, { minQty: 2000, maxQty: null, price: 11.00 }],
    },
  ],
};

const countryFlags: Record<string, string> = {
  "China": "🇨🇳", "Japan": "🇯🇵", "South Africa": "🇿🇦", "UAE": "🇦🇪",
  "Germany": "🇩🇪", "India": "🇮🇳", "Nigeria": "🇳🇬", "USA": "🇺🇸",
};

type SortKey = "price" | "leadTime" | "rating";

export default function QuotesPage() {
  const [rfqId, setRfqId] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("price");
  const [loading, setLoading] = useState(false);
  const [acceptingQuote, setAcceptingQuote] = useState<string | null>(null);
  const [acceptedQuote, setAcceptedQuote] = useState<string | null>(null);

  const activeRFQ = recentRFQs.find((r) => r.id === rfqId);
  const quotes = quotesData[rfqId] || [];

  const sortedQuotes = useMemo(() => {
    const sorted = [...quotes];
    if (sortBy === "price") sorted.sort((a, b) => a.unitPrice - b.unitPrice);
    if (sortBy === "leadTime") sorted.sort((a, b) => a.leadTimeDays - b.leadTimeDays);
    if (sortBy === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [quotes, sortBy]);

  const handleAccept = async (quoteId: string) => {
    setAcceptingQuote(quoteId);
    try {
      const res = await fetch(`/api/v1/manufacturers/quotes/${quoteId}/accept`, {
        method: "POST",
      });
      if (res.ok) {
        setAcceptedQuote(quoteId);
      }
    } catch {
      // silent
    } finally {
      setAcceptingQuote(null);
    }
  };

  const maxPrice = Math.max(...sortedQuotes.map((q) => q.unitPrice), 1);
  const maxLead = Math.max(...sortedQuotes.map((q) => q.leadTimeDays), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1628]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Quote Comparison</h1>
          <p className="mt-2 text-gray-300">Compare manufacturer quotes side by side and accept the best offer.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* RFQ Selector */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select RFQ</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={rfqId}
                  onChange={(e) => { setRfqId(e.target.value); setAcceptedQuote(null); }}
                  className="w-full rounded-lg border border-gray-200 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] bg-white"
                >
                  <option value="">Enter RFQ ID or select from recent...</option>
                  {recentRFQs.map((rfq) => (
                    <option key={rfq.id} value={rfq.id}>
                      {rfq.id} — {rfq.product} ({rfq.quantity.toLocaleString()} units)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sort by:</span>
              {(["price", "leadTime", "rating"] as SortKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sortBy === key
                      ? "bg-[#0A1628] text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {key === "price" ? "Price" : key === "leadTime" ? "Lead Time" : "Rating"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!rfqId && (
          <div className="text-center py-16">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-1">Select an RFQ to compare quotes</h3>
            <p className="text-sm text-gray-500">Choose from your recent requests for quote above.</p>
          </div>
        )}

        {rfqId && sortedQuotes.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-1">No quotes yet</h3>
            <p className="text-sm text-gray-500">Manufacturers haven&apos;t responded to this RFQ yet.</p>
          </div>
        )}

        {rfqId && sortedQuotes.length > 0 && (
          <>
            {/* RFQ Info */}
            {activeRFQ && (
              <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{activeRFQ.id}</span>
                <span>{activeRFQ.product}</span>
                <span className="font-medium">{activeRFQ.quantity.toLocaleString()} units</span>
              </div>
            )}

            {/* Price Comparison Bars */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5 mb-6">
              <h3 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#FF6B00]" /> Price Comparison
              </h3>
              <div className="space-y-3">
                {sortedQuotes.map((q) => (
                  <div key={q.id} className="flex items-center gap-3">
                    <span className="w-40 text-sm text-gray-700 truncate shrink-0">{q.manufacturer}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${(q.unitPrice / maxPrice) * 100}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">${q.unitPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 w-10 text-right">
                      {((q.unitPrice / maxPrice) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lead Time Comparison Bars */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5 mb-6">
              <h3 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF6B00]" /> Lead Time Comparison
              </h3>
              <div className="space-y-3">
                {sortedQuotes.map((q) => (
                  <div key={q.id} className="flex items-center gap-3">
                    <span className="w-40 text-sm text-gray-700 truncate shrink-0">{q.manufacturer}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-[#0A1628] to-[#1e3a5f] rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${(q.leadTimeDays / maxLead) * 100}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">{q.leadTimeDays}d</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 w-10 text-right">
                      {((q.leadTimeDays / maxLead) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Side-by-Side Comparison Table */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-44">Metric</th>
                      {sortedQuotes.map((q) => (
                        <th key={q.id} className="text-center px-4 py-3 min-w-[180px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-semibold text-[#0A1628] text-sm">{q.manufacturer}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs">{countryFlags[q.country] || "🌍"}</span>
                              <span className="text-[10px] text-gray-500">{q.country}</span>
                              {q.verified && (
                                <Shield className="w-3 h-3 text-green-600" />
                              )}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-700 flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-[#FF6B00]" /> Unit Price
                      </td>
                      {sortedQuotes.map((q, i) => (
                        <td key={q.id} className="text-center px-4 py-3">
                          <span className={`text-lg font-bold ${i === 0 ? "text-green-600" : "text-[#0A1628]"}`}>
                            ${q.unitPrice.toFixed(2)}
                          </span>
                          <div className="mt-1 space-y-0.5">
                            {q.tieredPricing.map((tier, ti) => (
                              <p key={ti} className="text-[10px] text-gray-500">
                                {tier.maxQty ? `${tier.minQty.toLocaleString()}–${tier.maxQty.toLocaleString()}` : `${tier.minQty.toLocaleString()}+`}: ${tier.price.toFixed(2)}
                              </p>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-700 flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-[#FF6B00]" /> MOQ
                      </td>
                      {sortedQuotes.map((q) => (
                        <td key={q.id} className="text-center px-4 py-3 font-medium text-gray-800">
                          {q.moq.toLocaleString()} units
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-700 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#FF6B00]" /> Lead Time
                      </td>
                      {sortedQuotes.map((q) => (
                        <td key={q.id} className="text-center px-4 py-3 font-medium text-gray-800">
                          {q.leadTimeDays} days
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-700 flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-[#FF6B00]" /> Verification
                      </td>
                      {sortedQuotes.map((q) => (
                        <td key={q.id} className="text-center px-4 py-3">
                          {q.verified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Unverified</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-700 flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-[#FF6B00]" /> Rating
                      </td>
                      {sortedQuotes.map((q) => (
                        <td key={q.id} className="text-center px-4 py-3">
                          <span className="text-yellow-500 text-xs">
                            {"★".repeat(Math.floor(q.rating))}{"☆".repeat(5 - Math.floor(q.rating))}
                          </span>
                          <span className="ml-1 text-xs font-medium text-gray-600">{q.rating}</span>
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-700">Sample Cost</td>
                      {sortedQuotes.map((q) => (
                        <td key={q.id} className="text-center px-4 py-3 text-gray-800">
                          ${q.sampleCost.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-700">Shipping Est.</td>
                      {sortedQuotes.map((q) => (
                        <td key={q.id} className="text-center px-4 py-3 text-gray-800">
                          ${q.shippingEstimate.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td className="px-4 py-3 font-semibold text-[#0A1628]">Total Est. Cost</td>
                      {sortedQuotes.map((q) => (
                        <td key={q.id} className="text-center px-4 py-3">
                          <span className="text-lg font-bold text-[#0A1628]">
                            ${((q.unitPrice * (activeRFQ?.quantity || 5000)) + q.shippingEstimate).toLocaleString()}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3"></td>
                      {sortedQuotes.map((q) => (
                        <td key={q.id} className="text-center px-4 py-3">
                          {acceptedQuote === q.id ? (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                              <CheckCircle className="w-4 h-4" /> Accepted
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAccept(q.id)}
                              disabled={acceptingQuote === q.id || acceptedQuote !== null}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF6B00] text-white text-sm font-semibold hover:bg-[#e55f00] transition-colors disabled:opacity-50"
                            >
                              {acceptingQuote === q.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Accept Quote
                            </button>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
