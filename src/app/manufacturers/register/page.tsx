"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { MANUFACTURING_CATEGORIES, CERTIFICATION_TYPES } from "@/lib/manufacturers/categories";

const steps = [
  { id: 1, label: "Business Identity" },
  { id: 2, label: "Category" },
  { id: 3, label: "Capability" },
  { id: 4, label: "Quality" },
  { id: 5, label: "Pricing" },
  { id: 6, label: "Logistics" },
  { id: 7, label: "Review" },
];

const countries = [
  "Nigeria","China","India","Turkey","Bangladesh","Vietnam","Indonesia",
  "Pakistan","Thailand","Mexico","Brazil","Egypt","Ethiopia","Kenya",
  "South Africa","Morocco","Ghana","United States","Germany","United Kingdom",
];

const categories = Object.keys(MANUFACTURING_CATEGORIES);

const currencies = ["USD","NGN","CNY","INR","TRY","BDT","VND","IDR","PKR","THB","EUR","GBP","BRL","ZAR","KES","GHS"];

const incoterms = ["FOB","CIF","EXW","DDP","DAP","FCA"];

const paymentTerms = ["100% Advance","30% Deposit + 70% Before Shipping","30% Deposit + 70% on Delivery","Letter of Credit","Net 30","Net 60"];

const certifications = CERTIFICATION_TYPES;

