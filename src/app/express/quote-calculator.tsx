"use client";

import { useState } from "react";
import { Calculator, ArrowRight, Zap, Clock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const cities = [
  "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu",
  "Aba", "Benin City", "Warri", "Uyo", "Calabar", "Jos",
  "Kaduna", "Onitsha", "Abeokuta", "Owerri", "Akure", "Ilorin",
];

const countries = [
  "Nigeria", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "Netherlands", "Italy", "Spain",
  "China", "UAE", "South Africa", "Ghana", "Kenya",
];

const contentsTypes = [
  "Documents", "Electronics", "Clothing", "Fragile Items",
  "Food & Perishables", "Automotive Parts", "Medical Supplies",
  "Other",
];

const quoteResults = [
  {
    tier: "Economy",
    icon: Wallet,
    price: "₦4,500",
    eta: "5-7 business days",
    desc: "Budget-friendly",
  },
  {
    tier: "Standard",
    icon: Clock,
    price: "₦7,200",
    eta: "2-4 business days",
    desc: "Best value",
    featured: true,
  },
  {
    tier: "Express",
    icon: Zap,
    price: "₦12,500",
    eta: "1-2 business days",
    desc: "Priority",
  },
];

export default function QuoteCalculator() {
  const [pickupCity, setPickupCity] = useState("");
  const [dropoffCity, setDropoffCity] = useState("");
  const [pickupCountry, setPickupCountry] = useState("Nigeria");
  const [dropoffCountry, setDropoffCountry] = useState("Nigeria");
  const [weight, setWeight] = useState(5);
  const [contents, setContents] = useState("Documents");
  const [showQuote, setShowQuote] = useState(false);

  const handleGetQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupCity || !dropoffCity) return;
    setShowQuote(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-strong p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-5">
        <Calculator className="w-5 h-5 text-orange" />
        <h3 className="font-syne font-700 text-lg text-text-1">Instant Quote Calculator</h3>
      </div>

      <form onSubmit={handleGetQuote} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-3 mb-1.5">Pickup City</label>
            <select
              value={pickupCity}
              onChange={(e) => setPickupCity(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
            >
              <option value="">Select city</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-3 mb-1.5">Dropoff City</label>
            <select
              value={dropoffCity}
              onChange={(e) => setDropoffCity(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
            >
              <option value="">Select city</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-3 mb-1.5">Pickup Country</label>
            <select
              value={pickupCountry}
              onChange={(e) => setPickupCountry(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
            >
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-3 mb-1.5">Dropoff Country</label>
            <select
              value={dropoffCountry}
              onChange={(e) => setDropoffCountry(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
            >
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-3 mb-1.5">
            Weight: <span className="text-orange font-bold">{weight} kg</span>
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-4">0.1</span>
            <input
              type="range"
              min={0.1}
              max={1000}
              step={0.1}
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="flex-1 accent-orange"
            />
            <span className="text-xs text-text-4">1000</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-3 mb-1.5">Dimensions (cm)</label>
            <div className="grid grid-cols-3 gap-1.5">
              <input
                type="number"
                placeholder="L"
                className="w-full h-10 rounded-lg border border-border bg-white px-2 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
              />
              <input
                type="number"
                placeholder="W"
                className="w-full h-10 rounded-lg border border-border bg-white px-2 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
              />
              <input
                type="number"
                placeholder="H"
                className="w-full h-10 rounded-lg border border-border bg-white px-2 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-3 mb-1.5">Contents Type</label>
            <select
              value={contents}
              onChange={(e) => setContents(e.target.value)}
              className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
            >
              {contentsTypes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full bg-orange hover:bg-orange-600 text-base mt-2">
          Get Quote <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      {showQuote && (
        <div className="mt-6 pt-6 border-t border-border space-y-3 animate-fade-in">
          <p className="text-xs font-semibold text-text-4 uppercase tracking-wider">Recommended Options</p>
          <div className="grid gap-3">
            {quoteResults.map((q) => {
              const Icon = q.icon;
              return (
                <div
                  key={q.tier}
                  className={`rounded-xl border p-4 flex items-center justify-between transition-all hover:shadow-soft ${
                    q.featured
                      ? "border-orange bg-orange-50 ring-1 ring-orange"
                      : "border-border bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      q.featured ? "bg-orange" : "bg-gray-100"
                    }`}>
                      <Icon className={`w-5 h-5 ${q.featured ? "text-white" : "text-text-3"}`} />
                    </div>
                    <div>
                      <p className="font-syne font-700 text-sm text-text-1">{q.tier}</p>
                      <p className="text-xs text-text-4">{q.eta}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-syne font-700 text-base text-text-1">{q.price}</p>
                    <p className="text-xs text-text-4">{q.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <Button size="lg" className="w-full bg-navy hover:bg-navy/90 text-base mt-1">
            Book Now <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
