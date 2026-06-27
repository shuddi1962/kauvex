"use client";

import {
  Truck,
  Warehouse,
  Thermometer,
  Ship,
  Plane,
  Leaf,
  Fuel,
  Stethoscope,
  Mail,
  ArrowRight,
  CheckCircle2,
  Phone,
  Globe,
} from "lucide-react";

const SERVICES = [
  {
    icon: Truck,
    title: "Haulage & Heavy Cargo",
    desc: "Full and partial truck loads. Flatbed, curtainsider, refrigerated. Nationwide in Nigeria + West Africa + UK.",
    min: "500 kg",
    features: ["Door-to-door", "GPS tracked", "Full & partial loads"],
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Warehouse,
    title: "Warehousing & Fulfillment (FBK)",
    desc: "Pick, pack, store, and dispatch from Kauvex hubs in Lagos, Abuja, Port Harcourt, London, Dubai.",
    min: "From ₦15,000/m²/month",
    features: ["Real-time inventory", "Multi-city", "Express dispatch"],
    color: "from-green-500 to-green-600",
  },
  {
    icon: Thermometer,
    title: "Cold Chain Logistics",
    desc: "Temperature-controlled transport 2°C–8°C and -18°C. Pharma, Food, Biomedical, Lab Samples.",
    min: "GDP-compliant",
    features: ["Live temperature monitoring", "Insulated packaging", "Chain of custody"],
    color: "from-cyan-500 to-cyan-600",
  },
  {
    icon: Ship,
    title: "Ocean Freight",
    desc: "FCL and LCL shipments. Asia, Europe, Americas. Weekly consolidation from Lagos Tin Can + Onne Port.",
    min: "FCL from $800/container",
    features: ["Bill of Lading", "Customs clearance", "Door-to-port"],
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Plane,
    title: "Air Freight",
    desc: "Time-critical cargo. Express air, charter, belly cargo. MMIA Lagos, Abuja, PHC, Heathrow, JFK, Dubai.",
    min: "Express available",
    features: ["Air Waybill generated", "Same-day booking", "Charter options"],
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Leaf,
    title: "Agricultural Cargo",
    desc: "Perishable and bulk agricultural products. Export documentation + NAFDAC compliance support.",
    min: "Export ready",
    features: ["NAFDAC compliance", "Perishable handling", "Documentation"],
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Fuel,
    title: "Oil & Gas Logistics",
    desc: "Hazmat-certified. Pipe, equipment, consumables. Offshore and onshore — Niger Delta specialists.",
    min: "DGR certified",
    features: ["Hazmat certified", "Offshore delivery", "Specialized equipment"],
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: Stethoscope,
    title: "Medical & Pharmaceutical",
    desc: "GDP-compliant routes. Regulated medicines, lab samples, medical equipment. NAFDAC approved.",
    min: "NAFDAC approved",
    features: ["Temperature monitoring", "Chain of custody", "Regulated transport"],
    color: "from-red-500 to-red-600",
  },
  {
    icon: Mail,
    title: "Mailroom Management",
    desc: "Outsource your entire corporate mailroom. Collection, sorting, scanning, dispatch.",
    min: "Custom SLA",
    features: ["Dedicated account manager", "Bulk processing", "Digital scanning"],
    color: "from-gray-500 to-gray-600",
  },
];

export default function CorporateB2BPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0A1628] to-[#0D1F3C] rounded-2xl p-8 lg:p-12 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Kauvex Corporate — Built for Businesses That Move the World
          </h1>
          <p className="text-white/60 text-lg mb-6">
            From haulage to cold chain, ocean freight to medical logistics — one platform for all your B2B shipping needs.
          </p>
          <div className="flex items-center gap-4">
            <button className="bg-[#FF6B00] hover:bg-[#e55f00] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2">
              Request Quote <ArrowRight className="w-4 h-4" />
            </button>
            <button className="border border-white/20 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
              <Phone className="w-4 h-4" /> Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Countries Served", value: "230+", icon: Globe },
          { label: "Active Corporate Accounts", value: "840+", icon: CheckCircle2 },
          { label: "Avg SLA Compliance", value: "97.2%", icon: CheckCircle2 },
          { label: "Monthly Shipments", value: "45K+", icon: Truck },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <s.icon className="w-5 h-5 text-[#FF6B00] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#0A1628]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Services Grid */}
      <div>
        <h2 className="text-2xl font-bold text-[#0A1628] mb-6">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <div key={service.title} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
              <div className={`h-2 bg-gradient-to-r ${service.color}`} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0A1628]">{service.title}</h3>
                    <p className="text-xs text-[#FF6B00] font-medium">{service.min}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{service.desc}</p>
                <ul className="space-y-1.5 mb-4">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-[#0A1628] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 group-hover:border-[#FF6B00] group-hover:text-[#FF6B00]">
                  Request Quote <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#FF6B00] to-[#e55f00] rounded-2xl p-8 lg:p-12 text-white text-center">
        <h2 className="text-2xl lg:text-3xl font-bold mb-4">Ready to Scale Your Logistics?</h2>
        <p className="text-white/80 max-w-xl mx-auto mb-6">
          Get a dedicated account manager, custom SLAs, and volume discounts for your business.
        </p>
        <button className="bg-white text-[#FF6B00] px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
          Get Started Today
        </button>
      </div>
    </div>
  );
}
