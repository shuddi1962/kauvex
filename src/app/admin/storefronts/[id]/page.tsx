"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/admin-shell";
import {
  Globe, MapPin, Home, CreditCard, Truck, Store, Save,
  ArrowLeft, ChevronDown, ToggleLeft, ToggleRight, Image,
  ExternalLink, CheckCircle2, Info, Check, Search, Copy,
  Palette, Layout, Sparkles, Shield, Settings,
  DollarSign, Package, Users, Eye, EyeOff, X, Plus,
  Monitor, Smartphone, Tablet, ChevronRight,
  HelpCircle, AlertTriangle, FolderTree, Star,
} from "lucide-react";
import { insforge } from "@/lib/insforge";

type SectionKey = "general" | "domain" | "region" | "homepage" | "theme" | "vendors" | "payments" | "shipping";

const sections: { key: SectionKey; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "general", label: "General", icon: Settings, desc: "Name, status, meta" },
  { key: "domain", label: "Domain & DNS", icon: Globe, desc: "Domain, DNS records, SSL" },
  { key: "region", label: "Regional", icon: MapPin, desc: "Currency, tax, language" },
  { key: "homepage", label: "Homepage", icon: Home, desc: "Banners, featured products" },
  { key: "theme", label: "Theme", icon: Palette, desc: "Template, colors, fonts" },
  { key: "vendors", label: "Vendors", icon: Users, desc: "Assigned vendors" },
  { key: "payments", label: "Payments", icon: CreditCard, desc: "Payment gateways" },
  { key: "shipping", label: "Shipping", icon: Truck, desc: "Shipping methods" },
];

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
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
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
  { code: "hi", name: "Hindi" },
];

const countries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
];

