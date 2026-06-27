"use client";

import { useEffect, useState } from "react";
import { Loader2, DollarSign, TrendingUp, TrendingDown, AlertTriangle, BarChart3 } from "lucide-react";

interface CostMetrics {
  totalCollected: number;
  totalPaidToPartners: number;
  netPosition: number;
}

interface MonthlyCost {
  month: string;
  fuelCost: number;
  platformRevenue: number;
}

interface PartnerImpact {
  partner: string;
  paidOut: number;
  collected: number;
  delta: number;
}

interface Scenario {
  label: string;
  absorb: number;
  passThrough: number;
  netImpact: number;
}

export default function CostAnalysisPage() {
  const [metrics, setMetrics] = useState<CostMetrics>({
    totalCollected: 0,
    totalPaidToPartners: 0,
    netPosition: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyCost[]>([]);
  const [partnerImpact, setPartnerImpact] = useState<PartnerImpact[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/fuel/dashboard");
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();

        setMetrics(data.costMetrics || { totalCollected: 0, totalPaidToPartners: 0, netPosition: 0 });
        setMonthlyData(data.monthlyCost || []);
        setPartnerImpact(data.partnerImpact || []);
        setScenarios(data.scenarios || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#FF6B00" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-[#FF6B00] text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxVal = Math.max(...monthlyData.map((d) => Math.max(d.fuelCost, d.platformRevenue)), 1);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628]">Platform Cost Analysis</h1>
          <p className="text-gray-600 mt-1">Fuel surcharge revenue, partner payouts, and net position</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Surcharges Collected</span>
            </div>
            <p className="text-2xl font-bold text-[#0A1628]">₦{metrics.totalCollected.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">total revenue</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm text-gray-500">Paid to Partners</span>
            </div>
            <p className="text-2xl font-bold text-[#0A1628]">₦{metrics.totalPaidToPartners.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">total cost</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${metrics.netPosition >= 0 ? "bg-blue-50" : "bg-orange-50"}`}>
                <TrendingUp className={`w-5 h-5 ${metrics.netPosition >= 0 ? "text-blue-600" : "text-[#FF6B00]"}`} />
              </div>
              <span className="text-sm text-gray-500">Net Position</span>
            </div>
            <p className={`text-2xl font-bold ${metrics.netPosition >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₦{metrics.netPosition.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">{metrics.netPosition >= 0 ? "net gain" : "net loss"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#FF6B00]" />
              Fuel Cost vs Platform Revenue
            </h2>
            {monthlyData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No data available</p>
            ) : (
              <div className="space-y-3">
                {monthlyData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-12 shrink-0">{d.month}</span>
                    <div className="flex-1 space-y-1">
                      <div className="relative h-4">
                        <div
                          className="absolute top-0 left-0 h-full rounded bg-[#FF6B00]"
                          style={{ width: `${(d.fuelCost / maxVal) * 100}%` }}
                        />
                        <div
                          className="absolute top-0 left-0 h-full rounded bg-[#0A1628] opacity-60"
                          style={{ width: `${(d.platformRevenue / maxVal) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-right w-20 shrink-0">
                      <span className="text-[#0A1628]">₦{(d.platformRevenue / 1000).toFixed(0)}K</span>
                      <span className="text-gray-400"> / </span>
                      <span className="text-[#FF6B00]">₦{(d.fuelCost / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-3 h-3 rounded bg-[#0A1628] opacity-60 inline-block" /> Revenue
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-3 h-3 rounded bg-[#FF6B00] inline-block" /> Fuel Cost
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF6B00]" />
              Partner Payout Impact
            </h2>
            {partnerImpact.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No partner data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-500 font-medium">Partner</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Collected</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Paid</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerImpact.map((p, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2.5 font-medium text-[#0A1628]">{p.partner}</td>
                        <td className="py-2.5 text-right text-gray-600">₦{p.collected.toLocaleString()}</td>
                        <td className="py-2.5 text-right text-gray-600">₦{p.paidOut.toLocaleString()}</td>
                        <td className={`py-2.5 text-right font-medium ${p.delta >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {p.delta >= 0 ? "+" : ""}₦{p.delta.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#FF6B00]" />
            Scenario Analysis: Absorb vs Pass Through
          </h2>
          {scenarios.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No scenario data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500 font-medium">Scenario</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Kauvex Absorbs</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Passed to Customer</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Net Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((s, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-[#0A1628]">{s.label}</td>
                      <td className="py-2.5 text-right">₦{s.absorb.toLocaleString()}</td>
                      <td className="py-2.5 text-right">₦{s.passThrough.toLocaleString()}</td>
                      <td className={`py-2.5 text-right font-medium ${s.netImpact >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {s.netImpact >= 0 ? "+" : ""}₦{s.netImpact.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
