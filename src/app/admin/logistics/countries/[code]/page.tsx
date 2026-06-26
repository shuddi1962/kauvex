"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/admin-shell";
import {
  ArrowLeft, Save, Globe, Truck, CreditCard, Package, MapPin,
  Plus, Trash2, Settings, CheckCircle, XCircle, Users, Briefcase,
  BarChart3, Shield, FileText, Wallet, TrendingUp, Activity,
  Radio, AlertTriangle, Clock, Search, Eye, Edit2, Download,
  ToggleLeft, ToggleRight, Wrench, Scale, Landmark, Receipt,
} from "lucide-react";

type Tab =
  | "overview"
  | "partners"
  | "jobs"
  | "carriers"
  | "rate-cards"
  | "coverage"
  | "compliance"
  | "payouts"
  | "reports";

interface CountryDetail {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  currencySymbol: string;
  vatRate: number;
  importDutyGeneral: number;
  deMinimisValue: number;
  postalCodeFormat: string | null;
  phoneCode: string;
  defaultLanguage: string;
  w3wEnabled: boolean;
  codEnabled: boolean;
  ddpRequired: boolean;
  isLive: boolean;
  timezone: string;
  gigWorkerClassification: string;
  legalReviewStatus: string;
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

const MOCK_PARTNERS = [
  { id: "P1", name: "Emeka Okonkwo", tier: "TIER_1_LOCAL", verified: true, rating: 4.8, jobs: 342, status: "online" },
  { id: "P2", name: "Blessing Kwame", tier: "TIER_1_LOCAL", verified: true, rating: 4.6, jobs: 218, status: "online" },
  { id: "P3", name: "DHL Nigeria", tier: "TIER_3_INTERNATIONAL", verified: true, rating: 4.9, jobs: 1205, status: "online" },
  { id: "P4", name: "GIG Logistics", tier: "TIER_2_DOMESTIC_FREIGHT", verified: true, rating: 4.5, jobs: 890, status: "online" },
  { id: "P5", name: "Adamu Garba", tier: "TIER_1_LOCAL", verified: false, rating: 4.2, jobs: 56, status: "offline" },
];

const MOCK_JOBS = [
  { id: "J1", waybill: "KVX-WB-2026-001", pickup: "Lagos, Ikeja", dropoff: "Lagos, VI", tier: "Tier 1", partner: "Emeka O.", status: "in_transit", amount: 2500 },
  { id: "J2", waybill: "KVX-WB-2026-002", pickup: "Abuja, Wuse", dropoff: "Abuja, Garki", tier: "Tier 1", partner: "Unassigned", status: "pending", amount: 1800 },
  { id: "J3", waybill: "KVX-WB-2026-003", pickup: "Lagos, Surulere", dropoff: "Port Harcourt", tier: "Tier 2", partner: "GIG Logistics", status: "in_transit", amount: 5500 },
  { id: "J4", waybill: "KVX-WB-2026-004", pickup: "Lagos", dropoff: "London, UK", tier: "Tier 3", partner: "DHL", status: "picked_up", amount: 45000 },
];

const MOCK_PAYOUTS = [
  { id: "PAY1", partner: "Emeka Okonkwo", amount: 48500, currency: "NGN", status: "completed", date: "2026-06-25" },
  { id: "PAY2", partner: "Blessing Kwame", amount: 32200, currency: "NGN", status: "pending", date: "2026-06-25" },
  { id: "PAY3", partner: "GIG Logistics", amount: 285000, currency: "NGN", status: "processing", date: "2026-06-24" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-600" },
  in_transit: { label: "In Transit", color: "bg-blue-50 text-blue-700" },
  picked_up: { label: "Picked Up", color: "bg-orange-50 text-[#FF6B00]" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800" },
  failed: { label: "Failed", color: "bg-red-50 text-red-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  processing: { label: "Processing", color: "bg-blue-50 text-blue-700" },
};

export default function CountryDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [country, setCountry] = useState<CountryDetail | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [saving, setSaving] = useState(false);
  const [searchPartner, setSearchPartner] = useState("");

  useEffect(() => {
    fetch("/api/v1/logistics/countries")
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

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "overview", label: "Overview", icon: Settings },
    { id: "partners", label: "Partners", icon: Users, count: MOCK_PARTNERS.length },
    { id: "jobs", label: "Jobs", icon: Briefcase, count: MOCK_JOBS.length },
    { id: "carriers", label: "Carriers", icon: Truck, count: country?.carriers?.length || 0 },
    { id: "rate-cards", label: "Rate Cards", icon: CreditCard, count: country?.rateCards?.length || 0 },
    { id: "coverage", label: "Coverage", icon: MapPin },
    { id: "compliance", label: "Compliance", icon: Shield },
    { id: "payouts", label: "Payouts", icon: Wallet },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];

  if (!country) {
    return <AdminShell title="Loading..." subtitle=""><div className="flex items-center justify-center py-16"><span className="text-gray-400">Loading country data...</span></div></AdminShell>;
  }

  return (
    <AdminShell
      title={`${FLAG_MAP[code] || "\u{1F30D}"} ${country.countryName}`}
      subtitle={`${country.phoneCode} · ${country.currencyCode} · ${country.defaultLanguage.toUpperCase()}${country.isLive ? " · Live" : ""}`}
    >
      <div className="space-y-6">
        {/* Tab Bar */}
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                tab === t.id
                  ? "border-[#FF6B00] text-[#FF6B00]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-1 ${
                  tab === t.id ? "bg-orange-50 text-[#FF6B00]" : "bg-gray-100 text-gray-500"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Country Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Partners", value: MOCK_PARTNERS.length.toString(), icon: Users, color: "text-blue-600 bg-blue-50" },
                { label: "Active Jobs", value: MOCK_JOBS.filter((j) => j.status !== "delivered").length.toString(), icon: Briefcase, color: "text-[#FF6B00] bg-orange-50" },
                { label: "Carriers Active", value: (country.carriers?.length || 0).toString(), icon: Truck, color: "text-green-600 bg-green-50" },
                { label: "Live Status", value: country.isLive ? "Approved" : "Pending", icon: country.isLive ? CheckCircle : Clock, color: country.isLive ? "text-green-600 bg-green-50" : "text-yellow-600 bg-yellow-50" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-bold text-[#0A1628]">{stat.value}</p>
                  <p className="text-[10px] text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tax & Customs */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[#FF6B00]" /> Tax & Customs
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">VAT Rate (%)</label>
                    <input
                      type="number"
                      value={country.vatRate}
                      onChange={(e) => updateCountry("vatRate", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Import Duty (%)</label>
                    <input
                      type="number"
                      value={country.importDutyGeneral}
                      onChange={(e) => updateCountry("importDutyGeneral", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">De Minimis Value ({country.currencyCode})</label>
                    <input
                      type="number"
                      value={country.deMinimisValue}
                      onChange={(e) => updateCountry("deMinimisValue", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Feature Flags */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#FF6B00]" /> Feature Flags
                </h3>
                <div className="space-y-3">
                  {[
                    { field: "codEnabled", label: "Cash on Delivery (COD)", desc: "Allow drivers to collect payment on delivery" },
                    { field: "w3wEnabled", label: "What3Words Addresses", desc: "Enable precise 3-word address lookups" },
                    { field: "ddpRequired", label: "DDP Required", desc: "All international shipments must use DDP" },
                  ].map((flag) => (
                    <div key={flag.field} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-[#0A1628]">{flag.label}</p>
                        <p className="text-[10px] text-gray-500">{flag.desc}</p>
                      </div>
                      <button
                        onClick={() => updateCountry(flag.field, !country[flag.field as keyof CountryDetail])}
                        className="flex-shrink-0"
                      >
                        {country[flag.field as keyof CountryDetail] ? (
                          <ToggleRight className="w-10 h-6 text-[#FF6B00]" />
                        ) : (
                          <ToggleLeft className="w-10 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Partner Count by Tier */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF6B00]" /> Partners by Tier
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { tier: "TIER_1_LOCAL", label: "Tier 1 Local", count: 2, color: "bg-green-50 border-green-200" },
                  { tier: "TIER_2_DOMESTIC_FREIGHT", label: "Tier 2 Domestic", count: 1, color: "bg-blue-50 border-blue-200" },
                  { tier: "TIER_3_INTERNATIONAL", label: "Tier 3 International", count: 1, color: "bg-purple-50 border-purple-200" },
                ].map((t) => (
                  <div key={t.tier} className={`rounded-lg border p-4 text-center ${t.color}`}>
                    <p className="text-2xl font-bold text-[#0A1628]">{t.count}</p>
                    <p className="text-xs text-gray-600 mt-1">{t.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PARTNERS TAB */}
        {tab === "partners" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-[#0A1628] text-sm">Partners in {country.countryName}</h3>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchPartner}
                    onChange={(e) => setSearchPartner(e.target.value)}
                    placeholder="Search partners..."
                    className="h-8 pl-8 pr-3 border border-gray-300 rounded-lg text-xs w-48"
                  />
                </div>
              </div>
              <button className="h-8 px-3 bg-[#FF6B00] text-white rounded-lg text-xs font-medium hover:bg-orange-600 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Partner
              </button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase">
                <tr>
                  {["Partner", "Tier", "Rating", "Jobs", "Status", "Verified", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_PARTNERS.filter(
                  (p) => p.name.toLowerCase().includes(searchPartner.toLowerCase())
                ).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0A1628] text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="font-medium text-[#0A1628]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        p.tier === "TIER_1_LOCAL" ? "bg-green-50 text-green-700" :
                        p.tier === "TIER_2_DOMESTIC_FREIGHT" ? "bg-blue-50 text-blue-700" :
                        "bg-purple-50 text-purple-700"
                      }`}>{TIER_LABELS[p.tier] || p.tier}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[#FF6B00] font-medium">{p.rating}</span>
                        <span className="text-yellow-400 text-xs">★</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#0A1628]">{p.jobs}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-[10px] font-medium ${
                        p.status === "online" ? "text-green-600" : "text-gray-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === "online" ? "bg-green-500" : "bg-gray-300"}`} />
                        {p.status === "online" ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.verified ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1 hover:bg-gray-100 rounded" title="View"><Eye className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* JOBS TAB */}
        {tab === "jobs" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-[#0A1628] text-sm">Jobs in {country.countryName}</h3>
              <div className="flex gap-2">
                <button className="h-8 px-3 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 flex items-center gap-1">
                  <Download className="w-3 h-3" /> Export
                </button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase">
                <tr>
                  {["Waybill", "Pickup", "Dropoff", "Tier", "Partner", "Amount", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_JOBS.map((j) => {
                  const st = statusConfig[j.status] || { label: j.status, color: "bg-gray-100 text-gray-600" };
                  return (
                    <tr key={j.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-[#0A1628] font-mono text-xs">{j.waybill}</td>
                      <td className="px-4 py-3 text-gray-600">{j.pickup}</td>
                      <td className="px-4 py-3 text-gray-600">{j.dropoff}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          j.tier === "Tier 1" ? "bg-green-50 text-green-700" :
                          j.tier === "Tier 2" ? "bg-blue-50 text-blue-700" :
                          "bg-purple-50 text-purple-700"
                        }`}>{j.tier}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{j.partner}</td>
                      <td className="px-4 py-3 font-medium text-[#0A1628]">{country.currencyCode} {j.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* CARRIERS TAB */}
        {tab === "carriers" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0A1628]">Active Carriers ({country.carriers?.length || 0})</h3>
              <button className="h-8 px-3 bg-[#FF6B00] text-white rounded-lg text-xs font-medium hover:bg-orange-600 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Carrier
              </button>
            </div>
            {!country.carriers?.length ? (
              <div className="text-center py-12 text-gray-400">
                <Truck className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p>No carriers registered for this country yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {country.carriers.map((carrier: any, i: number) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0A1628] rounded-lg flex items-center justify-center">
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-[#0A1628]">{carrier.carrierName}</p>
                          <p className="text-[10px] text-gray-400">{carrier.carrierSlug}</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] text-green-600">
                        <Radio className="w-3 h-3" /> API Active
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(carrier.supportedTiers || []).map((tier: string) => (
                        <span key={tier} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px]">
                          {TIER_LABELS[tier] || tier}
                        </span>
                      ))}
                    </div>
                    {carrier.supportsInternational && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[10px]">International</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RATE CARDS TAB */}
        {tab === "rate-cards" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0A1628]">Rate Cards ({country.rateCards?.length || 0})</h3>
              <button className="h-8 px-3 bg-[#FF6B00] text-white rounded-lg text-xs font-medium hover:bg-orange-600 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Rate Card
              </button>
            </div>
            {!country.rateCards?.length ? (
              <div className="text-center py-12 text-gray-400">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p>No rate cards configured for this country.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {["Tier", "Carrier", "Base Rate", "Per Kg", "Per Km", "Min Fee", "Free Thresh", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3 font-medium text-gray-600 text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {country.rateCards.map((rc: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium">
                            {TIER_LABELS[rc.tier] || rc.tier}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#0A1628]">{rc.carrierName || "Platform Default"}</td>
                        <td className="px-4 py-3 font-mono text-[#0A1628]">{rc.currency} {rc.baseRate}</td>
                        <td className="px-4 py-3 font-mono text-gray-600">{rc.perKg}</td>
                        <td className="px-4 py-3 font-mono text-gray-600">{rc.perKm}</td>
                        <td className="px-4 py-3 font-mono text-gray-600">{rc.minFee}</td>
                        <td className="px-4 py-3 font-mono text-gray-600">{rc.freeShippingThreshold || "-"}</td>
                        <td className="px-4 py-3">
                          <button className="p-1 hover:bg-gray-100 rounded" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* COVERAGE TAB */}
        {tab === "coverage" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF6B00]" /> Coverage Heat Map — {country.countryName}
              </h3>
              <div className="bg-[#0d1b2a] rounded-xl p-8 text-center relative overflow-hidden" style={{ height: 300 }}>
                <div className="absolute inset-0 opacity-20">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: `${40 + Math.random() * 80}px`,
                        height: `${40 + Math.random() * 80}px`,
                        left: `${10 + Math.random() * 70}%`,
                        top: `${10 + Math.random() * 70}%`,
                        background: `radial-gradient(circle, ${
                          ["#22c55e", "#eab308", "#22c55e"][i % 3]
                        }44, transparent)`,
                      }}
                    />
                  ))}
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                  <MapPin className="w-12 h-12 text-[#FF6B00] mb-3" />
                  <p className="text-white font-semibold">Coverage Map</p>
                  <p className="text-white/50 text-sm mt-1">Interactive heat map showing partner density by region</p>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Dense coverage</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Moderate</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> No coverage</span>
              </div>
            </div>
          </div>
        )}

        {/* COMPLIANCE TAB */}
        {tab === "compliance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#FF6B00]" /> Legal & Regulatory
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Gig Worker Classification</label>
                    <select
                      value={country.gigWorkerClassification || "independent_contractor"}
                      onChange={(e) => updateCountry("gigWorkerClassification", e.target.value)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="independent_contractor">Independent Contractor</option>
                      <option value="employee">Employee</option>
                      <option value="hybrid">Hybrid Model</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Legal Review Status</label>
                    <select
                      value={country.legalReviewStatus || "pending"}
                      onChange={(e) => updateCountry("legalReviewStatus", e.target.value)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="pending">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="requires_attention">Requires Attention</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#FF6B00]" /> Licences & Insurance
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Operating Licence", status: "valid", expiry: "2027-03-15" },
                    { label: "Partner Insurance", status: "valid", expiry: "2026-12-01" },
                    { label: "Vehicle Insurance", status: "valid", expiry: "2026-11-30" },
                    { label: "Tax Registration", status: "valid", expiry: "N/A" },
                  ].map((doc) => (
                    <div key={doc.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-[#0A1628]">{doc.label}</p>
                          <p className="text-[10px] text-gray-500">Expires: {doc.expiry}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-medium">
                        {doc.status === "valid" ? "Valid" : "Expired"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Country Approval Toggle */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#FF6B00]" /> Country Approved for Live Operation
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    When enabled, this country is live for real deliveries. Disable to pause all operations.
                  </p>
                </div>
                <button
                  onClick={() => updateCountry("isLive", !country.isLive)}
                  className="flex-shrink-0"
                >
                  {country.isLive ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Live</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700">Paused</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAYOUTS TAB */}
        {tab === "payouts" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-[#0A1628] text-sm">Partner Payouts — {country.countryName}</h3>
              <button className="h-8 px-3 bg-[#FF6B00] text-white rounded-lg text-xs font-medium hover:bg-orange-600 flex items-center gap-1">
                <Wallet className="w-3 h-3" /> Process Batch
              </button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase">
                <tr>
                  {["Partner", "Amount", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_PAYOUTS.map((p) => {
                  const st = statusConfig[p.status] || { label: p.status, color: "bg-gray-100 text-gray-600" };
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-[#0A1628]">{p.partner}</td>
                      <td className="px-4 py-3 font-medium text-[#0A1628]">{p.currency} {p.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.date}</td>
                      <td className="px-4 py-3">
                        <button className="p-1 hover:bg-gray-100 rounded" title="View"><Eye className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORTS TAB */}
        {tab === "reports" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Shipments", value: "1,247", change: "+12%", up: true, icon: Package },
                { label: "Revenue", value: `${country.currencySymbol || "$"}48,500`, change: "+8%", up: true, icon: TrendingUp },
                { label: "Success Rate", value: "97.2%", change: "+0.5%", up: true, icon: CheckCircle },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <span className={`text-xs font-medium ${stat.up ? "text-green-600" : "text-red-600"}`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#0A1628]">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#FF6B00]" /> Shipment Reports
              </h3>
              <div className="text-center py-12 text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p>Shipment reports and analytics will appear here.</p>
                <button className="mt-3 px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-orange-600">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save indicator */}
        {saving && (
          <div className="fixed bottom-6 right-6 bg-[#0A1628] text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm z-50">
            <Save className="w-4 h-4 animate-spin" /> Saving changes...
          </div>
        )}
      </div>
    </AdminShell>
  );
}
