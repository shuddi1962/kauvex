"use client";

import { useState, useEffect } from "react";
import {
  Check, Clock, AlertTriangle, ArrowLeft,
  Calendar, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgreementDetail {
  agreement: {
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
    interestRate: number;
    flatFee: number;
    createdAt: string;
  };
  payments: {
    id: string;
    installmentNumber: number;
    amount: number;
    lateFee: number;
    totalCharged: number;
    dueDate: string;
    status: string;
    paidAt: string | null;
    paymentMethod: string | null;
  }[];
}

export default function AgreementDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<AgreementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [repaying, setRepaying] = useState(false);

  useEffect(() => { loadAgreement(); }, []);

  const loadAgreement = async () => {
    try {
      const res = await fetch(`/api/v1/pay/bnpl/agreements/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleEarlyRepay = async (option: "next_installment" | "full_balance") => {
    setRepaying(true);
    try {
      const res = await fetch(`/api/v1/pay/bnpl/agreements/${params.id}/repay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option }),
      });
      if (res.ok) loadAgreement();
    } catch { /* ignore */ }
    setRepaying(false);
  };

  const getPaymentStatusIcon = (status: string) => {
    if (status === "paid") return <Check size={14} className="text-green-600" />;
    if (status === "overdue" || status === "failed") return <AlertTriangle size={14} className="text-red" />;
    return <Clock size={14} className="text-yellow-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-kauvex-orange" size={32} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-text-4">Agreement not found</p>
      </div>
    );
  }

  const { agreement, payments } = data;
  const paidCount = payments.filter((p) => p.status === "paid").length;

  return (
    <div>
      <a href="/account/pay-later" className="flex items-center gap-2 text-sm text-text-3 hover:text-kauvex-orange mb-6">
        <ArrowLeft size={16} /> Back to Pay Later
      </a>

      {/* Agreement Header */}
      <div className="bg-gradient-to-br from-[#0A1628] to-blue-900 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Pay Later Agreement</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            agreement.status === "active" ? "bg-green-500/20 text-green-300" :
            agreement.status === "completed" ? "bg-blue-500/20 text-blue-300" :
            "bg-red-500/20 text-red-300"
          }`}>
            {agreement.status}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-white/60 text-xs">Total Amount</p>
            <p className="text-lg font-bold">₦{agreement.totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Paid</p>
            <p className="text-lg font-bold text-green-300">₦{agreement.totalPaid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Outstanding</p>
            <p className="text-lg font-bold text-kauvex-orange">₦{agreement.totalOutstanding.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Progress</p>
            <p className="text-lg font-bold">{paidCount}/{agreement.installmentCount}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-kauvex-orange rounded-full"
              style={{ width: `${(paidCount / agreement.installmentCount) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="bg-white rounded-xl border border-border mb-6">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-lg text-text-1">Payment Schedule</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-text-4 font-medium">#</th>
                <th className="text-left p-4 text-text-4 font-medium">Due Date</th>
                <th className="text-left p-4 text-text-4 font-medium">Amount</th>
                <th className="text-left p-4 text-text-4 font-medium">Late Fee</th>
                <th className="text-left p-4 text-text-4 font-medium">Total</th>
                <th className="text-left p-4 text-text-4 font-medium">Status</th>
                <th className="text-left p-4 text-text-4 font-medium">Date Paid</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-off-white">
                  <td className="p-4 font-medium">{p.installmentNumber}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-text-4" />
                      {new Date(p.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4 font-semibold">₦{p.amount.toLocaleString()}</td>
                  <td className="p-4">
                    {p.lateFee > 0 ? (
                      <span className="text-red font-medium">₦{p.lateFee.toLocaleString()}</span>
                    ) : "-"}
                  </td>
                  <td className="p-4 font-semibold">₦{p.totalCharged.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getPaymentStatusIcon(p.status)}
                      <span className={`text-xs font-medium capitalize ${
                        p.status === "paid" ? "text-green-600" :
                        p.status === "overdue" ? "text-red" : "text-yellow-600"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-text-3">
                    {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      {agreement.status === "active" && (
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-lg text-text-1 mb-4">Actions</h3>
          <div className="flex gap-3">
            <Button variant="cta" onClick={() => handleEarlyRepay("next_installment")} disabled={repaying}>
              {repaying ? "Processing..." : "Pay Next Installment"}
            </Button>
            <Button onClick={() => handleEarlyRepay("full_balance")} disabled={repaying}
              className="bg-[#0A1628] text-white hover:bg-[#0A1628]/90">
              {repaying ? "Processing..." : `Pay Full Balance (₦${agreement.totalOutstanding.toLocaleString()})`}
            </Button>
          </div>
          <p className="text-xs text-text-4 mt-3">
            No penalties for early repayment. Paying early increases your BNPL limit faster.
          </p>
        </div>
      )}
    </div>
  );
}
