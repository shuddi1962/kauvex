"use client";

import { useState } from "react";
import Link from "next/link";
import VendorShell from "@/components/vendor/vendor-shell";
import { Button } from "@/components/ui/button";
import {
  Megaphone, ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight,
  X, DollarSign, Eye, Target, Settings, Package, Store,
  ShoppingCart, Loader2, Plus, Search, TrendingUp, AlertCircle,
  ChevronDown, Tag,
} from "lucide-react";

type CampaignType = "sponsored_products" | "sponsored_brands" | "sponsored_display" | "";

const campaignTypes = [
  { value: "sponsored_products", label: "Sponsored Products", desc: "Boost individual products in search results and category pages. Pay per click.", icon: Package, brandRequired: false },
  { value: "sponsored_brands", label: "Sponsored Brands", desc: "Showcase your brand banner with multiple products. Requires Brand Registry.", icon: Store, brandRequired: true },
  { value: "sponsored_display", label: "Sponsored Display", desc: "Retarget shoppers on and off the marketplace. Requires Brand Registry.", icon: ShoppingCart, brandRequired: true },
];

const steps = [
  { id: 1, label: "Type" },
  { id: 2, label: "Settings" },
  { id: 3, label: "Targeting" },
  { id: 4, label: "Bidding" },
  { id: 5, label: "Ad Groups" },
  { id: 6, label: "Review" },
];

const demoProducts = [
  { id: "PROD-001", name: "Yamaha F150 Outboard Engine", price: 4500000, image: "/placeholder-product.svg" },
  { id: "PROD-002", name: "Marine LED Navigation Kit", price: 45000, image: "/placeholder-product.svg" },
  { id: "PROD-003", name: "Bilge Pump 2000 GPH", price: 27500, image: "/placeholder-product.svg" },
  { id: "PROD-004", name: "Hikvision 8CH DVR Security Kit", price: 185000, image: "/placeholder-product.svg" },
  { id: "PROD-005", name: "Fire Alarm Control Panel", price: 320000, image: "/placeholder-product.svg" },
  { id: "PROD-006", name: "Commercial Oven 4-Tray", price: 1200000, image: "/placeholder-product.svg" },
  { id: "PROD-007", name: "Stainless Steel Prep Table", price: 185000, image: "/placeholder-product.svg" },
  { id: "PROD-008", name: "Marine GPS Chartplotter", price: 350000, image: "/placeholder-product.svg" },
];

const formatNaira = (n: number) => `\u20A6${n.toLocaleString()}`;

