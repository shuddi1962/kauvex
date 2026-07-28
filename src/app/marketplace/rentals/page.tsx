"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2, Anchor, Cpu, Tractor, Shield,
  HardDrive, Wind, Truck, Search, ChevronRight,
  Plus, MapPin, Calendar, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { id: "construction", name: "Construction Equipment", icon: Building2, count: 24, color: "bg-blue-50 text-blue-600" },
  { id: "marine", name: "Marine Equipment", icon: Anchor, count: 12, color: "bg-cyan-50 text-cyan-600" },
  { id: "industrial", name: "Industrial Machinery", icon: Cpu, count: 18, color: "bg-purple-50 text-purple-600" },
  { id: "agricultural", name: "Agricultural Machinery", icon: Tractor, count: 15, color: "bg-green-50 text-green-600" },
  { id: "security", name: "Security Equipment", icon: Shield, count: 8, color: "bg-red-50 text-red-600" },
  { id: "ict", name: "ICT Equipment", icon: HardDrive, count: 21, color: "bg-indigo-50 text-indigo-600" },
  { id: "power", name: "Power & Energy Equipment", icon: Wind, count: 10, color: "bg-amber-50 text-amber-600" },
  { id: "transportation", name: "Transportation Equipment", icon: Truck, count: 16, color: "bg-orange-50 text-orange-600" },
];

const sampleListings = [
  { id: "1", name: "Komatsu PC200 Excavator", category: "Construction Equipment", price: 450, period: "day", location: "Lagos, Nigeria", image: null },
  { id: "2", name: "Caterpillar D6 Dozer", category: "Construction Equipment", price: 850, period: "day", location: "Abuja, Nigeria", image: null },
  { id: "3", name: "Yanmar 6LY Marine Engine", category: "Marine Equipment", price: 220, period: "day", location: "Port Harcourt, Nigeria", image: null },
  { id: "4", name: "John Deere Tractor 5075E", category: "Agricultural Machinery", price: 350, period: "day", location: "Kaduna, Nigeria", image: null },
  { id: "5", name: "Himoinsa 500kVA Generator", category: "Power & Energy Equipment", price: 600, period: "day", location: "Lagos, Nigeria", image: null },
  { id: "6", name: "Toyota Hilux (2023)", category: "Transportation Equipment", price: 120, period: "day", location: "Accra, Ghana", image: null },
];

export default function RentalsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const filteredListings = sampleListings.filter((l) => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory !== "all") {
      const cat = categories.find((c) => c.id === activeCategory);
      if (cat && l.category !== cat.name) return false;
    }
    if (maxPrice && l.price > Number(maxPrice)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/marketplace" className="hover:text-[#FF6B00]">Marketplace</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Equipment Rentals</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1628]">Equipment Rental Exchange</h1>
            <p className="text-gray-500 mt-1">Rent equipment by the day, week, or month</p>
          </div>
          <Link href="/marketplace/rentals/list">
            <Button>
              <Plus size={16} className="mr-2" /> List Equipment for Rent
            </Button>
          </Link>
        </div>

        <div className="flex gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search equipment..."
              className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div className="relative">
            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max price/day"
              className="w-40 h-11 pl-8 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              activeCategory === "all"
                ? "border-[#FF6B00] bg-[#FFF4EC]"
                : "border-gray-200 bg-white hover:border-[#FF6B00]/30"
            }`}
          >
            <h3 className="font-semibold text-[#0A1628]">All Categories</h3>
            <p className="text-xs text-gray-400 mt-1">{sampleListings.length} listings</p>
          </button>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  activeCategory === cat.id
                    ? "border-[#FF6B00] bg-[#FFF4EC]"
                    : "border-gray-200 bg-white hover:border-[#FF6B00]/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${cat.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-sm text-[#0A1628]">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{cat.count} listings</p>
              </button>
            );
          })}
        </div>

        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Truck size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0A1628] mb-2">No Equipment Found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((l) => (
              <div key={l.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <PackageIcon size={48} className="text-gray-300" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">{l.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{l.category}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {l.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-bold text-[#FF6B00]">${l.price}<span className="text-sm font-normal text-gray-400">/{l.period}</span></span>
                    <Button size="sm" variant="outline">Rent Now</Button>
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

function PackageIcon({ size, className }: { size: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
}
