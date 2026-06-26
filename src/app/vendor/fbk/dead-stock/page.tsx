"use client";

import { useState, useEffect } from "react";
import {
  Package,
  AlertTriangle,
  Trash2,
  Tag,
  Layers,
  DollarSign,
  Gift,
  TrendingDown,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  RefreshCw,
  X,
} from "lucide-react";

interface DeadStockItem {
  id: string;
  name: string;
  sku: string;
  imageUrl: string;
  unitsInStock: number;
  daysSinceLastSale: number;
  storageCostToDate: number;
  originalPrice: number;
  currentPrice: number;
  category: string;
  costPerUnit: number;
}

interface RecoveryOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  projectedRevenue: number;
  breakEvenPrice?: number;
  removalCost?: number;
  taxDeduction?: number;
  netOutcome: number;
  netOutcomeType: "positive" | "negative" | "neutral";
}

export default function DeadStockRecoveryPage() {
  const [items, setItems] = useState<DeadStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ item: DeadStockItem; option: RecoveryOption } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);

  useEffect(() => {
    fetchDeadStock();
  }, []);

  const fetchDeadStock = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/vendor/fbk/dead-stock");
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setItems(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (): DeadStockItem[] => [
    {
      id: "1",
      name: "Vintage Leather Journal",
      sku: "VLJ-001",
      imageUrl: "",
      unitsInStock: 48,
      daysSinceLastSale: 142,
      storageCostToDate: 288.0,
      originalPrice: 35.0,
      currentPrice: 35.0,
      category: "Stationery",
      costPerUnit: 8.5,
    },
    {
      id: "2",
      name: "Bluetooth Speaker Mini",
      sku: "BSM-002",
      imageUrl: "",
      unitsInStock: 22,
      daysSinceLastSale: 118,
      storageCostToDate: 176.0,
      originalPrice: 49.99,
      currentPrice: 49.99,
      category: "Electronics",
      costPerUnit: 15.0,
    },
    {
      id: "3",
      name: "Yoga Mat Premium 6mm",
      sku: "YMP-003",
      imageUrl: "",
      unitsInStock: 35,
      daysSinceLastSale: 95,
      storageCostToDate: 210.0,
      originalPrice: 42.0,
      currentPrice: 42.0,
      category: "Fitness",
      costPerUnit: 12.0,
    },
    {
      id: "4",
      name: "Ceramic Plant Pot Set (3pk)",
      sku: "CPP-004",
      imageUrl: "",
      unitsInStock: 60,
      daysSinceLastSale: 167,
      storageCostToDate: 480.0,
      originalPrice: 28.0,
      currentPrice: 28.0,
      category: "Home & Garden",
      costPerUnit: 6.0,
    },
  ];

  const getRecoveryOptions = (item: DeadStockItem): RecoveryOption[] => {
    const flashSalePrice = +(item.originalPrice * 0.4).toFixed(2);
    const bundlePrice = +(item.originalPrice * 0.6).toFixed(2);
    const breakEven = +item.costPerUnit.toFixed(2);
    const removalCostPerUnit = 2.5;
    const totalRemoval = +(removalCostPerUnit * item.unitsInStock).toFixed(2);

    return [
      {
        id: "flash",
        label: "Flash Sale",
        description: `Auto-create a 60% discount for ${item.unitsInStock} units at $${flashSalePrice} each`,
        icon: <Tag size={18} className="text-amber-400" />,
        projectedRevenue: +(flashSalePrice * item.unitsInStock).toFixed(2),
        netOutcome: +((flashSalePrice - item.costPerUnit) * item.unitsInStock - item.storageCostToDate).toFixed(2),
        netOutcomeType: (flashSalePrice - item.costPerUnit) * item.unitsInStock - item.storageCostToDate > 0 ? "positive" : "negative",
      },
      {
        id: "bundle",
        label: "Bundle with Fast Mover",
        description: `Bundle with a top seller at a combined price, estimated $${bundlePrice} per unit`,
        icon: <Layers size={18} className="text-purple-400" />,
        projectedRevenue: +(bundlePrice * item.unitsInStock).toFixed(2),
        netOutcome: +((bundlePrice - item.costPerUnit) * item.unitsInStock - item.storageCostToDate).toFixed(2),
        netOutcomeType: (bundlePrice - item.costPerUnit) * item.unitsInStock - item.storageCostToDate > 0 ? "positive" : "negative",
      },
      {
        id: "reduce",
        label: `Reduce Price to $${breakEven}`,
        description: `Break-even at cost. Shows break-even point with zero profit`,
        icon: <TrendingDown size={18} className="text-blue-400" />,
        projectedRevenue: +(breakEven * item.unitsInStock).toFixed(2),
        breakEvenPrice: breakEven,
        netOutcome: +(-item.storageCostToDate).toFixed(2),
        netOutcomeType: "negative",
      },
      {
        id: "remove",
        label: "Remove from FBK",
        description: `Pay $${totalRemoval} removal fee vs $${item.storageCostToDate.toFixed(2)} continued monthly storage`,
        icon: <Trash2 size={18} className="text-red-400" />,
        projectedRevenue: 0,
        removalCost: totalRemoval,
        netOutcome: +(item.storageCostToDate - totalRemoval).toFixed(2),
        netOutcomeType: item.storageCostToDate - totalRemoval > 0 ? "positive" : "negative",
      },
      {
        id: "donate",
        label: "Donate",
        description: "Tax-deductible donation. Estimated tax receipt value shown.",
        icon: <Gift size={18} className="text-emerald-400" />,
        projectedRevenue: 0,
        taxDeduction: +(item.costPerUnit * item.unitsInStock * 0.3).toFixed(2),
        netOutcome: +(item.costPerUnit * item.unitsInStock * 0.3 - item.storageCostToDate).toFixed(2),
        netOutcomeType: "neutral",
      },
    ];
  };

  const totalStorageCost = items.reduce((sum, i) => sum + i.storageCostToDate, 0);
  const totalUnits = items.reduce((sum, i) => sum + i.unitsInStock, 0);

  const handleTakeAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    try {
      await fetch("/api/v1/vendor/fbk/dead-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: actionModal.item.id,
          action: actionModal.option.id,
        }),
      });
      setActionSuccess(true);
      setTimeout(() => {
        setActionModal(null);
        setActionSuccess(false);
        fetchDeadStock();
      }, 1500);
    } catch {
      setActionModal(null);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A1628" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Scanning inventory for dead stock...</p>
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
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="text-red-400" size={22} />
              </div>
              <h1 className="text-2xl font-bold text-white">Dead Stock Recovery</h1>
            </div>
            <p className="text-white/50 text-sm">
              Products with no sales in 90+ days &mdash; take action to recover costs
            </p>
          </div>
          <button
            onClick={fetchDeadStock}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors text-sm"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Package size={18} className="text-red-400" />
              </div>
              <span className="text-white/50 text-sm">Dead Stock Units</span>
            </div>
            <p className="text-3xl font-bold text-red-400">{totalUnits.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <DollarSign size={18} className="text-amber-400" />
              </div>
              <span className="text-white/50 text-sm">Storage Cost to Date</span>
            </div>
            <p className="text-3xl font-bold text-amber-400">${totalStorageCost.toFixed(2)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
                <Clock size={18} className="text-[#FF6B00]" />
              </div>
              <span className="text-white/50 text-sm">SKUs Affected</span>
            </div>
            <p className="text-3xl font-bold text-[#FF6B00]">{items.length}</p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => {
            const options = getRecoveryOptions(item);
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
              >
                {/* Main Row */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-semibold truncate">{item.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                          Dead
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/50">
                        <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded">{item.sku}</span>
                        <span>{item.category}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-white/40 text-xs mb-1">Units</p>
                        <p className="text-lg font-bold text-white">{item.unitsInStock}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">Days Idle</p>
                        <p className="text-lg font-bold text-red-400">{item.daysSinceLastSale}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">Storage Cost</p>
                        <p className="text-lg font-bold text-amber-400">${item.storageCostToDate.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-white/40" />
                      ) : (
                        <ChevronDown size={18} className="text-white/40" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded: Recovery Options */}
                {isExpanded && (
                  <div className="border-t border-white/10 p-4 bg-white/[0.02]">
                    <p className="text-white/60 text-sm font-medium mb-3">Recovery Options</p>
                    <div className="space-y-3">
                      {options.map((opt) => (
                        <div
                          key={opt.id}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {opt.icon}
                              <div className="min-w-0">
                                <p className="text-white font-medium text-sm">{opt.label}</p>
                                <p className="text-white/50 text-xs mt-0.5">{opt.description}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-white/40 text-xs">Net Outcome</p>
                                <p
                                  className={`font-bold text-sm ${
                                    opt.netOutcomeType === "positive"
                                      ? "text-emerald-400"
                                      : opt.netOutcomeType === "negative"
                                      ? "text-red-400"
                                      : "text-white/60"
                                  }`}
                                >
                                  {opt.netOutcome >= 0 ? "+" : ""}${opt.netOutcome.toFixed(2)}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionModal({ item, option: opt });
                                }}
                                className="px-4 py-2 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                              >
                                Take Action
                              </button>
                            </div>
                          </div>

                          {/* Cost Projection Bars */}
                          {opt.projectedRevenue > 0 && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <div className="flex justify-between text-xs text-white/40 mb-1">
                                  <span>Projected Revenue</span>
                                  <span>${opt.projectedRevenue.toFixed(2)}</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{
                                      width: `${Math.min((opt.projectedRevenue / (item.originalPrice * item.unitsInStock)) * 100, 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs text-white/40 mb-1">
                                  <span>vs Original Value</span>
                                  <span>${(item.originalPrice * item.unitsInStock).toFixed(2)}</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-white/20 rounded-full" style={{ width: "100%" }} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">No Dead Stock Found</h3>
            <p className="text-white/50 text-sm">All your FBK inventory is performing well.</p>
          </div>
        )}
      </div>

      {/* Action Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !actionLoading && setActionModal(null)} />
          <div className="relative bg-[#0f1d32] border border-white/10 rounded-2xl w-full max-w-md p-6">
            {!actionSuccess ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-bold">Confirm Action</h3>
                  <button onClick={() => setActionModal(null)} className="text-white/40 hover:text-white">
                    <X size={20} />
                  </button>
                </div>

                <div className="bg-white/5 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    {actionModal.option.icon}
                    <span className="text-white font-medium">{actionModal.option.label}</span>
                  </div>
                  <p className="text-white/50 text-sm mb-2">{actionModal.item.name}</p>
                  <p className="text-white/60 text-sm">{actionModal.option.description}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Units affected</span>
                    <span className="text-white">{actionModal.item.unitsInStock}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-white/50">Net outcome</span>
                    <span
                      className={
                        actionModal.option.netOutcomeType === "positive"
                          ? "text-emerald-400 font-bold"
                          : actionModal.option.netOutcomeType === "negative"
                          ? "text-red-400 font-bold"
                          : "text-white/60"
                      }
                    >
                      {actionModal.option.netOutcome >= 0 ? "+" : ""}${actionModal.option.netOutcome.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setActionModal(null)}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTakeAction}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#FF6B00]/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {actionLoading ? "Processing..." : "Confirm"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
                <h3 className="text-white text-lg font-bold mb-2">Action Taken</h3>
                <p className="text-white/50 text-sm">{actionModal.option.label} has been applied.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
