"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, Sprout, Sun, Droplets,
  Tractor, Warehouse, Wind, Thermometer, Shield, Calculator,
  Upload, Trees, Bug, Search,
} from "lucide-react";

const FARM_TYPES = [
  "Crop Farm", "Livestock Farm", "Mixed Farm",
  "Poultry Farm", "Fish Farm", "Dairy Farm",
  "Orchard / Plantation", "Hydroponic Farm",
];

const GREENHOUSE_TYPES = [
  { value: "tunnel", label: "Tunnel Greenhouse", desc: "Low-cost, single or multi-span", sqmPrice: 15000 },
  { value: "gable", label: "Gable Greenhouse", desc: "Standard commercial greenhouse", sqmPrice: 25000 },
  { value: "dome", label: "Dome Greenhouse", desc: "Climate-controlled dome structure", sqmPrice: 40000 },
  { value: "nethouse", label: "Nethouse", desc: "Insect-proof netted structure", sqmPrice: 8000 },
];

const IRRIGATION_TYPES = [
  { value: "drip", label: "Drip Irrigation", desc: "Water-efficient, best for rows" },
  { value: "sprinkler", label: "Sprinkler System", desc: "Overhead coverage for large areas" },
  { value: "flood", label: "Flood / Furrow", desc: "Traditional gravity-fed irrigation" },
  { value: "center-pivot", label: "Center Pivot", desc: "Automated circular irrigation" },
];

const ADDONS = [
  { key: "solar", label: "Solar Power System", icon: Sun },
  { key: "cold", label: "Cold Storage", icon: Warehouse },
  { key: "ventilation", label: "Ventilation System", icon: Wind },
  { key: "climate", label: "Climate Control", icon: Thermometer },
  { key: "shade", label: "Shade Netting", icon: Shield },
  { key: "pest", label: "Pest Control System", icon: Bug },
  { key: "seeding", label: "Auto Seeding", icon: Tractor },
  { key: "monitoring", label: "IoT Monitoring", icon: Search },
];

const STEPS = ["Farm Type", "Greenhouse", "Irrigation", "AI Estimate"];

