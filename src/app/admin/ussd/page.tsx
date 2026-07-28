"use client";

import { useState, useEffect } from "react";
import { Smartphone, CheckCircle, Clock, AlertCircle, Search } from "lucide-react";

interface UssdStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  totalAmount: number;
}

interface UssdTx {
  id: string;
  accountId: string;
  reference: string;
  amount: number;
  currency: string;
  ussdCode: string | null;
  status: string;
  purpose: string | null;
  createdAt: string;
  paidAt: string | null;
}

export default function UssdAdminPage() {
  const [stats, setStats] = useState<UssdStats | null>(null);
  const [txs, setTxs] = useState<UssdTx[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/ussd/transactions").then((r) => r.json()),
    ])
      .then(([txData]) => {
        setTxs(txData.transactions || []);
        // Compute stats client-side
        const txs = txData.transactions || [];
        setStats({
          total: txs.length,
          pending: txs.filter((t: UssdTx) => t.status === "pending").length,
          completed: txs.filter((t: UssdTx) => t.status === "completed").length,
          failed: txs.filter((t: UssdTx) => t.status === "failed").length,
          totalAmount: txs.filter((t: UssdTx) => t.status === "completed").reduce((s: number, t: UssdTx) => s + Number(t.amount), 0),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = txs.filter(
    (t) =>
      t.reference.toLowerCase().includes(search.toLowerCase()) ||
      t.accountId?.toLowerCase().includes(search.toLowerCase()) ||
      t.status.includes(search.toLowerCase())
  );

  const statusIcon: Record<string, any> = {
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    completed: <CheckCircle className="w-4 h-4 text-green-500" />,
    failed: <AlertCircle className="w-4 h-4 text-red-500" />,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-800 text-navy">USSD Payments</h1>
        <p className="text-sm text-text-3 mt-1">Track bank USSD payment transactions processed via Paystack</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total", value: stats?.total || 0, color: "bg-navy text-white" },
          { label: "Pending", value: stats?.pending || 0, color: "bg-yellow-50 text-yellow-600" },
          { label: "Completed", value: stats?.completed || 0, color: "bg-green-50 text-green-600" },
          { label: "Failed", value: stats?.failed || 0, color: "bg-red-50 text-red-600" },
          { label: "Volume", value: `₦${(stats?.totalAmount || 0).toLocaleString()}`, color: "bg-blue-50 text-blue-600" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-border p-4">
            <p className="text-lg font-800">{card.value}</p>
            <p className="text-xs text-text-3">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Search className="w-4 h-4 text-text-3" />
          <input
            type="text"
            placeholder="Search by reference, account, or status..."
            className="flex-1 text-sm outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-3 text-xs">
                <th className="text-left p-3 font-medium">Reference</th>
                <th className="text-left p-3 font-medium">Account</th>
                <th className="text-right p-3 font-medium">Amount</th>
                <th className="text-center p-3 font-medium">Status</th>
                <th className="text-center p-3 font-medium">USSD Code</th>
                <th className="text-left p-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{tx.reference}</td>
                  <td className="p-3 font-mono text-xs text-text-3">{tx.accountId.slice(0, 8)}...</td>
                  <td className="p-3 text-right font-medium">{tx.currency} {Number(tx.amount).toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1.5">
                      {statusIcon[tx.status] || <Clock className="w-4 h-4" />}
                      <span className="capitalize">{tx.status}</span>
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono text-xs">{tx.ussdCode || "—"}</td>
                  <td className="p-3 text-xs text-text-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-text-3">No USSD transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}