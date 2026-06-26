"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, Plus, Settings, Truck, MapPin, RefreshCw, ChevronRight, Package, CreditCard, CheckCircle, AlertTriangle } from "lucide-react";

interface Country {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  vatRate: number;
  importDutyGeneral: number;
  deMinimisValue: number;
  postalCodeFormat: string | null;
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

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "\u20A6", USD: "$", GBP: "\u00A3", EUR: "\u20AC", AED: "AED", INR: "\u20B9",
  AUD: "A$", CAD: "C$", GHS: "GH\u20B5", KES: "KSh", ZAR: "R", SAR: "SAR", BRL: "R$", JPY: "\u00A5",
};

export default function GlobalLogisticsPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/logistics/countries")
      .then((r) => r.json())
      .then((d) => { setCountries(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalCarriers = countries.reduce((s, c) => s + c._count.carriers, 0);
  const totalRateCards = countries.reduce((s, c) => s + c._count.rateCards, 0);
  const totalPackaging = countries.reduce((s, c) => s + c._count.packagingFees, 0);
  const codCountries = countries.filter((c) => c.codEnabled).length;
  const w3wCountries = countries.filter((c) => c.w3wEnabled).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Globe className="w-7 h-7 text-blue-600" /> Global Logistics Network
        </h1>
        <p className="text-gray-500 mt-1">Manage countries, carriers, rate cards, packaging fees, and COD settings worldwide.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Countries", value: countries.length, icon: Globe, color: "text-blue-600 bg-blue-50" },
          { label: "Carriers", value: totalCarriers, icon: Truck, color: "text-green-600 bg-green-50" },
          { label: "Rate Cards", value: totalRateCards, icon: CreditCard, color: "text-purple-600 bg-purple-50" },
          { label: "Packaging Fees", value: totalPackaging, icon: Package, color: "text-orange-600 bg-orange-50" },
          { label: "COD Enabled", value: codCountries, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Country Configurations</h2>
          <div className="flex gap-2">
            <Link href="/admin/logistics/countries" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              <Settings className="w-4 h-4" /> Manage Countries
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" /> Refresh Rates
            </button>
          </div>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {countries.map((country) => (
              <Link
                key={country.countryCode}
                href={`/admin/logistics/countries/${country.countryCode}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{FLAG_MAP[country.countryCode] || "\u{1F30D}"}</span>
                  <div>
                    <p className="font-medium text-gray-900">{country.countryName}</p>
                    <p className="text-sm text-gray-500">
                      {country.countryCode} &middot; {country.currencyCode} ({CURRENCY_SYMBOLS[country.currencyCode] || country.currencyCode}) &middot; {country.phoneCode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> {country._count.carriers}</span>
                  <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> {country._count.rateCards}</span>
                  <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" /> {country._count.packagingFees}</span>
                  {country.codEnabled && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">COD</span>}
                  {country.ddpRequired && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">DDP</span>}
                  {country.w3wEnabled && <MapPin className="w-4 h-4 text-blue-400" />}
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
