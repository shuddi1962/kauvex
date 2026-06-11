"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Megaphone, ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight,
  Upload, X, DollarSign, Eye, Target, Settings, Image as ImageIcon,
  Sparkles, Search, TrendingUp, Package, ShoppingCart, Store,
  Loader2, Plus,
} from "lucide-react";

const campaignTypes = [
  { value: "sponsored_product", label: "Sponsored Product", desc: "Boost individual products in search results and category pages", icon: Package },
  { value: "sponsored_brand", label: "Sponsored Brand", desc: "Showcase your brand banner with multiple products", icon: Store },
  { value: "sponsored_store", label: "Sponsored Store", desc: "Feature your entire storefront to targeted audiences", icon: ShoppingCart },
  { value: "display_ad", label: "Display Ad", desc: "Rich media banners displayed across the marketplace", icon: ImageIcon },
];

const bidTypes = [
  { value: "auto", label: "Auto", desc: "Let our system optimize bids for best results" },
  { value: "manual", label: "Manual", desc: "Set your own bid amounts per keyword or product" },
];

const storefronts = [
  { id: "kauvex", name: "KAUVEX Marketplace" },
  { id: "techmarine", name: "TechMarine Store" },
  { id: "autoguard", name: "AutoGuard Nigeria" },
  { id: "safemart", name: "Safemart Nigeria" },
  { id: "homeease", name: "HomeEase Nigeria" },
  { id: "kreativekids", name: "KreativeKids Nigeria" },
];

const targetingOptions = [
  { id: "auto", label: "Automatic Targeting", desc: "Let our AI match your ad to relevant search queries and products" },
  { id: "manual", label: "Manual Targeting", desc: "Choose specific keywords, categories, and products to target" },
];

const sampleProducts = [
  { id: "PROD-001", name: "Yamaha F150 Outboard Engine", price: 4500000, image: "/placeholder-product.svg" },
  { id: "PROD-002", name: "Marine LED Navigation Kit", price: 45000, image: "/placeholder-product.svg" },
  { id: "PROD-003", name: "Bilge Pump 2000 GPH", price: 27500, image: "/placeholder-product.svg" },
  { id: "PROD-004", name: "Hikvision 8CH DVR Security Kit", price: 185000, image: "/placeholder-product.svg" },
  { id: "PROD-005", name: "Fire Alarm Control Panel", price: 320000, image: "/placeholder-product.svg" },
];

const steps = [
  { id: 1, label: "Campaign Type", icon: Megaphone },
  { id: 2, label: "Settings", icon: Settings },
  { id: 3, label: "Targeting", icon: Target },
  { id: 4, label: "Creative", icon: ImageIcon },
];