const employeeCounts = ["1-10","11-50","51-200","201-500","501-1000","1000+"];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    country: "",
    city: "",
    registrationNumber: "",
    yearEstablished: "",
    employeeCount: "",
    factorySize: "",
    website: "",
    businessType: "manufacturer",
    primaryCategory: "",
    secondaryCategories: [] as string[],
    productTypes: "",
    manufacturingHub: "",
    monthlyCapacity: "",
    capacityUtilization: "",
    moq: "",
    leadTimeDays: "",
    customizationOptions: [] as string[],
    certifications: [] as string[],
    certDocuments: [] as string[],
    pricingTiers: [
      { minQty: "", maxQty: "", unitPrice: "" },
      { minQty: "", maxQty: "", unitPrice: "" },
      { minQty: "", maxQty: "", unitPrice: "" },
    ],
    currency: "USD",
    depositPercentage: "30",
    paymentTerms: "",
    samplePolicy: "",
    incoterms: "",
    exportExperience: "",
    nearestPort: "",
    documentationExperience: [] as string[],
    agreeTerms: false,
    agreeEscrow: false,
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleArrayField(field: string, value: string) {
    setForm((prev) => {
      const arr = prev[field as keyof typeof prev] as string[];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [field]: next };
    });
  }

  function updatePricingTier(index: number, field: string, value: string) {
    setForm((prev) => {
      const tiers = [...prev.pricingTiers];
      tiers[index] = { ...tiers[index], [field]: value };
      return { ...prev, pricingTiers: tiers };
    });
  }

  function toggleCustomization(value: string) {
    setForm((prev) => {
      const opts = prev.customizationOptions.includes(value)
        ? prev.customizationOptions.filter((v) => v !== value)
        : [...prev.customizationOptions, value];
      return { ...prev, customizationOptions: opts };
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const slug = generateSlug(form.companyName);
      const payload = {
        companyName: form.companyName,
        slug,
        countryCode: form.country,
        city: form.city,
        manufacturingHub: form.manufacturingHub,
        registrationNumber: form.registrationNumber,
        businessType: form.businessType as "manufacturer" | "trading_company" | "agent",
        yearEstablished: form.yearEstablished ? parseInt(form.yearEstablished) : undefined,
        employeeCountRange: form.employeeCount,
        factorySizeSqm: form.factorySize ? parseInt(form.factorySize) : undefined,
        website: form.website || undefined,
        categories: [
          ...(form.primaryCategory ? [{ category: form.primaryCategory, isPrimary: true, productTypes: form.productTypes ? form.productTypes.split(",").map((s) => s.trim()) : [] }] : []),
          ...form.secondaryCategories.map((c) => ({ category: c, isPrimary: false, productTypes: [] })),
        ],
        capability: {
          monthlyCapacity: form.monthlyCapacity ? parseInt(form.monthlyCapacity.replace(/,/g, "")) : undefined,
          currentUtilizationPercent: form.capacityUtilization ? parseInt(form.capacityUtilization) : undefined,
          defaultMoq: form.moq ? parseInt(form.moq.replace(/,/g, "")) : undefined,
          defaultLeadTimeDays: form.leadTimeDays ? parseInt(form.leadTimeDays) : undefined,
          allowsPrivateLabel: form.customizationOptions.includes("Private Label"),
          allowsCustomPackaging: form.customizationOptions.includes("Custom Packaging"),
          allowsOem: form.customizationOptions.includes("OEM Design"),
          allowsOdm: form.customizationOptions.includes("ODM Design"),
        },
        certifications: form.certifications.map((c) => ({
          certificationType: c,
        })),
      };
      const res = await fetch("/api/v1/manufacturers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="rounded-xl bg-white p-10 shadow-sm border border-gray-100 text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Application Submitted</h1>
          <p className="mt-3 text-gray-600">
            Your manufacturer registration is under review. We&apos;ll verify your details and get back to you within 3 business days.
          </p>
          <a href="/" className="mt-6 inline-block rounded-lg bg-[#FF6B00] px-6 py-3 font-semibold text-white hover:bg-[#e55f00]">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#0A1628]">Manufacturer Registration</h1>
          <p className="mt-2 text-gray-600">Apply to list your factory on the Kauvex Global Manufacturer Portal</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      step === s.id
                        ? "bg-[#FF6B00] text-white"
                        : step > s.id
                        ? "bg-[#0A1628] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s.id ? "✓" : s.id}
                  </div>
                  <span
                    className={`mt-1.5 hidden text-xs font-medium sm:block ${
                      step === s.id ? "text-[#FF6B00]" : step > s.id ? "text-[#0A1628]" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 w-8 sm:w-12 ${
                      step > s.id ? "bg-[#0A1628]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* Step 1: Business Identity */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0A1628]">Business Identity</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country *</label>
                  <select
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  >
                    <option value="">Select country</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Registration Number</label>
                  <input
                    type="text"
                    value={form.registrationNumber}
                    onChange={(e) => updateField("registrationNumber", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year Established *</label>
                  <input
                    type="number"
                    min={1900}
                    max={2026}
                    value={form.yearEstablished}
                    onChange={(e) => updateField("yearEstablished", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee Count *</label>
                  <select
                    value={form.employeeCount}
                    onChange={(e) => updateField("employeeCount", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  >
                    <option value="">Select range</option>
                    {employeeCounts.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Factory Size (sqm)</label>
                  <input
                    type="text"
                    value={form.factorySize}
                    onChange={(e) => updateField("factorySize", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Business Type *</label>
                  <select
                    value={form.businessType}
                    onChange={(e) => updateField("businessType", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  >
                    <option value="manufacturer">Manufacturer</option>
                    <option value="oem">OEM Factory</option>
                    <option value="odm">ODM Factory</option>
                    <option value="trading">Trading Company with Factory</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Manufacturing Category */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0A1628]">Manufacturing Category</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Primary Category *</label>
                <select
                  value={form.primaryCategory}
                  onChange={(e) => updateField("primaryCategory", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Secondary Categories</label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {categories.map((c) => (
                    <label
                      key={c}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm ${
                        form.secondaryCategories.includes(c)
                          ? "border-[#FF6B00] bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.secondaryCategories.includes(c)}
                        onChange={() => toggleArrayField("secondaryCategories", c)}
                        className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Types *</label>
                <textarea
                  rows={3}
                  value={form.productTypes}
                  onChange={(e) => updateField("productTypes", e.target.value)}
                  placeholder="e.g., USB cables, power adapters, wireless chargers"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Manufacturing Hub</label>
                <input
                  type="text"
                  value={form.manufacturingHub}
                  onChange={(e) => updateField("manufacturingHub", e.target.value)}
                  placeholder="e.g., Shenzhen, Guangzhou"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                />
              </div>
            </div>
          )}

          {/* Step 3: Production Capability */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0A1628]">Production Capability</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monthly Capacity (units) *</label>
                  <input
                    type="text"
                    value={form.monthlyCapacity}
                    onChange={(e) => updateField("monthlyCapacity", e.target.value)}
                    placeholder="e.g., 500,000"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Utilization (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.capacityUtilization}
                    onChange={(e) => updateField("capacityUtilization", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimum Order Quantity (MOQ) *</label>
                  <input
                    type="text"
                    value={form.moq}
                    onChange={(e) => updateField("moq", e.target.value)}
                    placeholder="e.g., 500"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lead Time (days) *</label>
                  <input
                    type="text"
                    value={form.leadTimeDays}
                    onChange={(e) => updateField("leadTimeDays", e.target.value)}
                    placeholder="e.g., 15-30"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customization Options</label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {["Logo Printing","Custom Packaging","Color Variants","OEM Design","ODM Design","Private Label"].map(
                    (opt) => (
                      <label
                        key={opt}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm ${
                          form.customizationOptions.includes(opt)
                            ? "border-[#FF6B00] bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.customizationOptions.includes(opt)}
                          onChange={() => toggleCustomization(opt)}
                          className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                        />
                        {opt}
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Quality & Compliance */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0A1628]">Quality & Compliance</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Certifications</label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {certifications.map((cert) => (
                    <label
                      key={cert}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm ${
                        form.certifications.includes(cert)
                          ? "border-[#FF6B00] bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.certifications.includes(cert)}
                        onChange={() => toggleArrayField("certifications", cert)}
                        className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                      {cert}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Certification Documents (upload links or descriptions)
                </label>
                <textarea
                  rows={3}
                  value={form.certDocuments.join("\n")}
                  onChange={(e) => {
                    const lines = e.target.value.split("\n").filter(Boolean);
                    setForm((prev) => ({ ...prev, certDocuments: lines }));
                  }}
                  placeholder="Paste document URLs or describe your certifications (one per line)"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                />
              </div>
            </div>
          )}

          {/* Step 5: Pricing & Payment */}
          {step === 5 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0A1628]">Pricing & Payment</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pricing Tiers</label>
                <p className="text-xs text-gray-500">Define volume-based pricing (optional but recommended)</p>
                <div className="mt-3 space-y-3">
                  {form.pricingTiers.map((tier, i) => (
                    <div key={i} className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500">Min Qty</label>
                        <input
                          type="text"
                          value={tier.minQty}
                          onChange={(e) => updatePricingTier(i, "minQty", e.target.value)}
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Max Qty</label>
                        <input
                          type="text"
                          value={tier.maxQty}
                          onChange={(e) => updatePricingTier(i, "maxQty", e.target.value)}
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Unit Price</label>
                        <input
                          type="text"
                          value={tier.unitPrice}
                          onChange={(e) => updatePricingTier(i, "unitPrice", e.target.value)}
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => updateField("currency", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  >
                    {currencies.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deposit Percentage (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.depositPercentage}
                    onChange={(e) => updateField("depositPercentage", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                  <select
                    value={form.paymentTerms}
                    onChange={(e) => updateField("paymentTerms", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  >
                    <option value="">Select terms</option>
                    {paymentTerms.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Incoterms</label>
                  <select
                    value={form.incoterms}
                    onChange={(e) => updateField("incoterms", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  >
                    <option value="">Select incoterm</option>
                    {incoterms.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sample Policy</label>
                <textarea
                  rows={2}
                  value={form.samplePolicy}
                  onChange={(e) => updateField("samplePolicy", e.target.value)}
                  placeholder="e.g., Free samples for orders above 1000 units, sample cost $50 refundable"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                />
              </div>
            </div>
          )}

          {/* Step 6: Logistics */}
          {step === 6 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0A1628]">Logistics</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Export Experience</label>
                  <select
                    value={form.exportExperience}
                    onChange={(e) => updateField("exportExperience", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  >
                    <option value="">Select experience</option>
                    <option value="none">No export experience</option>
                    <option value="limited">Limited (1-2 countries)</option>
                    <option value="moderate">Moderate (3-5 countries)</option>
                    <option value="extensive">Extensive (5+ countries)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nearest Port</label>
                  <input
                    type="text"
                    value={form.nearestPort}
                    onChange={(e) => updateField("nearestPort", e.target.value)}
                    placeholder="e.g., Lagos Port, Shenzhen Port"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Documentation Experience</label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {["Commercial Invoice","Packing List","Certificate of Origin","Bill of Lading","Insurance Certificate","Customs Declaration"].map(
                    (doc) => (
                      <label
                        key={doc}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm ${
                          form.documentationExperience.includes(doc)
                            ? "border-[#FF6B00] bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.documentationExperience.includes(doc)}
                          onChange={() => toggleArrayField("documentationExperience", doc)}
                          className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                        />
                        {doc}
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Terms & Review */}
          {step === 7 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0A1628]">Terms & Review</h2>
              <div className="rounded-lg bg-gray-50 p-5 text-sm text-gray-600 space-y-3">
                <p>
                  <strong className="text-[#0A1628]">Company:</strong> {form.companyName || "—"} &middot; {form.city || "—"}, {form.country || "—"}
                </p>
                <p>
                  <strong className="text-[#0A1628]">Category:</strong> {form.primaryCategory || "—"}
                </p>
                <p>
                  <strong className="text-[#0A1628]">Capacity:</strong> {form.monthlyCapacity || "—"} units/mo &middot; MOQ: {form.moq || "—"}
                </p>
                <p>
                  <strong className="text-[#0A1628]">Certifications:</strong> {form.certifications.length > 0 ? form.certifications.join(", ") : "—"}
                </p>
                <p>
                  <strong className="text-[#0A1628]">Payment:</strong> {form.depositPercentage || "—"}% deposit &middot; {form.paymentTerms || "—"} &middot; {form.incoterms || "—"}
                </p>
                <p>
                  <strong className="text-[#0A1628]">Currency:</strong> {form.currency} &middot; <strong className="text-[#0A1628]">Lead Time:</strong> {form.leadTimeDays || "—"} days
                </p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={(e) => updateField("agreeTerms", e.target.checked ? "true" : "false")}
                  className="mt-0.5 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                />
                <span className="text-sm text-gray-600">
                  I agree to the Kauvex Manufacturer Terms of Service, including quality standards,
                  response time requirements, and dispute resolution policies.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreeEscrow}
                  onChange={(e) => updateField("agreeEscrow", e.target.checked ? "true" : "false")}
                  className="mt-0.5 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                />
                <span className="text-sm text-gray-600">
                  I agree to participate in the Kauvex Escrow Protection program, holding buyer
                  payments until order delivery is confirmed.
                </span>
              </label>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="border-gray-300"
              >
                Back
              </Button>
            ) : (
              <div />
            )}
            {step < 7 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="bg-[#FF6B00] hover:bg-[#e55f00]"
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!form.agreeTerms || !form.agreeEscrow || submitting}
                className="bg-[#FF6B00] hover:bg-[#e55f00] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
