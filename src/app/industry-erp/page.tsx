"use client";

import Link from "next/link";
import {
  Ship, HardHat, Sun, ShieldCheck, Waves, ArrowRight, Box, LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const INDUSTRIES = [
  {
    icon: Ship, label: "Marine ERP",
    desc: "Vessel registry, crew management, voyage tracking, maintenance scheduling, charter management, port dues, and flag state compliance.",
    href: "/industry-erp/marine",
    gradient: "from-blue-900 to-blue-700",
    accent: "text-blue-100",
    features: ["Vessel Registry", "Crew Mgmt", "Voyage Tracking", "Charter Hire"],
  },
  {
    icon: HardHat, label: "Construction ERP",
    desc: "Multi-site management, equipment tracking, subcontractor oversight, daily progress reports, materials delivery, and labour attendance.",
    href: "/industry-erp/construction",
    gradient: "from-amber-800 to-amber-600",
    accent: "text-amber-100",
    features: ["Site Mgmt", "Equipment", "Subcontractors", "Labour Tracking"],
  },
  {
    icon: Sun, label: "Solar ERP",
    desc: "Project pipeline, system design library, commissioning records, warranty tracking, maintenance contracts, and customer performance reports.",
    href: "/industry-erp/solar",
    gradient: "from-yellow-700 to-orange-500",
    accent: "text-yellow-100",
    features: ["Project Pipeline", "System Design", "Commissioning", "Warranty Mgmt"],
  },
  {
    icon: ShieldCheck, label: "Security ERP",
    desc: "Site surveillance contracts, monitoring schedules, incident reporting, equipment inventory, guard deployment, and CCTV health monitoring.",
    href: "/industry-erp/security",
    gradient: "from-gray-800 to-gray-600",
    accent: "text-gray-100",
    features: ["Surveillance", "Monitoring", "Incident Reports", "CCTV Health"],
  },
  {
    icon: Waves, label: "Dredging ERP",
    desc: "Dredging project management, equipment fleet tracking, volume calculations, environmental compliance, and crew scheduling.",
    href: "/configure/dredging",
    gradient: "from-cyan-800 to-cyan-600",
    accent: "text-cyan-100",
    features: ["Projects", "Fleet", "Volume Calc", "Compliance"],
  },
];

export default function IndustryErpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-kauvex-navy transition-colors">Home</Link>
          <span>/</span>
          <span className="text-kauvex-navy font-medium">Industry ERP Lite</span>
        </div>
      </div>

      <section className="bg-kauvex-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
              <LayoutDashboard className="w-4 h-4 text-kauvex-orange" />
              <span>Industry-Specific ERP Modules</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Industry ERP <span className="text-kauvex-orange">Lite</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl">
              Purpose-built ERP modules for marine, construction, solar, security, and dredging
              industries. Manage operations, track assets, and stay compliant — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              {INDUSTRIES.map((ind) => (
                <Link key={ind.label} href={ind.href}>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white gap-2">
                    <ind.icon className="w-4 h-4" />
                    {ind.label.replace(" ERP", "")}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INDUSTRIES.map((ind) => (
            <Link key={ind.label} href={ind.href} className="group block">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <div className={`bg-gradient-to-br ${ind.gradient} p-6 flex items-center gap-4`}>
                  <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ind.icon className={`w-6 h-6 ${ind.accent}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{ind.label}</h3>
                    <p className={`text-sm ${ind.accent} opacity-80`}>{ind.features.length} modules</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-600 text-sm mb-4">{ind.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ind.features.map((f) => (
                      <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-kauvex-orange text-sm font-medium">
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}