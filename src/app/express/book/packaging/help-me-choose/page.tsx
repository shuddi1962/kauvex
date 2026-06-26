"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Package, FileText, Shirt, Monitor, Apple,
  Wine, Gift, Factory, HelpCircle, MessageCircle, Check, Shield,
  Truck, Weight, Ruler, Sparkles,
} from "lucide-react";
import { PACKAGING_OPTIONS } from "@/lib/logistics/packaging-options";

type Step = "itemType" | "fragility" | "weight" | "size" | "result";

interface Answers {
  itemType: string;
  fragility: number;
  weightKg: number;
  sizeCategory: string;
}

const ITEM_TYPES = [
  { id: "document", label: "Document", icon: FileText, desc: "Letters, contracts, papers" },
  { id: "clothing", label: "Clothing", icon: Shirt, desc: "Apparel, fabrics, shoes" },
  { id: "electronics", label: "Electronics", icon: Monitor, desc: "Phones, laptops, gadgets" },
  { id: "food", label: "Food", icon: Apple, desc: "Perishables, groceries, snacks" },
  { id: "fragile", label: "Glass / Breakable", icon: Wine, desc: "Ceramics, mirrors, bottles" },
  { id: "gift", label: "Gift", icon: Gift, desc: "Presents, surprises, occasions" },
  { id: "industrial", label: "Industrial", icon: Factory, desc: "Tools, parts, heavy items" },
  { id: "other", label: "Other", icon: HelpCircle, desc: "Anything else" },
];

const SIZE_OPTIONS = [
  { id: "letter", label: "Letter Size", desc: "A4 or smaller", dims: "~30×21cm", icon: "📄" },
  { id: "shoebox", label: "Shoe Box", desc: "Small box", dims: "~35×25×12cm", icon: "👟" },
  { id: "backpack", label: "Backpack", desc: "Medium carry", dims: "~50×30×25cm", icon: "🎒" },
  { id: "suitcase", label: "Suitcase", desc: "Large travel", dims: "~70×50×30cm", icon: "🧳" },
  { id: "largebox", label: "Large Box", desc: "Oversized", dims: "~80×60×50cm", icon: "📦" },
];

const FRAGILITY_LABELS = [
  "Not at all",
  "Mostly sturdy",
  "Somewhat delicate",
  "Quite fragile",
  "Very fragile",
];

