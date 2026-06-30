"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart, ArrowLeft, Search, Filter, Loader2, Eye,
  ChevronDown, Package, DollarSign, Calendar, Clock,
  CheckCircle2, AlertCircle, Truck, Factory
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  buyerName: string;
  totalValue: string;
  currency: string;
  currentStage: string;
  status: string;
  createdAt: string;
  milestoneStructure: Array<{ name: string; percent: number; status: string }>;
}

const stageConfig: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: "Confirmed", color: "text-blue-700", bg: "bg-blue-100" },
  materials_sourcing: { label: "Materials Sourcing", color: "text-amber-700", bg: "bg-amber-100" },
  in_production: { label: "In Production", color: "text-purple-700", bg: "bg-purple-100" },
  quality_control: { label: "Quality Control", color: "text-indigo-700", bg: "bg-indigo-100" },
  ready_for_inspection: { label: "Ready for Inspection", color: "text-cyan-700", bg: "bg-cyan-100" },
  packed: { label: "Packed", color: "text-teal-700", bg: "bg-teal-100" },
  dispatched: { label: "Dispatched", color: "text-green-700", bg: "bg-green-100" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "text-green-700", bg: "bg-green-100" },
  completed: { label: "Completed", color: "text-blue-700", bg: "bg-blue-100" },
  cancelled: { label: "Cancelled", color: "text-red-600", bg: "bg-red-100" },
  on_hold: { label: "On Hold", color: "text-amber-700", bg: "bg-amber-100" },
};

