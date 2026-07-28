"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, SlidersHorizontal, ChevronRight, Loader2, AlertCircle,
  Package, Building2, Cpu, Truck, Anchor, Wind, Tractor,
  HardDrive, MapPin, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const typeIcons: Record<string, typeof Package> = {
  "Construction Equipment": Building2,
  "Marine Equipment": Anchor,
  "Industrial Machinery": Cpu,
  "Agricultural Machinery": Tractor,
  "ICT Equipment": HardDrive,
  "Transportation Equipment": Truck,
  "Power & Energy Equipment": Wind,
  "Security Equipment": Package,
  default: Package,
};

const conditionColors: Record<string, string> = {
  excellent: "bg-green-100 text-green-700 border-green-200",
  good: "bg-blue-100 text-blue-700 border-blue-200",
  fair: "bg-amber-100 text-amber-700 border-amber-200",
  poor: "bg-red-100 text-red-700 border-red-200",
};

const assetTypes = [
  "All Types",
  "Construction Equipment",
  "Marine Equipment",
  "Industrial Machinery",
  "Agricultural Machinery",
  "Security Equipment",
  "ICT Equipment",
  "Power & Energy Equipment",
  "Transportation Equipment",
];

interface UsedEquipment {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  year: number;
  condition: string;
  askingPrice: number;
  location: string;
  listedAt: string;
  assetId: string;
}

export default function UsedEquipmentPage() {
  const [items, setItems] = useState<UsedEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [conditions, setConditions] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/v1/kpn/used-equipment")
      .then((r) => { if (!r.ok) throw new Error("Failed to load listings"); return r.json(); })
      .then((d) => setItems(Array.isArray(d) ? d : d.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleCondition = (c: string) => {
    setConditions((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const filtered = items.filter((i) => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.manufacturer.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "All Types" && i.type !== typeFilter) return false;
    if (conditions.length > 0 && !conditions.includes(i.condition)) return false;
    if (priceMin && i.askingPrice < Number(priceMin)) return false;
    if (priceMax && i.askingPrice > Number(priceMax)) return false;
    return true;
  });

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#FF6B00]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/marketplace" className="hover:text-[#FF6B00]">Marketplace</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Used Equipment</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1628]">Used Equipment Marketplace</h1>
            <p className="text-gray-500 mt-1">Buy and sell pre-owned industrial equipment</p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search equipment..."
              className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={16} className="mr-2" /> Filters
          </Button>
        </div>

        <div className="flex gap-6">
          {showFilters && (
            <div className="w-64 shrink-0 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Asset Type</h3>
                <div className="space-y-1">
                  {assetTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        typeFilter === t ? "bg-[#FFF4EC] text-[#FF6B00] font-medium" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Condition</h3>
                <div className="space-y-2">
                  {["excellent", "good", "fair", "poor"].map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={conditions.includes(c)}
                        onChange={() => toggleCondition(c)}
                        className="w-4 h-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                      <span className="text-sm text-gray-600 capitalize">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="Min"
                    className="w-full h-9 px-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="Max"
                    className="w-full h-9 px-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex-1">
            {error ? (
              <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
                <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Package size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#0A1628] mb-2">No Equipment Found</h3>
                <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((item) => {
                  const Icon = typeIcons[item.type] || Package;
                  const condClass = conditionColors[item.condition] || conditionColors.good;
                  const age = item.year ? new Date().getFullYear() - item.year : null;
                  return (
                    <Link key={item.id} href={`/marketplace/used-equipment/${item.id}`}>
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#FF6B00]/30 transition-all group">
                        <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Package size={48} className="text-gray-300" />
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">
                              {item.name}
                            </h3>
                            <div className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${condClass}`}>
                              {item.condition}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mb-3">{item.manufacturer} {item.model}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                            {age && (
                              <span className="flex items-center gap-1">
                                <Calendar size={12} /> {age} yrs old
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <MapPin size={12} /> {item.location || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-[#FF6B00]">${item.askingPrice.toLocaleString()}</span>
                            <Button size="sm" variant="outline">View Details</Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
