"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText, ArrowLeft, Clock, CheckCircle2, XCircle, AlertTriangle,
  Loader2, Search, Eye, Send, DollarSign, Package, Calendar,
  ChevronDown, ChevronRight, Timer
} from "lucide-react";

interface Quote {
  id: string;
  inquiryId: string;
  inquiryRef: string;
  buyerName: string;
  productDescription: string;
  pricingTiers: Array<{ minQty: number; maxQty: number; unitPrice: string }>;
  moq: number;
  leadTimeDays: number;
  sampleCost: string;
  paymentTerms: string;
  incoterm: string;
  validUntil: string;
  status: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-100", icon: Clock },
  sent: { label: "Sent", color: "text-blue-700", bg: "bg-blue-100", icon: Send },
  accepted: { label: "Accepted", color: "text-green-700", bg: "bg-green-100", icon: CheckCircle2 },
  expired: { label: "Expired", color: "text-gray-600", bg: "bg-gray-100", icon: Timer },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-100", icon: XCircle },
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await fetch("/api/v1/manufacturers/quotes");
        const json = await res.json();
        if (json.data) {
          setQuotes(json.data);
        }
      } catch {
        setQuotes([
          {
            id: "qt-001",
            inquiryId: "inq-001",
            inquiryRef: "INQ-2026-001",
            buyerName: "GlobalTextile Co.",
            productDescription: "Cotton t-shirts, 200gsm, custom print",
            pricingTiers: [
              { minQty: 1000, maxQty: 4999, unitPrice: "$3.50" },
              { minQty: 5000, maxQty: 9999, unitPrice: "$3.20" },
              { minQty: 10000, maxQty: 0, unitPrice: "$2.90" },
            ],
            moq: 1000,
            leadTimeDays: 25,
            sampleCost: "$45.00",
            paymentTerms: "30% deposit, 70% before shipping",
            incoterm: "FOB",
            validUntil: "2026-07-15",
            status: "sent",
            createdAt: "2026-06-28",
          },
          {
            id: "qt-002",
            inquiryId: "inq-002",
            inquiryRef: "INQ-2026-002",
            buyerName: "EuroParts GmbH",
            productDescription: "CNC machined aluminum brackets, 6061-T6",
            pricingTiers: [
              { minQty: 500, maxQty: 1999, unitPrice: "$9.20" },
              { minQty: 2000, maxQty: 4999, unitPrice: "$8.50" },
              { minQty: 5000, maxQty: 0, unitPrice: "$7.80" },
            ],
            moq: 500,
            leadTimeDays: 15,
            sampleCost: "$85.00",
            paymentTerms: "100% T/T in advance",
            incoterm: "EXW",
            validUntil: "2026-07-10",
            status: "accepted",
            createdAt: "2026-06-27",
          },
          {
            id: "qt-003",
            inquiryId: "inq-003",
            inquiryRef: "INQ-2026-003",
            buyerName: "Lagos Retail Ltd",
            productDescription: "Plastic storage containers, 20L with lid",
            pricingTiers: [
              { minQty: 5000, maxQty: 9999, unitPrice: "$2.00" },
              { minQty: 10000, maxQty: 49999, unitPrice: "$1.80" },
              { minQty: 50000, maxQty: 0, unitPrice: "$1.55" },
            ],
            moq: 5000,
            leadTimeDays: 20,
            sampleCost: "$25.00",
            paymentTerms: "30% deposit, balance before shipment",
            incoterm: "FOB",
            validUntil: "2026-07-05",
            status: "pending",
            createdAt: "2026-06-26",
          },
          {
            id: "qt-004",
            inquiryId: "inq-004",
            inquiryRef: "INQ-2026-004",
            buyerName: "Shenzhen Imports",
            productDescription: "USB-C charging cables, 1.5m, braided",
            pricingTiers: [
              { minQty: 10000, maxQty: 49999, unitPrice: "$0.72" },
              { minQty: 50000, maxQty: 0, unitPrice: "$0.65" },
            ],
            moq: 10000,
            leadTimeDays: 12,
            sampleCost: "$15.00",
            paymentTerms: "50% deposit, 50% before shipping",
            incoterm: "FOB",
            validUntil: "2026-06-30",
            status: "expired",
            createdAt: "2026-06-20",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "sent", label: "Sent" },
    { key: "accepted", label: "Accepted" },
    { key: "expired", label: "Expired" },
  ];

  const filtered = activeTab === "all" ? quotes : quotes.filter((q) => q.status === activeTab);

  const counts = {
    all: quotes.length,
    pending: quotes.filter((q) => q.status === "pending").length,
    sent: quotes.filter((q) => q.status === "sent").length,
    accepted: quotes.filter((q) => q.status === "accepted").length,
    expired: quotes.filter((q) => q.status === "expired").length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-kauvex-orange" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/manufacturers/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={16} className="text-gray-500" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-[#0A1628]">Quotes</h2>
              <p className="text-xs text-gray-500">Manage your price quotations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-[#0A1628] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              <span className="ml-1 text-[10px] opacity-70">{counts[tab.key as keyof typeof counts]}</span>
            </button>
          ))}
        </div>

        {/* Quote Cards */}
        {filtered.length === 0 ? (
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 flex flex-col items-center justify-center py-16">
            <FileText size={40} className="text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-500">No quotes found</p>
            <p className="text-xs text-gray-400 mt-1">Quotes will appear here once created</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((quote) => {
              const status = statusConfig[quote.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const isExpanded = expandedQuote === quote.id;

              return (
                <div key={quote.id} className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                  {/* Card Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => setExpandedQuote(isExpanded ? null : quote.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0A1628]/5 flex items-center justify-center shrink-0">
                          <FileText size={16} className="text-[#0A1628]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-[#0A1628]">{quote.inquiryRef}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color} flex items-center gap-1`}>
                              <StatusIcon size={9} /> {status.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">{quote.buyerName} &middot; {quote.productDescription}</p>
                        </div>
                      </div>
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>

                    {/* Quick Info */}
                    <div className="flex items-center gap-4 mt-3 ml-[52px]">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Package size={9} /> MOQ: {quote.moq.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock size={9} /> {quote.leadTimeDays} days lead time
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <DollarSign size={9} /> Sample: {quote.sampleCost}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Calendar size={9} /> Valid until {new Date(quote.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50/30">
                      {/* Pricing Tiers */}
                      <div className="mb-4">
                        <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Pricing Tiers</h4>
                        <div className="grid gap-2">
                          {quote.pricingTiers.map((tier, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                              <span className="text-xs text-gray-600">
                                {tier.minQty.toLocaleString()} – {tier.maxQty ? tier.maxQty.toLocaleString() : "∞"} units
                              </span>
                              <span className="text-sm font-bold text-[#0A1628]">{tier.unitPrice}/unit</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div>
                          <label className="text-[10px] text-gray-500">Payment Terms</label>
                          <p className="text-xs font-medium text-[#0A1628]">{quote.paymentTerms}</p>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500">Incoterm</label>
                          <p className="text-xs font-medium text-[#0A1628]">{quote.incoterm}</p>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500">Created</label>
                          <p className="text-xs font-medium text-[#0A1628]">{new Date(quote.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        {quote.status === "pending" && (
                          <button className="px-4 py-2 bg-[#FF6B00] text-white text-xs font-semibold rounded-lg hover:bg-[#e55f00] transition-colors flex items-center gap-1.5">
                            <Send size={12} /> Send Quote
                          </button>
                        )}
                        <button className="px-4 py-2 border border-gray-200 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                          Edit Quote
                        </button>
                        <Link
                          href={`/manufacturers/dashboard/inquiries?highlight=${quote.inquiryId}`}
                          className="px-4 py-2 border border-gray-200 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          View Inquiry
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
