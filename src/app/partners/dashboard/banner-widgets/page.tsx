"use client";

import { useState } from "react";
import {
  PanelTop, Copy, Check, Code2, Palette, LayoutGrid,
  Monitor, Smartphone, Image, ShoppingBag, Star,
} from "lucide-react";

const bannerTemplates = [
  {
    id: "horizontal",
    name: "Horizontal Banner",
    dimensions: "728 × 90",
    icon: Monitor,
    aspectRatio: "aspect-[728/90]",
  },
  {
    id: "rectangle",
    name: "Rectangle Medium",
    dimensions: "300 × 250",
    icon: PanelTop,
    aspectRatio: "aspect-[300/250]",
  },
  {
    id: "skyscraper",
    name: "Skyscraper",
    dimensions: "160 × 600",
    icon: Smartphone,
    aspectRatio: "aspect-[160/600]",
  },
];

const widgetTemplates = [
  {
    id: "carousel",
    name: "Product Carousel",
    description: "Horizontal scrolling product cards with images, prices, and ratings",
    icon: Image,
  },
  {
    id: "bestsellers",
    name: "Best Sellers",
    description: "Top-rated products grid with sales badges and quick-add buttons",
    icon: Star,
  },
  {
    id: "categories",
    name: "Category Grid",
    description: "Visual category navigation tiles with product counts",
    icon: LayoutGrid,
  },
];

function generateEmbedCode(type: string, color: string) {
  if (["horizontal", "rectangle", "skyscraper"].includes(type)) {
    return `<!-- Kauvex Affiliate Banner: ${type} -->
<a href="https://kauvex.com/?ref=KAV-A3F8D2" target="_blank" rel="noopener">
  <img
    src="https://kauvex.com/banners/${type}.png"
    alt="Shop on Kauvex"
    style="border:none;max-width:100%"
  />
</a>
<!-- Accent: ${color} -->`;
  }
  return `<!-- Kauvex Affiliate Widget: ${type} -->
<div data-kauvex-widget="${type}"
     data-ref="KAV-A3F8D2"
     data-accent="${color}"
     data-theme="light"
     style="max-width:100%;min-height:200px">
  <!-- Widget will render dynamically -->
</div>
<script src="https://kauvex.com/widgets/loader.js" async></script>`;
}

