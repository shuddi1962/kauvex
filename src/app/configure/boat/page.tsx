"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, AlertTriangle, Loader2, Ship,
  Anchor, Ruler, Droplets, Wind, Radio, Shield, Sun, Search, Save, Send,
} from "lucide-react";

const VESSEL_TYPES = [
  "Fishing Boat", "Patrol Boat", "Ferry", "Cargo Vessel", "Tug Boat",
  "Houseboat", "Speed Boat", "Yacht", "Pontoon", "Landing Craft",
  "Work Boat", "Barge", "Research Vessel", "Custom",
];

const PURPOSES = [
  { value: "commercial-fishing", label: "Commercial Fishing" },
  { value: "sport-fishing", label: "Sport Fishing" },
  { value: "tourism", label: "Tourism / Charter" },
  { value: "government", label: "Government / Patrol" },
  { value: "oil-gas", label: "Oil & Gas Support" },
  { value: "personal", label: "Personal / Pleasure" },
  { value: "ferry", label: "Passenger Ferry" },
  { value: "sar", label: "Search & Rescue" },
  { value: "research", label: "Research / Survey" },
  { value: "military", label: "Military / Defense" },
];

const HULL_MATERIALS = ["Steel", "Aluminum", "Fiberglass", "Wood", "Composite", "HDPE"];
const HULL_TYPES = ["Monohull", "Catamaran", "Trimaran", "V-Hull", "Flat Bottom", "Pontoon", "Semi-Displacement", "Planning"];

const PROPULSION_TYPES = ["Outboard", "Inboard", "Water Jet", "Electric", "Hybrid", "Z-Drive", "Pod Drive"];
const ENGINE_BRANDS = ["Yamaha", "Mercury", "Suzuki", "Honda", "Volvo Penta", "Caterpillar", "MTU", "MAN", "Cummins", "Scania", "Torqeedo", "Kohler"];

const STEPS = [
  "Vessel Type", "Purpose", "Dimensions", "Hull", "Propulsion",
  "Superstructure", "Navigation", "Safety", "Deck/Exterior", "Review",
];

interface BoatConfig {
  vesselType: string; purpose: string; length: string; beam: string;
  draft: string; passengerCapacity: string; cargoCapacity: string;
  fuelCapacity: string; hullMaterial: string; hullType: string;
  propulsionType: string; engineBrand: string; engineHp: string;
  cabinLayout: string; accommodation: string; galley: string;
  navigationRadar: boolean; navigationGPS: boolean; navigationComms: boolean;
  navigationAuto: boolean; navigationSonar: boolean;
  safetyLifeRafts: boolean; safetyLifeJackets: boolean; safetyEPIRB: boolean;
  safetyFire: boolean; safetyFirstAid: boolean;
  deckCrane: boolean; deckTowing: boolean; deckAnchor: boolean;
  deckDavit: boolean; deckFenders: boolean;
}

const INITIAL_CONFIG: BoatConfig = {
  vesselType: "", purpose: "", length: "", beam: "", draft: "",
  passengerCapacity: "", cargoCapacity: "", fuelCapacity: "",
  hullMaterial: "", hullType: "", propulsionType: "", engineBrand: "",
  engineHp: "", cabinLayout: "", accommodation: "", galley: "",
  navigationRadar: false, navigationGPS: false, navigationComms: false,
  navigationAuto: false, navigationSonar: false,
  safetyLifeRafts: false, safetyLifeJackets: false, safetyEPIRB: false,
  safetyFire: false, safetyFirstAid: false,
  deckCrane: false, deckTowing: false, deckAnchor: false,
  deckDavit: false, deckFenders: false,
};

