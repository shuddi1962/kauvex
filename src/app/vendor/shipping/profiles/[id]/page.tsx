"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight,
  Truck, Package, Globe, DollarSign, MapPin, Shield,
  Ruler, Plus, X, Loader2, Star, Settings, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

const steps = [
  { id: 1, label: "Details", icon: Settings },
  { id: 2, label: "Carriers", icon: Truck },
  { id: 3, label: "Measurements", icon: Ruler },
  { id: 4, label: "Pricing", icon: DollarSign },
  { id: 5, label: "Coverage", icon: Globe },
  { id: 6, label: "Products", icon: Package },
];

const carrierOptions = [
  { value: "kauvex_logistics", label: "Kauvex Logistics Network" },
  { value: "dhl", label: "DHL Express" },
  { value: "fedex", label: "FedEx" },
  { value: "aramex", label: "Aramex" },
  { value: "gig", label: "GIG Logistics" },
  { value: "kwik", label: "Kwik Delivery" },
  { value: "own_account", label: "Own Account Carrier" },
];

const handoffMethods = [
  { value: "partner_pickup", label: "Partner Pickup" },
  { value: "drop_off", label: "Drop-off at Hub" },
  { value: "auto", label: "Auto (by carrier)" },
];

const specialHandlingFlags = [
  { value: "fragile", label: "Fragile" },
  { value: "batteries", label: "Batteries" },
  { value: "liquids", label: "Liquids" },
  { value: "temp_sensitive", label: "Temperature Sensitive" },
  { value: "age_verification", label: "Age Verification" },
  { value: "high_value", label: "High Value" },
];

const packageSizePresets = [
  { label: "Small (20x15x10 cm)", w: 20, d: 15, h: 10 },
  { label: "Medium (30x25x15 cm)", w: 30, d: 25, h: 15 },
  { label: "Large (40x30x25 cm)", w: 40, d: 30, h: 25 },
  { label: "Extra Large (60x40x35 cm)", w: 60, d: 40, h: 35 },
];

const pricingTypes = [
  { value: "real_time", label: "Real-time Rates + Markup" },
  { value: "flat_rate", label: "Flat Rate Table" },
  { value: "free_shipping", label: "Free Shipping (with threshold)" },
];

const destinationTypes = [
  { value: "urban", label: "Urban (metro areas)" },
  { value: "suburban", label: "Suburban" },
  { value: "rural", label: "Rural / Remote" },
];

const allCountries = [
  "Nigeria", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "Italy", "Spain", "Netherlands", "Belgium",
  "Switzerland", "Sweden", "Norway", "Denmark", "UAE", "Saudi Arabia",
  "South Africa", "Kenya", "Ghana", "Egypt", "India", "China", "Japan",
  "Singapore", "Brazil", "Mexico",
];

const demoVendorProducts = [
  { id: "p1", name: "Marine GPS Navigator 7-inch", sku: "MGN-001" },
  { id: "p2", name: "Yacht Anchor Chain 12mm", sku: "YAC-012" },
  { id: "p3", name: "LED Navigation Light Set", sku: "LNL-001" },
  { id: "p4", name: "Marine VHF Radio DSC", sku: "MVR-100" },
  { id: "p5", name: "Boat Cover Heavy Duty", sku: "BCH-200" },
  { id: "p6", name: "Bilge Pump 2000 GPH", sku: "BP-2000" },
  { id: "p7", name: "Stainless Steel Propeller", sku: "SSP-14" },
  { id: "p8", name: "Fire Extinguisher Marine", sku: "FEM-5" },
];

