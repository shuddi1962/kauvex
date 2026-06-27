"use client";

import { CheckCircle2, XCircle, Zap, Shield, Globe, Leaf, BarChart3, MapPin, Package, Users, TrendingUp, Fuel } from "lucide-react";

const FEATURES = [
  { label: "Multi-carrier rate comparison", kauvex: true, easyship: true, shippo: true, gig: false, dhl: false },
  { label: "Own delivery partner network", kauvex: true, easyship: false, shippo: false, gig: true, dhl: true },
  { label: "FBK warehouse fulfillment", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
  { label: "Marketplace integration", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
  { label: "Smart locker system", kauvex: true, easyship: false, shippo: false, gig: false, dhl: true },
  { label: "Refrigerated lockers", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
  { label: "BNPL for shipping costs", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
  { label: "Delivery confidence score", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
  { label: "Smart rate calendar", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
  { label: "Fuel price transparency", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
  { label: "Cargo photo chain", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
  { label: "Carbon footprint per shipment", kauvex: true, easyship: true, shippo: false, gig: false, dhl: true },
  { label: "Affiliate/influencer network", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
  { label: "Live streaming commerce", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
  { label: "Team approval workflows", kauvex: true, easyship: true, shippo: false, gig: false, dhl: false },
  { label: "Shipment health score", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
  { label: "Virtual address / shop & ship", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
  { label: "Partner tier system + bonuses", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
  { label: "Automated WMS integration", kauvex: true, easyship: true, shippo: false, gig: false, dhl: false },
  { label: "Real-time command center map", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
  { label: "Geofencing customer alerts", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
  { label: "COD management", kauvex: true, easyship: false, shippo: false, gig: true, dhl: false },
  { label: "What3Words address support", kauvex: true, easyship: false, shippo: false, gig: false, dhl: false },
];

export default function WhyKauvexPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#0A1628] mb-4">
          Why Kauvex Beats Every Competitor
        </h1>
        <p className="text-gray-500 text-lg">
          The only platform that combines multi-carrier shipping, own delivery network, marketplace commerce, and AI-powered logistics into one unified system.
        </p>
      </div>

      {/* Feature Count */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { name: "Kauvex", count: FEATURES.filter(f => f.kauvex).length, color: "bg-[#FF6B00] text-white" },
          { name: "EasyShip", count: FEATURES.filter(f => f.easyship).length, color: "bg-gray-100 text-gray-700" },
          { name: "Shippo", count: FEATURES.filter(f => f.shippo).length, color: "bg-gray-100 text-gray-700" },
          { name: "GIG Logistics", count: FEATURES.filter(f => f.gig).length, color: "bg-gray-100 text-gray-700" },
          { name: "DHL", count: FEATURES.filter(f => f.dhl).length, color: "bg-gray-100 text-gray-700" },
        ].map((c) => (
          <div key={c.name} className={`rounded-xl p-4 text-center ${c.color}`}>
            <p className="text-3xl font-bold">{c.count}</p>
            <p className="text-xs mt-1 opacity-80">{c.name}</p>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Feature</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-[#FF6B00] uppercase tracking-wider">KAUVEX</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">EasyShip</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Shippo</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">GIG</th>
                <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">DHL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {FEATURES.map((f, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 text-xs font-medium text-[#0A1628]">{f.label}</td>
                  <td className="text-center px-4 py-3">
                    {f.kauvex ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                  <td className="text-center px-4 py-3">
                    {f.easyship ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                  <td className="text-center px-4 py-3">
                    {f.shippo ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                  <td className="text-center px-4 py-3">
                    {f.gig ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                  <td className="text-center px-4 py-3">
                    {f.dhl ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unique Features Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Package, title: "FBK + Marketplace", desc: "Fulfillment by Kauvex integrated with a full marketplace — your competitors only do shipping." },
          { icon: MapPin, title: "Smart Lockers", desc: "Automated pickup points with refrigerated options — no competitor offers this at scale." },
          { icon: TrendingUp, title: "AI-Powered Analytics", desc: "Delivery confidence scores, rate calendars, and carbon tracking built into every shipment." },
        ].map((f) => (
          <div key={f.title} className="bg-gradient-to-br from-[#0A1628] to-[#0D1F3C] rounded-xl p-6 text-white">
            <f.icon className="w-8 h-8 text-[#FF6B00] mb-3" />
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-white/60 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
