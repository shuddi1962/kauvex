"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2, TrendingUp, ShoppingCart, FileText,
  Package, BadgePercent, Truck, CheckCircle2, X,
  Send, Clock, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

interface QuoteRequest {
  id: string;
  buyer: string;
  company: string;
  products: string;
  quantity: number;
  status: "pending" | "responded" | "accepted" | "declined";
  date: string;
}

interface Opportunity {
  id: string;
  product: string;
  category: string;
  demand: string;
  reason: string;
}

interface DiscountTier {
  quantity: string;
  discount: string;
  description: string;
}

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "1",
    product: "Yamaha F150 Outboard Motor",
    category: "Marine",
    demand: "High",
    reason: "14 B2B inquiries in last 30 days, trending +25%",
  },
  {
    id: "2",
    product: "Marine LED Navigation Kit",
    category: "Boat Parts",
    demand: "Medium",
    reason: "Wholesale pricing requested by 3 marina operators",
  },
  {
    id: "3",
    product: "Stainless Steel Propeller Set",
    category: "Marine",
    demand: "High",
    reason: "5 fleet maintenance companies seeking bulk pricing",
  },
];

const MOCK_QUOTES: QuoteRequest[] = [
  {
    id: "QT-001",
    buyer: "James Wilson",
    company: "Atlantic Marine Services",
    products: "Yamaha F150 (x4), Propeller Set (x8)",
    quantity: 12,
    status: "pending",
    date: "2026-06-18",
  },
  {
    id: "QT-002",
    buyer: "Sarah Okonkwo",
    company: "Lagos Boatyard Ltd",
    products: "Marine LED Kit (x20)",
    quantity: 20,
    status: "responded",
    date: "2026-06-15",
  },
  {
    id: "QT-003",
    buyer: "Michael Chen",
    company: "Pacific Fleet Solutions",
    products: "Navigation Systems (x5)",
    quantity: 5,
    status: "accepted",
    date: "2026-06-10",
  },
  {
    id: "QT-004",
    buyer: "Emeka Obi",
    company: "Delta Marine Logistics",
    products: "Propeller Set (x15)",
    quantity: 15,
    status: "declined",
    date: "2026-06-05",
  },
];

const MOCK_DISCOUNT_TIERS: DiscountTier[] = [
  { quantity: "10+", discount: "5%", description: "Buy 10+, get 5% off" },
  { quantity: "50+", discount: "12%", description: "Buy 50+, get 12% off" },
  { quantity: "100+", discount: "20%", description: "Buy 100+, get 20% off" },
];

