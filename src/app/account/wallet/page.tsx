"use client";

import { useState, useEffect } from "react";
import {
  Wallet, ArrowUpRight, ArrowDownLeft, Plus, CreditCard,
  History, ChevronRight, Shield, Settings, Download,
  Building2, Smartphone, Loader2, Check, AlertTriangle, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrencyStore } from "@/store/currency-store";

interface WalletData {
  id: string;
  balance: number;
  pendingBalance: number;
  availableBalance: number;
  currency: string;
  status: string;
  hasPin: boolean;
  dailySpendLimit: number;
  dailyWithdrawalLimit: number;
}

interface Transaction {
  id: string;
  transactionType: string;
  amount: number;
  direction: string;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  referenceType: string | null;
  status: string;
  createdAt: string;
}

export default function KauvexPayWalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupMethod, setTopupMethod] = useState<"card" | "bank_transfer" | "ussd">("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const { formatPrice } = useCurrencyStore();

  useEffect(() => { loadWallet(); }, []);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/pay/wallet/topup");
      if (res.ok) {
        const json = await res.json();
        setWallet(json.data);
      }
    } catch { /* ignore */ }
    try {
      const txnRes = await fetch("/api/v1/pay/wallet/topup");
      if (txnRes.ok) {
        const json = await txnRes.json();
        setTransactions(json.data?.transactions || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount < 500) return;
    setProcessing(true);
    setError("");
    try {
      const res = await fetch("/api/v1/pay/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method: topupMethod }),
      });
      if (res.ok) {
        setSuccess(`₦${amount.toLocaleString()} added to wallet!`);
        setTopupAmount("");
        loadWallet();
        setTimeout(() => { setShowTopup(false); setSuccess(""); }, 2000);
      } else {
        const err = await res.json();
        setError(err.error || "Top-up failed");
      }
    } catch {
      setError("Network error");
    }
    setProcessing(false);
  };

  const quickAmounts = [500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
  const filteredTxns = transactions.filter((t) => {
    if (filter === "all") return true;
    if (filter === "credits") return t.direction === "credit";
    if (filter === "debits") return t.direction === "debit";
    return t.transactionType === filter;
  });

  const getTxnIcon = (type: string, direction: string) => {
    if (direction === "credit") return <ArrowDownLeft size={16} className="text-green-600" />;
    if (type === "withdrawal") return <ArrowUpRight size={16} className="text-gray-500" />;
    return <ArrowUpRight size={16} className="text-red" />;
  };

  const getTxnColor = (type: string) => {
    const colors: Record<string, string> = {
      top_up: "bg-green-50",
      refund: "bg-blue-50",
      cashback: "bg-purple-50",
      loyalty_conversion: "bg-orange-50",
      purchase: "bg-red-50",
      withdrawal: "bg-gray-100",
      bnpl_charge: "bg-yellow-50",
      ad_spend: "bg-pink-50",
      fbk_fee: "bg-red-50",
      transfer: "bg-indigo-50",
    };
    return colors[type] || "bg-gray-50";
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
      <h1 className="font-bold text-2xl text-text-1 mb-6">Kauvex Pay Wallet</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#0A1628] via-blue-900 to-blue-800 rounded-2xl p-6 md:p-8 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm mb-1">Available Balance</p>
            <h2 className="font-bold text-3xl md:text-4xl">
              {wallet ? `₦${wallet.balance.toLocaleString()}` : "₦0"}
            </h2>
            {wallet && wallet.pendingBalance > 0 && (
              <p className="text-white/40 text-sm mt-1">
                ₦{wallet.pendingBalance.toLocaleString()} pending
              </p>
            )}
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
            <Wallet size={28} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={() => { setShowTopup(!showTopup); setShowWithdraw(false); setSuccess(""); setError(""); }}
            className="bg-white text-[#0A1628] hover:bg-white/90 gap-2">
            <Plus size={16} /> Top Up
          </Button>
          <Button onClick={() => { setShowWithdraw(!showWithdraw); setShowTopup(false); setSuccess(""); setError(""); }}
            className="bg-white/10 border border-white/20 text-white hover:bg-white/20 gap-2">
            <ArrowUpRight size={16} /> Withdraw
          </Button>
          <Button className="bg-white/10 border border-white/20 text-white hover:bg-white/20 gap-2">
            <CreditCard size={16} /> Pay
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-text-4 mb-1">Spent This Month</p>
          <p className="text-lg font-bold text-text-1">₦0</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-text-4 mb-1">Cashback Earned</p>
          <p className="text-lg font-bold text-green-600">₦0</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-text-4 mb-1">Total Saved</p>
          <p className="text-lg font-bold text-kauvex-orange">₦0</p>
        </div>
      </div>

      {/* Top-up Panel */}
      {showTopup && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-text-1">Top Up Wallet</h3>
            <button onClick={() => setShowTopup(false)} className="p-1 hover:bg-gray-100 rounded">
              <X size={16} />
            </button>
          </div>

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4">
              <Check size={16} /> {success}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {/* Method Selection */}
          <div className="flex gap-2 mb-4">
            {[
              { value: "card" as const, label: "Card", icon: CreditCard },
              { value: "bank_transfer" as const, label: "Bank Transfer", icon: Building2 },
              { value: "ussd" as const, label: "USSD", icon: Smartphone },
            ].map((m) => (
              <button key={m.value} onClick={() => setTopupMethod(m.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  topupMethod === m.value
                    ? "bg-[#0A1628] text-white border-[#0A1628]"
                    : "bg-white text-text-2 border-border hover:border-[#0A1628]"
                }`}>
                <m.icon size={16} /> {m.label}
              </button>
            ))}
          </div>

          {/* Quick Amounts */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {quickAmounts.map((amt) => (
              <button key={amt} onClick={() => setTopupAmount(String(amt))}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  topupAmount === String(amt)
                    ? "bg-kauvex-orange text-white border-kauvex-orange"
                    : "bg-off-white text-text-2 border-border hover:border-kauvex-orange"
                }`}>
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input type="number" placeholder="Or enter custom amount (min ₦500)" value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              className="flex-1 h-11 px-4 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/20 focus:border-kauvex-orange" />
            <Button variant="cta" className="px-8" onClick={handleTopup}
              disabled={processing || !topupAmount || parseFloat(topupAmount) < 500}>
              {processing ? "Processing..." : "Top Up"}
            </Button>
          </div>

          {topupMethod === "bank_transfer" && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <p className="font-medium mb-1">Your Dedicated Account Number</p>
              <p className="text-lg font-mono font-bold"> generating...</p>
              <p className="text-xs text-blue-600 mt-1">Transfer any amount to this account. Wallet credited automatically.</p>
            </div>
          )}

          {topupMethod === "ussd" && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg text-sm text-purple-800">
              <p className="font-medium mb-1">USSD Code</p>
              <p className="text-lg font-mono font-bold">*xxx*{topupAmount || "amount"}#</p>
              <p className="text-xs text-purple-600 mt-1">Dial on any phone. Works without internet.</p>
            </div>
          )}
        </div>
      )}

      {/* Withdraw Panel */}
      {showWithdraw && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-text-1">Withdraw to Bank</h3>
            <button onClick={() => setShowWithdraw(false)} className="p-1 hover:bg-gray-100 rounded">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-text-3 mb-1 block">Amount</label>
              <input type="number" placeholder="Min ₦1,000" className="w-full h-11 px-4 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-text-3 mb-1 block">Bank Account</label>
              <select className="w-full h-11 px-4 rounded-lg border border-border text-sm bg-white">
                <option>Select bank account</option>
              </select>
            </div>
            <p className="text-xs text-text-4">
              Below ₦50,000: instant. Above ₦50,000: within 24 hours.
              {wallet?.dailyWithdrawalLimit && ` Daily limit: ₦${wallet.dailyWithdrawalLimit.toLocaleString()}`}
            </p>
            <Button variant="cta" className="w-full">Withdraw</Button>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-lg text-text-1 flex items-center gap-2">
            <History size={18} /> Transaction History
          </h3>
          <div className="flex gap-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-border rounded-lg px-3 py-1.5 text-text-3">
              <option value="all">All Transactions</option>
              <option value="credits">Credits</option>
              <option value="debits">Debits</option>
              <option value="top_up">Top-ups</option>
              <option value="cashback">Cashback</option>
              <option value="refund">Refunds</option>
              <option value="withdrawal">Withdrawals</option>
            </select>
            <button className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-off-white">
              <Download size={14} /> Export
            </button>
          </div>
        </div>
        <div className="divide-y divide-border">
          {filteredTxns.length === 0 ? (
            <div className="text-center py-12">
              <Wallet size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-text-4">No transactions yet</p>
              <p className="text-xs text-text-4 mt-1">Top up your wallet to get started</p>
            </div>
          ) : (
            filteredTxns.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-off-white transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTxnColor(tx.transactionType)}`}>
                  {getTxnIcon(tx.transactionType, tx.direction)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-1">{tx.description || tx.transactionType}</p>
                  <p className="text-xs text-text-4">{tx.referenceType || "-"} · {new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.direction === "credit" ? "text-green-600" : "text-red"}`}>
                    {tx.direction === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-text-4">Bal: ₦{tx.balanceAfter.toLocaleString()}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  tx.status === "completed" ? "bg-green-50 text-green-600" : tx.status === "pending" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red"
                }`}>
                  {tx.status}
                </span>
                <ChevronRight size={14} className="text-text-4" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Security Settings */}
      <div className="mt-6 bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-lg text-text-1 flex items-center gap-2 mb-4">
          <Shield size={18} /> Wallet Security
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-off-white rounded-lg">
            <p className="text-sm font-medium text-text-1">PIN Protection</p>
            <p className="text-xs text-text-4 mt-1">{wallet?.hasPin ? "Enabled" : "Not set"}</p>
            <button className="mt-2 text-xs text-kauvex-orange font-medium hover:underline">
              {wallet?.hasPin ? "Change PIN" : "Set PIN"}
            </button>
          </div>
          <div className="p-4 bg-off-white rounded-lg">
            <p className="text-sm font-medium text-text-1">Spending Limit</p>
            <p className="text-xs text-text-4 mt-1">₦{wallet?.dailySpendLimit?.toLocaleString() || "500,000"}/day</p>
            <button className="mt-2 text-xs text-kauvex-orange font-medium hover:underline">Adjust</button>
          </div>
        </div>
      </div>
    </div>
  );
}
