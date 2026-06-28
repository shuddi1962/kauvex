"use client";

import Link from "next/link";
import {
  Globe,
  ArrowRight,
  Check,
  MapPin,
  Package,
  Home,
  Clock,
  Shield,
} from "lucide-react";

const ORIGIN_COUNTRIES = [
  { country: "United Kingdom", flag: "🇬🇧", time: "3–5 days", address: "London, UK" },
  { country: "United States", flag: "🇺🇸", time: "4–7 days", address: "Newark, NJ, USA" },
  { country: "China", flag: "🇨🇳", time: "7–14 days", address: "Shenzhen, China" },
  { country: "Canada", flag: "🇨🇦", time: "5–8 days", address: "Toronto, Canada" },
  { country: "Ghana", flag: "🇬🇭", time: "2–3 days", address: "Accra, Ghana" },
  { country: "Benin Republic", flag: "🇧🇯", time: "1–2 days", address: "Cotonou, Benin" },
];

export default function ImportPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Globe className="w-8 h-8 text-green-200" />
          <h1 className="text-2xl font-bold">Import to Nigeria</h1>
        </div>
        <p className="text-white/70 max-w-xl">
          Receive shipments in Nigeria from Canada, China, UK, USA, Ghana & Benin Republic. 
          Get a virtual address and we ship it home.
        </p>
      </div>

      {/* Shop & Ship */}
      <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <Home className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-[#0A1628]">Shop & Ship — Your Virtual Address</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Use your Kauvex virtual address at any UK, USA, China, or Canada store — 
          we consolidate and ship to your door in Nigeria.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-sm text-[#0A1628]">UK Virtual Address</h3>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Your Name<br />
              Kauvex UK Hub<br />
              123 Commerce Way<br />
              London, E1 8AN<br />
              United Kingdom
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-sm text-[#0A1628]">USA Virtual Address</h3>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Your Name<br />
              Kauvex US Hub<br />
              222 Market Street<br />
              Newark, NJ 07102<br />
              United States
            </p>
          </div>
        </div>
        <a href="/account/virtual-address" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors inline-block">
          Get My Virtual Address
        </a>
      </section>

      {/* Origin Countries */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Import From</h2>
        <div className="space-y-2">
          {ORIGIN_COUNTRIES.map((c) => (
            <div key={c.country} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl">{c.flag}</span>
                <div>
                  <span className="text-sm font-medium text-[#0A1628]">{c.country}</span>
                  <p className="text-xs text-gray-400">{c.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {c.time}
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">How Import Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "1", title: "Get Address", desc: "Receive your virtual address in UK/USA/China" },
            { step: "2", title: "Shop", desc: "Order from any online store using your address" },
            { step: "3", title: "Consolidate", desc: "We receive, inspect, and package your items" },
            { step: "4", title: "Ship Home", desc: "Delivered to your door in Nigeria in 3–14 days" },
          ].map((s) => (
            <div key={s.step} className="text-center p-5 bg-white border border-gray-200 rounded-xl">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-sm">
                {s.step}
              </div>
              <h3 className="font-semibold text-sm text-[#0A1628]">{s.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
