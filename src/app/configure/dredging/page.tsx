"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, Waves, MapPin, Ruler,
  Calculator, FileText, Shield, AlertTriangle,
} from "lucide-react";

const WATERWAY_TYPES = [
  { value: "river", label: "River", desc: "Natural river channel" },
  { value: "canal", label: "Canal", desc: "Man-made canal" },
  { value: "harbour", label: "Harbour / Port", desc: "Port and harbour basin" },
  { value: "lagoon", label: "Lagoon", desc: "Coastal lagoon" },
  { value: "lake", label: "Lake", desc: "Inland lake" },
  { value: "coastal", label: "Coastal", desc: "Near-shore coastal area" },
  { value: "dam", label: "Dam Reservoir", desc: "Reservoir behind dam" },
];

const SOIL_TYPES = [
  { value: "sand", label: "Sand", desc: "Easy to dredge" },
  { value: "silt", label: "Silt", desc: "Fine sediment" },
  { value: "clay", label: "Clay", desc: "Cohesive, moderate difficulty" },
  { value: "gravel", label: "Gravel", desc: "Coarse material" },
  { value: "rock", label: "Rock / Hard Pan", desc: "Requires rock breaker" },
  { value: "mixed", label: "Mixed", desc: "Varies across site" },
];

const STEPS = ["Waterway Info", "Target Specs", "AI Calculation", "Review"];

