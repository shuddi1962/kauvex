"use client";

import { useState, useEffect } from "react";
import {
  Calculator, DollarSign, Package, Truck, Shield, Percent,
  ArrowRight, RefreshCw, Loader2, Info, TrendingUp,
} from "lucide-react";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

const exchangeRates: Record<string, number> = {
  USD: 1, NGN: 1550, GBP: 0.79, EUR: 0.92, AED: 3.67,
  INR: 83.5, CAD: 1.36, AUD: 1.53, ZAR: 18.2, JPY: 149.5,
};

const defaultDutyRates: Record<string, number> = {
  "Textiles & Apparel": 15, "Electronics & Components": 5, "Machinery & Industrial": 8,
  "Automotive Parts": 10, "Food & Beverage Processing": 12, "Pharmaceuticals & Medical": 0,
  "Chemicals & Plastics": 7, "Building Materials": 8, "Furniture & Woodwork": 10,
  "Packaging & Printing": 6, "Metals & Alloys": 5, "Ceramics & Glass": 10,
  "Footwear & Leather": 15, "Toys & Consumer Goods": 12, "Energy & Solar": 2,
};

const hsCodes = [
  { code: "8544.42", desc: "Electrical conductors (USB cables)", duty: 5 },
  { code: "7208.51", desc: "Hot-rolled steel sheets", duty: 8 },
  { code: "6109.10", desc: "Cotton T-shirts (knitted)", duty: 15 },
  { code: "8471.30", desc: "Portable digital machines (laptops)", duty: 0 },
  { code: "3301.90", desc: "Essential oils (shea butter)", duty: 5 },
  { code: "8507.60", desc: "Lithium-ion accumulators", duty: 3 },
  { code: "6403.91", desc: "Footwear with leather uppers", duty: 15 },
  { code: "7010.90", desc: "Glass bottles for pharmaceuticals", duty: 10 },
];