export default function VendorB2BPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>(MOCK_QUOTES);
  const [activeQuote, setActiveQuote] = useState<string | null>(null);
  const [respondedQuote, setRespondedQuote] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [quoteForm, setQuoteForm] = useState({
    unitPrice: "",
    moq: "",
    leadTime: "",
    paymentTerms: "net30",
    validity: "30",
    notes: "",
  });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleQuoteResponse = (quoteId: string) => {
    if (!quoteForm.unitPrice) return;
    setQuotes(
      quotes.map((q) =>
        q.id === quoteId ? { ...q, status: "responded" as const } : q
      )
    );
    setActiveQuote(null);
    setRespondedQuote(quoteId);
    showToast("success", `Quote ${quoteId} response sent successfully`);
    setQuoteForm({
      unitPrice: "",
      moq: "",
      leadTime: "",
      paymentTerms: "net30",
      validity: "30",
      notes: "",
    });
    setTimeout(() => setRespondedQuote(null), 2000);
  };

  const profile = {
    company: "Kauvex Marine Supplies",
    email: "vendor@kauvex.com",
    phone: "+234 800 123 4567",
    address: "15 Marina Road, Lagos Island, Lagos",
    yearsInBusiness: 8,
    certifications: ["ISO 9001:2025", "SON Certified", "Marine Quality Assurance"],
    moq: "₦500,000",
    paymentTerms: "Net 30 / Net 60",
  };

  const activeQuoteData = quotes.find((q) => q.id === activeQuote);

  return (
    <VendorShell
      title="B2B Central"
      subtitle="Business-to-business sales hub"
    >
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-purple-600" />
              <span className="text-xs text-gray-500">
                Product Opportunities
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {MOCK_OPPORTUNITIES.length}
            </p>
            <p className="text-[10px] text-green-600 font-medium">
              AI-flagged with high B2B demand
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-amber-500" />
              <span className="text-xs text-gray-500">Pending Quotes</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {quotes.filter((q) => q.status === "pending").length}
            </p>
            <p className="text-[10px] text-amber-600 font-medium">
              Awaiting your response
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <BadgePercent size={16} className="text-green-500" />
              <span className="text-xs text-gray-500">Discount Tiers</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {MOCK_DISCOUNT_TIERS.length}
            </p>
            <p className="text-[10px] text-green-600 font-medium">
              Volume-based savings
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Truck size={16} className="text-blue-500" />
              <span className="text-xs text-gray-500">B2B Rating</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">4.8</p>
            <p className="text-[10px] text-blue-600 font-medium">
              Business seller score
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-600" />
                  Product Opportunities
                  <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
                    AI Powered
                  </span>
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {MOCK_OPPORTUNITIES.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {opp.product}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {opp.category} •{" "}
                          <span
                            className={`font-medium ${
                              opp.demand === "High"
                                ? "text-green-600"
                                : "text-amber-600"
                            }`}
                          >
                            {opp.demand} Demand
                          </span>
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {opp.reason}
                        </p>
                      </div>
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                        {opp.demand}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <FileText size={16} className="text-purple-600" />
                  Manage Quotes — Incoming Bulk Quote Requests
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">
                        Business Buyer
                      </th>
                      <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">
                        Products
                      </th>
                      <th className="text-center py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">
                        Qty
                      </th>
                      <th className="text-center py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((q) => (
                      <tr
                        key={q.id}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <p className="text-xs font-semibold">{q.buyer}</p>
                          <p className="text-[10px] text-gray-400">
                            {q.company}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 max-w-[200px] truncate">
                          {q.products}
                        </td>
                        <td className="py-3 px-4 text-center text-xs font-semibold">
                          {q.quantity}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                              q.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : q.status === "responded"
                                  ? "bg-blue-100 text-blue-700"
                                  : q.status === "accepted"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {q.status === "pending" ? (
                            <button
                              onClick={() => setActiveQuote(q.id)}
                              className="px-3 py-1.5 text-xs text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 font-medium"
                            >
                              Respond
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400">
                              {q.status === "responded" ? "Awaiting buyer" : "—"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package size={16} className="text-purple-600" />
                <h3 className="font-semibold text-sm">
                  Case Pack Recommendations
                </h3>
                <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
                  AI Suggested
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    product: "Yamaha F150",
                    current: "1 unit/case",
                    recommended: "4 units/case",
                    savings: "18%",
                  },
                  {
                    product: "LED Kit",
                    current: "5 units/case",
                    recommended: "20 units/case",
                    savings: "22%",
                  },
                  {
                    product: "Propeller Set",
                    current: "2 units/case",
                    recommended: "10 units/case",
                    savings: "15%",
                  },
                ].map((rec, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors"
                  >
                    <p className="text-xs font-semibold text-gray-900">
                      {rec.product}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Current: {rec.current}
                    </p>
                    <p className="text-[10px] text-green-600 font-medium">
                      Recommended: {rec.recommended}
                    </p>
                    <p className="text-[10px] text-purple-600 font-bold mt-1">
                      Save {rec.savings}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <BadgePercent size={16} className="text-purple-600" />
                Business Discount Insights — Volume Discount Tiers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {MOCK_DISCOUNT_TIERS.map((tier, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-xl p-4 text-center hover:border-purple-300 transition-colors"
                  >
                    <p className="text-lg font-bold text-purple-600">
                      {tier.discount}
                    </p>
                    <p className="text-xs font-semibold text-gray-900 mt-1">
                      {tier.quantity}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {tier.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={16} className="text-purple-600" />
                <h3 className="font-semibold text-sm">Business Profile</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Company
                  </p>
                  <p className="text-xs font-semibold">{profile.company}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Contact
                  </p>
                  <p className="text-xs">{profile.email}</p>
                  <p className="text-xs">{profile.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Address
                  </p>
                  <p className="text-xs">{profile.address}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Years in Business
                  </p>
                  <p className="text-xs font-semibold">
                    {profile.yearsInBusiness} years
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Certifications
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Minimum Order Qty
                  </p>
                  <p className="text-xs font-semibold">{profile.moq}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Payment Terms
                  </p>
                  <p className="text-xs">{profile.paymentTerms}</p>
                </div>
              </div>
              <button
                onClick={() => alert("Edit Business Profile")}
                className="mt-4 w-full text-xs text-purple-600 border border-purple-200 rounded-lg py-2 hover:bg-purple-50 font-medium"
              >
                Edit Profile
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <CheckCircle2 size={16} className="text-purple-600" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => alert("Create bulk listing")}
                  className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-purple-50 rounded-lg"
                >
                  Create Bulk Product Listing
                </button>
                <button
                  onClick={() => alert("View B2B analytics")}
                  className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-purple-50 rounded-lg"
                >
                  View B2B Analytics
                </button>
                <button
                  onClick={() => alert("Export buyer list")}
                  className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-purple-50 rounded-lg"
                >
                  Export Buyer List
                </button>
                <button
                  onClick={() => alert("Set up net terms")}
                  className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-purple-50 rounded-lg"
                >
                  Set Up Net Payment Terms
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeQuote && activeQuoteData && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setActiveQuote(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-sm">Respond to Quote</h3>
                <p className="text-xs text-gray-400">{activeQuoteData.id}</p>
              </div>
              <button
                onClick={() => setActiveQuote(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-1">
              <p className="text-xs">
                <span className="text-gray-400">Buyer: </span>
                <span className="font-semibold">{activeQuoteData.buyer}</span>
              </p>
              <p className="text-xs">
                <span className="text-gray-400">Company: </span>
                {activeQuoteData.company}
              </p>
              <p className="text-xs">
                <span className="text-gray-400">Products: </span>
                {activeQuoteData.products}
              </p>
              <p className="text-xs">
                <span className="text-gray-400">Quantity: </span>
                {activeQuoteData.quantity}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Unit Price (₦)
                </label>
                <input
                  value={quoteForm.unitPrice}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, unitPrice: e.target.value })
                  }
                  placeholder="Enter unit price"
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Minimum Order Quantity (MOQ)
                </label>
                <input
                  value={quoteForm.moq}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, moq: e.target.value })
                  }
                  placeholder="Enter MOQ"
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Lead Time
                </label>
                <select
                  value={quoteForm.leadTime}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, leadTime: e.target.value })
                  }
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                >
                  <option value="">Select lead time</option>
                  <option value="3-5 days">3-5 days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="2-3 weeks">2-3 weeks</option>
                  <option value="3-4 weeks">3-4 weeks</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Payment Terms
                </label>
                <select
                  value={quoteForm.paymentTerms}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, paymentTerms: e.target.value })
                  }
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                >
                  <option value="net30">Net 30</option>
                  <option value="net60">Net 60</option>
                  <option value="net90">Net 90</option>
                  <option value="50deposit">50% Deposit</option>
                  <option value="fullupfront">Full Upfront</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Validity Period (days)
                </label>
                <select
                  value={quoteForm.validity}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, validity: e.target.value })
                  }
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={quoteForm.notes}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Delivery terms, warranty, etc."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setActiveQuote(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleQuoteResponse(activeQuote)}
                disabled={!quoteForm.unitPrice}
              >
                <Send size={14} className="mr-1" /> Send Quote
              </Button>
            </div>
          </div>
        </div>
      )}
    </VendorShell>
  );
}
