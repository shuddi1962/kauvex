"use client";

import { useState } from "react";
import { Calculator, Info } from "lucide-react";

const ORIGIN_COUNTRIES = [
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
];

const DESTINATIONS = [
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
];

const DUTY_RATES: Record<string, number> = {
  GB: 0.05,
  US: 0.07,
  CN: 0.10,
  CA: 0.06,
  DE: 0.08,
  AE: 0.04,
};

export default function TaxCalculatorPage() {
  const [origin, setOrigin] = useState("GB");
  const [dest, setDest] = useState("NG");
  const [value, setValue] = useState(50000);
  const [result, setResult] = useState<{ duty: number; vat: number; total: number } | null>(null);

  const calculate = () => {
    const dutyRate = DUTY_RATES[origin] || 0.05;
    const duty = value * dutyRate;
    const vat = (value + duty) * 0.075; // Nigeria VAT 7.5%
    setResult({ duty, vat, total: duty + vat });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <Calculator className="w-10 h-10 text-[#FF6B00] mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-[#0A1628]">Tax & Duty Calculator</h1>
        <p className="text-gray-500 mt-1">
          Estimate import duties before you ship — no surprises at customs
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origin Country</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
            >
              {ORIGIN_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <select
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
            >
              {DESTINATIONS.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Value (₦)</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
            />
          </div>
        </div>
        <button
          onClick={calculate}
          className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          Calculate Duties
        </button>
      </div>

      {result && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Estimated Costs</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Import Duty</p>
              <p className="text-2xl font-bold text-[#0A1628] mt-1">₦{result.duty.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">VAT (7.5%)</p>
              <p className="text-2xl font-bold text-[#0A1628] mt-1">₦{result.vat.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-[#FF6B00]/10 rounded-lg">
              <p className="text-xs text-[#FF6B00] uppercase font-semibold">Total Duties</p>
              <p className="text-2xl font-bold text-[#FF6B00] mt-1">₦{result.total.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              This is an estimate. Actual duties may vary based on product classification (HS code), 
              trade agreements, and customs inspection. Kauvex handles customs clearance for all international shipments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
