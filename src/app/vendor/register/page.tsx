"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle,
  User,
  Banknote,
  CreditCard,
  FileText,
  AlertCircle,
  Globe,
  Building2,
  ClipboardList,
} from "lucide-react";
import { KAUVEX_CATEGORIES } from "@/lib/categories";

type IdType = "passport" | "drivers-license" | "national-id";
type PaymentMethod = "bank" | "paypal" | "payoneer";

interface FormData {
  // Step 1 - Account
  email: string;
  password: string;
  confirmPassword: string;
  // Step 2 - Store
  storeName: string;
  category: string;
  country: string;
  storeDescription: string;
  // Step 3 - Business
  idType: IdType;
  idNumber: string;
  businessRegNumber: string;
  // Step 4 - Payout
  paymentMethod: PaymentMethod;
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  paypalEmail: string;
  payoneerEmail: string;
  // Step 5 - Review
  agreeTerms: boolean;
}

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "UK", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "NG", name: "Nigeria" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BR", name: "Brazil" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "AE", name: "UAE" },
  { code: "ZA", name: "South Africa" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "EG", name: "Egypt" },
  { code: "SG", name: "Singapore" },
];

const ID_TYPES: { value: IdType; label: string }[] = [
  { value: "passport", label: "Passport" },
  { value: "drivers-license", label: "Driver's License" },
  { value: "national-id", label: "National ID" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "bank", label: "Bank Transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "payoneer", label: "Payoneer" },
];

const STEPS = [
  { label: "Account", icon: Mail },
  { label: "Store", icon: Building2 },
  { label: "Business", icon: FileText },
  { label: "Payout", icon: Banknote },
  { label: "Review", icon: ClipboardList },
];

const initialFormData: FormData = {
  email: "",
  password: "",
  confirmPassword: "",
  storeName: "",
  category: "",
  country: "",
  storeDescription: "",
  idType: "passport",
  idNumber: "",
  businessRegNumber: "",
  paymentMethod: "bank",
  bankName: "",
  accountName: "",
  accountNumber: "",
  bankCode: "",
  paypalEmail: "",
  payoneerEmail: "",
  agreeTerms: false,
};

export default function VendorRegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};

    if (s === 1) {
      if (!form.email.trim()) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
      if (!form.password) errs.password = "Password is required";
      else if (form.password.length < 8) errs.password = "At least 8 characters";
      if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    }

    if (s === 2) {
      if (!form.storeName.trim()) errs.storeName = "Store name is required";
      if (!form.category) errs.category = "Please select a category";
      if (!form.country) errs.country = "Please select a country";
      if (!form.storeDescription.trim()) errs.storeDescription = "Store description is required";
      else if (form.storeDescription.trim().length < 20) errs.storeDescription = "At least 20 characters";
    }

    if (s === 3) {
      if (!form.idType) errs.idType = "Select an ID type";
      if (!form.idNumber.trim()) errs.idNumber = "ID number is required";
    }

    if (s === 4) {
      if (!form.paymentMethod) errs.paymentMethod = "Select a payment method";
      if (form.paymentMethod === "bank") {
        if (!form.bankName.trim()) errs.bankName = "Bank name is required";
        if (!form.accountName.trim()) errs.accountName = "Account name is required";
        if (!form.accountNumber.trim()) errs.accountNumber = "Account number is required";
        if (!form.bankCode.trim()) errs.bankCode = "Bank code is required";
      }
      if (form.paymentMethod === "paypal") {
        if (!form.paypalEmail.trim()) errs.paypalEmail = "PayPal email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.paypalEmail)) errs.paypalEmail = "Invalid email format";
      }
      if (form.paymentMethod === "payoneer") {
        if (!form.payoneerEmail.trim()) errs.payoneerEmail = "Payoneer email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.payoneerEmail)) errs.payoneerEmail = "Invalid email format";
      }
    }

    if (s === 5) {
      if (!form.agreeTerms) errs.agreeTerms = "You must agree to the terms";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!validateStep(5)) return;
    console.log("Vendor Registration Data:", form);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setStep(1);
      setForm(initialFormData);
      setErrors({});
    }, 4000);
  };

  const renderFieldError = (key: string) => {
    if (!errors[key]) return null;
    return (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
        <AlertCircle className="w-3 h-3" />
        {errors[key]}
      </p>
    );
  };

  const inputClass = (key: string) =>
    `w-full px-4 py-2.5 border rounded-lg text-sm text-text-1 placeholder:text-text-4 bg-white focus:outline-none focus:ring-2 transition-colors ${
      errors[key]
        ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
        : "border-border focus:ring-orange-500/20 focus:border-orange-500"
    }`;

  const labelClass = "block text-sm font-medium text-text-2 mb-1.5";

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h2 className="font-syne font-700 text-2xl text-text-1 mb-2">
            Application Submitted!
          </h2>
          <p className="text-text-3 text-sm leading-relaxed">
            Thank you for registering as a KAUVEX seller. Our team will review
            your application and get back to you within 2-3 business days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-[#0F1F3D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-orange rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange/30">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-syne font-800 text-2xl text-white mb-1">
            Become a KAUVEX Seller
          </h1>
          <p className="text-white/60 text-sm">
            Set up your store and start selling globally
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === step;
              const isCompleted = stepNum < step;
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isCompleted
                          ? "bg-orange text-white"
                          : isActive
                            ? "bg-orange text-white ring-4 ring-orange/30"
                            : "bg-white/10 text-white/40"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1.5 font-medium ${
                        isActive
                          ? "text-orange"
                          : isCompleted
                            ? "text-white/80"
                            : "text-white/30"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-3 mt-[-1.25rem] rounded-full transition-colors duration-300 ${
                        isCompleted ? "bg-orange" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-strong border border-border p-8">
          {/* Step Title */}
          <div className="mb-6">
            <h2 className="font-syne font-700 text-xl text-text-1">
              {step === 1 && "Create Your Account"}
              {step === 2 && "Tell Us About Your Store"}
              {step === 3 && "Business Verification"}
              {step === 4 && "Payout Setup"}
              {step === 5 && "Review & Submit"}
            </h2>
            <p className="text-text-4 text-sm mt-1">
              {step === 1 && "Enter your email and create a password to get started"}
              {step === 2 && "Help customers find and learn about your store"}
              {step === 3 && "Verify your identity to start selling"}
              {step === 4 && "Set up how you'll receive payments"}
              {step === 5 && "Make sure everything looks correct before submitting"}
            </p>
          </div>

          {/* ============ STEP 1: Account ============ */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={`${inputClass("email")} pl-10`}
                    placeholder="you@example.com"
                  />
                </div>
                {renderFieldError("email")}
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className={`${inputClass("password")} pl-10 pr-10`}
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 hover:text-text-2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {renderFieldError("password")}
              </div>

              <div>
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    className={`${inputClass("confirmPassword")} pl-10`}
                    placeholder="Re-enter your password"
                  />
                </div>
                {renderFieldError("confirmPassword")}
              </div>

              <p className="text-center text-sm text-text-4 pt-2">
                Already have an account?{" "}
                <Link
                  href="/vendor/login"
                  className="text-orange font-semibold hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          )}

          {/* ============ STEP 2: Store Details ============ */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className={labelClass}>Store Name</label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                  <input
                    type="text"
                    value={form.storeName}
                    onChange={(e) => updateField("storeName", e.target.value)}
                    className={`${inputClass("storeName")} pl-10`}
                    placeholder="My KAUVEX Store"
                  />
                </div>
                {renderFieldError("storeName")}
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                  <select
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    className={`${inputClass("category")} pl-10 appearance-none`}
                  >
                    <option value="">Select a category...</option>
                    {KAUVEX_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {renderFieldError("category")}
              </div>

              <div>
                <label className={labelClass}>Country</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                  <select
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className={`${inputClass("country")} pl-10 appearance-none`}
                  >
                    <option value="">Select your country...</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {renderFieldError("country")}
              </div>

              <div>
                <label className={labelClass}>Store Description</label>
                <textarea
                  value={form.storeDescription}
                  onChange={(e) => updateField("storeDescription", e.target.value)}
                  className={`${inputClass("storeDescription")} min-h-[100px] resize-y`}
                  placeholder="Tell customers about your store and what you sell..."
                  rows={4}
                />
                <div className="flex items-center justify-between mt-1">
                  <div>{renderFieldError("storeDescription")}</div>
                  <span className="text-xs text-text-4">
                    {form.storeDescription.length} / 20 min
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ============ STEP 3: Business Verification ============ */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className={labelClass}>ID Type</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                  <select
                    value={form.idType}
                    onChange={(e) => updateField("idType", e.target.value as IdType)}
                    className={`${inputClass("idType")} pl-10 appearance-none`}
                  >
                    {ID_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                {renderFieldError("idType")}
              </div>

              <div>
                <label className={labelClass}>ID Number</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                  <input
                    type="text"
                    value={form.idNumber}
                    onChange={(e) => updateField("idNumber", e.target.value)}
                    className={`${inputClass("idNumber")} pl-10`}
                    placeholder="Enter your ID number"
                  />
                </div>
                {renderFieldError("idNumber")}
              </div>

              <div>
                <label className={labelClass}>
                  Business Registration Number{" "}
                  <span className="text-text-4 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                  <input
                    type="text"
                    value={form.businessRegNumber}
                    onChange={(e) => updateField("businessRegNumber", e.target.value)}
                    className={`${inputClass("businessRegNumber")} pl-10`}
                    placeholder="e.g. RC-1234567"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800">
                  This is optional for <strong>Bronze tier</strong> sellers. You
                  can provide this later in your settings.
                </p>
              </div>
            </div>
          )}

          {/* ============ STEP 4: Payout Setup ============ */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className={labelClass}>Payment Method</label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                  <select
                    value={form.paymentMethod}
                    onChange={(e) =>
                      updateField("paymentMethod", e.target.value as PaymentMethod)
                    }
                    className={`${inputClass("paymentMethod")} pl-10 appearance-none`}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                {renderFieldError("paymentMethod")}
              </div>

              {/* Bank Transfer Fields */}
              {form.paymentMethod === "bank" && (
                <div className="space-y-4 p-4 rounded-xl bg-gray-50 border border-border">
                  <p className="text-xs font-semibold text-text-3 uppercase tracking-wider">
                    Bank Account Details
                  </p>
                  <div>
                    <label className={labelClass}>Bank Name</label>
                    <input
                      type="text"
                      value={form.bankName}
                      onChange={(e) => updateField("bankName", e.target.value)}
                      className={inputClass("bankName")}
                      placeholder="e.g. Chase, Barclays, GTBank"
                    />
                    {renderFieldError("bankName")}
                  </div>
                  <div>
                    <label className={labelClass}>Account Name</label>
                    <input
                      type="text"
                      value={form.accountName}
                      onChange={(e) => updateField("accountName", e.target.value)}
                      className={inputClass("accountName")}
                      placeholder="Full name on account"
                    />
                    {renderFieldError("accountName")}
                  </div>
                  <div>
                    <label className={labelClass}>Account Number</label>
                    <input
                      type="text"
                      value={form.accountNumber}
                      onChange={(e) => updateField("accountNumber", e.target.value)}
                      className={inputClass("accountNumber")}
                      placeholder="Enter account number"
                    />
                    {renderFieldError("accountNumber")}
                  </div>
                  <div>
                    <label className={labelClass}>Bank Code / Routing Number</label>
                    <input
                      type="text"
                      value={form.bankCode}
                      onChange={(e) => updateField("bankCode", e.target.value)}
                      className={inputClass("bankCode")}
                      placeholder="Routing number or sort code"
                    />
                    {renderFieldError("bankCode")}
                  </div>
                </div>
              )}

              {/* PayPal */}
              {form.paymentMethod === "paypal" && (
                <div className="p-4 rounded-xl bg-gray-50 border border-border">
                  <div>
                    <label className={labelClass}>PayPal Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                      <input
                        type="email"
                        value={form.paypalEmail}
                        onChange={(e) => updateField("paypalEmail", e.target.value)}
                        className={`${inputClass("paypalEmail")} pl-10`}
                        placeholder="paypal@example.com"
                      />
                    </div>
                    {renderFieldError("paypalEmail")}
                  </div>
                </div>
              )}

              {/* Payoneer */}
              {form.paymentMethod === "payoneer" && (
                <div className="p-4 rounded-xl bg-gray-50 border border-border">
                  <div>
                    <label className={labelClass}>Payoneer Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                      <input
                        type="email"
                        value={form.payoneerEmail}
                        onChange={(e) => updateField("payoneerEmail", e.target.value)}
                        className={`${inputClass("payoneerEmail")} pl-10`}
                        placeholder="payoneer@example.com"
                      />
                    </div>
                    {renderFieldError("payoneerEmail")}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============ STEP 5: Review ============ */}
          {step === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-border">
                  <h3 className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    Account
                  </h3>
                  <p className="text-sm text-text-1 font-medium break-all">{form.email}</p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-border">
                  <h3 className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    Store
                  </h3>
                  <p className="text-sm text-text-1 font-medium">{form.storeName}</p>
                  <p className="text-xs text-text-4">
                    {KAUVEX_CATEGORIES.find((c) => c.slug === form.category)?.name ||
                      form.category}
                    , {COUNTRIES.find((c) => c.code === form.country)?.name || form.country}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-border">
                  <h3 className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Verification
                  </h3>
                  <p className="text-sm text-text-1 font-medium">
                    {ID_TYPES.find((t) => t.value === form.idType)?.label}: {form.idNumber}
                  </p>
                  {form.businessRegNumber && (
                    <p className="text-xs text-text-4">
                      Business Reg: {form.businessRegNumber}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-border">
                  <h3 className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Banknote className="w-3.5 h-3.5" />
                    Payout
                  </h3>
                  <p className="text-sm text-text-1 font-medium">
                    {PAYMENT_METHODS.find((m) => m.value === form.paymentMethod)?.label}
                  </p>
                  <p className="text-xs text-text-4">
                    {form.paymentMethod === "bank" && `${form.bankName} - ${form.accountNumber}`}
                    {form.paymentMethod === "paypal" && form.paypalEmail}
                    {form.paymentMethod === "payoneer" && form.payoneerEmail}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-border">
                <h3 className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" />
                  Store Description
                </h3>
                <p className="text-sm text-text-2 leading-relaxed">
                  {form.storeDescription}
                </p>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-border cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={(e) => updateField("agreeTerms", e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange-500"
                />
                <span className="text-sm text-text-2">
                  I agree to the{" "}
                  <Link href="/terms" className="text-orange font-semibold hover:underline">
                    KAUVEX Seller Terms of Service
                  </Link>
                </span>
              </label>
              {renderFieldError("agreeTerms")}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <div>
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-gray-200 text-sm font-semibold text-text-2 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <Link
                  href="/vendor/login"
                  className="inline-flex items-center gap-1 text-sm text-text-4 hover:text-orange transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to login
                </Link>
              )}
            </div>

            <div>
              {step < 5 ? (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange hover:bg-orange-600 text-white text-sm font-bold shadow-sm hover:shadow-md transition-all"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-8 py-2.5 rounded-lg bg-orange hover:bg-orange-600 text-white text-sm font-bold shadow-sm hover:shadow-md transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  Submit Application
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/40 mt-6">
          By registering, you agree to the{" "}
          <Link href="/terms" className="text-white/60 hover:text-white underline underline-offset-2">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-white/60 hover:text-white underline underline-offset-2">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