function getRecommendation(answers: Answers) {
  const { itemType, fragility, weightKg, sizeCategory } = answers;
  const scores: Record<string, number> = {};

  PACKAGING_OPTIONS.forEach((opt) => {
    let score = 0;

    if (itemType === "document" && opt.type === "poly_mailer") score += 40;
    if (itemType === "document" && opt.type === "tube") score += 20;
    if (itemType === "clothing" && opt.type === "poly_mailer") score += 40;
    if (itemType === "clothing" && opt.type === "bubble_mailer") score += 15;
    if (itemType === "electronics" && opt.type === "bubble_mailer") score += 30;
    if (itemType === "electronics" && opt.type === "standard_box") score += 25;
    if (itemType === "electronics" && opt.type === "fragile_pack") score += 15;
    if (itemType === "food" && opt.type === "insulated") score += 50;
    if (itemType === "food" && opt.type === "standard_box") score += 15;
    if (itemType === "fragile" && opt.type === "fragile_pack") score += 50;
    if (itemType === "fragile" && opt.type === "bubble_mailer") score += 10;
    if (itemType === "gift" && opt.type === "gift_box") score += 50;
    if (itemType === "gift" && opt.type === "standard_box") score += 15;
    if (itemType === "industrial" && opt.type === "heavy_duty") score += 50;
    if (itemType === "industrial" && opt.type === "standard_box") score += 10;
    if (itemType === "other" && opt.type === "standard_box") score += 25;
    if (itemType === "other" && opt.type === "bubble_mailer") score += 15;

    if (fragility >= 4) {
      if (opt.type === "fragile_pack") score += 30;
      if (opt.type === "bubble_mailer") score += 10;
      if (opt.type === "poly_mailer") score -= 20;
    } else if (fragility >= 2) {
      if (opt.type === "bubble_mailer") score += 15;
      if (opt.type === "standard_box") score += 10;
    }

    if (weightKg > 20 && opt.type === "heavy_duty") score += 25;
    if (weightKg > 20 && opt.type === "standard_box") score += 5;
    if (weightKg < 0.5 && opt.type === "poly_mailer") score += 15;
    if (weightKg < 0.5 && opt.type === "bubble_mailer") score += 10;

    if (sizeCategory === "letter") {
      if (opt.type === "poly_mailer") score += 20;
      if (opt.type === "bubble_mailer") score += 15;
      if (opt.type === "tube") score += 10;
    } else if (sizeCategory === "shoebox") {
      if (opt.type === "bubble_mailer") score += 15;
      if (opt.type === "standard_box") score += 15;
    } else if (sizeCategory === "backpack") {
      if (opt.type === "standard_box") score += 20;
      if (opt.type === "gift_box") score += 10;
    } else if (sizeCategory === "suitcase" || sizeCategory === "largebox") {
      if (opt.type === "standard_box") score += 15;
      if (opt.type === "heavy_duty") score += 15;
    }

    scores[opt.type] = score;
  });

  const ranked = PACKAGING_OPTIONS.map((opt) => ({
    ...opt,
    score: scores[opt.type] || 0,
  })).sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const alternatives = ranked.slice(1, 4);

  let reason = "";
  if (itemType === "fragile" && fragility >= 3) reason = "Your item is breakable, so maximum foam protection is recommended.";
  else if (itemType === "food") reason = "Food items need temperature control to stay fresh during transit.";
  else if (itemType === "gift") reason = "A premium gift box gives your present the wow factor it deserves.";
  else if (itemType === "industrial" || weightKg > 20) reason = "Heavy items need a reinforced double-walled box for safe delivery.";
  else if (itemType === "document") reason = "Documents are flat and lightweight — a mailer is the most cost-effective choice.";
  else if (itemType === "clothing") reason = "Soft items fit perfectly in a lightweight poly mailer.";
  else if (fragility >= 3) reason = "Delicate items benefit from padded protection.";
  else reason = "Based on your answers, this option gives the best balance of protection and cost.";

  return { best, alternatives, reason };
}

