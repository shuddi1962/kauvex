"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RotateCcw, ArrowLeft, Download, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReturnTimeline from "@/components/returns/ReturnTimeline";

interface ReturnDetail {
  id: string;
  orderId: string;
  status: string;
  type: string;
  description: string;
  customerEvidence: string[] | null;
  openedAt: string;
  resolvedAt: string | null;
  statusHistory: { status: string; label: string; date: string }[];
  order: { orderNumber: string; status: string; createdAt: string };
}

export default function ReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ret, setRet] = useState<ReturnDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/v1/returns/${params.id}`);
        if (res.ok) {
          const json = await res.json();
          setRet(json.data);
        } else {
          router.push("/account/returns");
        }
      } catch {
        router.push("/account/returns");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this return request?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/v1/returns/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        router.push("/account/returns");
      }
    } catch {
      // ignore
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (!ret) return null;

  const isPending = ret.status === "pending";
  const isResolved = ["resolved", "completed", "closed", "cancelled", "rejected"].includes(ret.status);

  return (
    <div>
      <button
        onClick={() => router.push("/account/returns")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0A1628] mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Returns
      </button>

      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <RotateCcw size={18} className="text-[#FF6B00]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0A1628]">Return #{ret.id.slice(0, 8)}</h1>
                <p className="text-sm text-gray-500">Order {ret.order?.orderNumber || ret.orderId.slice(0, 8)}</p>
              </div>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full capitalize
            ${isPending ? "bg-yellow-50 text-yellow-700" : ""}
            ${isResolved ? "bg-green-50 text-green-700" : ""}
            ${ret.status === "open" || ret.status === "investigating" ? "bg-blue-50 text-blue-600" : ""}
            ${ret.status === "cancelled" || ret.status === "rejected" ? "bg-red-50 text-red-600" : ""}
          `}>
            {ret.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-[#0A1628] mb-2">Reason for Return</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{ret.description || "No description provided"}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0A1628] mb-2">Order Details</h3>
            <p className="text-sm text-gray-600">Order Number: {ret.order?.orderNumber || "N/A"}</p>
            <p className="text-sm text-gray-600">Order Status: {ret.order?.status || "N/A"}</p>
            <p className="text-sm text-gray-600">
              Order Date: {ret.order?.createdAt ? new Date(ret.order.createdAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>

        {ret.customerEvidence && Array.isArray(ret.customerEvidence) && ret.customerEvidence.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-2">Attached Photos ({ret.customerEvidence.length})</h3>
            <div className="flex gap-3 flex-wrap">
              {ret.customerEvidence.map((photo: string, i: number) => (
                <a key={i} href={photo} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-[#FF6B00]/50 transition-all">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 border-[#FF6B00] text-[#FF6B00] hover:bg-orange-50">
            <Download size={16} /> Download Return Label
          </Button>
          {isPending && (
            <Button
              onClick={handleCancel}
              disabled={cancelling}
              variant="outline"
              className="gap-2 border-red-500 text-red-600 hover:bg-red-50"
            >
              {cancelling ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
              Cancel Return
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Status Timeline</h2>
        <ReturnTimeline statusHistory={ret.statusHistory} currentStatus={ret.status} />
      </div>
    </div>
  );
}