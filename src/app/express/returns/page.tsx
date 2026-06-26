"use client";

import { useState } from "react";
import { RotateCcw, Shield, Receipt, Search, Filter, ChevronDown, ChevronRight, Package, Clock, CheckCircle2, AlertCircle, XCircle, Plus, Download, Eye, FileText } from "lucide-react";

type Tab = "returns" | "claims" | "invoices";

const RETURNS = [
  { id: "RTN-1001", order: "KVX-7839", from: "Accra", to: "Lagos", reason: "Wrong item received", status: "approved", date: "Jun 25, 2026", value: "$45.99", carrier: "DHL Express", rmaCode: "RMA-AC-7839" },
  { id: "RTN-1002", order: "KVX-7812", from: "Abuja", to: "Lagos", reason: "Damaged in transit", status: "in_transit", date: "Jun 24, 2026", value: "$128.50", carrier: "GIG Logistics", rmaCode: "RMA-AB-7812" },
  { id: "RTN-1003", order: "KVX-7805", from: "Lekki", to: "Ikeja", reason: "Customer changed mind", status: "pending", date: "Jun 23, 2026", value: "$32.00", carrier: "Kwik Delivery", rmaCode: "RMA-LK-7805" },
  { id: "RTN-1004", order: "KVX-7798", from: "Nairobi", to: "Lagos", reason: "Item not as described", status: "completed", date: "Jun 22, 2026", value: "$89.99", carrier: "Aramex", rmaCode: "RMA-NA-7798" },
  { id: "RTN-1005", order: "KVX-7790", from: "PH", to: "Lagos", reason: "Size mismatch", status: "rejected", date: "Jun 21, 2026", value: "$55.00", carrier: "FedEx", rmaCode: "RMA-PH-7790" },
];

const CLAIMS = [
  { id: "CLM-001", order: "KVX-7756", type: "Lost Package", status: "investigating", filed: "Jun 20, 2026", value: "$250.00", carrier: "GIG Logistics", assigned: "Claims Team A" },
  { id: "CLM-002", order: "KVX-7723", type: "Damaged Goods", status: "resolved", filed: "Jun 18, 2026", value: "$180.00", carrier: "FedEx", assigned: "Claims Team B" },
  { id: "CLM-003", order: "KVX-7710", type: "Delivery Delay (>5 days)", status: "pending_review", filed: "Jun 17, 2026", value: "$45.00", carrier: "Aramex", assigned: "Claims Team A" },
  { id: "CLM-004", order: "KVX-7698", type: "Wrong Delivery", status: "resolved", filed: "Jun 15, 2026", value: "$320.00", carrier: "DHL Express", assigned: "Claims Team C" },
];

