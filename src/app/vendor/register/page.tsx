"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store, Mail, Lock, Eye, EyeOff, ChevronRight, ChevronLeft, Check, CheckCircle,
  User, Banknote, FileText, AlertCircle, Globe, Building2, ClipboardList, Phone,
  MapPin, Hash, BadgeCheck, Shield, Upload, Camera, Search, ArrowRight, Info,
} from "lucide-react";

const BUSINESS_TYPES = [
  { value: "individual", label: "Individual Seller" },
  { value: "registered_business", label: "Registered Business" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "distributor", label: "Distributor" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "retail", label: "Retail Seller" },
  { value: "dropship", label: "Dropship Seller" },
  { value: "service", label: "Service Vendor" },
];

const STOREFRONTS = [
  { id: "global", name: "Global Store", flag: "🌍", domain: "kauvex.com" },
  { id: "us", name: "United States", flag: "🇺🇸", domain: "kauvex.com" },
  { id: "uk", name: "United Kingdom", flag: "🇬🇧", domain: "kauvex.com/uk" },
  { id: "ca", name: "Canada", flag: "🇨🇦", domain: "kauvex.com/ca" },
  { id: "ng", name: "Nigeria", flag: "🇳🇬", domain: "kauvex.com/ng" },
  { id: "au", name: "Australia", flag: "🇦🇺", domain: "kauvex.com/au" },
  { id: "de", name: "Germany", flag: "🇩🇪", domain: "kauvex.com/de" },
  { id: "in", name: "India", flag: "🇮🇳", domain: "kauvex.com/in" },
  { id: "ae", name: "UAE", flag: "🇦🇪", domain: "kauvex.com/ae" },
  { id: "sg", name: "Singapore", flag: "🇸🇬", domain: "kauvex.com/sg" },
];

