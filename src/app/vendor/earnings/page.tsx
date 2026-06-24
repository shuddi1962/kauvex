"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DollarSign, TrendingUp, Wallet, ArrowUpRight, History, CreditCard, Loader2, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

export default function VendorEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [pendingPayout, setPendingPayout] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [requestAmount, setRequestAmount] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const walletRes = await fetch("/api/v1/wallet/my");
      if (walletRes.ok) {
        const json = await walletRes.json();
        setWalletBalance(json.data?.balance || 0);

        const txns = json.data?.transactions || [];
        setTransactions(txns);

        const creditTxns = txns.filter((t: any) => t.type === "credit" || t.type === "deposit" || t.type === "sale_credit" || t.type === "commission");
        const debitTxns = txns.filter((t: any) => t.type === "debit" || t.type === "withdrawal");
        setTotalEarnings(creditTxns.reduce((s: number, t: any) => s + t.amount, 0));
        setTotalPayouts(debitTxns.reduce((s: number, t: any) => s + t.amount, 0));

        const pendingTxns = txns.filter((t: any) => t.type === "withdrawal" && t.status === "pending");
        setPendingPayout(pendingTxns.reduce((s: number, t: any) => s + t.amount, 0));
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(requestAmount);
    if (!amount || amount <= 0) return;
    setRequesting(true);
    setRequestError("");
    try {
      const res = await fetch("/api/v1/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method: "bank_transfer", accountDetails: {} }),
      });
      if (res.ok) {
        setRequestSuccess(true);
        setRequestAmount("");
        loadData();
        setTimeout(() => setRequestSuccess(false), 3000);
      } else {
        const err = await res.json();
        setRequestError(err.error || "Withdrawal failed");
      }
    } catch {
      setRequestError("Network error");
    }
    setRequesting(false);
  };

  if (loading) {
    return (
      <VendorShell title="Earnings" subtitle="Track your revenue and payouts">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-purple-600" size={32} /></div>
      </VendorShell>
    );
  }

  return (
    <VendorShell title="Earnings" subtitle="Track your revenue and manage payouts">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Wallet Balance", value: `$${walletBalance.toFixed(2)}`, icon: Wallet, color: "text-purple-600", sub: "Available for withdrawal" },
            { label: "Total Earnings", value: `$${totalEarnings.toFixed(2)}`, icon: TrendingUp, color: "text-green-600", sub: "All-time revenue" },
            { label: "Total Withdrawn", value: `$${totalPayouts.toFixed(2)}`, icon: ArrowUpRight, color: "text-blue-600", sub: "Paid out to bank" },
            { label: "Pending Payout", value: `$${pendingPayout.toFixed(2)}`, icon: History, color: "text-amber-600", sub: "Awaiting processing" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className={s.color} />
                  <span className="text-xs text-gray-500">{s.label}</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Wallet + Withdraw Card */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Wallet Summary */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-900 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={18} />
              <h3 className="font-bold text-sm">Wallet</h3>
            </div>
            <p className="text-2xl font-bold mb-1">${walletBalance.toFixed(2)}</p>
            <p className="text-[11px] text-purple-200 mb-4">Available balance</p>
            <Link href="/vendor/wallet">
              <Button size="sm" className="bg-white text-purple-700 hover:bg-purple-50">
                <CreditCard size={14} className="mr-1" /> Manage Wallet
              </Button>
            </Link>
          </div>

          {/* Withdraw Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
              <ArrowUpRight size={16} className="text-purple-600" /> Request Withdrawal
            </h3>
            {requestSuccess ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                <Check size={16} /> Withdrawal request submitted! It will be processed within 1-3 business days.
              </div>
            ) : (
              <div className="space-y-3">
                {requestError && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
                    <AlertTriangle size={12} /> {requestError}
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Amount to Withdraw</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" value={requestAmount} onChange={e => setRequestAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                      placeholder="0.00" min="1" max={walletBalance} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Max: ${walletBalance.toFixed(2)}</p>
                </div>
                <Button onClick={handleWithdraw} disabled={requesting || !requestAmount || parseFloat(requestAmount) <= 0 || parseFloat(requestAmount) > walletBalance}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  {requesting ? "Processing..." : `Withdraw $${parseFloat(requestAmount || "0").toFixed(2)}`}
                </Button>
                <p className="text-[9px] text-gray-400 text-center">Withdrawals are processed within 1-3 business days</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <History size={16} className="text-purple-600" /> Recent Activity
            </h3>
            <Link href="/vendor/wallet" className="text-[10px] text-purple-600 hover:underline">
              View All
            </Link>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign size={32} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No transactions yet</p>
              <p className="text-xs text-gray-300 mt-1">Your earnings and payouts will appear here</p>
            </div>
          ) : (
            <div className="space-y-1">
              {transactions.slice(0, 10).map((txn: any) => {
                const isCredit = txn.type === "credit" || txn.type === "deposit";
                return (
                  <div key={txn.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCredit ? "bg-green-100" : "bg-red-100"}`}>
                        {isCredit ? <TrendingUp size={14} className="text-green-600" /> : <ArrowUpRight size={14} className="text-red-600" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">{txn.description || txn.referenceType || txn.type}</p>
                        <p className="text-[10px] text-gray-400">{new Date(txn.createdAt).toLocaleDateString()} · {txn.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${isCredit ? "text-green-600" : "text-red-600"}`}>
                        {isCredit ? "+" : "-"}${txn.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Commission Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-blue-800">
            <strong>Commission Rate:</strong> 12% on all sales. Earnings are credited to your wallet automatically
            after each completed order. Withdrawals are processed via bank transfer within 1-3 business days.
          </p>
        </div>
      </div>
    </VendorShell>
  );
}
