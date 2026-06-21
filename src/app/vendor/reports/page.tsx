"use client";

import { useState } from "react";
import { BarChart3, FileText, Download, Trash2, Plus, X, Calendar, Save, Clock, RefreshCw, TrendingUp, DollarSign, Package, CheckCircle, AlertCircle } from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";

const reportCategories = [
  { id: "business", label: "Business Reports", icon: BarChart3 },
  { id: "advertising", label: "Advertising Reports", icon: TrendingUp },
  { id: "returns", label: "Return Reports", icon: RefreshCw },
  { id: "custom", label: "Custom Reports", icon: FileText },
  { id: "inventory", label: "Inventory Reports", icon: Package },
  { id: "tax", label: "Tax Document Library", icon: DollarSign },
];

const demoReports = [
  { id: "RPT-001", name: "Monthly Sales Summary", type: "Business", dateRange: "May 1 - May 31, 2026", generated: "2026-06-01", format: "PDF", size: "2.4 MB" },
  { id: "RPT-002", name: "Advertising Performance Q2", type: "Advertising", dateRange: "Apr 1 - Jun 20, 2026", generated: "2026-06-20", format: "CSV", size: "1.1 MB" },
  { id: "RPT-003", name: "Return Rate Analysis", type: "Returns", dateRange: "Jan 1 - Jun 20, 2026", generated: "2026-06-19", format: "Excel", size: "856 KB" },
  { id: "RPT-004", name: "Inventory Snapshot", type: "Inventory", dateRange: "As of Jun 20, 2026", generated: "2026-06-20", format: "PDF", size: "3.2 MB" },
  { id: "RPT-005", name: "Tax Summary 2026 Q1", type: "Tax", dateRange: "Jan 1 - Mar 31, 2026", generated: "2026-04-15", format: "PDF", size: "1.8 MB" },
  { id: "RPT-006", name: "Top Sellers Report", type: "Custom", dateRange: "May 1 - May 31, 2026", generated: "2026-06-05", format: "Excel", size: "1.5 MB" },
];

const formatOptions = ["CSV", "PDF", "Excel"];

const reportDimensions = [
  "Sales", "Orders", "Units", "Revenue", "Traffic", "Conversion", "Returns", "Advertising Spend",
];

const reportMetrics = [
  "Total Sales", "Total Orders", "Avg Order Value", "Units Sold", "Return Rate", "Ad Spend", "Impressions", "Clicks", "ROAS",
];

export default function ReportsPage() {
  const [sidebar, setSidebar] = useState("business");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredReports = demoReports.filter(
    (r) =>
      (sidebar === "business" && r.type === "Business") ||
      (sidebar === "advertising" && r.type === "Advertising") ||
      (sidebar === "returns" && r.type === "Returns") ||
      (sidebar === "inventory" && r.type === "Inventory") ||
      (sidebar === "tax" && r.type === "Tax") ||
      sidebar === "custom"
  );

  return (
    <VendorShell title="Reports Repository" subtitle="Generate, view, and download business reports">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Report Builder Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-bold text-lg text-text-1">Generate New Report</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-2 mb-1.5">Report Type</label>
                  <select className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                    <option>Sales Report</option>
                    <option>Advertising Report</option>
                    <option>Return Report</option>
                    <option>Inventory Report</option>
                    <option>Custom Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-2 mb-1.5">Date Range</label>
                  <select className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                    <option>Custom Range</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-2 mb-1.5">Dimensions</label>
                <div className="flex flex-wrap gap-2">
                  {reportDimensions.map((d) => (
                    <label key={d} className="flex items-center gap-1.5 text-xs text-text-2 cursor-pointer">
                      <input type="checkbox" defaultChecked={d === "Sales" || d === "Orders"} className="rounded border-gray-300 text-orange focus:ring-orange-500" />
                      {d}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-2 mb-1.5">Metrics</label>
                <div className="flex flex-wrap gap-2">
                  {reportMetrics.map((m) => (
                    <label key={m} className="flex items-center gap-1.5 text-xs text-text-2 cursor-pointer">
                      <input type="checkbox" defaultChecked={["Total Sales", "Total Orders", "Units Sold"].includes(m)} className="rounded border-gray-300 text-orange focus:ring-orange-500" />
                      {m}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-2 mb-1.5">Format</label>
                  <select className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                    {formatOptions.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-2 mb-1.5">Schedule</label>
                  <select className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                    <option>One-time</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-sm text-text-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-orange focus:ring-orange-500" />
                  <Save size={14} /> Save as Template
                </label>
                <label className="flex items-center gap-2 text-sm text-text-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-orange focus:ring-orange-500" />
                  <Calendar size={14} /> Schedule Recurring
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-xl text-sm font-semibold text-text-2 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => { setShowModal(false); showToast("Report generation started", "success"); }} className="px-6 py-2 bg-orange text-white font-bold rounded-xl hover:bg-orange/90 flex items-center gap-1.5">
                <FileText size={14} /> Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Left Sidebar */}
        <div className="w-48 shrink-0 space-y-1">
          {reportCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSidebar(cat.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                  sidebar === cat.id ? "bg-orange/10 text-orange" : "text-text-3 hover:bg-gray-50"
                }`}
              >
                <Icon size={15} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-4">{filteredReports.length} reports</p>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 flex items-center gap-1.5">
              <Plus size={14} /> Generate New Report
            </button>
          </div>

          <div className="bg-white rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50 text-left">
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Report Name</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Date Range</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Generated</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Format</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Size</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-text-1">{r.name}</p>
                      <p className="text-[10px] text-text-4 font-mono">{r.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-text-4 font-medium">{r.type}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-4">{r.dateRange}</td>
                    <td className="px-4 py-3 text-xs text-text-4">{new Date(r.generated).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-text-2">{r.format}</td>
                    <td className="px-4 py-3 text-xs text-text-4">{r.size}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => showToast(`Downloading ${r.name}...`, "success")} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Download">
                          <Download size={14} className="text-green-600" />
                        </button>
                        <button onClick={() => showToast(`${r.name} deleted`, "success")} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Delete">
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-text-4">
                      <FileText size={36} className="mx-auto text-gray-200 mb-2" />
                      No reports found in this category
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </VendorShell>
  );
}
