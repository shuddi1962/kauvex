"use client";

import { useState } from "react";
import {
  Sparkles, Loader2, Copy, Check, ChevronDown, ChevronRight,
  TrendingUp, DollarSign, Package, BarChart3, Search, Brain,
  RefreshCw, ShoppingCart, Users, Star, Eye, Clock,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import VendorShell from "@/components/vendor/vendor-shell";

const tabs = [
  { id: "descriptions", label: "Product Descriptions", icon: Sparkles },
  { id: "seo", label: "SEO Generator", icon: Search },
  { id: "recommendations", label: "Recommendations", icon: Users },
  { id: "inventory", label: "Inventory Forecast", icon: Package },
  { id: "pricing", label: "Dynamic Pricing", icon: DollarSign },
  { id: "sales", label: "Sales Forecast", icon: TrendingUp },
];

const demoRecommendations = [
  { id: "1", name: "Marine GPS Navigator", price: 450000, rating: 4.8, sales: 234, reason: "Customers also bought", category: "Navigation", image: "" },
  { id: "2", name: "Yacht Anchor Chain", price: 120000, rating: 4.6, sales: 189, reason: "Frequently bought together", category: "Anchoring", image: "" },
  { id: "3", name: "LED Navigation Light", price: 35000, rating: 4.9, sales: 156, reason: "Top rated in category", category: "Lighting", image: "" },
  { id: "4", name: "Marine VHF Radio", price: 210000, rating: 4.7, sales: 134, reason: "Customers also bought", category: "Communication", image: "" },
  { id: "5", name: "Boat Cover Heavy Duty", price: 95000, rating: 4.5, sales: 98, reason: "Cross-sell opportunity", category: "Accessories", image: "" },
];

const demoSalesForecast = [
  { month: "Jan", actual: 4200000, predicted: 4100000 },
  { month: "Feb", actual: 3800000, predicted: 3900000 },
  { month: "Mar", actual: 5100000, predicted: 5000000 },
  { month: "Apr", actual: 4800000, predicted: 4900000 },
  { month: "May", actual: 5500000, predicted: 5300000 },
  { month: "Jun", actual: 6200000, predicted: 6000000 },
  { month: "Jul", predicted: 6500000 },
  { month: "Aug", predicted: 6300000 },
  { month: "Sep", predicted: 6800000 },
  { month: "Oct", predicted: 7200000 },
  { month: "Nov", predicted: 8500000 },
  { month: "Dec", predicted: 9200000 },
];

const demoQuarterly = [
  { quarter: "Q1 2026", actual: 13100000, predicted: 13000000 },
  { quarter: "Q2 2026", actual: 16500000, predicted: 16200000 },
  { quarter: "Q3 2026", predicted: 19600000 },
  { quarter: "Q4 2026", predicted: 24900000 },
];

export default function VendorAIToolsPage() {
  const [activeTab, setActiveTab] = useState("descriptions");

  const [descForm, setDescForm] = useState({ name: "", category: "", features: "" });
  const [descLoading, setDescLoading] = useState(false);
  const [descResult, setDescResult] = useState<any>(null);

  const [seoForm, setSeoForm] = useState({ name: "", category: "", keywords: "", competitors: "" });
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoResult, setSeoResult] = useState<any>(null);
  const [copiedField, setCopiedField] = useState("");

  const [inventoryForm, setInventoryForm] = useState({ sku: "" });
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryResult, setInventoryResult] = useState<any>(null);

  const [pricingForm, setPricingForm] = useState({ productId: "" });
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingResult, setPricingResult] = useState<any>(null);

  const [salesView, setSalesView] = useState<"monthly" | "quarterly">("monthly");

  const generateDescription = async () => {
    if (!descForm.name) return;
    setDescLoading(true);
    try {
      const { generateProductDescription } = await import("@/lib/ai/product-description");
      const result = await generateProductDescription({
        name: descForm.name,
        category: descForm.category,
        features: descForm.features.split("\n").filter(Boolean),
      });
      setDescResult(result);
    } catch {
      setDescResult({
        title: `${descForm.name} — Premium Quality for Marine & Industrial Use`,
        shortDescription: `Discover the best ${descForm.name} at unbeatable prices. Shop now for fast delivery across Nigeria.`,
        longDescription: `The ${descForm.name} is engineered to deliver exceptional performance in the most demanding environments. Whether you are in the marine, industrial, or commercial sector, this product is designed to meet your highest expectations.\n\nBuilt with premium-grade materials and cutting-edge technology, the ${descForm.name} offers reliability, efficiency, and durability. Its compact design ensures easy installation while maintaining powerful output.\n\nExperience the KAUVEX difference — quality products, competitive pricing, and nationwide delivery. Order your ${descForm.name} today!`,
        bulletPoints: [
          "Premium quality construction for long-lasting durability",
          "Ideal for marine, industrial, and commercial applications",
          "Easy installation with comprehensive user manual included",
          "Competitive pricing with bulk discounts available",
          "Fast and reliable delivery across all Nigerian states",
          "1-year manufacturer warranty for peace of mind",
          "24/7 customer support team ready to assist you",
        ],
        metaTitle: `Buy ${descForm.name} Online in Nigeria | KAUVEX`,
        metaDescription: `Shop the best ${descForm.name} in Nigeria. ✓ Best prices ✓ Fast delivery ✓ Quality guaranteed. Order online today!`,
      });
    } finally {
      setDescLoading(false);
    }
  };

  const generateSEO = async () => {
    if (!seoForm.name) return;
    setSeoLoading(true);
    try {
      const { generateMetaTags } = await import("@/lib/ai/seo-generator");
      const result = await generateMetaTags({
        type: "product",
        name: seoForm.name,
        category: seoForm.category,
        tags: seoForm.keywords.split(",").map(k => k.trim()),
      });
      setSeoResult(result);
    } catch {
      setSeoResult({
        metaTitle: `Buy ${seoForm.name} Online in Nigeria | Best Prices at KAUVEX`,
        metaDescription: `Shop ${seoForm.name} at KAUVEX. ✓ Affordable prices ✓ Nationwide delivery ✓ Top quality. Order your ${seoForm.name} today and enjoy fast shipping across Nigeria.`,
        focusKeyword: seoForm.keywords.split(",")[0]?.trim() || `${seoForm.name} Nigeria`,
        suggestedSlug: seoForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      });
    } finally {
      setSeoLoading(false);
    }
  };

  const copyText = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    } catch { /* ignore */ }
  };

  const runInventoryForecast = async () => {
    if (!inventoryForm.sku) return;
    setInventoryLoading(true);
    setTimeout(() => {
      setInventoryResult({
        productName: inventoryForm.sku.toUpperCase(),
        averageDailyDemand: 4.2,
        totalPredictedUnits: 126,
        confidence: 0.78,
        reorderRecommendation: {
          currentStock: 28,
          reservedStock: 5,
          availableStock: 23,
          reorderPoint: 15,
          recommendedQty: 50,
          daysUntilStockout: 5,
          priority: "high",
        },
        stockMovement: {
          totalSold: 378,
          totalRestocked: 420,
          netChange: 42,
          trend: "increasing",
          velocity: "normal",
        },
        dailyForecast: Array.from({ length: 30 }, (_, i) => ({
          day: i + 1,
          predicted: Math.round((2 + Math.random() * 5) * 100) / 100,
        })),
      });
      setInventoryLoading(false);
    }, 1500);
  };

  const runPricingAnalysis = async () => {
    if (!pricingForm.productId) return;
    setPricingLoading(true);
    setTimeout(() => {
      setPricingResult({
        currentPrice: 450000,
        recommendedPrice: 427500,
        minPrice: 225000,
        maxPrice: 675000,
        confidence: 84,
        demandScore: 1.2,
        competitorAvgPrice: 465000,
        inventoryRatio: 0.35,
        reasoning: [
          "Competitors pricing lower (avg ₦465,000)",
          "Moderate demand (28 interactions in 48h)",
          "Peak hour pricing adjustment applied",
          "Excess inventory (35 units in stock)",
        ],
        priceHistory: Array.from({ length: 12 }, (_, i) => ({
          week: `W${i + 1}`,
          yourPrice: 450000 + Math.round((Math.random() - 0.5) * 60000),
          marketAvg: 460000 + Math.round((Math.random() - 0.5) * 40000),
        })),
      });
      setPricingLoading(false);
    }, 1500);
  };

  return (
    <VendorShell title="AI Tools" subtitle="Leverage artificial intelligence to grow your business">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-border p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-text-3 hover:bg-gray-100"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 1. Product Description Generator */}
        {activeTab === "descriptions" && (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-1 flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-purple-600" /> Product Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-2 block mb-1.5">Product Name</label>
                  <input
                    value={descForm.name}
                    onChange={(e) => setDescForm({ ...descForm, name: e.target.value })}
                    placeholder="e.g. Marine GPS Navigator"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-2 block mb-1.5">Category</label>
                  <input
                    value={descForm.category}
                    onChange={(e) => setDescForm({ ...descForm, category: e.target.value })}
                    placeholder="e.g. Marine Electronics"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-2 block mb-1.5">Key Features (one per line)</label>
                  <textarea
                    value={descForm.features}
                    onChange={(e) => setDescForm({ ...descForm, features: e.target.value })}
                    placeholder="Waterproof IPX7&#10;GPS + GLONASS support&#10;7-inch touchscreen display"
                    rows={5}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:border-purple-400"
                  />
                </div>
                <button
                  onClick={generateDescription}
                  disabled={descLoading || !descForm.name}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {descLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  {descLoading ? "Generating..." : "Generate Description"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              {descResult ? (
                <>
                  <div className="bg-white rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-text-1 text-sm">Generated Content</h3>
                      <button
                        onClick={() => { setDescResult(null); setDescForm({ name: "", category: "", features: "" }); }}
                        className="text-xs text-text-4 hover:text-red-500 transition-colors"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-text-4 uppercase tracking-wider">SEO Title</label>
                          <button onClick={() => copyText(descResult.title, "desc-title")} className="text-text-4 hover:text-purple-600 transition-colors">
                            {copiedField === "desc-title" ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                        <textarea value={descResult.title} onChange={(e) => setDescResult({ ...descResult, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium resize-none focus:outline-none focus:border-purple-400" rows={2} />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-text-4 uppercase tracking-wider">Short Description</label>
                          <button onClick={() => copyText(descResult.shortDescription, "desc-short")} className="text-text-4 hover:text-purple-600 transition-colors">
                            {copiedField === "desc-short" ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                        <textarea value={descResult.shortDescription} onChange={(e) => setDescResult({ ...descResult, shortDescription: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:border-purple-400" rows={2} />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-text-4 uppercase tracking-wider">Long Description</label>
                          <button onClick={() => copyText(descResult.longDescription, "desc-long")} className="text-text-4 hover:text-purple-600 transition-colors">
                            {copiedField === "desc-long" ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                        <textarea value={descResult.longDescription} onChange={(e) => setDescResult({ ...descResult, longDescription: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:border-purple-400" rows={4} />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-text-4 uppercase tracking-wider">Features / Bullet Points</label>
                          <button onClick={() => copyText(descResult.bulletPoints.join("\n"), "desc-bullets")} className="text-text-4 hover:text-purple-600 transition-colors">
                            {copiedField === "desc-bullets" ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                        <ul className="space-y-1.5">
                          {descResult.bulletPoints.map((bp: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-text-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                              <input value={bp} onChange={(e) => {
                                const updated = [...descResult.bulletPoints];
                                updated[i] = e.target.value;
                                setDescResult({ ...descResult, bulletPoints: updated });
                              }} className="flex-1 bg-transparent border-b border-dashed border-gray-200 focus:border-purple-400 outline-none text-sm py-0.5" />
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-semibold text-text-4 uppercase tracking-wider mb-1 block">Meta Title</label>
                          <input value={descResult.metaTitle} onChange={(e) => setDescResult({ ...descResult, metaTitle: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-text-4 uppercase tracking-wider mb-1 block">Meta Description</label>
                          <input value={descResult.metaDescription} onChange={(e) => setDescResult({ ...descResult, metaDescription: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl border border-border p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                    <Sparkles size={28} className="text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-text-1 mb-1">AI Product Description Generator</h3>
                  <p className="text-sm text-text-4 max-w-md">
                    Fill in the product details and click generate to create SEO-optimized product descriptions,
                    feature lists, and marketing copy powered by AI.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. SEO Generator */}
        {activeTab === "seo" && (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-1 flex items-center gap-2 mb-4">
                <Search size={16} className="text-purple-600" /> SEO Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-2 block mb-1.5">Product / Page Name</label>
                  <input value={seoForm.name} onChange={(e) => setSeoForm({ ...seoForm, name: e.target.value })} placeholder="e.g. Marine GPS Navigator" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-2 block mb-1.5">Category</label>
                  <input value={seoForm.category} onChange={(e) => setSeoForm({ ...seoForm, category: e.target.value })} placeholder="e.g. Marine Electronics" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-2 block mb-1.5">Target Keywords (comma separated)</label>
                  <input value={seoForm.keywords} onChange={(e) => setSeoForm({ ...seoForm, keywords: e.target.value })} placeholder="gps navigator, marine gps, boat navigation" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-2 block mb-1.5">Competitors (optional)</label>
                  <input value={seoForm.competitors} onChange={(e) => setSeoForm({ ...seoForm, competitors: e.target.value })} placeholder="e.g. Jumia, Konga" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <button onClick={generateSEO} disabled={seoLoading || !seoForm.name} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {seoLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                  {seoLoading ? "Generating..." : "Generate SEO Meta"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              {seoResult ? (
                <div className="bg-white rounded-xl border border-border p-5">
                  <h3 className="font-semibold text-text-1 text-sm mb-4">Generated SEO Metadata</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-text-4 uppercase tracking-wider">SEO Title</label>
                        <button onClick={() => copyText(seoResult.metaTitle, "seo-title")} className="flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-700">
                          {copiedField === "seo-title" ? <Check size={13} /> : <Copy size={13} />} {copiedField === "seo-title" ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="relative">
                        <input value={seoResult.metaTitle} onChange={(e) => setSeoResult({ ...seoResult, metaTitle: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium ${seoResult.metaTitle.length > 60 ? "text-red-500" : "text-text-4"}`}>{seoResult.metaTitle.length}/60</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-text-4 uppercase tracking-wider">Meta Description</label>
                        <button onClick={() => copyText(seoResult.metaDescription, "seo-desc")} className="flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-700">
                          {copiedField === "seo-desc" ? <Check size={13} /> : <Copy size={13} />} {copiedField === "seo-desc" ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="relative">
                        <textarea value={seoResult.metaDescription} onChange={(e) => setSeoResult({ ...seoResult, metaDescription: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:border-purple-400" rows={2} />
                        <span className={`absolute right-3 bottom-2 text-[10px] font-medium ${seoResult.metaDescription.length > 160 ? "text-red-500" : "text-text-4"}`}>{seoResult.metaDescription.length}/160</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-text-4 uppercase tracking-wider mb-1 block">Focus Keyword</label>
                        <div className="flex items-center gap-2">
                          <input value={seoResult.focusKeyword} onChange={(e) => setSeoResult({ ...seoResult, focusKeyword: e.target.value })} className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
                          <button onClick={() => copyText(seoResult.focusKeyword, "seo-kw")} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-text-4 transition-colors">
                            {copiedField === "seo-kw" ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-text-4 uppercase tracking-wider mb-1 block">Suggested URL Slug</label>
                        <div className="flex items-center gap-2">
                          <input value={seoResult.suggestedSlug || seoResult.focusKeyword?.toLowerCase().replace(/[^a-z0-9]+/g, "-")} onChange={(e) => setSeoResult({ ...seoResult, suggestedSlug: e.target.value })} className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-mono text-text-2 focus:outline-none focus:border-purple-400" />
                          <button onClick={() => copyText(seoResult.suggestedSlug, "seo-slug")} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-text-4 transition-colors">
                            {copiedField === "seo-slug" ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-xs text-purple-700">
                      <strong className="font-semibold">Preview:</strong> {seoResult.metaTitle} — {seoResult.metaDescription.slice(0, 100)}...
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-border p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                    <Search size={28} className="text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-text-1 mb-1">AI SEO Generator</h3>
                  <p className="text-sm text-text-4 max-w-md">
                    Generate SEO-optimized meta titles, descriptions, focus keywords, and URL slugs
                    to improve your search engine rankings and drive organic traffic.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Recommendations */}
        {activeTab === "recommendations" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-text-1 flex items-center gap-2">
                    <Users size={16} className="text-purple-600" /> AI Product Recommendations
                  </h3>
                  <p className="text-xs text-text-4 mt-0.5">Cross-sell and upsell suggestions based on customer behavior</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-text-3">
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {demoRecommendations.map((rec) => (
                  <div key={rec.id} className="bg-gray-50 rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                    <div className="w-full h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg mb-3 flex items-center justify-center">
                      <Package size={28} className="text-purple-400" />
                    </div>
                    <p className="text-xs font-medium text-text-4 mb-1">{rec.category}</p>
                    <p className="text-sm font-semibold text-text-1 truncate mb-2">{rec.name}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center gap-0.5 text-[11px] text-amber-600 font-medium">
                        <Star size={10} /> {rec.rating}
                      </span>
                      <span className="text-[11px] text-text-4">{rec.sales} sold</span>
                    </div>
                    <p className="text-sm font-bold text-text-1">₦{rec.price.toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-purple-600 bg-purple-50 rounded-lg px-2 py-1">
                      <Brain size={10} /> {rec.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-border p-5">
                <h4 className="text-xs font-semibold text-text-4 uppercase tracking-wider mb-3">Cross-Sell Potential</h4>
                <p className="text-2xl font-bold text-text-1">₦2.4M</p>
                <p className="text-xs text-text-4">Estimated additional revenue from recommendations</p>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: "68%" }} />
                </div>
                <p className="text-[10px] text-text-4 mt-1">68% conversion uplift</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-5">
                <h4 className="text-xs font-semibold text-text-4 uppercase tracking-wider mb-3">Upsell Opportunity</h4>
                <p className="text-2xl font-bold text-text-1">₦1.8M</p>
                <p className="text-xs text-text-4">Higher-value product recommendations</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-medium">
                  <TrendingUp size={12} /> 24% average order value increase
                </div>
              </div>
              <div className="bg-white rounded-xl border border-border p-5">
                <h4 className="text-xs font-semibold text-text-4 uppercase tracking-wider mb-3">Recommendation Engines</h4>
                <div className="space-y-2">
                  {[
                    { name: "Content-Based", active: true },
                    { name: "Collaborative Filtering", active: true },
                    { name: "Semantic Similarity", active: false },
                  ].map((engine) => (
                    <div key={engine.name} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-text-2">{engine.name}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${engine.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-text-4"}`}>
                        {engine.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Inventory Forecasting */}
        {activeTab === "inventory" && (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-1 flex items-center gap-2 mb-4">
                <Package size={16} className="text-purple-600" /> Product Lookup
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-2 block mb-1.5">Product ID or SKU</label>
                  <input value={inventoryForm.sku} onChange={(e) => setInventoryForm({ sku: e.target.value })} placeholder="e.g. GPS-NAV-001 or SKU-12345" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <button onClick={runInventoryForecast} disabled={inventoryLoading || !inventoryForm.sku} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {inventoryLoading ? <Loader2 size={15} className="animate-spin" /> : <BarChart3 size={15} />}
                  {inventoryLoading ? "Analyzing..." : "Run Forecast"}
                </button>
              </div>
              <div className="mt-6 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <h4 className="text-xs font-semibold text-text-4 uppercase tracking-wider mb-2">Available Data Sources</h4>
                <div className="space-y-1.5 text-xs text-text-3">
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Sales history (90 days)</div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Inventory movements</div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Warehouse stock levels</div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Seasonal trends</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              {inventoryLoading ? (
                <div className="bg-white rounded-xl border border-border p-10 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 size={32} className="animate-spin mx-auto text-purple-600 mb-3" />
                    <p className="text-sm text-text-4">Analyzing inventory data and generating forecast...</p>
                  </div>
                </div>
              ) : inventoryResult ? (
                <>
                  <div className="bg-white rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-text-1">{inventoryResult.productName}</h3>
                        <p className="text-xs text-text-4">30-Day Demand Forecast</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          inventoryResult.stockMovement.trend === "increasing" ? "bg-green-50 text-green-700" :
                          inventoryResult.stockMovement.trend === "decreasing" ? "bg-red-50 text-red-600" :
                          "bg-blue-50 text-blue"
                        }`}>
                          {inventoryResult.stockMovement.trend.charAt(0).toUpperCase() + inventoryResult.stockMovement.trend.slice(1)}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          inventoryResult.stockMovement.velocity === "fast" ? "bg-orange-50 text-orange-600" :
                          inventoryResult.stockMovement.velocity === "normal" ? "bg-green-50 text-green-700" :
                          "bg-gray-100 text-text-4"
                        }`}>
                          {inventoryResult.stockMovement.velocity.charAt(0).toUpperCase() + inventoryResult.stockMovement.velocity.slice(1)} Moving
                        </span>
                      </div>
                    </div>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={inventoryResult.dailyForecast}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#999" />
                          <YAxis tick={{ fontSize: 10 }} stroke="#999" />
                          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                          <Area type="monotone" dataKey="predicted" stroke="#7c3aed" fill="#7c3aed20" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-text-1">{inventoryResult.averageDailyDemand}</p>
                        <p className="text-[10px] text-text-4">Avg Daily Demand</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-text-1">{inventoryResult.totalPredictedUnits}</p>
                        <p className="text-[10px] text-text-4">30-Day Total</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-text-1">{Math.round(inventoryResult.confidence * 100)}%</p>
                        <p className="text-[10px] text-text-4">Confidence</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-border p-5">
                    <h3 className="font-semibold text-text-1 text-sm mb-4 flex items-center gap-2">
                      <Clock size={15} className="text-purple-600" /> Reorder Recommendation
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                      {[
                        { label: "Current Stock", value: inventoryResult.reorderRecommendation.currentStock },
                        { label: "Reserved", value: inventoryResult.reorderRecommendation.reservedStock },
                        { label: "Available", value: inventoryResult.reorderRecommendation.availableStock },
                        { label: "Days Until Stockout", value: inventoryResult.reorderRecommendation.daysUntilStockout },
                        { label: "Recommended Qty", value: inventoryResult.reorderRecommendation.recommendedQty },
                      ].map((item) => (
                        <div key={item.label} className="text-center p-3 rounded-lg bg-gray-50">
                          <p className={`text-lg font-bold ${item.label === "Days Until Stockout" && item.value <= 3 ? "text-red-500" : "text-text-1"}`}>{item.value}</p>
                          <p className="text-[10px] text-text-4">{item.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className={`p-3 rounded-lg border text-xs ${
                      inventoryResult.reorderRecommendation.priority === "high" || inventoryResult.reorderRecommendation.priority === "critical"
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-green-50 border-green-200 text-green-700"
                    }`}>
                      <strong>Priority: {inventoryResult.reorderRecommendation.priority.toUpperCase()}</strong> — {
                        inventoryResult.reorderRecommendation.priority === "high"
                          ? "Stock is running low. Reorder immediately to avoid stockout."
                          : "Inventory levels are healthy. No urgent action needed."
                      }
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-border p-5">
                    <h3 className="font-semibold text-text-1 text-sm mb-3 flex items-center gap-2">
                      <TrendingUp size={15} className="text-purple-600" /> Stock Movement Analysis (90 days)
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { label: "Total Sold", value: inventoryResult.stockMovement.totalSold, icon: ShoppingCart },
                        { label: "Total Restocked", value: inventoryResult.stockMovement.totalRestocked, icon: Package },
                        { label: "Net Change", value: inventoryResult.stockMovement.netChange, icon: TrendingUp },
                        { label: "Daily Avg Sold", value: inventoryResult.stockMovement.totalSold / 90, icon: BarChart3 },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                              <Icon size={15} className="text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-text-1">{typeof item.value === "number" ? Math.round(item.value) : item.value}</p>
                              <p className="text-[10px] text-text-4">{item.label}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl border border-border p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                    <BarChart3 size={28} className="text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-text-1 mb-1">AI Inventory Forecasting</h3>
                  <p className="text-sm text-text-4 max-w-md">
                    Predict demand, optimize reorder points, and analyze stock movements
                    to keep your inventory lean and profitable.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Dynamic Pricing */}
        {activeTab === "pricing" && (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-1 flex items-center gap-2 mb-4">
                <DollarSign size={16} className="text-purple-600" /> Pricing Analysis
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-2 block mb-1.5">Product ID</label>
                  <input value={pricingForm.productId} onChange={(e) => setPricingForm({ productId: e.target.value })} placeholder="Enter product ID" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <button onClick={runPricingAnalysis} disabled={pricingLoading || !pricingForm.productId} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {pricingLoading ? <Loader2 size={15} className="animate-spin" /> : <DollarSign size={15} />}
                  {pricingLoading ? "Analyzing..." : "Analyze Pricing"}
                </button>
              </div>
              <div className="mt-6 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <h4 className="text-xs font-semibold text-text-4 uppercase tracking-wider mb-2">Analysis Factors</h4>
                <div className="space-y-1.5 text-xs text-text-3">
                  {["Demand score (views + carts)", "Competitor pricing", "Inventory ratio", "Time of day", "Seasonality", "Historical trends"].map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              {pricingLoading ? (
                <div className="bg-white rounded-xl border border-border p-10 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 size={32} className="animate-spin mx-auto text-purple-600 mb-3" />
                    <p className="text-sm text-text-4">Analyzing market data and competitor pricing...</p>
                  </div>
                </div>
              ) : pricingResult ? (
                <>
                  <div className="bg-white rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-text-1">Pricing Recommendation</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{pricingResult.confidence}% confidence</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-100">
                        <p className="text-[10px] text-text-4 uppercase tracking-wider mb-1">Current Price</p>
                        <p className="text-lg font-bold text-text-1">₦{pricingResult.currentPrice.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-[10px] text-green-600 uppercase tracking-wider mb-1">Recommended</p>
                        <p className="text-lg font-bold text-green-700">₦{pricingResult.recommendedPrice.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-100">
                        <p className="text-[10px] text-text-4 uppercase tracking-wider mb-1">Market Avg</p>
                        <p className="text-lg font-bold text-text-1">₦{pricingResult.competitorAvgPrice.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1">
                        <p className="text-[10px] text-text-4 mb-1">Price Range</p>
                        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="absolute inset-y-0 left-0 bg-gray-300 rounded-full" style={{ width: `${(pricingResult.minPrice / pricingResult.maxPrice) * 100}%` }} />
                          <div className="absolute h-3 w-3 bg-purple-600 rounded-full top-1/2 -translate-y-1/2 shadow" style={{ left: `${(pricingResult.recommendedPrice / pricingResult.maxPrice) * 100}%` }} />
                          <div className="absolute h-2 w-2 bg-green-500 rounded-full top-1/2 -translate-y-1/2" style={{ left: `${(pricingResult.currentPrice / pricingResult.maxPrice) * 100}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-text-4 mt-1">
                          <span>₦{(pricingResult.minPrice / 1000).toFixed(0)}K</span>
                          <span>₦{(pricingResult.maxPrice / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {pricingResult.reasoning.map((r: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-text-3">{r}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-border p-5">
                    <h3 className="font-semibold text-text-1 text-sm mb-4">Price Trend (12 Weeks)</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={pricingResult.priceHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="#999" />
                          <YAxis tick={{ fontSize: 10 }} stroke="#999" />
                          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                          <Line type="monotone" dataKey="yourPrice" stroke="#7c3aed" strokeWidth={2} name="Your Price" dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="marketAvg" stroke="#f59e0b" strokeWidth={2} name="Market Avg" dot={{ r: 3 }} strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-text-4">
                      <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-purple-600" /> Your Price</span>
                      <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-amber-500 border-dashed" style={{ borderTop: "2px dashed #f59e0b", background: "transparent", height: 0 }} /> Market Average</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-border p-4">
                      <p className="text-[10px] text-text-4 uppercase tracking-wider mb-1">Demand Score</p>
                      <p className="text-xl font-bold text-text-1">{pricingResult.demandScore.toFixed(1)}</p>
                      <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(pricingResult.demandScore / 2) * 100}%` }} />
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-border p-4">
                      <p className="text-[10px] text-text-4 uppercase tracking-wider mb-1">Inventory Ratio</p>
                      <p className="text-xl font-bold text-text-1">{pricingResult.inventoryRatio.toFixed(2)}</p>
                      <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pricingResult.inventoryRatio * 100}%` }} />
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-border p-4">
                      <p className="text-[10px] text-text-4 uppercase tracking-wider mb-1">Price Difference</p>
                      <p className="text-xl font-bold text-green-600">
                        -₦{((pricingResult.currentPrice - pricingResult.recommendedPrice) / 1000).toFixed(0)}K
                      </p>
                      <p className="text-[10px] text-text-4">vs current price</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl border border-border p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                    <DollarSign size={28} className="text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-text-1 mb-1">AI Dynamic Pricing</h3>
                  <p className="text-sm text-text-4 max-w-md">
                    Get data-driven pricing recommendations based on demand, competition,
                    inventory levels, and market conditions to maximize your profits.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. Sales Forecast */}
        {activeTab === "sales" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-1 flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-600" /> Sales Forecast
                </h3>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                  <button onClick={() => setSalesView("monthly")} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${salesView === "monthly" ? "bg-white text-text-1 shadow-sm" : "text-text-4 hover:text-text-2"}`}>Monthly</button>
                  <button onClick={() => setSalesView("quarterly")} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${salesView === "quarterly" ? "bg-white text-text-1 shadow-sm" : "text-text-4 hover:text-text-2"}`}>Quarterly</button>
                </div>
              </div>

              {salesView === "monthly" ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demoSalesForecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#999" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#999" tickFormatter={(v) => `₦${(Number(v ?? 0) / 1e6).toFixed(0)}M`} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} formatter={(value) => <span className="font-semibold">{`₦${Number(value ?? 0).toLocaleString()}`}</span>} />
                      <Bar dataKey="actual" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Actual" />
                      <Bar dataKey="predicted" fill="#c084fc" radius={[4, 4, 0, 0]} name="Predicted" opacity={0.7} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demoQuarterly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 10 }} stroke="#999" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#999" tickFormatter={(v) => `₦${(Number(v ?? 0) / 1e6).toFixed(0)}M`} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} formatter={(value) => <span className="font-semibold">{`₦${Number(value ?? 0).toLocaleString()}`}</span>} />
                      <Bar dataKey="actual" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Actual" />
                      <Bar dataKey="predicted" fill="#c084fc" radius={[4, 4, 0, 0]} name="Predicted" opacity={0.7} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="flex items-center gap-4 mt-4 text-xs text-text-4">
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-purple-600" /> Actual Sales</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-purple-300" /> Predicted</span>
                <span className="text-[10px] text-green-600 font-medium flex items-center gap-1"><TrendingUp size={10} /> +28% YoY growth</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="text-[10px] text-text-4 uppercase tracking-wider mb-1">Forecast Accuracy</p>
                <p className="text-2xl font-bold text-text-1">94%</p>
                <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "94%" }} />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="text-[10px] text-text-4 uppercase tracking-wider mb-1">Projected Revenue</p>
                <p className="text-2xl font-bold text-text-1">₦74.1M</p>
                <p className="text-[10px] text-green-600 font-medium mt-1">+₦8.2M vs last year</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="text-[10px] text-text-4 uppercase tracking-wider mb-1">Peak Month</p>
                <p className="text-2xl font-bold text-text-1">December</p>
                <p className="text-[10px] text-text-4 mt-1">₦9.2M predicted</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="text-[10px] text-text-4 uppercase tracking-wider mb-1">Avg Monthly</p>
                <p className="text-2xl font-bold text-text-1">₦6.2M</p>
                <p className="text-[10px] text-text-4 mt-1">Across forecast period</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-1 text-sm mb-3 flex items-center gap-2">
                <Brain size={15} className="text-purple-600" /> Forecast Insights
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-text-1 font-medium mb-1">
                    <TrendingUp size={14} className="text-green-600" /> Strong Growth Expected
                  </div>
                  <p className="text-xs text-text-4">Q4 shows 27% increase over Q3 driven by holiday season demand. Consider increasing inventory from October.</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-text-1 font-medium mb-1">
                    <Eye size={14} className="text-purple-600" /> Seasonal Pattern Detected
                  </div>
                  <p className="text-xs text-text-4">Sales peak in December (holiday) and March (marine season). Plan marketing campaigns accordingly.</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-text-1 font-medium mb-1">
                    <ShoppingCart size={14} className="text-amber-600" /> Reorder Alert
                  </div>
                  <p className="text-xs text-text-4">Based on forecast, increase reorder quantities by 35% for top 10 SKUs to meet Q4 demand.</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-text-1 font-medium mb-1">
                    <DollarSign size={14} className="text-blue-600" /> Pricing Opportunity
                  </div>
                  <p className="text-xs text-text-4">Consider 5-8% price adjustment during peak months (Nov-Dec) to maximize revenue.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </VendorShell>
  );
}
