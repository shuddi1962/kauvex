"use client";

import { useState, useEffect } from "react";
import { Box, AlertTriangle, RefreshCw, ShoppingCart, TrendingUp, Loader2 } from "lucide-react";

interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  reorderThreshold: number;
  monthlyUsage: number;
  projectedDays: number;
}

export default function WarehousePackagingStockPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/shipping/packaging")
      .then(r => r.json())
      .then(json => {
        const items = json.data || [];
        setStock(items.map((s: any) => ({
          id: s.id,
          sku: s.sku,
          name: s.name,
          category: s.category,
          currentStock: s.currentStock,
          reorderThreshold: s.reorderThreshold,
          monthlyUsage: s.monthlyUsage,
          projectedDays: s.projectedDays,
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStatus = (item: StockItem): { label: string; color: string } => {
    if (item.currentStock <= 0) return { label: "Out", color: "bg-red-100 text-red-700" };
    if (item.currentStock <= item.reorderThreshold) return { label: "Low", color: "bg-yellow-100 text-yellow-700" };
    return { label: "OK", color: "bg-green-100 text-green-700" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#0A1628]">Packaging Stock</h1>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{stock.filter(s => getStatus(s).label === "OK").length}</div>
          <p className="text-sm text-gray-500">In Stock</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{stock.filter(s => getStatus(s).label === "Low").length}</div>
          <p className="text-sm text-gray-500">Low Stock</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">{stock.filter(s => getStatus(s).label === "Out").length}</div>
          <p className="text-sm text-gray-500">Out of Stock</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-[#0A1628]">{stock.reduce((a, b) => a + b.currentStock, 0).toLocaleString()}</div>
          <p className="text-sm text-gray-500">Total Units</p>
        </div>
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-1 gap-3">
        {stock.map((item) => {
          const status = getStatus(item);
          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                status.label === "OK" ? "bg-green-50" : status.label === "Low" ? "bg-yellow-50" : "bg-red-50"
              }`}>
                <Box size={20} className={status.label === "OK" ? "text-green-600" : status.label === "Low" ? "text-yellow-600" : "text-red-600"} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-[#0A1628]">{item.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
                </div>
                <p className="text-xs text-gray-500">{item.sku} • {item.category} • {item.monthlyUsage}/mo usage</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#0A1628]">{item.currentStock}</p>
                <p className="text-[10px] text-gray-500">{item.projectedDays} days left</p>
              </div>
              {(status.label === "Low" || status.label === "Out") && (
                <button className="text-xs bg-[#FF6B00] text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 flex items-center gap-1">
                  <ShoppingCart size={12} /> Restock
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Usage Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-[#0A1628] flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-[#FF6B00]" /> Monthly Usage Trend
        </h3>
        <div className="h-32 flex items-end gap-2">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, i) => {
            const height = [70, 55, 80, 65, 90, 75][i];
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-orange/20 rounded-t" style={{ height: `${height}%` }} />
                <span className="text-[9px] text-gray-500">{month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
