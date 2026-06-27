"use client";

import { useState, useEffect } from "react";
import {
  Loader2, AlertTriangle, Calendar, DollarSign, TrendingUp, TrendingDown,
  BarChart3, Download
} from "lucide-react";

interface FuelPricePoint {
  date: string;
  country: string;
  price: number;
}

interface SurchargeEntry {
  id: string;
  route: string;
  rate: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  reason: string;
}

interface DashboardSummary {
  thisMonth: number;
  thisQuarter: number;
  thisYear: number;
  allTime: number;
}

export default function FuelHistoryPage() {
  const [fuelPrices, setFuelPrices] = useState<FuelPricePoint[]>([]);
  const [surcharges, setSurcharges] = useState<SurchargeEntry[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("1mo");
  const [country, setCountry] = useState("NG");

  useEffect(() => {
    fetchHistory();
  }, [period, country]);

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    try {
      const [histRes, dashRes] = await Promise.all([
        fetch(`/api/v1/fuel/history?period=${period}&country=${country}`),
        fetch("/api/v1/fuel/dashboard"),
      ]);
      const hist = await histRes.json();
      const dash = await dashRes.json();
      setFuelPrices(hist.data?.fuelPrices ?? []);
      setSurcharges(hist.data?.surcharges ?? []);
      setSummary(dash.data?.surchargeSummary ?? null);
    } catch {
      setError("Failed to load fuel history");
    } finally {
      setLoading(false);
    }
  }

  const maxPrice = Math.max(...fuelPrices.map((fp) => fp.price), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Fuel History</h1>
          <p className="text-sm text-gray-500 mt-1">Track fuel price trends and surcharge history over time</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {["1mo", "3mo", "6mo", "1yr"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${period === p ? "bg-white text-[#0A1628] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {p === "1mo" ? "1M" : p === "3mo" ? "3M" : p === "6mo" ? "6M" : "1Y"}
            </button>
          ))}
        </div>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#FF6B00]"
        >
          <option value="NG">Nigeria</option>
          <option value="GB">United Kingdom</option>
          <option value="US">United States</option>
          <option value="AE">UAE</option>
          <option value="IN">India</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 inline mr-1" />{error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">This Month</span>
                <p className="text-2xl font-bold text-[#0A1628] mt-2">₦{summary.thisMonth.toLocaleString()}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">This Quarter</span>
                <p className="text-2xl font-bold text-[#0A1628] mt-2">₦{summary.thisQuarter.toLocaleString()}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">This Year</span>
                <p className="text-2xl font-bold text-[#0A1628] mt-2">₦{summary.thisYear.toLocaleString()}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">All Time</span>
                <p className="text-2xl font-bold text-[#FF6B00] mt-2">₦{summary.allTime.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Fuel Price Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-[#0A1628]">Fuel Price Trend</h2>
              <span className="text-xs text-gray-400">{country} · {period}</span>
            </div>
            {fuelPrices.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No fuel price data for this period</div>
            ) : (
              <div className="relative h-48">
                <div className="absolute inset-0 flex items-end gap-px">
                  {fuelPrices.map((fp, i) => (
                    <div key={i} className="flex-1 group relative">
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#0A1628] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                        {fp.date}: ₦{fp.price.toLocaleString()}
                      </div>
                      <div
                        className="w-full bg-[#FF6B00] rounded-t transition-all hover:bg-[#FF6B00]/80"
                        style={{ height: `${(fp.price / maxPrice) * 160}px` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Surcharge History Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#0A1628]">Surcharge History</h2>
              <span className="text-xs text-gray-400">{surcharges.length} records</span>
            </div>
            {surcharges.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No surcharge records</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-6 py-3 font-medium text-gray-500">Route</th>
                      <th className="px-6 py-3 font-medium text-gray-500">Rate</th>
                      <th className="px-6 py-3 font-medium text-gray-500">Effective From</th>
                      <th className="px-6 py-3 font-medium text-gray-500">Effective To</th>
                      <th className="px-6 py-3 font-medium text-gray-500">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {surcharges.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-[#0A1628]">{s.route}</td>
                        <td className="px-6 py-3 font-semibold text-[#FF6B00]">{s.rate}%</td>
                        <td className="px-6 py-3 text-gray-600">{s.effectiveFrom}</td>
                        <td className="px-6 py-3 text-gray-600">{s.effectiveTo ?? "Active"}</td>
                        <td className="px-6 py-3 text-gray-500">{s.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
