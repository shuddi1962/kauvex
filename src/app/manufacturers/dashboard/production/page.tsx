"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Factory, ArrowLeft, Loader2, ChevronDown, CheckCircle2, Clock,
  Camera, Upload, Send, AlertTriangle, Package, PlayCircle
} from "lucide-react";

interface OrderOption {
  id: string;
  orderNumber: string;
  buyerName: string;
  currentStage: string;
}

interface ProductionData {
  orderId: string;
  orderNumber: string;
  currentStage: string;
  stages: Array<{
    key: string;
    label: string;
    status: "completed" | "in_progress" | "pending";
    completedAt?: string;
    notes?: string;
  }>;
  milestonePhotos: Array<{ url: string; caption: string; uploadedAt: string }>;
  inspectionRequested: boolean;
  inspectionResult: string | null;
}

const allStages = [
  { key: "confirmed", label: "Confirmed" },
  { key: "materials_sourcing", label: "Materials Sourcing" },
  { key: "in_production", label: "In Production" },
  { key: "quality_control", label: "Quality Control" },
  { key: "ready_for_inspection", label: "Ready for Inspection" },
  { key: "packed", label: "Packed" },
  { key: "dispatched", label: "Dispatched" },
];

export default function ProductionPage() {
  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [production, setProduction] = useState<ProductionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProduction, setLoadingProduction] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/v1/manufacturers/orders");
        const json = await res.json();
        if (json.data) {
          const active = json.data.filter((o: { status: string }) => o.status === "active");
          setOrders(active);
          if (active.length > 0) {
            setSelectedOrderId(active[0].id);
          }
        }
      } catch {
        setOrders([
          { id: "ord-001", orderNumber: "MFG-2847", buyerName: "EuroParts GmbH", currentStage: "in_production" },
          { id: "ord-002", orderNumber: "MFG-2831", buyerName: "GlobalTextile Co.", currentStage: "quality_control" },
          { id: "ord-003", orderNumber: "MFG-2819", buyerName: "Lagos Retail Ltd", currentStage: "dispatched" },
        ]);
        setSelectedOrderId("ord-001");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!selectedOrderId) return;
    const fetchProduction = async () => {
      setLoadingProduction(true);
      try {
        const res = await fetch(`/api/v1/manufacturers/orders/${selectedOrderId}/production`);
        const json = await res.json();
        if (json.data) {
          setProduction(json.data);
        }
      } catch {
        const currentIdx = allStages.findIndex((s) => s.key === "in_production");
        setProduction({
          orderId: selectedOrderId,
          orderNumber: "MFG-2847",
          currentStage: "in_production",
          stages: allStages.map((s, i) => ({
            key: s.key,
            label: s.label,
            status: i < currentIdx ? "completed" : i === currentIdx ? "in_progress" : "pending",
            completedAt: i < currentIdx ? "2026-06-28" : undefined,
          })),
          milestonePhotos: [
            { url: "/placeholder-photo-1.jpg", caption: "Raw materials arrived", uploadedAt: "2026-06-25" },
            { url: "/placeholder-photo-2.jpg", caption: "Production line setup", uploadedAt: "2026-06-27" },
          ],
          inspectionRequested: false,
          inspectionResult: null,
        });
      } finally {
        setLoadingProduction(false);
      }
    };
    fetchProduction();
  }, [selectedOrderId]);

  const handleAdvanceStage = async () => {
    if (!production) return;
    const currentIdx = allStages.findIndex((s) => s.key === production.currentStage);
    if (currentIdx >= allStages.length - 1) return;

    setUpdatingStage(true);
    try {
      await fetch(`/api/v1/manufacturers/orders/${selectedOrderId}/production`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: allStages[currentIdx + 1].key }),
      });
      setProduction((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentStage: allStages[currentIdx + 1].key,
          stages: prev.stages.map((s, i) => ({
            ...s,
            status: i < currentIdx + 1 ? "completed" : i === currentIdx + 1 ? "in_progress" : "pending",
            completedAt: i === currentIdx ? new Date().toISOString() : s.completedAt,
          })),
        };
      });
    } catch {
      // silent
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleRequestInspection = async () => {
    if (!production) return;
    try {
      await fetch(`/api/v1/manufacturers/orders/${selectedOrderId}/production`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request_inspection" }),
      });
      setProduction((prev) => prev ? { ...prev, inspectionRequested: true } : prev);
    } catch {
      // silent
    }
  };

  const getCurrentStageIndex = () => {
    if (!production) return 0;
    return allStages.findIndex((s) => s.key === production.currentStage);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-kauvex-orange" size={32} />
      </div>
    );
  }

  const currentIdx = getCurrentStageIndex();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/manufacturers/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={16} className="text-gray-500" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-[#0A1628]">Production Tracker</h2>
              <p className="text-xs text-gray-500">Monitor and advance production stages</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Order Selector */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-4">
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">Select Order</label>
          <div className="relative">
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full h-10 px-3 pr-8 border border-gray-200 rounded-lg text-xs font-medium text-[#0A1628] appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} — {o.buyerName}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {loadingProduction ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-kauvex-orange" size={24} />
          </div>
        ) : production ? (
          <>
            {/* Visual Pipeline */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-[#0A1628]">Production Pipeline</h3>
                <div className="flex gap-2">
                  {currentIdx < allStages.length - 1 && (
                    <button
                      onClick={handleAdvanceStage}
                      disabled={updatingStage}
                      className="px-4 py-2 bg-[#FF6B00] text-white text-xs font-semibold rounded-lg hover:bg-[#e55f00] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {updatingStage ? <Loader2 size={12} className="animate-spin" /> : <PlayCircle size={12} />}
                      Advance to {allStages[currentIdx + 1]?.label}
                    </button>
                  )}
                  {production.currentStage === "ready_for_inspection" && !production.inspectionRequested && (
                    <button
                      onClick={handleRequestInspection}
                      className="px-4 py-2 border border-[#0A1628] text-[#0A1628] text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                    >
                      <AlertTriangle size={12} /> Request Inspection
                    </button>
                  )}
                </div>
              </div>

              {/* Pipeline Steps */}
              <div className="flex items-start gap-0 overflow-x-auto pb-4">
                {production.stages.map((stage, i) => {
                  const isCompleted = stage.status === "completed";
                  const isCurrent = stage.status === "in_progress";
                  const isPending = stage.status === "pending";

                  return (
                    <div key={stage.key} className="flex items-start flex-1 min-w-[100px]">
                      <div className="flex flex-col items-center flex-1">
                        {/* Circle */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          isCompleted ? "bg-green-500 text-white shadow-md shadow-green-500/20" :
                          isCurrent ? "bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/20 ring-4 ring-[#FF6B00]/10" :
                          "bg-gray-100 text-gray-400"
                        }`}>
                          {isCompleted ? <CheckCircle2 size={20} /> : i + 1}
                        </div>
                        {/* Label */}
                        <p className={`text-[10px] mt-2 text-center leading-tight font-medium ${
                          isCurrent ? "text-[#FF6B00] font-bold" :
                          isCompleted ? "text-green-600" :
                          "text-gray-400"
                        }`}>
                          {stage.label}
                        </p>
                        {/* Date */}
                        {stage.completedAt && (
                          <p className="text-[8px] text-gray-400 mt-0.5">
                            {new Date(stage.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {/* Connector Line */}
                      {i < production.stages.length - 1 && (
                        <div className={`w-8 h-0.5 mt-6 ${
                          isCompleted ? "bg-green-500" : "bg-gray-200"
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">Overall Progress</span>
                  <span className="text-xs font-bold text-[#0A1628]">
                    {Math.round(((currentIdx) / (allStages.length - 1)) * 100)}%
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B00] to-green-500 rounded-full transition-all duration-700"
                    style={{ width: `${((currentIdx) / (allStages.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload & Milestones */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Photos */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#0A1628] flex items-center gap-2">
                    <Camera size={15} className="text-[#FF6B00]" />
                    Milestone Photos
                  </h3>
                  <button className="px-3 py-1.5 bg-[#FF6B00]/10 text-[#FF6B00] text-xs font-semibold rounded-lg hover:bg-[#FF6B00]/20 transition-colors flex items-center gap-1.5">
                    <Upload size={12} /> Upload
                  </button>
                </div>
                {production.milestonePhotos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <Camera size={28} className="text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500">No photos uploaded yet</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Upload production milestone photos</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {production.milestonePhotos.map((photo, i) => (
                      <div key={i} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Camera size={20} />
                          </div>
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg">
                          <p className="text-[9px] text-white font-medium">{photo.caption}</p>
                          <p className="text-[8px] text-white/70">{photo.uploadedAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inspection Status */}
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#0A1628] mb-4">Inspection Status</h3>
                {production.inspectionRequested ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-800">Inspection Requested</p>
                        <p className="text-[10px] text-amber-600">Waiting for inspection partner assignment</p>
                      </div>
                    </div>
                    {production.inspectionResult && (
                      <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                        production.inspectionResult === "passed"
                          ? "bg-green-50 border-green-100"
                          : "bg-red-50 border-red-100"
                      }`}>
                        <CheckCircle2 size={16} className={production.inspectionResult === "passed" ? "text-green-600" : "text-red-600"} />
                        <div>
                          <p className={`text-xs font-semibold ${production.inspectionResult === "passed" ? "text-green-800" : "text-red-800"}`}>
                            Inspection {production.inspectionResult === "passed" ? "Passed" : "Failed"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <AlertTriangle size={28} className="text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500">No inspection requested</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Request inspection when ready for inspection stage</p>
                  </div>
                )}

                {/* Stage Notes */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Current Stage Notes</h4>
                  <textarea
                    placeholder="Add notes about the current production stage..."
                    className="w-full h-20 px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                  <button className="mt-2 px-3 py-1.5 bg-[#0A1628] text-white text-[10px] font-semibold rounded-lg hover:bg-[#0A1628]/90 transition-colors">
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 flex flex-col items-center justify-center py-16">
            <Factory size={40} className="text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-500">Select an order to view production</p>
          </div>
        )}
      </div>
    </div>
  );
}
