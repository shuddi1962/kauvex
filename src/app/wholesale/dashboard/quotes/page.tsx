"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Loader2, Clock, CheckCircle2, Send } from "lucide-react";

interface Quote {
  id: string;
  date: string;
  items: number;
  totalEstimate: string;
  status: string;
  validUntil: string;
}

const seedQuotes: Quote[] = [
  { id: "Q-2024-001", date: "2026-06-28", items: 5, totalEstimate: "$12,500", status: "pending", validUntil: "2026-07-15" },
  { id: "Q-2024-002", date: "2026-06-20", items: 8, totalEstimate: "$24,800", status: "accepted", validUntil: "2026-07-05" },
  { id: "Q-2024-003", date: "2026-06-15", items: 3, totalEstimate: "$6,200", status: "expired", validUntil: "2026-06-30" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-100", icon: Clock },
  accepted: { label: "Accepted", color: "text-green-700", bg: "bg-green-100", icon: CheckCircle2 },
  expired: { label: "Expired", color: "text-gray-600", bg: "bg-gray-100", icon: Clock },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-100", icon: Clock },
};

export default function WholesaleQuotesPage() {
  const [quotes] = useState<Quote[]>(seedQuotes);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/wholesale/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={16} className="text-gray-500" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">My Quotes</h2>
            <p className="text-xs text-gray-500">Track your quote requests and responses</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{quotes.length} total quotes</p>
          <Link href="/manufacturers/request-quote" className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-xs font-semibold hover:bg-[#e55f00]">
            <Send size={12} /> New Quote Request
          </Link>
        </div>

        <div className="space-y-3">
          {quotes.map((quote) => {
            const status = statusConfig[quote.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            return (
              <div key={quote.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">{quote.id}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{quote.items} items &middot; Requested {new Date(quote.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500">Estimated Total</p>
                      <p className="text-sm font-bold text-[#0A1628]">{quote.totalEstimate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500">Valid Until</p>
                      <p className="text-xs text-gray-600">{new Date(quote.validUntil).toLocaleDateString()}</p>
                    </div>
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
