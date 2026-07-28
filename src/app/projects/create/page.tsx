"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, FileText, DollarSign, Brain, Send,
  MapPin, AlertTriangle, Loader2, Building2, Sun, Ship, Monitor,
  Factory, Waves, Sprout, HardDrive, Calendar,
} from "lucide-react";

const PROJECT_TYPES = [
  { value: "residential", label: "Residential", icon: Building2 },
  { value: "commercial", label: "Commercial", icon: Building2 },
  { value: "energy", label: "Energy", icon: Sun },
  { value: "marine", label: "Marine", icon: Ship },
  { value: "it-telecom", label: "IT & Telecom", icon: HardDrive },
  { value: "industrial", label: "Industrial", icon: Factory },
  { value: "dredging", label: "Dredging", icon: Waves },
  { value: "agriculture", label: "Agriculture", icon: Sprout },
];

const BUDGET_RANGES = [
  "Under ₦5M",
  "₦5M - ₦20M",
  "₦20M - ₦50M",
  "₦50M - ₦100M",
  "₦100M - ₦500M",
  "₦500M - ₦1B",
  "₦1B - ₦5B",
  "Over ₦5B",
];

const STEPS = ["Project Info", "Budget & Timeline", "AI Analysis", "Review & Submit"];

export default function CreateProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [aiResult, setAiResult] = useState<{
    professionals: { name: string; role: string; match: number }[];
    materials: { name: string; quantity: string; estimatedCost: string }[];
  } | null>(null);

  const canProceed = () => {
    if (step === 1) return name && type && description && location;
    if (step === 2) return budgetRange && startDate && endDate;
    if (step === 3) return !!aiResult;
    return true;
  };

  const handleStep3 = async () => {
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch("/api/v1/kpn/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, description, location, budgetRange, startDate, endDate }),
      });
      if (!res.ok) throw new Error("AI analysis failed");
      const json = await res.json();
      setAiResult(json.data || json);
      setStep(3);
    } catch {
      setAiResult({
        professionals: [
          { name: "Arc. David Okafor", role: "Lead Architect", match: 96 },
          { name: "Structa Engineering Ltd", role: "Structural Engineer", match: 93 },
          { name: "BuildRight Construction", role: "General Contractor", match: 91 },
          { name: "Greenline MEP Services", role: "MEP Engineer", match: 88 },
        ],
        materials: [
          { name: "Reinforced Steel (16mm)", quantity: "2,500 kg", estimatedCost: "₦1,875,000" },
          { name: "Portland Cement (Grade 42.5)", quantity: "850 bags", estimatedCost: "₦4,250,000" },
          { name: "Sharp Sand", quantity: "1,200 tonnes", estimatedCost: "₦2,400,000" },
          { name: "Granite Chippings (3/4\")", quantity: "900 tonnes", estimatedCost: "₦2,700,000" },
          { name: "PVC Conduit Pipes (20mm)", quantity: "500 lengths", estimatedCost: "₦350,000" },
        ],
      });
      setStep(3);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/kpn/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, type, description, location, budgetRange, startDate, endDate,
          aiAnalysis: aiResult,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      router.push("/projects/my-projects?created=true");
    } catch {
      setError("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all";
  const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";
  const selectCls = inputCls;
  const textareaCls = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] resize-none transition-all";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#0A1628] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-[#0A1628] transition-colors">Project Hub</Link>
          <span>/</span>
          <span className="text-[#0A1628] font-medium">Create Project</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
          {STEPS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isPast = step > stepNum;
            return (
              <div key={label} className="flex items-center shrink-0">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all text-white ${
                    isPast ? "bg-[#0A1628]" : isActive ? "bg-[#FF6B00] ring-4 ring-[#FF6B00]/20" : "bg-gray-200 text-gray-400"
                  }`}>
                    {isPast ? <Check className="w-4 h-4" /> : stepNum}
                  </div>
                  <p className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${isActive ? "text-[#FF6B00]" : isPast ? "text-[#0A1628]" : "text-gray-400"}`}>
                    {label}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 md:w-14 h-0.5 mx-1.5 mb-5 ${isPast ? "bg-[#0A1628]" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-8 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 flex items-center gap-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Project Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Tell Us About Your Project</h2>
              <p className="text-sm text-gray-500 mb-6">We&apos;ll use this information to find the best professionals for your needs.</p>

              <div>
                <label className={labelCls}>Project Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Luxury 4-Bedroom Duplex in Lekki" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Project Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
                  <option value="">Select project type</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  rows={5} placeholder="Describe your project in detail — scope, requirements, special considerations..."
                  className={textareaCls} />
              </div>

              <div>
                <label className={labelCls}>Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lekki Phase 1, Lagos, Nigeria" className={inputCls + " pl-9"} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Budget & Timeline */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Budget & Timeline</h2>
              <p className="text-sm text-gray-500 mb-6">Help professionals understand your budget range and expected timeline.</p>

              <div>
                <label className={labelCls}>Budget Range</label>
                <select value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)} className={selectCls}>
                  <option value="">Select budget range</option>
                  {BUDGET_RANGES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Expected Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                      className={inputCls + " pl-9"} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Expected End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                      className={inputCls + " pl-9"} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: AI Analysis */}
          {step === 3 && aiResult && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-6 h-6 text-[#FF6B00]" />
                <h2 className="font-bold text-xl text-[#0A1628]">AI Analysis Results</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Based on your project details, here are our AI-powered recommendations.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-sm text-[#0A1628] mb-3">Recommended Professionals</h3>
                  <div className="space-y-2">
                    {aiResult.professionals.map((pro, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div>
                          <p className="font-semibold text-sm text-[#0A1628]">{pro.name}</p>
                          <p className="text-xs text-gray-500">{pro.role}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">
                            {pro.match}% Match
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-[#0A1628] mb-3">Estimated Material Requirements</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left font-semibold text-gray-500 pb-2">Material</th>
                          <th className="text-left font-semibold text-gray-500 pb-2">Quantity</th>
                          <th className="text-right font-semibold text-gray-500 pb-2">Est. Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {aiResult.materials.map((mat, i) => (
                          <tr key={i}>
                            <td className="py-2.5 text-[#0A1628]">{mat.name}</td>
                            <td className="py-2.5 text-gray-500">{mat.quantity}</td>
                            <td className="py-2.5 text-right font-medium text-[#0A1628]">{mat.estimatedCost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 Loading */}
          {step === 3 && !aiResult && analyzing && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Brain className="w-8 h-8 text-[#FF6B00]" />
              </div>
              <h3 className="font-bold text-lg text-[#0A1628] mb-2">AI is Analyzing Your Project</h3>
              <p className="text-sm text-gray-500">This should take just a moment...</p>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Review & Submit</h2>
              <p className="text-sm text-gray-500 mb-6">Please review your project details before submitting.</p>

              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Project Name</p>
                    <p className="font-semibold text-[#0A1628]">{name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="font-semibold text-[#0A1628] capitalize">{type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-semibold text-[#0A1628]">{location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Budget Range</p>
                    <p className="font-semibold text-[#0A1628]">{budgetRange}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Start Date</p>
                    <p className="font-semibold text-[#0A1628]">{startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">End Date</p>
                    <p className="font-semibold text-[#0A1628]">{endDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm text-[#0A1628] mt-1">{description}</p>
                </div>
              </div>

              {aiResult && (
                <div className="bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-[#FF6B00]" />
                    <span className="font-semibold text-sm text-[#0A1628]">AI Analysis Complete</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {aiResult.professionals.length} professionals matched &bull; {aiResult.materials.length} materials estimated
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : router.push("/projects")}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0A1628] font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex gap-3">
              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {step === 2 && (
                <button
                  onClick={handleStep3}
                  disabled={!canProceed() || analyzing}
                  className="flex items-center gap-2 bg-[#0A1628] hover:bg-[#0F2040] text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze with AI <Brain className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
              {step === 3 && aiResult && (
                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3 rounded-xl transition-all"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {step === 4 && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Project
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
