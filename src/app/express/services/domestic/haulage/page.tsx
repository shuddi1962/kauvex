"use client";

import Link from "next/link";
import {
  Truck,
  ArrowRight,
  Check,
  MapPin,
  Package,
  Shield,
  Clock,
  Building2,
} from "lucide-react";

const TRUCK_TYPES = [
  { name: "Flatbed", capacity: "20–30 tons", use: "Machinery, construction materials", icon: Truck },
  { name: "Curtainsider", capacity: "20–28 tons", use: "General cargo, palletized goods", icon: Package },
  { name: "Refrigerated", capacity: "15–25 tons", use: "Perishable goods, pharmaceuticals", icon: Shield },
  { name: "Tanker", capacity: "20,000–40,000L", use: "Fuel, chemicals, food-grade liquids", icon: Building2 },
];

const ROUTES = [
  { from: "Lagos", to: "Abuja", time: "2–3 days", price: "From ₦350,000" },
  { from: "Lagos", to: "Port Harcourt", time: "1–2 days", price: "From ₦280,000" },
  { from: "Lagos", to: "Kano", time: "3–4 days", price: "From ₦450,000" },
  { from: "Abuja", to: "Port Harcourt", time: "2–3 days", price: "From ₦320,000" },
  { from: "Lagos", to: "Accra, Ghana", time: "3–5 days", price: "From ₦650,000" },
];

export default function HaulagePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Truck className="w-8 h-8 text-red-200" />
          <h1 className="text-2xl font-bold">Haulage & Heavy Cargo</h1>
        </div>
        <p className="text-white/70 max-w-xl">
          Full and partial truck loads. Flatbed, curtainsider, refrigerated. 
          Nationwide and West Africa coverage.
        </p>
        <div className="flex items-center gap-4 mt-5">
          <Link
            href="/express/corporate"
            className="inline-flex items-center gap-2 bg-white text-red-700 font-semibold px-6 py-3 rounded-lg text-sm hover:bg-white/90 transition-colors"
          >
            Request Quote <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-white/50 text-sm">Min: 500 kg · Door-to-door</span>
        </div>
      </div>

      {/* Truck Types */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Truck Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRUCK_TYPES.map((t) => (
            <div key={t.name} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                <t.icon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#0A1628]">{t.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Capacity: {t.capacity}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.use}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Routes */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Popular Routes</h2>
        <div className="space-y-2">
          {ROUTES.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-[#0A1628]">{r.from} → {r.to}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {r.time}
                </div>
                <span className="text-sm font-bold text-red-600">{r.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-[#0A1628]">Need a custom haulage solution?</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Dedicated fleet, project cargo, and recurring routes available.
        </p>
        <Link
          href="/express/corporate"
          className="inline-flex items-center gap-2 bg-[#0A1628] text-white font-semibold px-6 py-3 rounded-lg text-sm hover:bg-[#1a2744] transition-colors"
        >
          Contact Enterprise Sales <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
