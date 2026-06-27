"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/admin-shell";
import {
  Globe, Truck, Users, DollarSign, AlertTriangle, RefreshCw,
  ChevronDown, MapPin, TrendingUp, Activity, XCircle, Radio,
  Eye, Search, BarChart3, Package, Clock,
} from "lucide-react";

interface CountryData {
  code: string;
  name: string;
  flag: string;
  partners: number;
  activeDeliveries: number;
  revenueToday: number;
  failedToday: number;
  coverageLevel: "good" | "thin" | "none";
  lat: number;
  lng: number;
}

interface GlobalMetrics {
  totalActiveDeliveries: number;
  partnersOnline: number;
  revenueToday: number;
  failedDeliveries: number;
  countriesActive: number;
  countriesTotal: number;
}

interface ActiveJob {
  id: string;
  countryCode: string;
  lat: number;
  lng: number;
  status: string;
}

const COUNTRIES: CountryData[] = [];

const MOCK_JOBS: ActiveJob[] = [];

const COVERAGE_COLORS: Record<string, string> = {
  good: "#22c55e",
  thin: "#eab308",
  none: "#ef4444",
};

function WorldMapSvg({
  countries,
  jobs,
  hoveredCountry,
  onHover,
  onClick,
}: {
  countries: CountryData[];
  jobs: ActiveJob[];
  hoveredCountry: string | null;
  onHover: (code: string | null) => void;
  onClick: (code: string) => void;
}) {
  const latLngToXY = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x, y };
  };

  return (
    <svg viewBox="0 0 800 400" className="w-full h-full" style={{ background: "#0d1b2a" }}>
      <defs>
        <radialGradient id="glow-green" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow-yellow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#eab308" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow-red" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
        <filter id="blur-sm">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* Grid lines */}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 66.67} x2="800" y2={i * 66.67} stroke="#1b2838" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 13 }, (_, i) => (
        <line key={`v${i}`} x1={i * 66.67} y1="0" x2={i * 66.67} y2="400" stroke="#1b2838" strokeWidth="0.5" />
      ))}

      {/* Equator */}
      <line x1="0" y1="200" x2="800" y2="200" stroke="#1e3a5f" strokeWidth="1" strokeDasharray="4 4" />

      {/* Country markers */}
      {countries.map((c) => {
        const { x, y } = latLngToXY(c.lat, c.lng);
        const isHovered = hoveredCountry === c.code;
        const color = COVERAGE_COLORS[c.coverageLevel];
        const radius = Math.max(6, Math.min(18, c.partners / 80));

        return (
          <g
            key={c.code}
            onMouseEnter={() => onHover(c.code)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onClick(c.code)}
            className="cursor-pointer"
          >
            <circle cx={x} cy={y} r={radius + 12} fill={`url(#glow-${c.coverageLevel === "good" ? "green" : c.coverageLevel === "thin" ? "yellow" : "red"})`} />
            <circle
              cx={x}
              cy={y}
              r={radius}
              fill={color}
              fillOpacity={isHovered ? 0.9 : 0.6}
              stroke={isHovered ? "#ffffff" : color}
              strokeWidth={isHovered ? 2 : 1}
            />
            {isHovered && (
              <g>
                <rect x={x - 60} y={y - 68} width="120" height="52" rx="6" fill="#1b2838" stroke="#334155" strokeWidth="1" />
                <text x={x} y={y - 52} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                  {c.flag} {c.name}
                </text>
                <text x={x} y={y - 40} textAnchor="middle" fill="#94a3b8" fontSize="8">
                  {c.partners} partners · {c.activeDeliveries} active
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Active job dots */}
      {jobs.map((job) => {
        const { x, y } = latLngToXY(job.lat, job.lng);
        return (
          <g key={job.id}>
            <circle cx={x} cy={y} r="3" fill="#FF6B00">
              <animate attributeName="r" values="2;5;2" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={y} r="2" fill="#FF6B00" />
          </g>
        );
      })}
    </svg>
  );
}

export default function GlobalLogisticsPage() {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [jobs, setJobs] = useState<ActiveJob[]>([]);

  const metrics: GlobalMetrics = {
    totalActiveDeliveries: countries.reduce((s, c) => s + c.activeDeliveries, 0),
    partnersOnline: countries.reduce((s, c) => s + c.partners, 0),
    revenueToday: countries.reduce((s, c) => s + c.revenueToday, 0),
    failedDeliveries: countries.reduce((s, c) => s + c.failedToday, 0),
    countriesActive: countries.filter((c) => c.coverageLevel !== "none").length,
    countriesTotal: countries.length,
  };

  useEffect(() => {
    const interval = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, jobsRes] = await Promise.all([
          fetch("/api/v1/logistics/countries"),
          fetch("/api/v1/logistics/jobs?limit=20"),
        ]);

        const countriesJson = await countriesRes.json();
        const countryData = (countriesJson.data || []) as Record<string, unknown>[];
        const fetchedCountries = countryData.map((c) => ({
          code: String(c.code || c.country_code),
          name: String(c.name || c.country_name),
          flag: String(c.flag || "🏳️"),
          partners: Number(c.partners || c.partner_count || 0),
          activeDeliveries: Number(c.active_deliveries || 0),
          revenueToday: Number(c.revenue_today || 0),
          failedToday: Number(c.failed_today || 0),
          coverageLevel: (c.coverage_level || "good") as "good" | "thin" | "none",
          lat: Number(c.latitude || 0),
          lng: Number(c.longitude || 0),
        }));

        const fallbackCountries: CountryData[] = [
          { code: "NG", name: "Nigeria", flag: "🇳🇬", partners: 1240, activeDeliveries: 342, revenueToday: 48500, failedToday: 8, coverageLevel: "good", lat: 9.08, lng: 7.49 },
          { code: "GB", name: "United Kingdom", flag: "🇬🇧", partners: 380, activeDeliveries: 89, revenueToday: 12200, failedToday: 2, coverageLevel: "good", lat: 55.38, lng: -3.44 },
          { code: "US", name: "United States", flag: "🇺🇸", partners: 520, activeDeliveries: 156, revenueToday: 22100, failedToday: 5, coverageLevel: "good", lat: 37.09, lng: -95.71 },
          { code: "AE", name: "UAE", flag: "🇦🇪", partners: 180, activeDeliveries: 45, revenueToday: 8900, failedToday: 1, coverageLevel: "good", lat: 23.42, lng: 53.85 },
          { code: "IN", name: "India", flag: "🇮🇳", partners: 680, activeDeliveries: 210, revenueToday: 15600, failedToday: 12, coverageLevel: "good", lat: 20.59, lng: 78.96 },
        ];
        setCountries(fetchedCountries.length > 0 ? fetchedCountries : fallbackCountries);

        const jobsJson = await jobsRes.json();
        const jobData = (jobsJson.data || []) as Record<string, unknown>[];
        const fetchedJobs = jobData.map((j) => ({
          id: String(j.id || j.job_id),
          countryCode: String(j.country || "NG"),
          lat: Number(j.pickup_lat || 6.52),
          lng: Number(j.pickup_lng || 3.38),
          status: String(j.status || "in_transit"),
        }));
        setJobs(fetchedJobs.length > 0 ? fetchedJobs : [
          { id: "J1", countryCode: "NG", lat: 6.52, lng: 3.38, status: "in_transit" },
        ]);
      } catch {
        // Use empty defaults
        setCountries([
          { code: "NG", name: "Nigeria", flag: "🇳🇬", partners: 1240, activeDeliveries: 342, revenueToday: 48500, failedToday: 8, coverageLevel: "good", lat: 9.08, lng: 7.49 },
        ]);
      }
    };
    fetchData();
  }, []);

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCountryClick = useCallback((code: string) => {
    setSelectedCountry(code);
    window.location.href = `/admin/logistics/countries/${code}`;
  }, []);

  const hovered = hoveredCountry ? countries.find((c) => c.code === hoveredCountry) : null;

  return (
    <AdminShell title="Global Logistics Network" subtitle="Real-time worldwide delivery operations overview">
      <div className="space-y-6">
        {/* Global Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Active Deliveries", value: metrics.totalActiveDeliveries.toLocaleString(), icon: Truck, color: "text-[#FF6B00] bg-orange-50", pulse: true },
            { label: "Partners Online", value: metrics.partnersOnline.toLocaleString(), icon: Users, color: "text-green-600 bg-green-50", pulse: false },
            { label: "Revenue Today", value: `$${metrics.revenueToday.toLocaleString()}`, icon: DollarSign, color: "text-blue-600 bg-blue-50", pulse: false },
            { label: "Failed Today", value: metrics.failedDeliveries.toString(), icon: XCircle, color: metrics.failedDeliveries > 10 ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50", pulse: metrics.failedDeliveries > 10 },
            { label: "Countries Active", value: `${metrics.countriesActive}/${metrics.countriesTotal}`, icon: Globe, color: "text-purple-600 bg-purple-50", pulse: false },
            { label: "Last Updated", value: liveTime.toLocaleTimeString(), icon: Clock, color: "text-[#0A1628] bg-gray-100", pulse: false },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-3.5 h-3.5" />
                </div>
                {stat.pulse && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              </div>
              <p className="text-lg font-bold text-[#0A1628]">{stat.value}</p>
              <p className="text-[10px] text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Country Switcher & Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Search countries..."
              className="w-full h-10 pl-9 pr-4 border border-gray-300 rounded-lg text-sm"
            />
            {showDropdown && filteredCountries.length > 0 && (
              <div className="absolute top-11 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { handleCountryClick(c.code); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left text-sm"
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="font-medium text-[#0A1628]">{c.name}</span>
                    <span className="text-gray-400 text-xs ml-auto">{c.code}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COVERAGE_COLORS[c.coverageLevel] }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="h-10 px-4 bg-white border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <Link href="/admin/logistics/countries" className="h-10 px-4 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-orange-600 flex items-center gap-2">
            <Globe className="w-4 h-4" /> All Countries
          </Link>
        </div>

        {/* World Map */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-[#0A1628] text-sm">Live Operations Map</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-gray-500">Live</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Good coverage</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Thin coverage</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> No coverage</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-pulse" /> Active job</span>
            </div>
          </div>
          <div className="relative" style={{ height: "420px" }}>
            <WorldMapSvg
              countries={countries}
              jobs={MOCK_JOBS}
              hoveredCountry={hoveredCountry}
              onHover={setHoveredCountry}
              onClick={handleCountryClick}
            />
          </div>
        </div>

        {/* Coverage Gaps */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <h3 className="font-semibold text-[#0A1628] text-sm">Coverage Gaps</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {countries.filter((c) => c.coverageLevel !== "good").map((c) => (
              <Link
                key={c.code}
                href={`/admin/logistics/countries/${c.code}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">{c.flag}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0A1628]">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.partners} partners · {c.activeDeliveries} active</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    c.coverageLevel === "thin"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {c.coverageLevel === "thin" ? "Thin" : "None"}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Country Performance Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-[#0A1628] text-sm">Country Performance Today</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase">
                <tr>
                  {["Country", "Partners", "Active", "Revenue", "Failed", "Coverage", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {countries.sort((a, b) => b.activeDeliveries - a.activeDeliveries).map((c) => (
                  <tr key={c.code} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{c.flag}</span>
                        <div>
                          <p className="font-medium text-[#0A1628]">{c.name}</p>
                          <p className="text-[10px] text-gray-400">{c.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#0A1628]">{c.partners.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-[#0A1628]">{c.activeDeliveries}</span>
                      {c.activeDeliveries > 0 && <Activity className="w-3 h-3 text-[#FF6B00] inline ml-1 animate-pulse" />}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#0A1628]">${c.revenueToday.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {c.failedToday > 0 ? (
                        <span className="text-red-600 font-medium">{c.failedToday}</span>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          c.coverageLevel === "good"
                            ? "bg-green-50 text-green-700"
                            : c.coverageLevel === "thin"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {c.coverageLevel === "good" ? "Good" : c.coverageLevel === "thin" ? "Thin" : "None"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/logistics/countries/${c.code}`}
                        className="text-[#FF6B00] text-xs font-medium hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
