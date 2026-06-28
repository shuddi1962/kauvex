"use client";

import Link from "next/link";
import {
  Zap,
  Truck,
  Globe,
  Building2,
  Snowflake,
  Ship,
  Plane,
  Wheat,
  Fuel,
  HeartPulse,
  Mail,
  Warehouse,
  ArrowRight,
  Check,
  Clock,
  Shield,
  MapPin,
  Smartphone,
} from "lucide-react";

const DOMESTIC_SERVICES = [
  {
    icon: Zap,
    name: "Kauvex Priority",
    desc: "Express delivery across Nigeria in 24–48 hours",
    color: "bg-[#FF6B00]/10 text-[#FF6B00]",
    href: "/express/services/domestic/gofaster",
  },
  {
    icon: Smartphone,
    name: "Kauvex Go",
    desc: "Book pickups, track shipments — all via the app",
    color: "bg-orange-50 text-orange-600",
    href: "/express/services/domestic/gig",
  },
  {
    icon: Building2,
    name: "eCommerce Shipping",
    desc: "Flexible shipping plans for online businesses",
    color: "bg-green-50 text-green-600",
    href: "/express/services/domestic/ecommerce",
  },
  {
    icon: MapPin,
    name: "Last-Mile Delivery",
    desc: "Seamless doorstep delivery for your final-mile needs",
    color: "bg-purple-50 text-purple-600",
    href: "/express/services/domestic/last-mile",
  },
  {
    icon: Truck,
    name: "Haulage",
    desc: "Heavy goods transport — full and partial loads nationwide",
    color: "bg-red-50 text-red-600",
    href: "/express/services/domestic/haulage",
  },
  {
    icon: Mail,
    name: "Mailroom Services",
    desc: "Corporate mail management, sorting and dispatch",
    color: "bg-amber-50 text-amber-600",
    href: "/express/services/domestic/mailroom",
  },
  {
    icon: Warehouse,
    name: "Warehousing",
    desc: "Secure storage and inventory management solutions",
    color: "bg-indigo-50 text-indigo-600",
    href: "/express/services/domestic/warehousing",
  },
  {
    icon: Building2,
    name: "Corporate Accounts",
    desc: "Custom SLAs, dedicated managers, monthly billing",
    color: "bg-gray-100 text-gray-700",
    href: "/express/business",
  },
];

const INTERNATIONAL_SERVICES = [
  {
    icon: Globe,
    name: "Export from Nigeria",
    desc: "Ship to 230+ countries with DHL, FedEx, UPS, Aramex",
    color: "bg-blue-50 text-blue-600",
    href: "/express/services/international/export",
  },
  {
    icon: Globe,
    name: "Import to Nigeria",
    desc: "Virtual addresses in UK, USA, China, Canada — we ship home",
    color: "bg-green-50 text-green-600",
    href: "/express/services/international/import",
  },
  {
    icon: Ship,
    name: "Ocean Freight",
    desc: "FCL and LCL shipments. Asia, Europe, Americas.",
    color: "bg-cyan-50 text-cyan-600",
    href: "/express/corporate",
  },
  {
    icon: Plane,
    name: "Air Freight",
    desc: "Time-critical cargo. Express air, charter, belly cargo.",
    color: "bg-violet-50 text-violet-600",
    href: "/express/corporate",
  },
];

const LOGISTICS_SERVICES = [
  {
    icon: Truck,
    name: "Haulage & Heavy Cargo",
    desc: "Full and partial truck loads. Flatbed, curtainsider, refrigerated. Nationwide and West Africa.",
    meta: "Min: 500 kg · Door-to-door",
  },
  {
    icon: Warehouse,
    name: "Warehousing & Fulfillment",
    desc: "Pick, pack, store, and dispatch from our Lagos, Abuja, and PHC hubs.",
    meta: "From ₦15,000/m² per month",
  },
  {
    icon: Mail,
    name: "Mailroom Management",
    desc: "Outsource your entire corporate mailroom — collection, sorting, scanning, dispatch.",
    meta: "Pricing on request",
  },
  {
    icon: Snowflake,
    name: "Cold Chain Logistics",
    desc: "Temperature-controlled transport for pharma, food, and biomedical cargo.",
    meta: "2°C–8°C · Monitored live",
  },
  {
    icon: Ship,
    name: "Ocean Freight",
    desc: "FCL and LCL shipments. Asia, Europe, Americas. Weekly consolidation.",
    meta: "FCL from $800/container",
  },
  {
    icon: Plane,
    name: "Air Freight",
    desc: "Time-critical cargo. Express air, charter, belly cargo. All major airports.",
    meta: "From 100 kg · 24–72h delivery",
  },
  {
    icon: Wheat,
    name: "Agricultural Cargo",
    desc: "Perishable and bulk agricultural products. Export documentation support.",
    meta: "NAFDAC, SON compliant",
  },
  {
    icon: Fuel,
    name: "Oil & Gas Logistics",
    desc: "Hazmat-certified. Pipe, equipment, consumables. Offshore and onshore support.",
    meta: "DGR certified couriers",
  },
  {
    icon: HeartPulse,
    name: "Medical & Pharma",
    desc: "GDP-compliant. Regulated medicines, lab samples, medical equipment.",
    meta: "NAFDAC approved routes",
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">Logistics Services</h1>
        <p className="text-gray-500 mt-1">
          End-to-end shipping solutions — from local deliveries to global freight
        </p>
      </div>

      {/* Domestic */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Domestic Shipping</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DOMESTIC_SERVICES.map((s) => (
            <Link
              key={s.name}
              href={s.href}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#FF6B00] hover:shadow-md transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">
                {s.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs font-medium text-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* International */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">International Shipping</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INTERNATIONAL_SERVICES.map((s) => (
            <Link
              key={s.name}
              href={s.href}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#FF6B00] hover:shadow-md transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">
                {s.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs font-medium text-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity">
                Get a quote <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Logistics / Enterprise */}
      <section>
        <div className="bg-[#0A1628] rounded-xl p-6 mb-4">
          <h2 className="text-lg font-semibold text-white">Beyond eCommerce — Full Logistics Solutions</h2>
          <p className="text-sm text-white/60 mt-1">
            Kauvex handles enterprise, industrial, pharmaceutical, agricultural, and project cargo — not just parcels.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LOGISTICS_SERVICES.map((s) => (
            <div
              key={s.name}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#FF6B00] hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                <s.icon className="w-5 h-5 text-[#0A1628]" />
              </div>
              <h3 className="font-semibold text-sm text-[#0A1628]">{s.name}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
              <p className="text-[11px] text-gray-400 mt-2">{s.meta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#0A1628] to-[#1a2744] rounded-xl p-8 text-center">
        <h3 className="text-xl font-bold text-white">Need a custom logistics solution?</h3>
        <p className="text-sm text-white/60 mt-2 mb-6">
          Our enterprise team builds tailored supply chain solutions for businesses of any size.
        </p>
        <Link
          href="/express/corporate"
          className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Contact Sales <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
