"use client";

import { useState } from "react";
import { Gauge, TrendingUp, TrendingDown, MapPin, DollarSign, Clock, AlertTriangle, RefreshCw, Filter } from "lucide-react";

const FUEL_STATIONS = [
  { id: 1, name: "Mobil Lekki", lat: 6.44, lng: 3.46, diesel: 680, petrol: 617, distance: "0.8 km", updated: "2 hrs ago", change: +12 },
  { id: 2, name: "Total Victoria Island", lat: 6.43, lng: 3.40, diesel: 685, petrol: 620, distance: "2.1 km", updated: "1 hr ago", change: +8 },
  { id: 3, name: "NNPC Ikeja", lat: 6.60, lng: 3.35, diesel: 665, petrol: 610, distance: "12 km", updated: "30 min ago", change: -5 },
  { id: 4, name: "Oando Lekki Phase 1", lat: 6.45, lng: 3.47, diesel: 678, petrol: 615, distance: "1.2 km", updated: "45 min ago", change: +10 },
  { id: 5, name: "Aiteo Surulere", lat: 6.53, lng: 3.36, diesel: 670, petrol: 612, distance: "8 km", updated: "3 hrs ago", change: +3 },
  { id: 6, name: "Eterna Festac", lat: 6.47, lng: 3.28, diesel: 672, petrol: 613, distance: "15 km", updated: "4 hrs ago", change: +5 },
];

const PRICE_HISTORY = [
  { month: "Jan", diesel: 645, petrol: 580 },
  { month: "Feb", diesel: 650, petrol: 585 },
  { month: "Mar", diesel: 660, petrol: 595 },
  { month: "Apr", diesel: 655, petrol: 590 },
  { month: "May", diesel: 670, petrol: 605 },
  { month: "Jun", diesel: 680, petrol: 617 },
];

const IMPACT_ROUTES = [
  { from: "Lagos", to: "Abuja", distance: "790 km", fuelCost: "$38.50", surcharge: "$4.20", total: "$42.70" },
  { from: "Lagos", to: "Port Harcourt", distance: "620 km", fuelCost: "$30.20", surcharge: "$3.30", total: "$33.50" },
  { from: "Lagos", to: "Accra", distance: "410 km", fuelCost: "$19.90", surcharge: "$2.20", total: "$22.10" },
  { from: "Abuja", to: "Kano", distance: "360 km", fuelCost: "$17.50", surcharge: "$1.90", total: "$19.40" },
];

const TIPS = [
  { title: "Consolidate Shipments", desc: "Combine smaller packages into full loads to reduce per-unit fuel cost by up to 22%.", savings: "22% avg savings" },
  { title: "Choose Off-Peak", desc: "Ship during off-peak hours (6AM-8AM) to avoid traffic-related fuel waste.", savings: "15% fuel saved" },
  { title: "Optimize Routes", desc: "Use our route optimizer to find the most fuel-efficient paths.", savings: "18% avg savings" },
];