export default function EditShippingProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const [profileName, setProfileName] = useState("Standard Delivery");
  const [isDefault, setIsDefault] = useState(true);

  const [selectedCarriers, setSelectedCarriers] = useState<string[]>(["kauvex_logistics", "dhl", "fedex"]);
  const [handoffMethod, setHandoffMethod] = useState("partner_pickup");
  const [ownAccountCarrierName, setOwnAccountCarrierName] = useState("");

  const [measurementUnit, setMeasurementUnit] = useState<"metric" | "imperial">("metric");
  const [dimWeightDivisor, setDimWeightDivisor] = useState("5000");
  const [selectedPreset, setSelectedPreset] = useState("Medium (30x25x15 cm)");
  const [packageLength, setPackageLength] = useState("30");
  const [packageWidth, setPackageWidth] = useState("25");
  const [packageHeight, setPackageHeight] = useState("15");
  const [flags, setFlags] = useState<string[]>(["fragile"]);

  const [pricingType, setPricingType] = useState("real_time");
  const [markupPercent, setMarkupPercent] = useState("10");
  const [flatRates, setFlatRates] = useState<{ region: string; rate: string }[]>([]);
  const [freeThreshold, setFreeThreshold] = useState("");

  const [selectedCountries, setSelectedCountries] = useState<string[]>(["Nigeria"]);
  const [excludedRegions, setExcludedRegions] = useState<string[]>([]);
  const [excludeInput, setExcludeInput] = useState("");
  const [estimatedTimes, setEstimatedTimes] = useState<{ type: string; min: string; max: string }[]>(
    destinationTypes.map((d) => ({ type: d.value, min: "1", max: "3" }))
  );

  const [selectedProducts, setSelectedProducts] = useState<string[]>(["p1", "p3", "p5"]);
  const [productSearch, setProductSearch] = useState("");

  const toggleCarrier = (val: string) => {
    setSelectedCarriers((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  };

  const toggleFlag = (val: string) => {
    setFlags((prev) =>
      prev.includes(val) ? prev.filter((f) => f !== val) : [...prev, val]
    );
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );
  };

  const addExcludeRegion = () => {
    const r = excludeInput.trim();
    if (r && !excludedRegions.includes(r)) {
      setExcludedRegions([...excludedRegions, r]);
      setExcludeInput("");
    }
  };

  const addFlatRate = () => {
    setFlatRates([...flatRates, { region: "", rate: "" }]);
  };

  const updateFlatRate = (idx: number, field: "region" | "rate", value: string) => {
    setFlatRates((prev) => prev.map((fr, i) => i === idx ? { ...fr, [field]: value } : fr));
  };

  const removeFlatRate = (idx: number) => {
    setFlatRates((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateEstTime = (type: string, field: "min" | "max", value: string) => {
    setEstimatedTimes((prev) => prev.map((et) => et.type === type ? { ...et, [field]: value } : et));
  };

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const filteredProducts = demoVendorProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const canProceed = () => {
    switch (step) {
      case 1: return profileName.trim().length > 0;
      case 2: return selectedCarriers.length > 0;
      case 3: return true;
      case 4: return pricingType === "real_time" || pricingType === "free_shipping" || (pricingType === "flat_rate" && flatRates.some((f) => f.region && f.rate));
      case 5: return selectedCountries.length > 0;
      case 6: return true;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast("Shipping profile updated successfully", "success");
      setTimeout(() => router.push("/vendor/shipping/profiles"), 1500);
    }, 1500);
  };

  const totalSteps = steps.length;

  return (
    <VendorShell title="Edit Shipping Profile" subtitle={`Editing profile: ${profileName}`}>
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm text-white shadow-lg ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-8 bg-white rounded-xl border border-gray-200 p-2">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isComplete = step > s.id;
            return (
              <div key={s.id} className="flex-1 flex items-center">
                <button
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive ? "bg-purple-100 text-purple-700" :
                    isComplete ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isActive ? "bg-purple-600 text-white" :
                    isComplete ? "bg-green-100 text-green-600" :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    {isComplete ? <Check size={12} /> : <Icon size={12} />}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {idx < totalSteps - 1 && (
                  <div className={`flex-1 h-px mx-1 ${
                    step > s.id ? "bg-green-300" : "bg-gray-200"
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Step 1: Profile Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Profile Details</h3>
                <p className="text-xs text-gray-400">Edit your profile name and default settings.</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Profile Name *</label>
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Standard Delivery, Express Shipping"
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-400"
                />
                Set as default shipping profile
                <Star size={12} className="text-amber-500" />
              </label>
            </div>
          )}

          {/* Step 2: Carriers */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Carrier Selection</h3>
                <p className="text-xs text-gray-400">Choose which carriers this profile uses.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {carrierOptions.map((c) => {
                  const selected = selectedCarriers.includes(c.value);
                  return (
                    <label
                      key={c.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selected ? "border-purple-300 bg-purple-50" : "border-gray-200 hover:border-purple-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleCarrier(c.value)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-400"
                      />
                      <span className="text-sm text-gray-700">{c.label}</span>
                    </label>
                  );
                })}
              </div>
              {selectedCarriers.includes("own_account") && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Own Account Carrier Name</label>
                  <input
                    value={ownAccountCarrierName}
                    onChange={(e) => setOwnAccountCarrierName(e.target.value)}
                    placeholder="e.g. My Logistics Co."
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Handoff Method</label>
                <div className="flex gap-2">
                  {handoffMethods.map((hm) => (
                    <button
                      key={hm.value}
                      onClick={() => setHandoffMethod(hm.value)}
                      className={`px-4 py-2 text-xs rounded-lg border transition-colors ${
                        handoffMethod === hm.value
                          ? "border-purple-300 bg-purple-50 text-purple-700"
                          : "border-gray-200 text-gray-500 hover:border-purple-200"
                      }`}
                    >
                      {hm.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Measurements */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Measurements & Handling</h3>
                <p className="text-xs text-gray-400">Configure measurement units, package sizes, and special handling.</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Unit System</label>
                  <div className="flex gap-2">
                    {["metric", "imperial"].map((u) => (
                      <button
                        key={u}
                        onClick={() => setMeasurementUnit(u as "metric" | "imperial")}
                        className={`px-4 py-2 text-xs rounded-lg border capitalize transition-colors ${
                          measurementUnit === u
                            ? "border-purple-300 bg-purple-50 text-purple-700"
                            : "border-gray-200 text-gray-500 hover:border-purple-200"
                        }`}
                      >
                        {u === "metric" ? "Metric (cm/kg)" : "Imperial (in/lb)"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-40">
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Dim Weight Divisor</label>
                  <input
                    value={dimWeightDivisor}
                    onChange={(e) => setDimWeightDivisor(e.target.value)}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Package Size Presets</label>
                <div className="flex flex-wrap gap-2">
                  {packageSizePresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setSelectedPreset(preset.label);
                        setPackageLength(preset.w.toString());
                        setPackageWidth(preset.d.toString());
                        setPackageHeight(preset.h.toString());
                      }}
                      className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                        selectedPreset === preset.label
                          ? "border-purple-300 bg-purple-50 text-purple-700"
                          : "border-gray-200 text-gray-500 hover:border-purple-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Length ({measurementUnit === "metric" ? "cm" : "in"})</label>
                  <input value={packageLength} onChange={(e) => setPackageLength(e.target.value)} type="number"
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Width ({measurementUnit === "metric" ? "cm" : "in"})</label>
                  <input value={packageWidth} onChange={(e) => setPackageWidth(e.target.value)} type="number"
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Height ({measurementUnit === "metric" ? "cm" : "in"})</label>
                  <input value={packageHeight} onChange={(e) => setPackageHeight(e.target.value)} type="number"
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-2 font-medium">Special Handling Flags</label>
                <div className="flex flex-wrap gap-2">
                  {specialHandlingFlags.map((f) => {
                    const selected = flags.includes(f.value);
                    return (
                      <button
                        key={f.value}
                        onClick={() => toggleFlag(f.value)}
                        className={`px-3 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 transition-colors ${
                          selected ? "border-amber-300 bg-amber-50 text-amber-700" : "border-gray-200 text-gray-500 hover:border-amber-200"
                        }`}
                      >
                        <Shield size={12} />
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pricing */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Pricing Logic</h3>
                <p className="text-xs text-gray-400">Configure how shipping rates are calculated.</p>
              </div>
              <div className="flex gap-2">
                {pricingTypes.map((pt) => (
                  <button
                    key={pt.value}
                    onClick={() => setPricingType(pt.value)}
                    className={`flex-1 px-4 py-3 text-xs rounded-lg border text-left transition-colors ${
                      pricingType === pt.value
                        ? "border-purple-300 bg-purple-50 text-purple-700"
                        : "border-gray-200 text-gray-500 hover:border-purple-200"
                    }`}
                  >
                    <span className="font-semibold block mb-0.5">{pt.label}</span>
                  </button>
                ))}
              </div>
              {pricingType === "real_time" && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Markup Percentage (%)</label>
                  <div className="flex items-center gap-3">
                    <input
                      value={markupPercent}
                      onChange={(e) => setMarkupPercent(e.target.value)}
                      type="number"
                      className="w-32 h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                    <span className="text-xs text-gray-400">Applied on top of carrier base rates</span>
                  </div>
                </div>
              )}
              {pricingType === "flat_rate" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Flat Rate Table</span>
                    <Button variant="outline" size="sm" onClick={addFlatRate}>
                      <Plus size={12} className="mr-1" /> Add Row
                    </Button>
                  </div>
                  {flatRates.map((fr, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={fr.region}
                        onChange={(e) => updateFlatRate(idx, "region", e.target.value)}
                        placeholder="Region / zone"
                        className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                      />
                      <input
                        value={fr.rate}
                        onChange={(e) => updateFlatRate(idx, "rate", e.target.value)}
                        placeholder="Rate"
                        type="number"
                        className="w-28 h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                      />
                      <button onClick={() => removeFlatRate(idx)} className="p-2 hover:bg-red-50 rounded-lg">
                        <X size={14} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                  {flatRates.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No flat rates added. Click &quot;Add Row&quot; to begin.</p>
                  )}
                </div>
              )}
              {pricingType === "free_shipping" && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Free Shipping Threshold (₦)</label>
                  <input
                    value={freeThreshold}
                    onChange={(e) => setFreeThreshold(e.target.value)}
                    type="number"
                    placeholder="e.g. 50000"
                    className="w-full max-w-xs h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Orders above this amount get free shipping.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Coverage */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Coverage & Delivery Times</h3>
                <p className="text-xs text-gray-400">Select countries/regions and set estimated delivery times.</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-2 font-medium">Countries / Regions</label>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-3 border border-gray-200 rounded-lg">
                  {allCountries.map((country) => {
                    const selected = selectedCountries.includes(country);
                    return (
                      <button
                        key={country}
                        onClick={() => toggleCountry(country)}
                        className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                          selected
                            ? "bg-purple-100 border-purple-300 text-purple-700"
                            : "bg-white border-gray-200 text-gray-500 hover:border-purple-300"
                        }`}
                      >
                        {country}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Exclude Regions</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    value={excludeInput}
                    onChange={(e) => setExcludeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (addExcludeRegion(), e.preventDefault())}
                    placeholder="e.g. Northern Nigeria, Rural Areas"
                    className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                  <Button variant="outline" size="sm" onClick={addExcludeRegion}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {excludedRegions.map((r) => (
                    <span key={r} className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-600 rounded-full border border-red-200">
                      {r}
                      <button onClick={() => setExcludedRegions((prev) => prev.filter((x) => x !== r))}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-2 font-medium">Estimated Delivery Times</label>
                <div className="space-y-2">
                  {destinationTypes.map((dt) => {
                    const et = estimatedTimes.find((e) => e.type === dt.value)!;
                    return (
                      <div key={dt.value} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <span className="text-xs text-gray-600 w-32">{dt.label}</span>
                        <div className="flex items-center gap-2">
                          <input
                            value={et.min}
                            onChange={(e) => updateEstTime(dt.value, "min", e.target.value)}
                            type="number"
                            className="w-16 h-8 px-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                          />
                          <span className="text-xs text-gray-400">to</span>
                          <input
                            value={et.max}
                            onChange={(e) => updateEstTime(dt.value, "max", e.target.value)}
                            type="number"
                            className="w-16 h-8 px-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                          />
                          <span className="text-xs text-gray-400">days</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Products */}
          {step === 6 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Assign Products</h3>
                <p className="text-xs text-gray-400">Select products that will use this shipping profile.</p>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-10 pl-9 pr-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                />
              </div>
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No products match your search.</p>
                ) : (
                  filteredProducts.map((p) => {
                    const selected = selectedProducts.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          selected ? "bg-purple-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleProduct(p.id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-400"
                        />
                        <div className="flex-1">
                          <span className="text-sm text-gray-800 font-medium">{p.name}</span>
                          <span className="text-xs text-gray-400 ml-2">SKU: {p.sku}</span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-gray-400">{selectedProducts.length} product(s) selected</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  <ChevronLeft size={14} className="mr-1" /> Previous
                </Button>
              )}
            </div>
            {step < totalSteps ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next <ChevronRight size={14} className="ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting || !canProceed()}>
                {submitting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Check size={14} className="mr-1" />}
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </VendorShell>
  );
}
