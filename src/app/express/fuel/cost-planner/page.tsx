"use client";

import { useState } from "react";
import {
  Loader2, AlertTriangle, Calculator, Download, TrendingUp, TrendingDown,
  DollarSign, BarChart3, ChevronDown, ChevronUp
} from "lucide-react";

interface MonthBreakdown {
  month: string;
  baseShipping: number;
  fuelSurcharge: number;
  total: number;
}

interface ScenarioResult {
  name: string;
  totalCost: number;
  fuelComponent: number;
  breakdown: MonthBreakdown[];
}

interface PlannerResult {
  scenarios: ScenarioResult[];
  recommended: string;
}

export default function CostPlannerPage() {
  const [period, setPeriod] = useState("3");
  const [routes, setRoutes] = useState("");
  const [volume, setVolume] = useState("");
  const [scenario, setScenario] = useState("moderate");
  const [customRate, setCustomRate] = useState("");
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  async function calculate(e: React.FormEvent) {
    e.preventDefault();
    if (!routes || !volume) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/fuel/cost-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period: Number(period),
          routes: routes.split(",").map((r) => r.trim()).filter(Boolean),
          volume: Number(volume),
          scenario,
          customRate: scenario === "custom" ? Number(customRate) : undefined,
        }),
      });
      const data = await res.json();
      setResult(data.data ?? null);
    } catch {
      setError("Failed to calculate cost projection");
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    if (!result) return;
    let csv = "Scenario,Month,Base Shipping,Fuel Surcharge,Total\n";
    for (const s of result.scenarios) {
      for (const b of s.breakdown) {
        csv += `"${s.name}","${b.month}",${b.baseShipping},${b.fuelSurcharge},${b.total}\n`;
      }
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fuel-cost-planner-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const maxTotal = Math.max(...(result?.scenarios.map((s) => s.totalCost) ?? [1]));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">Cost Planner</h1>
        <p className="text-sm text-gray-500 mt-1">Project your shipping costs under different fuel price scenarios</p>
      </div>

      {/* Input Form */}
      <form onSubmit={calculate} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[#0A1628]">Projection Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Period (months)</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Routes (comma-separated)</label>
            <input
              type="text"
              value={routes}
              onChange={(e) => setRoutes(e.target.value)}
              placeholder="e.g. Lagos→Abuja, PH→Lagos"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Monthly Volume (shipments)</label>
            <input
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder="e.g. 500"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Fuel Scenario</label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="conservative">Conservative (+5%)</option>
              <option value="moderate">Moderate (+15%)</option>
              <option value="pessimistic">Pessimistic (+30%)</option>
              <option value="custom">Custom Rate</option>
            </select>
          </div>
          {scenario === "custom" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Custom % Increase</label>
              <input
                type="number"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
                placeholder="e.g. 20"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/30"
              />
            </div>
          )}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !routes || !volume}
              className="w-full px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold hover:bg-[#FF6B00]/90 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Calculate"}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 inline mr-1" />{error}
        </div>
      )}

      {!loading && result && (
        <>
          {/* Scenario Comparison Bar Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-[#0A1628]">Scenario Comparison</h2>
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                <Download className="w-3 h-3" />
                Export CSV
              </button>
            </div>
            <div className="space-y-4">
              {result.scenarios.map((s) => (
                <div key={s.name} className="flex items-center gap-4">
                  <div className="w-32 shrink-0">
                    <p className="text-xs font-medium text-gray-600 capitalize">{s.name}</p>
                    <p className="text-xs text-gray-400">₦{s.totalCost.toLocaleString()}</p>
                  </div>
                  <div className="flex-1 relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#FF6B00] rounded-lg transition-all"
                      style={{ width: `${(s.totalCost / maxTotal) * 100}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 bg-[#0A1628]/30 rounded-lg transition-all"
                      style={{ width: `${(s.fuelComponent / maxTotal) * 100}%` }}
                    />
                  </div>
                  {s.name === result.recommended && (
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full">RECOMMENDED</span>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100">
                <div className="w-32" />
                <div className="flex-1 flex gap-6">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0A1628]/30" /> Fuel component</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#FF6B00]" /> Total cost</span>
                </div>
              </div>
            </div>
          </div>

          {/* Month-by-Month Breakdown */}
          <div className="space-y-4">
            {result.scenarios.map((s) => (
              <div key={s.name} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedScenario(expandedScenario === s.name ? null : s.name)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#0A1628] capitalize">{s.name} Scenario</span>
                    <span className="text-xs text-gray-400">₦{s.totalCost.toLocaleString()} total</span>
                    <span className="text-xs text-gray-400">· Fuel: ₦{s.fuelComponent.toLocaleString()}</span>
                  </div>
                  {expandedScenario === s.name ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {expandedScenario === s.name && (
                  <div className="border-t border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-2 text-left text-xs font-medium text-gray-500">Month</th>
                          <th className="px-6 py-2 text-right text-xs font-medium text-gray-500">Base Shipping</th>
                          <th className="px-6 py-2 text-right text-xs font-medium text-gray-500">Fuel Surcharge</th>
                          <th className="px-6 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {s.breakdown.map((b, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-6 py-2 font-medium text-[#0A1628]">{b.month}</td>
                            <td className="px-6 py-2 text-right text-gray-600">₦{b.baseShipping.toLocaleString()}</td>
                            <td className="px-6 py-2 text-right text-[#FF6B00]">₦{b.fuelSurcharge.toLocaleString()}</td>
                            <td className="px-6 py-2 text-right font-semibold text-[#0A1628]">₦{b.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-semibold">
                          <td className="px-6 py-2 text-[#0A1628]">Total</td>
                          <td className="px-6 py-2 text-right text-[#0A1628]">₦{s.breakdown.reduce((a, b) => a + b.baseShipping, 0).toLocaleString()}</td>
                          <td className="px-6 py-2 text-right text-[#FF6B00]">₦{s.breakdown.reduce((a, b) => a + b.fuelSurcharge, 0).toLocaleString()}</td>
                          <td className="px-6 py-2 text-right text-[#0A1628]">₦{s.breakdown.reduce((a, b) => a + b.total, 0).toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !result && (
        <div className="text-center py-16 text-gray-400">
          <Calculator className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Fill in the form above to project your shipping costs</p>
        </div>
      )}
    </div>
  );
}
