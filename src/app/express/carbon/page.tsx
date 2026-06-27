"use client";

import { useState } from "react";
import {
  Leaf,
  TreePine,
  TrendingDown,
  Globe,
  Truck,
  Plane,
  Ship,
  Download,
  Settings,
  CheckCircle2,
  ArrowRight,
  Info,
  BarChart3,
  MapPin,
} from "lucide-react";

const ROUTE_CARBON = [
  { route: "Lagos → London", co2: 2.1, carrier: "DHL Express", icon: Plane },
  { route: "Lagos → New York", co2: 2.4, carrier: "FedEx Intl", icon: Plane },
  { route: "Lagos → Abuja", co2: 0.3, carrier: "Kauvex Express", icon: Truck },
  { route: "Lagos → Accra", co2: 0.8, carrier: "Kauvex Logistics", icon: Truck },
  { route: "Dubai → Lagos", co2: 1.9, carrier: "Aramex", icon: Plane },
  { route: "London → Lagos", co2: 2.0, carrier: "DHL", icon: Ship },
];

const MONTHLY_DATA = [
  { month: "Jan", co2: 32.1, shipments: 145 },
  { month: "Feb", co2: 28.4, shipments: 132 },
  { month: "Mar", co2: 35.2, shipments: 158 },
  { month: "Apr", co2: 41.0, shipments: 178 },
  { month: "May", co2: 38.5, shipments: 165 },
  { month: "Jun", co2: 28.4, shipments: 142 },
];

export default function CarbonFootprintPage() {
  const [autoOffset, setAutoOffset] = useState(false);

  const totalCo2 = MONTHLY_DATA.reduce((s, m) => s + m.co2, 0);
  const totalShipments = MONTHLY_DATA.reduce((s, m) => s + m.shipments, 0);
  const avgPerShipment = totalShipments > 0 ? (totalCo2 / totalShipments).toFixed(2) : "0";
  const treesPlanted = Math.floor(totalCo2 / 2);
  const offsetPercent = 68;

  const maxCo2 = Math.max(...ROUTE_CARBON.map(r => r.co2), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628] flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-600" />
            Carbon Footprint Tracker
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track and offset your shipping emissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 border border-gray-200 text-[#0A1628] px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Monthly Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">This Month</p>
          <p className="text-2xl font-bold text-[#0A1628]">{MONTHLY_DATA[5].co2} kg</p>
          <p className="text-[11px] text-gray-500 mt-1">CO₂ emissions</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">This Year</p>
          <p className="text-2xl font-bold text-[#0A1628]">{totalCo2.toFixed(1)} kg</p>
          <p className="text-[11px] text-gray-500 mt-1">Total CO₂</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <TreePine className="w-5 h-5 text-green-700" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Trees Planted</p>
          <p className="text-2xl font-bold text-green-700">{treesPlanted}</p>
          <p className="text-[11px] text-gray-500 mt-1">Via offset partners</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#FF6B00]" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Offset Status</p>
          <p className="text-2xl font-bold text-[#0A1628]">{offsetPercent}%</p>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${offsetPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Emissions by Route */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-[#0A1628] mb-1">Emissions by Route</h3>
          <p className="text-xs text-gray-500 mb-5">CO₂ per shipment by destination</p>
          <div className="space-y-4">
            {ROUTE_CARBON.map((route) => (
              <div key={route.route}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <route.icon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-medium text-[#0A1628]">{route.route}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{route.co2} kg CO₂</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(route.co2 / maxCo2) * 100}%`,
                      backgroundColor: route.co2 > 2 ? "#EF4444" : route.co2 > 1 ? "#F59E0B" : "#10B981",
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{route.carrier}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-[#0A1628] mb-1">Monthly Emissions Trend</h3>
          <p className="text-xs text-gray-500 mb-5">CO₂ output over time</p>
          <div className="flex items-end gap-3 h-48 px-2">
            {MONTHLY_DATA.map((m) => {
              const maxVal = Math.max(...MONTHLY_DATA.map(x => x.co2), 1);
              const heightPct = (m.co2 / maxVal) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-gray-600">{m.co2}</span>
                  <div
                    className="w-full rounded-t-md transition-all duration-300"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: m.month === "Jun" ? "#FF6B00" : "#0A1628",
                      opacity: m.month === "Jun" ? 1 : 0.7,
                    }}
                  />
                  <span className="text-[10px] text-gray-400">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison + Offset */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Industry Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Industry Comparison</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Your CO₂ per kg shipped</span>
                <span className="text-xs font-bold text-green-600">0.8 kg</span>
              </div>
              <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "53%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Industry average</span>
                <span className="text-xs font-bold text-gray-500">1.2 kg</span>
              </div>
              <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gray-400 rounded-full" style={{ width: "80%" }} />
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-sm text-green-800">
                You ship <strong>33% more efficiently</strong> than the industry average
              </p>
            </div>
          </div>
        </div>

        {/* Carbon Offset */}
        <div className="bg-gradient-to-br from-[#0A1628] to-[#0D1F3C] rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <TreePine className="w-5 h-5 text-green-400" />
            <h3 className="text-sm font-semibold">Carbon Offset Program</h3>
          </div>
          <p className="text-white/60 text-sm mb-6">
            Add a small fee per shipment to plant trees and offset your carbon footprint.
          </p>
          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/80">Offset fee per shipment</span>
              <span className="font-bold text-lg">₦50</span>
            </div>
            <p className="text-xs text-white/50">
              Plant a tree with our partner NGO for every shipment
            </p>
          </div>
          <button
            onClick={() => setAutoOffset(!autoOffset)}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
              autoOffset ? "bg-green-500 text-white" : "bg-[#FF6B00] text-white hover:bg-[#e55f00]"
            }`}
          >
            {autoOffset ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Auto-Offset Active
              </>
            ) : (
              <>
                <Leaf className="w-4 h-4" /> Enable Automatic Offsetting
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
