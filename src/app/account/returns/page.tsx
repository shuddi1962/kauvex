"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Plus, ChevronRight, Clock, CheckCircle, AlertCircle, Truck, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReturnForm from "@/components/returns/ReturnForm";

interface ReturnItem {
  id: string;
  orderId: string;
  type: string;
  status: string;
  description: string;
  openedAt: string;
  resolvedAt: string | null;
  order: { orderNumber: string };
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: { id: string; productId: string; productName: string; productImage: string | null; quantity: number }[];
  status: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending Review", color: "bg-yellow-50 text-yellow-700", icon: Clock },
  open: { label: "Under Review", color: "bg-blue-50 text-blue-600", icon: Clock },
  investigating: { label: "Investigating", color: "bg-purple-50 text-purple-600", icon: Truck },
  resolved: { label: "Resolved", color: "bg-green-50 text-green-700", icon: CheckCircle },
  closed: { label: "Closed", color: "bg-gray-50 text-gray-500", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-green-50 text-green-700", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-600", icon: XCircle },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-600", icon: AlertCircle },
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [retRes, ordRes] = await Promise.all([
          fetch("/api/v1/returns?limit=50"),
          fetch("/api/v1/orders?limit=50"),
        ]);
        if (retRes.ok) {
          const retData = await retRes.json();
          setReturns(retData.data || []);
          setTotal(retData.total || 0);
        }
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          setOrders((ordData.data || []).filter((o: OrderSummary) =>
            ["pending", "processing", "confirmed", "delivered", "completed"].includes(o.status)
          ));
        }
      } catch {
        // keep empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmitReturn = async (data: { orderId: string; productId: string; reason: string; description: string; photos: string[] }) => {
    const res = await fetch("/api/v1/returns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: data.orderId,
        productId: data.productId,
        reason: data.reason,
        description: data.description,
        photos: data.photos.length > 0 ? data.photos : undefined,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to submit return");
    setReturns((prev) => [json.data, ...prev]);
    setTotal((prev) => prev + 1);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-[#0A1628]">Returns & RMA</h1>
          <p className="text-sm text-gray-500 mt-1">{total} return request{total !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#FF6B00] hover:bg-[#e06000] text-white gap-2">
          <Plus size={16} /> Request Return
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <ReturnForm orders={orders} onSubmit={handleSubmitReturn} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {returns.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <RotateCcw size={28} className="text-[#FF6B00]" />
          </div>
          <h3 className="text-lg font-semibold text-[#0A1628] mb-2">No return requests yet</h3>
          <p className="text-sm text-gray-500 mb-4">You haven&apos;t requested any returns. Click the button above to start one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => {
            const config = statusConfig[ret.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <Link
                key={ret.id}
                href={`/account/returns/${ret.id}`}
                className="block bg-white rounded-xl border border-border p-5 hover:shadow-soft transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                      <RotateCcw size={18} className="text-[#FF6B00]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0A1628]">Return #{ret.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500">Order {ret.order?.orderNumber || ret.orderId.slice(0, 8)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}>
                    <StatusIcon size={12} /> {config.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 line-clamp-1">{ret.description?.split("\n")[0] || "No description"}</p>
                  <ChevronRight size={16} className="text-gray-400 shrink-0" />
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Opened: {new Date(ret.openedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}