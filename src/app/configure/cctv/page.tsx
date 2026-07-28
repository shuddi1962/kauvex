"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, Camera, Building2, Upload,
  HardDrive, Wifi, Calculator, AlertTriangle,
} from "lucide-react";

const PROPERTY_TYPES = [
  "Residential House", "Apartment Building", "Office Building",
  "Retail Store", "Warehouse", "School", "Hospital",
  "Hotel", "Factory", "Parking Lot", "Construction Site",
];

const KEY_AREAS = [
  "Entrance / Gate", "Living Room / Lobby", "Hallway / Corridor",
  "Parking Area", "Backyard / Garden", "Rooftop",
  "Storage Room", "Server Room", "Cashier / Counter",
  "Loading Bay", "Perimeter Wall", "Staircase",
];

const STEPS = ["Property Info", "Key Areas", "AI Calculation", "Review"];

export default function CCTVConfiguratorPage() {
  const [step, setStep] = useState(1);
  const [propertyType, setPropertyType] = useState("");
  const [floors, setFloors] = useState("1");
  const [floorArea, setFloorArea] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [nightVision, setNightVision] = useState(true);
  const [audioCapable, setAudioCapable] = useState(false);
  const [aiAnalytics, setAiAnalytics] = useState(false);

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const calculation = useMemo(() => {
    if (!propertyType || selectedAreas.length === 0) return null;
    const baseCameras = selectedAreas.length;
    const floorMultiplier = parseInt(floors) || 1;
    const cameraCount = baseCameras * floorMultiplier;
    const bulletCameras = Math.ceil(cameraCount * 0.6);
    const domeCameras = cameraCount - bulletCameras;
    const nvrChannels = Math.ceil(cameraCount / 8) * 8;
    const storageDays = 30;
    const storageTb = Math.ceil((cameraCount * 20 * storageDays) / 1024);
    return {
      cameraCount,
      bulletCameras,
      domeCameras,
      nvrChannels,
      storageTb,
      cableMeters: cameraCount * 25,
      estimatedCost: cameraCount * 85000 + nvrChannels * 250000 + storageTb * 180000 + 120000,
    };
  }, [propertyType, floors, selectedAreas]);

  const canProceed = () => {
    switch (step) {
      case 1: return !!propertyType && !!floorArea;
      case 2: return selectedAreas.length > 0;
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
          <span className="text-[#0A1628] font-medium">CCTV Planner</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-[#0A1628] rounded-2xl p-5 mb-8 text-white">
          <div className="flex items-center gap-3 mb-1">
            <Camera className="w-5 h-5 text-[#FF6B00]" />
            <h1 className="font-bold text-lg">CCTV Security Planner</h1>
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
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Property Information</h2>
              <p className="text-sm text-gray-500 mb-6">Tell us about the property to be secured.</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Property Type</label>
                  <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={inputCls}>
                    <option value="">Select property type</option>
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Number of Floors</label>
                    <select value={floors} onChange={(e) => setFloors(e.target.value)} className={inputCls}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((n) => (
                        <option key={n} value={n}>{n} floor{n > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Total Floor Area (sqm)</label>
                    <input type="number" value={floorArea} onChange={(e) => setFloorArea(e.target.value)}
                      placeholder="e.g. 200" className={inputCls} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={nightVision} onChange={() => setNightVision(!nightVision)}
                      className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" />
                    Night Vision
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={audioCapable} onChange={() => setAudioCapable(!audioCapable)}
                      className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" />
                    Audio Capable
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={aiAnalytics} onChange={() => setAiAnalytics(!aiAnalytics)}
                      className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" />
                    AI Analytics
                  </label>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Upload className="w-4 h-4" />
                    Upload Floor Plan (optional)
                  </div>
                  <p className="text-xs text-gray-400">Upload a floor plan for AI-assisted camera placement. PDF or image files accepted.</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Key Areas to Cover</h2>
              <p className="text-sm text-gray-500 mb-6">Select all areas that need camera coverage.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {KEY_AREAS.map((area) => (
                  <button key={area} onClick={() => toggleArea(area)}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                      selectedAreas.includes(area)
                        ? "border-[#FF6B00] bg-[#FF6B00]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      selectedAreas.includes(area) ? "border-[#FF6B00] bg-[#FF6B00]" : "border-gray-300"
                    }`}>
                      {selectedAreas.includes(area) && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-xs font-medium text-[#0A1628]">{area}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && calculation && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-6 h-6 text-[#FF6B00]" />
                <h2 className="font-bold text-xl text-[#0A1628]">AI Recommended System</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Based on your property details and coverage areas.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-[#FF6B00]/5 rounded-xl border border-[#FF6B00]/20 p-4 text-center">
                  <Camera className="w-6 h-6 text-[#FF6B00] mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#0A1628]">{calculation.cameraCount}</p>
                  <p className="text-xs text-gray-500">Total Cameras</p>
                </div>
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
                  <HardDrive className="w-6 h-6 text-blue mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#0A1628]">{calculation.nvrChannels}ch</p>
                  <p className="text-xs text-gray-500">NVR Channels</p>
                </div>
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
                  <Wifi className="w-6 h-6 text-emerald mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#0A1628]">{calculation.storageTb}TB</p>
                  <p className="text-xs text-gray-500">Storage (30 days)</p>
                </div>
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
                  <svg className="w-6 h-6 text-amber mx-auto mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16" /><path d="M4 4v16" /></svg>
                  <p className="text-2xl font-bold text-[#0A1628]">{calculation.cableMeters}m</p>
                  <p className="text-xs text-gray-500">Cabling</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-sm text-[#0A1628] mb-2">Camera Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Bullet Cameras (outdoor)</span><span className="font-semibold">{calculation.bulletCameras}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Dome Cameras (indoor)</span><span className="font-semibold">{calculation.domeCameras}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">NVR / Recorder</span><span className="font-semibold">{calculation.nvrChannels} channels</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Storage Required</span><span className="font-semibold">{calculation.storageTb}TB HDD</span></div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && calculation && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Complete System Review</h2>
              <p className="text-sm text-gray-500 mb-6">Review your CCTV system specification.</p>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-sm text-[#0A1628] mb-2">Equipment List</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left font-semibold text-gray-500 pb-2">Item</th>
                        <th className="text-right font-semibold text-gray-500 pb-2">Qty</th>
                        <th className="text-right font-semibold text-gray-500 pb-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr><td>Bullet Camera (4MP, IR, IP67)</td><td className="text-right">{calculation.bulletCameras}</td><td className="text-right font-medium">₦{((calculation.bulletCameras * 95000)).toLocaleString()}</td></tr>
                      <tr><td>Dome Camera (4MP, IR, vandal-proof)</td><td className="text-right">{calculation.domeCameras}</td><td className="text-right font-medium">₦{((calculation.domeCameras * 75000)).toLocaleString()}</td></tr>
                      <tr><td>NVR ({calculation.nvrChannels}ch, PoE)</td><td className="text-right">1</td><td className="text-right font-medium">₦{calculation.nvrChannels >= 16 ? 450000 : 250000}</td></tr>
                      <tr><td>{calculation.storageTb}TB HDD (surveillance grade)</td><td className="text-right">1</td><td className="text-right font-medium">₦{(calculation.storageTb * 180000).toLocaleString()}</td></tr>
                      <tr><td>CAT6 Cable + installation</td><td className="text-right">{calculation.cableMeters}m</td><td className="text-right font-medium">₦{(calculation.cableMeters * 1800).toLocaleString()}</td></tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200">
                        <td colSpan={2} className="pt-2 font-bold">Estimated Total</td>
                        <td className="pt-2 text-right font-bold text-[#FF6B00]">₦{calculation.estimatedCost.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Matching Installers</p>
                  <p className="text-sm text-amber-800">5 verified security system installers available in your area</p>
                  <button className="mt-2 text-xs font-semibold text-[#FF6B00] hover:underline">Request installation quotes →</button>
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
                  {step === 2 ? "Calculate System" : "Continue"} <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {step === STEPS.length && (
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
