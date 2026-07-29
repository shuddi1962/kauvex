"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, ShieldCheck, Building2, Home,
  Camera, Fingerprint, Bell, Wifi, Sun, Lock, Upload, Calculator,
} from "lucide-react";

const PROPERTY_TYPES = [
  "Residential House", "Apartment Building", "Office Building",
  "Retail Store", "Warehouse", "School", "Hospital",
  "Hotel", "Factory", "Bank / Financial", "Government Building",
];

const SECURITY_ZONES = [
  "Perimeter / Fence", "Main Entrance", "Parking Lot", "Lobby / Reception",
  "Hallways / Corridors", "Server Room", "Cash / Vault Area",
  "Storage Room", "Rooftop", "Loading Bay", "Executive Office",
  "Stairwell / Fire Escape",
];

const INTEGRATIONS = [
  { key: "cctv", label: "CCTV Cameras", icon: Camera },
  { key: "access", label: "Access Control", icon: Lock },
  { key: "biometric", label: "Biometric Readers", icon: Fingerprint },
  { key: "alarm", label: "Intrusion Alarm", icon: Bell },
  { key: "fire", label: "Fire Detection", icon: Bell },
  { key: "intercom", label: "Intercom / Gate", icon: Wifi },
  { key: "solar", label: "Solar Backup", icon: Sun },
];

const STEPS = ["Property Info", "Security Zones", "System Components", "AI Estimate"];

