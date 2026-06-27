"use client";

import { useEffect, useState } from "react";
import { Loader2, Fuel, TrendingUp, TrendingDown, AlertTriangle, MapPin } from "lucide-react";

interface FuelPrice {
  city: string;
  price: number;
  change: number;
  lastUpdated: string;
}

interface ProfitabilityData {
  route: string;
  breakEvenFuelPrice: number;
  currentFuelPrice: number;
  headroom: number;
  alert: boolean;
}

interface MonthlyData {
  month: string;
  earnings: number;
  fuelCost: number;
}

export default function FuelDashboardPage() {
  const [prices, setPrices] = useState<FuelPrice[]>([]);
  const [profitability, setProfitability] = useState<ProfitabilityData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pricesRes, profitRes] = await Promise.all([
          fetch("/api/v1/fuel/prices"),
          fetch("/api/v1/fuel/profitability"),
        ]);

        if (!pricesRes.ok || !profitRes.ok) throw new Error("Failed to fetch data");

        const pricesData = await pricesRes.json();
        const profitData = await profitRes.json();

        setPrices(pricesData.prices || []);
        setProfitability(profitData.routes || []);
        setMonthlyData(pricesData.monthly || []);
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

  const maxEarnings = Math.max(...monthlyData.map((d) => d.earnings), 1);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628]">Fuel Dashboard</h1>
          <p className="text-gray-600 mt-1">Tier 2 freight partner fuel monitoring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Fuel className="w-5 h-5 text-[#FF6B00]" />
              <h2 className="font-semibold text-[#0A1628]">Average Diesel Price</h2>
            </div>
            <p className="text-3xl font-bold text-[#0A1628]">
              ₦{prices.length > 0 ? (prices.reduce((s, p) => s + p.price, 0) / prices.length).toFixed(2) : "0.00"}
              <span className="text-sm font-normal text-gray-500">/litre</span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h2 className="font-semibold text-[#0A1628]">Profitable Routes</h2>
            </div>
            <p className="text-3xl font-bold text-[#0A1628]">
              {profitability.filter((r) => !r.alert).length}
              <span className="text-sm font-normal text-gray-500"> / {profitability.length} total</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <Fuel className="w-5 h-5 text-[#FF6B00]" />
              Current Diesel Prices
            </h2>
            {prices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No price data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-500 font-medium">City</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Price (₦/L)</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((p, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-3 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {p.city}
                        </td>
                        <td className="py-3 text-right font-medium text-[#0A1628]">₦{p.price.toFixed(2)}</td>
                        <td className="py-3 text-right">
                          <span className={`inline-flex items-center gap-1 ${p.change >= 0 ? "text-red-500" : "text-green-500"}`}>
                            {p.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(p.change).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF6B00]" />
              Earnings vs Fuel Cost
            </h2>
            {monthlyData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No monthly data available</p>
            ) : (
              <div className="space-y-3">
                {monthlyData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-12 shrink-0">{d.month}</span>
                    <div className="flex-1 relative h-6">
                      <div
                        className="absolute top-0 left-0 h-full rounded bg-[#0A1628]"
                        style={{ width: `${(d.earnings / maxEarnings) * 100}%` }}
                      />
                      <div
                        className="absolute top-0 left-0 h-full rounded bg-[#FF6B00] opacity-80"
                        style={{ width: `${(d.fuelCost / maxEarnings) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-20 text-right shrink-0">
                      ₦{(d.earnings / 1000).toFixed(0)}K
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-3 h-3 rounded bg-[#0A1628] inline-block" /> Earnings
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-3 h-3 rounded bg-[#FF6B00] inline-block" /> Fuel Cost
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF6B00]" />
            Route Profitability by Fuel Price
          </h2>
          {profitability.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No route data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500 font-medium">Route</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Break-Even (₦/L)</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Current (₦/L)</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Headroom</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {profitability.map((r, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-3 font-medium text-[#0A1628]">{r.route}</td>
                      <td className="py-3 text-right">₦{r.breakEvenFuelPrice.toFixed(2)}</td>
                      <td className="py-3 text-right">₦{r.currentFuelPrice.toFixed(2)}</td>
                      <td className="py-3 text-right">
                        <span className={r.headroom > 0 ? "text-green-600" : "text-red-600"}>
                          {r.headroom > 0 ? "+" : ""}₦{r.headroom.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {r.alert ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> At Risk
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                            Profitable
                          </span>
                        )}
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
