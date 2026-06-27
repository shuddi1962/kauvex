"use client";

import { useState, useEffect } from "react";
import {
  Loader2, Fuel, TrendingUp, TrendingDown, AlertTriangle, DollarSign,
  BarChart3, RefreshCw, ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";

interface FuelPrice {
  city: string;
  fuelType: string;
  price: number;
  changeWeek: number;
  changeMonth: number;
}

interface RouteImpact {
  route: string;
  baseRate: number;
  surcharge: number;
  total: number;
  vsLastMonth: number;
}

interface Surchage {
  id: string;
  route: string;
  rate: number;
  effectiveFrom: string;
  reason: string;
}

interface DashboardData {
  fuelPrices: FuelPrice[];
  routeImpacts: RouteImpact[];
  totalImpactThisMonth: number;
  activeSurcharges: Surchage[];
}

export default function FuelDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pricesRes, dashRes] = await Promise.all([
          fetch("/api/v1/fuel/prices"),
          fetch("/api/v1/fuel/dashboard"),
        ]);
        const prices = await pricesRes.json();
        const dash = await dashRes.json();
        setData({
          fuelPrices: prices.data ?? [],
          routeImpacts: dash.data?.routeImpacts ?? [],
          totalImpactThisMonth: dash.data?.totalImpactThisMonth ?? 0,
          activeSurcharges: dash.data?.activeSurcharges ?? [],
        });
      } catch {
        setError("Failed to load fuel dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 text-sm text-red-600 underline">Retry</button>
        </div>
      </div>
    );
  }

  const fuelPrices = data?.fuelPrices ?? [];
  const routeImpacts = data?.routeImpacts ?? [];
  const activeSurcharges = data?.activeSurcharges ?? [];
  const totalImpact = data?.totalImpactThisMonth ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Fuel Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor fuel prices and their impact on shipping rates</p>
        </div>
        <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-medium hover:bg-[#0A1628]/90 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg PMS Price</span>
            <Fuel className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <p className="text-2xl font-bold text-[#0A1628] mt-2">
            ₦{fuelPrices.length > 0 ? fuelPrices[0].price.toLocaleString() : "—"}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {fuelPrices.length > 0 && fuelPrices[0].changeWeek > 0 ? (
              <ArrowUpRight className="w-3 h-3 text-red-500" />
            ) : fuelPrices.length > 0 && fuelPrices[0].changeWeek < 0 ? (
              <ArrowDownRight className="w-3 h-3 text-green-500" />
            ) : (
              <Minus className="w-3 h-3 text-gray-400" />
            )}
            <span className={`text-xs font-medium ${fuelPrices.length > 0 && fuelPrices[0].changeWeek > 0 ? "text-red-500" : fuelPrices.length > 0 && fuelPrices[0].changeWeek < 0 ? "text-green-500" : "text-gray-400"}`}>
              {fuelPrices.length > 0 ? `${fuelPrices[0].changeWeek > 0 ? "+" : ""}${fuelPrices[0].changeWeek}%` : "—"} vs last week
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Impact (Month)</span>
            <DollarSign className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <p className="text-2xl font-bold text-[#0A1628] mt-2">
            ₦{totalImpact.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Fuel surcharge across all routes</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Surcharges</span>
            <AlertTriangle className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <p className="text-2xl font-bold text-[#0A1628] mt-2">{activeSurcharges.length}</p>
          <p className="text-xs text-gray-500 mt-1">Currently applied to routes</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Routes Affected</span>
            <BarChart3 className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <p className="text-2xl font-bold text-[#0A1628] mt-2">{routeImpacts.length}</p>
          <p className="text-xs text-gray-500 mt-1">With fuel-adjusted pricing</p>
        </div>
      </div>

      {/* Fuel Prices Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-[#0A1628]">Current Fuel Prices</h2>
        </div>
        {fuelPrices.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No fuel price data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 font-medium text-gray-500">City</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Fuel Type</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right">Price (₦/L)</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right">vs Last Week</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right">vs Last Month</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fuelPrices.map((fp, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-[#0A1628]">{fp.city}</td>
                    <td className="px-6 py-3 text-gray-600">{fp.fuelType}</td>
                    <td className="px-6 py-3 text-right font-semibold text-[#0A1628]">₦{fp.price.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${fp.changeWeek > 0 ? "bg-red-50 text-red-600" : fp.changeWeek < 0 ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                        {fp.changeWeek > 0 ? <TrendingUp className="w-3 h-3" /> : fp.changeWeek < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {fp.changeWeek > 0 ? "+" : ""}{fp.changeWeek}%
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${fp.changeMonth > 0 ? "bg-red-50 text-red-600" : fp.changeMonth < 0 ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                        {fp.changeMonth > 0 ? <TrendingUp className="w-3 h-3" /> : fp.changeMonth < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {fp.changeMonth > 0 ? "+" : ""}{fp.changeMonth}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Route Impact + Active Surcharges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Impact on Rates */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-[#0A1628]">Fuel Impact on Rates</h2>
          </div>
          {routeImpacts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No route impact data available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-gray-500">Route</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-right">Base</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-right">Surcharge</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-right">Total</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-right">vs Last Mo.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {routeImpacts.map((ri, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#0A1628]">{ri.route}</td>
                      <td className="px-4 py-3 text-right text-gray-600">₦{ri.baseRate.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-[#FF6B00] font-medium">₦{ri.surcharge.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#0A1628]">₦{ri.total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-medium ${ri.vsLastMonth > 0 ? "text-red-500" : ri.vsLastMonth < 0 ? "text-green-500" : "text-gray-400"}`}>
                          {ri.vsLastMonth > 0 ? "+" : ""}{ri.vsLastMonth}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Surcharges */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-[#0A1628]">Active Surcharges</h2>
          </div>
          {activeSurcharges.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No active surcharges</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeSurcharges.map((s) => (
                <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-[#0A1628] text-sm">{s.route}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.reason}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Since {s.effectiveFrom}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] text-sm font-semibold">
                      {s.rate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
