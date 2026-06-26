"use client";

import { useState, useEffect } from "react";
import { Truck, CheckCircle, XCircle, ExternalLink, RefreshCw, Settings, Globe, AlertTriangle, Zap } from "lucide-react";
import { CARRIER_INTEGRATIONS, CarrierIntegration, getCountryCarrierSummary } from "@/lib/logistics/carrier-integrations";

const FLAG_MAP: Record<string, string> = {
  NG: "\u{1F1F3}\u{1F1EC}", GB: "\u{1F1EC}\u{1F1E7}", US: "\u{1F1FA}\u{1F1F8}", AE: "\u{1F1E6}\u{1F1EA}",
  IN: "\u{1F1EE}\u{1F1F3}", AU: "\u{1F1E6}\u{1F1FA}", DE: "\u{1F1E9}\u{1F1EA}", CA: "\u{1F1E8}\u{1F1E6}",
  GH: "\u{1F1EC}\u{1F1ED}", KE: "\u{1F1F0}\u{1F1EA}", ZA: "\u{1F1FF}\u{1F1E6}", SA: "\u{1F1F8}\u{1F1E6}",
  BR: "\u{1F1E7}\u{1F1F7}", JP: "\u{1F1EF}\u{1F1F5}", FR: "\u{1F1EB}\u{1F1F7}",
};

const TIER_COLORS: Record<string, string> = {
  TIER_1_LOCAL: "bg-blue-50 text-blue-700",
  TIER_2_DOMESTIC_FREIGHT: "bg-purple-50 text-purple-700",
  TIER_3_INTERNATIONAL: "bg-emerald-50 text-emerald-700",
};

export default function CarrierIntegrationsPage() {
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterTier, setFilterTier] = useState("");

  const countries = [...new Set(CARRIER_INTEGRATIONS.map((c) => c.country))].sort();
  const tiers = [...new Set(CARRIER_INTEGRATIONS.map((c) => c.tier))];

  const filtered = CARRIER_INTEGRATIONS.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCountry && c.country !== filterCountry) return false;
    if (filterTier && c.tier !== filterTier) return false;
    return true;
  });

  const countrySummary = getCountryCarrierSummary();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Truck className="w-6 h-6 text-blue-600" /> Carrier API Integrations
        </h1>
        <p className="text-sm text-gray-500 mt-1">{CARRIER_INTEGRATIONS.length} carriers across {countries.length} countries</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {countries.map((cc) => (
          <div key={cc} className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{FLAG_MAP[cc]}</span>
              <span className="font-medium text-sm text-gray-900">{cc}</span>
            </div>
            <p className="text-xs text-gray-500">{countrySummary[cc]?.length || 0} carriers</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search carriers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 min-w-[200px]"
          />
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Countries</option>
            {countries.map((cc) => (
              <option key={cc} value={cc}>{FLAG_MAP[cc]} {cc}</option>
            ))}
          </select>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Tiers</option>
            {tiers.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">Carrier</th>
                <th className="px-4 py-3 font-medium text-gray-600">Country</th>
                <th className="px-4 py-3 font-medium text-gray-600">Tier</th>
                <th className="px-4 py-3 font-medium text-gray-600">Auth Type</th>
                <th className="px-4 py-3 font-medium text-gray-600">Features</th>
                <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((carrier) => (
                <tr key={carrier.code} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{carrier.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{carrier.code}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span>{FLAG_MAP[carrier.country]}</span>
                      <span className="font-medium">{carrier.country}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_COLORS[carrier.tier] || "bg-gray-100 text-gray-600"}`}>
                      {carrier.tier.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">{carrier.authType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {carrier.features.map((f) => (
                        <span key={f} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{f}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> Configured
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a href={carrier.docsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1 justify-end">
                      Docs <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
