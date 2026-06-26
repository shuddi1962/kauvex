"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Globe, Truck, CreditCard, Package, MapPin, Plus, Trash2, Settings, CheckCircle, XCircle } from "lucide-react";

interface CountryDetail {
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
  carriers: any[];
  rateCards: any[];
  packagingFees: any[];
}

const FLAG_MAP: Record<string, string> = {
  NG: "\u{1F1F3}\u{1F1EC}", GB: "\u{1F1EC}\u{1F1E7}", US: "\u{1F1FA}\u{1F1F8}", AE: "\u{1F1E6}\u{1F1EA}",
  IN: "\u{1F1EE}\u{1F1F3}", AU: "\u{1F1E6}\u{1F1FA}", DE: "\u{1F1E9}\u{1F1EA}", CA: "\u{1F1E8}\u{1F1E6}",
  GH: "\u{1F1EC}\u{1F1ED}", KE: "\u{1F1F0}\u{1F1EA}", ZA: "\u{1F1FF}\u{1F1E6}", SA: "\u{1F1F8}\u{1F1E6}",
  BR: "\u{1F1E7}\u{1F1F7}", JP: "\u{1F1EF}\u{1F1F5}", FR: "\u{1F1EB}\u{1F1F7}",
};

const TIER_LABELS: Record<string, string> = {
  TIER_1_LOCAL: "Tier 1 Local",
  TIER_2_DOMESTIC_FREIGHT: "Tier 2 Domestic Freight",
  TIER_3_INTERNATIONAL: "Tier 3 International",
};

export default function CountryDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [country, setCountry] = useState<CountryDetail | null>(null);
  const [tab, setTab] = useState<"overview" | "carriers" | "rates" | "packaging">("overview");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/logistics/countries`)
      .then((r) => r.json())
      .then((d) => {
        const found = (d.data || []).find((c: any) => c.countryCode === code);
        if (found) setCountry(found);
      });
  }, [code]);

  const updateCountry = async (field: string, value: any) => {
    if (!country) return;
    setSaving(true);
    try {
      await fetch("/api/v1/logistics/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: country.countryCode, [field]: value }),
      });
      setCountry({ ...country, [field]: value });
    } finally {
      setSaving(false);
    }
  };

  if (!country) {
    return <div className="p-12 text-center text-gray-400">Loading country data...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/logistics/countries" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-3xl">{FLAG_MAP[code] || "\u{1F30D}"}</span>
              {country.countryName} <span className="text-gray-400 text-lg">({code})</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">{country.phoneCode} &middot; {country.currencyCode} &middot; {country.defaultLanguage.toUpperCase()}</p>
          </div>
        </div>
        {saving && <span className="text-sm text-blue-600 flex items-center gap-2"><Save className="w-4 h-4 animate-spin" /> Saving...</span>}
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(["overview", "carriers", "rates", "packaging"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "overview" && <Settings className="w-4 h-4 inline mr-1.5" />}
            {t === "carriers" && <Truck className="w-4 h-4 inline mr-1.5" />}
            {t === "rates" && <CreditCard className="w-4 h-4 inline mr-1.5" />}
            {t === "packaging" && <Package className="w-4 h-4 inline mr-1.5" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Tax & Customs</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VAT Rate (%)</label>
                <input
                  type="number"
                  value={country.vatRate}
                  onChange={(e) => updateCountry("vatRate", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Import Duty (%)</label>
                <input
                  type="number"
                  value={country.importDutyGeneral}
                  onChange={(e) => updateCountry("importDutyGeneral", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">De Minimis Value ({country.currencyCode})</label>
                <input
                  type="number"
                  value={country.deMinimisValue}
                  onChange={(e) => updateCountry("deMinimisValue", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code Format</label>
                <input
                  type="text"
                  value={country.postalCodeFormat || ""}
                  onChange={(e) => updateCountry("postalCodeFormat", e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g. XXXXXX"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Feature Flags</h3>
            <div className="space-y-4">
              {[
                { field: "codEnabled", label: "Cash on Delivery (COD)", desc: "Allow drivers to collect payment on delivery" },
                { field: "w3wEnabled", label: "What3Words Addresses", desc: "Enable precise 3-word address lookups" },
                { field: "ddpRequired", label: "Delivered Duty Paid Required", desc: "All international shipments must use DDP (no DDU)" },
              ].map((flag) => (
                <div key={flag.field} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{flag.label}</p>
                    <p className="text-xs text-gray-500">{flag.desc}</p>
                  </div>
                  <button
                    onClick={() => updateCountry(flag.field, !country[flag.field as keyof CountryDetail])}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      country[flag.field as keyof CountryDetail] ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      country[flag.field as keyof CountryDetail] ? "left-6.5 translate-x-0" : "left-0.5"
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "carriers" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Registered Carriers ({country.carriers?.length || 0})</h3>
          </div>
          {!country.carriers?.length ? (
            <div className="text-center py-8 text-gray-400">No carriers registered for this country yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {country.carriers.map((carrier: any, i: number) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">{carrier.carrierName}</span>
                  </div>
                  <p className="text-sm text-gray-500">{carrier.carrierSlug}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(carrier.supportedTiers || []).map((tier: string) => (
                      <span key={tier} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{TIER_LABELS[tier] || tier}</span>
                    ))}
                  </div>
                  {carrier.supportsInternational && <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs">International</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "rates" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Rate Cards ({country.rateCards?.length || 0})</h3>
          {!country.rateCards?.length ? (
            <div className="text-center py-8 text-gray-400">No rate cards configured for this country.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-gray-600">Tier</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Carrier</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Base Rate</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Per Kg</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Per Km</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Min Fee</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Free Thresh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {country.rateCards.map((rc: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{TIER_LABELS[rc.tier] || rc.tier}</span></td>
                      <td className="px-4 py-3 text-gray-900">{rc.carrierName || "Platform Default"}</td>
                      <td className="px-4 py-3 font-mono text-gray-900">{rc.currency} {rc.baseRate}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{rc.perKg}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{rc.perKm}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{rc.minFee}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{rc.freeShippingThreshold || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "packaging" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Packaging Fees ({country.packagingFees?.length || 0})</h3>
          {!country.packagingFees?.length ? (
            <div className="text-center py-8 text-gray-400">No packaging fees configured for this country.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {country.packagingFees.map((pf: any, i: number) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{pf.packagingType.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</span>
                    <span className="text-lg font-bold text-gray-900">{pf.currency} {pf.fee}</span>
                  </div>
                  {pf.sizeCode && <p className="text-sm text-gray-500">Size: {pf.sizeCode.toUpperCase()}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
