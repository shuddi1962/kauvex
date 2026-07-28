"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, Building2, Home, Ruler,
  Sparkles, Sun, Camera, Wifi, Zap, Droplets, Fence, Calculator,
  Loader2, Image as ImageIcon,
} from "lucide-react";

const BUILDING_TYPES = [
  "Bungalow", "Duplex", "3-Storey Building", "Apartment Block",
  "Commercial Complex", "Warehouse", "Terrace House", "Mansion",
];

const FINISH_LEVELS = [
  { value: "basic", label: "Basic", desc: "Standard finishes, budget-friendly materials", sqm: 120000 },
  { value: "standard", label: "Standard", desc: "Quality materials, professional finishes", sqm: 180000 },
  { value: "premium", label: "Premium", desc: "High-end materials, designer finishes", sqm: 280000 },
  { value: "luxury", label: "Luxury", desc: "Premium imported materials, bespoke design", sqm: 420000 },
];

const SPECIAL_FEATURES = [
  { key: "pool", label: "Swimming Pool", icon: Droplets },
  { key: "solar", label: "Solar System", icon: Sun },
  { key: "borehole", label: "Borehole / Well", icon: Droplets },
  { key: "cctv", label: "CCTV System", icon: Camera },
  { key: "smart", label: "Smart Home", icon: Wifi },
  { key: "generator", label: "Generator / Backup", icon: Zap },
  { key: "water-treatment", label: "Water Treatment", icon: Droplets },
  { key: "fence", label: "Fence / Gate", icon: Fence },
];

const STEPS = ["Building Type", "Finishes Level", "Special Features", "AI Output"];