export default function FuelTrackerPage() {
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const maxDiesel = Math.max(...PRICE_HISTORY.map((p) => p.diesel));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Fuel Price Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor fuel prices and their impact on your shipping costs.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg text-xs font-medium text-gray-600"><RefreshCw className="w-3.5 h-3.5" />Refresh</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">            <Gauge className="w-4 h-4 text-[#FF6B00]" /></div></div>
          <p className="text-xl font-bold text-[#0A1628]">₦680/L</p>
          <p className="text-xs text-gray-500">Avg. Diesel Price</p>
          <span className="text-[11px] text-red-600 font-medium flex items-center gap-0.5 mt-1"><TrendingUp className="w-3 h-3" />+₦12 this week</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-blue-600" /></div></div>
          <p className="text-xl font-bold text-[#0A1628]">₦617/L</p>
          <p className="text-xs text-gray-500">Avg. Petrol Price</p>
          <span className="text-[11px] text-green-600 font-medium flex items-center gap-0.5 mt-1"><TrendingDown className="w-3 h-3" />-₦3 this week</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"><MapPin className="w-4 h-4 text-green-600" /></div></div>
          <p className="text-xl font-bold text-[#0A1628]">6</p>
          <p className="text-xs text-gray-500">Stations Tracked</p>
          <span className="text-[11px] text-gray-500 mt-1 block">Lagos Metro</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-purple-600" /></div></div>
          <p className="text-xl font-bold text-[#0A1628]">+$4.20</p>
          <p className="text-xs text-gray-500">Avg. Fuel Surcharge</p>
          <span className="text-[11px] text-gray-500 mt-1 block">Per shipment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#0A1628]">Nearby Fuel Stations</h3>
            <button className="text-xs text-[#FF6B00] hover:underline font-medium">View all</button>
          </div>
          <div className="relative h-80 bg-[#0A1628]">
            <svg viewBox="0 0 600 300" className="w-full h-full">
              {/* Station markers */}
              {FUEL_STATIONS.map((s, i) => {
                const positions = [[150, 100], [200, 180], [350, 80], [180, 140], [400, 200], [300, 160]];
                const [cx, cy] = positions[i];
                return (
                  <g key={s.id} className="cursor-pointer" onClick={() => setSelectedStation(s.id)}>
                    <circle cx={cx} cy={cy} r="18" fill={selectedStation === s.id ? "#FF6B00" : "#3B82F6"} opacity="0.2">
                      {selectedStation === s.id && <animate attributeName="r" values="18;24;18" dur="1.5s" repeatCount="indefinite" />}
                    </circle>
                    <circle cx={cx} cy={cy} r="8" fill={selectedStation === s.id ? "#FF6B00" : "#3B82F6"} stroke="white" strokeWidth="2" />
                    <text x={cx} y={cy + 25} textAnchor="middle" fill="white" fontSize="8" opacity="0.7">{s.name.split(" ")[0]}</text>
                    <text x={cx} y={cy + 35} textAnchor="middle" fill="#FF6B00" fontSize="9" fontWeight="bold">₦{s.diesel}</text>
                  </g>
                );
              })}
              {/* Route lines */}
              <line x1="150" y1="100" x2="350" y2="80" stroke="#FF6B00" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
              <line x1="200" y1="180" x2="400" y2="200" stroke="#FF6B00" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
            </svg>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FUEL_STATIONS.map((s) => (
                <button key={s.id} onClick={() => setSelectedStation(s.id)} className={`p-3 rounded-lg border text-left transition-all ${selectedStation === s.id ? "border-[#FF6B00] bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <p className="text-xs font-medium text-[#0A1628]">{s.name}</p>
                  <p className="text-lg font-bold text-[#FF6B00]">₦{s.diesel}<span className="text-xs font-normal text-gray-500">/L</span></p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-gray-500">{s.distance}</span>
                    <span className={`text-[11px] font-medium ${s.change > 0 ? "text-red-600" : "text-green-600"}`}>{s.change > 0 ? "+" : ""}{s.change}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Price Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Price Trend (6 months)</h3>
            <div className="flex items-end gap-2 h-32">
              {PRICE_HISTORY.map((p) => (
                <div key={p.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 items-end">
                    <div className="flex-1 bg-[#FF6B00] rounded-t" style={{ height: `${(p.diesel / maxDiesel) * 100}%` }} />
                    <div className="flex-1 bg-blue-400 rounded-t" style={{ height: `${(p.petrol / maxDiesel) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400">{p.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />Diesel</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" />Petrol</span>
            </div>
          </div>

          {/* Route Impact */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Fuel Cost by Route</h3>
            <div className="space-y-2">
              {IMPACT_ROUTES.map((r, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[#0A1628]">{r.from} → {r.to}</span>
                    <span className="text-xs text-gray-500">{r.distance}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-gray-500">Fuel: <span className="font-semibold text-[#0A1628]">{r.fuelCost}</span></span>
                    <span className="text-gray-500">Surcharge: <span className="font-semibold text-[#FF6B00]">{r.surcharge}</span></span>
                    <span className="text-gray-500 ml-auto">Total: <span className="font-bold text-[#0A1628]">{r.total}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Fuel-Saving Tips</h3>
            <div className="space-y-3">
              {TIPS.map((t, i) => (
                <div key={i} className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-green-800">{t.title}</span>
                    <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">{t.savings}</span>
                  </div>
                  <p className="text-[11px] text-green-700">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
