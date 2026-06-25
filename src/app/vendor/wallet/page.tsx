"use client";

import { useState, useEffect } from "react";
import { Wallet, ArrowUpRight, ArrowDownRight, Plus, CreditCard, History, Check, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

interface Transaction {
  id: string;
  transactionType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  direction: string;
  description: string | null;
  referenceType: string | null;
  status: string;
  createdAt: string;
}

interface WalletData {
  id: string;
  balance: number;
  pendingBalance: number;
  reservedBalance: number;
  availableBalance: number;
  status: string;
}

export default function VendorWalletPage() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletData | null>(null);
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
      const res = await fetch("/api/v1/pay/wallet");
      if (res.ok) {
        const json = await res.json();
        setWallet(json.data?.wallet);
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
      const res = await fetch("/api/v1/pay/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method: depositMethod }),
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
          <Loader2 className="animate-spin text-kauvex-orange" size={32} />
        </div>
      </VendorShell>
    );
  }

  return (
    <VendorShell title="Kauvex Pay Wallet" subtitle="Manage your account balance & transactions">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#0A1628] to-blue-900 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet size={20} />
              <span className="text-sm font-semibold text-white/70">Available Balance</span>
            </div>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">Vendor Wallet</span>
          </div>
          <p className="text-3xl font-bold mb-1">₦{(wallet?.balance || 0).toLocaleString()}</p>
          <div className="flex gap-4 mt-2 text-xs text-white/50">
            <span>Pending: ₦{(wallet?.pendingBalance || 0).toLocaleString()}</span>
            <span>Reserved: ₦{(wallet?.reservedBalance || 0).toLocaleString()}</span>
          </div>
          <div className="flex gap-2 mt-6">
            <Button size="sm" onClick={() => { setShowDeposit(!showDeposit); setDepositSuccess(false); setError(""); }}
              className="bg-white text-[#0A1628] hover:bg-white/90">
              <Plus size={14} className="mr-1" /> {showDeposit ? "Cancel" : "Top Up"}
            </Button>
            <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <ArrowUpRight size={14} className="mr-1" /> Withdraw
            </Button>
          </div>
        </div>

        {/* Deposit Panel */}
        {showDeposit && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <CreditCard size={16} className="text-kauvex-orange" /> Top Up Wallet
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
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${depositAmount === a.toString() ? "bg-[#0A1628] text-white border-[#0A1628]" : "bg-white text-gray-700 border-gray-200 hover:border-kauvex-orange"}`}>
                      ₦{a}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Custom Amount</label>
                  <div className="relative w-48">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>
                    <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-kauvex-orange" placeholder="0.00" min="1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Payment Method</label>
                  <select value={depositMethod} onChange={e => setDepositMethod(e.target.value)}
                    className="w-48 h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-kauvex-orange">
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="ussd">USSD</option>
                  </select>
                </div>
                <Button onClick={handleDeposit} disabled={depositing || !depositAmount || parseFloat(depositAmount) <= 0}
                  className="bg-kauvex-orange hover:bg-orange-700 text-white">
                  {depositing ? "Processing..." : `Deposit ₦${parseFloat(depositAmount || "0").toLocaleString()}`}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <History size={16} className="text-kauvex-orange" /> Transaction History
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
                const isCredit = txn.direction === "credit";
                return (
                  <div key={txn.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCredit ? "bg-green-100" : "bg-red-100"}`}>
                        {isCredit ? <ArrowDownRight size={14} className="text-green-600" /> : <ArrowUpRight size={14} className="text-red-600" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">{txn.description || txn.transactionType}</p>
                        <p className="text-[10px] text-gray-400">{new Date(txn.createdAt).toLocaleDateString()} · {txn.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${isCredit ? "text-green-600" : "text-red-600"}`}>
                        {isCredit ? "+" : "-"}₦{txn.amount.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-gray-400">₦{txn.balanceAfter.toLocaleString()}</p>
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
