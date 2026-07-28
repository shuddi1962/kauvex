"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight, Search, Plus, Loader2, Clock,
  DollarSign, Users, AlertCircle, Gavel,
  Building2, Anchor, Cpu, Tractor, Shield,
  HardDrive, Wind, Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categories = [
  "All Categories",
  "Construction Equipment",
  "Marine Equipment",
  "Industrial Machinery",
  "Agricultural Machinery",
  "Security Equipment",
  "ICT Equipment",
  "Power & Energy Equipment",
  "Transportation Equipment",
];

const sampleAuctions = [
  { id: "1", name: "Caterpillar 320D Excavator", category: "Construction Equipment", currentBid: 45000, reserveMet: true, timeRemaining: "2d 14h", bids: 12, status: "live", image: null },
  { id: "2", name: "Yanmar 4JH Marine Engine", category: "Marine Equipment", currentBid: 12500, reserveMet: false, timeRemaining: "5d 6h", bids: 4, status: "live", image: null },
  { id: "3", name: "Komatsu WA380 Wheel Loader", category: "Construction Equipment", currentBid: 38000, reserveMet: true, timeRemaining: "1d 3h", bids: 18, status: "live", image: null },
  { id: "4", name: "500kVA Cummins Generator", category: "Power & Energy Equipment", currentBid: 22000, reserveMet: true, timeRemaining: "3d 8h", bids: 7, status: "live", image: null },
  { id: "5", name: "John Deere 6125R Tractor", category: "Agricultural Machinery", currentBid: 55000, reserveMet: true, timeRemaining: "4d 1h", bids: 9, status: "live", image: null },
  { id: "6", name: "Toyota Land Cruiser 2022", category: "Transportation Equipment", currentBid: 38000, reserveMet: true, timeRemaining: "6d 12h", bids: 22, status: "live", image: null },
  { id: "7", name: "Manitowoc Crane 100T", category: "Construction Equipment", currentBid: 185000, reserveMet: true, timeRemaining: "10d 0h", bids: 3, status: "upcoming", image: null },
  { id: "8", name: "Himoinsa 250kVA Generator", category: "Power & Energy Equipment", currentBid: 15000, reserveMet: false, timeRemaining: "Ended", bids: 8, status: "ended", image: null },
];

export default function AuctionsPage() {
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const filtered = sampleAuctions.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "All Categories" && a.category !== category) return false;
    if (status !== "all" && a.status !== status) return false;
    if (priceMin && a.currentBid < Number(priceMin)) return false;
    if (priceMax && a.currentBid > Number(priceMax)) return false;
    return true;
  });

  const getTimeColor = (time: string) => {
    if (time === "Ended") return "text-red-500";
    const hours = parseInt(time.split("d")[0]) * 24 + parseInt(time.split("d")[1]?.split("h")[0] || "0");
    if (hours <= 48) return "text-red-500";
    if (hours <= 120) return "text-amber-500";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/marketplace" className="hover:text-[#FF6B00]">Marketplace</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Industrial Auctions</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1628]">Industrial Auctions</h1>
            <p className="text-gray-500 mt-1">Bid on industrial equipment and machinery</p>
          </div>
          <Link href="/marketplace/auctions/create">
            <Button>
              <Plus size={16} className="mr-2" /> Create Auction
            </Button>
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search auctions..."
              className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: "all", label: "All" },
            { id: "live", label: "Live" },
            { id: "upcoming", label: "Upcoming" },
            { id: "ended", label: "Ended" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatus(s.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                status === s.id
                  ? "bg-[#FF6B00] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#FF6B00]"
              }`}
            >
              {s.label}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="Min $"
              className="w-24 h-9 px-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="Max $"
              className="w-24 h-9 px-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Gavel size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0A1628] mb-2">No Auctions Found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or create a new auction.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  <Gavel size={48} className="text-gray-300" />
                  <div className="absolute top-3 right-3">
                    <Badge variant={a.status === "live" ? "sale" : a.status === "upcoming" ? "info" : "outline"}>
                      {a.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">{a.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{a.category}</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Current Bid</span>
                      <span className="font-bold text-[#FF6B00]">${a.currentBid.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Reserve</span>
                      <span className={`flex items-center gap-1 ${a.reserveMet ? "text-green-600" : "text-amber-600"}`}>
                        {a.reserveMet ? "Met" : "Not Met"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1"><Users size={14} /> Bids</span>
                      <span className="font-medium">{a.bids}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1"><Clock size={14} /> Time</span>
                      <span className={`font-medium ${getTimeColor(a.timeRemaining)}`}>{a.timeRemaining}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {a.status === "live" && (
                      <Button className="flex-1" size="sm">
                        <DollarSign size={14} className="mr-1" /> Place Bid
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className={a.status !== "live" ? "flex-1" : ""}>
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
