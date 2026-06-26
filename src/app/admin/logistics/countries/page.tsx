"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, Search, Plus, ChevronRight, Truck, CreditCard, Package, MapPin } from "lucide-react";

interface Country {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  vatRate: number;
  phoneCode: string;
  defaultLanguage: string;
  w3wEnabled: boolean;
  codEnabled: boolean;
  ddpRequired: boolean;
  _count: { carriers: number; rateCards: number; packagingFees: number };
}

const FLAG_MAP: Record<string, string> = {
  NG: "\u{1F1F3}\u{1F1EC}", GB: "\u{1F1EC}\u{1F1E7}", US: "\u{1F1FA}\u{1F1F8}", AE: "\u{1F1E6}\u{1F1EA}",
  IN: "\u{1F1EE}\u{1F1F3}", AU: "\u{1F1E6}\u{1F1FA}", DE: "\u{1F1E9}\u{1F1EA}", CA: "\u{1F1E8}\u{1F1E6}",
  GH: "\u{1F1EC}\u{1F1ED}", KE: "\u{1F1F0}\u{1F1EA}", ZA: "\u{1F1FF}\u{1F1E6}", SA: "\u{1F1F8}\u{1F1E6}",
  BR: "\u{1F1E7}\u{1F1F7}", JP: "\u{1F1EF}\u{1F1F5}", FR: "\u{1F1EB}\u{1F1F7}",
};

export default function CountryListPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/logistics/countries")
      .then((r) => r.json())
      .then((d) => { setCountries(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = countries.filter((c) =>
    c.countryName.toLowerCase().includes(search.toLowerCase()) ||
    c.countryCode.toLowerCase().includes(search.toLowerCase()) ||
    c.currencyCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-600" /> Country Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configure logistics settings per country</p>
        </div>
        <Link href="/admin/logistics/global" className="text-sm text-blue-600 hover:underline">&larr; Back to Global Overview</Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading countries...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Country</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Code</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Currency</th>
                  <th className="px-4 py-3 font-medium text-gray-600">VAT %</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Carriers</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Rate Cards</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Packaging</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Flags</th>
                  <th className="px-4 py-3 font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c) => (
                  <tr key={c.countryCode} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{FLAG_MAP[c.countryCode] || "\u{1F30D}"}</span>
                        <span className="font-medium text-gray-900">{c.countryName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{c.countryCode}</td>
                    <td className="px-4 py-3 text-gray-600">{c.currencyCode}</td>
                    <td className="px-4 py-3 text-gray-600">{c.vatRate}%</td>
                    <td className="px-4 py-3"><Truck className="w-4 h-4 text-gray-400 inline mr-1" />{c._count.carriers}</td>
                    <td className="px-4 py-3"><CreditCard className="w-4 h-4 text-gray-400 inline mr-1" />{c._count.rateCards}</td>
                    <td className="px-4 py-3"><Package className="w-4 h-4 text-gray-400 inline mr-1" />{c._count.packagingFees}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {c.codEnabled && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs">COD</span>}
                        {c.ddpRequired && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs">DDP</span>}
                        {c.w3wEnabled && <MapPin className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/logistics/countries/${c.countryCode}`} className="text-blue-600 hover:underline text-sm flex items-center gap-1 justify-end">
                        Configure <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
