"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  Shield,
  Info,
} from "lucide-react";

interface Eligibility {
  isEligible: boolean;
  currentLimit: number;
  usedLimit: number;
  availableLimit: number;
  status: string;
  successfulRepayments?: number;
  missedPayments?: number;
  lastEvaluated?: string;
  suspendedReason?: string;
}

interface BnplQualificationProps {
  orderTotal?: number;
  compact?: boolean;
  onEligibilityChecked?: (eligible: boolean, availableLimit: number) => void;
}

export default function BnplQualification({ orderTotal, compact = false, onEligibilityChecked }: BnplQualificationProps) {
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { checkEligibility(); }, []);

  const checkEligibility = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/pay/bnpl/eligibility");
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        setEligibility(data);
        onEligibilityChecked?.(data?.isEligible || false, data?.availableLimit || 0);
      } else if (res.status === 401) {
        setError("Sign in to check your BNPL eligibility");
      } else {
        setError("Could not check eligibility. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const requestEvaluation = async () => {
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/v1/pay/bnpl/eligibility", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        setEligibility(json.data);
        onEligibilityChecked?.(json.data?.isEligible || false, json.data?.availableLimit || 0);
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "Evaluation failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setChecking(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3">
        <Loader2 className="animate-spin text-kauvex-orange" size={16} />
        <span className="text-xs text-text-4">Checking BNPL eligibility...</span>
      </div>
    );
  }

  if (error === "Sign in to check your BNPL eligibility") {
    return (
      <div className="bg-gradient-to-r from-[#0A1628] to-blue-900 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard size={16} className="text-kauvex-orange" />
          <span className="text-xs font-bold">Pay Later with BNPL</span>
        </div>
        <p className="text-[11px] text-white/70 mb-3">
          Split your purchase into 4 interest-free installments. Sign in to check eligibility.
        </p>
        <Link href="/auth/login" className="inline-flex items-center gap-1 text-[11px] font-semibold text-kauvex-orange hover:underline">
          Sign in to qualify <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-3">
        <p className="text-xs text-red-600">{error}</p>
        <button onClick={checkEligibility} className="text-[10px] text-red-500 hover:underline mt-1">Retry</button>
      </div>
    );
  }

  // Not yet evaluated — show qualification requirements
  if (eligibility?.status === "not_evaluated" || !eligibility) {
    return (
      <div className={`bg-gradient-to-br from-[#0A1628] to-blue-900 rounded-xl p-4 text-white ${compact ? "" : "p-5"}`}>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={18} className="text-kauvex-orange" />
          <h3 className="text-sm font-bold">Pay Later with BNPL</h3>
        </div>
        <p className="text-[11px] text-white/70 mb-4">
          Split any purchase into 4 interest-free installments over 9 weeks.
        </p>

        {!compact && (
          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" />
              <span className="text-[11px] text-white/80">Account at least 3 months old</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" />
              <span className="text-[11px] text-white/80">At least 2 completed orders</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" />
              <span className="text-[11px] text-white/80">No outstanding Kauvex debt</span>
            </div>
            <div className="flex items-start gap-2">
              <Info size={14} className="text-blue-300 mt-0.5 shrink-0" />
              <span className="text-[11px] text-white/80">Orders ≥ ₦50,000 require external credit check</span>
            </div>
          </div>
        )}

        <button
          onClick={requestEvaluation}
          disabled={checking}
          className="w-full h-9 bg-kauvex-orange hover:bg-kauvex-orange/90 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
        >
          {checking ? (
            <span className="flex items-center justify-center gap-1">
              <Loader2 className="animate-spin" size={14} /> Evaluating...
            </span>
          ) : (
            "Check My Eligibility"
          )}
        </button>

        <div className="flex items-center gap-1.5 mt-3">
          <Shield size={10} className="text-white/40" />
          <span className="text-[9px] text-white/40">Soft credit check — no impact on your score</span>
        </div>
      </div>
    );
  }

  // Suspended
  if (eligibility.status === "suspended") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <XCircle size={16} className="text-red" />
          <span className="text-xs font-bold text-red">BNPL Suspended</span>
        </div>
        <p className="text-[11px] text-red/70 mb-1">{eligibility.suspendedReason || "Your BNPL access has been suspended due to missed payments."}</p>
        <Link href="/account/pay-later" className="text-[10px] text-blue hover:underline">View agreements →</Link>
      </div>
    );
  }

  // Eligible or not eligible with limits
  return (
    <div className={`bg-gradient-to-br from-[#0A1628] to-blue-900 rounded-xl text-white ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-kauvex-orange" />
          <span className="text-xs font-bold">Pay Later</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
          eligibility.isEligible ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
        }`}>
          {eligibility.isEligible ? "Eligible" : "Not Eligible"}
        </span>
      </div>

      {eligibility.isEligible ? (
        <>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <p className="text-white/50 text-[10px]">Available</p>
              <p className="text-sm font-bold">₦{eligibility.availableLimit.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/50 text-[10px]">Used</p>
              <p className="text-sm font-bold">₦{eligibility.usedLimit.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/50 text-[10px]">Limit</p>
              <p className="text-sm font-bold">₦{eligibility.currentLimit.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-kauvex-orange rounded-full transition-all"
              style={{ width: `${eligibility.currentLimit > 0 ? (eligibility.usedLimit / eligibility.currentLimit) * 100 : 0}%` }}
            />
          </div>

          {orderTotal && orderTotal <= eligibility.availableLimit && (
            <div className="flex items-center gap-1.5 bg-green-500/10 rounded-lg p-2 mb-2">
              <CheckCircle2 size={12} className="text-green-400" />
              <span className="text-[10px] text-green-300">
                This order of ₦{orderTotal.toLocaleString()} is within your limit
              </span>
            </div>
          )}

          {orderTotal && orderTotal > eligibility.availableLimit && (
            <div className="flex items-center gap-1.5 bg-yellow-500/10 rounded-lg p-2 mb-2">
              <AlertTriangle size={12} className="text-yellow-400" />
              <span className="text-[10px] text-yellow-300">
                This order exceeds your available limit by ₦{(orderTotal - eligibility.availableLimit).toLocaleString()}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2 mb-3">
          <div className="flex items-start gap-2">
            <XCircle size={14} className="text-red-300 mt-0.5 shrink-0" />
            <span className="text-[11px] text-white/70">You don&apos;t currently qualify for BNPL</span>
          </div>
          <div className="flex items-start gap-2">
            <Clock size={14} className="text-white/40 mt-0.5 shrink-0" />
            <span className="text-[11px] text-white/50">Keep shopping to build your eligibility</span>
          </div>
        </div>
      )}

      <Link
        href="/account/pay-later"
        className="flex items-center justify-center gap-1 w-full h-8 bg-white/10 hover:bg-white/20 text-[11px] font-semibold rounded-lg transition-colors"
      >
        View Full Dashboard <ArrowRight size={12} />
      </Link>
    </div>
  );
}