export default function BoatConfiguratorPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<BoatConfig>(INITIAL_CONFIG);
  const [saving, setSaving] = useState(false);

  const update = (key: keyof BoatConfig, value: any) => setConfig((prev) => ({ ...prev, [key]: value }));

  const canProceed = () => {
    switch (step) {
      case 1: return !!config.vesselType;
      case 2: return !!config.purpose;
      case 3: return !!config.length && !!config.beam;
      case 4: return !!config.hullMaterial && !!config.hullType;
      case 5: return !!config.propulsionType;
      case 6: case 7: case 8: case 9: return true;
      case 10: return true;
      default: return false;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/v1/kpn/configurators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "boat", configuration: config }),
      });
      alert("Configuration saved successfully!");
    } catch {
      alert("Failed to save configuration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRequestQuotes = async () => {
    await handleSave();
    router.push(`/configure/boat/quote?${new URLSearchParams({ config: JSON.stringify(config) })}`);
  };

  const inputCls = "w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all";
  const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";

  const renderStep = () => {
    // Step 1: Vessel Type
    if (step === 1) {
      return (
        <div>
          <h2 className="font-bold text-xl text-[#0A1628] mb-2">Select Vessel Type</h2>
          <p className="text-sm text-gray-500 mb-6">Choose the type of vessel you want to configure.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {VESSEL_TYPES.map((vt) => (
              <button key={vt} onClick={() => update("vesselType", vt)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  config.vesselType === vt
                    ? "border-[#FF6B00] bg-[#FF6B00]/5 ring-1 ring-[#FF6B00]"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}>
                {config.vesselType === vt && <Check className="w-4 h-4 text-[#FF6B00] mx-auto mb-1" />}
                <Ship className={`w-6 h-6 mx-auto mb-1 ${config.vesselType === vt ? "text-[#FF6B00]" : "text-gray-400"}`} />
                <p className={`text-xs font-semibold ${config.vesselType === vt ? "text-[#FF6B00]" : "text-[#0A1628]"}`}>{vt}</p>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Step 2: Purpose
    if (step === 2) {
      return (
        <div>
          <h2 className="font-bold text-xl text-[#0A1628] mb-2">What is the Vessel Purpose?</h2>
          <p className="text-sm text-gray-500 mb-6">Select the primary operational purpose.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PURPOSES.map((p) => (
              <button key={p.value} onClick={() => update("purpose", p.value)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                  config.purpose === p.value
                    ? "border-[#FF6B00] bg-[#FF6B00]/5 ring-1 ring-[#FF6B00]"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                {config.purpose === p.value && <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />}
                <span className={`text-sm font-semibold ${config.purpose === p.value ? "text-[#FF6B00]" : "text-[#0A1628]"}`}>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Step 3: Dimensions
    if (step === 3) {
      return (
        <div>
          <h2 className="font-bold text-xl text-[#0A1628] mb-2">Vessel Dimensions</h2>
          <p className="text-sm text-gray-500 mb-6">Enter the key dimensions for your vessel.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Length Overall (m) *</label>
              <input type="number" step="0.1" value={config.length} onChange={(e) => update("length", e.target.value)}
                placeholder="e.g. 12" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Beam (m) *</label>
              <input type="number" step="0.1" value={config.beam} onChange={(e) => update("beam", e.target.value)}
                placeholder="e.g. 3.5" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Draft (m)</label>
              <input type="number" step="0.1" value={config.draft} onChange={(e) => update("draft", e.target.value)}
                placeholder="e.g. 0.8" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Passenger Capacity</label>
              <input type="number" value={config.passengerCapacity} onChange={(e) => update("passengerCapacity", e.target.value)}
                placeholder="e.g. 12" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Cargo Capacity (tonnes)</label>
              <input type="number" step="0.1" value={config.cargoCapacity} onChange={(e) => update("cargoCapacity", e.target.value)}
                placeholder="e.g. 2.5" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fuel Capacity (litres)</label>
              <input type="number" value={config.fuelCapacity} onChange={(e) => update("fuelCapacity", e.target.value)}
                placeholder="e.g. 500" className={inputCls} />
            </div>
          </div>
        </div>
      );
    }

    // Step 4: Hull
    if (step === 4) {
      return (
        <div>
          <h2 className="font-bold text-xl text-[#0A1628] mb-2">Hull Configuration</h2>
          <p className="text-sm text-gray-500 mb-4">Select hull material and type.</p>
          <div className="mb-6">
            <label className={labelCls}>Hull Material</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {HULL_MATERIALS.map((m) => (
                <button key={m} onClick={() => update("hullMaterial", m)}
                  className={`px-3 py-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                    config.hullMaterial === m
                      ? "border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]"
                      : "border-gray-200 hover:border-gray-300 text-[#0A1628]"
                  }`}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Hull Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {HULL_TYPES.map((t) => (
                <button key={t} onClick={() => update("hullType", t)}
                  className={`px-3 py-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                    config.hullType === t
                      ? "border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]"
                      : "border-gray-200 hover:border-gray-300 text-[#0A1628]"
                  }`}>{t}</button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Step 5: Propulsion
    if (step === 5) {
      return (
        <div>
          <h2 className="font-bold text-xl text-[#0A1628] mb-2">Propulsion System</h2>
          <p className="text-sm text-gray-500 mb-4">Configure the propulsion system.</p>
          <div className="mb-6">
            <label className={labelCls}>Propulsion Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PROPULSION_TYPES.map((p) => (
                <button key={p} onClick={() => update("propulsionType", p)}
                  className={`px-3 py-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                    config.propulsionType === p
                      ? "border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]"
                      : "border-gray-200 hover:border-gray-300 text-[#0A1628]"
                  }`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Engine Brand</label>
              <select value={config.engineBrand} onChange={(e) => update("engineBrand", e.target.value)} className={inputCls}>
                <option value="">Select brand</option>
                {ENGINE_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Engine Horsepower (HP)</label>
              <input type="number" value={config.engineHp} onChange={(e) => update("engineHp", e.target.value)}
                placeholder="e.g. 250" className={inputCls} />
            </div>
          </div>
        </div>
      );
    }

    // Step 6: Superstructure/Cabin
    if (step === 6) {
      return (
        <div>
          <h2 className="font-bold text-xl text-[#0A1628] mb-2">Superstructure & Cabin</h2>
          <p className="text-sm text-gray-500 mb-6">Configure cabin and accommodation options.</p>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Cabin Layout</label>
              <select value={config.cabinLayout} onChange={(e) => update("cabinLayout", e.target.value)} className={inputCls}>
                <option value="">Select layout</option>
                <option value="open">Open / Center Console</option>
                <option value="cabin">Single Cabin</option>
                <option value="dual-cabin">Dual Cabin</option>
                <option value="flybridge">Flybridge</option>
                <option value="multi-deck">Multi-Deck</option>
                <option value="custom">Custom Layout</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Accommodation (berths)</label>
              <input type="number" value={config.accommodation} onChange={(e) => update("accommodation", e.target.value)}
                placeholder="e.g. 6" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Galley Configuration</label>
              <select value={config.galley} onChange={(e) => update("galley", e.target.value)} className={inputCls}>
                <option value="">Select</option>
                <option value="basic">Basic Wet Bar</option>
                <option value="full">Full Galley</option>
                <option value="commercial">Commercial Grade</option>
                <option value="none">No Galley</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    // Step 7: Navigation Electronics
    if (step === 7) {
      return (
        <div>
          <h2 className="font-bold text-xl text-[#0A1628] mb-2">Navigation Electronics</h2>
          <p className="text-sm text-gray-500 mb-6">Select navigation and communication equipment.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: "navigationRadar", label: "Radar System", desc: "X-band or S-band radar" },
              { key: "navigationGPS", label: "GPS / Chartplotter", desc: "With electronic charts" },
              { key: "navigationComms", label: "VHF / SSB Radio", desc: "Communication systems" },
              { key: "navigationAuto", label: "Autopilot", desc: "Auto-navigation system" },
              { key: "navigationSonar", label: "Sonar / Fish Finder", desc: "Depth sounding" },
            ].map((item) => (
              <button key={item.key} onClick={() => update(item.key as keyof BoatConfig, !(config as any)[item.key])}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  (config as any)[item.key]
                    ? "border-[#FF6B00] bg-[#FF6B00]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                  (config as any)[item.key] ? "border-[#FF6B00] bg-[#FF6B00]" : "border-gray-300"
                }`}>
                  {(config as any)[item.key] && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0A1628]">{item.label}</p>
                  <p className="text-[10px] text-gray-500">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Step 8: Safety Equipment
    if (step === 8) {
      return (
        <div>
          <h2 className="font-bold text-xl text-[#0A1628] mb-2">Safety Equipment</h2>
          <p className="text-sm text-gray-500 mb-6">Select required safety and survival equipment.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: "safetyLifeRafts", label: "Life Rafts", desc: "SOLAS approved" },
              { key: "safetyLifeJackets", label: "Life Jackets", desc: "For all persons onboard" },
              { key: "safetyEPIRB", label: "EPIRB Beacon", desc: "Emergency position indicator" },
              { key: "safetyFire", label: "Fire Suppression", desc: "Fire extinguishers / system" },
              { key: "safetyFirstAid", label: "First Aid / Medical", desc: "Medical kit and supplies" },
            ].map((item) => (
              <button key={item.key} onClick={() => update(item.key as keyof BoatConfig, !(config as any)[item.key])}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  (config as any)[item.key]
                    ? "border-[#FF6B00] bg-[#FF6B00]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                  (config as any)[item.key] ? "border-[#FF6B00] bg-[#FF6B00]" : "border-gray-300"
                }`}>
                  {(config as any)[item.key] && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0A1628]">{item.label}</p>
                  <p className="text-[10px] text-gray-500">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Step 9: Deck/Exterior
    if (step === 9) {
      return (
        <div>
          <h2 className="font-bold text-xl text-[#0A1628] mb-2">Deck & Exterior</h2>
          <p className="text-sm text-gray-500 mb-6">Configure deck equipment and exterior features.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: "deckCrane", label: "Crane / Davit", desc: "For cargo or boat handling" },
              { key: "deckTowing", label: "Towing Winch", desc: "Towing capabilities" },
              { key: "deckAnchor", label: "Windlass / Anchor", desc: "Anchor handling system" },
              { key: "deckDavit", label: "Davit System", desc: "For tender or equipment" },
              { key: "deckFenders", label: "Fenders / Protection", desc: "Dock fendering system" },
            ].map((item) => (
              <button key={item.key} onClick={() => update(item.key as keyof BoatConfig, !(config as any)[item.key])}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  (config as any)[item.key]
                    ? "border-[#FF6B00] bg-[#FF6B00]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                  (config as any)[item.key] ? "border-[#FF6B00] bg-[#FF6B00]" : "border-gray-300"
                }`}>
                  {(config as any)[item.key] && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0A1628]">{item.label}</p>
                  <p className="text-[10px] text-gray-500">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Step 10: Review
    if (step === 10) {
      const selectedItems = (obj: any, prefix: string) =>
        Object.entries(obj).filter(([k, v]) => k.startsWith(prefix) && v).map(([k]) => k.replace(prefix, ""));

      const navItems = selectedItems(config, "navigation");
      const safetyItems = selectedItems(config, "safety");
      const deckItems = selectedItems(config, "deck");

      return (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Ship className="w-6 h-6 text-[#FF6B00]" />
            <h2 className="font-bold text-xl text-[#0A1628]">Configuration Review</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">Review your complete boat specification before saving.</p>

          <div className="space-y-4">
            <Section title="Vessel Type" items={[{ label: "Type", value: config.vesselType }, { label: "Purpose", value: config.purpose }]} />
            <Section title="Dimensions" items={[
              { label: "Length", value: `${config.length}m` }, { label: "Beam", value: `${config.beam}m` },
              { label: "Draft", value: `${config.draft || "-"}m` }, { label: "Passengers", value: config.passengerCapacity || "-" },
              { label: "Cargo", value: config.cargoCapacity ? `${config.cargoCapacity}t` : "-" },
              { label: "Fuel", value: config.fuelCapacity ? `${config.fuelCapacity}L` : "-" },
            ]} />
            <Section title="Hull" items={[{ label: "Material", value: config.hullMaterial }, { label: "Type", value: config.hullType }]} />
            <Section title="Propulsion" items={[
              { label: "Type", value: config.propulsionType }, { label: "Engine", value: config.engineBrand || "-" },
              { label: "HP", value: config.engineHp || "-" },
            ]} />
            <Section title="Cabin" items={[
              { label: "Layout", value: config.cabinLayout || "-" },
              { label: "Accommodation", value: config.accommodation || "-" },
              { label: "Galley", value: config.galley || "-" },
            ]} />

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[#0A1628] mb-2">Electronics ({navItems.length} selected)</h3>
              <div className="flex flex-wrap gap-1.5">
                {navItems.length > 0 ? navItems.map((i) => <Badge key={i} label={i} />) : <span className="text-xs text-gray-400">None selected</span>}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[#0A1628] mb-2">Safety ({safetyItems.length} selected)</h3>
              <div className="flex flex-wrap gap-1.5">
                {safetyItems.length > 0 ? safetyItems.map((i) => <Badge key={i} label={i} />) : <span className="text-xs text-gray-400">None selected</span>}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-sm text-[#0A1628] mb-2">Deck Equipment ({deckItems.length} selected)</h3>
              <div className="flex flex-wrap gap-1.5">
                {deckItems.length > 0 ? deckItems.map((i) => <Badge key={i} label={i} />) : <span className="text-xs text-gray-400">None selected</span>}
              </div>
            </div>

            {/* Cost Estimate */}
            <div className="bg-[#0A1628] rounded-xl p-5 text-white">
              <h3 className="font-semibold text-sm text-white/80 mb-3">Estimated Cost Range</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/60">Base vessel</span><span className="font-semibold">₦45,000,000</span></div>
                <div className="flex justify-between"><span className="text-white/60">Propulsion system</span><span className="font-semibold">₦18,500,000</span></div>
                <div className="flex justify-between"><span className="text-white/60">Electronics</span><span className="font-semibold">₦4,200,000</span></div>
                <div className="flex justify-between"><span className="text-white/60">Safety equipment</span><span className="font-semibold">₦2,800,000</span></div>
                <div className="border-t border-white/20 my-2" />
                <div className="flex justify-between text-base"><span className="font-semibold">Estimated Total</span><span className="font-bold text-[#FF6B00]">₦70,500,000</span></div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-green-700 mb-1">Estimated Build Duration</p>
              <p className="text-sm font-bold text-green-800">8 - 12 months</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-[#0A1628] hover:bg-[#0F2040] text-white font-semibold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Configuration
            </button>
            <button onClick={handleRequestQuotes}
              className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-6 py-2.5 rounded-xl transition-all">
              <Send className="w-4 h-4" /> Request Quotes
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#0A1628] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/configure" className="hover:text-[#0A1628] transition-colors">Design Studio</Link>
          <span>/</span>
          <span className="text-[#0A1628] font-medium">Boat Configurator</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-[#0A1628] rounded-2xl p-5 mb-8 text-white">
          <div className="flex items-center gap-3 mb-1">
            <Ship className="w-5 h-5 text-[#FF6B00]" />
            <h1 className="font-bold text-lg">Boat Configurator</h1>
          </div>
          <p className="text-sm text-gray-400">Step {step} of 10 &mdash; {STEPS[step - 1]}</p>
          {/* Step progress bar */}
          <div className="mt-3 flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? "bg-[#FF6B00]" : "bg-white/20"}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-8 shadow-sm">
          {renderStep()}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0A1628] font-medium transition-colors disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < 10 && (
              <button
                onClick={() => setStep(Math.min(10, step + 1))}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="font-semibold text-sm text-[#0A1628] mb-2">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-[10px] text-gray-500">{item.label}</p>
            <p className="text-xs font-semibold text-[#0A1628] capitalize">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B00]/10 text-[#FF6B00]">
      {label.replace(/([A-Z])/g, " $1").trim()}
    </span>
  );
}
