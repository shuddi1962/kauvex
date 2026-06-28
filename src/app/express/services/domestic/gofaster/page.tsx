"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Clock, MapPin, ArrowRight, Check, Truck } from "lucide-react";

const ROUTES = [
  { from: "Lagos", to: "Abuja", time: "24h", price: "₦6,500" },
  { from: "Lagos", to: "Port Harcourt", time: "24h", price: "₦5,800" },
  { from: "Lagos", to: "Ibadan", time: "12h", price: "₦3,200" },
  { from: "Abuja", to: "Lagos", time: "24h", price: "₦6,500" },
  { from: "Abuja", to: "Kano", time: "24h", price: "₦5,500" },
  { from: "Port Harcourt", to: "Lagos", time: "24h", price: "₦5,800" },
];

export default function KauvexPriorityPage() {
  const [from, setFrom] = useState("Lagos");
  const [to, setTo] = useState("Abuja");

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#cc5500] rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Kauvex Priority</h1>
            <p className="text-white/70 text-sm">Express delivery across Nigeria in 24–48 hours</p>
          </div>
        </div>
        <p className="text-white/70 max-w-xl mt-2">
          Priority handling, dedicated riders, and real-time GPS tracking.
          For urgent shipments that can&apos;t wait.
        </p>
        <Link
          href="/express/book"
          className="inline-flex items-center gap-2 bg-white text-[#FF6B00] font-semibold px-6 py-3 rounded-lg text-sm mt-5 hover:bg-white/90 transition-colors"
        >
          Book Kauvex Priority <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Speed Comparison */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Speed Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Kauvex Priority", time: "24h", color: "bg-[#FF6B00]", desc: "Priority express — guaranteed next-day" },
            { name: "Kauvex Standard", time: "48h", color: "bg-[#0A1628]", desc: "Reliable 2-day delivery" },
            { name: "Kauvex Economy", time: "3–5 days", color: "bg-gray-400", desc: "Budget-friendly, tracked" },
          ].map((t) => (
            <div key={t.name} className="border border-gray-200 rounded-xl p-5">
              <div className={`w-10 h-10 ${t.color} rounded-lg flex items-center justify-center mb-3`}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-[#0A1628]">{t.name}</h3>
              <p className="text-2xl font-bold text-[#FF6B00] mt-1">{t.time}</p>
              <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Route Pricing */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Route Pricing (Kauvex Priority)</h2>
        <div className="space-y-2">
          {ROUTES.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-[#0A1628]">
                  {r.from} → {r.to}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {r.time}
                </div>
                <span className="text-sm font-bold text-[#FF6B00]">{r.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { step: "1", title: "Book", desc: "Enter pickup & delivery details" },
          { step: "2", title: "Pack", desc: "Prepare your parcel for pickup" },
          { step: "3", title: "Ride", desc: "Rider collects within 60 min" },
          { step: "4", title: "Deliver", desc: "Delivered within 24 hours" },
        ].map((s) => (
          <div key={s.step} className="text-center p-5">
            <div className="w-10 h-10 bg-[#FF6B00] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-sm">
              {s.step}
            </div>
            <h3 className="font-semibold text-sm text-[#0A1628]">{s.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
