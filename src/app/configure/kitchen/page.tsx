"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, ChefHat, Ruler, Grid3X3,
  Square, Box, ShoppingCart, Sparkles, Loader2,
} from "lucide-react";

const CABINET_LAYOUTS = [
  { value: "l-shape", label: "L-Shape", desc: "Two adjoining walls" },
  { value: "u-shape", label: "U-Shape", desc: "Three walls" },
  { value: "galley", label: "Galley", desc: "Two parallel walls" },
  { value: "island", label: "Island", desc: "With center island" },
  { value: "g-shape", label: "G-Shape", desc: "Four walls with peninsula" },
  { value: "single-wall", label: "Single Wall", desc: "One wall linear" },
];

const DOOR_MATERIALS = [
  { value: "thermofoil", label: "Thermofoil", desc: "Affordable, easy clean" },
  { value: "laminate", label: "Laminate", desc: "Durable, wide colors" },
  { value: "wood-veneer", label: "Wood Veneer", desc: "Natural wood look" },
  { value: "solid-wood", label: "Solid Wood", desc: "Premium hardwood" },
  { value: "acrylic", label: "Acrylic", desc: "High gloss modern" },
  { value: "glass", label: "Glass Front", desc: "Display cabinets" },
];

const COUNTERTOP_MATERIALS = [
  { value: "laminate", label: "Laminate", cost: 35000 },
  { value: "quartz", label: "Quartz", cost: 120000 },
  { value: "granite", label: "Granite", cost: 95000 },
  { value: "marble", label: "Marble", cost: 180000 },
  { value: "solid-surface", label: "Solid Surface", cost: 110000 },
  { value: "concrete", label: "Concrete", cost: 85000 },
];

const BACKSPLASH_OPTIONS = [
  { value: "tile", label: "Ceramic Tile", cost: 12000 },
  { value: "glass", label: "Glass Tile", cost: 25000 },
  { value: "stone", label: "Natural Stone", cost: 35000 },
  { value: "metal", label: "Metal / Stainless", cost: 28000 },
  { value: "peel-stick", label: "Peel & Stick", cost: 8000 },
];

const APPLIANCES = [
  { id: "fridge", name: "Refrigerator", cost: 850000 },
  { id: "oven", name: "Built-in Oven", cost: 650000 },
  { id: "cooktop", name: "Cooktop / Hob", cost: 450000 },
  { id: "hood", name: "Range Hood", cost: 280000 },
  { id: "microwave", name: "Microwave", cost: 250000 },
  { id: "dishwasher", name: "Dishwasher", cost: 550000 },
  { id: "wine-cooler", name: "Wine Cooler", cost: 380000 },
  { id: "warming-drawer", name: "Warming Drawer", cost: 320000 },
];

const STEPS = ["Room Dimensions", "Cabinet Layout", "Materials", "Appliances", "AI Preview"];

