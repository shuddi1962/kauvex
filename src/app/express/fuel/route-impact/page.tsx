"use client";

import { useState, useEffect } from "react";
import {
  Loader2, AlertTriangle, ArrowRight, TrendingUp, TrendingDown,
  Calendar, BarChart3, Clock, DollarSign, Info
} from "lucide-react";

interface RateBreakdown {
  baseRate: number;
  fuelSurcharge: number;
  total: number;
  serviceLevel: string;
}

interface HistoryPoint {
  date: string;
  fuelPrice: number;
  shippingRate: number;
}

interface SurchargeInfo {
  currentRate: number;
  projectedRate: number;
  cheapestMonth: string;
  trend: "up" | "down" | "stable";
}

export default function RouteImpactPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [serviceLevel, setServiceLevel] = useState("standard");
  const [period, setPeriod] = useState("1mo");
  const [breakdown, setBreakdown] = useState<RateBreakdown | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [surcharge, setSurcharge] = useState<SurchargeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  async function fetchRouteData() {
    if (!origin || !destination) return;
    setLoading(true);
    setError(null);
    try {
      const [histRes, surRes] = await Promise.all([
        fetch(`/api/v1/fuel/history?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&serviceLevel=${serviceLevel}&period=${period}`),
        fetch(`/api/v1/fuel/surcharge?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&serviceLevel=${serviceLevel}`),
      ]);
      const hist = await histRes.json();
      const sur = await surRes.json();
      setHistory(hist.data ?? []);
      setSurcharge(sur.data ?? null);
      if (hist.data?.length > 0) {
        const latest = hist.data[hist.data.length - 1];
        setBreakdown({
          baseRate: latest.shippingRate - latest.fuelPrice * 0.15,
          fuelSurcharge: latest.fuelPrice * 0.15,
          total: latest.shippingRate,
          serviceLevel,
        });
      }
      setFetched(true);
    } catch {
      setError("Failed to load route data");
    } finally {
      setLoading(false);
    }
  }

  const maxFuel = Math.max(...history.map(h => h.fuelPrice), 1);
  const maxRate = Math.max(...history.map(h => h.shippingRate), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">Route Impact Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">Analyze how fuel prices affect shipping rates on specific routes</p>
      </div>

      {/* Route Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Origin</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Lagos"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/30"
            />
          </div>
          <div className="flex items-center justify-center md:justify-start md:pt-6">
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Abuja"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/30"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Service</label>
              <select
                value={serviceLevel}
                onChange={(e) => setServiceLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/30 bg-white"
              >
                <option value="standard">Standard</option>
                <option value="express">Express</option>
                <option value="same-day">Same Day</option>
              </select>
            </div>
            <button
              onClick={fetchRouteData}
              disabled={loading || !origin || !destination}
              className="px-5 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold hover:bg-[#FF6B00]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 inline mr-1" />{error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
        </div>
      )}

      {!loading && fetched && !error && (
        <>
          {/* Period Selector */}
          <div className="flex gap-2">
            {["1mo", "3mo", "6mo"].map((p) => (
              <button
                key={p}
                onClick={() => { setPeriod(p); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p ? "bg-[#0A1628] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {p === "1mo" ? "1 Month" : p === "3mo" ? "3 Months" : "6 Months"}
              </button>
            ))}
          </div>

          {/* Rate Breakdown */}
          {breakdown && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Base Rate</span>
                <p className="text-2xl font-bold text-[#0A1628] mt-2">₦{breakdown.baseRate.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">{breakdown.serviceLevel} service</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fuel Surcharge</span>
                <p className="text-2xl font-bold text-[#FF6B00] mt-2">₦{breakdown.fuelSurcharge.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Included in total</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Rate</span>
                <p className="text-2xl font-bold text-[#0A1628] mt-2">₦{breakdown.total.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Current shipping cost</p>
              </div>
            </div>
          )}

          {/* Correlation Chart */}
          {history.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-[#0A1628]">Fuel Price vs Shipping Rate</h2>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#FF6B00]" /> Fuel Price</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0A1628]" /> Shipping Rate</span>
                </div>
              </div>
              <div className="relative h-64">
                <div className="absolute inset-0 flex items-end gap-1">
                  {history.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#0A1628] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                        Fuel: ₦{h.fuelPrice.toLocaleString()} | Rate: ₦{h.shippingRate.toLocaleString()}
                      </div>
                      <div className="flex items-end gap-0.5 w-full">
                        <div
                          className="flex-1 bg-[#FF6B00] rounded-t transition-all"
                          style={{ height: `${(h.fuelPrice / maxFuel) * 200}px` }}
                        />
                        <div
                          className="flex-1 bg-[#0A1628] rounded-t transition-all"
                          style={{ height: `${(h.shippingRate / maxRate) * 200}px` }}
                        />
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1">{h.date.slice(5)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Surcharge Info */}
          {surcharge && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-[#FF6B00]" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Surcharge</span>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">{surcharge.currentRate}%</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#FF6B00]" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Projected Rate</span>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">{surcharge.projectedRate}%</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  {surcharge.trend === "up" ? <TrendingUp className="w-3 h-3 text-red-500" /> : surcharge.trend === "down" ? <TrendingDown className="w-3 h-3 text-green-500" /> : <Info className="w-3 h-3 text-gray-400" />}
                  {surcharge.trend} trend
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#FF6B00]" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cheapest Time</span>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">{surcharge.cheapestMonth}</p>
                <p className="text-xs text-gray-400 mt-1">Best month to ship</p>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !fetched && (
        <div className="text-center py-16 text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Enter an origin and destination to analyze route impact</p>
        </div>
      )}
    </div>
  );
}
