"use client";

import { useEffect, useState } from "react";
import { Loader2, Fuel, Globe, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";

interface FuelPrice {
  country: string;
  city: string;
  fuelType: string;
  price: number;
  lastUpdated: string;
  source: string;
  staleness: "green" | "amber" | "red";
}

interface DataSource {
  name: string;
  status: "active" | "inactive" | "error";
  lastFetch: string;
  interval: string;
}

export default function AdminFuelPricesPage() {
  const [prices, setPrices] = useState<FuelPrice[]>([]);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overrideCountry, setOverrideCountry] = useState("");
  const [overridePrice, setOverridePrice] = useState("");
  const [overrideExpiry, setOverrideExpiry] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pricesRes, sourcesRes] = await Promise.all([
          fetch("/api/v1/fuel/prices"),
          fetch("/api/v1/fuel/data-sources"),
        ]);

        if (!pricesRes.ok || !sourcesRes.ok) throw new Error("Failed to fetch data");

        const pricesData = await pricesRes.json();
        const sourcesData = await sourcesRes.json();

        setPrices(pricesData.prices || []);
        setSources(sourcesData.sources || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleOverride(e: React.FormEvent) {
    e.preventDefault();
    if (!overrideCountry || !overridePrice) return;
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const res = await fetch("/api/v1/fuel/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: overrideCountry,
          price: Number(overridePrice),
          expiry: overrideExpiry || null,
        }),
      });
      if (!res.ok) throw new Error("Override failed");
      setSubmitMsg("Price override applied successfully");
      setOverrideCountry("");
      setOverridePrice("");
      setOverrideExpiry("");
    } catch (err) {
      setSubmitMsg(err instanceof Error ? err.message : "Override failed");
    } finally {
      setSubmitting(false);
    }
  }

  const countries = [...new Set(prices.map((p) => p.country))];

  function stalenessColor(s: string) {
    if (s === "green") return "bg-green-500";
    if (s === "amber") return "bg-amber-500";
    return "bg-red-500";
  }

  function stalenessLabel(s: string) {
    if (s === "green") return "Fresh";
    if (s === "amber") return "Stale";
    return "Outdated";
  }

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628]">Live Fuel Prices</h1>
          <p className="text-gray-600 mt-1">Monitor fuel prices across all countries and manage overrides</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#FF6B00]" />
              All Countries & Cities
            </h2>
            {prices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No price data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-500 font-medium">Country</th>
                      <th className="text-left py-2 text-gray-500 font-medium">City</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Type</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Price (₦/L)</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Source</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Updated</th>
                      <th className="text-center py-2 text-gray-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((p, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2.5 font-medium text-[#0A1628]">{p.country}</td>
                        <td className="py-2.5">{p.city}</td>
                        <td className="py-2.5 text-gray-600">{p.fuelType}</td>
                        <td className="py-2.5 text-right font-medium">₦{p.price.toFixed(2)}</td>
                        <td className="py-2.5 text-gray-500 text-xs">{p.source}</td>
                        <td className="py-2.5 text-gray-500 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {p.lastUpdated}
                        </td>
                        <td className="py-2.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                              p.staleness === "green"
                                ? "bg-green-50 text-green-700"
                                : p.staleness === "amber"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${stalenessColor(p.staleness)}`} />
                            {stalenessLabel(p.staleness)}
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
              <RefreshCw className="w-5 h-5 text-[#FF6B00]" />
              Manual Override
            </h2>
            <form onSubmit={handleOverride} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={overrideCountry}
                  onChange={(e) => setOverrideCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                >
                  <option value="">Select country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦/litre)</label>
                <input
                  type="number"
                  value={overridePrice}
                  onChange={(e) => setOverridePrice(e.target.value)}
                  placeholder="e.g. 850.00"
                  min={0}
                  step={0.01}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                <input
                  type="datetime-local"
                  value={overrideExpiry}
                  onChange={(e) => setOverrideExpiry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !overrideCountry || !overridePrice}
                className="w-full py-2.5 bg-[#FF6B00] text-white font-medium rounded-lg hover:bg-[#e55f00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Apply Override
              </button>
              {submitMsg && (
                <p className={`text-sm text-center ${submitMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {submitMsg}
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
            <Fuel className="w-5 h-5 text-[#FF6B00]" />
            Data Source Status
          </h2>
          {sources.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No data sources configured</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500 font-medium">Source</th>
                    <th className="text-center py-2 text-gray-500 font-medium">Status</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Last Fetch</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Interval</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2.5 font-medium text-[#0A1628]">{s.name}</td>
                      <td className="py-2.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                            s.status === "active"
                              ? "bg-green-50 text-green-700"
                              : s.status === "inactive"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {s.status === "active" ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : s.status === "inactive" ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {s.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-500 text-xs">{s.lastFetch}</td>
                      <td className="py-2.5 text-gray-500 text-xs">{s.interval}</td>
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
