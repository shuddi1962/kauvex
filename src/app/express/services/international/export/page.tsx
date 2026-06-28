"use client";

import Link from "next/link";
import {
  Globe,
  ArrowRight,
  Check,
  Plane,
  Ship,
  Clock,
  FileText,
  Shield,
  MapPin,
} from "lucide-react";

const DESTINATIONS = [
  { country: "United Kingdom", flag: "🇬🇧", time: "3–5 days", carriers: "DHL, FedEx, UPS" },
  { country: "United States", flag: "🇺🇸", time: "4–7 days", carriers: "FedEx, UPS, DHL" },
  { country: "Canada", flag: "🇨🇦", time: "5–8 days", carriers: "UPS, FedEx" },
  { country: "UAE & Middle East", flag: "🇦🇪", time: "3–5 days", carriers: "Aramex, DHL" },
  { country: "Europe (40+ countries)", flag: "🇩🇪", time: "4–7 days", carriers: "DHL, UPS" },
  { country: "China", flag: "🇨🇳", time: "6–10 days", carriers: "UPS, DHL" },
  { country: "Ghana", flag: "🇬🇭", time: "2–3 days", carriers: "DHL, Aramex" },
  { country: "South Africa", flag: "🇿🇦", time: "4–6 days", carriers: "DHL, FedEx" },
];

const DOCUMENTS = [
  "Commercial Invoice",
  "Packing List",
  "Certificate of Origin",
  "Export Declaration (NESS)",
  "SON/NAFDAC Compliance",
  "Insurance Certificate",
];

export default function ExportPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Globe className="w-8 h-8 text-blue-200" />
          <h1 className="text-2xl font-bold">Export from Nigeria</h1>
        </div>
        <p className="text-white/70 max-w-xl">
          Send packages from Nigeria to destinations around the world. 
          Ship worldwide to 230+ locations with ease.
        </p>
        <Link
          href="/express/book"
          className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg text-sm mt-5 hover:bg-white/90 transition-colors"
        >
          Start Exporting <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Countries", value: "230+" },
          { label: "Carriers", value: "18+" },
          { label: "Avg Transit", value: "4.2 days" },
          { label: "Customs Rate", value: "99%" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Destinations */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Popular Export Destinations</h2>
        <div className="space-y-2">
          {DESTINATIONS.map((d) => (
            <div key={d.country} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl">{d.flag}</span>
                <span className="text-sm font-medium text-[#0A1628]">{d.country}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 hidden md:inline">{d.carriers}</span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {d.time}
                </div>
                <Link
                  href="/express/book"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Quote →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Required Documents */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Required Export Documents</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DOCUMENTS.map((doc) => (
            <div key={doc} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-sm text-gray-700">{doc}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Kauvex generates most customs documents automatically during the booking process.
        </p>
      </section>
    </div>
  );
}