export default function HelpMeChoosePage() {
  const [step, setStep] = useState<Step>("itemType");
  const [answers, setAnswers] = useState<Answers>({
    itemType: "",
    fragility: 1,
    weightKg: 0.5,
    sizeCategory: "",
  });

  const steps: Step[] = ["itemType", "fragility", "weight", "size", "result"];
  const currentIdx = steps.indexOf(step);
  const progress = ((currentIdx + 1) / steps.length) * 100;

  const canNext = () => {
    if (step === "itemType") return !!answers.itemType;
    if (step === "size") return !!answers.sizeCategory;
    return true;
  };

  const goNext = () => {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
  };

  const goBack = () => {
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  };

  const result = step === "result" ? getRecommendation(answers) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/express/book/packaging" className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]">Help Me Choose</h1>
            <p className="text-sm text-gray-500">Answer a few questions and we&apos;ll find the perfect packaging</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Step {currentIdx + 1} of {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF6B00] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {["Item", "Fragile?", "Weight", "Size", "Result"].map((label, i) => (
              <span
                key={label}
                className={`text-[10px] font-medium ${
                  i <= currentIdx ? "text-[#FF6B00]" : "text-gray-300"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Step: Item Type */}
        {step === "itemType" && (
          <div>
            <h2 className="text-xl font-bold text-[#0A1628] mb-1">What are you sending?</h2>
            <p className="text-sm text-gray-500 mb-6">Choose the category that best describes your item</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ITEM_TYPES.map((item) => {
                const Icon = item.icon;
                const selected = answers.itemType === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setAnswers({ ...answers, itemType: item.id })}
                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                      selected
                        ? "border-[#FF6B00] bg-orange-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                      selected ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-sm text-[#0A1628]">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    {selected && (
                      <div className="mt-2 w-5 h-5 bg-[#FF6B00] text-white rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Fragility */}
        {step === "fragility" && (
          <div>
            <h2 className="text-xl font-bold text-[#0A1628] mb-1">How fragile is it?</h2>
            <p className="text-sm text-gray-500 mb-6">Slide to indicate how easily your item could break</p>
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="flex items-center gap-4 mb-4">
                <Shield className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-600">Not at all</span>
                <div className="flex-1 mx-4">
                  <input
                    type="range"
                    min={0}
                    max={4}
                    step={1}
                    value={answers.fragility}
                    onChange={(e) => setAnswers({ ...answers, fragility: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#FF6B00]"
                  />
                  <div className="flex justify-between mt-1">
                    {FRAGILITY_LABELS.map((label, i) => (
                      <span key={i} className={`text-[9px] ${i === answers.fragility ? "text-[#FF6B00] font-bold" : "text-gray-300"}`}>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-sm font-medium text-red-500 flex-shrink-0">Very fragile</span>
              </div>
              <div className="text-center mt-4">
                <span className="text-4xl">
                  {answers.fragility === 0 ? "🛡️" : answers.fragility === 1 ? "📦" : answers.fragility === 2 ? "⚠️" : answers.fragility === 3 ? "💔" : "🔮"}
                </span>
                <p className="text-sm text-gray-500 mt-2">{FRAGILITY_LABELS[answers.fragility]}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step: Weight */}
        {step === "weight" && (
          <div>
            <h2 className="text-xl font-bold text-[#0A1628] mb-1">How heavy is it?</h2>
            <p className="text-sm text-gray-500 mb-6">Enter the weight of your item in kilograms</p>
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Weight className="w-8 h-8 text-[#FF6B00]" />
                <div className="relative">
                  <input
                    type="number"
                    min={0.1}
                    max={50}
                    step={0.1}
                    value={answers.weightKg}
                    onChange={(e) => setAnswers({ ...answers, weightKg: parseFloat(e.target.value) || 0.1 })}
                    className="w-32 text-center text-4xl font-bold text-[#0A1628] border-b-2 border-[#FF6B00] focus:outline-none bg-transparent py-2"
                  />
                  <span className="absolute right-[-30px] top-1/2 -translate-y-1/2 text-lg text-gray-500 font-medium">kg</span>
                </div>
              </div>
              <div className="flex justify-center gap-2">
                {[0.5, 1, 2, 5, 10, 20].map((w) => (
                  <button
                    key={w}
                    onClick={() => setAnswers({ ...answers, weightKg: w })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      answers.weightKg === w
                        ? "bg-[#FF6B00] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {w}kg
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mt-4">
                {answers.weightKg < 0.5 && "Lightweight — poly mailer or envelope may work"}
                {answers.weightKg >= 0.5 && answers.weightKg < 5 && "Standard weight — most packaging options available"}
                {answers.weightKg >= 5 && answers.weightKg < 20 && "Moderate weight — sturdy box recommended"}
                {answers.weightKg >= 20 && "Heavy — reinforced packaging required"}
              </p>
            </div>
          </div>
        )}

        {/* Step: Size */}
        {step === "size" && (
          <div>
            <h2 className="text-xl font-bold text-[#0A1628] mb-1">What&apos;s the approximate size?</h2>
            <p className="text-sm text-gray-500 mb-6">Pick the option closest to your item</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {SIZE_OPTIONS.map((size) => {
                const selected = answers.sizeCategory === size.id;
                return (
                  <button
                    key={size.id}
                    onClick={() => setAnswers({ ...answers, sizeCategory: size.id })}
                    className={`text-center rounded-xl border-2 p-5 transition-all ${
                      selected
                        ? "border-[#FF6B00] bg-orange-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <span className="text-3xl block mb-2">{size.icon}</span>
                    <p className="font-semibold text-sm text-[#0A1628]">{size.label}</p>
                    <p className="text-xs text-gray-500">{size.desc}</p>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">{size.dims}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Result */}
        {step === "result" && result && (
          <div>
            <h2 className="text-xl font-bold text-[#0A1628] mb-1">Your Perfect Packaging</h2>
            <p className="text-sm text-gray-500 mb-6">Based on your answers, here&apos;s what we recommend</p>

            {/* Recommended card */}
            <div className="bg-white rounded-2xl border-2 border-[#FF6B00] p-6 mb-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FF6B00] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                Best Match
              </div>
              <div className="flex items-start gap-4">
                <span className="text-5xl">{result.best.icon}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#0A1628]">{result.best.name}</h3>
                  <p className="text-gray-500 mt-1">{result.best.description}</p>
                  <div className="mt-3 bg-orange-50 rounded-lg p-3 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF6B00] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{result.reason}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 mb-1">WHAT&apos;S INCLUDED</p>
                    <p className="text-sm text-gray-600">{result.best.innerProtection}</p>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">BEST FOR</p>
                    <div className="flex flex-wrap gap-1">
                      {result.best.bestFor.map((item) => (
                        <span key={item} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">{item}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Packaging fee calculated at checkout</p>
                    <Link
                      href="/express/book/packaging"
                      className="px-5 py-2.5 bg-[#FF6B00] text-white rounded-lg font-medium text-sm hover:bg-orange-600 flex items-center gap-2"
                    >
                      Select This <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Alternatives */}
            {result.alternatives.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-[#0A1628] mb-3">Alternative Options</h3>
                <div className="space-y-2">
                  {result.alternatives.map((alt, i) => (
                    <div key={alt.type} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                      <span className="text-2xl">{alt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#0A1628]">{alt.name}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            Rank #{i + 2}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{alt.description}</p>
                      </div>
                      <Link
                        href="/express/book/packaging"
                        className="text-xs text-[#FF6B00] font-medium hover:underline whitespace-nowrap"
                      >
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-gray-100 rounded-xl p-4 mb-6">
              <h4 className="font-medium text-[#0A1628] text-sm mb-2">Your Selection Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-400">Item Type</span>
                  <p className="font-medium text-[#0A1628]">{ITEM_TYPES.find((t) => t.id === answers.itemType)?.label}</p>
                </div>
                <div>
                  <span className="text-gray-400">Fragility</span>
                  <p className="font-medium text-[#0A1628]">{FRAGILITY_LABELS[answers.fragility]}</p>
                </div>
                <div>
                  <span className="text-gray-400">Weight</span>
                  <p className="font-medium text-[#0A1628]">{answers.weightKg}kg</p>
                </div>
                <div>
                  <span className="text-gray-400">Size</span>
                  <p className="font-medium text-[#0A1628]">{SIZE_OPTIONS.find((s) => s.id === answers.sizeCategory)?.label}</p>
                </div>
              </div>
            </div>

            {/* Chat link */}
            <div className="bg-[#0A1628] rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[#FF6B00]" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Not sure? Talk to us</p>
                <p className="text-white/60 text-xs">Our logistics team can help you pick the right packaging for special items</p>
              </div>
              <button className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-orange-600">
                Start Chat
              </button>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        {step !== "result" && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={goBack}
              disabled={currentIdx === 0}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={goNext}
              disabled={!canNext()}
              className="px-6 py-2.5 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {step === "size" ? "Get Recommendation" : "Next"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === "result" && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                setStep("itemType");
                setAnswers({ itemType: "", fragility: 1, weightKg: 0.5, sizeCategory: "" });
              }}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Start Over
            </button>
          </div>
        )}

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: Shield, label: "Protective Materials", desc: "All options include inner protection" },
            { icon: Truck, label: "Carrier Approved", desc: "Meets all carrier requirements" },
            { icon: Package, label: "Smart Matching", desc: "AI-powered packaging advice" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
              <Icon className="w-5 h-5 text-[#FF6B00] mt-0.5" />
              <div>
                <p className="font-medium text-[#0A1628] text-sm">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
