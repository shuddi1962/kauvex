"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Eye, Download, Search, Filter, ChevronDown } from "lucide-react";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  status: string;
  items: OrderItem[];
  total: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-warning bg-yellow-50" },
  processing: { label: "Processing", color: "text-blue bg-blue-50" },
  confirmed: { label: "Confirmed", color: "text-blue bg-blue-50" },
  packed: { label: "Packed", color: "text-blue bg-blue-50" },
  dispatched: { label: "Dispatched", color: "text-blue bg-blue-50" },
  "in-transit": { label: "In Transit", color: "text-blue bg-blue-50" },
  shipped: { label: "Shipped", color: "text-blue bg-blue-50" },
  delivered: { label: "Delivered", color: "text-success bg-green-50" },
  completed: { label: "Completed", color: "text-success bg-green-50" },
  cancelled: { label: "Cancelled", color: "text-red bg-red-50" },
  refunded: { label: "Refunded", color: "text-text-3 bg-off-white" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/v1/orders?limit=20");
        const json = await res.json();
        const data = (json.data || []) as Record<string, unknown>[];
        setOrders(data.map((o) => ({
          id: String(o.id || o.order_id),
          date: new Date(String(o.created_at || Date.now())).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          status: String(o.status || "pending"),
          items: Array.isArray(o.items) ? o.items.map((i: Record<string, unknown>) => ({
            name: String(i.name || i.product_name || "Product"),
            qty: Number(i.quantity || i.qty || 1),
            price: Number(i.price || i.unit_price || 0),
          })) : [{ name: "Product", qty: 1, price: Number(o.total || 0) }],
          total: Number(o.total || 0),
        })));
      } catch {
        setOrders([
          { id: "RSH-2026-001234", date: "Apr 2, 2026", status: "in-transit", items: [{ name: "Hikvision 4MP IP Dome Camera", qty: 2, price: 72500 }], total: 145000 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (searchQuery && !o.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-syne font-700 text-2xl text-text-1">My Orders</h1>
        <p className="text-sm text-text-3">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-border rounded-lg text-sm text-text-2 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue/20"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.map((order) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          return (
            <div key={order.id} className="bg-white rounded-xl border border-border overflow-hidden hover:border-blue/20 transition-colors">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-off-white/50">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-medium text-text-1">{order.id}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <span className="text-xs text-text-3">{order.date}</span>
              </div>
              {/* Items */}
              <div className="p-4">
                <div className="space-y-2 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-off-white rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-text-4" />
                        </div>
                        <div>
                          <p className="text-sm text-text-1">{item.name}</p>
                          <p className="text-xs text-text-3">Qty: {item.qty}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-text-1">₦{item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <p className="font-syne font-700 text-text-1">
                    Total: ₦{order.total.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/track-order?id=${order.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue border border-blue/20 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Track
                    </Link>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-2 border border-border rounded-lg hover:bg-off-white transition-colors">
                      <Download className="w-3 h-3" /> Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-border">
            <Package className="w-12 h-12 text-text-4 mx-auto mb-3" />
            <h3 className="font-syne font-600 text-text-1 mb-1">No orders found</h3>
            <p className="text-sm text-text-3">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
}
