"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Upload,
  Building2,
  User,
  Award,
  FileCheck,
  ArrowRight,
  X,
} from "lucide-react";

const categories = [
  "CCTV Installer", "Solar Installer", "Solar Engineer", "Network Engineer",
  "Electrician", "Plumber", "Carpenter", "AC Technician", "Architect",
  "Structural Engineer", "Quantity Surveyor", "Building Contractor",
  "Civil Engineer", "Marine Engineer", "Naval Architect", "Boat Builder",
  "Dredging Engineer", "Hydrographic Surveyor", "Agricultural Engineer",
  "Mechanical Engineer", "Industrial Electrician", "Biomedical Engineer",
  "Automotive Engineer", "Fiber Optic Technician", "Security Consultant",
  "Interior Designer", "Painter", "Welder/Fabricator", "Furniture Assembler",
  "Smart Home Specialist", "Energy Auditor", "Commissioning Engineer",
];

const steps = [
  { id: 1, label: "Account Type", icon: User },
  { id: 2, label: "Professional Details", icon: Award },
  { id: 3, label: "Credentials", icon: Upload },
  { id: 4, label: "Review & Submit", icon: FileCheck },
];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    accountType: "individual",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    primaryCategory: "",
    secondaryCategories: [] as string[],
    yearsExperience: "",
    coverageArea: "",
    bio: "",
    credentials: [] as { type: string; issuingBody: string; certificateNumber: string; documentUrl: string }[],
  });

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const addCredential = () => {
    setForm((prev) => ({
      ...prev,
      credentials: [...prev.credentials, { type: "", issuingBody: "", certificateNumber: "", documentUrl: "" }],
    }));
  };

  const updateCredential = (index: number, field: string, value: string) => {
    setForm((prev) => {
      const updated = [...prev.credentials];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, credentials: updated };
    });
  };

  const removeCredential = (index: number) => {
    setForm((prev) => ({
      ...prev,
      credentials: prev.credentials.filter((_, i) => i !== index),
    }));
  };

  const toggleSecondaryCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      secondaryCategories: prev.secondaryCategories.includes(cat)
        ? prev.secondaryCategories.filter((c) => c !== cat)
        : [...prev.secondaryCategories, cat],
    }));
  };

  const validateStep = (): boolean => {
    setError("");
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.email || !form.phone) {
        setError("Please fill in all required fields.");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setError("Please enter a valid email address.");
        return false;
      }
    }
    if (step === 2) {
      if (!form.primaryCategory) { setError("Please select a primary category."); return false; }
    }
    if (step === 3) {
      if (form.credentials.length === 0) { setError("Please add at least one credential."); return false; }
      for (const cred of form.credentials) {
        if (!cred.type || !cred.issuingBody || !cred.certificateNumber) {
          setError("Please complete all credential fields.");
          return false;
        }
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/v1/kpn/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }
      setSuccess(true);
      setTimeout(() => router.push("/pro/dashboard?welcome=true"), 1000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-navy mb-2">Registration Successful!</h1>
          <p className="text-gray-500 mb-6">Redirecting to your dashboard...</p>
          <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {welcome && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3 text-center">
          <p className="text-green-700 font-medium flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" /> Welcome to Kauvex Pro Network! Your account is ready.
          </p>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/pro" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy mb-8 text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to KPN Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Become a KPN Professional</h1>
          <p className="text-gray-500">Complete your registration to join the network.</p>
        </div>

        <div className="flex items-center justify-between mb-10">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > s.id ? "bg-green-500 text-white" : step === s.id ? "bg-orange text-white" : "bg-gray-200 text-gray-400"
                }`}>
                  {step > s.id ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step >= s.id ? "text-navy" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && <div className={`w-12 sm:w-20 h-0.5 mx-2 ${step > s.id ? "bg-green-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 flex items-center gap-2">
              <X className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-navy">Account Type & Basic Info</h2>
              <div className="grid grid-cols-2 gap-4">
                {["individual", "company"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => update("accountType", type)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.accountType === type
                        ? "border-orange bg-orange/5 ring-1 ring-orange/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                      form.accountType === type ? "bg-orange" : "bg-gray-100"
                    }`}>
                      {type === "individual" ? (
                        <User className={`w-5 h-5 ${form.accountType === type ? "text-white" : "text-gray-500"}`} />
                      ) : (
                        <Building2 className={`w-5 h-5 ${form.accountType === type ? "text-white" : "text-gray-500"}`} />
                      )}
                    </div>
                    <div className={`font-semibold capitalize ${form.accountType === type ? "text-orange" : "text-navy"}`}>
                      {type === "individual" ? "Individual" : "Company"}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {type === "individual" ? "Solo professional" : "Registered business"}
                    </div>
                  </button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">First Name *</label>
                  <input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Last Name *</label>
                  <input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50" placeholder="Doe" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Phone *</label>
                  <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50" placeholder="+234 800 000 0000" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-navy">Professional Details</h2>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Primary Category *</label>
                <select value={form.primaryCategory} onChange={(e) => update("primaryCategory", e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50 bg-white">
                  <option value="">Select a category...</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-2">Secondary Categories (optional)</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {categories.filter((c) => c !== form.primaryCategory).map((c) => (
                    <button key={c} type="button" onClick={() => toggleSecondaryCategory(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        form.secondaryCategories.includes(c)
                          ? "bg-orange text-white border-orange"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Years of Experience</label>
                  <input type="number" min="0" value={form.yearsExperience} onChange={(e) => update("yearsExperience", e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50" placeholder="5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Coverage Area</label>
                  <input type="text" value={form.coverageArea} onChange={(e) => update("coverageArea", e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50" placeholder="e.g., Lagos, Abuja, Port Harcourt" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Professional Bio</label>
                <textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50 resize-none"
                  placeholder="Tell clients about your expertise, experience, and what makes you stand out..." />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-navy">Credentials</h2>
                <button type="button" onClick={addCredential}
                  className="inline-flex items-center gap-1.5 text-sm text-orange font-semibold hover:underline">
                  + Add Credential
                </button>
              </div>
              {form.credentials.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <Upload className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No credentials added yet. Click "Add Credential" to upload your qualifications.</p>
                </div>
              )}
              {form.credentials.map((cred, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-navy">Credential #{i + 1}</span>
                    <button type="button" onClick={() => removeCredential(i)} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Credential Type</label>
                      <input type="text" value={cred.type} onChange={(e) => updateCredential(i, "type", e.target.value)}
                        className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50"
                        placeholder="e.g., Bachelor's Degree, Certification" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Issuing Body</label>
                      <input type="text" value={cred.issuingBody} onChange={(e) => updateCredential(i, "issuingBody", e.target.value)}
                        className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50"
                        placeholder="e.g., University of Lagos, COREN" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Certificate Number</label>
                      <input type="text" value={cred.certificateNumber} onChange={(e) => updateCredential(i, "certificateNumber", e.target.value)}
                        className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50"
                        placeholder="Certificate ID" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Document URL (optional)</label>
                      <input type="url" value={cred.documentUrl} onChange={(e) => updateCredential(i, "documentUrl", e.target.value)}
                        className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50"
                        placeholder="https://..." />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-navy">Review Your Information</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-navy mb-2">Account Type</h3>
                  <p className="text-gray-600 capitalize">{form.accountType}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-navy mb-2">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-400">Name:</span> <span className="text-gray-700">{form.firstName} {form.lastName}</span></div>
                    <div><span className="text-gray-400">Email:</span> <span className="text-gray-700">{form.email}</span></div>
                    <div><span className="text-gray-400">Phone:</span> <span className="text-gray-700">{form.phone}</span></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-navy mb-2">Professional Details</h3>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-gray-400">Primary Category:</span> <span className="text-gray-700">{form.primaryCategory}</span></div>
                    {form.secondaryCategories.length > 0 && (
                      <div><span className="text-gray-400">Secondary Categories:</span> <span className="text-gray-700">{form.secondaryCategories.join(", ")}</span></div>
                    )}
                    <div><span className="text-gray-400">Experience:</span> <span className="text-gray-700">{form.yearsExperience || "N/A"} years</span></div>
                    <div><span className="text-gray-400">Coverage:</span> <span className="text-gray-700">{form.coverageArea || "N/A"}</span></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-navy mb-2">Credentials ({form.credentials.length})</h3>
                  <div className="space-y-2">
                    {form.credentials.map((cred, i) => (
                      <div key={i} className="text-sm flex items-center gap-2">
                        <Award className="w-4 h-4 text-orange flex-shrink-0" />
                        <span className="text-gray-700">{cred.type} — {cred.issuingBody}</span>
                        <span className="text-gray-400 text-xs">({cred.certificateNumber})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button type="button" onClick={prevStep}
                className="inline-flex items-center gap-2 text-gray-500 hover:text-navy font-medium transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <button type="button" onClick={nextStep}
                className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white font-semibold px-6 py-2.5 rounded-lg transition-all">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white font-semibold px-8 py-2.5 rounded-lg transition-all disabled:opacity-50">
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Submit Registration <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By registering, you agree to the{" "}
          <Link href="/terms" className="text-orange hover:underline">Terms of Service</Link> and{" "}
          <Link href="/privacy" className="text-orange hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}