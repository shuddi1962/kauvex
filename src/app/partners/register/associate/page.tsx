"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Globe,
  Monitor,
  Users as UsersIcon,
  DollarSign,
  FileText,
  Loader2,
} from "lucide-react";

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Uganda", "Tanzania",
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "UAE", "India", "Other",
];

const PLATFORMS = [
  "YouTube", "Instagram", "TikTok", "Twitter/X", "Facebook",
  "LinkedIn", "Snapchat", "Pinterest", "Twitch", "Blog/Website",
  "WhatsApp/Telegram", "Podcast", "Other",
];

const CATEGORIES = [
  "Electronics", "Fashion", "Beauty", "Home & Kitchen", "Sports",
  "Automotive", "Books", "Toys & Games", "Health & Wellness",
  "Food & Grocery", "Baby Products", "Pet Supplies", "Office Products",
  "Music & Instruments", "Art & Crafts", "Other",
];

const PAYOUT_METHODS = ["Bank Transfer", "PayPal", "Payoneer", "Kauvex Wallet"];

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  country: string;
  platformType: string;
  platformUrl: string;
  monthlyVisitors: string;
  contentLanguage: string;
  audienceCountry: string;
  contentCategories: string[];
  promotionApproach: string;
  payoutCountry: string;
  payoutMethod: string;
  payoutDetails: string;
  acceptedDisclosure: boolean;
  acceptedTerms: boolean;
}

