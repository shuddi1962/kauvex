"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Star,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  X,
  Briefcase,
  Clock,
} from "lucide-react";

const categories = [
  "CCTV Installer", "Solar Installer", "Solar Engineer", "Network Engineer",
  "Electrician", "Plumber", "Carpenter", "AC Technician", "Architect",
  "Structural Engineer", "Quantity Surveyor", "Building Contractor",
  "Civil Engineer", "Marine Engineer", "Naval Architect", "Boat Builder",
  "Dredging Engineer", "Hydrographic Surveyor", "Agricultural Engineer",
  "Mechanical Engineer", "Industrial Electrician", "Biomedical Engineer",
  "Automotive Engineer", "Fiber Optic Technician", "Security Consultant",
  "Interior Designer", "Painter", "Welder/Fabricator", "Furniture Assembler",
  "Smart Home Specialist", "Energy Auditor", "Commissioning Engineer",
];

const tiers = [
  { value: "basic", label: "Basic", color: "bg-gray-500" },
  { value: "certified", label: "Certified", color: "bg-blue-600" },
  { value: "gold", label: "Gold", color: "bg-amber-500" },
  { value: "platinum", label: "Platinum", color: "bg-violet-600" },
];

const tierColors: Record<string, string> = {
  basic: "bg-gray-500",
  certified: "bg-blue-600",
  gold: "bg-amber-500",
  platinum: "bg-violet-600",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

interface Professional {
  id: string;
  name: string;
  category: string;
  tier: string;
  rating: number;
  jobsCompleted: number;
  location: string;
  hourlyRate: number;
  photoUrl?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
  const [tierFilters, setTierFilters] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const toggleTier = (tier: string) => {
    setTierFilters((prev) => prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]);
  };

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (categoryFilter) params.set("category", categoryFilter);
      if (tierFilters.length) params.set("tiers", tierFilters.join(","));
      if (minRating > 0) params.set("minRating", String(minRating));
      if (location) params.set("location", location);
      params.set("page", String(page));
      params.set("limit", "12");

      const res = await fetch(`/api/v1/kpn/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.professionals || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, categoryFilter, tierFilters, minRating, location, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const clearFilters = () => {
    setCategoryFilter("");
    setTierFilters([]);
    setMinRating(0);
    setLocation("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold text-white mb-4">Find a Professional</h1>
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchResults()}
              placeholder="Search by name, category, or skill..."
              className="w-full h-12 pl-12 pr-4 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50 shadow-sm" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-navy bg-white border border-gray-200 rounded-lg px-4 py-2 hover:border-gray-300 transition-colors mb-4 lg:hidden">
          <SlidersHorizontal className="w-4 h-4" /> Filters {showFilters ? <ChevronDown className="w-4 h-4 rotate-180" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <div className="flex gap-8">
          <aside className={`w-64 flex-shrink-0 space-y-6 ${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-navy text-sm">Filters</h3>
                <button onClick={clearFilters} className="text-xs text-orange hover:underline">Clear all</button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Category</label>
                <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                  className="w-full h-9 rounded-lg border border-gray-200 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50 bg-white">
                  <option value="">All Categories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Verification Tier</label>
                <div className="space-y-2">
                  {tiers.map((tier) => (
                    <label key={tier.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={tierFilters.includes(tier.value)}
                        onChange={() => toggleTier(tier.value)}
                        className="w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange/50" />
                      <span className={`w-2.5 h-2.5 rounded-full ${tier.color}`} />
                      <span className="text-sm text-gray-700">{tier.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Min. Rating</label>
                <input type="range" min="0" max="5" step="0.5" value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full accent-orange" />
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  {minRating > 0 ? <><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {minRating}+</> : "Any rating"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or region"
                  className="w-full h-9 rounded-lg border border-gray-200 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50" />
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{loading ? "Searching..." : `${results.length} professional${results.length !== 1 ? "s" : ""} found`}</p>
              {(categoryFilter || tierFilters.length || minRating > 0 || location) && (
                <div className="flex items-center gap-2">
                  {(categoryFilter || tierFilters.length > 0 || minRating > 0 || location) && (
                    <button onClick={clearFilters} className="text-xs text-orange hover:underline flex items-center gap-1">
                      <X className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200" />
                      <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-3/4 mb-1" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
                    <div className="h-9 bg-gray-100 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-navy mb-1">No professionals found</h3>
                <p className="text-sm text-gray-500 mb-4">Try adjusting your search filters or broadening your criteria.</p>
                <button onClick={clearFilters} className="text-orange font-semibold text-sm hover:underline">Clear all filters</button>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((pro) => (
                    <div key={pro.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center text-orange font-bold text-lg flex-shrink-0">
                          {pro.photoUrl ? (
                            <img src={pro.photoUrl} alt={pro.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            pro.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-navy truncate">{pro.name}</h3>
                            <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${tierColors[pro.tier] || "bg-gray-500"} flex-shrink-0`}>
                              {pro.tier.charAt(0).toUpperCase() + pro.tier.slice(1)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{pro.category}</p>
                        </div>
                      </div>

                      <StarRating rating={pro.rating} />

                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-2 mb-3">
                        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {pro.jobsCompleted} jobs</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {pro.location}</span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="font-bold text-navy">${pro.hourlyRate}<span className="text-xs text-gray-400 font-normal">/hr</span></span>
                        <Link href={`/pro/${pro.id}`}
                          className="inline-flex items-center gap-1 bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors">
                          View Profile
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} onClick={() => setPage(i + 1)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          page === i + 1 ? "bg-orange text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                        }`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}