export default function SecurityConfiguratorPage() {
  const [step, setStep] = useState(1);
  const [propertyType, setPropertyType] = useState("");
  const [floors, setFloors] = useState("1");
  const [floorArea, setFloorArea] = useState("");
  const [riskLevel, setRiskLevel] = useState("standard");
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [integrations, setIntegrations] = useState<string[]>([]);
  const [nightVision, setNightVision] = useState(true);
  const [aiAnalytics, setAiAnalytics] = useState(false);

  const toggleZone = (zone: string) => {
    setSelectedZones((prev) => prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]);
  };

  const toggleIntegration = (key: string) => {
    setIntegrations((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  const calculation = useMemo(() => {
    if (!propertyType || selectedZones.length === 0) return null;
    const zoneCount = selectedZones.length;
    const floorMultiplier = parseInt(floors) || 1;
    const riskMultiplier = riskLevel === "high" ? 1.5 : riskLevel === "corporate" ? 1.3 : 1;
    const cameraCount = Math.ceil(zoneCount * 2 * floorMultiplier * riskMultiplier);
    const accessPoints = Math.ceil(zoneCount * 0.5);
    const alarmZones = zoneCount * floorMultiplier;
    const storageTb = Math.ceil((cameraCount * 30 * 30) / 1024);
    const baseCost = cameraCount * 95000 + accessPoints * 120000 + alarmZones * 45000;
    const integrationCost = integrations.length * 350000;
    const aiCost = aiAnalytics ? 500000 : 0;
    const estimatedCost = baseCost + integrationCost + aiCost + 250000;
    return { cameraCount, accessPoints, alarmZones, storageTb, estimatedCost };
  }, [propertyType, floors, riskLevel, selectedZones, integrations, nightVision, aiAnalytics]);

  const canProceed = () => {
    switch (step) {
      case 1: return !!propertyType && !!floorArea;
      case 2: return selectedZones.length > 0;
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
          <span className="text-[#0A1628] font-medium">Security System Designer</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-[#0A1628] rounded-2xl p-5 mb-8 text-white">
          <div className="flex items-center gap-3 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#FF6B00]" />
            <h1 className="font-bold text-lg">Security System Designer</h1>
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
              <p className="text-sm text-gray-500 mb-6">Tell us about the property to secure.</p>
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
                    <input type="number" value={floorArea} onChange={(e) => setFloorArea(e.target.value)} placeholder="e.g. 500" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Security Risk Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "standard", label: "Standard", desc: "Basic residential" },
                      { value: "high", label: "High Security", desc: "Valuable assets" },
                      { value: "corporate", label: "Corporate", desc: "Multi-layer security" },
                    ].map((r) => (
                      <button key={r.value} onClick={() => setRiskLevel(r.value)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${riskLevel === r.value ? "border-[#FF6B00] bg-[#FFF4EC]" : "border-gray-200 hover:border-gray-300"}`}>
                        <p className="text-sm font-semibold text-[#0A1628]">{r.label}</p>
                        <p className="text-[10px] text-gray-400">{r.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Security Zones</h2>
              <p className="text-sm text-gray-500 mb-6">Select all zones that need security coverage.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SECURITY_ZONES.map((zone) => (
                  <button key={zone} onClick={() => toggleZone(zone)}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${selectedZones.includes(zone) ? "border-[#FF6B00] bg-[#FF6B00]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${selectedZones.includes(zone) ? "border-[#FF6B00] bg-[#FF6B00]" : "border-gray-300"}`}>
                      {selectedZones.includes(zone) && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-xs font-medium text-[#0A1628]">{zone}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">System Components</h2>
              <p className="text-sm text-gray-500 mb-6">Select the security systems you need.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {INTEGRATIONS.map((sys) => {
                  const Icon = sys.icon;
                  return (
                    <button key={sys.key} onClick={() => toggleIntegration(sys.key)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${integrations.includes(sys.key) ? "border-[#FF6B00] bg-[#FFF4EC]" : "border-gray-200 hover:border-gray-300"}`}>
                      <Icon className={`w-5 h-5 ${integrations.includes(sys.key) ? "text-[#FF6B00]" : "text-gray-400"}`} />
                      <span className="text-sm font-medium text-[#0A1628]">{sys.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={nightVision} onChange={() => setNightVision(!nightVision)} className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" /> Night Vision Cameras
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={aiAnalytics} onChange={() => setAiAnalytics(!aiAnalytics)} className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" /> AI Video Analytics
                </label>
              </div>
            </div>
          )}

          {step === 4 && calculation && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-6 h-6 text-[#FF6B00]" />
                <h2 className="font-bold text-xl text-[#0A1628]">AI Recommended System</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">Complete security system specification.</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-[#FF6B00]/5 rounded-xl border border-[#FF6B00]/20 p-4 text-center">
                  <Camera className="w-6 h-6 text-[#FF6B00] mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#0A1628]">{calculation.cameraCount}</p>
                  <p className="text-xs text-gray-500">Cameras</p>
                </div>
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
                  <Lock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#0A1628]">{calculation.accessPoints}</p>
                  <p className="text-xs text-gray-500">Access Points</p>
                </div>
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
                  <Bell className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#0A1628]">{calculation.alarmZones}</p>
                  <p className="text-xs text-gray-500">Alarm Zones</p>
                </div>
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
                  <Wifi className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#0A1628]">{calculation.storageTb}TB</p>
                  <p className="text-xs text-gray-500">Storage (30d)</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-sm text-[#0A1628] mb-3">Cost Breakdown</h3>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-200"><th className="text-left font-semibold text-gray-500 pb-2">Component</th><th className="text-right font-semibold text-gray-500 pb-2">Qty</th><th className="text-right font-semibold text-gray-500 pb-2">Total</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td>HD Security Cameras (4MP, IR)</td><td className="text-right">{calculation.cameraCount}</td><td className="text-right font-medium">₦{(calculation.cameraCount * 95000).toLocaleString()}</td></tr>
                    <tr><td>Access Control Readers</td><td className="text-right">{calculation.accessPoints}</td><td className="text-right font-medium">₦{(calculation.accessPoints * 120000).toLocaleString()}</td></tr>
                    <tr><td>Intrusion Alarm Zones</td><td className="text-right">{calculation.alarmZones}</td><td className="text-right font-medium">₦{(calculation.alarmZones * 45000).toLocaleString()}</td></tr>
                    {aiAnalytics && <tr><td>AI Video Analytics License</td><td className="text-right">1</td><td className="text-right font-medium">₦500,000</td></tr>}
                    <tr><td>Central Monitoring + Installation</td><td className="text-right">1</td><td className="text-right font-medium">₦250,000</td></tr>
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
                <p className="text-xs font-semibold text-amber-700 mb-1">Security Installers Available</p>
                <p className="text-sm text-amber-800">8 verified security system companies available in your area</p>
                <button className="mt-2 text-xs font-semibold text-[#FF6B00] hover:underline">Request installation quotes &rarr;</button>
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
                  {step === 3 ? "Generate Estimate" : "Continue"} <ArrowRight className="w-4 h-4" />
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