"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Download, Eye, Clock, CheckCircle2 } from "lucide-react";

interface Invoice {
  id: string;
  date: string;
  dueDate: string;
  amount: string;
  status: string;
  orderId: string;
}

const seedInvoices: Invoice[] = [
  { id: "INV-2026-047", date: "2026-06-28", dueDate: "2026-07-28", amount: "$4,250", status: "pending", orderId: "WS-2847" },
  { id: "INV-2026-031", date: "2026-06-25", dueDate: "2026-07-25", amount: "$2,800", status: "pending", orderId: "WS-2831" },
  { id: "INV-2026-019", date: "2026-06-22", dueDate: "2026-07-22", amount: "$8,900", status: "overdue", orderId: "WS-2819" },
  { id: "INV-2026-005", date: "2026-06-18", dueDate: "2026-06-18", amount: "$1,950", status: "paid", orderId: "WS-2805" },
  { id: "INV-2025-798", date: "2026-06-15", dueDate: "2026-06-15", amount: "$5,600", status: "paid", orderId: "WS-2798" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: "Paid", color: "text-green-700", bg: "bg-green-100" },
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-100" },
  overdue: { label: "Overdue", color: "text-red-600", bg: "bg-red-100" },
};

export default function WholesaleInvoicesPage() {
  const [invoices] = useState<Invoice[]>(seedInvoices);

  const totalPending = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + parseFloat(i.amount.replace(/[$,]/g, "")), 0);
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + parseFloat(i.amount.replace(/[$,]/g, "")), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/wholesale/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={16} className="text-gray-500" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Invoices</h2>
            <p className="text-xs text-gray-500">Manage your wholesale invoices and payments</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle2 size={18} /></div>
              <span className="text-xs text-gray-500">Total Paid</span>
            </div>
            <p className="text-2xl font-bold text-[#0A1628]">$7,550</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><Clock size={18} /></div>
              <span className="text-xs text-gray-500">Pending (NET 30)</span>
            </div>
            <p className="text-2xl font-bold text-[#0A1628]">${totalPending.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><CreditCard size={18} /></div>
              <span className="text-xs text-gray-500">Overdue</span>
            </div>
            <p className="text-2xl font-bold text-red-600">${totalOverdue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Invoice</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Due Date</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const status = statusConfig[inv.status] || statusConfig.pending;
                return (
                  <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900 font-mono">{inv.id}</td>
                    <td className="px-4 py-3 text-xs text-blue-600 font-medium">{inv.orderId}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#0A1628]">{inv.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={13} className="text-gray-400" /></button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Download size={13} className="text-gray-400" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
