"use client";

import { useState } from "react";
import {
  Search, Download, ChevronLeft, ChevronRight,
} from "lucide-react";

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Paid: "bg-green-100 text-green-700",
    Pending: "bg-amber-100 text-amber-700",
    Cancelled: "bg-red-100 text-red-700",
    Refunded: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${styles[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
};

const allOrders = [
  { id: "ORD-7842", customer: "Sarah Johnson", product: "Wireless Noise-Cancelling Headphones", amount: "$345.00", commission: "$34.50", date: "Jun 25, 2026", status: "Paid" },
  { id: "ORD-7839", customer: "Michael Chen", product: "Smart Home Security Camera Kit", amount: "$228.00", commission: "$22.80", date: "Jun 24, 2026", status: "Paid" },
  { id: "ORD-7835", customer: "Emily Rodriguez", product: "Organic Skincare Bundle", amount: "$89.50", commission: "$13.43", date: "Jun 24, 2026", status: "Pending" },
  { id: "ORD-7821", customer: "David Kim", product: "Ergonomic Office Chair Pro", amount: "$672.00", commission: "$67.20", date: "Jun 23, 2026", status: "Pending" },
  { id: "ORD-7818", customer: "Jessica Taylor", product: "Premium Yoga Mat Set", amount: "$124.00", commission: "$18.60", date: "Jun 23, 2026", status: "Paid" },
  { id: "ORD-7805", customer: "Robert Williams", product: "Portable Bluetooth Speaker", amount: "$79.99", commission: "$12.40", date: "Jun 21, 2026", status: "Paid" },
  { id: "ORD-7801", customer: "Amanda Lee", product: "Stainless Steel Water Bottle", amount: "$34.99", commission: "$5.25", date: "Jun 20, 2026", status: "Paid" },
  { id: "ORD-7792", customer: "James Brown", product: "Mechanical Gaming Keyboard RGB", amount: "$189.00", commission: "$28.90", date: "Jun 20, 2026", status: "Paid" },
  { id: "ORD-7788", customer: "Sophia Martinez", product: "Designer Canvas Wall Art", amount: "$156.00", commission: "$23.40", date: "Jun 19, 2026", status: "Cancelled" },
  { id: "ORD-7775", customer: "Daniel Anderson", product: "Wireless Charging Pad 3-in-1", amount: "$59.99", commission: "$9.00", date: "Jun 18, 2026", status: "Refunded" },
];

const ITEMS_PER_PAGE = 5;

export default function OrdersReport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = allOrders.filter((o) =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0A1628]">Orders Report</h1>
          <p className="text-xs text-gray-500">Detailed view of all referral orders and commissions</p>
        </div>
        <button className="flex items-center gap-1.5 h-8 px-3 bg-[#FF6B00] text-white text-[10px] font-bold rounded-lg hover:bg-[#FF6B00]/90 transition-colors">
          <Download size={12} /> Export CSV
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full h-8 pl-8 pr-3 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B00] focus:border-[#FF6B00]"
          />
        </div>
        <select className="h-8 px-2 text-[10px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]">
          <option>All Statuses</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Cancelled</option>
          <option>Refunded</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-[10px] font-semibold text-gray-500 px-4 py-2.5">Order ID</th>
                <th className="text-left text-[10px] font-semibold text-gray-500 px-4 py-2.5">Customer</th>
                <th className="text-left text-[10px] font-semibold text-gray-500 px-4 py-2.5">Product</th>
                <th className="text-right text-[10px] font-semibold text-gray-500 px-4 py-2.5">Amount</th>
                <th className="text-right text-[10px] font-semibold text-gray-500 px-4 py-2.5">Commission</th>
                <th className="text-left text-[10px] font-semibold text-gray-500 px-4 py-2.5">Date</th>
                <th className="text-left text-[10px] font-semibold text-gray-500 px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="text-[11px] font-mono font-semibold text-[#0A1628] px-4 py-2.5">{order.id}</td>
                  <td className="text-[11px] text-gray-700 px-4 py-2.5">{order.customer}</td>
                  <td className="text-[11px] text-gray-500 px-4 py-2.5">{order.product}</td>
                  <td className="text-[11px] font-semibold text-gray-800 px-4 py-2.5 text-right">{order.amount}</td>
                  <td className="text-[11px] font-bold text-green-700 px-4 py-2.5 text-right">{order.commission}</td>
                  <td className="text-[10px] text-gray-400 px-4 py-2.5">{order.date}</td>
                  <td className="px-4 py-2.5">{statusBadge(order.status)}</td>
                </tr>
              ))}
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-[11px] text-gray-400 py-8">No orders found matching your search</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-gray-400">
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} orders
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={12} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 text-[10px] font-semibold rounded-lg border transition-all ${
                page === currentPage
                  ? "bg-[#FF6B00] text-white border-[#FF6B00]"
                  : "border-gray-200 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
