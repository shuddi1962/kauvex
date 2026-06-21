"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, FileText, Download, Calendar, Clock, Plus, Trash2,
  ChevronDown, FileSpreadsheet, File as FileIcon, Mail, Loader2,
  Check,
} from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";

const reportTypes = [
  { value: "all", label: "All Orders" },
  { value: "fbk", label: "FBK Orders" },
  { value: "merchant", label: "Merchant Orders" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
];

const demoReportData = [
  { id: 1, date: "2026-06-20", orderId: "ORD-1001", customer: "John Doe", type: "FBK", items: 2, total: 89.99, status: "Delivered" },
  { id: 2, date: "2026-06-19", orderId: "ORD-1002", customer: "Jane Smith", type: "Merchant", items: 1, total: 34.99, status: "Shipped" },
  { id: 3, date: "2026-06-18", orderId: "ORD-1003", customer: "Bob Johnson", type: "FBK", items: 3, total: 124.50, status: "Processing" },
  { id: 4, date: "2026-06-17", orderId: "ORD-1004", customer: "Alice Brown", type: "Merchant", items: 1, total: 89.99, status: "Pending" },
  { id: 5, date: "2026-06-16", orderId: "ORD-1005", customer: "Charlie Wilson", type: "FBK", items: 2, total: 259.98, status: "Delivered" },
  { id: 6, date: "2026-06-15", orderId: "ORD-1006", customer: "Diana Prince", type: "Merchant", items: 1, total: 19.99, status: "Cancelled" },
  { id: 7, date: "2026-06-14", orderId: "ORD-1007", customer: "Eve Adams", type: "FBK", items: 4, total: 199.96, status: "Returned" },
  { id: 8, date: "2026-06-13", orderId: "ORD-1008", customer: "Frank Miller", type: "Merchant", items: 1, total: 49.99, status: "Delivered" },
];

const scheduledReports = [
  { id: 1, name: "Weekly Order Summary", type: "All Orders", frequency: "Every Monday", recipients: "vendor@kauvex.com", active: true },
  { id: 2, name: "Monthly FBK Report", type: "FBK Orders", frequency: "1st of month", recipients: "finance@kauvex.com", active: true },
  { id: 3, name: "Returns Analysis", type: "Returned", frequency: "Every Friday", recipients: "returns@kauvex.com", active: false },
];

export default function OrderReportsPage() {
  const [dateFrom, setDateFrom] = useState("2026-06-01");
  const [dateTo, setDateTo] = useState("2026-06-30");
  const [reportType, setReportType] = useState("all");
  const [data] = useState(demoReportData);
  const [scheduled, setScheduled] = useState(scheduledReports);
  const [exporting, setExporting] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = data.filter(r => {
    if (reportType !== "all") {
      const typeMap: Record<string, string> = { fbk: "FBK", merchant: "Merchant", cancelled: "Cancelled", returned: "Returned" };
      const target = typeMap[reportType];
      if (reportType === "cancelled") return r.status === "Cancelled";
      if (reportType === "returned") return r.status === "Returned";
      if (r.type !== target) return false;
    }
    return true;
  });

  const exportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      showToast("success", "CSV report downloaded");
      setExporting(false);
    }, 1000);
  };

  const exportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      showToast("success", "PDF report downloaded");
      setExporting(false);
    }, 1500);
  };

  const toggleSchedule = (id: number) => {
    setScheduled(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    showToast("success", "Scheduled report updated");
  };

  const removeSchedule = (id: number) => {
    setScheduled(prev => prev.filter(s => s.id !== id));
    showToast("success", "Scheduled report removed");
  };

  const totalRevenue = filtered.reduce((sum, r) => sum + r.total, 0);

  return (
    <VendorShell title="Order Reports" subtitle="Generate and schedule order reports">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-5">
        <Link href="/vendor/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-4 hover:text-text-1 transition-colors">
          <ArrowLeft size={13} /> Back to Orders
        </Link>

        {/* Report Controls */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-bold text-sm text-text-1">Generate Report</h3>
            <div className="flex items-center gap-2">
              <button onClick={exportCSV} disabled={exporting}
                className="flex items-center gap-1.5 px-4 h-9 border border-border text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50">
                {exporting ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}
                Export CSV
              </button>
              <button onClick={exportPDF} disabled={exporting}
                className="flex items-center gap-1.5 px-4 h-9 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90 transition-colors disabled:opacity-50">
                {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                Export PDF
              </button>
            </div>
          </div>

          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">From Date</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="h-10 px-3 text-xs border border-border rounded-lg" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">To Date</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="h-10 px-3 text-xs border border-border rounded-lg" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Report Type</label>
              <select value={reportType} onChange={e => setReportType(e.target.value)}
                className="h-10 px-3 text-xs border border-border rounded-lg bg-white">
                {reportTypes.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
              </select>
            </div>
            <button onClick={() => showToast("success", "Report regenerated")}
              className="h-10 px-5 bg-gray-100 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-colors">
              Generate
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-text-4 uppercase">Total Orders</p>
            <p className="text-2xl font-bold text-text-1 mt-1">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-text-4 uppercase">Total Revenue</p>
            <p className="text-2xl font-bold text-text-1 mt-1">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-text-4 uppercase">Avg. Order Value</p>
            <p className="text-2xl font-bold text-text-1 mt-1">{filtered.length > 0 ? `$${(totalRevenue / filtered.length).toFixed(2)}` : "$0.00"}</p>
          </div>
        </div>

        {/* Report Table */}
        <div className="bg-white rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                {["Date", "Order ID", "Customer", "Type", "Items", "Total", "Status"].map(h => (
                  <th key={h} className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-border hover:bg-gray-50/50">
                  <td className="p-3 text-xs text-text-4">{r.date}</td>
                  <td className="p-3 font-mono text-xs font-semibold">{r.orderId}</td>
                  <td className="p-3 text-xs">{r.customer}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.type === "FBK" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}>{r.type}</span>
                  </td>
                  <td className="p-3 text-xs">{r.items}</td>
                  <td className="p-3 text-xs font-mono font-semibold">${r.total.toFixed(2)}</td>
                  <td className="p-3 text-xs">{r.status}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-text-4 text-sm">No orders found for this report</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Scheduled Reports */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-text-1">Scheduled Reports</h3>
              <p className="text-xs text-text-4 mt-0.5">Reports automatically emailed on a recurring basis</p>
            </div>
            <button onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="flex items-center gap-1.5 px-4 h-9 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90 transition-colors">
              <Plus size={13} /> Schedule Report
            </button>
          </div>

          {showScheduleForm && (
            <div className="p-5 border-b border-border bg-gray-50/50">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <input placeholder="Report name" className="h-10 px-3 text-xs border border-border rounded-lg" />
                <select className="h-10 px-3 text-xs border border-border rounded-lg bg-white">
                  {reportTypes.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                </select>
                <select className="h-10 px-3 text-xs border border-border rounded-lg bg-white">
                  <option>Daily</option>
                  <option>Every Monday</option>
                  <option>Every Friday</option>
                  <option>1st of month</option>
                  <option>15th of month</option>
                </select>
                <input placeholder="Recipient email" type="email" className="h-10 px-3 text-xs border border-border rounded-lg" />
              </div>
              <button onClick={() => { showToast("success", "Report scheduled"); setShowScheduleForm(false); }}
                className="px-5 h-9 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90 transition-colors">
                <Mail size={13} /> Create Schedule
              </button>
            </div>
          )}

          {scheduled.length > 0 ? (
            <div className="divide-y divide-border">
              {scheduled.map(s => (
                <div key={s.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-xl ${s.active ? "bg-orange/10" : "bg-gray-100"} flex items-center justify-center`}>
                      <Clock size={15} className={s.active ? "text-orange" : "text-text-4"} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-1">{s.name}</p>
                      <p className="text-xs text-text-4">{s.type} · {s.frequency} · {s.recipients}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleSchedule(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                        s.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-text-4"
                      }`}>
                      {s.active ? "Active" : "Paused"}
                    </button>
                    <button onClick={() => removeSchedule(s.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-text-4 text-sm">No scheduled reports</div>
          )}
        </div>
      </div>
    </VendorShell>
  );
}
