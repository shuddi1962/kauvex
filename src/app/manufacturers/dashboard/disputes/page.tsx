"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Loader2, AlertTriangle, Clock, CheckCircle2,
  XCircle, MessageSquare, Eye, Filter, ChevronDown,
} from "lucide-react";

interface Dispute {
  id: string;
  orderNumber: string;
  disputeType: string;
  description: string;
  raisedBy: string;
  status: "open" | "under_review" | "resolved" | "rejected";
  createdAt: string;
  resolution?: string;
}

const disputeTypeLabels: Record<string, string> = {
  quality: "Quality Issue",
  quantity: "Quantity Discrepancy",
  late_delivery: "Late Delivery",
  wrong_spec: "Wrong Specification",
  customization_mismatch: "Customization Mismatch",
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  open: { label: "Open", color: "text-red-700", bg: "bg-red-100", icon: AlertTriangle },
  under_review: { label: "Under Review", color: "text-amber-700", bg: "bg-amber-100", icon: Clock },
  resolved: { label: "Resolved", color: "text-green-700", bg: "bg-green-100", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "text-gray-600", bg: "bg-gray-100", icon: XCircle },
};

export default function ManufacturerDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedDispute, setExpandedDispute] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const res = await fetch("/api/v1/manufacturers/disputes");
        const json = await res.json();
        if (json.data) setDisputes(json.data);
      } catch {
        setDisputes([
          { id: "d1", orderNumber: "MFG-2847", disputeType: "quality", description: "Fabric quality does not match the approved sample. Buyer reports pilling after first wash.", raisedBy: "buyer", status: "open", createdAt: "2026-06-28T10:00:00Z" },
          { id: "d2", orderNumber: "MFG-2831", disputeType: "late_delivery", description: "Production delayed by 3 weeks beyond agreed timeline without prior communication.", raisedBy: "buyer", status: "under_review", createdAt: "2026-06-20T14:30:00Z" },
          { id: "d3", orderNumber: "MFG-2819", disputeType: "quantity", description: "Delivered 4,800 units instead of ordered 5,000 units. Shortage of 200 units.", raisedBy: "manufacturer", status: "resolved", createdAt: "2026-06-15T09:00:00Z", resolution: "Manufacturer shipped remaining 200 units. Buyer confirmed receipt." },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDisputes();
  }, []);

  const filtered = disputes.filter((d) => statusFilter === "all" || d.status === statusFilter);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#FF6B00]" size={32} />
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
              <h2 className="text-lg font-bold text-[#0A1628]">Disputes</h2>
              <p className="text-xs text-gray-500">Manage order disputes and resolutions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-xs appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20">
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Open", count: disputes.filter((d) => d.status === "open").length, color: "bg-red-50 text-red-700" },
            { label: "Under Review", count: disputes.filter((d) => d.status === "under_review").length, color: "bg-amber-50 text-amber-700" },
            { label: "Resolved", count: disputes.filter((d) => d.status === "resolved").length, color: "bg-green-50 text-green-700" },
            { label: "Rejected", count: disputes.filter((d) => d.status === "rejected").length, color: "bg-gray-50 text-gray-600" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Disputes List */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#0A1628]">All Disputes</h3>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <CheckCircle2 size={40} className="text-green-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">No disputes found</p>
              <p className="text-xs text-gray-400 mt-1">All orders are running smoothly</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((dispute) => {
                const status = statusConfig[dispute.status];
                const StatusIcon = status.icon;
                const isExpanded = expandedDispute === dispute.id;

                return (
                  <div key={dispute.id}>
                    <div
                      className="px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                      onClick={() => setExpandedDispute(isExpanded ? null : dispute.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                            <AlertTriangle size={16} className="text-red-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-[#0A1628]">{dispute.orderNumber}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              {disputeTypeLabels[dispute.disputeType] || dispute.disputeType} &middot; Raised by {dispute.raisedBy}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400">{new Date(dispute.createdAt).toLocaleDateString()}</p>
                          </div>
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                            <Eye size={14} className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-0">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                          <div>
                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
                            <p className="text-xs text-[#0A1628] leading-relaxed">{dispute.description}</p>
                          </div>
                          {dispute.resolution && (
                            <div>
                              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Resolution</p>
                              <p className="text-xs text-green-700 leading-relaxed">{dispute.resolution}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-2">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
                              <MessageSquare size={12} /> Reply
                            </button>
                            {dispute.status === "open" && (
                              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B00] text-white rounded-lg text-xs font-medium hover:bg-[#e55f00]">
                                <CheckCircle2 size={12} /> Accept & Resolve
                              </button>
                            )}
                          </div>
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
    </div>
  );
}
