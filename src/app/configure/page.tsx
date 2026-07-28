"use client";

import Link from "next/link";
import {
  Ship, Sun, Camera, Building2, ChefHat, Waves, ShieldCheck, Sprout,
  ArrowRight, Sparkles,
} from "lucide-react";

const CONFIGURATORS = [
  {
    icon: Ship, label: "Boat Configurator",
    desc: "Design and spec fishing boats, patrol vessels, ferries, yachts, and more",
    href: "/configure/boat", color: "bg-blue-50 text-blue",
    badge: "10-step design",
  },
  {
    icon: Sun, label: "Solar System",
    desc: "Design residential, commercial, and industrial solar installations",
    href: "/configure/solar", color: "bg-amber-50 text-amber",
    badge: "7-step planner",
  },
  {
    icon: Camera, label: "CCTV Planner",
    desc: "Plan security camera systems for any property type",
    href: "/configure/cctv", color: "bg-emerald-50 text-emerald",
    badge: "4-step setup",
  },
  {
    icon: Building2, label: "House / Building",
    desc: "Design houses, duplexes, commercial buildings with full BOQ",
    href: "/configure/house", color: "bg-violet-50 text-violet",
    badge: "4-step design",
  },
  {
    icon: ChefHat, label: "Kitchen Designer",
    desc: "Design your dream kitchen with cabinets, appliances, and finishes",
    href: "/configure/kitchen", color: "bg-orange-50 text-orange",
    badge: "5-step design",
  },
  {
    icon: Waves, label: "Dredging Planner",
    desc: "Plan dredging operations with volume calculations and compliance",
    href: "/configure/dredging", color: "bg-sky-50 text-sky-600",
    badge: "4-step planner",
  },
  {
    icon: ShieldCheck, label: "Security System",
    desc: "Design integrated security systems for homes and businesses",
    href: "/configure/cctv", color: "bg-red-50 text-red",
    badge: "Coming soon",
    coming: true,
  },
  {
    icon: Sprout, label: "Farm / Greenhouse",
    desc: "Design agricultural facilities, greenhouses, and irrigation systems",
    href: "/configure/house", color: "bg-green-50 text-green",
    badge: "Coming soon",
    coming: true,
  },
];

export default function ConfigurePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#0A1628] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#0A1628] font-medium">Design Studio</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#0A1628] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              <span>AI-Powered Design Studio</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Design. Configure.{" "}
              <span className="text-[#FF6B00]">Build with Confidence.</span>
            </h1>
            <p className="text-base md:text-lg text-gray-300 max-w-xl">
              Use our intelligent configurators to design, spec, and get instant cost estimates
              for your next project — from boats and buildings to solar systems and security.
            </p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 -mt-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONFIGURATORS.map((item) => (
            <Link
              key={item.label}
              href={item.coming ? "#" : item.href}
              className={`group bg-white rounded-xl border border-gray-200 p-5 shadow-soft hover:shadow-medium transition-all ${
                item.coming ? "opacity-60 cursor-not-allowed" : "hover:border-[#FF6B00]/30 hover:-translate-y-0.5"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">
                  {item.label}
                </h3>
                <ArrowRight className={`w-4 h-4 text-gray-300 group-hover:text-[#FF6B00] transition-all group-hover:translate-x-0.5 ${item.coming ? "hidden" : ""}`} />
              </div>
              <p className="text-sm text-gray-500 mb-3">{item.desc}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                {item.badge}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
