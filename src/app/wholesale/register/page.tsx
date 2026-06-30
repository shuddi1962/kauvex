"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, Mail, Lock, ArrowRight, Building2, ArrowLeft,
  User, Phone, MapPin, Globe, Package, Loader2, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Step = 1 | 2 | 3;

export default function WholesaleRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    companyName: "",
    businessType: "retailer",
    registrationNumber: "",
    contactPerson: "",
    email: "",
    phone: "",
    password: "",
    country: "NG",
    state: "",
    city: "",
    address: "",
    industry: "",
    monthlyVolume: "",
    currentSuppliers: "",
    website: "",
  });

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const canProceed = () => {
    if (step === 1) return form.companyName && form.contactPerson && form.email && form.password;
    if (step === 2) return form.country && form.city;
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/v1/wholesale/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Registration failed");
      router.push("/wholesale/login?registered=true");
    } catch {
      setError("Registration failed. Please try again or contact our B2B team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d1f3c] to-[#132e52] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full border border-white/20" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full border border-white/10" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-[#0A1628] to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg border border-white/10">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-syne font-800 text-2xl text-white mb-1">Wholesale Application</h1>
          <p className="text-blue-300 text-sm">Apply for B2B wholesale pricing</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step >= s ? "bg-[#FF6B00] text-white" : "bg-white/10 text-white/40"
              }`}>
                {step > s ? <CheckCircle2 size={14} /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-[#FF6B00]" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-syne font-700 text-lg text-gray-900 mb-1">Business Information</h3>
              <p className="text-xs text-gray-500 mb-4">Tell us about your business</p>

              <div>
                <label className={labelClass}>Company Name *</label>
                <input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} className={inputClass} placeholder="e.g. TechHub Nigeria Ltd" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Business Type</label>
                  <select value={form.businessType} onChange={(e) => update("businessType", e.target.value)} className={inputClass}>
                    <option value="retailer">Retailer</option>
                    <option value="distributor">Distributor</option>
                    <option value="contractor">Contractor</option>
                    <option value="reseller">Reseller</option>
                    <option value="institution">Institution/Government</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Registration Number</label>
                  <input value={form.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} className={inputClass} placeholder="RC/BN Number" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Contact Person *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.contactPerson} onChange={(e) => update("contactPerson", e.target.value)} className={`${inputClass} pl-9`} placeholder="Full name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Email *</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={`${inputClass} pl-9`} placeholder="business@company.com" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={`${inputClass} pl-9`} placeholder="+234..." />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Password *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className={`${inputClass} pl-9 pr-10`}
                    placeholder="Min. 8 characters"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-syne font-700 text-lg text-gray-900 mb-1">Location & Industry</h3>
              <p className="text-xs text-gray-500 mb-4">Where is your business located?</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Country *</label>
                  <select value={form.country} onChange={(e) => update("country", e.target.value)} className={inputClass}>
                    <option value="NG">Nigeria</option>
                    <option value="GH">Ghana</option>
                    <option value="KE">Kenya</option>
                    <option value="ZA">South Africa</option>
                    <option value="GB">United Kingdom</option>
                    <option value="US">United States</option>
                    <option value="AE">UAE</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>State/Region</label>
                  <input value={form.state} onChange={(e) => update("state", e.target.value)} className={inputClass} placeholder="e.g. Lagos" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>City *</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={form.city} onChange={(e) => update("city", e.target.value)} className={`${inputClass} pl-9`} placeholder="e.g. Lagos" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Industry</label>
                  <select value={form.industry} onChange={(e) => update("industry", e.target.value)} className={inputClass}>
                    <option value="">Select industry</option>
                    <option value="security">Security & Surveillance</option>
                    <option value="electronics">Electronics & IT</option>
                    <option value="construction">Construction</option>
                    <option value="solar">Solar & Energy</option>
                    <option value="marine">Marine & Shipping</option>
                    <option value="safety">Safety & PPE</option>
                    <option value="kitchen">Kitchen & Hospitality</option>
                    <option value="general">General Merchandise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Business Address</label>
                <input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} placeholder="Full address" />
              </div>

              <div>
                <label className={labelClass}>Monthly Purchase Volume</label>
                <select value={form.monthlyVolume} onChange={(e) => update("monthlyVolume", e.target.value)} className={inputClass}>
                  <option value="">Select range</option>
                  <option value="50k-200k">₦50,000 - ₦200,000</option>
                  <option value="200k-500k">₦200,000 - ₦500,000</option>
                  <option value="500k-1m">₦500,000 - ₦1,000,000</option>
                  <option value="1m-5m">₦1,000,000 - ₦5,000,000</option>
                  <option value="5m+">₦5,000,000+</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Website (optional)</label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={form.website} onChange={(e) => update("website", e.target.value)} className={`${inputClass} pl-9`} placeholder="https://" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-syne font-700 text-lg text-gray-900 mb-1">Review & Submit</h3>
              <p className="text-xs text-gray-500 mb-4">Verify your details before submitting</p>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Company</span>
                  <span className="font-medium text-gray-900">{form.companyName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Contact</span>
                  <span className="font-medium text-gray-900">{form.contactPerson}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900">{form.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-gray-900">{form.city}, {form.country}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Business Type</span>
                  <span className="font-medium text-gray-900 capitalize">{form.businessType}</span>
                </div>
                {form.industry && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Industry</span>
                    <span className="font-medium text-gray-900 capitalize">{form.industry}</span>
                  </div>
                )}
                {form.monthlyVolume && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Monthly Volume</span>
                    <span className="font-medium text-gray-900">{form.monthlyVolume}</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">What happens next?</h4>
                <ul className="text-xs text-blue-700 space-y-1.5">
                  <li className="flex items-start gap-2"><CheckCircle2 size={12} className="mt-0.5 shrink-0" /> Our B2B team reviews your application within 24-48 hours</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={12} className="mt-0.5 shrink-0" /> You receive wholesale pricing access via email</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={12} className="mt-0.5 shrink-0" /> Start ordering at discounted B2B rates</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            {step > 1 ? (
              <button onClick={() => setStep((step - 1) as Step)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <Link href="/wholesale/login" className="text-sm text-gray-500 hover:text-gray-700">Already have an account? Sign in</Link>
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep((step + 1) as Step)}
                disabled={!canProceed()}
                className="bg-[#0A1628] hover:bg-[#0d1f3c] text-white px-6"
              >
                Continue <ArrowRight size={14} className="ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#FF6B00] hover:bg-[#e86000] text-white px-6"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Submitting...</div>
                ) : (
                  <div className="flex items-center gap-2">Submit Application <ArrowRight size={14} /></div>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
