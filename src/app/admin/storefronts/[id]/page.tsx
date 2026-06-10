"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/admin-shell";
import {
  Globe, MapPin, Home, CreditCard, Truck, Store, Save,
  ArrowLeft, ChevronDown, ToggleLeft, ToggleRight, X, Image,
} from "lucide-react";
import { insforge } from "@/lib/insforge";

interface StorefrontForm {
  id: string;
  name: string;
  slug: string;
  domainType: "subdomain" | "custom_domain";
  activeDomain: string;
  currencyCode: string;
  currencySymbol: string;
  languageCode: string;
  countryCode: string;
  taxRate: number;
  taxLabel: string;
  taxInclusive: boolean;
  isDefault: boolean;
  active: boolean;
  metaTitle: string;
  metaDescription: string;
}

const defaultForm: StorefrontForm = {
  id: "", name: "", slug: "",
  domainType: "subdomain", activeDomain: "",
  currencyCode: "USD", currencySymbol: "$", languageCode: "en",
  countryCode: "US", taxRate: 0, taxLabel: "VAT", taxInclusive: false,
  isDefault: false, active: true,
  metaTitle: "", metaDescription: "",
};

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
];

const languages = [
  { code: "en", name: "English" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ar", name: "Arabic" },
  { code: "ha", name: "Hausa" },
  { code: "yo", name: "Yoruba" },
  { code: "ig", name: "Igbo" },
];

const countries = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "NG", name: "Nigeria" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "BR", name: "Brazil" },
  { code: "ZA", name: "South Africa" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
];

type Tab = "general" | "regional" | "homepage" | "payments" | "shipping" | "vendors";