const stages = ["confirmed", "materials_sourcing", "in_production", "quality_control", "ready_for_inspection", "packed", "dispatched"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/v1/manufacturers/orders");
        const json = await res.json();
        if (json.data) {
          setOrders(json.data);
        }
      } catch {
        setOrders([
          {
            id: "ord-001",
            orderNumber: "MFG-2847",
            buyerName: "EuroParts GmbH",
            totalValue: "$17,000",
            currency: "USD",
            currentStage: "in_production",
            status: "active",
            createdAt: "2026-06-15",
            milestoneStructure: [
              { name: "Confirmed", percent: 30, status: "completed" },
              { name: "Materials Sourcing", percent: 20, status: "completed" },
              { name: "In Production", percent: 25, status: "in_progress" },
              { name: "Quality Control", percent: 10, status: "pending" },
              { name: "Ready for Inspection", percent: 5, status: "pending" },
              { name: "Packed", percent: 5, status: "pending" },
              { name: "Dispatched", percent: 5, status: "pending" },
            ],
          },
          {
            id: "ord-002",
            orderNumber: "MFG-2831",
            buyerName: "GlobalTextile Co.",
            totalValue: "$16,000",
            currency: "USD",
            currentStage: "quality_control",
            status: "active",
            createdAt: "2026-06-10",
            milestoneStructure: [
              { name: "Confirmed", percent: 30, status: "completed" },
              { name: "Materials Sourcing", percent: 15, status: "completed" },
              { name: "In Production", percent: 25, status: "completed" },
              { name: "Quality Control", percent: 15, status: "in_progress" },
              { name: "Ready for Inspection", percent: 5, status: "pending" },
              { name: "Packed", percent: 5, status: "pending" },
              { name: "Dispatched", percent: 5, status: "pending" },
            ],
          },
          {
            id: "ord-003",
            orderNumber: "MFG-2819",
            buyerName: "Lagos Retail Ltd",
            totalValue: "$18,000",
            currency: "USD",
            currentStage: "dispatched",
            status: "active",
            createdAt: "2026-06-01",
            milestoneStructure: [
              { name: "Confirmed", percent: 30, status: "completed" },
              { name: "Materials Sourcing", percent: 15, status: "completed" },
              { name: "In Production", percent: 20, status: "completed" },
              { name: "Quality Control", percent: 15, status: "completed" },
              { name: "Ready for Inspection", percent: 5, status: "completed" },
              { name: "Packed", percent: 5, status: "completed" },
              { name: "Dispatched", percent: 10, status: "completed" },
            ],
          },
          {
            id: "ord-004",
            orderNumber: "MFG-2805",
            buyerName: "Dubai Trading FZE",
            totalValue: "$19,200",
            currency: "USD",
            currentStage: "confirmed",
            status: "on_hold",
            createdAt: "2026-05-28",
            milestoneStructure: [
              { name: "Confirmed", percent: 30, status: "in_progress" },
              { name: "Materials Sourcing", percent: 20, status: "pending" },
              { name: "In Production", percent: 25, status: "pending" },
              { name: "Quality Control", percent: 10, status: "pending" },
              { name: "Ready for Inspection", percent: 5, status: "pending" },
              { name: "Packed", percent: 5, status: "pending" },
              { name: "Dispatched", percent: 5, status: "pending" },
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) =>
    searchQuery === "" ||
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStageIndex = (stage: string) => stages.indexOf(stage);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-kauvex-orange" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/manufacturers/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={16} className="text-gray-500" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-[#0A1628]">Orders</h2>
              <p className="text-xs text-gray-500">{orders.length} orders from buyers worldwide</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Search */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number or buyer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ShoppingCart size={40} className="text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">No orders found</p>
              <p className="text-xs text-gray-400 mt-1">Orders from accepted quotes will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Order #</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Buyer</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Value</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Stage</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => {
                    const stage = stageConfig[order.currentStage] || stageConfig.confirmed;
                    const status = statusConfig[order.status] || statusConfig.active;
                    const isExpanded = expandedOrder === order.id;
                    const stageIdx = getStageIndex(order.currentStage);

                    return (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td colSpan={7} className="p-0">
                          <div
                            className="flex items-center px-4 py-3 cursor-pointer"
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          >
                            <div className="w-[14%]">
                              <p className="text-xs font-bold text-[#0A1628]">{order.orderNumber}</p>
                            </div>
                            <div className="w-[20%]">
                              <p className="text-xs font-medium text-[#0A1628]">{order.buyerName}</p>
                            </div>
                            <div className="w-[12%]">
                              <p className="text-xs font-semibold text-[#0A1628]">{order.totalValue}</p>
                            </div>
                            <div className="w-[18%]">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${stage.bg} ${stage.color}`}>
                                {stage.label}
                              </span>
                            </div>
                            <div className="w-[10%]">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                            <div className="w-[14%]">
                              <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="w-[12%] flex items-center gap-1.5">
                              <Link
                                href={`/manufacturers/dashboard/production?order=${order.id}`}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                title="View production"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Factory size={13} className="text-gray-500" />
                              </Link>
                              <ChevronDown
                                size={13}
                                className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </div>
                          </div>

                          {/* Expanded Mini Timeline */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-0 ml-0">
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Production Timeline</h4>
                                <div className="flex items-center gap-0">
                                  {stages.map((s, i) => {
                                    const sConfig = stageConfig[s];
                                    const isCompleted = i < stageIdx;
                                    const isCurrent = i === stageIdx;
                                    const isPending = i > stageIdx;

                                    return (
                                      <div key={s} className="flex items-center flex-1">
                                        <div className="flex flex-col items-center">
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                            isCompleted ? "bg-green-500 text-white" :
                                            isCurrent ? "bg-[#FF6B00] text-white" :
                                            "bg-gray-200 text-gray-500"
                                          }`}>
                                            {isCompleted ? <CheckCircle2 size={12} /> : i + 1}
                                          </div>
                                          <span className={`text-[8px] mt-1 text-center leading-tight ${
                                            isCurrent ? "font-bold text-[#FF6B00]" :
                                            isCompleted ? "text-green-600" :
                                            "text-gray-400"
                                          }`}>
                                            {sConfig.label}
                                          </span>
                                        </div>
                                        {i < stages.length - 1 && (
                                          <div className={`flex-1 h-0.5 mx-1 ${
                                            isCompleted ? "bg-green-500" : "bg-gray-200"
                                          }`} />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
