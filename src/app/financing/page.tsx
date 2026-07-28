"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight, Loader2, AlertCircle, DollarSign,
  Calculator, CheckCircle, ArrowRight, Percent,
  Calendar, Building2, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Lender {
  id: string;
  name: string;
  type: string;
  rate: number;
  maxTerm: number;
  minAmount: number;
  maxAmount: number;
  monthlyPayment: number;
  features: string[];
  processingFee: number;
}

const sampleLenders: Lender[] = [
  { id: "1", name: "Kauvex Capital", type: "In-House", rate: 8.5, maxTerm: 60, minAmount: 5000, maxAmount: 500000, monthlyPayment: 2050, features: ["Same-day approval", "No collateral under $50K", "Flexible repayment"], processingFee: 1 },
  { id: "2", name: "FirstBank Equipment Finance", type: "Bank Partner", rate: 12.0, maxTerm: 48, minAmount: 10000, maxAmount: 1000000, monthlyPayment: 2633, features: ["Existing customer rates available", "Asset-backed lending", "Up to 80% financing"], processingFee: 1.5 },
  { id: "3", name: "Access Bank Asset Finance", type: "Bank Partner", rate: 14.5, maxTerm: 36, minAmount: 15000, maxAmount: 750000, monthlyPayment: 3439, features: ["Quick disbursement", "Insurance included", "Flexible tenure"], processingFee: 1 },
  { id: "4", name: "Lendigo Equipment Financing", type: "Fintech", rate: 18.0, maxTerm: 24, minAmount: 5000, maxAmount: 200000, monthlyPayment: 4995, features: ["Minimal documentation", "48-hour funding", "No early repayment fee"], processingFee: 2 },
  { id: "5", name: "Stanbic IBTC Asset Finance", type: "Bank Partner", rate: 11.0, maxTerm: 60, minAmount: 20000, maxAmount: 2000000, monthlyPayment: 2174, features: ["Diaspora financing available", "Foreign currency options", "Equipment insurance included"], processingFee: 1 },
];

const purposes = [
  "Equipment Purchase",
  "Fleet Expansion",
  "Marine Vessel Acquisition",
  "Industrial Machinery",
  "Agricultural Equipment",
  "ICT Infrastructure",
  "Power Generation",
];

export default function FinancingPage() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loanAmount, setLoanAmount] = useState("50000");
  const [term, setTerm] = useState("36");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    fetch("/api/v1/kpn/financing")
      .then((r) => { if (!r.ok) throw new Error("Failed to load financing options"); return r.json(); })
      .then((d) => setLenders(Array.isArray(d) ? d : d.data || sampleLenders))
      .catch(() => setLenders(sampleLenders))
      .finally(() => setLoading(false));
  }, []);

  const calculateMonthly = (principal: number, annualRate: number, months: number) => {
    const monthlyRate = annualRate / 100 / 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  };

  const amount = Number(loanAmount) || 50000;
  const termMonths = Number(term) || 36;

  const lendersWithPayment = lenders.map((l) => ({
    ...l,
    monthlyPayment: Math.round(calculateMonthly(amount, l.rate, Math.min(termMonths, l.maxTerm))),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Financing</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#0A1628] to-[#162040] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-2xl">
            <div className="w-14 h-14 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center mb-4">
              <DollarSign size={28} className="text-[#FF6B00]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Equipment & Asset Financing</h1>
            <p className="text-gray-300 text-lg">
              Get the capital you need to acquire industrial equipment, marine vessels, 
              and machinery with competitive rates from our network of lenders.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-md mb-8">
          <h2 className="font-bold text-[#0A1628] mb-4">Check Your Financing Options</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Loan Amount ($)</label>
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
              <label className="text-xs font-semibold text-gray-600 block mb-1">Term (Months)</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
              >
                {[12, 24, 36, 48, 60].map((t) => (
                  <option key={t} value={t}>{t} months ({t / 12}yr)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="">Select purpose</option>
                {purposes.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-[#FF6B00]" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : lendersWithPayment.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0A1628] mb-2">No Lenders Available</h3>
            <p className="text-sm text-gray-500">Check back later for financing options.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#0A1628] mb-2">Available Lenders</h2>
            <p className="text-sm text-gray-500 mb-4">
              Showing rates for <strong>${amount.toLocaleString()}</strong> over <strong>{termMonths} months</strong>
            </p>
            {lendersWithPayment.map((l) => (
              <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-[#0A1628]">{l.name}</h3>
                      <Badge variant={l.type === "In-House" ? "orange" : l.type === "Bank Partner" ? "navy" : "info"}>
                        {l.type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm">
                      <span className="text-[#FF6B00] font-bold text-xl">{l.rate}% APR</span>
                      <span className="text-gray-500">
                        <strong className="text-[#0A1628]">${l.monthlyPayment.toLocaleString()}</strong>/mo
                      </span>
                      <span className="text-gray-500">Up to {l.maxTerm} months</span>
                      <span className="text-gray-500">${l.minAmount.toLocaleString()} - ${l.maxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {l.features.map((f) => (
                        <span key={f} className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                          <CheckCircle size={10} className="text-green-500" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Button>
                      Apply Now <ArrowRight size={14} className="ml-2" />
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
