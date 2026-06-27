"use client";

import { useEffect, useState } from "react";
import { Loader2, Calculator, Fuel, Route, Truck, AlertTriangle, CheckCircle } from "lucide-react";

interface Vehicle {
  id: string;
  name: string;
  fuelConsumption: number;
}

interface CalculationResult {
  litresNeeded: number;
  fuelCost: number;
  estimatedProfit: number;
  profitMargin: number;
  warning: boolean;
}

export default function ProfitabilityPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/v1/fuel/partner-profile");
        if (!res.ok) throw new Error("Failed to load partner profile");
        const data = await res.json();
        setVehicles(data.vehicles || []);
        if (data.vehicles?.length > 0) setSelectedVehicle(data.vehicles[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleCalculate() {
    if (!origin || !destination || !distance || !selectedVehicle) return;
    setCalculating(true);
    try {
      const res = await fetch("/api/v1/fuel/profitability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          distance: Number(distance),
          vehicleId: selectedVehicle,
        }),
      });
      if (!res.ok) throw new Error("Calculation failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation error");
    } finally {
      setCalculating(false);
    }
  }

  const vehicle = vehicles.find((v) => v.id === selectedVehicle);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#FF6B00" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628]">Job Profitability Calculator</h1>
          <p className="text-gray-600 mt-1">Estimate fuel cost and profit margin before accepting a job</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <Route className="w-5 h-5 text-[#FF6B00]" />
              Route Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin City</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Lagos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination City</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Abuja"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="e.g. 750"
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                >
                  {vehicles.length === 0 && <option value="">No vehicles found</option>}
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.fuelConsumption} L/100km
                    </option>
                  ))}
                </select>
              </div>
              {vehicle && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Truck className="w-4 h-4 text-[#0A1628]" />
                  <span className="text-sm text-gray-600">
                    Fuel consumption: <strong>{vehicle.fuelConsumption} L/100km</strong>
                  </span>
                </div>
              )}
              <button
                onClick={handleCalculate}
                disabled={calculating || !origin || !destination || !distance || !selectedVehicle}
                className="w-full py-2.5 bg-[#FF6B00] text-white font-medium rounded-lg hover:bg-[#e55f00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {calculating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" /> Calculate Profitability
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <Fuel className="w-5 h-5 text-[#FF6B00]" />
              Calculation Results
            </h2>
            {!result ? (
              <div className="text-center py-12 text-gray-400">
                <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Enter route details and click Calculate</p>
              </div>
            ) : (
              <div className="space-y-4">
                {result.warning && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Fuel cost exceeds payout — this job is not profitable.
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Litres Needed</p>
                    <p className="text-2xl font-bold text-[#0A1628]">{result.litresNeeded.toFixed(1)} L</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Fuel Cost</p>
                    <p className="text-2xl font-bold text-[#0A1628]">₦{result.fuelCost.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Estimated Profit</p>
                    <p className={`text-2xl font-bold ${result.estimatedProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ₦{result.estimatedProfit.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Profit Margin</p>
                    <p className={`text-2xl font-bold ${result.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {result.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${result.warning ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {result.warning ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {result.warning ? "Consider declining this job" : "This job is profitable at current fuel prices"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
