"use client";

import { BarChart3, Download, FileText, TrendingUp, CheckCircle2, Clock, Target } from "lucide-react";

export default function WarehouseReportsPage() {
  const metrics = [
    { label: "Pick Accuracy Rate", value: "98.5%", trend: "+0.5%", color: "text-green-600", icon: Target },
    { label: "Pack Quality Score", value: "96.2%", trend: "+1.2%", color: "text-green-600", icon: CheckCircle2 },
    { label: "Avg Inbound Processing", value: "45 min", trend: "-5 min", color: "text-blue-600", icon: Clock },
    { label: "Daily Outbound Volume", value: "234", trend: "+12%", color: "text-orange", icon: TrendingUp },
  ];

  const reports = [
    { name: "Daily Operations Report", date: "2024-03-19", type: "PDF", size: "245 KB" },
    { name: "Weekly Picking Accuracy", date: "Mar 13-19", type: "PDF", size: "180 KB" },
    { name: "Monthly Inbound Summary", date: "March 2024", type: "XLSX", size: "520 KB" },
    { name: "Packaging Consumption Report", date: "Q1 2024", type: "PDF", size: "340 KB" },
    { name: "Staff Productivity Report", date: "March 2024", type: "PDF", size: "410 KB" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#0A1628]">Reports</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <Icon size={20} className="text-gray-400" />
                <span className="text-xs text-green-600">{m.trend}</span>
              </div>
              <p className="text-2xl font-bold text-[#0A1628]">{m.value}</p>
              <p className="text-sm text-gray-500">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm hover:bg-orange-600">
          <Download size={14} /> Export Daily Report
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white rounded-lg text-sm hover:bg-navy-800">
          <FileText size={14} /> Generate Custom Report
        </button>
      </div>

      {/* Report List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <BarChart3 size={16} className="text-[#FF6B00]" /> Generated Reports
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {reports.map((report, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  report.type === "PDF" ? "bg-red-50" : "bg-green-50"
                }`}>
                  <FileText size={16} className={report.type === "PDF" ? "text-red-500" : "text-green-600"} />
                </div>
                <div>
                  <p className="font-medium text-sm text-[#0A1628]">{report.name}</p>
                  <p className="text-xs text-gray-500">{report.date} • {report.size}</p>
                </div>
              </div>
              <button className="text-xs text-[#FF6B00] hover:underline flex items-center gap-1">
                <Download size={12} /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
