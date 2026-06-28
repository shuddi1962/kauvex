"use client";

import Link from "next/link";
import {
  Globe,
  ArrowRight,
  Check,
  Warehouse,
  Truck,
  Package,
  BarChart3,
  Shield,
  Clock,
} from "lucide-react";

const HUBS = [
  { city: "Lagos", country: "Nigeria", capacity: "10,000 sqm", status: "Primary Hub" },
  { city: "London", country: "United Kingdom", capacity: "5,000 sqm", status: "Active" },
  { city: "Newark", country: "United States", capacity: "4,000 sqm", status: "Active" },
  { city: "Shenzhen", country: "China", capacity: "6,000 sqm", status: "Active" },
  { city: "Toronto", country: "Canada", capacity: "3,000 sqm", status: "Active" },
  { city: "Accra", country: "Ghana", capacity: "2,000 sqm", status: "Active" },
];

const FEATURES = [
  { icon: Warehouse, title: "Global Warehousing", desc: "Store inventory in 6 hubs across 4 continents" },
  { icon: Package, title: "Pick & Pack", desc: "Orders fulfilled same-day from nearest hub" },
  { icon: Truck, title: "Multi-Carrier", desc: "Automatic carrier selection for best rate + speed" },
  { icon: BarChart3, title: "Real-Time Inventory", desc: "Sync stock across all hubs from one dashboard" },
  { icon: Shield, title: "Insurance", desc: "Goods covered at every stage of the journey" },
  { icon: Clock, title: "24–72h Delivery", desc: "Local fulfillment means faster delivery to customers" },
];

export default function FulfillmentPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2744] rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Globe className="w-8 h-8 text-[#FF6B00]" />
          <h1 className="text-2xl font-bold">Global Fulfillment Network</h1>
        </div>
        <p className="text-white/70 max-w-xl">
          Store inventory closer to your customers. 6 fulfillment hubs across 4 continents 
          for 24–72 hour delivery worldwide.
        </p>
        <Link
          href="/express/corporate"
          className="inline-flex items-center gap-2 bg-[#FF6B00] text-white font-semibold px-6 py-3 rounded-lg text-sm mt-5 hover:bg-[#e55f00] transition-colors"
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Hubs */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Fulfillment Hubs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HUBS.map((hub) => (
            <div key={hub.city} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[#0A1628]">{hub.city}</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  {hub.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">{hub.country}</p>
              <p className="text-xs text-gray-400 mt-1">Capacity: {hub.capacity}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="w-10 h-10 bg-[#FF6B00]/10 rounded-lg flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-[#FF6B00]" />
              </div>
              <h3 className="font-semibold text-sm text-[#0A1628]">{f.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
