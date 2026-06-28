"use client";

import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  Check,
  Clock,
  Shield,
  Truck,
  Package,
  BarChart3,
} from "lucide-react";

const FEATURES = [
  { icon: Clock, title: "Same-Day Delivery", desc: "Orders placed before 2PM delivered today" },
  { icon: MapPin, title: "Live GPS Tracking", desc: "Real-time rider location on your dashboard" },
  { icon: Shield, title: "Proof of Delivery", desc: "Photo + signature + PIN confirmation" },
  { icon: Package, title: "COD Collection", desc: "Collect payment on delivery, remit weekly" },
  { icon: BarChart3, title: "Delivery Analytics", desc: "Success rates, times, and rider performance" },
  { icon: Truck, title: "Multi-Stop Routes", desc: "Batch deliveries optimized for efficiency" },
];

export default function LastMilePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <MapPin className="w-8 h-8 text-purple-200" />
          <h1 className="text-2xl font-bold">Last-Mile Delivery</h1>
        </div>
        <p className="text-white/70 max-w-xl">
          Seamless doorstep delivery for your final-mile needs. From warehouse to customer — 
          tracked, insured, and confirmed.
        </p>
        <Link
          href="/express/book"
          className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold px-6 py-3 rounded-lg text-sm mt-5 hover:bg-white/90 transition-colors"
        >
          Book Last-Mile Delivery <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* How It Works */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "1", title: "Schedule", desc: "Set pickup location and delivery window" },
            { step: "2", title: "Collect", desc: "Rider picks up within 60 minutes" },
            { step: "3", title: "Track", desc: "Live GPS tracking on your dashboard" },
            { step: "4", title: "Confirm", desc: "Photo proof + recipient signature" },
          ].map((s) => (
            <div key={s.step} className="text-center p-5 bg-white border border-gray-200 rounded-xl">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-sm">
                {s.step}
              </div>
              <h3 className="font-semibold text-sm text-[#0A1628]">{s.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-sm text-[#0A1628]">{f.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-3">Coverage Areas</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {["Lagos Mainland", "Lagos Island", "Victoria Island", "Lekki", " Ikeja", "Surulere",
            "Yaba", "Ajah", "Ikorodu", "Epe", "Abuja", "Port Harcourt"].map((area) => (
            <div key={area} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              {area}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
