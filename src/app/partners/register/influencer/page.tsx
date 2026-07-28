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
  Star,
  DollarSign,
  FileText,
  Loader2,
  Camera,
  Plus,
  Trash2,
  AtSign,
  Heart,
  BarChart3,
  Info,
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

const NICHES = [
  "Tech Reviews", "Unboxing", "Lifestyle", "Travel", "Fitness",
  "Cooking & Food", "Parenting", "Gaming", "Education", "Finance",
  "Fashion Hauls", "Skincare", "DIY & Crafts", "Photography",
  "Comedy & Entertainment", "Music", "Motivation", "Sustainability",
];

const PAYOUT_METHODS = ["Bank Transfer", "PayPal", "Payoneer", "Kauvex Wallet"];

interface SocialProfile {
  platform: string;
  url: string;
  followers: string;
}

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  country: string;
  bio: string;
  desiredUsername: string;
  usernameAvailable: boolean | null;
  profilePhoto: File | null;
  profilePhotoPreview: string;
  platformType: string;
  platformUrl: string;
  monthlyVisitors: string;
  contentLanguage: string;
  audienceCountry: string;
  contentCategories: string[];
  niche: string;
  socialProfiles: SocialProfile[];
  engagementRate: string;
  promotionApproach: string;
  preferredProductCategories: string[];
  payoutCountry: string;
  payoutMethod: string;
  payoutDetails: string;
  acceptedDisclosure: boolean;
  acceptedTerms: boolean;
}

