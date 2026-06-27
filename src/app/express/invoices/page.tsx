"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Receipt,
} from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  shipments: number;
  amount: number;
  status: "paid" | "pending" | "overdue";
  period: string;
}

export default function ExpressInvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  const invoices: Invoice[] = [
    { id: "1", invoiceNumber: "INV-2026-0047", date: "2026-06-25", shipments: 42, amount: 1864.50, status: "paid", period: "Jun 1 – Jun 25" },
    { id: "2", invoiceNumber: "INV-2026-0046", date: "2026-05-31", shipments: 38, amount: 1642.30, status: "paid", period: "May 1 – May 31" },
    { id: "3", invoiceNumber: "INV-2026-0045", date: "2026-05-01", shipments: 51, amount: 2215.80, status: "paid", period: "Apr 1 – Apr 30" },
    { id: "4", invoiceNumber: "INV-2026-0044", date: "2026-04-01", shipments: 29, amount: 1273.20, status: "paid", period: "Mar 1 – Mar 31" },
    { id: "5", invoiceNumber: "INV-2026-0043", date: "2026-03-01", shipments: 35, amount: 1532.75, status: "paid", period: "Feb 1 – Feb 28" },
    { id: "6", invoiceNumber: "INV-2026-0048", date: "2026-06-26", shipments: 18, amount: 786.40, status: "pending", period: "Jun 26 – Jun 30" },
    { id: "7", invoiceNumber: "INV-2026-0042", date: "2026-02-01", shipments: 44, amount: 1928.60, status: "overdue", period: "Jan 1 – Jan 31" },
    { id: "8", invoiceNumber: "INV-2026-0041", date: "2026-01-02", shipments: 31, amount: 1354.90, status: "paid", period: "Dec 1 – Dec 31" },
    { id: "9", invoiceNumber: "INV-2026-0040", date: "2025-12-01", shipments: 27, amount: 1182.50, status: "paid", period: "Nov 1 – Nov 30" },
    { id: "10", invoiceNumber: "INV-2026-0049", date: "2026-06-26", shipments: 8, amount: 342.10, status: "pending", period: "Jun 26 – Jun 30" },
  ];

  const filtered = invoices.filter((inv) => {
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchFrom = !dateFrom || inv.date >= dateFrom;
    const matchTo = !dateTo || inv.date <= dateTo;
    return matchStatus && matchFrom && matchTo;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = invoices.filter((i) => i.status === "pending").reduce((sum, inv) => sum + inv.amount, 0);

  const statusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return { label: "Paid", color: "text-emerald-600", bg: "bg-emerald-50", icon: <CheckCircle size={14} /> };
      case "pending":
        return { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", icon: <Clock size={14} /> };
      case "overdue":
        return { label: "Overdue", color: "text-red-600", bg: "bg-red-50", icon: <AlertTriangle size={14} /> };
      default:
        return { label: status, color: "text-gray-500", bg: "bg-gray-50", icon: null };
    }
  };

  const summaryCards = [
    { label: "Total Billed", value: `$${totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: <Receipt size={20} />, color: "#0A1628" },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: <CheckCircle size={20} />, color: "#059669" },
    { label: "Pending", value: `$${totalPending.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: <Clock size={20} />, color: "#F59E0B" },
  ];

  const handleDownload = (inv: Invoice) => {
    const content = [
      `Kauvex Express Invoice`,
      `Invoice Number: ${inv.invoiceNumber}`,
      `Date: ${inv.date}`,
      `Period: ${inv.period}`,
      `Shipments: ${inv.shipments}`,
      `Amount: $${inv.amount.toFixed(2)}`,
      `Status: ${inv.status.toUpperCase()}`,
      ``,
      `Thank you for using Kauvex Express.`,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ backgroundColor: "#F5F7FA" }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#0A1628" }}>
              <FileText className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#0A1628" }}>Invoices</h1>
              <p className="text-gray-500 text-sm">Manage your billing history and download invoices</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-xl border border-gray-200 p-5 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 font-medium">{card.label}</span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}10`, color: card.color }}>
                  {card.icon}
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: "#0A1628" }}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 p-5 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 overflow-x-auto">
              {(["all", "paid", "pending", "overdue"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    statusFilter === s
                      ? "text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={statusFilter === s ? { backgroundColor: "#FF6B00" } : {}}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(""); setDateTo(""); setCurrentPage(1); }}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-gray-500 font-medium py-3 px-4">Invoice #</th>
                  <th className="text-left text-gray-500 font-medium py-3 px-4">Date</th>
                  <th className="text-left text-gray-500 font-medium py-3 px-4">Period</th>
                  <th className="text-center text-gray-500 font-medium py-3 px-4">Shipments</th>
                  <th className="text-right text-gray-500 font-medium py-3 px-4">Amount</th>
                  <th className="text-left text-gray-500 font-medium py-3 px-4">Status</th>
                  <th className="text-right text-gray-500 font-medium py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((inv) => {
                  const cfg = statusConfig(inv.status);
                  return (
                    <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: "#0A162808", color: "#0A1628" }}>
                          {inv.invoiceNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">{new Date(inv.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td className="py-3.5 px-4 text-gray-500 text-xs">{inv.period}</td>
                      <td className="py-3.5 px-4 text-center text-gray-700 font-medium">{inv.shipments}</td>
                      <td className="py-3.5 px-4 text-right font-bold" style={{ color: "#0A1628" }}>${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDownload(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                          style={{ backgroundColor: "#FF6B0010", color: "#FF6B00" }}
                        >
                          <Download size={12} />
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {paginated.length === 0 && (
            <div className="text-center py-16">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2" style={{ color: "#0A1628" }}>No Invoices Found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-gray-500 text-sm">
                Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) page = i + 1;
                  else if (currentPage <= 3) page = i + 1;
                  else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                  else page = currentPage - 2 + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page ? "text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                      style={currentPage === page ? { backgroundColor: "#FF6B00" } : {}}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
