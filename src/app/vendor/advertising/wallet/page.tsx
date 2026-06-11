"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Wallet, Plus, ArrowDownRight, ArrowUpRight, CreditCard,
  Banknote, Smartphone, ToggleLeft, ToggleRight, Calendar,
  DollarSign, TrendingUp, ArrowLeft, Loader2, Check,
  AlertCircle,
} from "lucide-react";

const paymentMethods = [
  { value: "card", label: "Debit/Credit Card", icon: CreditCard, desc: "Instant deposit via card payment" },
  { value: "bank", label: "Bank Transfer", icon: Banknote, desc: "Manual transfer — may take 1-2 hours" },
  { value: "wallet", label: "Platform Wallet", icon: Wallet, desc: "Use your KAUVEX earnings balance" },
  { value: "ussd", label: "USSD", icon: Smartphone, desc: "Pay via USSD code on your phone" },
];

const demoTransactions = [
  { id: "TXN-001", type: "deposit", amount: 200000, method: "Card Payment", status: "completed", date: "2026-03-15 10:30 AM", reference: "REF-20260315-001" },
  { id: "TXN-002", type: "deposit", amount: 50000, method: "Bank Transfer", status: "completed", date: "2026-03-10 02:15 PM", reference: "REF-20260310-002" },
  { id: "TXN-003", type: "spend", amount: 43200, method: "Ad Campaign", status: "completed", date: "2026-03-08 08:00 AM", reference: "CAMP-001" },
  { id: "TXN-004", type: "spend", amount: 28000, method: "Ad Campaign", status: "completed", date: "2026-03-07 08:00 AM", reference: "CAMP-003" },
  { id: "TXN-005", type: "deposit", amount: 150000, method: "Card Payment", status: "completed", date: "2026-03-01 11:45 AM", reference: "REF-20260301-005" },
  { id: "TXN-006", type: "spend", amount: 15600, method: "Ad Campaign", status: "completed", date: "2026-02-28 08:00 AM", reference: "CAMP-001" },
  { id: "TXN-007", type: "spend", amount: 34000, method: "Ad Campaign", status: "completed", date: "2026-02-25 08:00 AM", reference: "CAMP-003" },
  { id: "TXN-008", type: "deposit", amount: 300000, method: "Bank Transfer", status: "pending", date: "2026-03-16 09:00 AM", reference: "REF-20260316-008" },
  { id: "TXN-009", type: "refund", amount: 5000, method: "Credit Adjustment", status: "completed", date: "2026-02-20 12:00 PM", reference: "ADJ-20260220-001" },
];

const topUpAmounts = [50000, 100000, 200000, 500000, 1000000];

