"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, Eye, Package, Truck, CheckCircle2, Clock, XCircle, Loader2,
  ShoppingCart, FileText, Upload, RotateCcw, ShieldAlert, ChevronDown,
  MoreHorizontal, ArrowLeft, Plus, Download,
} from "lucide-react";
import { insforge } from "@/lib/insforge";
import VendorShell from "@/components/vendor/vendor-shell";

interface VendorOrder {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items: any[];
  total_amount: number;
  status: string;
  created_at: string;
  vendor_id: string;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock; bg: string }> = {
  pending: { color: "text-yellow-700", icon: Clock, bg: "bg-yellow-100" },
  processing: { color: "text-blue-700", icon: Package, bg: "bg-blue-100" },
  shipped: { color: "text-purple-700", icon: Truck, bg: "bg-purple-100" },
  delivered: { color: "text-green-700", icon: CheckCircle2, bg: "bg-green-100" },
  cancelled: { color: "text-red-700", icon: XCircle, bg: "bg-red-100" },
};

const demoReturns = [
  { id: "RET-001", orderId: "ORD-1001", customer: "John Doe", product: "Marine GPS Navigator 7-inch", reason: "Defective", status: "Pending", date: "2026-06-15", refund: 49.99 },
  { id: "RET-002", orderId: "ORD-1002", customer: "Jane Smith", product: "Yacht Anchor Chain 12mm", reason: "Wrong item", status: "Approved", date: "2026-06-14", refund: 34.99 },
  { id: "RET-003", orderId: "ORD-1003", customer: "Bob Johnson", product: "LED Navigation Light Set", reason: "No longer needed", status: "Rejected", date: "2026-06-12", refund: 24.99 },
  { id: "RET-004", orderId: "ORD-1004", customer: "Alice Brown", product: "Marine VHF Radio DSC", reason: "Defective", status: "Pending", date: "2026-06-10", refund: 89.99 },
  { id: "RET-005", orderId: "ORD-1005", customer: "Charlie Wilson", product: "Boat Cover Heavy Duty", reason: "Not as described", status: "Approved", date: "2026-06-08", refund: 129.99 },
];