export default function KitchenDesignerPage() {
  const [step, setStep] = useState(1);
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("2.7");
  const [doors, setDoors] = useState("");
  const [windows, setWindows] = useState("");
  const [layout, setLayout] = useState("");
  const [doorMaterial, setDoorMaterial] = useState("");
  const [countertop, setCountertop] = useState("");
  const [backsplash, setBacksplash] = useState("");
  const [flooring, setFlooring] = useState("");
  const [selectedAppliances, setSelectedAppliances] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const toggleAppliance = (id: string) => {
    setSelectedAppliances((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const counterData = COUNTERTOP_MATERIALS.find((c) => c.value === countertop);
  const backsplashData = BACKSPLASH_OPTIONS.find((b) => b.value === backsplash);
  const linearMeters = length && width ? (parseFloat(length) + parseFloat(width)) * 2 : 0;

  const costBreakdown = useMemo(() => {
    const cabinetCost = linearMeters * 180000;
    const counterCost = counterData ? linearMeters * counterData.cost : 0;
    const backsplashCost = backsplashData ? linearMeters * backsplashData.cost : 0;
    const applianceCost = selectedAppliances.reduce((sum, id) => {
      const app = APPLIANCES.find((a) => a.id === id);
      return sum + (app?.cost || 0);
    }, 0);
    const total = cabinetCost + counterCost + backsplashCost + applianceCost;
    return { cabinetCost, counterCost, backsplashCost, applianceCost, total };
  }, [linearMeters, counterData, backsplashData, selectedAppliances]);

  const handlePreview = () => {
    setPreviewLoading(true);
    setTimeout(() => setPreviewLoading(false), 2500);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!length && !!width;
      case 2: return !!layout;
      case 3: return !!doorMaterial && !!countertop;
      case 4: case 5: return true;
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
          <span className="text-[#0A1628] font-medium">Kitchen Designer</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-[#0A1628] rounded-2xl p-5 mb-8 text-white">
          <div className="flex items-center gap-3 mb-1">
            <ChefHat className="w-5 h-5 text-[#FF6B00]" />
            <h1 className="font-bold text-lg">Kitchen Designer</h1>
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
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Room Dimensions</h2>
              <p className="text-sm text-gray-500 mb-6">Enter your kitchen dimensions.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className={labelCls}>Length (m) *</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="number" step="0.1" value={length} onChange={(e) => setLength(e.target.value)}
                      placeholder="e.g. 4.5" className={inputCls + " pl-9"} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Width (m) *</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="number" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)}
                      placeholder="e.g. 3.5" className={inputCls + " pl-9"} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Height (m)</label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)}
                      className={inputCls + " pl-9"} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Door Positions</label>
                  <textarea value={doors} onChange={(e) => setDoors(e.target.value)}
                    rows={2} placeholder="e.g. 1 door on north wall, 900mm wide"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] resize-none transition-all" />
                </div>
                <div>
                  <label className={labelCls}>Window Positions</label>
                  <textarea value={windows} onChange={(e) => setWindows(e.target.value)}
                    rows={2} placeholder="e.g. 1 window on south wall, 1200mm wide"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] resize-none transition-all" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Linear cabinet length: {linearMeters.toFixed(1)}m approx.
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Cabinet Configuration</h2>
              <p className="text-sm text-gray-500 mb-6">Choose your kitchen cabinet layout.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CABINET_LAYOUTS.map((cl) => (
                  <button key={cl.value} onClick={() => setLayout(cl.value)}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-all text-left ${
                      layout === cl.value
                        ? "border-[#FF6B00] bg-[#FF6B00]/5 ring-1 ring-[#FF6B00]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                    {layout === cl.value && <Check className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />}
                    <div>
                      <p className={`text-sm font-semibold ${layout === cl.value ? "text-[#FF6B00]" : "text-[#0A1628]"}`}>{cl.label}</p>
                      <p className="text-xs text-gray-500">{cl.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Materials & Finishes</h2>
              <p className="text-sm text-gray-500 mb-6">Select your kitchen materials.</p>

              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Cabinet Doors</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {DOOR_MATERIALS.map((dm) => (
                      <button key={dm.value} onClick={() => setDoorMaterial(dm.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          doorMaterial === dm.value
                            ? "border-[#FF6B00] bg-[#FF6B00]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <p className={`text-xs font-semibold ${doorMaterial === dm.value ? "text-[#FF6B00]" : "text-[#0A1628]"}`}>{dm.label}</p>
                        <p className="text-[10px] text-gray-500">{dm.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Countertop</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {COUNTERTOP_MATERIALS.map((ct) => (
                      <button key={ct.value} onClick={() => setCountertop(ct.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          countertop === ct.value
                            ? "border-[#FF6B00] bg-[#FF6B00]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <p className={`text-xs font-semibold ${countertop === ct.value ? "text-[#FF6B00]" : "text-[#0A1628]"}`}>{ct.label}</p>
                        <p className="text-[10px] text-gray-500">₦{ct.cost.toLocaleString()}/lm</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Backsplash</label>
                    <select value={backsplash} onChange={(e) => setBacksplash(e.target.value)} className={inputCls}>
                      <option value="">Select backsplash</option>
                      {BACKSPLASH_OPTIONS.map((b) => (
                        <option key={b.value} value={b.value}>{b.label} (₦{b.cost.toLocaleString()}/lm)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Flooring</label>
                    <select value={flooring} onChange={(e) => setFlooring(e.target.value)} className={inputCls}>
                      <option value="">Select flooring</option>
                      <option value="tile">Ceramic/ Porcelain Tile</option>
                      <option value="vinyl">Luxury Vinyl</option>
                      <option value="wood">Engineered Wood</option>
                      <option value="concrete">Polished Concrete</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Appliances</h2>
              <p className="text-sm text-gray-500 mb-6">Select appliances for your kitchen.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {APPLIANCES.map((app) => (
                  <button key={app.id} onClick={() => toggleAppliance(app.id)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      selectedAppliances.includes(app.id)
                        ? "border-[#FF6B00] bg-[#FF6B00]/5 ring-1 ring-[#FF6B00]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <ShoppingCart className={`w-6 h-6 mx-auto mb-1 ${selectedAppliances.includes(app.id) ? "text-[#FF6B00]" : "text-gray-400"}`} />
                    <p className={`text-xs font-semibold ${selectedAppliances.includes(app.id) ? "text-[#FF6B00]" : "text-[#0A1628]"}`}>{app.name}</p>
                    <p className="text-[10px] text-gray-500">₦{app.cost.toLocaleString()}</p>
                  </button>
                ))}
              </div>
              {selectedAppliances.length > 0 && (
                <p className="text-xs text-gray-500 mt-3">
                  {selectedAppliances.length} appliance{selectedAppliances.length > 1 ? "s" : ""} selected &bull; Total: ₦{selectedAppliances.reduce((sum, id) => {
                    const app = APPLIANCES.find((a) => a.id === id);
                    return sum + (app?.cost || 0);
                  }, 0).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {step === 5 && (
            <div>
              {previewLoading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Sparkles className="w-8 h-8 text-[#FF6B00]" />
                  </div>
                  <h3 className="font-bold text-lg text-[#0A1628] mb-2">Rendering 3D Preview</h3>
                  <p className="text-sm text-gray-500">Creating your kitchen visualization...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-6 h-6 text-[#FF6B00]" />
                    <h2 className="font-bold text-xl text-[#0A1628]">Kitchen Design Preview</h2>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-8 border border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[250px]">
                    <ChefHat className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">3D Kitchen Preview</p>
                    <p className="text-xs text-gray-400 text-center mt-1 max-w-sm">
                      A 3D rendered preview of your {layout?.replace("-", " ")} kitchen with {doorMaterial} cabinets and {countertop} countertops will appear here.
                    </p>
                  </div>

                  <div className="bg-[#0A1628] rounded-xl p-5 text-white">
                    <h3 className="font-semibold text-sm text-white/80 mb-3">Cost Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-white/60">Cabinetry ({linearMeters.toFixed(1)}m)</span><span className="font-semibold">₦{costBreakdown.cabinetCost.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-white/60">Countertop</span><span className="font-semibold">₦{costBreakdown.counterCost.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-white/60">Backsplash</span><span className="font-semibold">₦{costBreakdown.backsplashCost.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-white/60">Appliances</span><span className="font-semibold">₦{costBreakdown.applianceCost.toLocaleString()}</span></div>
                      <div className="border-t border-white/20 my-2" />
                      <div className="flex justify-between text-base"><span className="font-semibold">Total Estimated Cost</span><span className="font-bold text-[#FF6B00]">₦{costBreakdown.total.toLocaleString()}</span></div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-700 mb-1">Matching Kitchen Fitters</p>
                    <p className="text-sm text-amber-800">6 verified kitchen installation professionals available</p>
                    <button className="mt-2 text-xs font-semibold text-[#FF6B00] hover:underline">View kitchen fitters →</button>
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
              {step < 4 && (
                <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                  className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {step === 4 && (
                <button onClick={handlePreview}
                  className="flex items-center gap-2 bg-[#0A1628] hover:bg-[#0F2040] text-white font-semibold px-8 py-3 rounded-xl transition-all">
                  <Sparkles className="w-4 h-4" /> Generate 3D Preview
                </button>
              )}
              {step === 5 && !previewLoading && (
                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-all">
                  Save Design
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
