"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign, ArrowLeft, Loader2, ChevronDown, CheckCircle2,
  Clock, Shield, ArrowUpRight, ArrowDownRight, Eye, Lock
} from "lucide-react";

interface EscrowSummary {
  totalHeld: string;
  totalReleased: string;
  activeCount: number;
}

interface EscrowItem {
  id: string;
  orderId: string;
  orderNumber: string;
  totalAmount: string;
  depositedAmount: string;
  releasedAmount: string;
  status: string;
  milestones: Array<{
    name: string;
    percent: number;
    amount: string;
    status: "pending" | "released" | "held";
    releasedAt?: string;
  }>;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  funded: { label: "Funded", color: "text-green-700", bg: "bg-green-100" },
  partially_released: { label: "Partially Released", color: "text-blue-700", bg: "bg-blue-100" },
  fully_released: { label: "Fully Released", color: "text-gray-600", bg: "bg-gray-100" },
  disputed: { label: "Disputed", color: "text-red-600", bg: "bg-red-100" },
};

export default function EscrowPage() {
  const [summary, setSummary] = useState<EscrowSummary>({ totalHeld: "$0", totalReleased: "$0", activeCount: 0 });
  const [escrows, setEscrows] = useState<EscrowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEscrow, setExpandedEscrow] = useState<string | null>(null);

  useEffect(() => {
    const fetchEscrow = async () => {
      try {
        const res = await fetch("/api/v1/manufacturers/escrow");
        const json = await res.json();
        if (json.data) {
          setSummary(json.data.summary);
          setEscrows(json.data.escrows);
        }
      } catch {
        setSummary({ totalHeld: "$35,000", totalReleased: "$62,200", activeCount: 3 });
        setEscrows([
          {
            id: "esc-001",
            orderId: "ord-001",
            orderNumber: "MFG-2847",
            totalAmount: "$17,000",
            depositedAmount: "$5,100",
            releasedAmount: "$0",
            status: "funded",
            milestones: [
              { name: "Deposit Received", percent: 30, amount: "$5,100", status: "released", releasedAt: "2026-06-15" },
              { name: "Materials Confirmed", percent: 20, amount: "$3,400", status: "held" },
              { name: "Production Complete", percent: 25, amount: "$4,250", status: "held" },
              { name: "QC Passed", percent: 10, amount: "$1,700", status: "held" },
              { name: "Inspection Approved", percent: 5, amount: "$850", status: "held" },
              { name: "Packed & Ready", percent: 5, amount: "$850", status: "held" },
              { name: "Shipped", percent: 5, amount: "$850", status: "held" },
            ],
          },
          {
            id: "esc-002",
            orderId: "ord-002",
            orderNumber: "MFG-2831",
            totalAmount: "$16,000",
            depositedAmount: "$4,800",
            releasedAmount: "$7,200",
            status: "partially_released",
            milestones: [
              { name: "Deposit Received", percent: 30, amount: "$4,800", status: "released", releasedAt: "2026-06-10" },
              { name: "Materials Confirmed", percent: 15, amount: "$2,400", status: "released", releasedAt: "2026-06-16" },
              { name: "Production Complete", percent: 25, amount: "$4,000", status: "released", releasedAt: "2026-06-25" },
              { name: "QC Passed", percent: 15, amount: "$2,400", status: "held" },
              { name: "Inspection Approved", percent: 5, amount: "$800", status: "held" },
              { name: "Packed & Ready", percent: 5, amount: "$800", status: "held" },
              { name: "Shipped", percent: 5, amount: "$800", status: "held" },
            ],
          },
          {
            id: "esc-003",
            orderId: "ord-003",
            orderNumber: "MFG-2819",
            totalAmount: "$18,000",
            depositedAmount: "$5,400",
            releasedAmount: "$18,000",
            status: "fully_released",
            milestones: [
              { name: "Deposit Received", percent: 30, amount: "$5,400", status: "released", releasedAt: "2026-06-01" },
              { name: "Materials Confirmed", percent: 15, amount: "$2,700", status: "released", releasedAt: "2026-06-06" },
              { name: "Production Complete", percent: 20, amount: "$3,600", status: "released", releasedAt: "2026-06-14" },
              { name: "QC Passed", percent: 15, amount: "$2,700", status: "released", releasedAt: "2026-06-18" },
              { name: "Inspection Approved", percent: 5, amount: "$900", status: "released", releasedAt: "2026-06-20" },
              { name: "Packed & Ready", percent: 5, amount: "$900", status: "released", releasedAt: "2026-06-22" },
              { name: "Shipped", percent: 10, amount: "$1,800", status: "released", releasedAt: "2026-06-24" },
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchEscrow();
  }, []);

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
              <h2 className="text-lg font-bold text-[#0A1628]">Escrow & Payments</h2>
              <p className="text-xs text-gray-500">Milestone-based payment protection</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Lock size={18} />
              </div>
              <span className="text-xs text-gray-500">Held in Escrow</span>
            </div>
            <p className="text-2xl font-bold text-[#0A1628]">{summary.totalHeld}</p>
            <p className="text-[10px] text-gray-400 mt-1">{summary.activeCount} active escrows</p>
          </div>
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <ArrowDownRight size={18} />
              </div>
              <span className="text-xs text-gray-500">Total Released</span>
            </div>
            <p className="text-2xl font-bold text-[#0A1628]">{summary.totalReleased}</p>
            <p className="text-[10px] text-green-600 mt-1">All milestones cleared</p>
          </div>
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#0A1628]/10 text-[#0A1628] flex items-center justify-center">
                <Shield size={18} />
              </div>
              <span className="text-xs text-gray-500">Protection Status</span>
            </div>
            <p className="text-2xl font-bold text-green-600">Active</p>
            <p className="text-[10px] text-gray-400 mt-1">All escrows secured</p>
          </div>
        </div>

        {/* Escrow List */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#0A1628]">Escrow Details</h3>
          </div>

          {escrows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <DollarSign size={40} className="text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">No escrows found</p>
              <p className="text-xs text-gray-400 mt-1">Escrow accounts are created when orders are placed</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {escrows.map((escrow) => {
                const status = statusConfig[escrow.status] || statusConfig.funded;
                const isExpanded = expandedEscrow === escrow.id;

                return (
                  <div key={escrow.id}>
                    {/* Row */}
                    <div
                      className="px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                      onClick={() => setExpandedEscrow(isExpanded ? null : escrow.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-[#0A1628]/5 flex items-center justify-center">
                            <DollarSign size={16} className="text-[#0A1628]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-[#0A1628]">{escrow.orderNumber}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              {escrow.milestones.filter((m) => m.status === "released").length}/{escrow.milestones.length} milestones released
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500">Total</p>
                            <p className="text-xs font-bold text-[#0A1628]">{escrow.totalAmount}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500">Held</p>
                            <p className="text-xs font-bold text-amber-600">
                              ${(parseFloat(escrow.depositedAmount.replace("$", "").replace(",", "")) - parseFloat(escrow.releasedAmount.replace("$", "").replace(",", ""))).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500">Released</p>
                            <p className="text-xs font-bold text-green-600">{escrow.releasedAmount}</p>
                          </div>
                          <ChevronDown
                            size={14}
                            className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Milestone Breakdown */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-0">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Milestone Breakdown</h4>
                          <div className="space-y-2">
                            {escrow.milestones.map((milestone, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                    milestone.status === "released" ? "bg-green-500 text-white" :
                                    milestone.status === "held" ? "bg-amber-100 text-amber-700" :
                                    "bg-gray-100 text-gray-500"
                                  }`}>
                                    {milestone.status === "released" ? <CheckCircle2 size={12} /> : i + 1}
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-[#0A1628]">{milestone.name}</p>
                                    <p className="text-[10px] text-gray-500">{milestone.percent}% of total</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-[#0A1628]">{milestone.amount}</span>
                                  {milestone.status === "released" ? (
                                    <span className="text-[10px] text-green-600 flex items-center gap-1">
                                      <ArrowDownRight size={10} /> Released
                                      {milestone.releasedAt && (
                                        <span className="text-gray-400 ml-1">{new Date(milestone.releasedAt).toLocaleDateString()}</span>
                                      )}
                                    </span>
                                  ) : milestone.status === "held" ? (
                                    <button className="text-[10px] px-2 py-0.5 bg-[#FF6B00] text-white rounded font-medium hover:bg-[#e55f00] transition-colors flex items-center gap-1">
                                      <ArrowUpRight size={9} /> Request Release
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            ))}
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
