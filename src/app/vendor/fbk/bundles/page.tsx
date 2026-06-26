"use client";

import { useState, useEffect } from "react";
import {
  Layers,
  TrendingUp,
  Brain,
  CheckCircle,
  X,
  RefreshCw,
  Plus,
  BarChart3,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  Package,
  DollarSign,
  Eye,
  EyeOff,
} from "lucide-react";

interface BundleSuggestion {
  id: string;
  productA: {
    name: string;
    sku: string;
    price: number;
    imageUrl: string;
  };
  productB: {
    name: string;
    sku: string;
    price: number;
    imageUrl: string;
  };
  coPurchaseRate: number;
  potentialSavingPerOrder: number;
  suggestedBundlePrice: number;
  confidence: number;
  totalOrders: number;
}

interface ActiveBundle {
  id: string;
  name: string;
  products: string[];
  bundlePrice: number;
  originalPrice: number;
  ordersCount: number;
  revenue: number;
  conversionRate: number;
  status: "active" | "paused";
  createdAt: string;
}

export default function BundleOptimizerPage() {
  const [suggestions, setSuggestions] = useState<BundleSuggestion[]>([]);
  const [activeBundles, setActiveBundles] = useState<ActiveBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"suggestions" | "bundles">("suggestions");
  const [createModal, setCreateModal] = useState<BundleSuggestion | null>(null);
  const [bundlePrice, setBundlePrice] = useState(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sugRes, bundleRes] = await Promise.all([
        fetch("/api/v1/vendor/fbk/bundles/suggestions"),
        fetch("/api/v1/vendor/fbk/bundles/active"),
      ]);
      const sugData = await sugRes.json();
      const bundleData = await bundleRes.json();
      setSuggestions(sugData.suggestions || []);
      setActiveBundles(bundleData.bundles || []);
    } catch {
      setSuggestions(getMockSuggestions());
      setActiveBundles(getMockBundles());
    } finally {
      setLoading(false);
    }
  };

  const getMockSuggestions = (): BundleSuggestion[] => [
    {
      id: "1",
      productA: { name: "Wireless Bluetooth Earbuds Pro", sku: "WBE-PRO-001", price: 49.99, imageUrl: "" },
      productB: { name: "USB-C Fast Charging Cable 2m", sku: "USC-2M-004", price: 12.99, imageUrl: "" },
      coPurchaseRate: 73,
      potentialSavingPerOrder: 5.0,
      suggestedBundlePrice: 52.98,
      confidence: 92,
      totalOrders: 342,
    },
    {
      id: "2",
      productA: { name: "Organic Face Moisturizer 100ml", sku: "OFM-100-002", price: 24.99, imageUrl: "" },
      productB: { name: "Organic Face Serum 30ml", sku: "OFS-030-007", price: 32.99, imageUrl: "" },
      coPurchaseRate: 61,
      potentialSavingPerOrder: 7.5,
      suggestedBundlePrice: 45.98,
      confidence: 85,
      totalOrders: 198,
    },
    {
      id: "3",
      productA: { name: "Stainless Steel Water Bottle 750ml", sku: "SSW-750-003", price: 18.99, imageUrl: "" },
      productB: { name: "Bamboo Straw Set (4pk)", sku: "BSS-004-008", price: 8.99, imageUrl: "" },
      coPurchaseRate: 54,
      potentialSavingPerOrder: 3.0,
      suggestedBundlePrice: 20.98,
      confidence: 78,
      totalOrders: 156,
    },
    {
      id: "4",
      productA: { name: "LED Desk Lamp Adjustable", sku: "LED-ADJ-006", price: 39.99, imageUrl: "" },
      productB: { name: "Wireless Charging Pad", sku: "WCP-010-009", price: 22.99, imageUrl: "" },
      coPurchaseRate: 48,
      potentialSavingPerOrder: 8.0,
      suggestedBundlePrice: 50.98,
      confidence: 81,
      totalOrders: 124,
    },
    {
      id: "5",
      productA: { name: "Yoga Mat Premium 6mm", sku: "YMP-003", price: 42.0, imageUrl: "" },
      productB: { name: "Resistance Bands Set", sku: "RBS-SET-011", price: 15.99, imageUrl: "" },
      coPurchaseRate: 67,
      potentialSavingPerOrder: 6.0,
      suggestedBundlePrice: 51.99,
      confidence: 88,
      totalOrders: 271,
    },
  ];

  const getMockBundles = (): ActiveBundle[] => [
    {
      id: "1",
      name: "Home Office Essentials",
      products: ["LED Desk Lamp Adjustable", "Wireless Charging Pad", "USB-C Fast Charging Cable 2m"],
      bundlePrice: 64.97,
      originalPrice: 75.97,
      ordersCount: 89,
      revenue: 5782.33,
      conversionRate: 12.4,
      status: "active",
      createdAt: "2026-05-10",
    },
    {
      id: "2",
      name: "Skincare Starter Kit",
      products: ["Organic Face Moisturizer 100ml", "Organic Face Serum 30ml", "Bamboo Cotton Pads"],
      bundlePrice: 54.97,
      originalPrice: 72.97,
      ordersCount: 156,
      revenue: 8575.32,
      conversionRate: 18.7,
      status: "active",
      createdAt: "2026-04-22",
    },
    {
      id: "3",
      name: "Fitness Bundle",
      products: ["Yoga Mat Premium 6mm", "Resistance Bands Set", "Stainless Steel Water Bottle 750ml"],
      bundlePrice: 68.97,
      originalPrice: 76.98,
      ordersCount: 42,
      revenue: 2896.74,
      conversionRate: 9.2,
      status: "paused",
      createdAt: "2026-05-28",
    },
  ];

  const openCreateModal = (suggestion: BundleSuggestion) => {
    setCreateModal(suggestion);
    setBundlePrice(suggestion.suggestedBundlePrice);
  };

  const handleCreateBundle = async () => {
    if (!createModal) return;
    setCreating(true);
    try {
      await fetch("/api/v1/vendor/fbk/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestionId: createModal.id,
          bundlePrice,
        }),
      });
      setCreateModal(null);
      fetchData();
    } catch {
      setCreateModal(null);
    } finally {
      setCreating(false);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await fetch(`/api/v1/vendor/fbk/bundles/suggestions/${id}`, { method: "DELETE" });
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setSuggestions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const toggleBundleStatus = async (id: string) => {
    setActiveBundles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: b.status === "active" ? "paused" : "active" } : b))
    );
  };

  const getConfidenceColor = (c: number) => {
    if (c >= 90) return "text-emerald-400";
    if (c >= 75) return "text-amber-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A1628" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Analyzing order patterns...</p>
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
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Layers className="text-purple-400" size={22} />
              </div>
              <h1 className="text-2xl font-bold text-white">Bundle Optimizer</h1>
            </div>
            <p className="text-white/50 text-sm">
              AI-detected product pairs frequently ordered together
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors text-sm"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Sparkles size={18} className="text-purple-400" />
              </div>
              <span className="text-white/50 text-sm">Suggestions</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">{suggestions.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                <Layers size={18} className="text-[#FF6B00]" />
              </div>
              <span className="text-white/50 text-sm">Active Bundles</span>
            </div>
            <p className="text-3xl font-bold text-[#FF6B00]">
              {activeBundles.filter((b) => b.status === "active").length}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign size={18} className="text-emerald-400" />
              </div>
              <span className="text-white/50 text-sm">Bundle Revenue</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              ${activeBundles.reduce((sum, b) => sum + b.revenue, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("suggestions")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "suggestions"
                ? "bg-[#FF6B00] text-white"
                : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/10"
            }`}
          >
            <Sparkles size={16} /> Suggestions ({suggestions.length})
          </button>
          <button
            onClick={() => setTab("bundles")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "bundles"
                ? "bg-[#FF6B00] text-white"
                : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/10"
            }`}
          >
            <Layers size={16} /> Active Bundles ({activeBundles.length})
          </button>
        </div>

        {/* Suggestions Tab */}
        {tab === "suggestions" && (
          <div className="space-y-3">
            {suggestions.map((sug) => (
              <div
                key={sug.id}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Products */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                        <Package size={14} className="text-white/40" />
                        <div>
                          <p className="text-white text-sm font-medium">{sug.productA.name}</p>
                          <p className="text-white/40 text-xs">{sug.productA.sku} &bull; ${sug.productA.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-[#FF6B00] shrink-0" />
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                        <Package size={14} className="text-white/40" />
                        <div>
                          <p className="text-white text-sm font-medium">{sug.productB.name}</p>
                          <p className="text-white/40 text-xs">{sug.productB.sku} &bull; ${sug.productB.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-white/40 text-xs mb-1">Co-Purchase Rate</p>
                        <p className="text-white font-bold">{sug.coPurchaseRate}%</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-white/40 text-xs mb-1">Saving / Order</p>
                        <p className="text-emerald-400 font-bold">${sug.potentialSavingPerOrder.toFixed(2)}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-white/40 text-xs mb-1">Bundle Price</p>
                        <p className="text-[#FF6B00] font-bold">${sug.suggestedBundlePrice.toFixed(2)}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2.5">
                        <p className="text-white/40 text-xs mb-1">Orders</p>
                        <p className="text-white font-bold">{sug.totalOrders.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Confidence + Actions */}
                  <div className="flex flex-row lg:flex-col items-center gap-3 lg:min-w-[140px]">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${
                      sug.confidence >= 90 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      <Brain size={14} />
                      {sug.confidence}%
                    </div>
                    <button
                      onClick={() => openCreateModal(sug)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus size={14} /> Create Bundle
                    </button>
                    <button
                      onClick={() => handleDismiss(sug.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/50 hover:bg-white/10 text-sm transition-colors"
                    >
                      <X size={14} /> Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {suggestions.length === 0 && (
              <div className="text-center py-16">
                <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">No New Suggestions</h3>
                <p className="text-white/50 text-sm">All suggestions have been reviewed.</p>
              </div>
            )}
          </div>
        )}

        {/* Active Bundles Tab */}
        {tab === "bundles" && (
          <div className="space-y-3">
            {activeBundles.map((bundle) => {
              const savings = bundle.originalPrice - bundle.bundlePrice;
              return (
                <div
                  key={bundle.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold">{bundle.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            bundle.status === "active"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-white/10 text-white/50 border border-white/20"
                          }`}
                        >
                          {bundle.status === "active" ? "Active" : "Paused"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {bundle.products.map((p, i) => (
                          <span key={i} className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-white/60">
                            {p}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white/5 rounded-lg p-2.5">
                          <p className="text-white/40 text-xs mb-1">Bundle Price</p>
                          <p className="text-[#FF6B00] font-bold">${bundle.bundlePrice.toFixed(2)}</p>
                          <p className="text-white/30 text-xs line-through">${bundle.originalPrice.toFixed(2)}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2.5">
                          <p className="text-white/40 text-xs mb-1">Total Orders</p>
                          <p className="text-white font-bold">{bundle.ordersCount}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2.5">
                          <p className="text-white/40 text-xs mb-1">Revenue</p>
                          <p className="text-emerald-400 font-bold">${bundle.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2.5">
                          <p className="text-white/40 text-xs mb-1">Conversion</p>
                          <p className="text-white font-bold">{bundle.conversionRate}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2">
                      <button
                        onClick={() => toggleBundleStatus(bundle.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          bundle.status === "active"
                            ? "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"
                            : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                      >
                        {bundle.status === "active" ? (
                          <><EyeOff size={14} /> Pause</>
                        ) : (
                          <><Eye size={14} /> Resume</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Bundle Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !creating && setCreateModal(null)} />
          <div className="relative bg-[#0f1d32] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-bold">Create Bundle</h3>
              <button onClick={() => setCreateModal(null)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="bg-white/5 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Package size={14} className="text-white/40" />
                <span className="text-white text-sm">{createModal.productA.name}</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Package size={14} className="text-white/40" />
                <span className="text-white text-sm">{createModal.productB.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-white/40">Separate Total</span>
                  <p className="text-white font-semibold">
                    ${(createModal.productA.price + createModal.productB.price).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-white/40">AI Suggested</span>
                  <p className="text-[#FF6B00] font-semibold">${createModal.suggestedBundlePrice.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-white/60 text-sm block mb-1.5">Bundle Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={bundlePrice}
                onChange={(e) => setBundlePrice(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
              {bundlePrice > 0 && createModal.productA.price + createModal.productB.price > 0 && (
                <p className="text-emerald-400 text-xs mt-1">
                  Customer saves ${((createModal.productA.price + createModal.productB.price - bundlePrice)).toFixed(2)} per bundle
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCreateModal(null)}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBundle}
                disabled={creating || bundlePrice <= 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#FF6B00]/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Layers size={14} />
                {creating ? "Creating..." : "Create Bundle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