export default function VendorAdWalletPage() {
  const [balance] = useState(284800);
  const [autoRecharge, setAutoRecharge] = useState(false);
  const [autoThreshold, setAutoThreshold] = useState(50000);
  const [autoAmount, setAutoAmount] = useState(200000);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(50000);
  const [topUpMethod, setTopUpMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<"all" | "deposit" | "spend">("all");

  const formatNaira = (n: number) => `₦${n.toLocaleString()}`;

  const filteredTransactions = demoTransactions.filter((t) => filter === "all" || t.type === filter);

  const handleTopUp = async () => {
    if (topUpAmount < 1000) { alert("Minimum top-up is ₦1,000"); return; }
    setProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      alert(`₦${topUpAmount.toLocaleString()} deposit initiated via ${topUpMethod}. It will reflect shortly.`);
      setShowTopUp(false);
      setTopUpAmount(50000);
    } catch {
      alert("Top-up failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/vendor/advertising" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={18} className="text-text-3" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-text-1">Ad Wallet</h1>
              <p className="text-sm text-text-4">Manage your advertising budget and transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wallet size={18} className="text-white/70" />
                <span className="text-sm text-white/70">Available Ad Balance</span>
              </div>
              <p className="text-4xl font-bold tracking-tight mt-1">{formatNaira(balance)}</p>
              <p className="text-sm text-white/70 mt-1">Total spent this month: ₦84,800</p>
            </div>
            <Button onClick={() => setShowTopUp(!showTopUp)} className="bg-white text-blue hover:bg-white/90 font-semibold">
              <Plus size={16} className="mr-1" /> Top Up
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-white/70">
            <div className="flex items-center gap-1"><TrendingUp size={14} /> Daily avg: ₦9,422</div>
            <div className="flex items-center gap-1"><Calendar size={14} /> Budget remaining: 3 days</div>
          </div>
        </div>

        {/* Top Up Form */}
        {showTopUp && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-sm mb-1">Top Up Your Wallet</h3>
            <p className="text-xs text-text-4 mb-4">Add funds to your advertising wallet</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-medium text-text-2 block mb-2">Select Amount</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {topUpAmounts.map((amt) => (
                    <button key={amt} onClick={() => setTopUpAmount(amt)} className={`p-3 rounded-lg border text-center transition-all ${
                      topUpAmount === amt ? "border-blue bg-blue-50 text-blue" : "border-gray-200 hover:border-gray-300 text-text-2"
                    }`}>
                      <p className="text-sm font-semibold">{formatNaira(amt)}</p>
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-text-4 block mb-1">Custom Amount</label>
                  <input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(Number(e.target.value))} min={1000} step={1000} className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-2 block mb-2">Payment Method</label>
                <div className="space-y-2">
                  {paymentMethods.map((pm) => {
                    const Icon = pm.icon;
                    return (
                      <button key={pm.value} onClick={() => setTopUpMethod(pm.value)} className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${
                        topUpMethod === pm.value ? "border-blue bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      }`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          topUpMethod === pm.value ? "bg-blue text-white" : "bg-gray-100 text-text-4"
                        }`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-1">{pm.label}</p>
                          <p className="text-[10px] text-text-4">{pm.desc}</p>
                        </div>
                        {topUpMethod === pm.value && <Check size={14} className="text-blue shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-text-4">You will be charged</p>
                <p className="text-lg font-bold text-text-1">{formatNaira(topUpAmount)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowTopUp(false)}>Cancel</Button>
                <Button onClick={handleTopUp} disabled={processing}>
                  {processing ? <Loader2 size={16} className="animate-spin mr-1" /> : <Plus size={16} className="mr-1" />}
                  {processing ? "Processing..." : "Add Funds"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Auto Recharge */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2"><TrendingUp size={15} /> Auto-Recharge</h3>
              <p className="text-xs text-text-4">Automatically top up when balance drops below threshold</p>
            </div>
            <button onClick={() => setAutoRecharge(!autoRecharge)}>
              {autoRecharge ? <ToggleRight size={28} className="text-green-600" /> : <ToggleLeft size={28} className="text-text-4" />}
            </button>
          </div>
          {autoRecharge && (
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
              <div>
                <label className="text-xs font-medium text-text-2 block mb-1">Min Balance Threshold</label>
                <input type="number" value={autoThreshold} onChange={(e) => setAutoThreshold(Number(e.target.value))} className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                <p className="text-[10px] text-text-4 mt-1">Auto-recharge when balance falls below this amount</p>
              </div>
              <div>
                <label className="text-xs font-medium text-text-2 block mb-1">Recharge Amount</label>
                <input type="number" value={autoAmount} onChange={(e) => setAutoAmount(Number(e.target.value))} className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                <p className="text-[10px] text-text-4 mt-1">Amount to add each time auto-recharge triggers</p>
              </div>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-text-4" />
              <h3 className="font-semibold text-sm">Transaction History</h3>
            </div>
            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
              {(["all", "deposit", "spend"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs rounded-md capitalize transition-colors ${filter === f ? "bg-white text-text-1 font-medium shadow-sm" : "text-text-4 hover:text-text-2"}`}>{f}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Reference</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Method</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-text-2">{tx.date}</td>
                    <td className="px-4 py-3 text-sm font-mono text-text-2">{tx.reference}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {tx.type === "deposit" ? (
                          <ArrowDownRight size={14} className="text-green-600" />
                        ) : tx.type === "spend" ? (
                          <ArrowUpRight size={14} className="text-red" />
                        ) : (
                          <ArrowDownRight size={14} className="text-blue" />
                        )}
                        <span className="text-sm capitalize text-text-2">{tx.type === "spend" ? "Ad Spend" : tx.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-2">{tx.method}</td>
                    <td className={`px-4 py-3 text-sm font-semibold text-right ${tx.type === "deposit" || tx.type === "refund" ? "text-green-600" : "text-red"}`}>
                      {tx.type === "deposit" || tx.type === "refund" ? "+" : "-"}{formatNaira(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        tx.status === "completed" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Wallet size={32} className="text-text-4/30 mx-auto mb-2" />
                      <p className="text-sm text-text-4">No transactions found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