const sidebarTabs = [
  { key: "manage", label: "Manage Orders", icon: ShoppingCart },
  { key: "fbk-order", label: "Create FBK Order", icon: Package },
  { key: "reports", label: "Order Reports", icon: FileText, href: "/vendor/orders/reports" },
  { key: "upload", label: "Upload Order Related Files", icon: Upload },
  { key: "returns", label: "Manage Returns", icon: RotateCcw },
  { key: "claims", label: "Manage Claims", icon: ShieldAlert },
];

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewOrder, setViewOrder] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState("manage");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await insforge.auth.getCurrentUser();
      if (!user) return;
      setVendorId(user.id);

      const { data, error } = await insforge.database
        .from("orders")
        .select("*")
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (e: any) {
      console.error("Fetch orders error:", e);
      showToast("error", e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.order_id?.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q);
    }
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const { error } = await insforge.database
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      showToast("success", `Order ${id} marked as ${status}`);
      await fetchOrders();
    } catch (e: any) {
      showToast("error", e.message || "Failed to update order");
    } finally {
      setUpdating(null);
    }
  };

  const getItemsCount = (items: any[]) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  const getReturnStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-amber-100 text-amber-700";
      case "Approved": return "bg-green-100 text-green-700";
      case "Rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <VendorShell title="Orders" subtitle="Track and manage your orders">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div className="flex gap-5">
        {/* LEFT SIDEBAR */}
        <div className="w-52 shrink-0">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="p-2 space-y-0.5">
              {sidebarTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = sidebarTab === tab.key;
                const content = (
                  <button onClick={() => setSidebarTab(tab.key)}
                    className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive ? "bg-orange/10 text-orange font-bold" : "text-text-3 hover:bg-gray-50 hover:text-text-1"
                    }`}>
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
                return tab.href ? (
                  <Link key={tab.key} href={tab.href}>{content}</Link>
                ) : (
                  <div key={tab.key}>{content}</div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* MANAGE ORDERS TAB */}
          {sidebarTab === "manage" && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{orders.length} total orders</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {["all", "pending", "processing", "shipped", "delivered"].map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 text-xs rounded-lg border capitalize ${filter === f ? "bg-purple-600 text-white border-purple-600" : "bg-white border-gray-200"}`}>
                    {f} ({f === "all" ? orders.length : orders.filter((o) => o.status === f).length})
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input placeholder="Search by order ID or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 text-sm border border-gray-200 rounded-lg" />
              </div>

              {loading ? (
                <div className="text-center py-12"><Loader2 size={24} className="animate-spin mx-auto text-gray-400" /></div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((order) => {
                    const cfg = statusConfig[order.status] || statusConfig.pending;
                    const StatusIcon = cfg.icon;
                    const itemsCount = getItemsCount(order.items);
                    return (
                      <div key={order.id} className="bg-white rounded-xl p-5 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm font-mono">{order.order_id || order.id.slice(0, 8)}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color} flex items-center gap-1`}><StatusIcon size={10} />{order.status}</span>
                            </div>
                            <p className="text-sm text-gray-700">{order.customer_name}</p>
                            <p className="text-xs text-gray-400">{order.created_at?.slice(0, 10)} · {itemsCount} item(s) · {order.shipping_address || "No address"}</p>
                          </div>
                          <p className="text-lg font-bold">₦{order.total_amount?.toLocaleString() || 0}</p>
                        </div>

                        {viewOrder === order.id && (
                          <div className="mb-3 p-4 bg-gray-50 rounded-lg border text-xs space-y-1">
                            <p><span className="text-gray-400">Customer:</span> {order.customer_name}</p>
                            <p><span className="text-gray-400">Email:</span> {order.customer_email}</p>
                            <p><span className="text-gray-400">Phone:</span> {order.customer_phone}</p>
                            <p><span className="text-gray-400">Address:</span> {order.shipping_address}</p>
                            <p><span className="text-gray-400">Items:</span> {itemsCount}</p>
                            <p><span className="text-gray-400">Total:</span> ₦{order.total_amount?.toLocaleString()}</p>
                            {order.items && Array.isArray(order.items) && (
                              <div className="mt-2 pt-2 border-t">
                                <p className="text-gray-400 mb-1">Order Items:</p>
                                {order.items.map((item: any, i: number) => (
                                  <p key={i} className="ml-2">• {item.name || item.product_name} x{item.quantity || 1} — ₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <button onClick={() => setViewOrder(viewOrder === order.id ? null : order.id)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                            <Eye size={14} className="text-gray-500" />
                          </button>
                          <div className="flex gap-2">
                            {order.status === "pending" && (
                              <button onClick={() => updateStatus(order.id, "processing")} disabled={updating === order.id}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                {updating === order.id ? "Processing..." : "Process"}
                              </button>
                            )}
                            {order.status === "processing" && (
                              <button onClick={() => updateStatus(order.id, "shipped")} disabled={updating === order.id}
                                className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 disabled:opacity-50">
                                {updating === order.id ? "Updating..." : "Mark Shipped"}
                              </button>
                            )}
                            {order.status === "shipped" && (
                              <button onClick={() => updateStatus(order.id, "delivered")} disabled={updating === order.id}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50">
                                {updating === order.id ? "Updating..." : "Mark Delivered"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">No orders found</div>
                  )}
                </div>
              )}
            </>
          )}

          {/* FBK ORDER TAB */}
          {sidebarTab === "fbk-order" && (
            <div className="bg-white rounded-xl border border-border p-6 text-center py-16">
              <Package size={40} className="mx-auto text-text-4 mb-3" />
              <h3 className="font-bold text-base text-text-1 mb-1">Create FBK Fulfillment Order</h3>
              <p className="text-sm text-text-4 mb-4">Send products from your FBK inventory to customers</p>
              <button onClick={() => showToast("success", "FBK order creation form opened")}
                className="inline-flex items-center gap-2 px-6 h-10 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90 transition-colors">
                <Plus size={14} /> Create FBK Order
              </button>
            </div>
          )}

          {/* UPLOAD FILES TAB */}
          {sidebarTab === "upload" && (
            <div className="bg-white rounded-xl border border-border p-6 text-center py-16">
              <Upload size={40} className="mx-auto text-text-4 mb-3" />
              <h3 className="font-bold text-base text-text-1 mb-1">Upload Order Related Files</h3>
              <p className="text-sm text-text-4 mb-4">Upload invoices, shipping labels, or other order documents</p>
              <label className="inline-flex items-center gap-2 px-6 h-10 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90 transition-colors cursor-pointer">
                <Upload size={14} /> Choose Files
                <input type="file" multiple className="hidden" />
              </label>
            </div>
          )}

          {/* RETURNS TAB */}
          {sidebarTab === "returns" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{demoReturns.length} return requests</p>
                <button onClick={() => showToast("success", "Return policy opened")}
                  className="flex items-center gap-1.5 px-4 h-9 border border-border text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                  <RotateCcw size={13} /> Return Policy
                </button>
              </div>

              <div className="bg-white rounded-xl border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/50">
                      {["Return ID", "Order", "Customer", "Product", "Reason", "Status", "Refund", "Date", "Actions"].map(h => (
                        <th key={h} className="text-left p-3 text-[10px] font-semibold text-text-4 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {demoReturns.map(r => (
                      <tr key={r.id} className="border-b border-border hover:bg-gray-50/50">
                        <td className="p-3 font-mono text-xs font-semibold">{r.id}</td>
                        <td className="p-3 font-mono text-xs">{r.orderId}</td>
                        <td className="p-3 text-xs">{r.customer}</td>
                        <td className="p-3 text-xs text-text-2">{r.product}</td>
                        <td className="p-3 text-xs text-text-4">{r.reason}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${getReturnStatusColor(r.status)}`}>{r.status}</span>
                        </td>
                        <td className="p-3 text-xs font-mono font-semibold">${r.refund.toFixed(2)}</td>
                        <td className="p-3 text-xs text-text-4">{r.date}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <button onClick={() => showToast("success", `Return ${r.id} approved`)}
                              className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded hover:bg-green-200">Approve</button>
                            <button onClick={() => showToast("error", `Return ${r.id} rejected`)}
                              className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded hover:bg-red-200">Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {demoReturns.length === 0 && (
                      <tr><td colSpan={9} className="p-8 text-center text-text-4 text-sm">No returns found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CLAIMS TAB */}
          {sidebarTab === "claims" && (
            <div className="bg-white rounded-xl border border-border p-6 text-center py-16">
              <ShieldAlert size={40} className="mx-auto text-text-4 mb-3" />
              <h3 className="font-bold text-base text-text-1 mb-1">Manage Claims</h3>
              <p className="text-sm text-text-4 mb-4">View and manage A-to-Z claims, chargebacks, and disputes</p>
              <button onClick={() => showToast("success", "Claims dashboard opened")}
                className="inline-flex items-center gap-2 px-6 h-10 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90 transition-colors">
                <ShieldAlert size={14} /> View Claims
              </button>
            </div>
          )}
        </div>
      </div>
    </VendorShell>
  );
}