export default function FarmConfiguratorPage() {
  const [step, setStep] = useState(1);
  const [farmType, setFarmType] = useState("");
  const [landArea, setLandArea] = useState("");
  const [greenhouseType, setGreenhouseType] = useState("");
  const [greenhouseArea, setGreenhouseArea] = useState("");
  const [irrigationType, setIrrigationType] = useState("");
  const [addons, setAddons] = useState<string[]>([]);
  const [organicCert, setOrganicCert] = useState(false);

  const toggleAddon = (key: string) => {
    setAddons((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  const greenhouseData = GREENHOUSE_TYPES.find((g) => g.value === greenhouseType);
  const irrigationData = IRRIGATION_TYPES.find((i) => i.value === irrigationType);

  const calculation = useMemo(() => {
    if (!farmType || !landArea) return null;
    const land = parseFloat(landArea) || 0;
    const ghCost = greenhouseData && greenhouseArea ? greenhouseData.sqmPrice * (parseFloat(greenhouseArea) || 0) : 0;
    const irrigationCost = irrigationData ? land * 5000 : 0;
    const addonCost = addons.length * 500000;
    const organicCost = organicCert ? 750000 : 0;
    const landPrepCost = land * 3000;
    const totalCost = landPrepCost + ghCost + irrigationCost + addonCost + organicCost;
    const monthlyYield = estimatedYield(farmType, land);
    return { landPrepCost, ghCost, irrigationCost, addonCost, organicCost, totalCost, monthlyYield };
  }, [farmType, landArea, greenhouseType, greenhouseArea, irrigationType, addons, organicCert]);

  function estimatedYield(type: string, area: number) {
    const yields: Record<string, number> = {
      "Crop Farm": area * 2.5, "Livestock Farm": area * 0.5, "Mixed Farm": area * 1.5,
      "Poultry Farm": area * 8, "Fish Farm": area * 4, "Dairy Farm": area * 0.8,
      "Orchard / Plantation": area * 1.2, "Hydroponic Farm": area * 6,
    };
    return yields[type] || area * 2;
  }

  const canProceed = () => {
    switch (step) {
      case 1: return !!farmType && !!landArea;
      case 2: return true;
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
          <span className="text-[#0A1628] font-medium">Farm & Greenhouse Designer</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-[#0A1628] rounded-2xl p-5 mb-8 text-white">
          <div className="flex items-center gap-3 mb-1">
            <Sprout className="w-5 h-5 text-[#FF6B00]" />
            <h1 className="font-bold text-lg">Farm & Greenhouse Designer</h1>
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
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Farm Type</h2>
              <p className="text-sm text-gray-500 mb-6">Tell us about your farming operation.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Farm Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {FARM_TYPES.map((t) => (
                      <button key={t} onClick={() => setFarmType(t)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${farmType === t ? "border-[#FF6B00] bg-[#FFF4EC]" : "border-gray-200 hover:border-gray-300"}`}>
                        <p className="text-sm font-semibold text-[#0A1628]">{t}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Land Area (hectares)</label>
                  <input type="number" value={landArea} onChange={(e) => setLandArea(e.target.value)} placeholder="e.g. 5" className={inputCls} />
                </div>
                <label className="flex items-center gap-2 text-sm mt-2">
                  <input type="checkbox" checked={organicCert} onChange={() => setOrganicCert(!organicCert)}
                    className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" />
                  Organic Certification Required
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Greenhouse Setup</h2>
              <p className="text-sm text-gray-500 mb-6">Configure your greenhouse or protected cultivation structure.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Greenhouse Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GREENHOUSE_TYPES.map((g) => (
                      <button key={g.value} onClick={() => setGreenhouseType(g.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${greenhouseType === g.value ? "border-[#FF6B00] bg-[#FFF4EC]" : "border-gray-200 hover:border-gray-300"}`}>
                        <p className="text-sm font-semibold text-[#0A1628]">{g.label}</p>
                        <p className="text-[10px] text-gray-400">{g.desc}</p>
                        <p className="text-xs font-bold text-[#FF6B00] mt-1">₦{g.sqmPrice.toLocaleString()}/sqm</p>
                      </button>
                    ))}
                  </div>
                </div>
                {greenhouseType && (
                  <div>
                    <label className={labelCls}>Greenhouse Area (sqm)</label>
                    <input type="number" value={greenhouseArea} onChange={(e) => setGreenhouseArea(e.target.value)} placeholder="e.g. 1000" className={inputCls} />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Irrigation & Add-ons</h2>
              <p className="text-sm text-gray-500 mb-6">Select irrigation system and additional equipment.</p>
              <div className="mb-6">
                <label className={labelCls}>Irrigation Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {IRRIGATION_TYPES.map((i) => (
                    <button key={i.value} onClick={() => setIrrigationType(i.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${irrigationType === i.value ? "border-[#FF6B00] bg-[#FFF4EC]" : "border-gray-200 hover:border-gray-300"}`}>
                      <p className="text-sm font-semibold text-[#0A1628]">{i.label}</p>
                      <p className="text-[10px] text-gray-400">{i.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Additional Equipment</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ADDONS.map((a) => {
                    const Icon = a.icon;
                    return (
                      <button key={a.key} onClick={() => toggleAddon(a.key)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${addons.includes(a.key) ? "border-[#FF6B00] bg-[#FFF4EC]" : "border-gray-200 hover:border-gray-300"}`}>
                        <Icon className={`w-5 h-5 ${addons.includes(a.key) ? "text-[#FF6B00]" : "text-gray-400"}`} />
                        <span className="text-[11px] font-medium text-[#0A1628] text-center">{a.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 4 && calculation && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-6 h-6 text-[#FF6B00]" />
                <h2 className="font-bold text-xl text-[#0A1628]">AI Cost Estimate</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">Complete farm setup cost breakdown.</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
                  <Sprout className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#0A1628]">{landArea}ha</p>
                  <p className="text-xs text-gray-500">Land Area</p>
                </div>
                <div className="bg-[#FF6B00]/5 rounded-xl border border-[#FF6B00]/20 p-4 text-center">
                  <Sun className="w-6 h-6 text-[#FF6B00] mx-auto mb-1" />
                  <p className="text-xl font-bold text-[#0A1628]">₦{calculation.ghCost.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Greenhouse</p>
                </div>
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
                  <Droplets className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-[#0A1628]">₦{calculation.irrigationCost.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Irrigation</p>
                </div>
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
                  <Tractor className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#0A1628]">{calculation.monthlyYield.toFixed(1)}t</p>
                  <p className="text-xs text-gray-500">Est. Monthly Yield</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-sm text-[#0A1628] mb-3">Cost Breakdown</h3>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-200"><th className="text-left font-semibold text-gray-500 pb-2">Item</th><th className="text-right font-semibold text-gray-500 pb-2">Amount</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td>Land Preparation ({landArea}ha)</td><td className="text-right font-medium">₦{calculation.landPrepCost.toLocaleString()}</td></tr>
                    <tr><td>Greenhouse Structure</td><td className="text-right font-medium">₦{calculation.ghCost.toLocaleString()}</td></tr>
                    <tr><td>Irrigation System</td><td className="text-right font-medium">₦{calculation.irrigationCost.toLocaleString()}</td></tr>
                    <tr><td>Additional Equipment ({addons.length} items)</td><td className="text-right font-medium">₦{calculation.addonCost.toLocaleString()}</td></tr>
                    {organicCert && <tr><td>Organic Certification</td><td className="text-right font-medium">₦{calculation.organicCost.toLocaleString()}</td></tr>}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td className="pt-2 font-bold">Total Investment</td>
                      <td className="pt-2 text-right font-bold text-[#FF6B00]">₦{calculation.totalCost.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-emerald-700 mb-1">Expected Monthly Yield</p>
                <p className="text-sm text-emerald-800">Estimated {calculation.monthlyYield.toFixed(1)} tonnes/month based on {farmType.toLowerCase()} with {landArea}ha land.</p>
                <button className="mt-2 text-xs font-semibold text-[#FF6B00] hover:underline">Find farm equipment suppliers &rarr;</button>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0A1628] font-medium transition-colors disabled:opacity-30">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex gap-3">
              {step < STEPS.length ? (
                <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                  className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50">
                  {step === 3 ? "Get Estimate" : "Continue"} <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
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