"use client";

import { useState } from "react";
import {
  Search,
  Truck,
  DollarSign,
  Clock,
  Shield,
  Leaf,
  MapPin,
  Package,
  ArrowRight,
  CheckCircle2,
  Zap,
  BarChart3,
  Star,
  ChevronDown,
  Filter,
} from "lucide-react";

interface CarrierResult {
  carrier: string;
  carrierId: string;
  price: number;
  currency: string;
  speedDays: number;
  speedLabel: string;
  reliability: number;
  co2: number;
  coverage: string;
  recommended: boolean;
  isCheapest: boolean;
  isFastest: boolean;
}

interface CompareResponse {
  origin: string;
  destination: string;
  originCountry: string;
  destCountry: string;
  distanceKm: number;
  weightKg: number;
  serviceLevel: string;
  carriers: CarrierResult[];
  totalResults: number;
}

const SERVICE_LEVELS = [
  { value: "economy", label: "Economy", icon: <Package className="w-3.5 h-3.5" /> },
  { value: "standard", label: "Standard", icon: <Truck className="w-3.5 h-3.5" /> },
  { value: "express", label: "Express", icon: <Zap className="w-3.5 h-3.5" /> },
  { value: "same_day", label: "Same Day", icon: <Clock className="w-3.5 h-3.5" /> },
];

export default function MultiCarrierPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [serviceLevel, setServiceLevel] = useState("standard");
  const [results, setResults] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"price" | "speed" | "reliability">("price");

  const handleCompare = async () => {
    if (!origin || !destination || !weight) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/express/multi-carrier-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          weight: Number(weight),
          length: length ? Number(length) : undefined,
          width: width ? Number(width) : undefined,
          height: height ? Number(height) : undefined,
          serviceLevel,
        }),
      });
      const json = await res.json();
      setResults(json);
    } catch {
      // keep previous
    } finally {
      setLoading(false);
    }
  };

  const sorted = results
    ? [...results.carriers].sort((a, b) => {
        if (sortBy === "price") return a.price - b.price;
        if (sortBy === "speed") return a.speedDays - b.speedDays;
        return b.reliability - a.reliability;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">Multi-Carrier Comparison</h1>
        <p className="text-sm text-gray-500 mt-1">
          Compare prices, speed, and reliability across all carriers instantly
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              <MapPin className="w-3 h-3 inline mr-1" /> Origin City
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Lagos"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              <MapPin className="w-3 h-3 inline mr-1" /> Destination City
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Abuja"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              <Package className="w-3 h-3 inline mr-1" /> Weight (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 5"
              min="0.1"
              step="0.1"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Service Level
            </label>
            <div className="relative">
              <select
                value={serviceLevel}
                onChange={(e) => setServiceLevel(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
              >
                {SERVICE_LEVELS.map((sl) => (
                  <option key={sl.value} value={sl.value}>{sl.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Optional dimensions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Length (cm) — optional</label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0A1628] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Width (cm) — optional</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0A1628] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Height (cm) — optional</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0A1628] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
            />
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={!origin || !destination || !weight || loading}
          className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Compare Carriers
        </button>
      </div>

      {/* Results */}
      {results && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#0A1628]/10 rounded-lg flex items-center justify-center">
                  <Truck className="w-4 h-4 text-[#0A1628]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0A1628]">{results.totalResults}</p>
              <p className="text-xs text-gray-500">Carriers Found</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {results.carriers.length > 0 ? `₦${Math.min(...results.carriers.map((c) => c.price)).toLocaleString()}` : "—"}
              </p>
              <p className="text-xs text-gray-500">Lowest Price</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {results.carriers.length > 0 ? `${Math.min(...results.carriers.map((c) => c.speedDays))}d` : "—"}
              </p>
              <p className="text-xs text-gray-500">Fastest Delivery</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Route className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-600">{results.distanceKm.toLocaleString()} km</p>
              <p className="text-xs text-gray-500">Route Distance</p>
            </div>
          </div>

          {/* Sort + Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-[#0A1628]">
                {results.origin} → {results.destination}
              </h3>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <div className="flex bg-gray-100 rounded-md p-0.5">
                  {([
                    { key: "price" as const, label: "Cheapest" },
                    { key: "speed" as const, label: "Fastest" },
                    { key: "reliability" as const, label: "Most Reliable" },
                  ]).map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSortBy(s.key)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        sortBy === s.key
                          ? "bg-white shadow text-[#0A1628]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Carrier</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">
                      <DollarSign className="w-3 h-3 inline" /> Price
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">
                      <Clock className="w-3 h-3 inline" /> Speed
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">
                      <Shield className="w-3 h-3 inline" /> Reliability
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">
                      <Leaf className="w-3 h-3 inline" /> CO₂
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">Coverage</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((c) => (
                    <tr
                      key={c.carrierId}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        c.isCheapest || c.isFastest ? "bg-orange-50/30" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#0A1628]">{c.carrier}</span>
                          {c.recommended && (
                            <span className="text-[9px] font-bold bg-[#FF6B00] text-white px-1.5 py-0.5 rounded">
                              RECOMMENDED
                            </span>
                          )}
                          {c.isCheapest && !c.recommended && (
                            <span className="text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded">
                              CHEAPEST
                            </span>
                          )}
                          {c.isFastest && !c.isCheapest && (
                            <span className="text-[9px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded">
                              FASTEST
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-[#0A1628]">₦{c.price.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-gray-600">{c.speedLabel}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${c.reliability}%`,
                                backgroundColor: c.reliability >= 95 ? "#10B981" : c.reliability >= 90 ? "#F59E0B" : "#EF4444",
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 w-8 text-right">{c.reliability}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs text-gray-500">{c.co2} kg</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          c.coverage === "Full" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {c.coverage}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`/express/book?carrier=${c.carrierId}&origin=${encodeURIComponent(origin)}&dest=${encodeURIComponent(destination)}&weight=${weight}&service=${serviceLevel}`}
                          className="inline-flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Book <ArrowRight className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sorted.length === 0 && (
              <div className="text-center py-16">
                <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No carriers available for this route</p>
              </div>
            )}
          </div>

          {/* CO2 Comparison Chart */}
          {sorted.length > 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold text-[#0A1628]">Carbon Footprint Comparison</h3>
              </div>
              <div className="space-y-2">
                {sorted.map((c) => {
                  const maxCo2 = Math.max(...sorted.map((s) => s.co2));
                  return (
                    <div key={c.carrierId} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-28 text-right truncate shrink-0">{c.carrier}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                          style={{ width: `${(c.co2 / maxCo2) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 w-14 text-right">{c.co2} kg</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {!results && !loading && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Enter your route details above to compare carriers</p>
          <p className="text-xs text-gray-400 mt-1">Compare prices, speed, reliability, and environmental impact</p>
        </div>
      )}
    </div>
  );
}
