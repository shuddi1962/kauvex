"use client";

import { useState, useEffect } from "react";
import { Wallet, ArrowUpRight, ArrowDownRight, Plus, CreditCard, Landmark, History, DollarSign, Check, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string | null;
  description: string | null;
  status: string;
  createdAt: string;
}

export default function VendorWalletPage() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("bank_transfer");
  const [depositing, setDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadWallet(); }, []);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/wallet/my");
      if (res.ok) {
        const json = await res.json();
        setBalance(json.data?.balance || 0);
        setTransactions(json.data?.transactions || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return;
    setDepositing(true);
    setError("");
    try {
      const res = await fetch("/api/v1/wallet/my", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, paymentMethod: depositMethod }),
      });
      if (res.ok) {
        setDepositSuccess(true);
        setDepositAmount("");
        loadWallet();
        setTimeout(() => { setShowDeposit(false); setDepositSuccess(false); }, 2000);
      } else {
        const err = await res.json();
        setError(err.error || "Deposit failed");
      }
    } catch {
      setError("Network error");
    }
    setDepositing(false);
  };

  const presetAmounts = [50, 100, 250, 500, 1000];

  if (loading) {
    return (
      <VendorShell title="Wallet" subtitle="Manage your account balance">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      </VendorShell>
    );
  }

  return (
    <VendorShell title="Wallet" subtitle="Manage your account balance & transactions">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-900 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet size={20} />
              <span className="text-sm font-semibold text-purple-200">Available Balance</span>
            </div>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">Vendor Wallet</span>
          </div>
          <p className="text-3xl font-bold mb-1">${balance.toFixed(2)}</p>
          <p className="text-[11px] text-purple-200">USD</p>
          <div className="flex gap-2 mt-6">
            <Button size="sm" onClick={() => { setShowDeposit(!showDeposit); setDepositSuccess(false); setError(""); }} className="bg-white text-purple-700 hover:bg-purple-50">
              <Plus size={14} className="mr-1" /> {showDeposit ? "Cancel" : "Top Up"}
            </Button>
            <Button size="sm" variant="outline" className="border-purple-400 text-purple-200 hover:bg-purple-500">
              <ArrowUpRight size={14} className="mr-1" /> Withdraw
            </Button>
          </div>
        </div>

        {/* Deposit Panel */}
        {showDeposit && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <CreditCard size={16} className="text-purple-600" /> Top Up Wallet
            </h3>
            {depositSuccess ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                <Check size={16} /> Deposit successful! Balance updated.
              </div>
            ) : (
              <>
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    <AlertTriangle size={14} /> {error}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {presetAmounts.map(a => (
                    <button key={a} onClick={() => setDepositAmount(a.toString())}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${depositAmount === a.toString() ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"}`}>
                      ${a}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Custom Amount</label>
                  <div className="relative w-48">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500" placeholder="0.00" min="1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Payment Method</label>
                  <select value={depositMethod} onChange={e => setDepositMethod(e.target.value)}
                    className="w-48 h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-purple-500">
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="paystack">Paystack</option>
                    <option value="flutterwave">Flutterwave</option>
                  </select>
                </div>
                <Button onClick={handleDeposit} disabled={depositing || !depositAmount || parseFloat(depositAmount) <= 0}
                  className="bg-purple-600 hover:bg-purple-700 text-white">
                  {depositing ? "Processing..." : `Deposit $${parseFloat(depositAmount || "0").toFixed(2)}`}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <History size={16} className="text-purple-600" /> Transaction History
            </h3>
          </div>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Wallet size={32} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No transactions yet</p>
              <p className="text-xs text-gray-300 mt-1">Top up your wallet to get started</p>
            </div>
          ) : (
            <div className="space-y-1">
              {transactions.map((txn) => {
                const isCredit = txn.type === "credit" || txn.type === "deposit";
                return (
                  <div key={txn.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCredit ? "bg-green-100" : "bg-red-100"}`}>
                        {isCredit ? <ArrowDownRight size={14} className="text-green-600" /> : <ArrowUpRight size={14} className="text-red-600" />}
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
                      <p className="text-[9px] text-gray-400">${txn.balanceAfter.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </VendorShell>
  );
}
