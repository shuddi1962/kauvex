"use client";

import { useState } from "react";
import {
  Package, Ruler, Shield, Printer, Tag, Globe,
  Download, ChevronDown, ChevronUp, CheckCircle2,
  Box, AlertTriangle, Maximize, Minimize,
  Droplets, Thermometer, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

interface GuideSection {
  key: string;
  icon: React.ElementType;
  title: string;
  steps: { label: string; desc: string }[];
  tips: string[];
  color: string;
  bgColor: string;
  iconColor: string;
}

const sections: GuideSection[] = [
  {
    key: "box",
    icon: Ruler,
    title: "Choosing the Right Box",
    color: "border-blue-200",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    steps: [
      { label: "Measure your product", desc: "Measure length, width, and height of your item. Add 2-3 inches on each side for cushioning material." },
      { label: "Select box strength", desc: "Single-wall is fine for items under 5 kg. Use double-wall for heavier items (5-20 kg). Triple-wall for freight." },
      { label: "Check box condition", desc: "Never reuse boxes that are crushed, torn, or have moisture damage. A damaged box leads to damaged products." },
      { label: "Right-size your box", desc: "A box that is too large wastes cushioning material and increases dimensional weight charges. Too small risks crushing." },
    ],
    tips: ["Always use new boxes for fragile items", "Avoid boxes that are more than 2 inches larger than your product on any side", "Corrugated boxes with 'burst strength' rating of 200+ lbs are recommended for heavy items"],
  },
  {
    key: "protection",
    icon: Shield,
    title: "Inner Protection & Cushioning",
    color: "border-green-200",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    steps: [
      { label: "Wrap each item individually", desc: "Use bubble wrap (at least 2 layers) for fragile items. Kraft paper for non-fragile items. Foam sheets for electronics." },
      { label: "Fill empty space", desc: "Use air pillows, packing peanuts, or crumpled kraft paper to fill all voids. Items should not shift when the box is shaken." },
      { label: "Corner protection", desc: "Use foam corner protectors or edge guards for framed items, glass, and electronics. Most damage happens at corners." },
      { label: "Layer separation", desc: "When packing multiple items, separate each layer with corrugated pad or thick foam sheet to prevent compression." },
    ],
    tips: ["Bubble wrap should be 1/8 inch minimum for items under 2 kg", "Use anti-static bubble wrap for electronics", "Never use newspaper — the ink can transfer to products in humid conditions"],
  },
  {
    key: "sealing",
    icon: Printer,
    title: "Proper Sealing & Taping",
    color: "border-amber-200",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    steps: [
      { label: "Use pressure-sensitive tape", desc: "Use 2-inch or 3-inch clear or brown acrylic tape. Avoid masking tape, duct tape, or cellophane tape — they lack strength." },
      { label: "Apply H-tape method", desc: "Seal the center seam first, then apply tape in an 'H' pattern across all seams. Each tape strip should extend 2-3 inches onto the sides." },
      { label: "Reinforce bottom and top", desc: "Apply 3 strips of tape on both the bottom and top flaps: one center, two edges. Total of 6 tape strips per box." },
      { label: "Check tape adhesion", desc: "Press tape firmly. If the box surface is dusty, wipe clean before taping. Tape must adhere to the box, not to itself." },
    ],
    tips: ["For boxes over 10 kg, use reinforced filament tape on seams", "Avoid over-taping — excess tape makes box opening difficult for customers", "Water-activated tape (gummed tape) provides the strongest seal for heavy boxes"],
  },
  {
    key: "labels",
    icon: Tag,
    title: "Labels & Documentation",
    color: "border-purple-200",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    steps: [
      { label: "Print clearly and large", desc: "Shipping labels must be printed at full size (4x6 inches recommended). Never hand-write labels for carrier shipments." },
      { label: "Place in the right spot", desc: "Affix label on the largest flat surface. Do not place over seams, tape, or box edges. Avoid placing near handles." },
      { label: "Include return address", desc: "Always put your return address on the box (top-left corner) in addition to the carrier label. Use a separate address label." },
      { label: "Fragile and orientation labels", desc: "Add 'Fragile' stickers on all sides for breakables. Use 'This Side Up' arrows on boxes with directional requirements." },
    ],
    tips: ["Place one label inside the box too (packing slip) in case the outer label is damaged", "Use clear tape to cover the label for waterproofing in wet conditions", "Remove old labels/barcodes when reusing boxes (though we recommend new boxes)"],
  },
  {
    key: "special",
    icon: AlertTriangle,
    title: "Special Items & Hazards",
    color: "border-red-200",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    steps: [
      { label: "Liquids", desc: "Use leak-proof containers. Place in sealed plastic bag. Pack with absorbent material. Mark orientation clearly." },
      { label: "Electronics & Batteries", desc: "Use anti-static packaging. Remove batteries for transport. Use foam cutouts for fit. Label as containing lithium batteries if applicable." },
      { label: "Fragile & Glass", desc: "Double-box fragile items. Minimum 2 inches of cushioning on all sides. Mark clearly. Consider insurance for high-value items." },
      { label: "Perishables & Food", desc: "Use insulated coolers with ice packs. Mark 'Perishable'. Use expedited shipping. Check carrier restrictions for food items." },
    ],
    tips: ["Lithium batteries shipped alone require special hazardous materials handling", "Never mix liquids with electronics in the same box", "Perishable goods must be shipped via express service — standard shipping voids claims"],
  },
  {
    key: "international",
    icon: Globe,
    title: "International Packing",
    color: "border-cyan-200",
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
    steps: [
      { label: "Use sturdy boxes for transit", desc: "International shipments face longer transit and more handling. Use double-wall corrugated boxes minimum." },
      { label: "Include commercial invoice", desc: "Attach commercial invoice (3 copies) in a clear pouch on the outside. Include HS codes, value, country of origin." },
      { label: "Customs documentation", desc: "Include CN22 (under $300) or CN23 (over $300) customs declaration. Declare accurate value — undervaluing can lead to seizure." },
      { label: "Consider dimensional weight", desc: "International carriers charge by dimensional weight (L×W×H/5000). Compact packing saves significant cost on air freight." },
    ],
    tips: ["Check import restrictions for your destination country before shipping", "Some countries prohibit certain packaging materials (e.g., straw, untreated wood)", "Use 'International' tape or green/blue tape to differentiate international packages"],
  },
];

export default function VendorPackagingGuidePage() {
  const [expanded, setExpanded] = useState<string>(sections[0].key);
  const [showAllTips, setShowAllTips] = useState(false);

  const toggleSection = (key: string) => {
    setExpanded(expanded === key ? "" : key);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <VendorShell title="Packaging Guide" subtitle="Step-by-step packaging best practices for FBM vendors">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center">
            <Package size={28} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 mb-1">FBM Packaging Best Practices</h2>
            <p className="text-sm text-gray-500 max-w-2xl">
              Proper packaging reduces damage, lowers return rates, and improves customer satisfaction.
              Follow these illustrated guides for every shipment type.
            </p>
          </div>
          <Button onClick={handleDownloadPDF} variant="outline" className="shrink-0">
            <Download size={14} className="mr-1" /> Download PDF Guide
          </Button>
        </div>
        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[
            { icon: Package, label: "Right Box Selection", desc: "Box strength, sizing & condition" },
            { icon: Shield, label: "Protective Materials", desc: "Bubble wrap, foam & fillers" },
            { icon: Printer, label: "Sealing Method", desc: "H-tape & reinforcement" },
            { icon: Tag, label: "Label Placement", desc: "Position, orientation & backup" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/70 rounded-lg p-2.5">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <s.icon size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-900">{s.label}</p>
                <p className="text-[9px] text-gray-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isOpen = expanded === section.key;

          return (
            <div key={section.key} className={`bg-white rounded-xl border ${isOpen ? `${section.color} shadow-sm` : "border-gray-200"} overflow-hidden transition-all`}>
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${section.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon size={18} className={section.iconColor} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900 text-sm">{section.title}</h3>
                    <p className="text-xs text-gray-400">{section.steps.length} steps</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                  {/* Steps */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {section.steps.map((step, i) => (
                      <div key={i} className={`${section.bgColor} rounded-lg p-3`}>
                        <div className="flex items-start gap-2">
                          <span className={`w-5 h-5 rounded-full ${section.bgColor} flex items-center justify-center shrink-0 mt-0.5`}>
                            <span className={`text-[10px] font-bold ${section.iconColor}`}>{i + 1}</span>
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-gray-900 mb-0.5">{step.label}</p>
                            <p className="text-[11px] text-gray-500">{step.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tips */}
                  <div className="bg-white border border-dashed border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Lightbulb size={12} className="text-amber-500" />
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pro Tips</span>
                    </div>
                    <ul className="space-y-1">
                      {(showAllTips ? section.tips : section.tips.slice(0, 2)).map((tip, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                          <CheckCircle2 size={10} className="text-green-500 mt-0.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                    {section.tips.length > 2 && (
                      <button
                        onClick={() => setShowAllTips(!showAllTips)}
                        className="text-[10px] text-purple-600 hover:text-purple-800 font-medium mt-1"
                      >
                        {showAllTips ? "Show less" : `+${section.tips.length - 2} more tips`}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-5 mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-600" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Followed all the steps?</p>
            <p className="text-xs text-gray-400">Proper packaging = fewer returns, happier customers, lower costs.</p>
          </div>
        </div>
        <Button onClick={handleDownloadPDF} variant="outline" size="sm">
          <Download size={14} className="mr-1" /> Download Complete Guide
        </Button>
      </div>
    </VendorShell>
  );
}

function Lightbulb(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5C7.7 12.8 8 13.5 8 14" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}
