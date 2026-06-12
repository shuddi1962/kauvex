"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/admin-shell";
import {
  Globe, MapPin, Palette, CheckCircle2, ArrowRight, ArrowLeft,
  Search, ExternalLink, Plus, ChevronDown, Check, X, Info,
  Loader2, Star, Layout, Eye, DollarSign, Users, FolderTree,
} from "lucide-react";
import { insforge } from "@/lib/insforge";

const countries = [
  { code: "US", name: "United States", flag: "🇺🇸", phone: "+1" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", phone: "+44" },
  { code: "CA", name: "Canada", flag: "🇨🇦", phone: "+1" },
  { code: "AU", name: "Australia", flag: "🇦🇺", phone: "+61" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", phone: "+234" },
  { code: "DE", name: "Germany", flag: "🇩🇪", phone: "+49" },
  { code: "FR", name: "France", flag: "🇫🇷", phone: "+33" },
  { code: "AE", name: "UAE", flag: "🇦🇪", phone: "+971" },
  { code: "IN", name: "India", flag: "🇮🇳", phone: "+91" },
  { code: "JP", name: "Japan", flag: "🇯🇵", phone: "+81" },
  { code: "CN", name: "China", flag: "🇨🇳", phone: "+86" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", phone: "+55" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", phone: "+27" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", phone: "+65" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", phone: "+852" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", phone: "+60" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", phone: "+82" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", phone: "+966" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", phone: "+20" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", phone: "+254" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", phone: "+233" },
];

const tlds = [
  { tld: ".com", country: "US", desc: "United States / Global" },
  { tld: ".uk", country: "GB", desc: "United Kingdom" },
  { tld: ".ca", country: "CA", desc: "Canada" },
  { tld: ".au", country: "AU", desc: "Australia" },
  { tld: ".ng", country: "NG", desc: "Nigeria" },
  { tld: ".de", country: "DE", desc: "Germany" },
  { tld: ".fr", country: "FR", desc: "France" },
  { tld: ".ae", country: "AE", desc: "UAE" },
  { tld: ".in", country: "IN", desc: "India" },
  { tld: ".jp", country: "JP", desc: "Japan" },
  { tld: ".cn", country: "CN", desc: "China" },
  { tld: ".br", country: "BR", desc: "Brazil" },
  { tld: ".za", country: "ZA", desc: "South Africa" },
  { tld: ".sg", country: "SG", desc: "Singapore" },
  { tld: ".hk", country: "HK", desc: "Hong Kong" },
  { tld: ".my", country: "MY", desc: "Malaysia" },
  { tld: ".kr", country: "KR", desc: "South Korea" },
  { tld: ".sa", country: "SA", desc: "Saudi Arabia" },
  { tld: ".eg", country: "EG", desc: "Egypt" },
  { tld: ".ke", country: "KE", desc: "Kenya" },
  { tld: ".gh", country: "GH", desc: "Ghana" },
];

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
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
  { code: "ko", name: "Korean" },
  { code: "ms", name: "Malay" },
  { code: "hi", name: "Hindi" },
  { code: "ha", name: "Hausa" },
  { code: "yo", name: "Yoruba" },
];

const themes = [
  {
    id: "default", name: "Kauvex Default", desc: "Full-featured marketplace layout",
    colors: ["#0A1628", "#FF6B00", "#F8F9FA"], popular: true,
    features: ["Full-width layout", "Classic header", "Detailed footer", "Standard product cards"],
  },
  {
    id: "light", name: "Kauvex Light", desc: "Clean, minimal marketplace design",
    colors: ["#FFFFFF", "#FF6B00", "#FFFFFF"], popular: false,
    features: ["Full-width layout", "Minimal header", "Compact footer", "Standard product cards"],
  },
  {
    id: "dark", name: "Kauvex Dark", desc: "Bold dark theme for premium feel",
    colors: ["#1A1A2E", "#FF6B00", "#0F0F1A"], popular: false,
    features: ["Full-width layout", "Classic header", "Detailed footer", "Standard product cards"],
  },
  {
    id: "b2b", name: "B2B Pro", desc: "Corporate B2B wholesale layout",
    colors: ["#003366", "#00A3E0", "#F5F7FA"], popular: false,
    features: ["Contained layout", "Corporate header", "Compact footer", "List product cards"],
  },
  {
    id: "fashion", name: "Fashion Boutique", desc: "Elegant fashion store design",
    colors: ["#1A1A1A", "#E91E63", "#FAFAFA"], popular: false,
    features: ["Full-width layout", "Centered header", "Detailed footer", "Large image cards"],
  },
  {
    id: "electronics", name: "Electronics Hub", desc: "Tech-focused product showcase",
    colors: ["#0D1117", "#58A6FF", "#F0F6FC"], popular: false,
    features: ["Full-width layout", "Classic header", "Detailed footer", "Standard product cards"],
  },
  {
    id: "luxury", name: "Luxury", desc: "High-end premium storefront",
    colors: ["#1C1C1C", "#C9A84C", "#FFFFFF"], popular: false,
    features: ["Contained layout", "Centered header", "Minimal footer", "Elegant product cards"],
  },
  {
    id: "minimal", name: "Minimal Store", desc: "Simple, distraction-free shopping",
    colors: ["#2D3748", "#4A5568", "#FFFFFF"], popular: false,
    features: ["Contained layout", "Minimal header", "Compact footer", "Standard product cards"],
  },
];

const demoCategories = [
  { id: "electronics", name: "Electronics", icon: "🔌", count: "12,450" },
  { id: "fashion", name: "Fashion", icon: "👗", count: "8,230" },
  { id: "marine", name: "Marine", icon: "🚤", count: "3,150" },
  { id: "industrial", name: "Industrial", icon: "🏭", count: "5,670" },
  { id: "automotive", name: "Automotive", icon: "🚗", count: "4,890" },
  { id: "ict", name: "ICT", icon: "💻", count: "6,340" },
  { id: "home", name: "Home & Living", icon: "🏠", count: "9,120" },
  { id: "beauty", name: "Beauty & Health", icon: "💄", count: "7,560" },
  { id: "sports", name: "Sports & Outdoors", icon: "⚽", count: "3,780" },
  { id: "toys", name: "Toys & Kids", icon: "🧸", count: "2,340" },
  { id: "books", name: "Books & Media", icon: "📚", count: "4,120" },
  { id: "grocery", name: "Grocery", icon: "🛒", count: "1,890" },
];

const demoVendors = [
  { id: "v1", name: "TechWorld Ltd", products: 145, rating: 4.8, country: "US" },
  { id: "v2", name: "FashionHub NG", products: 89, rating: 4.5, country: "NG" },
  { id: "v3", name: "MarinePro Supplies", products: 234, rating: 4.9, country: "GB" },
  { id: "v4", name: "AutoParts Express", products: 567, rating: 4.3, country: "DE" },
  { id: "v5", name: "Global Electronics", products: 312, rating: 4.7, country: "CN" },
  { id: "v6", name: "Home Essentials Co", products: 178, rating: 4.4, country: "IN" },
  { id: "v7", name: "BeautyBay", products: 92, rating: 4.6, country: "FR" },
  { id: "v8", name: "SportsDirect Intl", products: 201, rating: 4.2, country: "AU" },
];

type Step = "info" | "domain" | "theme" | "content" | "dns" | "review";

const steps: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "info", label: "Info & Region", icon: MapPin },
  { key: "domain", label: "Domain", icon: Globe },
  { key: "theme", label: "Theme", icon: Palette },
  { key: "content", label: "Content", icon: FolderTree },
  { key: "dns", label: "DNS Setup", icon: ExternalLink },
  { key: "review", label: "Launch", icon: RocketIcon },
];