export default function DredgingPlannerPage() {
  const [step, setStep] = useState(1);
  const [waterwayType, setWaterwayType] = useState("");
  const [location, setLocation] = useState("");
  const [gpsCoords, setGpsCoords] = useState("");
  const [targetDepth, setTargetDepth] = useState("");
  const [currentDepth, setCurrentDepth] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [soilType, setSoilType] = useState("");

  const volume = useMemo(() => {
    if (!targetDepth || !currentDepth || !length || !width) return null;
    const avgDepth = (parseFloat(targetDepth) + parseFloat(currentDepth)) / 2;
    const depthDiff = Math.abs(parseFloat(targetDepth) - parseFloat(currentDepth));
    return { total: depthDiff * parseFloat(length) * parseFloat(width), avgDepth };
  }, [targetDepth, currentDepth, length, width]);

  const recommendation = useMemo(() => {
    if (!volume) return null;
    const v = volume.total;
    const equipment = v > 100000 ? "Cutter Suction Dredger (CSD)" :
      v > 50000 ? "Trailing Suction Hopper Dredger (TSHD)" :
      v > 10000 ? "Long Reach Excavator on Barge" :
      v > 1000 ? "Amphibious Excavator" : "Mini Dredge / Pump";
    const duration = Math.ceil(v / 5000);
    const cost = v * 3500;
    return { equipment, duration, cost };
  }, [volume]);

  const canProceed = () => {
    switch (step) {
      case 1: return !!waterwayType && !!location;
      case 2: return !!targetDepth && !!length && !!width && !!soilType;
      case 3: case 4: return true;
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
          <span className="text-[#0A1628] font-medium">Dredging Planner</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-[#0A1628] rounded-2xl p-5 mb-8 text-white">
          <div className="flex items-center gap-3 mb-1">
            <Waves className="w-5 h-5 text-[#FF6B00]" />
            <h1 className="font-bold text-lg">Dredging Planner</h1>
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
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Waterway Information</h2>
              <p className="text-sm text-gray-500 mb-6">Describe the water body to be dredged.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Waterway Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {WATERWAY_TYPES.map((wt) => (
                      <button key={wt.value} onClick={() => setWaterwayType(wt.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          waterwayType === wt.value
                            ? "border-[#FF6B00] bg-[#FF6B00]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <p className={`text-xs font-semibold ${waterwayType === wt.value ? "text-[#FF6B00]" : "text-[#0A1628]"}`}>{wt.label}</p>
                        <p className="text-[10px] text-gray-500">{wt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Lagos Lagoon, Apapa Channel" className={inputCls + " pl-9"} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>GPS Coordinates <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="text" value={gpsCoords} onChange={(e) => setGpsCoords(e.target.value)}
                    placeholder="e.g. 6.4281° N, 3.4219° E" className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Target Specifications</h2>
              <p className="text-sm text-gray-500 mb-6">Enter the target dredging specifications.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Current Average Depth (m)</label>
                    <input type="number" step="0.1" value={currentDepth} onChange={(e) => setCurrentDepth(e.target.value)}
                      placeholder="e.g. 2.5" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Target Depth (m) *</label>
                    <input type="number" step="0.1" value={targetDepth} onChange={(e) => setTargetDepth(e.target.value)}
                      placeholder="e.g. 5.0" className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Dredging Length (m) *</label>
                    <input type="number" value={length} onChange={(e) => setLength(e.target.value)}
                      placeholder="e.g. 2000" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Dredging Width (m) *</label>
                    <input type="number" value={width} onChange={(e) => setWidth(e.target.value)}
                      placeholder="e.g. 100" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Predominant Soil Type *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SOIL_TYPES.map((st) => (
                      <button key={st.value} onClick={() => setSoilType(st.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          soilType === st.value
                            ? "border-[#FF6B00] bg-[#FF6B00]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <p className={`text-xs font-semibold ${soilType === st.value ? "text-[#FF6B00]" : "text-[#0A1628]"}`}>{st.label}</p>
                        <p className="text-[10px] text-gray-500">{st.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && volume && recommendation && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-6 h-6 text-[#FF6B00]" />
                <h2 className="font-bold text-xl text-[#0A1628]">AI Calculation Results</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">Estimated volume, equipment, and cost based on your inputs.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#FF6B00]/5 rounded-xl border border-[#FF6B00]/20 p-5 text-center">
                  <Waves className="w-8 h-8 text-[#FF6B00] mx-auto mb-2" />
                  <p className="text-3xl font-bold text-[#0A1628]">{volume.total.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Volume (m³)</p>
                </div>
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 text-center">
                  <Ruler className="w-8 h-8 text-blue mx-auto mb-2" />
                  <p className="text-3xl font-bold text-[#0A1628]">{recommendation.duration}</p>
                  <p className="text-xs text-gray-500">Est. Duration (days)</p>
                </div>
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 text-center">
                  <svg className="w-8 h-8 text-emerald mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                  <p className="text-3xl font-bold text-[#0A1628]">₦{(recommendation.cost / 1e6).toFixed(1)}M</p>
                  <p className="text-xs text-gray-500">Estimated Cost</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-sm text-[#0A1628] mb-2">Recommended Equipment</h3>
                <p className="text-sm font-medium text-[#FF6B00]">{recommendation.equipment}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Based on {volume.total.toLocaleString()}m³ volume and {soilType} soil conditions.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <p className="text-xs font-semibold text-amber-700">Environmental Compliance</p>
                </div>
                <p className="text-xs text-amber-800">
                  This project requires environmental impact assessment (EIA) and dredging permits.
                  Allow 60-90 days for regulatory approvals.
                </p>
              </div>
            </div>
          )}

          {step === 4 && volume && recommendation && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Scope Document & Review</h2>
              <p className="text-sm text-gray-500 mb-6">Complete project scope and compliance checklist.</p>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-sm text-[#0A1628] mb-2">Project Scope</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Waterway:</span> <span className="font-semibold capitalize">{waterwayType}</span></div>
                    <div><span className="text-gray-500">Location:</span> <span className="font-semibold">{location}</span></div>
                    <div><span className="text-gray-500">Target Depth:</span> <span className="font-semibold">{targetDepth}m</span></div>
                    <div><span className="text-gray-500">Volume:</span> <span className="font-semibold">{volume.total.toLocaleString()}m³</span></div>
                    <div><span className="text-gray-500">Soil Type:</span> <span className="font-semibold capitalize">{soilType}</span></div>
                    <div><span className="text-gray-500">Duration:</span> <span className="font-semibold">{recommendation.duration} days</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-sm text-[#0A1628] mb-2">Compliance Checklist</h3>
                  <div className="space-y-2">
                    {[
                      "Environmental Impact Assessment (EIA)",
                      "Dredging permit from regulatory body",
                      "Sediment disposal plan",
                      "Water quality monitoring plan",
                      "Marine traffic management plan",
                      "Community stakeholder engagement",
                      "Noise and vibration control",
                      "Emergency response plan",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 rounded border-2 border-gray-300 shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0A1628] rounded-xl p-5 text-white">
                  <h3 className="font-semibold text-sm text-white/80 mb-3">Cost Estimate</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-white/60">Dredging operations</span><span className="font-semibold">₦{(recommendation.cost * 0.7).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-white/60">Mobilization / Demobilization</span><span className="font-semibold">₦{(recommendation.cost * 0.1).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-white/60">Sediment disposal</span><span className="font-semibold">₦{(recommendation.cost * 0.12).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-white/60">Environmental monitoring</span><span className="font-semibold">₦{(recommendation.cost * 0.08).toLocaleString()}</span></div>
                    <div className="border-t border-white/20 my-2" />
                    <div className="flex justify-between text-base"><span className="font-semibold">Total Estimated Cost</span><span className="font-bold text-[#FF6B00]">₦{recommendation.cost.toLocaleString()}</span></div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Matching Contractors</p>
                  <p className="text-sm text-amber-800">4 verified dredging contractors available for this scope</p>
                  <button className="mt-2 text-xs font-semibold text-[#FF6B00] hover:underline">Request contractor quotes →</button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0A1628] font-medium transition-colors disabled:opacity-30">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex gap-3">
              {step < STEPS.length && (
                <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                  className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50">
                  {step === 2 ? "Calculate" : "Continue"} <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {step === STEPS.length && (
                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-all">
                  Save & Generate Scope Document
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
