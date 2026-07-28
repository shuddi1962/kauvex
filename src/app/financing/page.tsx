"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight, Loader2, DollarSign, Calculator,
  CheckCircle, ArrowRight, Percent, Calendar,
  Building2, Star, Filter, SlidersHorizontal,
  TrendingUp, Clock, Shield, Banknote, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type LoanType = "equipment" | "project" | "working-capital" | "all";

interface Lender {
  id: string;
  name: string;
  logo: string;
  aprRange: string;
  aprLow: number;
  aprHigh: number;
  maxAmount: number;
  minAmount: number;
  repaymentPeriod: string;
  processingFee: string;
  rating: number;
  reviewCount: number;
  loanTypes: LoanType[];
  features: string[];
  approvalTime: string;
}

const lenders: Lender[] = [
  {
    id: "sterling", name: "Sterling Bank", logo: "SB",
    aprRange: "15% - 22%", aprLow: 15, aprHigh: 22,
    maxAmount: 50000000, minAmount: 50000,
    repaymentPeriod: "3 - 60 months",
    processingFee: "1%", rating: 4.6, reviewCount: 2847,
    loanTypes: ["equipment", "working-capital", "project"],
    features: ["Instant approval via mobile", "No collateral under ₦5M", "Flexible top-up option", "Moratorium available"],
    approvalTime: "24 hours"
  },
  {
    id: "access", name: "Access Bank", logo: "AB",
    aprRange: "16% - 24%", aprLow: 16, aprHigh: 24,
    maxAmount: 100000000, minAmount: 100000,
    repaymentPeriod: "6 - 60 months",
    processingFee: "1.5%", rating: 4.4, reviewCount: 3210,
    loanTypes: ["equipment", "project", "working-capital"],
    features: ["Asset-backed lending", "Insurance bundled", "Diaspora financing", "Foreign currency option"],
    approvalTime: "48 hours"
  },
  {
    id: "carbon", name: "Carbon", logo: "CA",
    aprRange: "5% - 29%", aprLow: 5, aprHigh: 29,
    maxAmount: 5000000, minAmount: 5000,
    repaymentPeriod: "1 - 24 months",
    processingFee: "0% - 3%", rating: 4.8, reviewCount: 45210,
    loanTypes: ["working-capital"],
    features: ["100% digital", "No collateral", "Credit score building", "Same-day disbursement"],
    approvalTime: "15 minutes"
  },
  {
    id: "fairmoney", name: "FairMoney", logo: "FM",
    aprRange: "10% - 30%", aprLow: 10, aprHigh: 30,
    maxAmount: 3000000, minAmount: 10000,
    repaymentPeriod: "1 - 12 months",
    processingFee: "2% - 5%", rating: 4.5, reviewCount: 38750,
    loanTypes: ["working-capital"],
    features: ["Quick mobile app", "Increasing limits", "Referral bonus", "Early repayment discount"],
    approvalTime: "5 minutes"
  },
  {
    id: "renmoney", name: "Renmoney", logo: "RM",
    aprRange: "18% - 26%", aprLow: 18, aprHigh: 26,
    maxAmount: 8000000, minAmount: 30000,
    repaymentPeriod: "3 - 24 months",
    processingFee: "1% - 2%", rating: 4.3, reviewCount: 18320,
    loanTypes: ["equipment", "working-capital"],
    features: ["Secured & unsecured options", "Business expansion loans", "Flexible tenor", "Branches nationwide"],
    approvalTime: "24 hours"
  },
  {
    id: "branch", name: "Branch", logo: "BR",
    aprRange: "15% - 34%", aprLow: 15, aprHigh: 34,
    maxAmount: 2000000, minAmount: 5000,
    repaymentPeriod: "1 - 18 months",
    processingFee: "1% - 7.5%", rating: 4.2, reviewCount: 52340,
    loanTypes: ["working-capital"],
    features: ["Android & iOS app", "No paperwork", "Flexible repayment dates", "Cashback rewards"],
    approvalTime: "5 minutes"
  },
  {
    id: "firstbank", name: "FirstBank", logo: "FB",
    aprRange: "14% - 21%", aprLow: 14, aprHigh: 21,
    maxAmount: 150000000, minAmount: 200000,
    repaymentPeriod: "6 - 84 months",
    processingFee: "1%", rating: 4.5, reviewCount: 5610,
    loanTypes: ["equipment", "project"],
    features: ["Long tenure up to 7 years", "Equipment leasing option", "Existing customer rates", "SME专属 support"],
    approvalTime: "72 hours"
  },
  {
    id: "uba", name: "UBA", logo: "UB",
    aprRange: "15% - 23%", aprLow: 15, aprHigh: 23,
    maxAmount: 75000000, minAmount: 100000,
    repaymentPeriod: "3 - 60 months",
    processingFee: "1.5%", rating: 4.1, reviewCount: 4230,
    loanTypes: ["equipment", "project", "working-capital"],
    features: ["Pan-African coverage", "Trade finance add-on", "Group lending available", "Digital application"],
    approvalTime: "48 hours"
  },
];