export default function NewAdCampaignPage() {
  const [step, setStep] = useState(1);
  const [campaignType, setCampaignType] = useState("");
  const [form, setForm] = useState({
    name: "", budget: 50000, bidAmount: 500, bidType: "auto",
    startDate: "", endDate: "", targetStorefronts: [] as string[],
  });
  const [targetingType, setTargetingType] = useState("auto");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [selectedCategories] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [adCopy, setAdCopy] = useState({ headline: "", description: "", cta: "" });
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const daysDiff = form.startDate && form.endDate ? Math.max(0, Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const estimatedDailySpend = daysDiff > 0 ? Math.round(form.budget / daysDiff) : 0;

  const toggleStorefront = (id: string) => {
    setForm((prev) => ({
      ...prev,
      targetStorefronts: prev.targetStorefronts.includes(id) ? prev.targetStorefronts.filter((s) => s !== id) : [...prev.targetStorefronts, id],
    }));
  };

  const addKeyword = () => {
    const kw = keywordInput.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (kw: string) => setKeywords(keywords.filter((k) => k !== kw));

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!campaignType;
      case 2: return !!form.name && !!form.budget && !!form.startDate && !!form.endDate && form.targetStorefronts.length > 0;
      case 3: return true;
      case 4: return selectedProducts.length > 0;
      default: return false;
    }
  };

  const nextStep = () => { if (canProceed() && step < 4) setStep(step + 1); };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      alert("Campaign created successfully! It will be reviewed by our team.");
    } catch {
      alert("Failed to create campaign. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/vendor/advertising" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={18} className="text-text-3" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-text-1">Create Campaign</h1>
              <p className="text-sm text-text-4">Set up a new advertising campaign</p>
            </div>
          </div>
          <Link href="/vendor/advertising">
            <Button variant="outline" size="sm">Cancel</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                step >= s.id ? "bg-blue text-white" : "bg-gray-100 text-text-4"
              }`}>
                <s.icon size={14} />
                <span className="hidden sm:inline font-medium">{s.label}</span>
                {step > s.id && <Check size={14} />}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-1 ${step > s.id ? "bg-blue" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Main Form */}
          <div className="space-y-6">
            {/* Step 1: Campaign Type */}
            {step === 1 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-sm mb-1">Choose Campaign Type</h3>
                <p className="text-xs text-text-4 mb-4">Select the type of ad campaign you want to create</p>
                <div className="space-y-3">
                  {campaignTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button key={type.value} onClick={() => setCampaignType(type.value)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        campaignType === type.value ? "border-blue bg-blue-50" : "border-gray-100 hover:border-gray-200"
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            campaignType === type.value ? "bg-blue text-white" : "bg-gray-100 text-text-4"
                          }`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-text-1">{type.label}</p>
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
              </div>
            )}

            {/* Step 2: Campaign Settings */}
            {step === 2 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-sm mb-1">Campaign Settings</h3>
                <p className="text-xs text-text-4 mb-4">Configure your campaign details and budget</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-text-2 block mb-1">Campaign Name</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Spring Sale 2026" className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-text-2 block mb-1">Start Date</label>
                      <input type="date" value={form.startDate} min={today} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-2 block mb-1">End Date</label>
                      <input type="date" value={form.endDate} min={form.startDate || today} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-2 block mb-1">Total Budget (₦)</label>
                    <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} min={5000} step={5000} className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-2 block mb-1">Bid Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {bidTypes.map((bt) => (
                        <button key={bt.value} onClick={() => setForm({ ...form, bidType: bt.value })} className={`p-3 rounded-lg border text-left transition-all ${
                          form.bidType === bt.value ? "border-blue bg-blue-50" : "border-gray-200 hover:border-gray-300"
                        }`}>
                          <p className="text-xs font-semibold">{bt.label}</p>
                          <p className="text-[10px] text-text-4 mt-0.5">{bt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  {form.bidType === "manual" && (
                    <div>
                      <label className="text-xs font-medium text-text-2 block mb-1">Bid Amount (₦ per click)</label>
                      <input type="number" value={form.bidAmount} onChange={(e) => setForm({ ...form, bidAmount: Number(e.target.value) })} min={100} step={50} className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-text-2 block mb-1">Target Storefronts</label>
                    <div className="grid grid-cols-2 gap-2">
                      {storefronts.map((sf) => (
                        <button key={sf.id} onClick={() => toggleStorefront(sf.id)} className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                          form.targetStorefronts.includes(sf.id) ? "border-blue bg-blue-50 text-blue" : "border-gray-200 hover:border-gray-300 text-text-2"
                        }`}>
                          {sf.name}
                        </button>
                      ))}
                    </div>
                    {form.targetStorefronts.length === 0 && <p className="text-[10px] text-red mt-1">Select at least one storefront</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Targeting */}
            {step === 3 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-sm mb-1">Targeting</h3>
                <p className="text-xs text-text-4 mb-4">Define how your ad reaches customers</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {targetingOptions.map((t) => (
                      <button key={t.id} onClick={() => setTargetingType(t.id)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        targetingType === t.id ? "border-blue bg-blue-50" : "border-gray-100 hover:border-gray-200"
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            targetingType === t.id ? "bg-blue text-white" : "bg-gray-100 text-text-4"
                          }`}>
                            {t.id === "auto" ? <Sparkles size={18} /> : <Search size={18} />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-text-1">{t.label}</p>
                            <p className="text-xs text-text-4 mt-0.5">{t.desc}</p>
                          </div>
                          {targetingType === t.id && <Check size={16} className="text-blue shrink-0" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  {targetingType === "manual" && (
                    <>
                      <div>
                        <label className="text-xs font-medium text-text-2 block mb-1">Target Keywords</label>
                        <div className="flex gap-2">
                          <input type="text" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())} placeholder="Type a keyword and press Enter" className="flex-1 h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                          <Button variant="outline" size="sm" onClick={addKeyword}><Plus size={14} /></Button>
                        </div>
                        {keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {keywords.map((kw) => (
                              <span key={kw} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue text-[10px] rounded-full font-medium">
                                {kw} <button onClick={() => removeKeyword(kw)}><X size={10} /></button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-2 block mb-1">Category Targeting</label>
                        <select className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue">
                          <option value="">All categories</option>
                          <option value="marine">Marine & Boating</option>
                          <option value="security">Security & Safety</option>
                          <option value="kitchen">Kitchen & Catering</option>
                          <option value="automotive">Automotive</option>
                        </select>
                        {selectedCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {selectedCategories.map((cat) => (
                              <span key={cat} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-[10px] rounded-full font-medium">
                                {cat} <button><X size={10} /></button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Creative */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-sm mb-1">Select Products</h3>
                  <p className="text-xs text-text-4 mb-4">Choose products to feature in your campaign</p>
                  <div className="space-y-2">
                    {sampleProducts.map((product) => (
                      <button key={product.id} onClick={() => toggleProduct(product.id)} className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        selectedProducts.includes(product.id) ? "border-blue bg-blue-50" : "border-gray-100 hover:border-gray-200"
                      }`}>
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <ImageIcon size={16} className="text-text-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-1 truncate">{product.name}</p>
                          <p className="text-xs text-text-4">₦{product.price.toLocaleString()}</p>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedProducts.includes(product.id) ? "bg-blue border-blue" : "border-gray-300"
                        }`}>
                          {selectedProducts.includes(product.id) && <Check size={12} className="text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-sm mb-1">Ad Copy</h3>
                  <p className="text-xs text-text-4 mb-4">Write compelling ad content</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-text-2 block mb-1">Headline (max 50 chars)</label>
                      <input type="text" value={adCopy.headline} onChange={(e) => setAdCopy({ ...adCopy, headline: e.target.value })} maxLength={50} placeholder="e.g. Spring Sale - Up to 40% Off!" className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-2 block mb-1">Description (max 120 chars)</label>
                      <textarea value={adCopy.description} onChange={(e) => setAdCopy({ ...adCopy, description: e.target.value })} maxLength={120} rows={2} placeholder="Describe what you're offering..." className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue resize-none" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-2 block mb-1">Call to Action</label>
                      <select value={adCopy.cta} onChange={(e) => setAdCopy({ ...adCopy, cta: e.target.value })} className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue">
                        <option value="">Select CTA...</option>
                        <option value="shop_now">Shop Now</option>
                        <option value="learn_more">Learn More</option>
                        <option value="get_offer">Get Offer</option>
                        <option value="buy_now">Buy Now</option>
                        <option value="sign_up">Sign Up</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-sm mb-1">Ad Creative</h3>
                  <p className="text-xs text-text-4 mb-4">Upload images for your ad</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="aspect-[4/3] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue hover:bg-blue-50/30 transition-all">
                        <Upload size={20} className="text-text-4 mb-1" />
                        <span className="text-[10px] text-text-4">Upload {i === 1 ? "Main" : i === 2 ? "Alt" : "Mobile"}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-4 mt-2">Recommended: 1200x628px (Main), 600x600px (Alt), 300x250px (Mobile). Max 2MB each.</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={prevStep} disabled={step === 1}>
                <ChevronLeft size={16} className="mr-1" /> Previous
              </Button>
              {step < 4 ? (
                <Button onClick={nextStep} disabled={!canProceed()}>
                  Next <ChevronRight size={16} className="ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting || !canProceed()}>
                  {submitting ? <Loader2 size={16} className="animate-spin mr-1" /> : <Megaphone size={16} className="mr-1" />}
                  {submitting ? "Creating..." : "Launch Campaign"}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar: Preview + Budget Calculator */}
          <div className="space-y-6">
            {/* Budget Calculator */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <DollarSign size={15} className="text-green-600" /> Budget Calculator
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-2">Total Budget</span>
                  <span className="font-semibold text-text-1">₦{form.budget.toLocaleString()}</span>
                </div>
                {daysDiff > 0 && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-2">Campaign Duration</span>
                      <span className="font-semibold text-text-1">{daysDiff} days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-2">Est. Daily Spend</span>
                      <span className="font-semibold text-blue">₦{estimatedDailySpend.toLocaleString()}/day</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-[10px] text-text-4 mb-2">Daily spend distribution</p>
                      <div className="h-6 bg-gray-100 rounded-lg flex items-end overflow-hidden">
                        {Array.from({ length: Math.min(daysDiff, 30) }).map((_, i) => {
                          const height = 30 + Math.sin(i * 1.5) * 15 + Math.random() * 10;
                          return <div key={i} className="flex-1 bg-blue/40 rounded-t-sm" style={{ height: `${height}%` }} />;
                        })}
                      </div>
                    </div>
                  </>
                )}
                {form.bidType === "manual" && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="text-text-2">Bid Amount</span>
                    <span className="font-semibold text-text-1">₦{form.bidAmount}/click</span>
                  </div>
                )}
                <div className="bg-green-50 rounded-lg p-3 mt-3">
                  <p className="text-xs font-medium text-green-700">Estimated Reach</p>
                  <p className="text-lg font-bold text-green-700">
                    {form.budget > 0 ? `${Math.round(form.budget / (form.bidType === "manual" ? form.bidAmount : 500) * 100).toLocaleString()} - ${Math.round(form.budget / (form.bidType === "manual" ? form.bidAmount : 500) * 250).toLocaleString()}` : "0"}
                  </p>
                  <p className="text-[10px] text-green-600">Estimated impressions based on current bid</p>
                </div>
              </div>
            </div>

            {/* Ad Preview */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <Eye size={15} className="text-text-4" /> Ad Preview
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue/10 to-purple-50 flex items-center justify-center">
                    {selectedProducts.length > 0 ? (
                      <div className="text-center p-4">
                        <ImageIcon size={32} className="text-blue/40 mx-auto mb-2" />
                        <p className="text-xs text-text-4">{selectedProducts.length} product(s) selected</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <ImageIcon size={36} className="text-text-4/30 mx-auto mb-2" />
                        <p className="text-xs text-text-4">Ad creative preview</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-text-1 truncate">{adCopy.headline || "Your Ad Headline"}</p>
                    <p className="text-xs text-text-4 mt-1 line-clamp-2">{adCopy.description || "Your ad description will appear here to attract customers."}</p>
                    {adCopy.cta && (
                      <div className="mt-2">
                        <span className="text-[10px] px-3 py-1 bg-blue text-white rounded-full font-medium inline-block capitalize">{adCopy.cta.replace(/_/g, " ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-text-4 mt-2">This is how your ad will appear on the marketplace.</p>
            </div>

            {/* Help Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-4">
              <h4 className="text-xs font-semibold text-blue flex items-center gap-1 mb-2"><Sparkles size={12} /> Tips for Success</h4>
              <ul className="space-y-1.5">
                {[
                  "Set a competitive bid to win more auctions",
                  "Use high-quality images (1200x628px recommended)",
                  "Write clear, action-oriented headlines",
                  "Target relevant keywords for better conversion",
                  "Start with a 30-day campaign to gather data",
                ].map((tip, i) => (
                  <li key={i} className="text-[10px] text-text-2 flex items-start gap-1.5">
                    <span className="text-blue mt-0.5">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