export default function NewCampaignWizardPage() {
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // Step 1 - Campaign Type
  const [campaignType, setCampaignType] = useState<CampaignType>("");

  // Step 2 - Campaign Settings
  const [settings, setSettings] = useState({
    name: "", dailyBudget: 5000, startDate: "", endDate: "",
  });

  // Step 3 - Targeting
  const [targetingMode, setTargetingMode] = useState<"automatic" | "manual">("automatic");
  // Automatic targeting groups
  const [autoBid, setAutoBid] = useState(500);
  const [targetingGroups, setTargetingGroups] = useState({
    close_match: { enabled: true, bid: 500 },
    loose_match: { enabled: true, bid: 300 },
    substitutes: { enabled: true, bid: 400 },
    complements: { enabled: true, bid: 350 },
  });
  const [negativeKeywords, setNegativeKeywords] = useState<string[]>([]);
  const [negKwInput, setNegKwInput] = useState("");
  // Manual targeting
  const [keywords, setKeywords] = useState<{ text: string; matchType: "exact" | "phrase" | "broad"; bid: number }[]>([]);
  const [kwInput, setKwInput] = useState("");
  const [kwMatchType, setKwMatchType] = useState<"exact" | "phrase" | "broad">("exact");
  const [kwBid, setKwBid] = useState(500);

  // Step 4 - Bidding Strategy
  const [biddingStrategy, setBiddingStrategy] = useState<"dynamic_down" | "dynamic_up_down" | "fixed">("dynamic_down");
  const [placementAdjustments, setPlacementAdjustments] = useState({
    top_of_search: { enabled: true, percent: 50 },
    product_pages: { enabled: false, percent: 25 },
  });

  // Step 5 - Ad Groups
  const [adGroups, setAdGroups] = useState<{ name: string; products: string[] }[]>([{ name: "", products: [] }]);

  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Derived
  const campaignDuration = settings.startDate && settings.endDate
    ? Math.max(0, Math.ceil((new Date(settings.endDate).getTime() - new Date(settings.startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const totalBudget = settings.dailyBudget * (campaignDuration || 30);
  const estimatedDailyReach = Math.round((settings.dailyBudget / (kwBid || autoBid || 500)) * 100);

  const addNegativeKeyword = () => {
    const kw = negKwInput.trim().toLowerCase();
    if (kw && !negativeKeywords.includes(kw)) {
      setNegativeKeywords([...negativeKeywords, kw]);
      setNegKwInput("");
    }
  };

  const addKeyword = () => {
    const text = kwInput.trim();
    if (text && !keywords.find((k) => k.text === text)) {
      setKeywords([...keywords, { text, matchType: kwMatchType, bid: kwBid }]);
      setKwInput("");
    }
  };

  const removeKeyword = (text: string) => setKeywords(keywords.filter((k) => k.text !== text));

  const updateTargetingGroup = (key: keyof typeof targetingGroups, field: "enabled" | "bid", value: boolean | number) => {
    setTargetingGroups((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!campaignType;
      case 2: return !!settings.name && settings.dailyBudget > 0 && !!settings.startDate && !!settings.endDate;
      case 3: return true;
      case 4: return true;
      case 5: return adGroups.some((g) => g.name && g.products.length > 0);
      case 6: return true;
      default: return false;
    }
  };

  const nextStep = () => { if (canProceed() && step < 6) setStep(step + 1); };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const addAdGroup = () => setAdGroups([...adGroups, { name: "", products: [] }]);

  const updateAdGroup = (index: number, field: "name", value: string) => {
    const updated = [...adGroups];
    updated[index] = { ...updated[index], [field]: value };
    setAdGroups(updated);
  };

  const toggleAdGroupProduct = (groupIndex: number, productId: string) => {
    const updated = [...adGroups];
    const products = updated[groupIndex].products;
    updated[groupIndex] = {
      ...updated[groupIndex],
      products: products.includes(productId) ? products.filter((p) => p !== productId) : [...products, productId],
    };
    setAdGroups(updated);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 2000));
      showToast("Campaign launched successfully! It will be reviewed shortly.", "success");
    } catch {
      showToast("Failed to launch campaign. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <VendorShell title="Create Campaign" subtitle="Set up a new advertising campaign in 6 steps">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red border border-red-200"
        }`}>
          {toast.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <div className="mb-4">
          <Link href="/vendor/advertising" className="inline-flex items-center gap-1 text-xs text-text-4 hover:text-text-2 transition-colors">
            <ChevronLeft size={14} /> Back to Campaigns
          </Link>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                step > s.id ? "bg-blue text-white" : step === s.id ? "bg-blue text-white ring-2 ring-blue-200" : "bg-gray-100 text-text-4"
              }`}>
                {step > s.id ? <Check size={12} /> : s.id}
              </div>
              <span className={`text-[10px] font-medium mx-2 ${step === s.id ? "text-blue" : "text-text-4"}`}>{s.label}</span>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${step > s.id ? "bg-blue" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1 - Campaign Type */}
            {step === 1 && (
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-semibold text-sm mb-1">Choose Campaign Type</h3>
                <p className="text-xs text-text-4 mb-4">Select the type of ad campaign you want to create</p>
                <div className="space-y-3">
                  {campaignTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setCampaignType(type.value as CampaignType)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          campaignType === type.value ? "border-blue bg-blue-50" : "border-border hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            campaignType === type.value ? "bg-blue text-white" : "bg-gray-100 text-text-4"
                          }`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-text-1">{type.label}</p>
                              {type.brandRequired && (
                                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">Brand Registry</span>
                              )}
                            </div>
                            <p className="text-xs text-text-4 mt-0.5">{type.desc}</p>
                          </div>
                          {campaignType === type.value && (
                            <div className="w-5 h-5 rounded-full bg-blue flex items-center justify-center ml-auto shrink-0">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {campaignType === "sponsored_brands" || campaignType === "sponsored_display" ? (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                    <AlertCircle size={12} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-amber-800">This campaign type requires Brand Registry enrollment. If you haven&apos;t enrolled yet, please complete brand registration first.</p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Step 2 - Campaign Settings */}
            {step === 2 && (
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-semibold text-sm mb-1">Campaign Settings</h3>
                <p className="text-xs text-text-4 mb-4">Name your campaign and set your budget &amp; schedule</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-text-2 block mb-1">Campaign Name</label>
                    <input
                      type="text" value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      placeholder="e.g. Spring Sale 2026"
                      className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-text-2 block mb-1">Daily Budget</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-4">\u20A6</span>
                        <input
                          type="number" value={settings.dailyBudget}
                          onChange={(e) => setSettings({ ...settings, dailyBudget: Number(e.target.value) })}
                          min={1000} step={500}
                          className="w-full h-10 pl-7 pr-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-2 block mb-1">Total Budget</label>
                      <div className="h-10 px-3 flex items-center text-sm font-semibold text-text-1 bg-gray-50 rounded-lg border border-border">
                        {formatNaira(totalBudget)}
                        <span className="text-[10px] text-text-4 ml-2">({campaignDuration || 30} days)</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-text-2 block mb-1">Start Date</label>
                      <input
                        type="date" value={settings.startDate} min={today}
                        onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
                        className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-2 block mb-1">End Date</label>
                      <input
                        type="date" value={settings.endDate} min={settings.startDate || today}
                        onChange={(e) => setSettings({ ...settings, endDate: e.target.value })}
                        className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 - Targeting */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="bg-white rounded-xl border border-border p-5">
                  <h3 className="font-semibold text-sm mb-1">Targeting</h3>
                  <p className="text-xs text-text-4 mb-4">Choose how to target your ads</p>

                  <div className="flex gap-2 mb-4">
                    {(["automatic", "manual"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setTargetingMode(mode)}
                        className={`flex-1 py-2.5 rounded-lg border text-xs font-medium capitalize transition-all ${
                          targetingMode === mode
                            ? "border-blue bg-blue-50 text-blue"
                            : "border-border text-text-4 hover:border-gray-300 hover:text-text-2"
                        }`}
                      >
                        {mode === "automatic" ? "Automatic" : "Manual"}
                      </button>
                    ))}
                  </div>

                  {targetingMode === "automatic" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-text-2 block mb-1">Default Bid (per click)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-4">\u20A6</span>
                          <input
                            type="number" value={autoBid}
                            onChange={(e) => setAutoBid(Number(e.target.value))}
                            min={100} step={50}
                            className="w-full h-10 pl-7 pr-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-2 block mb-2">Bids by Targeting Group</label>
                        <div className="space-y-2">
                          {[
                            { key: "close_match" as const, label: "Close Match", desc: "Shoppers searching for terms closely related to your products" },
                            { key: "loose_match" as const, label: "Loose Match", desc: "Shoppers searching for terms broadly related to your products" },
                            { key: "substitutes" as const, label: "Substitutes", desc: "Shoppers viewing products similar to yours" },
                            { key: "complements" as const, label: "Complements", desc: "Shoppers viewing products that complement yours" },
                          ].map((group) => (
                            <div key={group.key} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                              <input
                                type="checkbox"
                                checked={targetingGroups[group.key].enabled}
                                onChange={(e) => updateTargetingGroup(group.key, "enabled", e.target.checked)}
                                className="w-4 h-4 rounded border-border accent-blue"
                              />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-text-1">{group.label}</p>
                                <p className="text-[10px] text-text-4">{group.desc}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-text-4">\u20A6</span>
                                <input
                                  type="number" value={targetingGroups[group.key].bid}
                                  onChange={(e) => updateTargetingGroup(group.key, "bid", Number(e.target.value))}
                                  min={50} step={50}
                                  className="w-20 h-8 px-2 text-xs rounded-lg border border-border focus:outline-none focus:border-blue"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-text-2 block mb-2">Keyword Targeting</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text" value={kwInput}
                            onChange={(e) => setKwInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                            placeholder="Enter keyword..."
                            className="flex-1 h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue"
                          />
                          <select
                            value={kwMatchType}
                            onChange={(e) => setKwMatchType(e.target.value as typeof kwMatchType)}
                            className="h-10 px-2 text-xs rounded-lg border border-border bg-white text-text-1"
                          >
                            <option value="exact">Exact</option>
                            <option value="phrase">Phrase</option>
                            <option value="broad">Broad</option>
                          </select>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-text-4">\u20A6</span>
                            <input
                              type="number" value={kwBid}
                              onChange={(e) => setKwBid(Number(e.target.value))}
                              min={50} step={50}
                              className="w-20 h-10 px-2 text-xs rounded-lg border border-border focus:outline-none focus:border-blue"
                            />
                          </div>
                          <Button variant="outline" size="sm" onClick={addKeyword}>
                            <Plus size={14} />
                          </Button>
                        </div>
                        {keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {keywords.map((kw) => (
                              <span key={kw.text} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue text-[10px] rounded-full font-medium">
                                {kw.text}
                                <span className="text-[8px] opacity-60">({kw.matchType})</span>
                                <span className="text-[8px] opacity-60">\u20A6{kw.bid}</span>
                                <button onClick={() => removeKeyword(kw.text)}><X size={10} /></button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Negative Keywords */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <label className="text-xs font-medium text-text-2 block mb-1">Negative Keywords</label>
                    <p className="text-[10px] text-text-4 mb-2">Prevent your ad from showing for specific search terms</p>
                    <div className="flex gap-2">
                      <input
                        type="text" value={negKwInput}
                        onChange={(e) => setNegKwInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNegativeKeyword())}
                        placeholder="Enter negative keyword..."
                        className="flex-1 h-9 px-3 text-xs rounded-lg border border-border focus:outline-none focus:border-blue"
                      />
                      <Button variant="outline" size="sm" onClick={addNegativeKeyword}>
                        <Plus size={14} />
                      </Button>
                    </div>
                    {negativeKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {negativeKeywords.map((kw) => (
                          <span key={kw} className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red text-[10px] rounded-full font-medium">
                            <X size={10} /> {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 - Bidding Strategy */}
            {step === 4 && (
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-semibold text-sm mb-1">Bidding Strategy</h3>
                <p className="text-xs text-text-4 mb-4">Choose how to manage your bids</p>

                <div className="space-y-3 mb-6">
                  {[
                    { value: "dynamic_down" as const, label: "Dynamic bids - down only", desc: "Amazon lowers your bid in real time when your ad is less likely to convert. Recommended for new campaigns." },
                    { value: "dynamic_up_down" as const, label: "Dynamic bids - up and down", desc: "Amazon raises your bid for clicks more likely to convert and lowers it for less likely clicks." },
                    { value: "fixed" as const, label: "Fixed bids", desc: "Use your exact bid amounts. No adjustments are made by Amazon. Full control." },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBiddingStrategy(opt.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        biddingStrategy === opt.value ? "border-blue bg-blue-50" : "border-border hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                          biddingStrategy === opt.value ? "border-blue" : "border-gray-300"
                        }`}>
                          {biddingStrategy === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-blue" />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-text-1">{opt.label}</p>
                          <p className="text-xs text-text-4 mt-0.5">{opt.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="text-xs font-semibold text-text-2 mb-3">Adjust Bids by Placement</h4>
                  <div className="space-y-3">
                    {[
                      { key: "top_of_search" as const, label: "Top of Search (first page)", desc: "Increase bid for ads shown at the top of search results" },
                      { key: "product_pages" as const, label: "Product Pages", desc: "Increase bid for ads shown on product detail pages" },
                    ].map((placement) => (
                      <div key={placement.key} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <input
                          type="checkbox"
                          checked={placementAdjustments[placement.key].enabled}
                          onChange={(e) => setPlacementAdjustments((prev) => ({
                            ...prev,
                            [placement.key]: { ...prev[placement.key], enabled: e.target.checked },
                          }))}
                          className="w-4 h-4 rounded border-border accent-blue"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-text-1">{placement.label}</p>
                          <p className="text-[10px] text-text-4">{placement.desc}</p>
                        </div>
                        {placementAdjustments[placement.key].enabled && (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={placementAdjustments[placement.key].percent}
                              onChange={(e) => setPlacementAdjustments((prev) => ({
                                ...prev,
                                [placement.key]: { ...prev[placement.key], percent: Number(e.target.value) },
                              }))}
                              min={0} max={900} step={10}
                              className="w-16 h-8 px-2 text-xs rounded-lg border border-border focus:outline-none focus:border-blue text-center"
                            />
                            <span className="text-xs text-text-4">%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5 - Ad Groups */}
            {step === 5 && (
              <div className="space-y-5">
                {adGroups.map((group, gi) => (
                  <div key={gi} className="bg-white rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-sm">Ad Group {gi + 1}</h3>
                      {gi > 0 && (
                        <button
                          onClick={() => setAdGroups(adGroups.filter((_, i) => i !== gi))}
                          className="text-[10px] text-red hover:text-red/80 flex items-center gap-1"
                        >
                          <X size={12} /> Remove
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-text-2 block mb-1">Ad Group Name</label>
                        <input
                          type="text" value={group.name}
                          onChange={(e) => updateAdGroup(gi, "name", e.target.value)}
                          placeholder={`e.g. Main Products ${gi + 1}`}
                          className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-2 block mb-2">Select Products</label>
                        <div className="max-h-48 overflow-y-auto space-y-1.5">
                          {demoProducts.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => toggleAdGroupProduct(gi, product.id)}
                              className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                                group.products.includes(product.id)
                                  ? "border-blue bg-blue-50"
                                  : "border-border hover:border-gray-300"
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                                group.products.includes(product.id) ? "bg-blue border-blue" : "border-gray-300"
                              }`}>
                                {group.products.includes(product.id) && <Check size={10} className="text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-text-1 truncate">{product.name}</p>
                                <p className="text-[10px] text-text-4">{formatNaira(product.price)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                        {group.products.length > 0 && (
                          <p className="text-[10px] text-text-4 mt-1">{group.products.length} product(s) selected</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addAdGroup}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-border text-xs text-text-4 hover:border-blue hover:text-blue hover:bg-blue-50/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Add Another Ad Group
                </button>
              </div>
            )}

            {/* Step 6 - Review and Launch */}
            {step === 6 && (
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-semibold text-sm mb-1">Review and Launch</h3>
                <p className="text-xs text-text-4 mb-4">Review your campaign settings before launching</p>

                <div className="space-y-4">
                  {/* Campaign Type */}
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="text-xs text-text-4">Campaign Type</span>
                    <span className="text-xs font-medium text-text-1 capitalize">{campaignTypes.find((t) => t.value === campaignType)?.label || campaignType}</span>
                  </div>

                  {/* Settings */}
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="text-xs text-text-4">Campaign Name</span>
                    <span className="text-xs font-medium text-text-1">{settings.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="text-xs text-text-4">Daily Budget</span>
                    <span className="text-xs font-medium text-text-1">{formatNaira(settings.dailyBudget)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="text-xs text-text-4">Total Budget</span>
                    <span className="text-xs font-medium text-text-1">{formatNaira(totalBudget)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="text-xs text-text-4">Duration</span>
                    <span className="text-xs font-medium text-text-1">{campaignDuration} days ({settings.startDate} - {settings.endDate})</span>
                  </div>

                  {/* Targeting */}
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="text-xs text-text-4">Targeting Mode</span>
                    <span className="text-xs font-medium text-text-1 capitalize">{targetingMode}</span>
                  </div>
                  {targetingMode === "manual" && (
                    <div className="flex items-center justify-between py-2 border-b border-border/40">
                      <span className="text-xs text-text-4">Keywords</span>
                      <span className="text-xs font-medium text-text-1">{keywords.length} keyword(s)</span>
                    </div>
                  )}
                  {negativeKeywords.length > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-border/40">
                      <span className="text-xs text-text-4">Negative Keywords</span>
                      <span className="text-xs font-medium text-text-1">{negativeKeywords.length} keyword(s)</span>
                    </div>
                  )}

                  {/* Bidding */}
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="text-xs text-text-4">Bidding Strategy</span>
                    <span className="text-xs font-medium text-text-1 capitalize">
                      {biddingStrategy === "dynamic_down" ? "Dynamic - down only" : biddingStrategy === "dynamic_up_down" ? "Dynamic - up and down" : "Fixed"}
                    </span>
                  </div>

                  {/* Ad Groups */}
                  <div className="flex items-center justify-between py-2 border-b border-border/40">
                    <span className="text-xs text-text-4">Ad Groups</span>
                    <span className="text-xs font-medium text-text-1">{adGroups.length} group(s)</span>
                  </div>
                  {adGroups.filter((g) => g.name).map((g, i) => (
                    <div key={i} className="flex items-center justify-between py-1 pl-4">
                      <span className="text-[10px] text-text-4">{g.name}</span>
                      <span className="text-[10px] text-text-2">{g.products.length} product(s)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={prevStep} disabled={step === 1}>
                <ChevronLeft size={16} className="mr-1" /> Previous
              </Button>
              {step < 6 ? (
                <Button onClick={nextStep} disabled={!canProceed()}>
                  Next <ChevronRight size={16} className="ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting || !canProceed()}>
                  {submitting ? <Loader2 size={16} className="animate-spin mr-1" /> : <Megaphone size={16} className="mr-1" />}
                  {submitting ? "Launching..." : "Launch Campaign"}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Budget Summary */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <DollarSign size={15} className="text-green-600" /> Budget Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-xs text-text-4">Daily Budget</span>
                  <span className="text-xs font-semibold text-text-1">{formatNaira(settings.dailyBudget)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-xs text-text-4">Duration</span>
                  <span className="text-xs font-semibold text-text-1">{campaignDuration || 30} days</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                  <span className="text-xs font-medium text-text-2">Total Budget</span>
                  <span className="text-xs font-bold text-text-1">{formatNaira(totalBudget)}</span>
                </div>
                <div className="bg-green-50 rounded-lg p-3 mt-3">
                  <p className="text-xs font-medium text-green-700">Est. Daily Reach</p>
                  <p className="text-lg font-bold text-green-700">{estimatedDailyReach.toLocaleString()}</p>
                  <p className="text-[10px] text-green-600">Estimated impressions per day</p>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <Eye size={15} className="text-text-4" /> Campaign Summary
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-4">Type</span>
                  <span className="text-[10px] font-medium text-text-1">{campaignType ? campaignTypes.find((t) => t.value === campaignType)?.label : "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-4">Targeting</span>
                  <span className="text-[10px] font-medium text-text-1 capitalize">{targetingMode || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-4">Ad Groups</span>
                  <span className="text-[10px] font-medium text-text-1">{adGroups.filter((g) => g.name).length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-4">Products</span>
                  <span className="text-[10px] font-medium text-text-1">{adGroups.reduce((s, g) => s + g.products.length, 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-4">Keywords</span>
                  <span className="text-[10px] font-medium text-text-1">{targetingMode === "manual" ? keywords.length : "Auto"}</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-4">
              <h4 className="text-xs font-semibold text-blue flex items-center gap-1 mb-2"><TrendingUp size={12} /> Tips</h4>
              <ul className="space-y-1.5">
                {[
                  "Start with automatic targeting to gather data",
                  "Use negative keywords to reduce wasted spend",
                  "Set a daily budget you're comfortable with",
                  "Monitor campaigns for 7 days before making changes",
                  "Test different bid strategies for best results",
                ].map((tip, i) => (
                  <li key={i} className="text-[10px] text-text-2 flex items-start gap-1.5">
                    <span className="text-blue mt-0.5">\u2022</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </VendorShell>
  );
}