export default function LandedCostPage() {
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [autoShipping, setAutoShipping] = useState(false);
  const [dutyRate, setDutyRate] = useState("");
  const [autoDuty, setAutoDuty] = useState(false);
  const [selectedHsCode, setSelectedHsCode] = useState("");
  const [kauvexCommission] = useState(5);
  const [currency, setCurrency] = useState("USD");
  const [convertTo, setConvertTo] = useState("NGN");
  const [marginPercent, setMarginPercent] = useState("30");
  const [calculating, setCalculating] = useState(false);

  const price = parseFloat(unitPrice) || 0;
  const qty = parseInt(quantity) || 0;
  const shipping = parseFloat(shippingCost) || 0;
  const duty = parseFloat(dutyRate) || 0;
  const margin = parseFloat(marginPercent) || 0;

  const subtotal = price * qty;
  const totalDuty = subtotal * (duty / 100);
  const commission = subtotal * (kauvexCommission / 100);
  const totalLanded = subtotal + shipping + totalDuty + commission;
  const landedPerUnit = qty > 0 ? totalLanded / qty : 0;
  const retailPrice = landedPerUnit * (1 + margin / 100);

  const fromRate = exchangeRates[currency] || 1;
  const toRate = exchangeRates[convertTo] || 1;
  const conversionFactor = toRate / fromRate;

  const convert = (val: number) => {
    const converted = val * conversionFactor;
    const curr = currencies.find((c) => c.code === convertTo);
    return `${curr?.symbol || ""}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    if (autoShipping && qty > 0) {
      const estimate = Math.max(500, qty * 0.85);
      setShippingCost(estimate.toString());
    }
  }, [autoShipping, qty]);

  useEffect(() => {
    if (autoDuty && selectedHsCode) {
      const hs = hsCodes.find((h) => h.code === selectedHsCode);
      if (hs) setDutyRate(hs.duty.toString());
    }
  }, [autoDuty, selectedHsCode]);

  const handleAutoShipping = async () => {
    if (!autoShipping) {
      setAutoShipping(true);
      setCalculating(true);
      try {
        const res = await fetch(`/api/v1/shipping/rates?from=CN&to=NG&qty=${qty}&weight=${qty * 0.5}`);
        if (res.ok) {
          const data = await res.json();
          if (data.estimated_cost) setShippingCost(data.estimated_cost.toString());
        }
      } catch {
        if (qty > 0) setShippingCost((qty * 0.85).toString());
      } finally {
        setCalculating(false);
      }
    } else {
      setAutoShipping(false);
      setShippingCost("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1628]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Landed Cost Calculator</h1>
          <p className="mt-2 text-gray-300">Calculate the total cost of your order including shipping, duties, and commissions.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-3 space-y-5">
            {/* Unit Price & Quantity */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-[#FF6B00]" />
                <h2 className="font-semibold text-[#0A1628]">Product Cost</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price ({currency})</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] bg-white"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shipping */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#FF6B00]" />
                  <h2 className="font-semibold text-[#0A1628]">International Shipping</h2>
                </div>
                <button
                  onClick={handleAutoShipping}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-gray-200 hover:bg-gray-50"
                >
                  {calculating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  {autoShipping ? "Manual" : "Auto-estimate"}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost ({currency})</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={shippingCost}
                  onChange={(e) => { setShippingCost(e.target.value); setAutoShipping(false); }}
                  placeholder={autoShipping ? "Auto-calculated..." : "0.00"}
                  disabled={autoShipping}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] disabled:bg-gray-50"
                />
              </div>
              {autoShipping && (
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Estimated from /api/v1/shipping/rates
                </p>
              )}
            </div>

            {/* Import Duty */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#FF6B00]" />
                  <h2 className="font-semibold text-[#0A1628]">Import Duty</h2>
                </div>
                <button
                  onClick={() => setAutoDuty(!autoDuty)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-gray-200 hover:bg-gray-50"
                >
                  <RefreshCw className="w-3 h-3" />
                  {autoDuty ? "Manual" : "HS Code lookup"}
                </button>
              </div>
              {autoDuty && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">HS Code</label>
                  <select
                    value={selectedHsCode}
                    onChange={(e) => setSelectedHsCode(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] bg-white"
                  >
                    <option value="">Select HS code...</option>
                    {hsCodes.map((hs) => (
                      <option key={hs.code} value={hs.code}>{hs.code} — {hs.desc}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duty Rate (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={dutyRate}
                    onChange={(e) => { setDutyRate(e.target.value); setAutoDuty(false); }}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                </div>
              </div>
            </div>

            {/* Margin */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-[#FF6B00]" />
                <h2 className="font-semibold text-[#0A1628]">Retail Markup</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Margin (%)</label>
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={marginPercent}
                  onChange={(e) => setMarginPercent(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                />
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Currency Converter */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Convert results to</label>
              <select
                value={convertTo}
                onChange={(e) => setConvertTo(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] bg-white"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>

            {/* Cost Breakdown */}
            <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#FF6B00]" /> Cost Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Product Cost</span>
                  <span className="font-medium text-gray-800">{convert(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-800">{convert(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Import Duty ({duty}%)</span>
                  <span className="font-medium text-gray-800">{convert(totalDuty)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kauvex Commission ({kauvexCommission}%)</span>
                  <span className="font-medium text-gray-800">{convert(commission)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-semibold text-[#0A1628]">Total Landed Cost</span>
                  <span className="text-lg font-bold text-[#0A1628]">{convert(totalLanded)}</span>
                </div>
              </div>
            </div>

            {/* Per Unit Result */}
            <div className="rounded-xl bg-[#0A1628] text-white p-5">
              <p className="text-sm text-gray-300 mb-1">Landed Cost Per Unit</p>
              <p className="text-3xl font-bold">{convert(landedPerUnit)}</p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-gray-300 mb-1">Total Order Cost</p>
                <p className="text-xl font-bold">{convert(totalLanded)}</p>
              </div>
            </div>

            {/* Recommended Retail */}
            <div className="rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white p-5">
              <p className="text-sm text-white/80 mb-1">Recommended Retail Price (per unit)</p>
              <p className="text-3xl font-bold">{convert(retailPrice)}</p>
              <p className="text-xs text-white/70 mt-1">
                Based on {margin}% margin over landed cost
              </p>
              <div className="mt-3 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Profit per unit: {convert(retailPrice - landedPerUnit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
