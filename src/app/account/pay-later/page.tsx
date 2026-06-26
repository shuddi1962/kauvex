"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard, ChevronRight, Loader2, CheckCircle2, XCircle, Clock, ShoppingBag, ArrowRight, Shield,
} from "lucide-react";

interface BnplAgreement {
  id: string;
  orderId: string;
  totalAmount: number;
  installmentCount: number;
  installmentAmount: number;
  firstPaymentPercent: number;
  firstPaymentAmount: number;
  status: string;
  totalPaid: number;
  totalOutstanding: number;
  missedPaymentCount: number;
  lateFeesAccrued: number;
  createdAt: string;
}

interface Eligibility {
  isEligible: boolean;
  currentLimit: number;
  usedLimit: number;
  availableLimit: number;
  status: string;
}

export default function PayLaterPage() {
  const [agreements, setAgreements] = useState<BnplAgreement[]>([]);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "overdue">("active");
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [agreementsRes, eligibilityRes] = await Promise.all([
        fetch("/api/v1/pay/bnpl/agreements"),
        fetch("/api/v1/pay/bnpl/eligibility"),
      ]);
      if (agreementsRes.ok) {
        const json = await agreementsRes.json();
        setAgreements(json.data?.agreements || []);
      }
      if (eligibilityRes.ok) {
        const json = await eligibilityRes.json();
        setEligibility(json.data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const requestEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await fetch("/api/v1/pay/bnpl/eligibility", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        setEligibility(json.data);
      }
    } catch { /* ignore */ }
    setEvaluating(false);
  };

  const filtered = agreements.filter((a) => {
    if (activeTab === "active") return a.status === "active";
    if (activeTab === "completed") return a.status === "completed";
    return a.status === "overdue" || a.status === "defaulted";
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-blue-50 text-blue",
      completed: "bg-green-50 text-green-600",
      overdue: "bg-yellow-50 text-yellow-700",
      defaulted: "bg-red-50 text-red",
      cancelled: "bg-gray-100 text-gray-500",
    };
    return colors[status] || "bg-gray-100 text-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-kauvex-orange" size={32} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-bold text-2xl text-text-1 mb-6">Pay Later (BNPL)</h1>

      {/* Eligibility Card */}
      {eligibility && (
        <div className="bg-gradient-to-br from-[#0A1628] to-blue-900 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Your BNPL Status</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              eligibility.isEligible ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
            }`}>
              {eligibility.isEligible ? "Eligible" : "Not Eligible"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-white/60 text-xs mb-1">Available Limit</p>
              <p className="text-xl font-bold">₦{eligibility.availableLimit.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Used</p>
              <p className="text-xl font-bold">₦{eligibility.usedLimit.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs mb-1">Total Limit</p>
              <p className="text-xl font-bold">₦{eligibility.currentLimit.toLocaleString()}</p>
            </div>
          </div>
          {!eligibility.isEligible && (
            <button
              onClick={requestEvaluation}
              disabled={evaluating}
              className="mt-4 w-full h-9 bg-kauvex-orange hover:bg-kauvex-orange/90 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {evaluating ? "Evaluating..." : "Request Re-Evaluation"}
            </button>
          )}
          {eligibility.isEligible && (
            <Link
              href="/shop"
              className="mt-4 flex items-center justify-center gap-1 w-full h-9 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-lg transition-colors"
            >
              <ShoppingBag size={14} /> Start Shopping with Pay Later
            </Link>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-text-4 mb-1">Active Agreements</p>
          <p className="text-xl font-bold text-text-1">
            {agreements.filter((a) => a.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-text-4 mb-1">Total Outstanding</p>
          <p className="text-xl font-bold text-kauvex-orange">
            ₦{agreements.filter((a) => a.status === "active").reduce((s, a) => s + a.totalOutstanding, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-text-4 mb-1">Next Payment</p>
          <p className="text-xl font-bold text-text-1">-</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-text-4 mb-1">Completed</p>
          <p className="text-xl font-bold text-green-600">
            {agreements.filter((a) => a.status === "completed").length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 w-fit border border-border">
        {(["active", "completed", "overdue"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? "bg-kauvex-orange text-white" : "text-text-3 hover:bg-off-white"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Agreements List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <CreditCard size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-text-4">No {activeTab} agreements</p>
          </div>
        ) : (
          filtered.map((agreement) => (
            <a key={agreement.id} href={`/account/pay-later/${agreement.id}`}
              className="block bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-kauvex-orange/10 flex items-center justify-center">
                    <CreditCard size={20} className="text-kauvex-orange" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-1">Order #{agreement.orderId.slice(0, 8)}</p>
                    <p className="text-xs text-text-4 mt-1">
                      {agreement.installmentCount} installments of ₦{agreement.installmentAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(agreement.status)}`}>
                    {agreement.status}
                  </span>
                  <p className="text-sm font-semibold text-text-1 mt-2">
                    ₦{agreement.totalPaid.toLocaleString()} / ₦{agreement.totalAmount.toLocaleString()}
                  </p>
                </div>
                <ChevronRight size={16} className="text-text-4 ml-4" />
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-kauvex-orange rounded-full transition-all"
                    style={{ width: `${Math.min(100, (agreement.totalPaid / agreement.totalAmount) * 100)}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-text-4">
                    {Math.round((agreement.totalPaid / agreement.totalAmount) * 100)}% paid
                  </span>
                  <span className="text-[10px] text-text-4">
                    ₦{agreement.totalOutstanding.toLocaleString()} remaining
                  </span>
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      {/* How It Works */}
      {(!eligibility || agreements.length === 0) && (
        <div className="mt-8 bg-white rounded-2xl border border-border p-6">
          <h3 className="font-syne font-bold text-sm mb-4">How Pay Later Works</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 size={18} className="text-blue" />
              </div>
              <p className="text-[11px] font-semibold text-text-1 mb-1">1. Check Eligibility</p>
              <p className="text-[10px] text-text-4">Based on your account history and age</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <ShoppingBag size={18} className="text-blue" />
              </div>
              <p className="text-[11px] font-semibold text-text-1 mb-1">2. Shop</p>
              <p className="text-[10px] text-text-4">Select Pay Later at checkout</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <CreditCard size={18} className="text-blue" />
              </div>
              <p className="text-[11px] font-semibold text-text-1 mb-1">3. Pay 25% Today</p>
              <p className="text-[10px] text-text-4">Get your items immediately</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <Clock size={18} className="text-blue" />
              </div>
              <p className="text-[11px] font-semibold text-text-1 mb-1">4. 3 Weekly Payments</p>
              <p className="text-[10px] text-text-4">Auto-charged over 9 weeks</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <Shield size={12} className="text-text-4" />
            <span className="text-[10px] text-text-4">0% interest during promotional period · No hidden fees</span>
          </div>
        </div>
      )}
    </div>
  );
}
