"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, Eye, EyeOff, Mail, Lock,
  User, Phone, Building2, Globe, Loader2, CheckCircle,
} from "lucide-react";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  country: string;
  companyName: string;
  industry: string;
  websiteUrl: string;
  monthlyReferrals: string;
  promotionApproach: string;
  payoutCountry: string;
  payoutMethod: string;
  payoutDetails: Record<string, string>;
  acceptedTerms: boolean;
}

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Uganda", "Tanzania",
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "UAE", "India", "Other",
];

const INDUSTRIES = [
  "Technology", "Finance & Banking", "Healthcare", "Retail & E-commerce",
  "Manufacturing", "Logistics & Supply Chain", "Energy & Utilities",
  "Education", "Real Estate", "Agriculture", "Consulting", "Other",
];

const STEPS = ["Account", "Business", "Approach", "Payout", "Terms"];

export default function B2bRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    fullName: "", email: "", password: "", confirmPassword: "",
    phone: "", country: "Nigeria", companyName: "", industry: "Technology",
    websiteUrl: "", monthlyReferrals: "", promotionApproach: "",
    payoutCountry: "Nigeria", payoutMethod: "bank_transfer",
    payoutDetails: {}, acceptedTerms: false,
  });

  const update = (field: keyof FormData, value: any) => setFormData((prev) => ({ ...prev, [field]: value }));

  const validate = (): boolean => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password) return false;
      if (formData.password !== formData.confirmPassword) return false;
      if (formData.password.length < 8) return false;
    }
    if (step === 2) {
      if (!formData.companyName) return false;
    }
    if (step === 3) {
      if (formData.promotionApproach.length < 20) return false;
    }
    if (step === 5) {
      if (!formData.acceptedTerms) return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/partners/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_type: "b2b_referral",
          display_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          primary_audience_country: formData.country,
          website_url: formData.websiteUrl || undefined,
          primary_platform: "Direct Outreach",
          content_categories: [formData.industry],
          payout_method: formData.payoutMethod,
          agree_terms: formData.acceptedTerms,
          bio: `${formData.companyName} — ${formData.industry} B2B referral partner. ${formData.promotionApproach}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      router.push("/b2b-referral?registered=true");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <Link href="/partners" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-[#0A1628] rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="font-bold text-2xl text-[#0A1628]">B2B Referral Partner</h1>
          <p className="text-gray-500 text-sm mt-1">Refer vendors, suppliers & merchants. Earn recurring commissions.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full ${i + 1 <= step ? "bg-[#FF6B00]" : "bg-gray-200"}`} />
              <p className={`text-[9px] mt-1 text-center ${i + 1 <= step ? "text-[#FF6B00] font-semibold" : "text-gray-400"}`}>{s}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red text-xs">{error}</div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {/* Step 1: Account */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-sm text-[#0A1628]">Create Your Account</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Full Name *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={formData.fullName} onChange={(e) => update("fullName", e.target.value)}
                      className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Email *</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={formData.email} onChange={(e) => update("email", e.target.value)}
                      className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Password *</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => update("password", e.target.value)}
                      className="w-full h-9 pl-9 pr-9 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" value={formData.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)}
                      className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Phone</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={formData.phone} onChange={(e) => update("phone", e.target.value)}
                      className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Country *</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select value={formData.country} onChange={(e) => update("country", e.target.value)}
                      className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]">
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Business */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-sm text-[#0A1628]">Business Details</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Company Name *</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={formData.companyName} onChange={(e) => update("companyName", e.target.value)}
                      className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Industry *</label>
                  <select value={formData.industry} onChange={(e) => update("industry", e.target.value)}
                    className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]">
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Website URL</label>
                  <input value={formData.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} placeholder="https://"
                    className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Expected Monthly Referrals</label>
                  <select value={formData.monthlyReferrals} onChange={(e) => update("monthlyReferrals", e.target.value)}
                    className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]">
                    <option value="">Select...</option>
                    <option value="1-5">1-5 per month</option>
                    <option value="6-20">6-20 per month</option>
                    <option value="21-50">21-50 per month</option>
                    <option value="50+">50+ per month</option>
                  </select>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[10px] text-blue-700">
                <strong>B2B Referral Benefits:</strong> 5% recurring commission for 12 months per closed deal. Enterprise-level tracking. Dedicated account manager.
              </div>
            </div>
          )}

          {/* Step 3: Approach */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold text-sm text-[#0A1628]">Your Referral Approach</h2>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                  How will you refer businesses to Kauvex? (min 20 characters) *
                </label>
                <textarea rows={4} value={formData.promotionApproach} onChange={(e) => update("promotionApproach", e.target.value)}
                  placeholder="Describe your network, outreach strategy, and how you plan to refer vendors and businesses to Kauvex..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] resize-none" />
                <p className="text-[9px] text-gray-400 mt-1">{formData.promotionApproach.length}/20 minimum characters</p>
              </div>
            </div>
          )}

          {/* Step 4: Payout */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-bold text-sm text-[#0A1628]">Payout Details</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Payout Country</label>
                  <select value={formData.payoutCountry} onChange={(e) => update("payoutCountry", e.target.value)}
                    className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]">
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 mb-1">Payout Method</label>
                  <select value={formData.payoutMethod} onChange={(e) => update("payoutMethod", e.target.value)}
                    className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]">
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-gray-400">Minimum payout: $50. B2B commissions are paid monthly after a 30-day confirmation period.</p>
            </div>
          )}

          {/* Step 5: Terms */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="font-bold text-sm text-[#0A1628]">Terms & Conditions</h2>
              <div className="bg-gray-50 rounded-lg p-4 text-[10px] text-gray-600 max-h-48 overflow-y-auto space-y-2">
                <p><strong>1. B2B Referral Commission.</strong> 5% recurring commission on net revenue from referred business accounts for 12 months.</p>
                <p><strong>2. Qualifying Referral.</strong> A referred business must complete signup and make at least one qualifying purchase within 90 days.</p>
                <p><strong>3. Recurring Period.</strong> Commission recurs monthly for 12 months from the first payment date of the referred business.</p>
                <p><strong>4. Minimum Payout.</strong> $50 minimum payout threshold. Payments processed monthly via your selected method.</p>
                <p><strong>5. Cookie Duration.</strong> 90-day attribution window for B2B referrals.</p>
                <p><strong>6. Compliance.</strong> No self-referrals. No misleading claims about Kauvex services.</p>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.acceptedTerms} onChange={(e) => update("acceptedTerms", e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" />
                <span className="text-[10px] text-gray-600">I agree to the B2B Referral Partner Terms & Conditions and Privacy Policy</span>
              </label>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <button onClick={() => setStep(Math.max(step - 1, 1))} disabled={step === 1}
              className="flex items-center gap-1 h-9 px-4 text-xs font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
            {step < 5 ? (
              <button onClick={() => validate() && setStep(step + 1)}
                className="flex items-center gap-1 h-9 px-5 bg-[#FF6B00] text-white font-bold text-[10px] rounded-lg hover:bg-[#FF6B00]/90 transition-colors">
                Next <ArrowRight size={12} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting || !formData.acceptedTerms}
                className="flex items-center gap-1 h-9 px-5 bg-[#0A1628] text-white font-bold text-[10px] rounded-lg hover:bg-[#0A1628]/90 transition-colors disabled:opacity-50">
                {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                {isSubmitting ? "Submitting..." : "Join as B2B Partner"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/partners" className="text-gray-400 hover:text-[#0A1628] transition-colors">&larr; Back to Partners Home</Link>
        </p>
      </div>
    </div>
  );
}