export default function AssociateRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    platformType: "",
    platformUrl: "",
    monthlyVisitors: "",
    contentLanguage: "",
    audienceCountry: "",
    contentCategories: [],
    promotionApproach: "",
    payoutCountry: "",
    payoutMethod: "",
    payoutDetails: "",
    acceptedDisclosure: false,
    acceptedTerms: false,
  });

  const updateField = (field: keyof FormData, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleCategory = (cat: string) => {
    const current = formData.contentCategories;
    if (current.includes(cat)) {
      updateField("contentCategories", current.filter((c) => c !== cat));
    } else {
      updateField("contentCategories", [...current, cat]);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email address";
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8) newErrors.password = "At least 8 characters";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.country) newErrors.country = "Country is required";
    } else if (step === 2) {
      if (!formData.platformType) newErrors.platformType = "Select your primary platform";
      if (!formData.platformUrl.trim()) newErrors.platformUrl = "Platform URL is required";
      if (!formData.monthlyVisitors.trim()) newErrors.monthlyVisitors = "Monthly visitors is required";
      if (!formData.contentLanguage.trim()) newErrors.contentLanguage = "Content language is required";
      if (!formData.audienceCountry) newErrors.audienceCountry = "Audience country is required";
      if (formData.contentCategories.length === 0) newErrors.contentCategories = "Select at least one category";
    } else if (step === 3) {
      if (!formData.promotionApproach.trim()) newErrors.promotionApproach = "Tell us how you will promote";
      else if (formData.promotionApproach.trim().length < 20) newErrors.promotionApproach = "At least 20 characters";
    } else if (step === 4) {
      if (!formData.payoutCountry) newErrors.payoutCountry = "Payout country is required";
      if (!formData.payoutMethod) newErrors.payoutMethod = "Payout method is required";
      if (!formData.payoutDetails.trim()) newErrors.payoutDetails = "Payment details are required";
    } else if (step === 5) {
      if (!formData.acceptedDisclosure) newErrors.acceptedDisclosure = "You must acknowledge disclosure requirements";
      if (!formData.acceptedTerms) newErrors.acceptedTerms = "You must agree to the Terms of Service";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    setIsSubmitting(true);

    try {
      const payload = {
        partnerType: "associate",
        displayName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        country: formData.country,
        platformType: formData.platformType,
        platformUrl: formData.platformUrl,
        monthlyVisitors: parseInt(formData.monthlyVisitors) || 0,
        contentLanguage: formData.contentLanguage,
        audienceCountry: formData.audienceCountry,
        contentCategories: formData.contentCategories,
        promotionApproach: formData.promotionApproach,
        payoutCountry: formData.payoutCountry,
        payoutMethod: formData.payoutMethod,
        payoutDetails: formData.payoutDetails,
      };

      const res = await fetch("/api/partners/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      router.push("/associate?registered=true");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Account" },
    { num: 2, label: "Platform" },
    { num: 3, label: "Promotion" },
    { num: 4, label: "Payout" },
    { num: 5, label: "Terms" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/partners"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-navy mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Partners
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-orange rounded-xl flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-syne font-700 text-2xl text-navy">Join as an Associate</h1>
            <p className="text-gray-500 text-sm mt-1">Start earning commissions by sharing products you love.</p>
          </div>

          <div className="flex items-center justify-center mb-8">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      currentStep > s.num
                        ? "bg-orange text-white"
                        : currentStep === s.num
                          ? "bg-navy text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      currentStep === s.num ? "text-navy font-semibold" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-10 h-0.5 mx-2 mb-5 ${
                      currentStep > s.num ? "bg-orange" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {errors.submit && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red text-sm">
              {errors.submit}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                      errors.fullName ? "border-red" : "border-gray-300"
                    }`}
                    placeholder="Your full name"
                  />
                </div>
                {errors.fullName && <p className="text-red text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                      errors.email ? "border-red" : "border-gray-300"
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="text-red text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                        errors.password ? "border-red" : "border-gray-300"
                      }`}
                      placeholder="Min 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                        errors.confirmPassword ? "border-red" : "border-gray-300"
                      }`}
                      placeholder="Repeat password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                      errors.phone ? "border-red" : "border-gray-300"
                    }`}
                    placeholder="+234 800 000 0000"
                  />
                </div>
                {errors.phone && <p className="text-red text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country of Residence</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                      errors.country ? "border-red" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {errors.country && <p className="text-red text-xs mt-1">{errors.country}</p>}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Platform</label>
                <div className="relative">
                  <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.platformType}
                    onChange={(e) => updateField("platformType", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                      errors.platformType ? "border-red" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select platform</option>
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                {errors.platformType && <p className="text-red text-xs mt-1">{errors.platformType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform URL / Handle</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.platformUrl}
                    onChange={(e) => updateField("platformUrl", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                      errors.platformUrl ? "border-red" : "border-gray-300"
                    }`}
                    placeholder="https://youtube.com/@yourchannel"
                  />
                </div>
                {errors.platformUrl && <p className="text-red text-xs mt-1">{errors.platformUrl}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Visitors/Reach</label>
                  <input
                    type="number"
                    value={formData.monthlyVisitors}
                    onChange={(e) => updateField("monthlyVisitors", e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                      errors.monthlyVisitors ? "border-red" : "border-gray-300"
                    }`}
                    placeholder="e.g. 10000"
                  />
                  {errors.monthlyVisitors && <p className="text-red text-xs mt-1">{errors.monthlyVisitors}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content Language</label>
                  <input
                    type="text"
                    value={formData.contentLanguage}
                    onChange={(e) => updateField("contentLanguage", e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                      errors.contentLanguage ? "border-red" : "border-gray-300"
                    }`}
                    placeholder="e.g. English, Yoruba"
                  />
                  {errors.contentLanguage && <p className="text-red text-xs mt-1">{errors.contentLanguage}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Audience Country</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.audienceCountry}
                    onChange={(e) => updateField("audienceCountry", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                      errors.audienceCountry ? "border-red" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select audience country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {errors.audienceCountry && <p className="text-red text-xs mt-1">{errors.audienceCountry}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Categories</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        formData.contentCategories.includes(cat)
                          ? "bg-orange text-white border-orange"
                          : "bg-white text-gray-600 border-gray-300 hover:border-orange hover:text-orange"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {errors.contentCategories && <p className="text-red text-xs mt-1">{errors.contentCategories}</p>}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How do you plan to promote Kauvex products?
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Describe your promotion strategy — social media posts, blog reviews, video content, email newsletters, etc.
              </p>
              <textarea
                value={formData.promotionApproach}
                onChange={(e) => updateField("promotionApproach", e.target.value)}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors resize-none ${
                  errors.promotionApproach ? "border-red" : "border-gray-300"
                }`}
                placeholder="I plan to create YouTube review videos featuring electronics and fashion products from Kauvex. I will include my affiliate links in the video description and pin comment..."
              />
              {errors.promotionApproach && <p className="text-red text-xs mt-1">{errors.promotionApproach}</p>}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payout Country</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.payoutCountry}
                    onChange={(e) => updateField("payoutCountry", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                      errors.payoutCountry ? "border-red" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select payout country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {errors.payoutCountry && <p className="text-red text-xs mt-1">{errors.payoutCountry}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payout Method</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.payoutMethod}
                    onChange={(e) => updateField("payoutMethod", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                      errors.payoutMethod ? "border-red" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select payout method</option>
                    {PAYOUT_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                {errors.payoutMethod && <p className="text-red text-xs mt-1">{errors.payoutMethod}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Details</label>
                <p className="text-xs text-gray-400 mb-1">
                  {formData.payoutMethod === "Bank Transfer"
                    ? "Account number, bank name, account name, routing/Sort code"
                    : formData.payoutMethod === "PayPal"
                      ? "PayPal email address"
                      : formData.payoutMethod === "Payoneer"
                        ? "Payoneer email or account ID"
                        : formData.payoutMethod === "Kauvex Wallet"
                          ? "Your Kauvex Wallet ID or phone number"
                          : "Enter your payment details"}
                </p>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.payoutDetails}
                    onChange={(e) => updateField("payoutDetails", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                      errors.payoutDetails ? "border-red" : "border-gray-300"
                    }`}
                    placeholder={
                      formData.payoutMethod === "Bank Transfer"
                        ? "0123456789, GTBank, John Doe, 032"
                        : "youremail@example.com"
                    }
                  />
                </div>
                {errors.payoutDetails && <p className="text-red text-xs mt-1">{errors.payoutDetails}</p>}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p className="font-medium text-navy mb-1">Payout Schedule</p>
                <p>Commissions are paid monthly on a net-30 basis. Minimum payout threshold: ₦5,000 or equivalent.</p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-5">
              <div className="bg-orange/5 border border-orange/20 rounded-lg p-4">
                <h3 className="font-semibold text-navy text-sm mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange" />
                  FTC Disclosure Requirements
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  As an affiliate partner, you are required to clearly disclose your relationship with Kauvex
                  whenever you promote our products. This includes adding a disclosure notice on your content
                  (e.g., &ldquo;This post contains affiliate links. I may earn a commission if you make a purchase.&rdquo;).
                </p>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.acceptedDisclosure}
                    onChange={(e) => updateField("acceptedDisclosure", e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange/20"
                  />
                  <span className="text-sm text-gray-700">
                    I acknowledge that I must clearly disclose my affiliate relationship with Kauvex in all promotional content.
                  </span>
                </label>
                {errors.acceptedDisclosure && (
                  <p className="text-red text-xs mt-1">{errors.acceptedDisclosure}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-navy text-sm mb-2">Terms of Service</h3>
                <div className="text-sm text-gray-600 mb-3 max-h-32 overflow-y-auto border border-gray-200 rounded p-3 bg-white">
                  <p className="mb-2"><strong>1. Program Enrollment.</strong> By joining the Kauvex Partner Program, you agree to comply with these terms. Your application is subject to review and approval.</p>
                  <p className="mb-2"><strong>2. Commission Structure.</strong> Commissions are earned on qualifying purchases made through your unique tracking links. Standard rates apply unless otherwise agreed.</p>
                  <p className="mb-2"><strong>3. Payment Terms.</strong> Commissions are paid monthly on a net-30 schedule. A minimum payout threshold of ₦5,000 applies. Unpaid balances below threshold carry over.</p>
                  <p className="mb-2"><strong>4. Prohibited Activities.</strong> You may not use spam, paid advertising on branded keywords, or fraudulent methods to generate commissions. Violations will result in account termination.</p>
                  <p className="mb-2"><strong>5. Cookie Duration.</strong> Standard cookie window is 30 days. Any qualifying purchase within this period is attributed to your referral.</p>
                  <p className="mb-2"><strong>6. Modification.</strong> Kauvex reserves the right to modify these terms with 30 days notice.</p>
                </div>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.acceptedTerms}
                    onChange={(e) => updateField("acceptedTerms", e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange/20"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the Kauvex Partner Program Terms of Service and Privacy Policy.
                  </span>
                </label>
                {errors.acceptedTerms && (
                  <p className="text-red text-xs mt-1">{errors.acceptedTerms}</p>
                )}
              </div>

              <div className="bg-navy/5 rounded-lg p-4">
                <h3 className="font-semibold text-navy text-sm mb-2">Summary</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><strong>Name:</strong> {formData.fullName}</li>
                  <li><strong>Email:</strong> {formData.email}</li>
                  <li><strong>Platform:</strong> {formData.platformType}</li>
                  <li><strong>Categories:</strong> {formData.contentCategories.join(", ")}</li>
                  <li><strong>Payout:</strong> {formData.payoutMethod} ({formData.payoutCountry})</li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy/90 transition-colors"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-2.5 bg-orange text-white rounded-lg text-sm font-semibold hover:bg-orange/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/partners/login" className="text-orange font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
