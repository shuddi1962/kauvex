"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/admin-shell";
import {
  Globe, MapPin, Palette, CheckCircle2, ArrowRight, ArrowLeft,
  Search, ExternalLink, Plus, ChevronDown, Check, X, Info,
  Loader2, Star, Layout, Eye, DollarSign, Users, FolderTree,
  Sparkles, Shield, HelpCircle, Copy, Monitor,
} from "lucide-react";
import { supabase } from "@/lib/insforge";

const countries = [
  { code: "US", name: "United States", flag: "🇺🇸", tld: ".com" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", tld: ".uk" },
  { code: "CA", name: "Canada", flag: "🇨🇦", tld: ".ca" },
  { code: "AU", name: "Australia", flag: "🇦🇺", tld: ".au" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", tld: ".ng" },
  { code: "DE", name: "Germany", flag: "🇩🇪", tld: ".de" },
  { code: "FR", name: "France", flag: "🇫🇷", tld: ".fr" },
  { code: "AE", name: "UAE", flag: "🇦🇪", tld: ".ae" },
  { code: "IN", name: "India", flag: "🇮🇳", tld: ".in" },
  { code: "JP", name: "Japan", flag: "🇯🇵", tld: ".jp" },
  { code: "CN", name: "China", flag: "🇨🇳", tld: ".cn" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", tld: ".br" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", tld: ".za" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", tld: ".sg" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", tld: ".hk" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", tld: ".my" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", tld: ".kr" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", tld: ".sa" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", tld: ".eg" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", tld: ".ke" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", tld: ".gh" },
];

const currencies: Record<string, { code: string; symbol: string }> = {
  US: { code: "USD", symbol: "$" }, GB: { code: "GBP", symbol: "£" },
  CA: { code: "CAD", symbol: "CA$" }, AU: { code: "AUD", symbol: "A$" },
  NG: { code: "NGN", symbol: "₦" }, DE: { code: "EUR", symbol: "€" },
  FR: { code: "EUR", symbol: "€" }, AE: { code: "AED", symbol: "د.إ" },
  IN: { code: "INR", symbol: "₹" }, JP: { code: "JPY", symbol: "¥" },
  CN: { code: "CNY", symbol: "¥" }, BR: { code: "BRL", symbol: "R$" },
  ZA: { code: "ZAR", symbol: "R" }, SG: { code: "SGD", symbol: "S$" },
  HK: { code: "HKD", symbol: "HK$" }, MY: { code: "MYR", symbol: "RM" },
  KR: { code: "KRW", symbol: "₩" }, SA: { code: "SAR", symbol: "﷼" },
  EG: { code: "EGP", symbol: "E£" }, KE: { code: "KES", symbol: "KSh" },
  GH: { code: "GHS", symbol: "GH₵" },
};

const taxConfig: Record<string, { rate: number; label: string; inclusive: boolean }> = {
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

const themes = [
  {
    id: "default", name: "Kauvex Default", tag: "Marketplace",
    colors: ["#0A1628","#FF6B00","#F8F9FA"],
    desc: "Full-featured marketplace with classic header and detailed footer. Best for general stores.",
    features: ["Full-width", "Classic header", "Standard cards", "Detailed footer"],
  },
  {
    id: "light", name: "Kauvex Light", tag: "Clean",
    colors: ["#FFFFFF","#FF6B00","#FFFFFF"],
    desc: "Clean, minimal design with a light aesthetic. Perfect for modern brands.",
    features: ["Full-width", "Minimal header", "Standard cards", "Compact footer"],
  },
  {
    id: "dark", name: "Kauvex Dark", tag: "Premium",
    colors: ["#1A1A2E","#FF6B00","#0F0F1A"],
    desc: "Bold dark theme that gives a premium, sophisticated feel.",
    features: ["Full-width", "Classic header", "Standard cards", "Dark footer"],
  },
  {
    id: "b2b", name: "B2B Pro", tag: "Corporate",
    colors: ["#003366","#00A3E0","#F5F7FA"],
    desc: "Corporate B2B layout with list product cards and compact design.",
    features: ["Contained", "Corporate header", "List cards", "Compact footer"],
  },
  {
    id: "fashion", name: "Fashion Boutique", tag: "Boutique",
    colors: ["#1A1A1A","#E91E63","#FAFAFA"],
    desc: "Elegant fashion store with large image cards and centered header.",
    features: ["Full-width", "Centered header", "Large images", "Detailed footer"],
  },
  {
    id: "electronics", name: "Electronics Hub", tag: "Tech",
    colors: ["#0D1117","#58A6FF","#F0F6FC"],
    desc: "Tech-focused layout ideal for electronics and gadgets.",
    features: ["Full-width", "Classic header", "Standard cards", "Dark footer"],
  },
  {
    id: "luxury", name: "Luxury", tag: "High-End",
    colors: ["#1C1C1C","#C9A84C","#FFFFFF"],
    desc: "High-end luxury storefront with elegant typography and refined spacing.",
    features: ["Contained", "Centered header", "Elegant cards", "Minimal footer"],
  },
  {
    id: "minimal", name: "Minimal Store", tag: "Simple",
    colors: ["#2D3748","#4A5568","#FFFFFF"],
    desc: "Simple, distraction-free shopping experience focused on products.",
    features: ["Contained", "Minimal header", "Standard cards", "Compact footer"],
  },
];

const demoCategories = [
  { id: "electronics", name: "Electronics", icon: "🔌", count: "12,450", subs: 8 },
  { id: "fashion", name: "Fashion", icon: "👗", count: "8,230", subs: 6 },
  { id: "marine", name: "Marine", icon: "🚤", count: "3,150", subs: 5 },
  { id: "industrial", name: "Industrial", icon: "🏭", count: "5,670", subs: 7 },
  { id: "automotive", name: "Automotive", icon: "🚗", count: "4,890", subs: 5 },
  { id: "ict", name: "ICT", icon: "💻", count: "6,340", subs: 4 },
  { id: "home", name: "Home & Living", icon: "🏠", count: "9,120", subs: 6 },
  { id: "beauty", name: "Beauty & Health", icon: "💄", count: "7,560", subs: 5 },
  { id: "sports", name: "Sports & Outdoors", icon: "⚽", count: "3,780", subs: 4 },
  { id: "toys", name: "Toys & Kids", icon: "🧸", count: "2,340", subs: 3 },
  { id: "books", name: "Books & Media", icon: "📚", count: "4,120", subs: 4 },
  { id: "grocery", name: "Grocery", icon: "🛒", count: "1,890", subs: 3 },
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

type Step = "type" | "info" | "domain" | "theme" | "content" | "review";

export default function CreateStorefrontWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("type");
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [domainSearch, setDomainSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    domainName: "",
    countryCode: "US",
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
  const currency = currencies[form.countryCode] || { code: "USD", symbol: "$" };
  const tax = taxConfig[form.countryCode] || { rate: 0, label: "VAT", inclusive: false };

  const getActiveDomain = () => {
    if (form.domainType === "tld") return `${form.domainName}${form.selectedTld}`;
    if (form.domainType === "subdomain") return `${form.subdomain || form.domainName}.kauvex.com`;
    return form.customDomain;
  };

  const handleCreate = async () => {
    setSaving(true);
    const domain = getActiveDomain();
    const base = form.domainName.toLowerCase().replace(/[^a-z0-9-]+/g, "");
    const slug = form.domainType === "tld"
      ? `${base}-${form.selectedTld.replace(/^\./, "")}`
      : base;

    const payload: any = {
      name: form.name || form.domainName,
      slug,
      domain_type: form.domainType === "tld" ? "subdomain" : form.domainType,
      subdomain: form.domainType === "subdomain" ? (form.subdomain || form.domainName) : null,
      custom_domain: form.domainType === "custom" ? form.customDomain : null,
      active_domain: domain,
      currency_code: currency.code,
      currency_symbol: currency.symbol,
      country_code: form.countryCode,
      tax_rate: tax.rate,
      tax_label: tax.label,
      tax_inclusive: tax.inclusive,
      status: "active",
    };

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const res = await fetch("/api/admin/storefronts/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ payload, categories: form.categories, vendors: form.vendors }),
    });
    const json = await res.json();
    if (!res.ok) { setSaving(false); alert("Failed: " + (json.error || "Unknown error")); return; }

    const storefrontId = json.data?.[0]?.id;
    if (!storefrontId) { setSaving(false); return; }

    setCreatedId(storefrontId);
    setSaving(false);
  };

  const canProceed = () => {
    switch (step) {
      case "type": return form.domainType.length > 0;
      case "info": return form.domainName.length >= 2;
      case "domain": return getActiveDomain().length > 0;
      case "theme": return form.themeId.length > 0;
      case "content": return true;
      default: return true;
    }
  };

  const steps: { key: Step; label: string; desc: string; icon: React.ElementType }[] = [
    { key: "type", label: "Type", desc: "Domain type", icon: Globe },
    { key: "info", label: "Domain Name", desc: "Your domain", icon: ExternalLink },
    { key: "domain", label: "Region", desc: "Country & tax", icon: MapPin },
    { key: "theme", label: "Template", desc: "Design", icon: Palette },
    { key: "content", label: "Content", desc: "Categories", icon: FolderTree },
    { key: "review", label: "Launch", desc: "Review", icon: Sparkles },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);
  const nextStep = () => {
    const idx = steps.findIndex(s => s.key === step);
    if (idx < steps.length - 1) setStep(steps[idx + 1].key);
  };
  const prevStep = () => {
    const idx = steps.findIndex(s => s.key === step);
    if (idx > 0) setStep(steps[idx - 1].key);
  };

  const filteredTlds = countries.filter(c =>
    c.tld.includes(domainSearch.toLowerCase()) ||
    c.name.toLowerCase().includes(domainSearch.toLowerCase()) ||
    c.flag.includes(domainSearch)
  );

  if (createdId) {
    return (
      <AdminShell title="Storefront Created" subtitle="Your new storefront is ready">
        <div className="max-w-lg mx-auto text-center py-12 space-y-5">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="font-bold text-2xl text-text-1">Storefront Created!</h2>
          <p className="text-sm text-text-4">
            <strong className="text-text-1">{form.name || form.domainName}</strong> is now live at <br />
            <span className="text-orange font-mono font-bold text-lg">{getActiveDomain()}</span>
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <button onClick={() => router.push(`/admin/storefronts/${createdId}`)}
              className="h-10 px-6 bg-orange text-white text-sm font-semibold rounded-lg hover:bg-orange/90">
              Configure Storefront
            </button>
            <button onClick={() => router.push("/admin/storefronts")}
              className="h-10 px-6 border border-border text-text-2 text-sm font-medium rounded-lg hover:bg-gray-50">
              All Storefronts
            </button>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Create Storefront" subtitle="Set up a new regional or custom storefront">
      <div className="max-w-4xl mx-auto">
        {/* Step indicator — horizontal steps */}
        <div className="bg-white rounded-xl border border-border mb-6 p-4">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = s.key === step;
              const isPast = currentStepIndex > i;
              const isFuture = currentStepIndex < i;
              return (
                <div key={s.key} className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => isPast && setStep(s.key)}
                    disabled={isFuture}
                    className={`flex items-center gap-2 min-w-0 ${isFuture ? "opacity-40 cursor-default" : isPast ? "cursor-pointer" : ""}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isActive ? "bg-orange text-white shadow-md" :
                      isPast ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-text-4"
                    }`}>
                      {isPast ? <Check size={12} /> : i + 1}
                    </div>
                    <div className="min-w-0 hidden sm:block">
                      <p className={`text-[10px] font-semibold leading-tight ${isActive ? "text-orange" : isPast ? "text-green-700" : "text-text-4"}`}>{s.label}</p>
                      <p className="text-[8px] text-text-4 truncate">{s.desc}</p>
                    </div>
                  </button>
                  {i < steps.length - 1 && <div className={`flex-1 h-px ${isPast ? "bg-green-300" : "bg-gray-200"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== STEP 1: DOMAIN TYPE ===== */}
        {step === "type" && (
          <div className="bg-white rounded-xl border border-border p-6 space-y-5">
            <div>
              <h2 className="font-bold text-lg text-text-1">Choose your domain type</h2>
              <p className="text-sm text-text-4">How do you want your storefront to be accessed?</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  key: "tld" as const,
                  title: "Country Domain",
                  subtitle: "yourstore.com / .uk / .ca",
                  desc: "Pick a country extension like .com, .uk, .ca, .ng. Best for regional stores.",
                  icon: Globe,
                  color: "bg-blue-50 text-blue",
                },
                {
                  key: "subdomain" as const,
                  title: "Subdomain",
                  subtitle: "store.kauvex.com",
                  desc: "Your store as a subdomain on kauvex.com. Fastest setup, no DNS needed.",
                  icon: Monitor,
                  color: "bg-purple-50 text-purple-700",
                },
                {
                  key: "custom" as const,
                  title: "Custom Domain",
                  subtitle: "yourdomain.com",
                  desc: "Use your own domain name. Requires DNS configuration to point to Kauvex.",
                  icon: ExternalLink,
                  color: "bg-green-50 text-green-700",
                },
              ].map(opt => (
                <button key={opt.key} onClick={() => { update("domainType", opt.key); }}
                  className={`rounded-xl border-2 p-5 text-left transition-all hover:shadow-md ${
                    form.domainType === opt.key ? "border-orange bg-orange-50 ring-2 ring-orange/20" : "border-border"
                  }`}>
                  <div className={`w-10 h-10 rounded-xl ${opt.color} flex items-center justify-center mb-3`}>
                    <opt.icon size={20} />
                  </div>
                  <p className="font-bold text-sm text-text-1">{opt.title}</p>
                  <p className="text-xs text-text-4 mt-1">{opt.subtitle}</p>
                  <p className="text-[10px] text-text-4 mt-2 leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>

            {form.domainType === "tld" && (
              <div className="bg-blue-50 border border-blue/20 rounded-xl p-3 flex items-start gap-2">
                <Info size={14} className="text-blue shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-800">Country domains work automatically with our infrastructure. Just choose your name and extension.</p>
              </div>
            )}
            {form.domainType === "custom" && (
              <div className="bg-amber-50 border border-amber/20 rounded-xl p-3 flex items-start gap-2">
                <HelpCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800">Custom domains need DNS records (A record or CNAME). We&apos;ll show you exactly what to configure.</p>
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 2: DOMAIN NAME ===== */}
        {step === "info" && (
          <div className="bg-white rounded-xl border border-border p-6 space-y-5">
            <div>
              <h2 className="font-bold text-lg text-text-1">Choose your domain name</h2>
              <p className="text-sm text-text-4">This will be your storefront&apos;s web address</p>
            </div>

            {/* Domain name input */}
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1.5">Your domain name</label>
              {form.domainType === "tld" && (
                <div className="flex items-center gap-2">
                  <input
                    value={form.domainName}
                    onChange={e => update("domainName", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="yourstore"
                    className="flex-1 h-11 px-4 text-lg font-mono rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                  />
                  <div className="relative">
                    <select value={form.selectedTld} onChange={e => {
                      update("selectedTld", e.target.value);
                      const c = countries.find(c => c.tld === e.target.value);
                      if (c) update("countryCode", c.code);
                    }}
                      className="h-11 px-3 pr-8 text-sm font-bold font-mono rounded-xl border border-border bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange/20">
                      {countries.map(c => <option key={c.tld} value={c.tld}>{c.tld}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
                  </div>
                </div>
              )}
              {form.domainType === "subdomain" && (
                <div className="flex items-center gap-2">
                  <input
                    value={form.subdomain || form.domainName}
                    onChange={e => update("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="yourstore"
                    className="h-11 px-4 text-lg font-mono rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange flex-1"
                  />
                  <span className="text-sm text-text-4 font-mono font-semibold">.kauvex.com</span>
                </div>
              )}
              {form.domainType === "custom" && (
                <input
                  value={form.customDomain}
                  onChange={e => update("customDomain", e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ""))}
                  placeholder="yourstore.com"
                  className="w-full h-11 px-4 text-lg font-mono rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                />
              )}
            </div>

            {/* Preview domain */}
            {form.domainName && (
              <div className="bg-gray-50 rounded-xl border border-border p-4">
                <p className="text-[10px] text-text-4 uppercase font-semibold tracking-wider mb-1">Your storefront URL</p>
                <p className="font-mono font-bold text-lg text-orange">
                  {getActiveDomain() || "—"}
                </p>
              </div>
            )}

            {form.domainType === "custom" && (
              <div className="bg-blue-50 border border-blue/20 rounded-xl p-3 flex items-start gap-2">
                <Shield size={14} className="text-blue shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-800">After creation, we&apos;ll provide DNS records to connect your domain. SSL via Let&apos;s Encrypt is automatic.</p>
              </div>
            )}

            {/* TLD picker (for tld type) */}
            {form.domainType === "tld" && (
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1.5">Or pick a country extension</label>
                <div className="relative mb-3">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                  <input value={domainSearch} onChange={e => setDomainSearch(e.target.value)} placeholder="Search countries or TLDs..."
                    className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20" />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto">
                  {filteredTlds.map(c => (
                    <button key={c.code} onClick={() => { update("selectedTld", c.tld); update("countryCode", c.code); }}
                      className={`flex items-center gap-1.5 p-2 rounded-lg border text-[10px] transition-all ${
                        form.selectedTld === c.tld ? "border-orange bg-orange-50 text-orange font-semibold" : "border-border hover:border-gray-300 text-text-2"
                      }`}>
                      <span>{c.flag}</span>
                      <span className="font-bold">{c.tld}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== STEP 3: REGION ===== */}
        {step === "domain" && (
          <div className="bg-white rounded-xl border border-border p-6 space-y-5">
            <div>
              <h2 className="font-bold text-lg text-text-1">Region & Localization</h2>
              <p className="text-sm text-text-4">Currency, tax rates, and regional settings</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Country / Region</label>
                <div className="relative">
                  <select value={form.countryCode} onChange={e => update("countryCode", e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-xl border border-border bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange/20 pr-8">
                    {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Domain Extension</label>
                <div className="relative">
                  <select value={form.selectedTld} onChange={e => {
                    update("selectedTld", e.target.value);
                    const c = countries.find(c => c.tld === e.target.value);
                    if (c) update("countryCode", c.code);
                  }} className="w-full h-10 px-3 text-sm font-bold rounded-xl border border-border bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange/20 pr-8">
                    {countries.map(c => <option key={c.tld} value={c.tld}>{c.flag} {c.tld}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-text-3 mb-3">Auto-configured for {country?.flag} {country?.name}</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 border border-border">
                  <p className="text-[9px] text-text-4 uppercase font-semibold">Currency</p>
                  <p className="text-lg font-bold text-text-1">{currency.symbol} <span className="text-sm font-mono">{currency.code}</span></p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-border">
                  <p className="text-[9px] text-text-4 uppercase font-semibold">Tax Rate</p>
                  <p className="text-lg font-bold text-text-1">{tax.rate}% <span className="text-sm font-mono text-text-4">{tax.label}</span></p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-border">
                  <p className="text-[9px] text-text-4 uppercase font-semibold">Tax Type</p>
                  <p className="text-lg font-bold text-text-1">{tax.inclusive ? "Inclusive" : "Exclusive"}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green/20 rounded-xl p-3 flex items-start gap-2">
              <CheckCircle2 size={14} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-green-800">Regional settings are pre-configured for <strong>{country?.name}</strong>. You can change these anytime in storefront settings.</p>
            </div>
          </div>
        )}

        {/* ===== STEP 4: THEME ===== */}
        {step === "theme" && (
          <div className="bg-white rounded-xl border border-border p-6 space-y-5">
            <div>
              <h2 className="font-bold text-lg text-text-1">Choose a template</h2>
              <p className="text-sm text-text-4">Your storefront&apos;s look and feel — you can change this later</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {themes.map((theme) => {
                const selected = form.themeId === theme.id;
                return (
                  <button key={theme.id} onClick={() => update("themeId", theme.id)}
                    className={`rounded-xl border-2 p-3 text-left transition-all hover:shadow-md ${
                      selected ? "border-orange ring-2 ring-orange/20" : "border-border"
                    }`}>
                    {/* Mini preview */}
                    <div className="h-16 rounded-lg mb-2 overflow-hidden border border-border" style={{ backgroundColor: theme.colors[2] }}>
                      <div className="h-3 flex items-center px-1.5 gap-0.5" style={{ backgroundColor: theme.colors[0] }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colors[1] }} />
                        <div className="w-1 h-1 rounded-full bg-white/30" />
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        <div className="flex gap-0.5">
                          <div className="w-3 h-1 rounded" style={{ backgroundColor: theme.colors[1] }} />
                          <div className="w-1.5 h-1 rounded bg-gray-200" />
                        </div>
                        <div className="w-full h-1 rounded bg-gray-200/60" />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="flex gap-0.5">
                        {theme.colors.map((c, i) => (
                          <div key={i} className="w-2.5 h-2.5 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <span className={`text-[10px] bg-gray-100 text-text-4 px-1 rounded font-medium ${selected ? "bg-orange-50 text-orange" : ""}`}>{theme.tag}</span>
                    </div>
                    <p className={`text-xs font-bold ${selected ? "text-orange" : "text-text-1"}`}>{theme.name}</p>
                    <p className="text-[9px] text-text-4 mt-0.5 leading-relaxed">{theme.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== STEP 5: CONTENT ===== */}
        {step === "content" && (
          <div className="bg-white rounded-xl border border-border p-6 space-y-5">
            <div>
              <h2 className="font-bold text-lg text-text-1">Categories & Vendors</h2>
              <p className="text-sm text-text-4">Choose what content appears on this storefront</p>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-text-2">Categories</label>
                <span className="text-[10px] text-text-4">{form.categories.length} selected</span>
              </div>
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
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium text-text-1">{cat.name}</p>
                        <p className="text-[8px] text-text-4">{cat.count} products · {cat.subs} subcategories</p>
                      </div>
                      {selected && <Check size={11} className="text-orange shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <div className="bg-blue-50 border border-blue/20 rounded-lg p-2.5 flex items-start gap-1.5 mt-2">
                <Info size={11} className="text-blue shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-800">All subcategories and their products will be available on this storefront automatically.</p>
              </div>
            </div>

            {/* Vendors */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-text-2">Vendors</label>
                <span className="text-[10px] text-text-4">{form.vendors.length} selected</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoVendors.map(v => {
                  const selected = form.vendors.includes(v.id);
                  return (
                    <button key={v.id} onClick={() => {
                      update("vendors", selected ? form.vendors.filter(x => x !== v.id) : [...form.vendors, v.id]);
                    }} className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs transition-all ${
                      selected ? "border-orange bg-orange-50" : "border-border hover:border-gray-300"
                    }`}>
                      <div className="w-7 h-7 rounded-full bg-blue/10 flex items-center justify-center text-blue text-[10px] font-bold shrink-0">{v.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-text-1">{v.name}</p>
                        <p className="text-[9px] text-text-4">{v.products} products · ⭐ {v.rating}</p>
                      </div>
                      {selected && <Check size={13} className="text-orange shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 6: REVIEW ===== */}
        {step === "review" && (
          <div className="bg-white rounded-xl border border-border p-6 space-y-5">
            <div>
              <h2 className="font-bold text-lg text-text-1">Review & Launch</h2>
              <p className="text-sm text-text-4">Check everything looks right before going live</p>
            </div>

            <div className="bg-gray-50 rounded-xl border border-border divide-y divide-border">
              {[
                { label: "Domain", value: getActiveDomain() },
                { label: "Name", value: form.name || form.domainName },
                { label: "Country", value: country ? `${country.flag} ${country.name} ${country.tld}` : "" },
                { label: "Currency", value: `${currency.symbol} ${currency.code}` },
                { label: "Tax", value: `${tax.rate}% ${tax.label} (${tax.inclusive ? "inclusive" : "exclusive"})` },
                { label: "Template", value: themes.find(t => t.id === form.themeId)?.name || "" },
                { label: "Categories", value: `${form.categories.length} selected (subcategories included)` },
                { label: "Vendors", value: `${form.vendors.length} selected` },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-text-4">{item.label}</span>
                  <span className="font-semibold text-text-1 text-right">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-green-50 border border-green/20 rounded-xl p-4 flex items-start gap-3">
              <Sparkles size={16} className="text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Ready to launch</p>
                <p className="text-xs text-green-700 mt-1">Your storefront will be created and available at <strong>{getActiveDomain()}</strong> immediately. You can modify all settings later.</p>
              </div>
            </div>

            <button onClick={handleCreate} disabled={saving}
              className="w-full h-12 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <>Launch Storefront <Sparkles size={16} /></>}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={prevStep} disabled={currentStepIndex === 0}
            className="flex items-center gap-1.5 h-9 px-4 text-xs font-medium text-text-3 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30">
            <ArrowLeft size={13} /> Back
          </button>
          {step !== "review" && (
            <button onClick={nextStep} disabled={!canProceed()}
              className="flex items-center gap-1.5 h-9 px-5 bg-orange text-white text-xs font-semibold rounded-lg hover:bg-orange/90 transition-colors disabled:opacity-50">
              Continue <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
