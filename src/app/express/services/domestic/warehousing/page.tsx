"use client";

import Link from "next/link";
import {
  Warehouse,
  ArrowRight,
  Check,
  MapPin,
  Package,
  BarChart3,
  Shield,
  Clock,
  Truck,
} from "lucide-react";

const LOCATIONS = [
  { city: "Lagos", area: "Ikeja Industrial", capacity: "5,000 sqm", status: "Active" },
  { city: "Abuja", area: "Central Business District", capacity: "3,000 sqm", status: "Active" },
  { city: "Port Harcourt", area: "Trans-Amadi", capacity: "2,500 sqm", status: "Active" },
];

const SERVICES = [
  { icon: Package, title: "Pick & Pack", desc: "Orders picked, packed, and dispatched same-day" },
  { icon: Warehouse, title: "Storage", desc: "Secure, climate-monitored warehouse space" },
  { icon: BarChart3, title: "Inventory Management", desc: "Real-time stock levels and alerts" },
  { icon: Truck, title: "Fulfillment", desc: "Direct integration with your store for auto-fulfillment" },
  { icon: Shield, title: "Insurance", desc: "Goods covered up to ₦50M per facility" },
  { icon: Clock, title: "24/7 Access", desc: "Round-the-clock facility access for your team" },
];

export default function WarehousingPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Warehouse className="w-8 h-8 text-indigo-200" />
          <h1 className="text-2xl font-bold">Warehousing & Fulfillment</h1>
        </div>
        <p className="text-white/70 max-w-xl">
          Pick, pack, store, and dispatch from our Lagos, Abuja, and Port Harcourt hubs. 
          From ₦15,000/m² per month.
        </p>
        <Link
          href="/express/corporate"
          className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-lg text-sm mt-5 hover:bg-white/90 transition-colors"
        >
          Book a Tour <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Locations */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Warehouse Locations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LOCATIONS.map((loc) => (
            <div key={loc.city} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-[#0A1628]">{loc.city}</h3>
                <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  {loc.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">{loc.area}</p>
              <p className="text-xs text-gray-400 mt-1">Capacity: {loc.capacity}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Services Included</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SERVICES.map((s) => (
            <div key={s.title} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
                <s.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-sm text-[#0A1628]">{s.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tier: "Standard Storage", price: "₦15,000/m²", desc: "Ambient, dry goods" },
            { tier: "Climate Controlled", price: "₦25,000/m²", desc: "Pharma, food, electronics" },
            { tier: "Fulfillment Fee", price: "₦500/order", desc: "Pick, pack, dispatch" },
          ].map((p) => (
            <div key={p.tier} className="p-4 bg-gray-50 rounded-lg text-center">
              <h3 className="font-semibold text-sm text-[#0A1628]">{p.tier}</h3>
              <p className="text-xl font-bold text-indigo-600 mt-1">{p.price}</p>
              <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
