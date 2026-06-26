"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, FileText, Calculator, CheckCircle, XCircle, AlertTriangle, Info, Download } from "lucide-react";

const EU_COUNTRIES = [
  { code: "AT", name: "Austria" }, { code: "BE", name: "Belgium" }, { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" }, { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" }, { code: "EE", name: "Estonia" }, { code: "FI", name: "Finland" },
  { code: "FR", name: "France" }, { code: "DE", name: "Germany" }, { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" }, { code: "IE", name: "Ireland" }, { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" }, { code: "LT", name: "Lithuania" }, { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" }, { code: "NL", name: "Netherlands" }, { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" }, { code: "RO", name: "Romania" }, { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" }, { code: "ES", name: "Spain" }, { code: "SE", name: "Sweden" },
];

export default function IOSSPage() {
  const [value, setValue] = useState(150);
  const [originCountry, setOriginCountry] = useState("NG");
  const [destCountry, setDestCountry] = useState("DE");

  const iossThreshold = 150;
  const requiresIOSS = value <= iossThreshold;
  const euDest = EU_COUNTRIES.some((c) => c.code === destCountry);
  const iossApplicable = requiresIOSS && euDest;

  const estimatedVAT = euDest ? value * 0.19 : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/logistics" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-600" /> IOSS Automation
          </h1>
          <p className="text-sm text-gray-500">Import One-Stop Shop — EU VAT collection at point of sale</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-800">What is IOSS?</p>
          <p className="text-sm text-blue-700 mt-1">
            The Import One-Stop Shop (IOSS) is an EU scheme that simplifies VAT collection on imported goods valued at &le; &euro;150.
            With IOSS, VAT is collected at checkout and remitted to the EU by Kauvex — no customs charges for the buyer.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" /> IOSS Calculator
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Declared Value (EUR)</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin Country</label>
              <select value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="NG">Nigeria</option><option value="GB">United Kingdom</option>
                <option value="US">United States</option><option value="AE">UAE</option>
                <option value="IN">India</option><option value="AU">Australia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country</label>
              <select value={destCountry} onChange={(e) => setDestCountry(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <optgroup label="EU Countries">
                  {EU_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </optgroup>
                <optgroup label="Non-EU">
                  <option value="NG">Nigeria</option><option value="GB">United Kingdom</option>
                  <option value="US">United States</option><option value="AE">UAE</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Value &le; &euro;150?</span>
              <span className={`flex items-center gap-1 text-sm font-medium ${requiresIOSS ? "text-emerald-600" : "text-amber-600"}`}>
                {requiresIOSS ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {requiresIOSS ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">EU destination?</span>
              <span className={`flex items-center gap-1 text-sm font-medium ${euDest ? "text-emerald-600" : "text-amber-600"}`}>
                {euDest ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {euDest ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="text-sm font-medium text-gray-900">IOSS Applicable?</span>
              <span className={`text-sm font-bold ${iossApplicable ? "text-emerald-600" : "text-gray-500"}`}>
                {iossApplicable ? "YES" : "NO"}
              </span>
            </div>
            {iossApplicable && (
              <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-800 font-medium">Estimated VAT at Checkout: &euro;{estimatedVAT.toFixed(2)}</p>
                <p className="text-xs text-emerald-600 mt-1">Collected from buyer, remitted to EU by Kauvex IOSS number</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">IOSS Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kauvex IOSS Number</label>
              <input type="text" defaultValue="EU382000000001" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default VAT Rate (EU)</label>
              <input type="number" defaultValue={19} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Auto-collect VAT at checkout</p>
                <p className="text-xs text-gray-500">For EU-bound orders under &euro;150</p>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                <span className="absolute top-0.5 left-6 w-5 h-5 bg-white rounded-full shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">IOSS on customs declaration</p>
                <p className="text-xs text-gray-500">Include IOSS number on CN22/CN23</p>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                <span className="absolute top-0.5 left-6 w-5 h-5 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