export default function EditStorefrontPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeSection, setActiveSection] = useState<SectionKey>("general");
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
    await insforge.database.from("storefronts").update({
      name: form.name, slug: form.slug,
      domain_type: form.domainType, active_domain: form.activeDomain,
      currency_code: form.currencyCode, currency_symbol: form.currencySymbol,
      language_code: form.languageCode, country_code: form.countryCode,
      tax_rate: form.taxRate, tax_label: form.taxLabel,
      tax_inclusive: form.taxInclusive, is_default: form.isDefault,
      status: form.active ? "active" : "inactive",
      meta_title: form.metaTitle, meta_description: form.metaDescription,
    }).eq("id", id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const domainLabel = form.domainType === "subdomain"
    ? `${form.slug}.kauvex.com`
    : form.activeDomain || "custom-domain.com";

  const country = countries.find(c => c.code === form.countryCode);

  if (loading) {
    return (
      <AdminShell title="Loading..." subtitle="Fetching storefront data">
        <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-orange border-t-transparent rounded-full" /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={form.name || "Storefront"} subtitle={domainLabel}>
      <div className="flex gap-6 max-w-7xl mx-auto">
        {/* Settings Sidebar */}
        <div className="w-52 shrink-0 space-y-1">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.key;
            return (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                  isActive ? "bg-orange-50 text-orange font-semibold shadow-sm" : "text-text-3 hover:bg-gray-50 hover:text-text-1"
                }`}
              >
                <Icon size={15} className={isActive ? "text-orange" : "text-text-4"} />
                <div className="min-w-0">
                  <p className="text-xs leading-tight">{sec.label}</p>
                  <p className="text-[9px] text-text-4 truncate">{sec.desc}</p>
                </div>
              </button>
            );
          })}

          <div className="pt-4 border-t border-border mt-4">
            <button onClick={handleSave}
              className={`w-full h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                saved ? "bg-green-600 text-white" : "bg-orange text-white hover:bg-orange/90"
              }`}>
              <Save size={13} />
              {saved ? "Saved!" : "Save Changes"}
            </button>

            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-gray-50">
              <div className={`w-2 h-2 rounded-full ${form.active ? "bg-green-500" : "bg-gray-300"}`} />
              <span className="text-[10px] font-medium text-text-4">{form.active ? "Active" : "Inactive"}</span>
              <button onClick={() => update("active", !form.active)} className="ml-auto">
                {form.active ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} className="text-text-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* ===== GENERAL ===== */}
          {activeSection === "general" && (
            <div className="bg-white rounded-xl border border-border p-5 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <Settings size={16} className="text-orange" />
                <h3 className="font-bold text-base text-text-1">General Settings</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-text-2 block mb-1">Storefront Name</label>
                  <input value={form.name} onChange={e => update("name", e.target.value)}
                    className="w-full h-9 px-3 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-text-2 block mb-1">URL Slug</label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-text-4 font-mono">kauvex.com/</span>
                    <input value={form.slug} onChange={e => update("slug", e.target.value)}
                      className="flex-1 h-9 px-3 text-sm font-mono rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-text-2 block mb-1">Meta Title</label>
                  <input value={form.metaTitle} onChange={e => update("metaTitle", e.target.value)}
                    className="w-full h-9 px-3 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-text-2 block mb-1">Default Storefront</label>
                  <label className="flex items-center gap-2.5 h-9 px-3 rounded-lg border border-border cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" checked={form.isDefault} onChange={e => update("isDefault", e.target.checked)}
                      className="rounded accent-orange w-4 h-4" />
                    <span className="text-xs text-text-2">Set as default storefront</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-2 block mb-1">Meta Description</label>
                <textarea value={form.metaDescription} onChange={e => update("metaDescription", e.target.value)}
                  rows={3} className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20 resize-none" />
              </div>

              <div className="bg-blue-50 border border-blue/20 rounded-xl p-3 flex items-start gap-2">
                <Info size={14} className="text-blue shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-800">This storefront is available at <strong>{domainLabel}</strong>. Changes to meta data may take a few minutes to reflect in search engines.</p>
              </div>
            </div>
          )}

          {/* ===== DOMAIN & DNS ===== */}
          {activeSection === "domain" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-border p-5 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                  <Globe size={16} className="text-orange" />
                  <h3 className="font-bold text-base text-text-1">Domain Configuration</h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-xl p-4 text-center border border-green/20">
                    <CheckCircle2 size={20} className="mx-auto text-green-600 mb-1" />
                    <p className="text-lg font-bold text-green-700">Active</p>
                    <p className="text-[9px] text-green-600">Domain</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue/20">
                    <CheckCircle2 size={20} className="mx-auto text-blue mb-1" />
                    <p className="text-lg font-bold text-blue-700">Active</p>
                    <p className="text-[9px] text-blue-600">SSL</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber/20">
                    <Info size={20} className="mx-auto text-amber-600 mb-1" />
                    <p className="text-lg font-bold text-amber-700">Pending</p>
                    <p className="text-[9px] text-amber-600">DNS Verify</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-blue" />
                    <span className="text-sm font-mono font-semibold text-text-1">{form.activeDomain || "—"}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${form.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-text-4"}`}>
                      {form.active ? "Live" : "Inactive"}
                    </span>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(form.activeDomain || "")}
                    className="p-1.5 hover:bg-gray-200 rounded-lg">
                    <Copy size={13} className="text-text-4" />
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-2 block mb-2">Domain Type</label>
                  <div className="flex gap-3">
                    {[
                      { key: "subdomain" as const, label: "Subdomain", desc: `${form.slug}.kauvex.com` },
                      { key: "custom_domain" as const, label: "Custom Domain", desc: "yourdomain.com" },
                    ].map(opt => (
                      <label key={opt.key} className={`flex-1 flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        form.domainType === opt.key ? "border-orange bg-orange-50" : "border-border hover:border-gray-300"
                      }`}>
                        <input type="radio" name="domainType" checked={form.domainType === opt.key}
                          onChange={() => update("domainType", opt.key)} className="accent-orange" />
                        <div>
                          <p className="text-sm font-medium text-text-1">{opt.label}</p>
                          <p className="text-[10px] text-text-4">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {form.domainType === "custom_domain" && (
                  <div>
                    <label className="text-[11px] font-semibold text-text-2 block mb-1">Custom Domain</label>
                    <input value={form.activeDomain} onChange={e => update("activeDomain", e.target.value)}
                      placeholder="yourdomain.com" className="w-full h-9 px-3 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20" />
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-border p-5 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                  <Shield size={16} className="text-orange" />
                  <h3 className="font-bold text-base text-text-1">DNS Records</h3>
                </div>
                <p className="text-xs text-text-4">Add these records at your DNS provider</p>

                <div className="bg-gray-50 rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-gray-100">
                      <th className="p-2.5 text-left font-semibold text-text-4">Type</th>
                      <th className="p-2.5 text-left font-semibold text-text-4">Name</th>
                      <th className="p-2.5 text-left font-semibold text-text-4">Value</th>
                      <th className="p-2.5 text-left font-semibold text-text-4">TTL</th>
                    </tr></thead>
                    <tbody>
                      {[
                        { type: "A", name: "@", value: "76.76.21.21", ttl: "3600" },
                        { type: "A", name: "@", value: "76.76.21.22", ttl: "3600" },
                        { type: "CNAME", name: "www", value: "kauvex.com", ttl: "3600" },
                        { type: "TXT", name: "@", value: `kauvex-verify=${id.slice(0,8)}`, ttl: "3600" },
                      ].map(r => (
                        <tr key={r.type + r.name} className="border-t border-border">
                          <td className="p-2.5 font-mono text-orange font-semibold">{r.type}</td>
                          <td className="p-2.5 font-mono">{r.name}</td>
                          <td className="p-2.5 font-mono text-blue">
                            {r.value}
                            <button onClick={() => navigator.clipboard.writeText(r.value)} className="ml-1.5 p-0.5 hover:bg-gray-200 rounded inline-flex align-middle">
                              <Copy size={9} className="text-text-4" />
                            </button>
                          </td>
                          <td className="p-2.5 text-text-4">{r.ttl}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-text-2 mb-2">Alternative: Nameserver Setup</p>
                  <p className="text-xs text-text-4 mb-2">Replace your nameservers with Kauvex managed</p>
                  <div className="flex flex-wrap gap-2">
                    {["ns1.kauvex.com", "ns2.kauvex.com", "ns3.kauvex.com"].map(ns => (
                      <code key={ns} className="text-[11px] bg-gray-100 px-2.5 py-1 rounded-lg font-mono text-blue border border-border">{ns}</code>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== REGIONAL ===== */}
          {activeSection === "region" && (
            <div className="bg-white rounded-xl border border-border p-5 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <MapPin size={16} className="text-orange" />
                <h3 className="font-bold text-base text-text-1">Regional Configuration</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-text-2 block mb-1">Currency</label>
                  <div className="relative">
                    <select value={form.currencyCode} onChange={e => {
                      const cur = currencies.find(c => c.code === e.target.value);
                      update("currencyCode", e.target.value);
                      if (cur) update("currencySymbol", cur.symbol);
                    }} className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange/20 pr-8">
                      {currencies.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-text-2 block mb-1">Language</label>
                  <div className="relative">
                    <select value={form.languageCode} onChange={e => update("languageCode", e.target.value)}
                      className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange/20 pr-8">
                      {languages.map(l => <option key={l.code} value={l.code}>{l.name} ({l.code})</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-2 block mb-1">Country</label>
                <div className="relative">
                  <select value={form.countryCode} onChange={e => update("countryCode", e.target.value)}
                    className="w-full h-9 px-3 text-sm rounded-lg border border-border bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-orange/20 pr-8">
                    {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-text-2 block mb-1">Tax Rate (%)</label>
                  <input type="number" step="0.1" value={form.taxRate} onChange={e => update("taxRate", parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-text-2 block mb-1">Tax Label</label>
                  <input value={form.taxLabel} onChange={e => update("taxLabel", e.target.value)}
                    className="w-full h-9 px-3 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.taxInclusive} onChange={e => update("taxInclusive", e.target.checked)}
                      className="accent-orange w-4 h-4" />
                    <span className="text-xs text-text-2">Tax inclusive</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ===== HOMEPAGE ===== */}
          {activeSection === "homepage" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border mb-4">
                  <Home size={16} className="text-orange" />
                  <h3 className="font-bold text-base text-text-1">Homepage Content</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-orange/40 transition-colors cursor-pointer group">
                    <Image size={28} className="mx-auto text-text-4 mb-2 group-hover:text-orange" />
                    <p className="text-sm font-semibold text-text-2">Banner Manager</p>
                    <p className="text-[10px] text-text-4 mt-1">Upload homepage hero banners</p>
                  </div>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-orange/40 transition-colors cursor-pointer group">
                    <Star size={28} className="mx-auto text-text-4 mb-2 group-hover:text-orange" />
                    <p className="text-sm font-semibold text-text-2">Featured Products</p>
                    <p className="text-[10px] text-text-4 mt-1">Select products to feature</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-bold text-sm text-text-1 mb-3">Homepage Sections</h3>
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange/20">
                  <Sparkles size={14} className="text-orange" />
                  <p className="text-xs text-text-2">Manage sections via <strong className="text-orange">Homepage Builder</strong></p>
                  <button onClick={() => router.push("/admin/homepage")} className="ml-auto text-xs text-orange font-semibold hover:underline">Open</button>
                </div>
              </div>
            </div>
          )}

          {/* ===== THEME ===== */}
          {activeSection === "theme" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border mb-4">
                  <Palette size={16} className="text-orange" />
                  <h3 className="font-bold text-base text-text-1">Storefront Template</h3>
                  <span className="text-[9px] bg-orange-50 text-orange px-1.5 py-0.5 rounded-full font-medium ml-auto">8 Templates</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { id: "default", name: "Kauvex Default", colors: ["#0A1628","#FF6B00","#F8F9FA"], layout: "Marketplace", popular: true },
                    { id: "light", name: "Kauvex Light", colors: ["#FFFFFF","#FF6B00","#FFFFFF"], layout: "Clean", popular: false },
                    { id: "dark", name: "Kauvex Dark", colors: ["#1A1A2E","#FF6B00","#0F0F1A"], layout: "Premium", popular: false },
                    { id: "b2b", name: "B2B Pro", colors: ["#003366","#00A3E0","#F5F7FA"], layout: "Corporate", popular: false },
                    { id: "fashion", name: "Fashion", colors: ["#1A1A1A","#E91E63","#FAFAFA"], layout: "Boutique", popular: false },
                    { id: "electronics", name: "Electronics", colors: ["#0D1117","#58A6FF","#F0F6FC"], layout: "Tech", popular: false },
                    { id: "luxury", name: "Luxury", colors: ["#1C1C1C","#C9A84C","#FFFFFF"], layout: "Premium", popular: false },
                    { id: "minimal", name: "Minimal", colors: ["#2D3748","#4A5568","#FFFFFF"], layout: "Simple", popular: false },
                  ].map(t => (
                    <button key={t.id} className="rounded-xl border border-border p-3 text-left hover:shadow-md hover:border-orange/30 transition-all group">
                      {/* Mini preview */}
                      <div className="h-20 rounded-lg mb-2 overflow-hidden border border-border relative" style={{ backgroundColor: t.colors[2] }}>
                        <div className="h-4 flex items-center px-2 gap-1" style={{ backgroundColor: t.colors[0] }}>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.colors[1] }} />
                          <div className="w-1 h-1 rounded-full bg-white/30" />
                          <div className="w-2 h-1 rounded bg-white/20 ml-auto" />
                        </div>
                        <div className="p-2 space-y-1">
                          <div className="flex gap-1">
                            <div className="w-4 h-2 rounded" style={{ backgroundColor: t.colors[1] }} />
                            <div className="w-2 h-2 rounded bg-gray-200" />
                            <div className="w-3 h-2 rounded bg-gray-200" />
                          </div>
                          <div className="w-full h-1.5 rounded bg-gray-200" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                          {t.colors.map((c, i) => (
                            <div key={i} className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <span className="text-[10px] font-semibold text-text-1">{t.name}</span>
                        {t.popular && <span className="text-[7px] bg-orange-50 text-orange px-1 rounded-full font-bold">POP</span>}
                      </div>
                      <p className="text-[9px] text-text-4 mt-0.5">{t.layout}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-border p-5 space-y-4">
                <h3 className="font-bold text-sm text-text-1">Custom Colors</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Primary", key: "primary", color: "#0A1628" },
                    { label: "Accent", key: "accent", color: "#FF6B00" },
                    { label: "Background", key: "background", color: "#F8F9FA" },
                    { label: "Text", key: "text", color: "#1A1A2E" },
                  ].map(c => (
                    <div key={c.key}>
                      <label className="text-[10px] font-semibold text-text-2 block mb-1">{c.label}</label>
                      <div className="flex items-center gap-2">
                        <input type="color" defaultValue={c.color} className="w-8 h-8 rounded-lg border border-border cursor-pointer" />
                        <input defaultValue={c.color} className="flex-1 h-8 px-2 text-[10px] font-mono rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-orange/20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== VENDORS ===== */}
          {activeSection === "vendors" && (
            <div className="bg-white rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <Users size={16} className="text-orange" />
                <h3 className="font-bold text-base text-text-1">Vendors</h3>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-border cursor-pointer hover:border-orange/30 transition-colors group">
                <Plus size={14} className="text-text-4 group-hover:text-orange" />
                <p className="text-xs text-text-4 group-hover:text-orange font-medium">Assign vendors to this storefront</p>
              </div>

              <div className="space-y-2">
                {[
                  { name: "TechWorld Ltd", products: 145, status: "approved", flag: "🇺🇸" },
                  { name: "FashionHub NG", products: 89, status: "approved", flag: "🇳🇬" },
                  { name: "Home Essentials", products: 234, status: "pending", flag: "🇮🇳" },
                ].map(v => (
                  <div key={v.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center text-blue text-xs font-bold">{v.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-text-1">{v.name} <span className="text-xs">{v.flag}</span></p>
                        <p className="text-[10px] text-text-4">{v.products} products</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${v.status === "approved" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== PAYMENTS ===== */}
          {activeSection === "payments" && (
            <div className="bg-white rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <CreditCard size={16} className="text-orange" />
                <h3 className="font-bold text-base text-text-1">Payment Gateways</h3>
              </div>

              <div className="space-y-2">
                {[
                  { name: "Stripe", desc: "Cards, Apple Pay, Google Pay", enabled: true },
                  { name: "PayPal", desc: "PayPal checkout", enabled: true },
                  { name: "Flutterwave", desc: "Card, bank, USSD, mobile money", enabled: true },
                  { name: "Bank Transfer", desc: "Manual bank deposit", enabled: true },
                  { name: "Cash on Delivery", desc: "Pay on delivery", enabled: true },
                  { name: "Crypto", desc: "BTC, ETH, USDT", enabled: false },
                ].map(gw => (
                  <div key={gw.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-semibold text-text-1">{gw.name}</p>
                      <p className="text-[10px] text-text-4">{gw.desc}</p>
                    </div>
                    <div className={`relative w-9 h-5 rounded-full transition-colors ${gw.enabled ? "bg-orange" : "bg-gray-200"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${gw.enabled ? "translate-x-4 left-0.5" : "translate-x-0.5 left-0"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== SHIPPING ===== */}
          {activeSection === "shipping" && (
            <div className="bg-white rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <Truck size={16} className="text-orange" />
                <h3 className="font-bold text-base text-text-1">Shipping Methods</h3>
              </div>

              <div className="space-y-2">
                {[
                  { name: "Standard", desc: "5-10 business days", rate: `${form.currencySymbol}5.99`, enabled: true },
                  { name: "Express", desc: "2-4 business days", rate: `${form.currencySymbol}14.99`, enabled: true },
                  { name: "Free Shipping", desc: `Orders over ${form.currencySymbol}50`, rate: "Free", enabled: true },
                  { name: "Next Day", desc: "Order before 2 PM", rate: `${form.currencySymbol}24.99`, enabled: false },
                  { name: "International", desc: "Worldwide", rate: "Calculated", enabled: false },
                ].map(m => (
                  <div key={m.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Truck size={15} className="text-text-4" />
                      <div>
                        <p className="text-sm font-semibold text-text-1">{m.name}</p>
                        <p className="text-[10px] text-text-4">{m.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-text-1">{m.rate}</span>
                      <div className={`relative w-9 h-5 rounded-full transition-colors ${m.enabled ? "bg-orange" : "bg-gray-200"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${m.enabled ? "translate-x-4 left-0.5" : "translate-x-0.5 left-0"}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