export default function InfluencerRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    bio: "",
    desiredUsername: "",
    usernameAvailable: null,
    profilePhoto: null,
    profilePhotoPreview: "",
    platformType: "",
    platformUrl: "",
    monthlyVisitors: "",
    contentLanguage: "",
    audienceCountry: "",
    contentCategories: [],
    niche: "",
    socialProfiles: [{ platform: "", url: "", followers: "" }],
    engagementRate: "",
    promotionApproach: "",
    preferredProductCategories: [],
    payoutCountry: "",
    payoutMethod: "",
    payoutDetails: "",
    acceptedDisclosure: false,
    acceptedTerms: false,
  });

  const updateField = (field: keyof FormData, value: string | string[] | boolean | null) => {
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

  const togglePreferredCategory = (cat: string) => {
    const current = formData.preferredProductCategories;
    if (current.includes(cat)) {
      updateField("preferredProductCategories", current.filter((c) => c !== cat));
    } else {
      updateField("preferredProductCategories", [...current, cat]);
    }
  };

  const updateSocialProfile = (index: number, field: keyof SocialProfile, value: string) => {
    const updated = [...formData.socialProfiles];
    updated[index] = { ...updated[index], [field]: value };
    updateField("socialProfiles", updated as unknown as string[]);
    setFormData((prev) => ({ ...prev, socialProfiles: updated }));
  };

  const addSocialProfile = () => {
    setFormData((prev) => ({
      ...prev,
      socialProfiles: [...prev.socialProfiles, { platform: "", url: "", followers: "" }],
    }));
  };

  const removeSocialProfile = (index: number) => {
    if (formData.socialProfiles.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      socialProfiles: prev.socialProfiles.filter((_, i) => i !== index),
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profilePhoto: file,
        profilePhotoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const checkUsername = async () => {
    if (!formData.desiredUsername.trim() || formData.desiredUsername.length < 3) return;
    setCheckingUsername(true);
    await new Promise((r) => setTimeout(r, 600));
    const taken = formData.desiredUsername.toLowerCase() === "admin" || formData.desiredUsername.toLowerCase() === "kauvex";
    updateField("usernameAvailable", !taken);
    setCheckingUsername(false);
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
      if (!formData.desiredUsername.trim()) newErrors.desiredUsername = "Username is required";
      if (formData.usernameAvailable === false) newErrors.desiredUsername = "Username is already taken";
      if (!formData.bio.trim()) newErrors.bio = "Bio is required";
      else if (formData.bio.trim().length < 30) newErrors.bio = "At least 30 characters";
    } else if (step === 2) {
      if (!formData.platformType) newErrors.platformType = "Select your primary platform";
      if (!formData.platformUrl.trim()) newErrors.platformUrl = "Platform URL is required";
      if (!formData.niche) newErrors.niche = "Select your niche";
      if (!formData.engagementRate.trim()) newErrors.engagementRate = "Engagement rate is required";
      if (!formData.contentLanguage.trim()) newErrors.contentLanguage = "Content language is required";
      if (!formData.audienceCountry) newErrors.audienceCountry = "Audience country is required";
      if (formData.contentCategories.length === 0) newErrors.contentCategories = "Select at least one category";
      const validSocials = formData.socialProfiles.filter((s) => s.platform && s.url);
      if (validSocials.length === 0) newErrors.socialProfiles = "Add at least one social profile";
    } else if (step === 3) {
      if (!formData.promotionApproach.trim()) newErrors.promotionApproach = "Tell us how you will promote";
      else if (formData.promotionApproach.trim().length < 30) newErrors.promotionApproach = "At least 30 characters";
      if (formData.preferredProductCategories.length === 0) newErrors.preferredProductCategories = "Select at least one";
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
        partnerType: "influencer",
        displayName: formData.fullName,
        username: formData.desiredUsername,
        bio: formData.bio,
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
        niche: formData.niche,
        engagementRate: formData.engagementRate,
        socialProfiles: formData.socialProfiles.filter((s) => s.platform && s.url),
        promotionApproach: formData.promotionApproach,
        preferredProductCategories: formData.preferredProductCategories,
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

      router.push("/creators?registered=true");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Profile" },
    { num: 2, label: "Platform" },
    { num: 3, label: "Promotion" },
    { num: 4, label: "Payout" },
    { num: 5, label: "Terms" },
  ];

  const categoryTags = (cats: string[], toggle: (c: string) => void) =>
    CATEGORIES.map((cat) => (
      <button
        key={cat}
        type="button"
        onClick={() => toggle(cat)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          cats.includes(cat)
            ? "bg-orange text-white border-orange"
            : "bg-white text-gray-600 border-gray-300 hover:border-orange hover:text-orange"
        }`}
      >
        {cat}
      </button>
    ));

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
            <div className="w-14 h-14 bg-navy rounded-xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-syne font-700 text-2xl text-navy">Join as an Influencer</h1>
            <p className="text-gray-500 text-sm mt-1">
              Monetize your audience with exclusive brand deals and higher commissions.
            </p>
            <Link href="/creators" className="text-xs text-orange hover:underline mt-1 inline-block">
              Learn about Creator Program tiers &rarr;
            </Link>
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
              <div className="flex items-center gap-6 mb-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {formData.profilePhotoPreview ? (
                      <img
                        src={formData.profilePhotoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange rounded-full flex items-center justify-center cursor-pointer hover:bg-orange/90 transition-colors">
                    <Camera className="w-3.5 h-3.5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-navy text-sm">Profile Photo</p>
                  <p className="text-xs text-gray-400">Upload a professional photo. JPG, PNG, max 5MB.</p>
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Desired Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.desiredUsername}
                    onChange={(e) => updateField("desiredUsername", e.target.value)}
                    onBlur={checkUsername}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                      errors.desiredUsername ? "border-red" : "border-gray-300"
                    }`}
                    placeholder="yourname"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : formData.usernameAvailable === true ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : formData.usernameAvailable === false ? (
                      <Info className="w-4 h-4 text-red" />
                    ) : null}
                  </div>
                </div>
                {errors.desiredUsername && <p className="text-red text-xs mt-1">{errors.desiredUsername}</p>}
                {formData.usernameAvailable === true && (
                  <p className="text-green-600 text-xs mt-1">Username is available!</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors resize-none ${
                    errors.bio ? "border-red" : "border-gray-300"
                  }`}
                  placeholder="Tell us about yourself — who you are, what content you create, and what makes you unique..."
                />
                {errors.bio && <p className="text-red text-xs mt-1">{errors.bio}</p>}
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
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content Niche</label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={formData.niche}
                      onChange={(e) => updateField("niche", e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                        errors.niche ? "border-red" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select niche</option>
                      {NICHES.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  {errors.niche && <p className="text-red text-xs mt-1">{errors.niche}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Platform URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.platformUrl}
                    onChange={(e) => updateField("platformUrl", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                      errors.platformUrl ? "border-red" : "border-gray-300"
                    }`}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
                {errors.platformUrl && <p className="text-red text-xs mt-1">{errors.platformUrl}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Reach</label>
                  <div className="relative">
                    <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.monthlyVisitors}
                      onChange={(e) => updateField("monthlyVisitors", e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors"
                      placeholder="e.g. 50000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Engagement Rate (%)</label>
                  <div className="relative">
                    <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.engagementRate}
                      onChange={(e) => updateField("engagementRate", e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                        errors.engagementRate ? "border-red" : "border-gray-300"
                      }`}
                      placeholder="e.g. 4.5"
                    />
                  </div>
                  {errors.engagementRate && <p className="text-red text-xs mt-1">{errors.engagementRate}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audience Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={formData.audienceCountry}
                      onChange={(e) => updateField("audienceCountry", e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors ${
                        errors.audienceCountry ? "border-red" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  {errors.audienceCountry && <p className="text-red text-xs mt-1">{errors.audienceCountry}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categoryTags(formData.contentCategories, toggleCategory)}
                </div>
                {errors.contentCategories && <p className="text-red text-xs mt-1">{errors.contentCategories}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Social Media Profiles</label>
                  <button
                    type="button"
                    onClick={addSocialProfile}
                    className="flex items-center gap-1 text-xs text-orange font-semibold hover:text-orange/80 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Platform
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.socialProfiles.map((profile, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={profile.platform}
                        onChange={(e) => updateSocialProfile(index, "platform", e.target.value)}
                        className="w-[140px] px-3 py-2 border border-gray-300 rounded-lg text-xs appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors"
                      >
                        <option value="">Platform</option>
                        {PLATFORMS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <input
                        type="url"
                        value={profile.url}
                        onChange={(e) => updateSocialProfile(index, "url", e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors"
                        placeholder="URL"
                      />
                      <input
                        type="number"
                        value={profile.followers}
                        onChange={(e) => updateSocialProfile(index, "followers", e.target.value)}
                        className="w-[100px] px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors"
                        placeholder="Followers"
                      />
                      {formData.socialProfiles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSocialProfile(index)}
                          className="p-2 text-gray-400 hover:text-red transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.socialProfiles && <p className="text-red text-xs mt-1">{errors.socialProfiles}</p>}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How do you plan to promote Kauvex products?
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  Describe your content strategy — product reviews, sponsored posts, discount code promotions, unboxing videos, etc.
                </p>
                <textarea
                  value={formData.promotionApproach}
                  onChange={(e) => updateField("promotionApproach", e.target.value)}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-colors resize-none ${
                    errors.promotionApproach ? "border-red" : "border-gray-300"
                  }`}
                  placeholder="I will create weekly YouTube videos featuring fashion hauls from Kauvex, share discount codes on Instagram Stories, and write blog posts comparing top products..."
                />
                {errors.promotionApproach && <p className="text-red text-xs mt-1">{errors.promotionApproach}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Product Categories</label>
                <p className="text-xs text-gray-400 mb-2">Which product categories are you most interested in promoting?</p>
                <div className="flex flex-wrap gap-2">
                  {categoryTags(formData.preferredProductCategories, togglePreferredCategory)}
                </div>
                {errors.preferredProductCategories && <p className="text-red text-xs mt-1">{errors.preferredProductCategories}</p>}
              </div>
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
                <p className="font-medium text-navy mb-1">Influencer Payout Benefits</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-orange mt-0.5" />
                    <span>Higher commission tiers — up to 25% on select products</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-orange mt-0.5" />
                    <span>Monthly payouts on net-30 basis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-orange mt-0.5" />
                    <span>Performance bonuses for top creators</span>
                  </li>
                </ul>
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
                  As an influencer partner, you are required to clearly disclose your relationship with Kauvex
                  whenever you promote our products. This includes using #ad, #sponsored, or clear verbal/written
                  disclosure in all content formats.
                </p>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.acceptedDisclosure}
                    onChange={(e) => updateField("acceptedDisclosure", e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange/20"
                  />
                  <span className="text-sm text-gray-700">
                    I acknowledge that I must clearly disclose my influencer relationship with Kauvex in all promotional content.
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
                  <p className="mb-2"><strong>2. Commission Structure.</strong> Commissions are earned on qualifying purchases made through your unique tracking links or discount codes. Standard rates apply unless otherwise agreed.</p>
                  <p className="mb-2"><strong>3. Payment Terms.</strong> Commissions are paid monthly on a net-30 schedule. A minimum payout threshold of ₦5,000 applies. Unpaid balances below threshold carry over.</p>
                  <p className="mb-2"><strong>4. Prohibited Activities.</strong> You may not use spam, paid advertising on branded keywords, or fraudulent methods to generate commissions. Violations will result in account termination.</p>
                  <p className="mb-2"><strong>5. Cookie Duration.</strong> Standard cookie window is 30 days. Any qualifying purchase within this period is attributed to your referral.</p>
                  <p className="mb-2"><strong>6. Content Standards.</strong> All promotional content must comply with applicable advertising standards and include proper disclosures.</p>
                </div>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.acceptedTerms}
                    onChange={(e) => updateField("acceptedTerms", e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange/20"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the Kauvex Influencer Program Terms of Service and Privacy Policy.
                  </span>
                </label>
                {errors.acceptedTerms && (
                  <p className="text-red text-xs mt-1">{errors.acceptedTerms}</p>
                )}
              </div>

              <div className="bg-navy/5 rounded-lg p-4">
                <h3 className="font-semibold text-navy text-sm mb-2">Application Summary</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li><strong>Name:</strong> {formData.fullName}</li>
                  <li><strong>Username:</strong> @{formData.desiredUsername}</li>
                  <li><strong>Email:</strong> {formData.email}</li>
                  <li><strong>Primary Platform:</strong> {formData.platformType}</li>
                  <li><strong>Niche:</strong> {formData.niche}</li>
                  <li><strong>Engagement Rate:</strong> {formData.engagementRate}%</li>
                  <li><strong>Categories:</strong> {formData.contentCategories.join(", ")}</li>
                  <li><strong>Social Profiles:</strong> {formData.socialProfiles.filter((s) => s.platform).length}</li>
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
