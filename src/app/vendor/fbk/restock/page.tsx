"use client";

import { useState, useEffect } from "react";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Brain,
  Send,
} from "lucide-react";

interface RestockItem {
  id: string;
  name: string;
  sku: string;
  imageUrl: string;
  currentStock: number;
  salesVelocity: number;
  daysOfSupply: number;
  recommendedReorderQty: number;
  recommendedOrderDate: string;
  confidence: number;
  status: "critical" | "warning" | "healthy";
  category: string;
  leadTimeDays: number;
  safetyStock: number;
}

export default function PredictiveRestockPage() {
  const [items, setItems] = useState<RestockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "critical" | "warning">("all");
  const [sortBy, setSortBy] = useState<"urgency" | "velocity" | "supply">("urgency");
  const [poModalItem, setPoModalItem] = useState<RestockItem | null>(null);
  const [poQuantity, setPoQuantity] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/vendor/restock-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setItems(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (): RestockItem[] => [
    {
      id: "1",
      name: "Wireless Bluetooth Earbuds Pro",
      sku: "WBE-PRO-001",
      imageUrl: "",
      currentStock: 12,
      salesVelocity: 4.2,
      daysOfSupply: 3,
      recommendedReorderQty: 180,
      recommendedOrderDate: "2026-06-27",
      confidence: 94,
      status: "critical",
      category: "Electronics",
      leadTimeDays: 14,
      safetyStock: 30,
    },
    {
      id: "2",
      name: "Organic Face Moisturizer 100ml",
      sku: "OFM-100-002",
      imageUrl: "",
      currentStock: 28,
      salesVelocity: 2.8,
      daysOfSupply: 10,
      recommendedReorderQty: 120,
      recommendedOrderDate: "2026-06-30",
      confidence: 87,
      status: "warning",
      category: "Beauty",
      leadTimeDays: 7,
      safetyStock: 20,
    },
    {
      id: "3",
      name: "Stainless Steel Water Bottle 750ml",
      sku: "SSW-750-003",
      imageUrl: "",
      currentStock: 45,
      salesVelocity: 3.1,
      daysOfSupply: 14,
      recommendedReorderQty: 90,
      recommendedOrderDate: "2026-07-05",
      confidence: 91,
      status: "warning",
      category: "Kitchen",
      leadTimeDays: 10,
      safetyStock: 25,
    },
    {
      id: "4",
      name: "USB-C Fast Charging Cable 2m",
      sku: "USC-2M-004",
      imageUrl: "",
      currentStock: 5,
      salesVelocity: 6.5,
      daysOfSupply: 1,
      recommendedReorderQty: 250,
      recommendedOrderDate: "2026-06-26",
      confidence: 97,
      status: "critical",
      category: "Electronics",
      leadTimeDays: 5,
      safetyStock: 50,
    },
    {
      id: "5",
      name: "Bamboo Cutting Board Set",
      sku: "BCB-SET-005",
      imageUrl: "",
      currentStock: 62,
      salesVelocity: 1.4,
      daysOfSupply: 44,
      recommendedReorderQty: 0,
      recommendedOrderDate: "",
      confidence: 78,
      status: "healthy",
      category: "Kitchen",
      leadTimeDays: 12,
      safetyStock: 15,
    },
    {
      id: "6",
      name: "LED Desk Lamp Adjustable",
      sku: "LED-ADJ-006",
      imageUrl: "",
      currentStock: 18,
      salesVelocity: 3.8,
      daysOfSupply: 5,
      recommendedReorderQty: 150,
      recommendedOrderDate: "2026-06-28",
      confidence: 89,
      status: "critical",
      category: "Home",
      leadTimeDays: 14,
      safetyStock: 20,
    },
  ];

  const filtered = items
    .filter((item) => filter === "all" || item.status === filter)
    .sort((a, b) => {
      if (sortBy === "urgency") return a.daysOfSupply - b.daysOfSupply;
      if (sortBy === "velocity") return b.salesVelocity - a.salesVelocity;
      return a.daysOfSupply - b.daysOfSupply;
    });

  const criticalCount = items.filter((i) => i.status === "critical").length;
  const warningCount = items.filter((i) => i.status === "warning").length;
  const totalReorderValue = items.reduce(
    (sum, i) => sum + i.recommendedReorderQty,
    0
  );

  const getConfidenceColor = (c: number) => {
    if (c >= 90) return "text-emerald-400";
    if (c >= 75) return "text-amber-400";
    return "text-red-400";
  };

  const getConfidenceBg = (c: number) => {
    if (c >= 90) return "bg-emerald-500/20";
    if (c >= 75) return "bg-amber-500/20";
    return "bg-red-500/20";
  };

  const getStatusBadge = (status: string) => {
    if (status === "critical")
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
          <AlertTriangle size={12} /> Critical
        </span>
      );
    if (status === "warning")
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Clock size={12} /> Warning
        </span>
      );
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <CheckCircle size={12} /> Healthy
      </span>
    );
  };

  const openPOModal = (item: RestockItem) => {
    setPoModalItem(item);
    setPoQuantity(item.recommendedReorderQty);
  };

  const handleRaisePO = async () => {
    if (!poModalItem) return;
    setSubmitting(true);
    try {
      await fetch("/api/v1/vendor/restock-recommendations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: poModalItem.id,
          quantity: poQuantity,
        }),
      });
      setPoModalItem(null);
      fetchRecommendations();
    } catch {
      setPoModalItem(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A1628" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Analyzing inventory patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A1628" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center">
                <Brain className="text-[#FF6B00]" size={22} />
              </div>
              <h1 className="text-2xl font-bold text-white">Predictive Restock AI</h1>
            </div>
            <p className="text-white/50 text-sm">
              AI-powered restock recommendations based on sales velocity and lead times
            </p>
          </div>
          <button
            onClick={fetchRecommendations}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors text-sm"
          >
            <RefreshCw size={16} /> Refresh Analysis
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <span className="text-white/50 text-sm">Critical SKUs</span>
            </div>
            <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
            <p className="text-white/40 text-xs mt-1">Need immediate reorder</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock size={18} className="text-amber-400" />
              </div>
              <span className="text-white/50 text-sm">Warnings</span>
            </div>
            <p className="text-3xl font-bold text-amber-400">{warningCount}</p>
            <p className="text-white/40 text-xs mt-1">Within 14 days</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                <ShoppingCart size={18} className="text-[#FF6B00]" />
              </div>
              <span className="text-white/50 text-sm">Total Units to Reorder</span>
            </div>
            <p className="text-3xl font-bold text-[#FF6B00]">{totalReorderValue.toLocaleString()}</p>
            <p className="text-white/40 text-xs mt-1">Across all recommendations</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Package size={18} className="text-emerald-400" />
              </div>
              <span className="text-white/50 text-sm">Total SKUs Tracked</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{items.length}</p>
            <p className="text-white/40 text-xs mt-1">Active inventory items</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-2">
            {(["all", "critical", "warning"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-[#FF6B00] text-white"
                    : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/10"
                }`}
              >
                {f === "all" ? "All" : f === "critical" ? `Critical (${criticalCount})` : `Warning (${warningCount})`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-white/40 text-sm">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            >
              <option value="urgency">Days of Supply</option>
              <option value="velocity">Sales Velocity</option>
              <option value="supply">Lowest Stock</option>
            </select>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
            >
              {/* Main Row */}
              <div
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-semibold truncate">{item.name}</h3>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded">{item.sku}</span>
                    <span>{item.category}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 sm:gap-6 text-center">
                  <div>
                    <p className="text-white/40 text-xs mb-1">Stock</p>
                    <p className={`text-lg font-bold ${item.currentStock <= item.safetyStock ? "text-red-400" : "text-white"}`}>
                      {item.currentStock}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Velocity</p>
                    <p className="text-lg font-bold text-white">
                      {item.salesVelocity}
                      <span className="text-xs text-white/40 font-normal">/day</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Days Left</p>
                    <p className={`text-lg font-bold ${item.daysOfSupply <= 7 ? "text-red-400" : item.daysOfSupply <= 14 ? "text-amber-400" : "text-emerald-400"}`}>
                      {item.daysOfSupply}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Confidence</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-bold ${getConfidenceBg(item.confidence)} ${getConfidenceColor(item.confidence)}`}>
                      <Brain size={12} />
                      {item.confidence}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPOModal(item);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    <ShoppingCart size={14} /> Raise PO
                  </button>
                  {expandedId === item.id ? (
                    <ChevronUp size={18} className="text-white/40" />
                  ) : (
                    <ChevronDown size={18} className="text-white/40" />
                  )}
                </div>
              </div>

              {/* Expanded Detail */}
              {expandedId === item.id && (
                <div className="border-t border-white/10 p-4 bg-white/[0.02]">
                  {/* AI Recommendation */}
                  <div className="bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Brain className="text-[#FF6B00] mt-0.5 shrink-0" size={18} />
                      <div>
                        <p className="text-white font-medium text-sm mb-1">AI Recommendation</p>
                        <p className="text-white/70 text-sm leading-relaxed">
                          Based on your current velocity of{" "}
                          <span className="text-[#FF6B00] font-semibold">{item.salesVelocity} units/day</span>,
                          you have <span className="text-[#FF6B00] font-semibold">{item.daysOfSupply} days</span> of
                          supply. Order{" "}
                          <span className="text-[#FF6B00] font-semibold">{item.recommendedReorderQty} units</span> now
                          to maintain 30 days coverage.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/40 text-xs mb-1">Safety Stock</p>
                      <p className="text-white font-semibold">{item.safetyStock} units</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/40 text-xs mb-1">Lead Time</p>
                      <p className="text-white font-semibold">{item.leadTimeDays} days</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/40 text-xs mb-1">Order By</p>
                      <p className="text-white font-semibold">
                        {item.recommendedOrderDate
                          ? new Date(item.recommendedOrderDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "N/A"}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/40 text-xs mb-1">Reorder Qty</p>
                      <p className="text-[#FF6B00] font-semibold">{item.recommendedReorderQty} units</p>
                    </div>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-white/40 mb-1">
                      <span>Stock Level</span>
                      <span>
                        {item.currentStock} / {item.currentStock + item.recommendedReorderQty} units
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min((item.currentStock / (item.currentStock + item.recommendedReorderQty)) * 100, 100)}%`,
                          backgroundColor:
                            item.status === "critical"
                              ? "#EF4444"
                              : item.status === "warning"
                              ? "#F59E0B"
                              : "#10B981",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">All Good!</h3>
            <p className="text-white/50 text-sm">No items match the current filter.</p>
          </div>
        )}
      </div>

      {/* Purchase Order Modal */}
      {poModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPoModalItem(null)} />
          <div className="relative bg-[#0f1d32] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-white text-lg font-bold mb-1">Raise Purchase Order</h3>
            <p className="text-white/50 text-sm mb-6">{poModalItem.name}</p>

            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-sm block mb-1.5">SKU</label>
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm">
                  {poModalItem.sku}
                </div>
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1.5">Recommended Quantity</label>
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                  {poModalItem.recommendedReorderQty} units
                </div>
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1.5">Order Quantity</label>
                <input
                  type="number"
                  value={poQuantity}
                  onChange={(e) => setPoQuantity(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/50">Estimated lead time</span>
                  <span className="text-white">{poModalItem.leadTimeDays} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Coverage after restock</span>
                  <span className="text-emerald-400">~30 days</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setPoModalItem(null)}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRaisePO}
                disabled={submitting || poQuantity <= 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#FF6B00]/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Send size={14} />
                {submitting ? "Sending..." : "Submit PO"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
