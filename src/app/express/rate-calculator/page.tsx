"use client";

import { useState } from "react";
import {
  Calculator,
  ArrowRight,
  Truck,
  Clock,
  Shield,
  RefreshCw,
} from "lucide-react";

const COUNTRIES = [
  "Nigeria", "United Kingdom", "United States", "Canada", "China",
  "UAE", "Ghana", "South Africa", "Germany", "France", "Australia",
];

const DEMO_RATES = [
  { carrier: "DHL Express", service: "Worldwide", time: "2–4 days", price: 34500, fastest: true },
  { carrier: "FedEx", service: "International Priority", time: "3–5 days", price: 28200, bestValue: true },
  { carrier: "UPS", service: "Worldwide Expedited", time: "4–6 days", price: 25900 },
  { carrier: "Aramex", service: "Priority", time: "5–7 days", price: 22400 },
];

export default function RateCalculatorPage() {
  const [from, setFrom] = useState("Nigeria");
  const [to, setTo] = useState("United Kingdom");
  const [weight, setWeight] = useState(2);
  const [showRates, setShowRates] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <Calculator className="w-10 h-10 text-[#FF6B00] mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-[#0A1628]">Shipping Rate Calculator</h1>
        <p className="text-gray-500 mt-1">
          Compare rates across 20+ couriers in real time. No signup needed.
        </p>
      </div>

      {/* Calculator Form */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2744] rounded-xl p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Ship From</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-[#FF6B00] outline-none"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c} className="text-[#0A1628]">{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Ship To</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-[#FF6B00] outline-none"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c} className="text-[#0A1628]">{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 1)}
              min={0.1}
              step={0.1}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-[#FF6B00] outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowRates(true)}
              className="w-full bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              Calculate <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {showRates && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#0A1628]">
              Available Rates — {from} → {to} ({weight} kg)
            </h2>
            <button
              onClick={() => setShowRates(false)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Recalculate
            </button>
          </div>
          <div className="space-y-3">
            {DEMO_RATES.map((rate) => (
              <div
                key={rate.carrier}
                className={`bg-white border-2 rounded-xl p-5 flex items-center gap-4 transition-all ${
                  rate.fastest ? "border-blue-500" : rate.bestValue ? "border-green-500" : "border-gray-200"
                }`}
              >
                <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-sm text-[#0A1628]">
                  {rate.carrier.split(" ")[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-[#0A1628]">
                    {rate.carrier} {rate.service}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {rate.time}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Truck className="w-3.5 h-3.5" />
                      Door-to-door
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Shield className="w-3.5 h-3.5" />
                      Tracking included
                    </div>
                  </div>
                </div>
                {rate.fastest && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                    Fastest
                  </span>
                )}
                {rate.bestValue && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                    Best value
                  </span>
                )}
                <div className="text-right">
                  <p className="text-xl font-bold text-[#0A1628]">₦{rate.price.toLocaleString()}</p>
                </div>
                <button className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                  Book →
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