export default function EditStorefrontPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [tab, setTab] = useState<Tab>("general");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<StorefrontForm>(defaultForm);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await insforge.database
        .from("storefronts")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        setForm({
          id: data.id,
          name: data.name,
          slug: data.slug,
          domainType: data.domain_type,
          activeDomain: data.active_domain,
          currencyCode: data.currency_code,
          currencySymbol: data.currency_symbol,
          languageCode: data.language_code,
          countryCode: data.country_code || "",
          taxRate: data.tax_rate,
          taxLabel: data.tax_label || "VAT",
          taxInclusive: data.tax_inclusive || false,
          isDefault: data.is_default || false,
          active: data.status === "active",
          metaTitle: data.meta_title || "",
          metaDescription: data.meta_description || "",
        });
      }
      setLoading(false);
    })();
  }, [id]);

  const update = <K extends keyof StorefrontForm>(key: K, value: StorefrontForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const payload: any = {
      name: form.name,
      slug: form.slug,
      domain_type: form.domainType,
      active_domain: form.activeDomain,
      currency_code: form.currencyCode,
      currency_symbol: form.currencySymbol,
      language_code: form.languageCode,
      country_code: form.countryCode,
      tax_rate: form.taxRate,
      tax_label: form.taxLabel,
      tax_inclusive: form.taxInclusive,
      is_default: form.isDefault,
      status: form.active ? "active" : "inactive",
      meta_title: form.metaTitle,
      meta_description: form.metaDescription,
    };
    const { error } = await insforge.database.from("storefronts").update(payload).eq("id", id);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "general", label: "General", icon: Globe },
    { key: "regional", label: "Regional", icon: MapPin },
    { key: "homepage", label: "Homepage", icon: Home },
    { key: "payments", label: "Payments", icon: CreditCard },
    { key: "shipping", label: "Shipping", icon: Truck },
    { key: "vendors", label: "Vendors", icon: Store },
  ];

  const domainLabel =
    form.domainType === "subdomain"
      ? `${form.slug}.kauvex.com`
      : form.activeDomain || "custom-domain.com";

  if (loading) {
    return (
      <AdminShell title="Loading..." subtitle="Fetching storefront data">
        <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-blue border-t-transparent rounded-full" /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={`Edit: ${form.name}`} subtitle="Configure storefront settings">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/storefronts")}
            className="p-2 hover:bg-gray-100 rounded-lg text-text-4 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="font-bold text-lg text-text-1">{form.name || "Untitled"}</h2>
            <p className="text-xs text-text-4">{domainLabel}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className={`h-9 px-5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            saved
              ? "bg-green-600 text-white"
              : "bg-blue text-white hover:bg-blue-600"
          }`}
        >
          <Save size={14} />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key
                ? "bg-blue text-white"
                : "text-text-3 hover:bg-gray-50"
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* ===== GENERAL TAB ===== */}
        {tab === "general" && (
          <div className="max-w-2xl space-y-5">
            <h3 className="font-bold text-base text-text-1 mb-1">General Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Storefront Name *</label>
                <input
                  value={form.name}
                  onChange={e => update("name", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Slug *</label>
                <input
                  value={form.slug}
                  onChange={e => update("slug", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-2 block mb-2">Domain Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-blue transition-colors has-[:checked]:border-blue has-[:checked]:bg-blue/5">
                  <input
                    type="radio"
                    name="domainType"
                    checked={form.domainType === "subdomain"}
                    onChange={() => update("domainType", "subdomain")}
                    className="accent-blue"
                  />
                  <div>
                    <p className="text-sm font-medium text-text-1">Subdomain</p>
                    <p className="text-[10px] text-text-4">{form.slug}.kauvex.com</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-blue transition-colors has-[:checked]:border-blue has-[:checked]:bg-blue/5">
                  <input
                    type="radio"
                    name="domainType"
                    checked={form.domainType === "custom_domain"}
                    onChange={() => update("domainType", "custom_domain")}
                    className="accent-blue"
                  />
                  <div>
                    <p className="text-sm font-medium text-text-1">Custom Domain</p>
                    <p className="text-[10px] text-text-4">yourdomain.com</p>
                  </div>
                </label>
              </div>
            </div>

            {form.domainType === "custom_domain" && (
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Custom Domain</label>
                <input
                  value={form.activeDomain}
                  onChange={e => update("activeDomain", e.target.value)}
                  placeholder="yourdomain.com"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-text-2 block mb-2">Status</label>
              <button
                onClick={() => update("active", !form.active)}
                className="flex items-center gap-2"
              >
                {form.active ? (
                  <ToggleRight size={24} className="text-green-600" />
                ) : (
                  <ToggleLeft size={24} className="text-text-4" />
                )}
                <span className={`text-sm font-medium ${form.active ? "text-green-600" : "text-text-4"}`}>
                  {form.active ? "Active" : "Inactive"}
                </span>
              </button>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={e => update("isDefault", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-blue"
                />
                <div>
                  <p className="text-sm font-medium text-text-1">Default Storefront</p>
                  <p className="text-[11px] text-text-4">Set as the primary storefront when no domain match is found</p>
                </div>
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Meta Title</label>
              <input
                value={form.metaTitle}
                onChange={e => update("metaTitle", e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Meta Description</label>
              <textarea
                value={form.metaDescription}
                onChange={e => update("metaDescription", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue resize-none"
              />
            </div>
          </div>
        )}

        {/* ===== REGIONAL TAB ===== */}
        {tab === "regional" && (
          <div className="max-w-2xl space-y-5">
            <h3 className="font-bold text-base text-text-1 mb-1">Regional Configuration</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Currency</label>
                <div className="relative">
                  <select
                    value={form.currencyCode}
                    onChange={e => {
                      const cur = currencies.find(c => c.code === e.target.value);
                      update("currencyCode", e.target.value);
                      if (cur) update("currencySymbol", cur.symbol);
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white appearance-none focus:outline-none focus:border-blue pr-8"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.symbol} — {c.name} ({c.code})</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Language</label>
                <div className="relative">
                  <select
                    value={form.languageCode}
                    onChange={e => update("languageCode", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white appearance-none focus:outline-none focus:border-blue pr-8"
                  >
                    {languages.map(l => (
                      <option key={l.code} value={l.code}>{l.name} ({l.code})</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Country</label>
              <div className="relative">
                <select
                  value={form.countryCode}
                  onChange={e => update("countryCode", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white appearance-none focus:outline-none focus:border-blue pr-8"
                >
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.taxRate}
                  onChange={e => update("taxRate", parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Tax Label</label>
                <input
                  value={form.taxLabel}
                  onChange={e => update("taxLabel", e.target.value)}
                  placeholder="e.g. VAT, GST, HST"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.taxInclusive}
                  onChange={e => update("taxInclusive", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-blue"
                />
                <div>
                  <p className="text-sm font-medium text-text-1">Tax Inclusive Pricing</p>
                  <p className="text-[11px] text-text-4">Prices displayed include tax</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ===== HOMEPAGE TAB ===== */}
        {tab === "homepage" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-base text-text-1 mb-1">Homepage Configuration</h3>
              <p className="text-sm text-text-4 mb-4">Manage banners and featured products for this storefront.</p>
            </div>

            {/* Banner Manager Placeholder */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <Image size={32} className="mx-auto text-text-4 mb-3" />
              <h4 className="font-semibold text-sm text-text-2 mb-1">Banner Manager</h4>
              <p className="text-xs text-text-4 mb-4">Upload and manage homepage banners for {form.name}</p>
              <button className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600">
                Manage Banners
              </button>
            </div>

            {/* Featured Products Placeholder */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <Store size={32} className="mx-auto text-text-4 mb-3" />
              <h4 className="font-semibold text-sm text-text-2 mb-1">Featured Products</h4>
              <p className="text-xs text-text-4 mb-4">Select products to feature on the {form.name} homepage</p>
              <button className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600">
                Select Products
              </button>
            </div>
          </div>
        )}

        {/* ===== PAYMENTS TAB ===== */}
        {tab === "payments" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-base text-text-1 mb-1">Payment Gateways</h3>
              <p className="text-sm text-text-4 mb-4">Enable or disable payment methods for this storefront.</p>
            </div>

            <div className="space-y-3">
              {[
                { name: "Stripe", desc: "Credit/debit cards, Apple Pay, Google Pay", enabled: true },
                { name: "PayPal", desc: "PayPal checkout", enabled: true },
                { name: "Flutterwave", desc: "Card, bank transfer, USSD, mobile money", enabled: true },
                { name: "Paystack", desc: "Cards, bank transfers, mobile money", enabled: false },
                { name: "Bank Transfer", desc: "Manual bank deposit / wire transfer", enabled: true },
                { name: "Cash on Delivery", desc: "Pay upon delivery", enabled: true },
                { name: "Crypto", desc: "Bitcoin, Ethereum, USDT", enabled: false },
              ].map(gw => (
                <div key={gw.name} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-text-1">{gw.name}</p>
                    <p className="text-xs text-text-4">{gw.desc}</p>
                  </div>
                  <button className={`relative w-10 h-5 rounded-full transition-colors ${gw.enabled ? "bg-blue" : "bg-gray-300"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${gw.enabled ? "translate-x-5 left-0.5" : "translate-x-0.5 left-0"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== SHIPPING TAB ===== */}
        {tab === "shipping" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-base text-text-1 mb-1">Shipping Methods</h3>
              <p className="text-sm text-text-4 mb-4">Configure shipping options for {form.name}.</p>
            </div>

            <div className="space-y-3">
              {[
                { name: "Standard Shipping", desc: "5-10 business days", rate: form.currencySymbol + "5.99", enabled: true },
                { name: "Express Shipping", desc: "2-4 business days", rate: form.currencySymbol + "14.99", enabled: true },
                { name: "Free Shipping", desc: "For orders over " + form.currencySymbol + "50", rate: "Free", enabled: true },
                { name: "Next Day Delivery", desc: "Order before 2 PM", rate: form.currencySymbol + "24.99", enabled: false },
                { name: "International", desc: "Worldwide delivery", rate: "Calculated", enabled: false },
              ].map(m => (
                <div key={m.name} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Truck size={16} className="text-text-4" />
                    <div>
                      <p className="text-sm font-semibold text-text-1">{m.name}</p>
                      <p className="text-xs text-text-4">{m.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-text-1">{m.rate}</span>
                    <button className={`relative w-10 h-5 rounded-full transition-colors ${m.enabled ? "bg-blue" : "bg-gray-300"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${m.enabled ? "translate-x-5 left-0.5" : "translate-x-0.5 left-0"}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== VENDORS TAB ===== */}
        {tab === "vendors" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-base text-text-1 mb-1">Vendors</h3>
              <p className="text-sm text-text-4 mb-4">Manage vendors assigned to this storefront.</p>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <Store size={32} className="mx-auto text-text-4 mb-3" />
              <h4 className="font-semibold text-sm text-text-2 mb-1">No vendors assigned yet</h4>
              <p className="text-xs text-text-4 mb-4">Assign vendors to sell on the {form.name} storefront</p>
              <button className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600">
                Assign Vendors
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-text-3 mb-2">Vendor List Preview</p>
              <div className="space-y-2">
                {[
                  { name: "TechWorld Ltd", products: 145, status: "approved" as const },
                  { name: "FashionHub NG", products: 89, status: "approved" as const },
                  { name: "Home Essentials", products: 234, status: "pending" as const },
                ].map(v => (
                  <div key={v.name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center text-blue text-xs font-bold">
                        {v.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-1">{v.name}</p>
                        <p className="text-[10px] text-text-4">{v.products} products</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      v.status === "approved" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