const INVOICES = [
  { id: "INV-2026-0601", period: "Jun 1-7, 2026", shipments: 245, total: "$3,892.50", status: "paid", dueDate: "Jun 15, 2026" },
  { id: "INV-2026-0602", period: "Jun 8-14, 2026", shipments: 312, total: "$4,891.20", status: "paid", dueDate: "Jun 22, 2026" },
  { id: "INV-2026-0603", period: "Jun 15-21, 2026", shipments: 278, total: "$4,256.80", status: "due", dueDate: "Jun 29, 2026" },
  { id: "INV-2026-0604", period: "Jun 22-28, 2026", shipments: 0, total: "$0.00", status: "draft", dueDate: "Jul 6, 2026" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  approved: { label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  in_transit: { label: "In Transit", color: "bg-blue-100 text-blue-700", icon: Package },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  completed: { label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
  investigating: { label: "Investigating", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  pending_review: { label: "Pending Review", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  paid: { label: "Paid", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  due: { label: "Due Soon", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  draft: { label: "Draft", color: "bg-gray-100 text-gray-600", icon: FileText },
};

export default function ReturnsPage() {
  const [tab, setTab] = useState<Tab>("returns");
  const [search, setSearch] = useState("");

  const tabs: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: "returns", label: "Returns", icon: RotateCcw, count: RETURNS.length },
    { id: "claims", label: "Claims", icon: Shield, count: CLAIMS.length },
    { id: "invoices", label: "Invoices", icon: Receipt, count: INVOICES.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Returns & Claims</h1>
          <p className="text-sm text-gray-500 mt-1">Manage returns, file claims, and view invoices.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          {tab === "returns" ? "New Return" : tab === "claims" ? "File Claim" : "Download All"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Returns</p>
          <p className="text-xl font-bold text-[#0A1628]">{RETURNS.length}</p>
          <span className="text-[11px] text-gray-500">This month</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Open Claims</p>
          <p className="text-xl font-bold text-[#0A1628]">{CLAIMS.filter((c) => c.status !== "resolved").length}</p>
          <span className="text-[11px] text-orange-600 font-medium">2 investigating</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Value at Risk</p>
          <p className="text-xl font-bold text-[#0A1628]">$685</p>
          <span className="text-[11px] text-red-600 font-medium">4 items</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Pending Invoices</p>
          <p className="text-xl font-bold text-[#0A1628]">$4,257</p>
          <span className="text-[11px] text-yellow-600 font-medium">Due Jun 29</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.id ? "bg-white shadow text-[#0A1628]" : "text-gray-500 hover:text-gray-700"}`}>
            <t.icon className="w-4 h-4" />
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? "bg-[#FF6B00] text-white" : "bg-gray-200 text-gray-600"}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${tab}...`} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
      </div>

      {/* Returns Table */}
      {tab === "returns" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Return ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Original Order</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Route</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Reason</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">Value</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Date</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {RETURNS.filter((r) => !search || r.id.toLowerCase().includes(search.toLowerCase()) || r.reason.toLowerCase().includes(search.toLowerCase())).map((r) => {
                const sc = STATUS_CONFIG[r.status];
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A1628]">{r.id}</td>
                    <td className="py-3 px-4 font-mono text-gray-600">{r.order}</td>
                    <td className="py-3 px-4 text-gray-600">{r.from} → {r.to}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">{r.reason}</td>
                    <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.color}`}><sc.icon className="w-3 h-3" />{sc.label}</span></td>
                    <td className="py-3 px-4 text-right font-medium text-[#0A1628]">{r.value}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{r.date}</td>
                    <td className="py-3 px-4 text-right"><button className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-gray-400" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Claims */}
      {tab === "claims" && (
        <div className="space-y-4">
          {CLAIMS.map((c) => {
            const sc = STATUS_CONFIG[c.status];
            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#0A1628]">{c.id}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.color}`}><sc.icon className="w-3 h-3" />{sc.label}</span>
                  </div>
                  <span className="text-sm font-bold text-[#0A1628]">{c.value}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div><span className="text-gray-500">Order:</span> <span className="font-mono font-medium text-[#0A1628]">{c.order}</span></div>
                  <div><span className="text-gray-500">Type:</span> <span className="font-medium text-[#0A1628]">{c.type}</span></div>
                  <div><span className="text-gray-500">Filed:</span> <span className="font-medium text-[#0A1628]">{c.filed}</span></div>
                  <div><span className="text-gray-500">Carrier:</span> <span className="font-medium text-[#0A1628]">{c.carrier}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoices */}
      {tab === "invoices" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Invoice #</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Period</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">Shipments</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">Total</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Due Date</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => {
                const sc = STATUS_CONFIG[inv.status];
                return (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A1628]">{inv.id}</td>
                    <td className="py-3 px-4 text-gray-600">{inv.period}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{inv.shipments}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#0A1628]">{inv.total}</td>
                    <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.color}`}><sc.icon className="w-3 h-3" />{sc.label}</span></td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{inv.dueDate}</td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Download className="w-4 h-4 text-gray-400" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
