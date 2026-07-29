"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Fuel,
  DollarSign,
  TrendingUp,
  Settings,
  AlertTriangle,
  MapPin,
  Clock,
  BarChart3,
} from "lucide-react";

interface FuelPrice {
  country: string;
  city: string;
  fuelType: string;
  price: number;
  lastUpdated: string;
  source: string;
  staleness: "green" | "amber" | "red";
}

interface SurchargeRule {
  id: string;
  name: string;
  origin: string;
  destination: string;
  active: boolean;
}

interface SurchargeLog {
  id: string;
  route: string;
  amount: number;
  timestamp: string;
  partner: string;
}

interface DashboardMetrics {
  avgFuelPrice: number;
  activeSurcharges: number;
  totalCollected: number;
  platformFuelCost: number;
}

const tabs = ["Overview", "Live Prices", "Surcharge Rules", "Route Impact", "Platform Cost", "Data Sources"] as const;
type Tab = (typeof tabs)[number];

export default function AdminFuelPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [prices, setPrices] = useState<FuelPrice[]>([]);
  const [rules, setRules] = useState<SurchargeRule[]>([]);
  const [logs, setLogs] = useState<SurchargeLog[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    avgFuelPrice: 0,
    activeSurcharges: 0,
    totalCollected: 0,
    platformFuelCost: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pricesRes, rulesRes, dashRes] = await Promise.all([
          fetch("/api/v1/fuel/prices"),
          fetch("/api/v1/fuel/surcharge/rules"),
          fetch("/api/v1/fuel/dashboard"),
        ]);

        if (!pricesRes.ok || !rulesRes.ok || !dashRes.ok) throw new Error("Failed to fetch data");

        const pricesData = await pricesRes.json();
        const rulesData = await rulesRes.json();
        const dashData = await dashRes.json();

        setPrices(pricesData.prices || []);
        setRules(rulesData.rules || []);
        setLogs(dashData.recentLogs || []);
        setMetrics(
          dashData.metrics || {
            avgFuelPrice: 0,
            activeSurcharges: 0,
            totalCollected: 0,
            platformFuelCost: 0,
          }
        );
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628]">Fuel Control Center</h1>
          <p className="text-gray-600 mt-1">Manage fuel pricing, surcharges, and cost analysis</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab
                  ? "bg-[#0A1628] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Fuel className="w-5 h-5 text-[#FF6B00]" />
                  </div>
                  <span className="text-sm text-gray-500">Avg Fuel Price</span>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">₦{metrics.avgFuelPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">per litre</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-500">Active Surcharges</span>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">{metrics.activeSurcharges}</p>
                <p className="text-xs text-gray-400 mt-1">rules active</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500">Total Collected</span>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">₦{metrics.totalCollected.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">surcharge revenue</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-sm text-gray-500">Platform Fuel Cost</span>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">₦{metrics.platformFuelCost.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">total expense</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#FF6B00]" />
                  Country Fuel Price Summary
                </h2>
                {prices.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No data available</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-500 font-medium">Country</th>
                          <th className="text-left py-2 text-gray-500 font-medium">City</th>
                          <th className="text-right py-2 text-gray-500 font-medium">Price (₦/L)</th>
                          <th className="text-center py-2 text-gray-500 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prices.slice(0, 8).map((p, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="py-2.5 font-medium text-[#0A1628]">{p.country}</td>
                            <td className="py-2.5 text-gray-600">{p.city}</td>
                            <td className="py-2.5 text-right">₦{p.price.toFixed(2)}</td>
                            <td className="py-2.5 text-center">
                              <span
                                className={`w-2.5 h-2.5 rounded-full inline-block ${
                                  p.staleness === "green"
                                    ? "bg-green-500"
                                    : p.staleness === "amber"
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                              />
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
                  <Clock className="w-5 h-5 text-[#FF6B00]" />
                  Recent Surcharge Log
                </h2>
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No surcharge entries yet</p>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-[#0A1628]">{log.route}</p>
                          <p className="text-xs text-gray-500">{log.partner} &middot; {log.timestamp}</p>
                        </div>
                        <span className="text-sm font-semibold text-[#FF6B00]">₦{log.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Live Prices" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {prices.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No live price data available. Data will populate once fuel tracking begins.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left p-3 font-semibold text-text-4">Country</th>
                    <th className="text-left p-3 font-semibold text-text-4">City</th>
                    <th className="text-left p-3 font-semibold text-text-4">Fuel Type</th>
                    <th className="text-right p-3 font-semibold text-text-4">Price</th>
                    <th className="text-right p-3 font-semibold text-text-4">Last Updated</th>
                    <th className="text-center p-3 font-semibold text-text-4">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((p, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium text-text-1">{p.country}</td>
                      <td className="p-3 text-text-2">{p.city}</td>
                      <td className="p-3 text-text-2">{p.fuelType}</td>
                      <td className="p-3 text-right font-mono">₦{p.price.toFixed(2)}</td>
                      <td className="p-3 text-right text-text-4">{new Date(p.lastUpdated).toLocaleDateString()}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${p.staleness === "green" ? "bg-green-500" : p.staleness === "amber" ? "bg-amber-500" : "bg-red-500"}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {activeTab === "Surcharge Rules" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {rules.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No surcharge rules configured. Create rules to automate fuel surcharge calculations.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left p-3 font-semibold text-text-4">Name</th>
                    <th className="text-left p-3 font-semibold text-text-4">Origin</th>
                    <th className="text-left p-3 font-semibold text-text-4">Destination</th>
                    <th className="text-center p-3 font-semibold text-text-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium text-text-1">{r.name}</td>
                      <td className="p-3 text-text-2">{r.origin}</td>
                      <td className="p-3 text-text-2">{r.destination}</td>
                      <td className="p-3 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                          {r.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {activeTab !== "Overview" && activeTab !== "Live Prices" && activeTab !== "Surcharge Rules" && (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">{activeTab} details will appear here once data is collected from active routes and carriers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