function RocketIcon({ size }: { size?: number }) {
  return (
    <svg width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

export default function CreateStorefrontWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("info");
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [domainSearch, setDomainSearch] = useState("");

  const stepIndex = steps.findIndex(s => s.key === step);
  const totalSteps = steps.length;

  const [form, setForm] = useState({
    name: "",
    slug: "",
    countryCode: "US",
    currencyCode: "USD",
    currencySymbol: "$",
    languageCode: "en",
    taxRate: 0,
    taxLabel: "VAT",
    taxInclusive: false,
    domainType: "tld" as "tld" | "subdomain" | "custom",
    selectedTld: ".com",
    subdomain: "",
    customDomain: "",
    themeId: "default",
    categories: ["electronics", "fashion", "home"] as string[],
    vendors: ["v1", "v5"] as string[],
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const country = countries.find(c => c.code === form.countryCode);
  const tld = tlds.find(t => t.tld === form.selectedTld);

  const getActiveDomain = () => {
    if (form.domainType === "tld") return `${form.slug}${form.selectedTld}`;
    if (form.domainType === "subdomain") return `${form.subdomain || form.slug}.kauvex.com`;
    return form.customDomain;
  };

  const canProceed = () => {
    switch (step) {
      case "info": return form.name.length >= 2 && form.slug.length >= 2;
      case "domain": return getActiveDomain().length > 0;
      case "theme": return form.themeId.length > 0;
      case "content": return true;
      case "dns": return true;
      default: return true;
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    const domain = getActiveDomain();
    const payload: any = {
      name: form.name,
      slug: form.slug,
      domain_type: form.domainType === "tld" ? "subdomain" : form.domainType,
      subdomain: form.domainType === "subdomain" ? (form.subdomain || form.slug) : null,
      custom_domain: form.domainType === "custom" ? form.customDomain : null,
      active_domain: domain,
      currency_code: form.currencyCode,
      currency_symbol: form.currencySymbol,
      language_code: form.languageCode,
      country_code: form.countryCode,
      tax_rate: form.taxRate,
      tax_label: form.taxLabel,
      tax_inclusive: form.taxInclusive,
      status: "active",
    };

    const { data, error } = await insforge.database.from("storefronts").insert([payload]).select();
    if (error) { setSaving(false); alert("Failed: " + error.message); return; }

    const storefrontId = data?.[0]?.id;
    if (!storefrontId) { setSaving(false); return; }

    if (form.categories.length > 0) {
      await insforge.database.from("storefront_categories").insert(
        form.categories.map(c => ({ storefront_id: storefrontId, category_id: c }))
      );
    }
    if (form.vendors.length > 0) {
      await insforge.database.from("storefront_vendors").insert(
        form.vendors.map(v => ({ storefront_id: storefrontId, vendor_id: v }))
      );
    }
    await insforge.database.from("storefront_themes").insert([{
      storefront_id: storefrontId,
      name: themes.find(t => t.id === form.themeId)?.name || "Kauvex Default",
      template_name: form.themeId,
      is_active: true,
      is_default: true,
    }]);

    setCreatedId(storefrontId);
    setSaving(false);
  };

  const next = () => {
    const idx = steps.findIndex(s => s.key === step);
    if (idx < totalSteps - 1) setStep(steps[idx + 1].key);
  };
  const prev = () => {
    const idx = steps.findIndex(s => s.key === step);
    if (idx > 0) setStep(steps[idx - 1].key);
  };

  const filteredTlds = tlds.filter(t =>
    t.tld.includes(domainSearch.toLowerCase()) ||
    t.desc.toLowerCase().includes(domainSearch.toLowerCase())
  );

  return (
    <AdminShell title="Create Storefront" subtitle="Set up a new regional or custom storefront">
      {/* Stepper */}
      <div className="bg-white rounded-xl border border-border mb-6">
        <div className="flex items-center justify-between px-6 py-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.key;
            const isPast = stepIndex > i;
            return (
              <button
                key={s.key}
                onClick={() => !isPast && !isActive && setStep(s.key)}
                disabled={isPast ? false : !isActive}
                className={`flex items-center gap-2 text-xs font-medium transition-all ${
                  isActive ? "text-orange" : isPast ? "text-green-600" : "text-text-4"
                } ${isPast ? "cursor-pointer hover:text-green-700" : ""} ${!isActive && !isPast ? "cursor-default" : ""}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isActive ? "bg-orange text-white" : isPast ? "bg-green-100 text-green-700" : "bg-gray-100 text-text-4"
                }`}>
                  {isPast ? <Check size={12} /> : i + 1}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
        <div className="h-1 bg-gray-100 rounded-b-xl overflow-hidden">
          <div className="h-full bg-orange transition-all duration-300 rounded-b-xl" style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }} />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-border p-6">
        {/* STEP 1: INFO & REGION */}
        {step === "info" && (
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-orange/10 flex items-center justify-center">
                <MapPin size={18} className="text-orange" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-text-1">Basic Information</h2>
                <p className="text-xs text-text-4">Name your storefront and choose its region</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Storefront Name *</label>
                <input value={form.name} onChange={e => {
                  const name = e.target.value;
                  update("name", name);
                  if (!form.slug || form.slug === name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")) {
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    update("slug", slug);
                  }
                }} placeholder="e.g. Kauvex UK, Kauvex Nigeria" className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Slug *</label>
                <input value={form.slug} onChange={e => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))} placeholder="e.g. uk, nigeria" className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Country / Region</label>
                <div className="relative">
                  <select value={form.countryCode} onChange={e => {
                    const c = countries.find(x => x.code === e.target.value);
                    if (c) {
                      update("countryCode", c.code);
                      const tld = tlds.find(t => t.country === c.code);
                      if (tld) update("selectedTld", tld.tld);
                      const cur = currencies.find(cu => cu.code === getCurrencyForCountry(c.code));
                      if (cur) { update("currencyCode", cur.code); update("currencySymbol", cur.symbol); }
                      const lang = getLanguageForCountry(c.code);
                      update("languageCode", lang);
                      const tax = getTaxForCountry(c.code);
                      update("taxRate", tax.rate);
                      update("taxLabel", tax.label);
                      update("taxInclusive", tax.inclusive);
                    }
                  }} className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange pr-8">
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Language</label>
                <div className="relative">
                  <select value={form.languageCode} onChange={e => update("languageCode", e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange pr-8">
                    {languages.map(l => <option key={l.code} value={l.code}>{l.name} ({l.code})</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Currency</label>
                <div className="relative">
                  <select value={form.currencyCode} onChange={e => {
                    const cur = currencies.find(c => c.code === e.target.value);
                    update("currencyCode", e.target.value);
                    if (cur) update("currencySymbol", cur.symbol);
                  }} className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange pr-8">
                    {currencies.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Tax Rate (%)</label>
                  <input type="number" step="0.1" value={form.taxRate} onChange={e => update("taxRate", parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Tax Label</label>
                  <input value={form.taxLabel} onChange={e => update("taxLabel", e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange" />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.taxInclusive} onChange={e => update("taxInclusive", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-orange" />
              <div>
                <p className="text-sm font-medium text-text-1">Tax Inclusive Pricing</p>
                <p className="text-[11px] text-text-4">Prices displayed include tax</p>
              </div>
            </label>

            <div className="bg-orange-50 border border-orange/20 rounded-xl p-4 flex items-start gap-3">
              <Info size={16} className="text-orange shrink-0 mt-0.5" />
              <p className="text-xs text-text-2">This storefront will use <strong>{form.currencyCode} ({form.currencySymbol})</strong> with <strong>{form.languageCode.toUpperCase()}</strong> language. Tax rate: <strong>{form.taxRate}% {form.taxLabel}</strong>. {form.taxInclusive ? "(inclusive)" : "(exclusive)"}</p>
            </div>
          </div>
        )}

        {/* STEP 2: DOMAIN */}
        {step === "domain" && (
          <div className="max-w-3xl space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-orange/10 flex items-center justify-center">
                <Globe size={18} className="text-orange" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-text-1">Choose Your Domain</h2>
                <p className="text-xs text-text-4">Select a country TLD, subdomain, or connect a custom domain</p>
              </div>
            </div>

            <div className="flex gap-3">
              {[
                { key: "tld" as const, label: "Country TLD", desc: `yourstore${form.selectedTld}`, icon: Globe },
                { key: "subdomain" as const, label: "Subdomain", desc: "yourstore.kauvex.com", icon: Globe },
                { key: "custom" as const, label: "Custom Domain", desc: "yourdomain.com", icon: ExternalLink },
              ].map(opt => (
                <button key={opt.key} onClick={() => update("domainType", opt.key)}
                  className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
                    form.domainType === opt.key ? "border-orange bg-orange-50" : "border-border hover:border-gray-300"
                  }`}>
                  <opt.icon size={20} className={`mb-2 ${form.domainType === opt.key ? "text-orange" : "text-text-4"}`} />
                  <p className="text-sm font-semibold text-text-1">{opt.label}</p>
                  <p className="text-[11px] text-text-4 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>

            {form.domainType === "tld" && (
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-2">Select Country TLD</label>
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                  <input value={domainSearch} onChange={e => setDomainSearch(e.target.value)} placeholder="Search TLDs..." className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {filteredTlds.map(t => (
                    <button key={t.tld} onClick={() => update("selectedTld", t.tld)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs transition-all ${
                        form.selectedTld === t.tld ? "border-orange bg-orange-50 text-orange" : "border-border hover:border-gray-300 text-text-2"
                      }`}>
                      <span className="font-bold text-sm">{t.tld}</span>
                      <span className="text-text-4">{t.desc}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-text-4 mt-3">Your domain: <strong className="text-orange">{form.slug || "yourstore"}{form.selectedTld}</strong></p>
              </div>
            )}

            {form.domainType === "subdomain" && (
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Subdomain</label>
                <div className="flex items-center gap-2">
                  <input value={form.subdomain || form.slug} onChange={e => update("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))}
                    placeholder={form.slug || "yourstore"} className="flex-1 h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange" />
                  <span className="text-sm text-text-4 font-mono">.kauvex.com</span>
                </div>
                <p className="text-xs text-text-4 mt-2">Your storefront will be available at: <strong className="text-orange">{(form.subdomain || form.slug) || "yourstore"}.kauvex.com</strong></p>
              </div>
            )}

            {form.domainType === "custom" && (
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Custom Domain</label>
                <input value={form.customDomain} onChange={e => update("customDomain", e.target.value.toLowerCase().replace(/[^a-z0-9.-]+/g, ""))}
                  placeholder="yourstore.com" className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange" />
                <p className="text-xs text-text-4 mt-2">You will need to configure DNS records after creation. We&apos;ll show you detailed instructions.</p>
                <div className="bg-blue-50 border border-blue/20 rounded-xl p-3 flex items-start gap-2 mt-3">
                  <Info size={14} className="text-blue shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-800">Custom domains require DNS configuration (A record or CNAME pointing to our servers). SSL certificates are auto-provisioned via Let&apos;s Encrypt.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: THEME */}
        {step === "theme" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-orange/10 flex items-center justify-center">
                <Palette size={18} className="text-orange" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-text-1">Choose a Theme</h2>
                <p className="text-xs text-text-4">Select a template for your storefront&apos;s look and feel</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {themes.map((theme) => (
                <button key={theme.id} onClick={() => update("themeId", theme.id)}
                  className={`rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                    form.themeId === theme.id ? "border-orange ring-2 ring-orange/20" : "border-border"
                  }`}>
                  <div className="flex items-center gap-1.5 mb-3">
                    {theme.colors.map((color, i) => (
                      <div key={i} className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <p className="text-sm font-bold text-text-1">{theme.name}</p>
                  <p className="text-[10px] text-text-4 mt-0.5 mb-2">{theme.desc}</p>
                  <ul className="space-y-0.5">
                    {theme.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1 text-[9px] text-text-4">
                        <Check size={8} className="text-green-600 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: CONTENT (Categories & Vendors) */}
        {step === "content" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-orange/10 flex items-center justify-center">
                <FolderTree size={18} className="text-orange" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-text-1">Categories & Vendors</h2>
                <p className="text-xs text-text-4">Select which categories and vendors appear on this storefront</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-2 block mb-2">Categories</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {demoCategories.map(cat => {
                  const selected = form.categories.includes(cat.id);
                  return (
                    <button key={cat.id} onClick={() => {
                      update("categories", selected ? form.categories.filter(c => c !== cat.id) : [...form.categories, cat.id]);
                    }} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs transition-all ${
                      selected ? "border-orange bg-orange-50" : "border-border hover:border-gray-300"
                    }`}>
                      <span>{cat.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-1">{cat.name}</p>
                        <p className="text-[9px] text-text-4">{cat.count} products</p>
                      </div>
                      {selected && <Check size={12} className="text-orange shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-2 block mb-2">Vendors</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoVendors.map(v => {
                  const selected = form.vendors.includes(v.id);
                  return (
                    <button key={v.id} onClick={() => {
                      update("vendors", selected ? form.vendors.filter(x => x !== v.id) : [...form.vendors, v.id]);
                    }} className={`flex items-center gap-3 p-3 rounded-lg border text-xs transition-all ${
                      selected ? "border-orange bg-orange-50" : "border-border hover:border-gray-300"
                    }`}>
                      <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center text-blue text-xs font-bold shrink-0">
                        {v.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-text-1">{v.name}</p>
                        <p className="text-[10px] text-text-4">{v.products} products · ⭐ {v.rating} · {v.country}</p>
                      </div>
                      {selected && <Check size={14} className="text-orange shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DNS GUIDE */}
        {step === "dns" && (
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-orange/10 flex items-center justify-center">
                <ExternalLink size={18} className="text-orange" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-text-1">DNS Configuration</h2>
                <p className="text-xs text-text-4">How to point your domain to Kauvex</p>
              </div>
            </div>

            {form.domainType === "tld" && (
              <div className="bg-green-50 border border-green/20 rounded-xl p-4 flex items-start gap-3">
                <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-800">No DNS configuration needed</p>
                  <p className="text-xs text-green-700 mt-1">Country TLD storefronts work automatically with our domain infrastructure. Your storefront will be available at <strong>{form.slug}{form.selectedTld}</strong> once DNS propagates (usually 24-48 hours for new TLDs).</p>
                </div>
              </div>
            )}

            {form.domainType === "subdomain" && (
              <div className="bg-green-50 border border-green/20 rounded-xl p-4 flex items-start gap-3">
                <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Automatic subdomain</p>
                  <p className="text-xs text-green-700 mt-1">Subdomains on kauvex.com are automatically configured. Your storefront will be live at <strong>{(form.subdomain || form.slug) || "yourstore"}.kauvex.com</strong> immediately.</p>
                </div>
              </div>
            )}

            {form.domainType === "custom" && (
              <div className="space-y-4">
                <p className="text-sm text-text-2">To connect your custom domain, follow these steps:</p>

                <div className="space-y-3">
                  {[
                    { step: "1", title: "Access Your DNS Provider", desc: "Log in to your domain registrar or DNS hosting provider (e.g., GoDaddy, Namecheap, Cloudflare, AWS Route 53)." },
                    { step: "2", title: "Add the Following DNS Records", desc: "", records: [
                      { type: "A", name: "@", value: "76.76.21.21", ttl: "3600", desc: "Points your root domain to Kauvex" },
                      { type: "CNAME", name: "www", value: "kauvex.com", ttl: "3600", desc: "Redirects www to your domain" },
                    ]},
                    { step: "3", title: "Or Use Our Nameservers (Recommended)", desc: "Replace your current nameservers with:", nameservers: ["ns1.kauvex.com", "ns2.kauvex.com", "ns3.kauvex.com"] },
                    { step: "4", title: "Wait for Propagation", desc: "DNS changes can take 24-48 hours to propagate globally. SSL certificates are automatically provisioned once your domain resolves." },
                    { step: "5", title: "Verify Domain", desc: "Once propagated, we'll automatically verify your domain and enable SSL. You can check the status in the storefront settings." },
                  ].map(item => (
                    <div key={item.step} className="flex gap-3 p-4 rounded-xl border border-border">
                      <div className="w-7 h-7 rounded-full bg-orange text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {item.step}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-text-1">{item.title}</p>
                        <p className="text-xs text-text-4">{item.desc}</p>
                        {"records" in item && item.records && (
                          <div className="bg-gray-50 rounded-lg overflow-hidden border border-border">
                            <table className="w-full text-xs">
                              <thead><tr className="bg-gray-100"><th className="p-2 text-left font-semibold text-text-4">Type</th><th className="p-2 text-left font-semibold text-text-4">Name</th><th className="p-2 text-left font-semibold text-text-4">Value</th><th className="p-2 text-left font-semibold text-text-4">TTL</th></tr></thead>
                              <tbody>
                                {item.records.map((r: any) => (
                                  <tr key={r.name + r.type} className="border-t border-border">
                                    <td className="p-2 font-mono text-orange font-semibold">{r.type}</td>
                                    <td className="p-2 font-mono">{r.name}</td>
                                    <td className="p-2 font-mono text-blue">{r.value}</td>
                                    <td className="p-2 text-text-4">{r.ttl}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {"nameservers" in item && item.nameservers && (
                          <div className="flex flex-wrap gap-2">
                            {item.nameservers.map((ns: string) => (
                              <code key={ns} className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-blue">{ns}</code>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: REVIEW & LAUNCH */}
        {step === "review" && (
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-lg bg-orange/10 flex items-center justify-center">
                <RocketIcon size={18} />
              </div>
              <div>
                <h2 className="font-bold text-lg text-text-1">Review & Launch</h2>
                <p className="text-xs text-text-4">Review your storefront configuration before launching</p>
              </div>
            </div>

            {createdId ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h3 className="font-bold text-xl text-text-1">Storefront Created!</h3>
                <p className="text-sm text-text-4 max-w-md mx-auto">
                  Your storefront <strong>{form.name}</strong> has been created and is now active at <strong>{getActiveDomain()}</strong>.
                </p>
                <div className="flex items-center justify-center gap-3 pt-4">
                  <button onClick={() => router.push(`/admin/storefronts/${createdId}`)}
                    className="h-10 px-5 bg-orange text-white text-sm font-semibold rounded-lg hover:bg-orange/90">
                    Configure Storefront
                  </button>
                  <button onClick={() => router.push("/admin/storefronts")}
                    className="h-10 px-5 border border-border text-text-2 text-sm font-medium rounded-lg hover:bg-gray-50">
                    Back to All Storefronts
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-xs font-semibold text-text-4 uppercase">Setting</span>
                    <span className="text-xs font-semibold text-text-4 uppercase">Value</span>
                  </div>
                  {[
                    { label: "Storefront Name", value: form.name },
                    { label: "Slug", value: form.slug },
                    { label: "Domain", value: getActiveDomain(), highlight: true },
                    { label: "Domain Type", value: form.domainType === "tld" ? "Country TLD" : form.domainType === "subdomain" ? "Subdomain" : "Custom Domain" },
                    { label: "Country", value: country ? `${country.flag} ${country.name}` : "" },
                    { label: "Currency", value: `${form.currencySymbol} ${form.currencyCode}` },
                    { label: "Language", value: languages.find(l => l.code === form.languageCode)?.name || form.languageCode },
                    { label: "Tax", value: `${form.taxRate}% ${form.taxLabel} ${form.taxInclusive ? "(inclusive)" : "(exclusive)"}` },
                    { label: "Theme", value: themes.find(t => t.id === form.themeId)?.name },
                    { label: "Categories", value: `${form.categories.length} selected` },
                    { label: "Vendors", value: `${form.vendors.length} selected` },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-text-2">{item.label}</span>
                      <span className={`font-semibold ${item.highlight ? "text-orange" : "text-text-1"}`}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <button onClick={handleCreate} disabled={saving}
                  className="w-full h-12 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <>Launch Storefront <RocketIcon size={16} /></>}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {!createdId && (
        <div className="flex items-center justify-between mt-6">
          <button onClick={prev} disabled={stepIndex === 0}
            className="flex items-center gap-1.5 h-10 px-5 text-sm font-medium text-text-3 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30">
            <ArrowLeft size={14} /> Back
          </button>
          <button onClick={next} disabled={!canProceed() || step === "review"}
            className="flex items-center gap-1.5 h-10 px-5 bg-orange text-white text-sm font-semibold rounded-lg hover:bg-orange/90 transition-colors disabled:opacity-50">
            {step === "review" ? "Launch" : "Continue"} <ArrowRight size={14} />
          </button>
        </div>
      )}
    </AdminShell>
  );
}

function getCurrencyForCountry(code: string): string {
  const map: Record<string, string> = {
    US: "USD", GB: "GBP", CA: "CAD", AU: "AUD", NG: "NGN",
    DE: "EUR", FR: "EUR", AE: "AED", IN: "INR", JP: "JPY",
    CN: "CNY", BR: "BRL", ZA: "ZAR", SG: "SGD", HK: "HKD",
    MY: "MYR", KR: "KRW", SA: "SAR", EG: "EGP", KE: "KES", GH: "GHS",
  };
  return map[code] || "USD";
}

function getLanguageForCountry(code: string): string {
  const map: Record<string, string> = {
    US: "en", GB: "en", CA: "en", AU: "en", NG: "en",
    DE: "de", FR: "fr", AE: "ar", IN: "hi", JP: "ja",
    CN: "zh", BR: "pt", ZA: "en", SG: "en", HK: "en",
    MY: "ms", KR: "ko", SA: "ar", EG: "ar", KE: "en", GH: "en",
  };
  return map[code] || "en";
}

function getTaxForCountry(code: string): { rate: number; label: string; inclusive: boolean } {
  const map: Record<string, { rate: number; label: string; inclusive: boolean }> = {
    US: { rate: 0, label: "Sales Tax", inclusive: false },
    GB: { rate: 20, label: "VAT", inclusive: true },
    CA: { rate: 13, label: "HST", inclusive: false },
    AU: { rate: 10, label: "GST", inclusive: true },
    NG: { rate: 7.5, label: "VAT", inclusive: true },
    DE: { rate: 19, label: "MwSt", inclusive: true },
    FR: { rate: 20, label: "TVA", inclusive: true },
    AE: { rate: 5, label: "VAT", inclusive: true },
    IN: { rate: 18, label: "GST", inclusive: true },
    JP: { rate: 10, label: "Consumption Tax", inclusive: true },
    CN: { rate: 13, label: "VAT", inclusive: true },
    BR: { rate: 17, label: "ICMS", inclusive: true },
    ZA: { rate: 15, label: "VAT", inclusive: true },
    SG: { rate: 9, label: "GST", inclusive: true },
    HK: { rate: 0, label: "N/A", inclusive: false },
    MY: { rate: 10, label: "SST", inclusive: true },
    KR: { rate: 10, label: "VAT", inclusive: true },
    SA: { rate: 15, label: "VAT", inclusive: true },
    EG: { rate: 14, label: "VAT", inclusive: true },
    KE: { rate: 16, label: "VAT", inclusive: true },
    GH: { rate: 12.5, label: "VAT", inclusive: true },
  };
  return map[code] || { rate: 0, label: "VAT", inclusive: false };
}
