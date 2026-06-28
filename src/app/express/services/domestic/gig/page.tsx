"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  MapPin,
  Package,
  Clock,
  ArrowRight,
  Check,
  Star,
  Download,
  Truck,
} from "lucide-react";

const COVERAGE_CITIES = [
  "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu",
  "Kaduna", "Benin City", "Owerri", "Ilorin", "Jos", "Uyo",
  "Calabar", "Abeokuta", "Warri",
];

const FEATURES = [
  "Real-time GPS tracking",
  "In-app pickup scheduling",
  "Instant pricing calculator",
  "Proof of delivery photos",
  "SMS & email notifications",
  "COD collection available",
];

export default function KauvexGoPage() {
  const [pickupCity, setPickupCity] = useState("Lagos");
  const [deliveryCity, setDeliveryCity] = useState("Abuja");
  const [weight, setWeight] = useState(1);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#cc5500] rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Kauvex Go</h1>
            <p className="text-white/60 text-sm">Book pickups, track shipments — all via the app</p>
          </div>
        </div>
        <p className="text-white/70 max-w-xl mt-2">
          Nigeria&apos;s leading logistics platform. Book pickups, track shipments in real-time,
          and manage deliveries — all via the Kauvex Go App.
        </p>
        <div className="flex items-center gap-3 mt-5">
          <button className="bg-white text-[#FF6B00] font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 hover:bg-white/90 transition-colors">
            <Download className="w-4 h-4" />
            Download Kauvex Go
          </button>
          <Link
            href="/express/book"
            className="bg-white/15 border border-white/30 text-white font-semibold px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 hover:bg-white/25 transition-colors"
          >
            Book via Web <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quick Quote */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Get Instant Rate</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup City</label>
            <select
              value={pickupCity}
              onChange={(e) => setPickupCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
            >
              {COVERAGE_CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery City</label>
            <select
              value={deliveryCity}
              onChange={(e) => setDeliveryCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
            >
              {COVERAGE_CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 1)}
              min={0.1}
              step={0.1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
              Calculate Rate
            </button>
          </div>
        </div>
        <div className="mt-4 p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Estimated Rate</p>
              <p className="text-xs text-gray-500">{pickupCity} → {deliveryCity} · {weight} kg</p>
            </div>
            <p className="text-2xl font-bold text-[#FF6B00]">₦4,200</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3">
              <Check className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-sm text-gray-700">{f}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-3">Coverage — 15 Cities</h2>
        <div className="flex flex-wrap gap-2">
          {COVERAGE_CITIES.map((c) => (
            <span
              key={c}
              className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-medium"
            >
              ● {c}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
