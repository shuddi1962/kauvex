"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Search, Loader2, Package, RefreshCw, CheckCircle,
  XCircle, Clock, AlertTriangle, Eye, ChevronDown,
  MessageSquare, DollarSign, Filter,
} from "lucide-react";

interface ReturnRequest {
  id: string;
  order_number?: string;
  customer_name?: string;
  reason: string;
  type: string;
  status: string;
  quantity: number;
  refund_amount?: number;
  created_at: string;
  vendor_notes?: string;
  admin_notes?: string;
  evidence_urls?: string[];
}

const seedReturns: ReturnRequest[] = [
  { id: "1", order_number: "ORD-1001", customer_name: "Emeka Okafor", reason: "Product arrived damaged", type: "damaged", status: "pending", quantity: 1, refund_amount: 25000, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "2", order_number: "ORD-1002", customer_name: "Amara Okafor", reason: "Wrong item received", type: "wrong_item", status: "approved", quantity: 1, refund_amount: 15000, created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: "3", order_number: "ORD-0999", customer_name: "Sarah Adeyemi", reason: "Not as described in listing", type: "not_as_described", status: "received", quantity: 2, created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: "4", order_number: "ORD-0998", customer_name: "John Obi", reason: "Defective product", type: "defective", status: "inspecting", quantity: 1, refund_amount: 45000, created_at: new Date(Date.now() - 345600000).toISOString() },
  { id: "5", order_number: "ORD-0997", customer_name: "Blessing Ade", reason: "Changed mind after purchase", type: "change_of_mind", status: "refunded", quantity: 1, refund_amount: 8500, created_at: new Date(Date.now() - 432000000).toISOString() },
  { id: "6", order_number: "ORD-0996", customer_name: "Chidi Nwosu", reason: "Product not received", type: "not_received", status: "rejected", quantity: 1, created_at: new Date(Date.now() - 518400000).toISOString() },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "text-yellow-600", bg: "bg-yellow-50", icon: Clock },
  approved: { label: "Approved", color: "text-blue", bg: "bg-blue-50", icon: CheckCircle },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
  awaiting_return: { label: "Awaiting Return", color: "text-purple-600", bg: "bg-purple-50", icon: Package },
  received: { label: "Received", color: "text-indigo-600", bg: "bg-indigo-50", icon: RefreshCw },
  inspecting: { label: "Inspecting", color: "text-orange", bg: "bg-orange-50", icon: AlertTriangle },
  refunded: { label: "Refunded", color: "text-green-600", bg: "bg-green-50", icon: DollarSign },
  closed: { label: "Closed", color: "text-text-4", bg: "bg-gray-100", icon: CheckCircle },
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

  useEffect(() => {
    setTimeout(() => { setReturns(seedReturns); setLoading(false); }, 500);
  }, []);

  const filtered = returns.filter(r => {
    const matchesSearch = !search ||
      r.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      r.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatus = (s: string) => statusConfig[s] || { label: s, color: "text-text-4", bg: "bg-gray-100", icon: Package };

  if (loading) {
    return (
      <AdminShell title="Returns Management" subtitle="Manage customer return requests and refunds">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Returns Management" subtitle="Manage customer return requests and refunds">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Returns", value: returns.length, icon: RefreshCw },
          { label: "Pending", value: returns.filter(r => r.status === "pending").length, color: "text-yellow-600" },
          { label: "Approved", value: returns.filter(r => r.status === "approved").length, color: "text-green-600" },
          { label: "Refunded", value: returns.filter(r => r.status === "refunded").length, color: "text-blue" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              {s.icon && <s.icon size={14} className="text-text-4" />}
              <p className={`font-bold text-xl ${s.color || "text-text-1"}`}>{typeof s.value === "number" ? s.value : "—"}</p>
            </div>
            <p className="text-[10px] text-text-4">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search returns..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-lg border border-gray-200 text-xs appearance-none bg-white focus:outline-none focus:border-blue">
            <option value="all">All Status</option>
            {Object.keys(statusConfig).map(s => (
              <option key={s} value={s}>{statusConfig[s].label}</option>
            ))}
          </select>
          <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 font-semibold text-text-4">Order</th>
                <th className="text-left px-4 py-2.5 font-semibold text-text-4">Customer</th>
                <th className="text-left px-4 py-2.5 font-semibold text-text-4">Type</th>
                <th className="text-left px-4 py-2.5 font-semibold text-text-4">Reason</th>
                <th className="text-left px-4 py-2.5 font-semibold text-text-4">Status</th>
                <th className="text-left px-4 py-2.5 font-semibold text-text-4">Qty</th>
                <th className="text-left px-4 py-2.5 font-semibold text-text-4">Refund</th>
                <th className="text-left px-4 py-2.5 font-semibold text-text-4">Date</th>
                <th className="text-right px-4 py-2.5 font-semibold text-text-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const status = getStatus(r.status);
                const StatusIcon = status.icon;
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.order_number || "—"}</td>
                    <td className="px-4 py-3 text-text-3">{r.customer_name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-text-3">{r.type.replace(/_/g, " ")}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate text-text-3">{r.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                        <StatusIcon size={10} /> {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">{r.quantity}</td>
                    <td className="px-4 py-3 font-medium">
                      {r.refund_amount ? `₦${r.refund_amount.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-text-4 text-[10px]">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelectedReturn(r)} className="p-1 hover:bg-gray-100 rounded text-text-4">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-text-4">No return requests found</div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReturn(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">Return Details</h3>
              <button onClick={() => setSelectedReturn(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <XCircle size={16} className="text-text-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-text-4 text-[10px] mb-0.5">Order</p>
                  <p className="font-medium">{selectedReturn.order_number || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-text-4 text-[10px] mb-0.5">Customer</p>
                  <p className="font-medium">{selectedReturn.customer_name || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-text-4 text-[10px] mb-0.5">Type</p>
                  <p className="font-medium capitalize">{selectedReturn.type.replace(/_/g, " ")}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-text-4 text-[10px] mb-0.5">Status</p>
                  <p className="font-medium">{getStatus(selectedReturn.status).label}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-text-4 text-[10px] mb-1">Reason</p>
                <p className="text-text-2">{selectedReturn.reason}</p>
              </div>

              {selectedReturn.refund_amount && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-text-4 text-[10px] mb-0.5">Refund Amount</p>
                  <p className="font-bold text-base text-green-600">₦{selectedReturn.refund_amount.toLocaleString()}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-text-4 text-[10px] mb-2">Actions</p>
                <div className="flex gap-2">
                  <button className="flex-1 h-8 bg-blue text-white rounded-lg text-xs font-medium hover:bg-blue-600">Approve</button>
                  <button className="flex-1 h-8 bg-orange text-white rounded-lg text-xs font-medium hover:bg-orange/90">Inspect</button>
                  <button className="flex-1 h-8 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">Refund</button>
                  <button className="flex-1 h-8 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50">Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