const loanTypeLabels: Record<LoanType, string> = {
  "all": "All Types",
  "equipment": "Equipment Finance",
  "project": "Project Finance",
  "working-capital": "Working Capital",
};

export default function FinancingPage() {
  const [loading, setLoading] = useState(true);
  const [loanType, setLoanType] = useState<LoanType>("all");
  const [loanAmount, setLoanAmount] = useState("500000");
  const [term, setTerm] = useState("12");
  const [sortBy, setSortBy] = useState<"rating" | "apr-low" | "apr-high">("rating");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const calculateMonthly = (principal: number, annualRate: number, months: number) => {
    const mr = annualRate / 100 / 12;
    return (principal * mr * Math.pow(1 + mr, months)) / (Math.pow(1 + mr, months) - 1);
  };

  const amount = Number(loanAmount) || 500000;
  const termMonths = Number(term) || 12;

  const filteredLenders = useMemo(() => {
    let list = lenders.filter((l) => {
      if (loanType !== "all" && !l.loanTypes.includes(loanType)) return false;
      if (searchQuery && !l.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (amount < l.minAmount || amount > l.maxAmount) return false;
      return true;
    });
    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "apr-low") list.sort((a, b) => a.aprLow - b.aprLow);
    if (sortBy === "apr-high") list.sort((a, b) => a.aprHigh - b.aprHigh);
    return list;
  }, [loanType, searchQuery, amount, sortBy]);

  const bestRate = useMemo(() => {
    if (filteredLenders.length === 0) return null;
    return filteredLenders.reduce((a, b) => a.aprLow < b.aprLow ? a : b);
  }, [filteredLenders]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Financing Marketplace</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#0A1628] to-[#162040] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-3xl">
            <div className="w-14 h-14 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center mb-4">
              <Banknote size={28} className="text-[#FF6B00]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Financing Marketplace</h1>
            <p className="text-gray-300 text-lg">
              Compare rates from Nigeria&apos;s leading banks and fintech lenders.
              Find the best financing for equipment, projects, and working capital.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-md mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="font-bold text-[#0A1628] flex items-center gap-2">
              <Calculator size={18} className="text-[#FF6B00]" /> Loan Calculator
            </h2>
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="text-sm text-[#FF6B00] font-medium hover:underline"
            >
              {showCalculator ? "Hide Details" : "Show Details"}
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">I want to borrow</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full h-11 pl-8 pr-3 rounded-lg border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Repayment period</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
              >
                {[3, 6, 12, 18, 24, 36, 48, 60].map((t) => (
                  <option key={t} value={t}>{t} months {t >= 12 ? `(${t / 12}yr)` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Loan type</label>
              <div className="flex gap-1">
                {(Object.entries(loanTypeLabels) as [LoanType, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setLoanType(key)}
                    className={`flex-1 h-11 px-2 rounded-lg text-xs font-medium transition-all ${
                      loanType === key ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Search lender</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-11 pl-8 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>
          </div>

          {showCalculator && (
            <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-3">
                Estimated monthly payments across lenders for <strong>₦{amount.toLocaleString()}</strong> over <strong>{termMonths} months</strong>
              </p>
              <div className="space-y-2">
                {filteredLenders.slice(0, 6).map((l) => {
                  const avgRate = (l.aprLow + l.aprHigh) / 2;
                  const monthly = Math.round(calculateMonthly(amount, avgRate, termMonths));
                  const totalRepayment = monthly * termMonths;
                  const totalInterest = totalRepayment - amount;
                  return (
                    <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0A1628] text-white flex items-center justify-center text-xs font-bold">
                          {l.logo}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#0A1628]">{l.name}</p>
                          <p className="text-xs text-gray-400">{l.aprRange} APR</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#FF6B00]">₦{monthly.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/mo</span></p>
                        <p className="text-[10px] text-gray-400">₦{totalInterest.toLocaleString()} interest</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0A1628]">
              {loanType === "all" ? "All Lenders" : loanTypeLabels[loanType]}
            </h2>
            <p className="text-sm text-gray-400">
              {filteredLenders.length} lender{filteredLenders.length !== 1 ? "s" : ""} available
              {amount >= 5000 && ` for ₦${amount.toLocaleString()}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Sort:</span>
            {(["rating", "apr-low", "apr-high"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sortBy === s ? "bg-[#0A1628] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {s === "rating" ? "Rating" : s === "apr-low" ? "Lowest APR" : "Highest APR"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#FF6B00]" />
          </div>
        ) : filteredLenders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0A1628] mb-2">No Lenders Match Your Criteria</h3>
            <p className="text-sm text-gray-500 mb-4">Try adjusting your loan amount or type.</p>
            <Button variant="outline" onClick={() => { setLoanAmount("500000"); setLoanType("all"); setSearchQuery(""); }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 rounded-xl">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold rounded-l-xl">Lender</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-semibold">APR Range</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-semibold">Max Amount</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-semibold">Repayment</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-semibold">Processing Fee</th>
                  <th className="text-center py-3 px-3 text-gray-600 font-semibold">Rating</th>
                  <th className="text-right py-3 px-4 rounded-r-xl"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLenders.map((l) => {
                  const avgRate = (l.aprLow + l.aprHigh) / 2;
                  const monthly = Math.round(calculateMonthly(amount, avgRate, termMonths));
                  const isBestRate = bestRate?.id === l.id;
                  return (
                    <tr key={l.id} className="border-b border-gray-100 hover:bg-white transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0A1628] text-white flex items-center justify-center text-sm font-bold">
                            {l.logo}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#0A1628]">{l.name}</span>
                              {isBestRate && <Badge variant="orange">Best Rate</Badge>}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {l.loanTypes.map((lt) => (
                                <span key={lt} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                  {loanTypeLabels[lt]}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className="font-bold text-[#FF6B00]">{l.aprRange}</span>
                      </td>
                      <td className="py-4 px-3 text-center font-medium text-[#0A1628]">
                        ₦{(l.maxAmount / 1000000).toFixed(0)}M
                      </td>
                      <td className="py-4 px-3 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar size={12} />
                          {l.repaymentPeriod}
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center text-gray-500">
                        {l.processingFee}
                      </td>
                      <td className="py-4 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{l.rating}</span>
                          <span className="text-gray-400 text-[10px]">({l.reviewCount.toLocaleString()})</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center gap-3 justify-end">
                          <div className="text-right hidden lg:block">
                            <p className="text-xs text-gray-400">Est. monthly</p>
                            <p className="text-sm font-bold text-[#0A1628]">₦{monthly.toLocaleString()}</p>
                          </div>
                          <Button size="sm">
                            Apply <ArrowRight size={14} className="ml-1" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <TrendingUp size={22} className="text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0A1628]]">₦0</p>
              <p className="text-xs text-gray-500">Application fee</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Clock size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0A1628]">5 min</p>
              <p className="text-xs text-gray-500">Average application time</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <Shield size={22} className="text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0A1628]">100%</p>
              <p className="text-xs text-gray-500">Secure & encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
