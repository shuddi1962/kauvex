"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowLeft,
  Copy,
  MessageCircle,
  Printer,
} from "lucide-react";

interface OrderItem {
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  total: number;
  variant_info?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  shipping_address: {
    full_name: string;
    email: string;
    phone: string;
    address_line1: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  notes?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Package }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700", icon: Package },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  packed: { label: "Packed", color: "bg-indigo-100 text-indigo-700", icon: Package },
  dispatched: { label: "Dispatched", color: "bg-purple-100 text-purple-700", icon: Truck },
  "in-transit": { label: "In Transit", color: "bg-violet-100 text-violet-700", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  completed: { label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: Package },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-700", icon: Package },
  "on-hold": { label: "On Hold", color: "bg-yellow-100 text-yellow-700", icon: Clock },
};

const TIMELINE_STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "processing", label: "Processing" },
  { key: "packed", label: "Packed" },
  { key: "dispatched", label: "Dispatched" },
  { key: "in-transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/v1/orders/${orderId}`);
        if (res.ok) {
          const json = await res.json();
          setOrder(json.data || json.order || null);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-10 h-10 text-gray-300 animate-pulse mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0A1628] mb-2">Order Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">This order doesn&apos;t exist or you don&apos;t have access.</p>
          <Link href="/account/orders" className="text-sm text-[#FF6B00] hover:underline">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.key === order.status);

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#0A1628] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/account/orders" className="hover:text-[#0A1628] transition-colors">Orders</Link>
          <span>/</span>
          <span className="text-[#0A1628]">{order.order_number}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[#0A1628]">Order {order.order_number}</h1>
              <button onClick={copyOrderId} className="p-1 rounded hover:bg-gray-100" title="Copy order ID">
                <Copy className={`w-4 h-4 ${copied ? "text-green-500" : "text-gray-400"}`} />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Placed on {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">
              <MessageCircle className="w-3.5 h-3.5" /> Contact Support
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${statusConfig.color}`}>
              <StatusIcon className="w-5 h-5" />
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              {order.tracking_number && (
                <p className="text-xs text-gray-500 mt-1">
                  Tracking: <span className="font-mono">{order.tracking_number}</span>
                </p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {TIMELINE_STEPS.map((step, i) => {
              const isActive = i <= currentStepIndex;
              const isCurrent = step.key === order.status;
              return (
                <div key={step.key} className="flex items-center gap-1 flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? "bg-[#FF6B00] text-white"
                        : isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isActive && !isCurrent ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs ${isCurrent ? "font-semibold text-[#0A1628]" : isActive ? "text-gray-600" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`w-6 h-0.5 ${i < currentStepIndex ? "bg-green-300" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="font-semibold text-sm text-[#0A1628]">Items ({order.items.length})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A1628] truncate">{item.product_name}</p>
                      {item.variant_info && (
                        <p className="text-xs text-gray-500">{item.variant_info}</p>
                      )}
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0A1628]">₦{item.total.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">₦{item.price.toLocaleString()} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-sm text-[#0A1628] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Shipping Address
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-[#0A1628]">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.address_line1}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                <p>{order.shipping_address.country} {order.shipping_address.postal_code}</p>
                <p className="text-gray-400">{order.shipping_address.email} · {order.shipping_address.phone}</p>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-sm text-[#0A1628] mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₦{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>{order.shipping_cost === 0 ? "Free" : `₦${order.shipping_cost.toLocaleString()}`}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    <span>₦{order.tax.toLocaleString()}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₦{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-[#0A1628]">
                  <span>Total</span>
                  <span>₦{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-sm text-[#0A1628] mb-3">Payment</h2>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  order.payment_status === "paid" ? "bg-green-100 text-green-700" :
                  order.payment_status === "refunded" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {order.payment_status}
                </span>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h2 className="font-semibold text-sm text-[#0A1628] mb-2">Order Notes</h2>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {order.status === "delivered" && (
                <button className="w-full py-2.5 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-[#e65c00] transition-colors">
                  Leave a Review
                </button>
              )}
              {["pending", "processing", "confirmed"].includes(order.status) && (
                <button className="w-full py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                  Cancel Order
                </button>
              )}
              <Link
                href="/account/orders"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
