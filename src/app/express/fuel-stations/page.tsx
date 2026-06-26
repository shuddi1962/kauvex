"use client";

import { useState, useEffect } from "react";
import {
  Fuel,
  MapPin,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Clock,
  TrendingUp,
  TrendingDown,
  Navigation,
} from "lucide-react";
import Link from "next/link";

interface FuelStation {
  id: string;
  name: string;
  city: string;
  country_code: string;
  latitude: number;
  longitude: number;
  fuel_type: string;
  price: number;
  currency_code: string;
  last_updated: string;
}

const CITIES = ["All Cities", "Lagos", "Abuja", "Port Harcourt"];
const FUEL_TYPES = ["All Types", "petrol", "diesel"];

export default function FuelStationsPage() {
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All Cities");
  const [fuelFilter, setFuelFilter] = useState("All Types");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cityFilter !== "All Cities") params.set("city", cityFilter);
      if (fuelFilter !== "All Types") params.set("fuel_type", fuelFilter);

      const res = await fetch(`/api/v1/express/fuel-stations?${params.toString()}`);
      const json = await res.json();
      setStations(json.data || []);
      setLastRefresh(new Date());
    } catch {
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityFilter, fuelFilter]);

  const filtered = stations.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  const avgPrice = filtered.length
    ? filtered.reduce((sum, s) => sum + Number(s.price), 0) / filtered.length
    : 0;

  const petrolStations = filtered.filter((s) => s.fuel_type === "petrol");
  const dieselStations = filtered.filter((s) => s.fuel_type === "diesel");
  const cheapestPetrol = petrolStations.length
    ? petrolStations.reduce((min, s) => (Number(s.price) < Number(min.price) ? s : min), petrolStations[0])
    : null;
  const cheapestDiesel = dieselStations.length
    ? dieselStations.reduce((min, s) => (Number(s.price) < Number(min.price) ? s : min), dieselStations[0])
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]">Fuel Stations</h1>
            <p className="text-sm text-gray-500 mt-1">
              Nearby fuel stations with live pricing for Express fleet partners
            </p>
          </div>
          <button
            onClick={fetchStations}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Fuel className="w-3.5 h-3.5" />
              Total Stations
            </div>
            <div className="text-2xl font-bold text-[#0A1628]">{filtered.length}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Avg. Petrol Price
            </div>
            <div className="text-2xl font-bold text-[#0A1628]">
              {petrolStations.length ? `₦${avgPrice.toFixed(0)}` : "—"}
            </div>
            <div className="text-xs text-gray-400">per litre</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-green-600 text-xs mb-1">
              <TrendingDown className="w-3.5 h-3.5" />
              Cheapest Petrol
            </div>
            <div className="text-2xl font-bold text-green-600">
              {cheapestPetrol ? `₦${Number(cheapestPetrol.price).toFixed(0)}` : "—"}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {cheapestPetrol?.name || "N/A"}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-blue-600 text-xs mb-1">
              <TrendingDown className="w-3.5 h-3.5" />
              Cheapest Diesel
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {cheapestDiesel ? `₦${Number(cheapestDiesel.price).toFixed(0)}` : "—"}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {cheapestDiesel?.name || "N/A"}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by station name or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="h-10 rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] appearance-none cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={fuelFilter}
                onChange={(e) => setFuelFilter(e.target.value)}
                className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] appearance-none cursor-pointer"
              >
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f === "All Types" ? f : f.charAt(0).toUpperCase() + f.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Station List */}
        {loading && stations.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-300 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading fuel stations...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Fuel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No fuel stations found</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((station) => (
              <div
                key={station.id}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        station.fuel_type === "diesel" ? "bg-blue-100" : "bg-orange-100"
                      }`}
                    >
                      <Fuel
                        className={`w-4 h-4 ${
                          station.fuel_type === "diesel" ? "text-blue-600" : "text-[#FF6B00]"
                        }`}
                      />
                    </div>
                    <div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          station.fuel_type === "diesel"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-orange-50 text-[#FF6B00]"
                        }`}
                      >
                        {station.fuel_type.charAt(0).toUpperCase() + station.fuel_type.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-[#0A1628]">
                      ₦{Number(station.price).toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-400">/litre</div>
                  </div>
                </div>

                <h3 className="font-semibold text-sm text-[#0A1628] mb-2 line-clamp-1">
                  {station.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3 h-3" />
                  {station.city}, {station.country_code}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    Updated {new Date(station.last_updated).toLocaleDateString()}
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${station.latitude},${station.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#FF6B00] hover:underline"
                  >
                    <Navigation className="w-3 h-3" />
                    Directions
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Last refresh note */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Last refreshed: {lastRefresh.toLocaleTimeString()}
          <span className="mx-2">·</span>
          Prices are indicative and may vary at the station
        </div>
      </div>
    </div>
  );
}