export default function BannerWidgetsPage() {
  const [accentColors, setAccentColors] = useState<Record<string, string>>({
    horizontal: "#FF6B00",
    rectangle: "#FF6B00",
    skyscraper: "#FF6B00",
    carousel: "#FF6B00",
    bestsellers: "#FF6B00",
    categories: "#FF6B00",
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCode, setShowCode] = useState<string | null>(null);

  const updateColor = (id: string, color: string) => {
    setAccentColors((prev) => ({ ...prev, [id]: color }));
  };

  const copyCode = (id: string) => {
    const code = generateEmbedCode(id, accentColors[id] || "#FF6B00");
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showEmbedCode = (id: string) => {
    setShowCode(id);
  };

  const activeCode = showCode ? generateEmbedCode(showCode, accentColors[showCode] || "#FF6B00") : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-[#0A1628]">Banner & Widget Creator</h1>
        <p className="text-xs text-gray-500">Generate branded banners and embeddable widgets for your content</p>
      </div>

      {/* Banner Templates */}
      <div>
        <h2 className="font-bold text-sm text-[#0A1628] mb-3 flex items-center gap-2">
          <PanelTop size={14} className="text-[#FF6B00]" /> Banner Templates
        </h2>
        <div className="grid lg:grid-cols-3 gap-4">
          {bannerTemplates.map((banner) => {
            const Icon = banner.icon;
            const color = accentColors[banner.id];
            return (
              <div key={banner.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-gray-500" />
                      <span className="font-bold text-xs text-[#0A1628]">{banner.name}</span>
                    </div>
                    <span className="text-[9px] text-gray-400 font-mono">{banner.dimensions}</span>
                  </div>

                  {/* Banner Preview */}
                  <div className={`${banner.aspectRatio} w-full rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center relative`}
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-[8px] font-bold uppercase tracking-widest" style={{ color }}>
                          Kauvex
                        </div>
                        <div className="text-[6px] text-gray-400 mt-0.5">Everything. Everywhere. Delivered.</div>
                        <div className="mt-1 inline-flex items-center gap-1 h-4 px-2 rounded-sm text-white text-[6px] font-bold"
                          style={{ backgroundColor: color }}>
                          Shop Now
                        </div>
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full opacity-30" style={{ backgroundColor: color }} />
                    <div className="absolute bottom-1 right-1 w-2 h-2 rounded-sm opacity-20" style={{ backgroundColor: color }} />
                  </div>
                </div>

                {/* Controls */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Palette size={11} className="text-gray-400" />
                    <label className="text-[10px] text-gray-500">Accent Color</label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(banner.id, e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border border-gray-200"
                    />
                    <span className="text-[9px] font-mono text-gray-400">{color}</span>
                  </div>
                  <button
                    onClick={() => showEmbedCode(banner.id)}
                    className="w-full h-8 flex items-center justify-center gap-1.5 rounded-lg border border-[#FF6B00] text-[#FF6B00] font-bold text-[10px] hover:bg-[#FF6B00]/5 transition-colors"
                  >
                    <Code2 size={11} /> Get Code
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Widget Section */}
      <div>
        <h2 className="font-bold text-sm text-[#0A1628] mb-3 flex items-center gap-2">
          <LayoutGrid size={14} className="text-[#FF6B00]" /> Embeddable Widgets
        </h2>
        <div className="grid lg:grid-cols-3 gap-4">
          {widgetTemplates.map((widget) => {
            const Icon = widget.icon;
            const color = accentColors[widget.id];
            return (
              <div key={widget.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} className="text-gray-500" />
                    <span className="font-bold text-xs text-[#0A1628]">{widget.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-3">{widget.description}</p>

                  {/* Widget Preview */}
                  <div className="h-24 rounded-lg border border-gray-200 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: `${color}08` }}
                  >
                    {/* Mock product cards */}
                    <div className="flex items-center gap-2 px-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-14 h-16 rounded-md bg-white border border-gray-100 flex flex-col items-center justify-center p-1">
                          <div className="w-8 h-8 rounded bg-gray-100 mb-1 flex items-center justify-center">
                            <ShoppingBag size={10} className="text-gray-300" />
                          </div>
                          <div className="w-10 h-1.5 rounded-full bg-gray-100" />
                          <div className="w-7 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: color }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Palette size={11} className="text-gray-400" />
                    <label className="text-[10px] text-gray-500">Accent Color</label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(widget.id, e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border border-gray-200"
                    />
                    <span className="text-[9px] font-mono text-gray-400">{color}</span>
                  </div>
                  <button
                    onClick={() => copyCode(widget.id)}
                    className={`w-full h-8 flex items-center justify-center gap-1.5 rounded-lg font-bold text-[10px] transition-colors ${
                      copiedId === widget.id
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90"
                    }`}
                  >
                    {copiedId === widget.id ? (
                      <><Check size={11} /> Copied!</>
                    ) : (
                      <><Copy size={11} /> Copy Embed Code</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code Modal */}
      {showCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCode(null)}>
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-sm text-[#0A1628] flex items-center gap-2">
                <Code2 size={14} className="text-[#FF6B00]" /> Embed Code
              </h3>
              <button onClick={() => setShowCode(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            <div className="p-4">
              <pre className="bg-[#0A1628] text-green-400 text-[10px] p-3 rounded-lg overflow-x-auto max-h-60 font-mono leading-relaxed">{activeCode}</pre>
              <button
                onClick={() => copyCode(showCode)}
                className={`w-full mt-3 h-9 flex items-center justify-center gap-1.5 rounded-lg font-bold text-[10px] transition-colors ${
                  copiedId === showCode
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90"
                }`}
              >
                {copiedId === showCode ? (
                  <><Check size={12} /> Copied to Clipboard</>
                ) : (
                  <><Copy size={12} /> Copy to Clipboard</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