export default function HouseConfiguratorPage() {
  const [step, setStep] = useState(1);
  const [buildingType, setBuildingType] = useState("");
  const [bedrooms, setBedrooms] = useState("3");
  const [sqm, setSqm] = useState("");
  const [finishLevel, setFinishLevel] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [generatingAI, setGeneratingAI] = useState(false);

  const toggleFeature = (key: string) => {
    setFeatures((prev) => prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]);
  };

  const finishData = FINISH_LEVELS.find((f) => f.value === finishLevel);
  const estimatedCost = finishData && sqm ? finishData.sqm * parseFloat(sqm) : 0;
  const featureCost = features.length * 3500000;
  const totalCost = estimatedCost + featureCost;

  const handleGenerateAI = () => {
    setGeneratingAI(true);
    setTimeout(() => {
      setGeneratingAI(false);
      setStep(4);
    }, 2000);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!buildingType && !!sqm;
      case 2: return !!finishLevel;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const inputCls = "w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all";
  const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#0A1628] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/configure" className="hover:text-[#0A1628] transition-colors">Design Studio</Link>
          <span>/</span>
          <span className="text-[#0A1628] font-medium">House / Building Configurator</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-[#0A1628] rounded-2xl p-5 mb-8 text-white">
          <div className="flex items-center gap-3 mb-1">
            <Building2 className="w-5 h-5 text-[#FF6B00]" />
            <h1 className="font-bold text-lg">House & Building Configurator</h1>
          </div>
          <p className="text-sm text-gray-400">Step {step} of {STEPS.length} &mdash; {STEPS[step - 1]}</p>
          <div className="mt-3 flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? "bg-[#FF6B00]" : "bg-white/20"}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-8 shadow-sm">
          {step === 1 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Building Type & Size</h2>
              <p className="text-sm text-gray-500 mb-6">Tell us about the building you want to design.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Building Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {BUILDING_TYPES.map((bt) => (
                      <button key={bt} onClick={() => setBuildingType(bt)}
                        className={`p-3 rounded-lg border text-center text-xs font-semibold transition-all ${
                          buildingType === bt
                            ? "border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]"
                            : "border-gray-200 hover:border-gray-300 text-[#0A1628]"
                        }`}>{bt}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Number of Bedrooms</label>
                    <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={inputCls}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>{n} bedroom{n > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Total Floor Area (sqm) *</label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="number" value={sqm} onChange={(e) => setSqm(e.target.value)}
                        placeholder="e.g. 250" className={inputCls + " pl-9"} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Finishes Level</h2>
              <p className="text-sm text-gray-500 mb-6">Choose the quality level for finishes and materials.</p>
              <div className="grid grid-cols-2 gap-3">
                {FINISH_LEVELS.map((fl) => (
                  <button key={fl.value} onClick={() => setFinishLevel(fl.value)}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      finishLevel === fl.value
                        ? "border-[#FF6B00] bg-[#FF6B00]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold text-sm ${finishLevel === fl.value ? "text-[#FF6B00]" : "text-[#0A1628]"}`}>{fl.label}</span>
                      {finishLevel === fl.value && <Check className="w-4 h-4 text-[#FF6B00]" />}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{fl.desc}</p>
                    <p className="text-xs font-bold text-[#0A1628]">₦{fl.sqm.toLocaleString()}/sqm</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Special Features</h2>
              <p className="text-sm text-gray-500 mb-6">Select any additional features for your building.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SPECIAL_FEATURES.map((f) => (
                  <button key={f.key} onClick={() => toggleFeature(f.key)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      features.includes(f.key)
                        ? "border-[#FF6B00] bg-[#FF6B00]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <f.icon className={`w-6 h-6 mx-auto mb-1 ${features.includes(f.key) ? "text-[#FF6B00]" : "text-gray-400"}`} />
                    <p className={`text-xs font-semibold ${features.includes(f.key) ? "text-[#FF6B00]" : "text-[#0A1628]"}`}>{f.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              {generatingAI ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Sparkles className="w-8 h-8 text-[#FF6B00]" />
                  </div>
                  <h3 className="font-bold text-lg text-[#0A1628] mb-2">AI is Generating Your Design</h3>
                  <p className="text-sm text-gray-500">Creating floor plan concept, 3D preview, and full BOQ...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-6 h-6 text-[#FF6B00]" />
                    <h2 className="font-bold text-xl text-[#0A1628]">AI Design Output</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-5 border border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[200px]">
                      <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">Floor Plan Concept</p>
                      <p className="text-xs text-gray-400">AI-generated floor plan will appear here</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5 border border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[200px]">
                      <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">3D Render Preview</p>
                      <p className="text-xs text-gray-400">3D visualization will appear here</p>
                    </div>
                  </div>

                  <div className="bg-[#0A1628] rounded-xl p-5 text-white">
                    <h3 className="font-semibold text-sm text-white/80 mb-3">Bill of Quantities (BOQ)</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-white/60">Foundation & Structure</span><span className="font-semibold">₦{Math.round(totalCost * 0.35).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-white/60">Walls & Roofing</span><span className="font-semibold">₦{Math.round(totalCost * 0.25).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-white/60">MEP (Electrical/Plumbing)</span><span className="font-semibold">₦{Math.round(totalCost * 0.18).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-white/60">Finishes & Interiors</span><span className="font-semibold">₦{Math.round(totalCost * 0.15).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-white/60">Special Features</span><span className="font-semibold">₦{featureCost.toLocaleString()}</span></div>
                      <div className="border-t border-white/20 my-2" />
                      <div className="flex justify-between text-base"><span className="font-semibold">Total Estimated Cost</span><span className="font-bold text-[#FF6B00]">₦{totalCost.toLocaleString()}</span></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <p className="text-xs text-green-600">Estimated Timeline</p>
                      <p className="text-lg font-bold text-green-700">{Math.ceil(parseFloat(sqm || "0") / 50)} - {Math.ceil(parseFloat(sqm || "0") / 35)} months</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                      <p className="text-xs text-amber-600">Cost per SQM</p>
                      <p className="text-lg font-bold text-amber-700">₦{sqm ? Math.round(totalCost / parseFloat(sqm)).toLocaleString() : 0}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-700 mb-1">Recommended Professionals</p>
                    <p className="text-sm text-amber-800">8 professionals match your project type and location</p>
                    <button className="mt-2 text-xs font-semibold text-[#FF6B00] hover:underline">View recommended professionals →</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0A1628] font-medium transition-colors disabled:opacity-30">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex gap-3">
              {step < 3 && (
                <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                  className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {step === 3 && (
                <button onClick={handleGenerateAI} disabled={generatingAI}
                  className="flex items-center gap-2 bg-[#0A1628] hover:bg-[#0F2040] text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50">
                  {generatingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generatingAI ? "Generating..." : "Generate AI Design"}
                </button>
              )}
              {step === 4 && !generatingAI && (
                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-all">
                  Save Configuration
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
