"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart, Loader2, Search, Filter, ChevronDown, ChevronRight,
  Package, Truck, Clock, CheckCircle2, Eye, Download, ArrowLeft,
} from "lucide-react";

interface WholesaleOrder {
  id: string;
  date: string;
  items: number;
  total: string;
  status: string;
  paymentStatus: string;
}

const seedOrders: WholesaleOrder[] = [
  { id: "WS-2847", date: "2026-06-28", items: 12, total: "$4,250", status: "delivered", paymentStatus: "paid" },
  { id: "WS-2831", date: "2026-06-25", items: 8, total: "$2,800", status: "in_transit", paymentStatus: "paid" },
  { id: "WS-2819", date: "2026-06-22", items: 24, total: "$8,900", status: "processing", paymentStatus: "net_30" },
  { id: "WS-2805", date: "2026-06-18", items: 6, total: "$1,950", status: "delivered", paymentStatus: "paid" },
  { id: "WS-2798", date: "2026-06-15", items: 15, total: "$5,600", status: "delivered", paymentStatus: "paid" },
  { id: "WS-2780", date: "2026-06-10", items: 30, total: "$12,400", status: "delivered", paymentStatus: "net_30" },
  { id: "WS-2765", date: "2026-06-05", items: 9, total: "$3,100", status: "delivered", paymentStatus: "paid" },
  { id: "WS-2750", date: "2026-05-28", items: 18, total: "$7,200", status: "delivered", paymentStatus: "paid" },
];

const statusColors: Record<string, string> = {
  delivered: "bg-emerald-50 text-emerald-700",
  in_transit: "bg-blue-50 text-blue-700",
  processing: "bg-amber-50 text-amber-700",
  pending: "bg-gray-50 text-gray-600",
  cancelled: "bg-red-50 text-red-700",
};

const statusIcons: Record<string, typeof Package> = {
  delivered: CheckCircle2, in_transit: Truck, processing: Package, pending: Clock,
};

export default function WholesaleOrdersPage() {
  const [orders] = useState<WholesaleOrder[]>(seedOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/wholesale/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={16} className="text-gray-500" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Wholesale Orders</h2>
            <p className="text-xs text-gray-500">Track and manage your bulk orders</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white">
              <option value="all">All Status</option>
              <option value="processing">Processing</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Items</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Total</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Payment</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const StatusIcon = statusIcons[order.status] || Package;
                return (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">{order.id}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{order.items} items</td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-900">{order.total}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || "bg-gray-50 text-gray-600"}`}>
                        <StatusIcon size={10} /> {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${order.paymentStatus === "paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {order.paymentStatus.replace(/_/g, " ")}
                      </span>
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