const COUNTRIES = [
  { code: "US", name: "United States" }, { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" }, { code: "AU", name: "Australia" },
  { code: "NG", name: "Nigeria" }, { code: "DE", name: "Germany" },
  { code: "FR", name: "France" }, { code: "AE", name: "UAE" },
  { code: "IN", name: "India" }, { code: "JP", name: "Japan" },
  { code: "CN", name: "China" }, { code: "BR", name: "Brazil" },
  { code: "ZA", name: "South Africa" }, { code: "SG", name: "Singapore" },
  { code: "KE", name: "Kenya" }, { code: "GH", name: "Ghana" },
];

interface FormData {
  email: string; password: string; confirmPassword: string; phone: string;
  businessName: string; legalBusinessName: string; storeName: string; storeSlug: string;
  businessType: string; country: string; state: string; city: string;
  businessAddress: string; taxId: string; governmentId: string;
  cacNumber: string; vatNumber: string;
  selectedStorefronts: string[];
  idType: string; idNumber: string;
  agreeTerms: boolean;
}

const initialFormData: FormData = {
  email: "", password: "", confirmPassword: "", phone: "",
  businessName: "", legalBusinessName: "", storeName: "", storeSlug: "",
  businessType: "", country: "", state: "", city: "",
  businessAddress: "", taxId: "", governmentId: "", cacNumber: "", vatNumber: "",
  selectedStorefronts: ["global"],
  idType: "passport", idNumber: "",
  agreeTerms: false,
};

const STEPS = [
  { key: "account", label: "Account", icon: Mail },
  { key: "business", label: "Business", icon: Building2 },
  { key: "storefronts", label: "Storefronts", icon: Globe },
  { key: "verification", label: "Verification", icon: Shield },
  { key: "review", label: "Review", icon: ClipboardList },
];

export default function VendorRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.email.trim()) e.email = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
      if (!form.password) e.password = "Required";
      else if (form.password.length < 8) e.password = "Min 8 characters";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
      if (!form.phone.trim()) e.phone = "Required";
    }
    if (step === 1) {
      if (!form.businessName.trim()) e.businessName = "Required";
      if (!form.legalBusinessName.trim()) e.legalBusinessName = "Required";
      if (!form.storeName.trim()) e.storeName = "Required";
      if (!form.storeSlug.trim()) e.storeSlug = "Required";
      if (!form.businessType) e.businessType = "Select a type";
      if (!form.country) e.country = "Select country";
      if (!form.state.trim()) e.state = "Required";
      if (!form.city.trim()) e.city = "Required";
      if (!form.businessAddress.trim()) e.businessAddress = "Required";
    }
    if (step === 3) {
      if (!form.idNumber.trim()) e.idNumber = "Required";
    }
    if (step === 4) {
      if (!form.agreeTerms) e.agreeTerms = "You must agree";
    }
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) setStep(s => Math.min(s + 1, 4)); };
  const handleBack = () => setStep(s => Math.max(s - 1, 0));
  const [apiError, setApiError] = useState("");

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitted(true);
    setApiError("");
    try {
      const res = await fetch("/api/v1/vendors/register-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          phone: form.phone,
          business_name: form.businessName,
          legal_business_name: form.legalBusinessName,
          store_name: form.storeName,
          store_slug: form.storeSlug,
          business_type: form.businessType,
          country: form.country,
          state: form.state,
          city: form.city,
          business_address: form.businessAddress,
          tax_id: form.taxId,
          government_id: form.governmentId,
          cac_number: form.cacNumber,
          vat_number: form.vatNumber,
          selected_storefronts: form.selectedStorefronts,
          id_type: form.idType,
          id_number: form.idNumber,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setApiError(json.error || "Registration failed");
        setSubmitted(false);
        return;
      }
      setTimeout(() => router.push("/vendor/login"), 2000);
    } catch {
      setApiError("Network error. Please try again.");
      setSubmitted(false);
    }
  };

  const inputCls = (key: string) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm text-text-1 placeholder:text-text-4 bg-white focus:outline-none focus:ring-2 transition-colors ${
      errors[key] ? "border-red-300 focus:ring-red-500/20" : "border-border focus:ring-orange-500/20"
    }`;

  const labelCls = "block text-sm font-medium text-text-2 mb-1.5";
  const fieldErr = (key: string) =>
    errors[key] ? <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={12} />{errors[key]}</p> : null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          {apiError ? (
            <>
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="font-bold text-2xl text-text-1 mb-2">Registration Failed</h2>
              <p className="text-text-4 text-sm mb-4">{apiError}</p>
              <button onClick={() => { setSubmitted(false); setApiError(""); }} className="px-6 py-2.5 rounded-lg bg-orange hover:bg-orange-600 text-white text-sm font-bold transition-all">
                Try Again
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="font-bold text-2xl text-text-1 mb-2">Account Created!</h2>
              <p className="text-text-4 text-sm">Your seller account has been created. Redirecting to login...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-[#0F1F3D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-orange rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange/30">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-bold text-2xl text-white mb-1">Become a KAUVEX Seller</h1>
          <p className="text-white/60 text-sm">Set up your seller account and start selling globally</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step; const done = i < step;
              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      done ? "bg-orange text-white" : active ? "bg-orange text-white ring-4 ring-orange/30" : "bg-white/10 text-white/40"
                    }`}>
                      {done ? <Check size={16} /> : <Icon size={16} />}
                    </div>
                    <span className={`text-xs mt-1.5 font-medium ${active ? "text-orange" : done ? "text-white/80" : "text-white/30"}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 mt-[-1.25rem] rounded-full ${done ? "bg-orange" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-strong border border-border p-8">
          <div className="mb-6">
            <h2 className="font-bold text-xl text-text-1">
              {step === 0 && "Create Your Account"}
              {step === 1 && "Business Details"}
              {step === 2 && "Choose Your Storefronts"}
              {step === 3 && "Identity Verification"}
              {step === 4 && "Review & Submit"}
            </h2>
            <p className="text-text-4 text-sm mt-1">
              {step === 0 && "Your login credentials for the seller dashboard"}
              {step === 1 && "Tell us about your business and store"}
              {step === 2 && "Select which regional storefronts you want to sell on"}
              {step === 3 && "Upload your ID and business documents for verification"}
              {step === 4 && "Make sure everything looks correct before submitting"}
            </p>
          </div>

          {/* STEP 0: ACCOUNT */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                  <input type="email" value={form.email} onChange={e => update("email", e.target.value)} className={`${inputCls("email")} pl-10`} placeholder="you@example.com" />
                </div>
                {fieldErr("email")}
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                  <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} className={`${inputCls("phone")} pl-10`} placeholder="+1 (555) 000-0000" />
                </div>
                {fieldErr("phone")}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                    <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)} className={`${inputCls("password")} pl-10 pr-10`} placeholder="Min 8 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErr("password")}
                </div>
                <div>
                  <label className={labelCls}>Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                    <input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} className={`${inputCls("confirmPassword")} pl-10`} placeholder="Re-enter password" />
                  </div>
                  {fieldErr("confirmPassword")}
                </div>
              </div>
              <p className="text-center text-sm text-text-4 pt-2">Already registered? <Link href="/vendor/login" className="text-orange font-semibold hover:underline">Log in</Link></p>
            </div>
          )}

          {/* STEP 1: BUSINESS DETAILS */}
          {step === 1 && (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Business Name</label>
                  <input value={form.businessName} onChange={e => update("businessName", e.target.value)} className={inputCls("businessName")} placeholder="My Company Ltd" />
                  {fieldErr("businessName")}
                </div>
                <div>
                  <label className={labelCls}>Legal Business Name</label>
                  <input value={form.legalBusinessName} onChange={e => update("legalBusinessName", e.target.value)} className={inputCls("legalBusinessName")} placeholder="My Company Legal Name Ltd" />
                  {fieldErr("legalBusinessName")}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Store Name</label>
                  <input value={form.storeName} onChange={e => update("storeName", e.target.value)} className={inputCls("storeName")} placeholder="My Awesome Store" />
                  {fieldErr("storeName")}
                </div>
                <div>
                  <label className={labelCls}>Store URL</label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-text-4 shrink-0">kauvex.com/stores/</span>
                    <input value={form.storeSlug} onChange={e => update("storeSlug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className={inputCls("storeSlug")} placeholder="mystore" />
                  </div>
                  {fieldErr("storeSlug")}
                </div>
              </div>
              <div>
                <label className={labelCls}>Business Type</label>
                <select value={form.businessType} onChange={e => update("businessType", e.target.value)} className={inputCls("businessType")}>
                  <option value="">Select business type...</option>
                  {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {fieldErr("businessType")}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Country</label>
                  <select value={form.country} onChange={e => update("country", e.target.value)} className={inputCls("country")}>
                    <option value="">Select...</option>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                  {fieldErr("country")}
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <input value={form.state} onChange={e => update("state", e.target.value)} className={inputCls("state")} placeholder="State" />
                  {fieldErr("state")}
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input value={form.city} onChange={e => update("city", e.target.value)} className={inputCls("city")} placeholder="City" />
                  {fieldErr("city")}
                </div>
              </div>
              <div>
                <label className={labelCls}>Business Address</label>
                <textarea value={form.businessAddress} onChange={e => update("businessAddress", e.target.value)} className={`${inputCls("businessAddress")} min-h-[60px]`} placeholder="Full business address" rows={2} />
                {fieldErr("businessAddress")}
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-text-3 mb-3 flex items-center gap-1"><FileText size={14} /> Tax & Registration Info</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-4 block mb-1">Tax ID / EIN</label>
                    <input value={form.taxId} onChange={e => update("taxId", e.target.value)} className={inputCls("taxId")} placeholder="XX-XXXXXXX" />
                  </div>
                  <div>
                    <label className="text-xs text-text-4 block mb-1">Government ID Number</label>
                    <input value={form.governmentId} onChange={e => update("governmentId", e.target.value)} className={inputCls("governmentId")} placeholder="Government ID" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="text-xs text-text-4 block mb-1">CAC Number (Nigeria)</label>
                    <input value={form.cacNumber} onChange={e => update("cacNumber", e.target.value)} className={inputCls("cacNumber")} placeholder="RC-1234567" />
                  </div>
                  <div>
                    <label className="text-xs text-text-4 block mb-1">VAT Number</label>
                    <input value={form.vatNumber} onChange={e => update("vatNumber", e.target.value)} className={inputCls("vatNumber")} placeholder="VAT-XXXXX" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STOREFRONT SELECTION */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-text-4">Choose which regional storefronts your products will appear on. You can change this later.</p>
              <div className="grid grid-cols-2 gap-3">
                {STOREFRONTS.map(sf => {
                  const selected = form.selectedStorefronts.includes(sf.id);
                  return (
                    <button key={sf.id} onClick={() => {
                      const current = [...form.selectedStorefronts];
                      const idx = current.indexOf(sf.id);
                      if (idx >= 0) current.splice(idx, 1);
                      else current.push(sf.id);
                      update("selectedStorefronts", current.length ? current : [sf.id]);
                    }} className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      selected ? "border-orange bg-orange-50" : "border-border hover:border-gray-300"
                    }`}>
                      <span className="text-xl">{sf.flag}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-1">{sf.name}</p>
                        <p className="text-[10px] text-text-4 font-mono">{sf.domain}</p>
                      </div>
                      {selected && <Check size={18} className="text-orange shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <div className="bg-blue-50 border border-blue/20 rounded-xl p-3 flex items-start gap-2">
                <Info size={14} className="text-blue shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">You can sell on multiple storefronts. Each storefront has its own currency, tax rules, and shipping settings.</p>
              </div>
            </div>
          )}

          {/* STEP 3: VERIFICATION */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className={labelCls}>ID Type</label>
                <select value={form.idType} onChange={e => update("idType", e.target.value)} className={inputCls("idType")}>
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID</option>
                  <option value="drivers_license">Driver&apos;s License</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>ID Number</label>
                <input value={form.idNumber} onChange={e => update("idNumber", e.target.value)} className={inputCls("idNumber")} placeholder="Enter your ID number" />
                {fieldErr("idNumber")}
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-text-3 mb-4 flex items-center gap-1"><Upload size={14} /> Document Upload</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Government ID (Front)", key: "id_front" },
                    { label: "Government ID (Back)", key: "id_back" },
                    { label: "Selfie / Portrait", key: "selfie" },
                    { label: "Business Certificate", key: "certificate" },
                  ].map(item => (
                    <div key={item.key} className="h-28 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange/40 transition-colors">
                      <Camera size={20} className="text-gray-300 mb-1" />
                      <span className="text-[10px] text-gray-400">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50 border border-amber/20 rounded-xl p-3 flex items-start gap-2">
                <Shield size={14} className="text-amber shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">Documents are securely stored and reviewed by our compliance team. Your information is never shared publicly.</p>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: "Account", icon: Mail, lines: [form.email, form.phone] },
                  { title: "Business", icon: Building2, lines: [form.businessName, form.legalBusinessName, `${BUSINESS_TYPES.find(t => t.value === form.businessType)?.label || ""}`] },
                  { title: "Store", icon: Store, lines: [`${form.storeName} → kauvex.com/stores/${form.storeSlug}`] },
                  { title: "Storefronts", icon: Globe, lines: form.selectedStorefronts.map(id => STOREFRONTS.find(s => s.id === id)?.name || id) },
                  { title: "Verification", icon: Shield, lines: [`${form.idType.replace(/_/g, " ")}: ${form.idNumber}`] },
                ].map(section => (
                  <div key={section.title} className="p-3 rounded-xl bg-gray-50 border border-border">
                    <p className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-2 flex items-center gap-1">
                      {section.icon && <section.icon size={12} />} {section.title}
                    </p>
                    {section.lines.map((line, i) => line ? <p key={i} className="text-sm font-medium text-text-1 leading-tight">{line}</p> : null)}
                  </div>
                ))}
              </div>
              <label className="flex items-start gap-3 p-4 rounded-xl border border-border cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={form.agreeTerms} onChange={e => update("agreeTerms", e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange-500" />
                <span className="text-sm text-text-2">I agree to the <Link href="/terms" className="text-orange font-semibold hover:underline">KAUVEX Seller Terms</Link></span>
              </label>
              {fieldErr("agreeTerms")}
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <div>
              {step > 0 ? (
                <button onClick={handleBack} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-gray-200 text-sm font-semibold text-text-2 hover:bg-gray-50 transition-all">
                  <ChevronLeft size={16} /> Back
                </button>
              ) : (
                <Link href="/vendor/login" className="inline-flex items-center gap-1 text-sm text-text-4 hover:text-orange transition-colors">
                  <ChevronLeft size={16} /> Back to login
                </Link>
              )}
            </div>
            <div>
              {step < 4 ? (
                <button onClick={handleNext} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange hover:bg-orange-600 text-white text-sm font-bold transition-all">
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} className="inline-flex items-center gap-2 px-8 py-2.5 rounded-lg bg-orange hover:bg-orange-600 text-white text-sm font-bold transition-all">
                  <CheckCircle size={16} /> Submit Application
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-white/40 mt-6">
          By registering, you agree to the <Link href="/terms" className="text-white/60 hover:text-white underline underline-offset-2">Terms of Service</Link> and <Link href="/privacy" className="text-white/60 hover:text-white underline underline-offset-2">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
