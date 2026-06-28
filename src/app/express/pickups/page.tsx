"use client";

import { useState } from "react";
import { MapPin, Clock, Package, Truck, Calendar } from "lucide-react";

const DEMO_PICKUPS = [
  {
    id: 1,
    date: "Tomorrow",
    time: "Morning (8am–12pm)",
    address: "4 Aba Road, Port Harcourt",
    packages: 2,
    courier: "DHL Express",
    status: "scheduled",
  },
  {
    id: 2,
    date: "Dec 22",
    time: "Afternoon (12pm–5pm)",
    address: "15 Broad St, Lagos Island",
    packages: 5,
    courier: "FedEx",
    status: "pending",
  },
];

export default function PickupsPage() {
  const [address, setAddress] = useState("4 Aba Road, Port Harcourt");
  const [packages, setPackages] = useState(3);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">Pickups</h1>
        <p className="text-gray-500 mt-1">
          Schedule courier pickups from your location
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[#FF6B00]" />
            <h2 className="text-lg font-semibold text-[#0A1628]">Schedule a Pickup</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Window
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none">
                  <option>Morning (8am–12pm)</option>
                  <option>Afternoon (12pm–5pm)</option>
                  <option>Evening (5pm–8pm)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. of Packages
                </label>
                <input
                  type="number"
                  value={packages}
                  onChange={(e) => setPackages(parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Courier
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none">
                  <option>Best available</option>
                  <option>Kauvex Express</option>
                  <option>DHL</option>
                  <option>FedEx</option>
                  <option>Aramex</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Notes
              </label>
              <textarea
                placeholder="Gate code, special instructions..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none resize-none"
              />
            </div>
            <button className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors w-full">
              Schedule Pickup
            </button>
          </div>
        </div>

        {/* Upcoming Pickups */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#FF6B00]" />
            <h2 className="text-lg font-semibold text-[#0A1628]">Upcoming Pickups</h2>
          </div>
          <div className="space-y-3">
            {DEMO_PICKUPS.map((pickup) => (
              <div key={pickup.id} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-[#0A1628]">
                      {pickup.date} · {pickup.time}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      pickup.status === "scheduled"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {pickup.status === "scheduled" ? "Scheduled" : "Pending confirm"}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {pickup.address} · {pickup.packages} packages · {pickup.courier}
                </p>
              </div>
            ))}
            {DEMO_PICKUPS.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming pickups</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
