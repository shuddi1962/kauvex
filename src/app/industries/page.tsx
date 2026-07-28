"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Anchor, Building2, Wind, Shield, Monitor, Waves, Tractor,
  Factory, HeartPulse, Car, Fuel, Pickaxe, Home, UtensilsCrossed,
  Plane, Search, TrendingUp, Users, Briefcase, ChevronRight,
} from "lucide-react";

const FALLBACK_ICONS: Record<string, React.ElementType> = {
  marine: Anchor,
  construction: Building2,
  renewable_energy: Wind,
  security: Shield,
  ict: Monitor,
  dredging: Waves,
  agriculture: Tractor,
  manufacturing: Factory,
  healthcare: HeartPulse,
  automotive: Car,
  oil_and_gas: Fuel,
  mining: Pickaxe,
  real_estate: Home,
  hospitality: UtensilsCrossed,
  aviation: Plane,
};

interface Hub {
  id: string;
  hubName: string;
  hubSlug: string;
  description: string | null;
  iconUrl: string | null;
  productCategories: string[];
  professionalCategories: string[];
  pillarsAvailable: string[];
  isActive: boolean;
}

export default function IndustriesPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/v1/kpn/hubs")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setHubs(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = hubs.filter(
    (h) =>
      h.hubName.toLowerCase().includes(search.toLowerCase()) ||
      h.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPillars = filtered.reduce((a, h) => a + (h.pillarsAvailable?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-kauvex-navy to-[#0D1F3C] text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Industry Solutions <span className="text-kauvex-orange">from Kauvex</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mb-8">
            Explore our industry-specific hubs — each built with products, professionals, projects,
            and tools tailored to your sector.
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for an industry..."
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-kauvex-orange text-sm"
            />
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-3 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-kauvex-navy">{loading ? "—" : hubs.length}</p>
            <p className="text-xs text-gray-500">Industry Hubs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-kauvex-orange">{loading ? "—" : totalPillars}</p>
            <p className="text-xs text-gray-500">Active Pillars</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-kauvex-navy">
              {loading ? "—" : hubs.reduce((a, h) => a + (h.productCategories?.length || 0), 0)}
            </p>
            <p className="text-xs text-gray-500">Categories</p>
          </div>
          <div className="text-center hidden md:block">
            <p className="text-2xl font-bold text-kauvex-orange">
              {loading ? "—" : hubs.filter((h) => (h.professionalCategories?.length || 0) > 0).length}
            </p>
            <p className="text-xs text-gray-500">With Professionals</p>
          </div>
        </div>
      </section>

      {/* Hub Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-500">No industry hubs found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((hub) => {
              const Icon = FALLBACK_ICONS[hub.hubSlug] || Building2;
              return (
                <Link
                  key={hub.id}
                  href={`/industries/${hub.hubSlug}`}
                  className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-kauvex-orange/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-kauvex-orange/10 to-kauvex-orange/5 flex items-center justify-center mb-4 group-hover:from-kauvex-orange/20 group-hover:to-kauvex-orange/10 transition-colors">
                    <Icon size={24} className="text-kauvex-orange" />
                  </div>
                  <h3 className="font-bold text-lg text-kauvex-navy mb-1 group-hover:text-kauvex-orange transition-colors">
                    {hub.hubName}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {hub.description || "Industry solutions and resources"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">
                      {(hub.pillarsAvailable?.length || 0)} pillars
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-kauvex-orange group-hover:gap-2 transition-all">
                      Explore <ChevronRight size={14} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="bg-kauvex-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-3">
            Ready to grow your industry presence on{" "}
            <span className="text-kauvex-orange">Kauvex</span>?
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8">
            Join our marketplace, connect with professionals, and access industry-specific tools.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-8 py-3 rounded-lg hover:bg-kauvex-orange/90 transition-colors"
          >
            Get Started <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
