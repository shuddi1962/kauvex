"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutTemplate,
  Palette,
  FileText,
  Menu,
  Globe,
  Lock,
  Sparkles,
  Image,
  Type,
  Eye,
  Save,
  ChevronRight,
  Plus,
  GripVertical,
  X,
  Building2,
  PaintBucket,
  Monitor,
  Smartphone,
  Tablet,
  Cpu,
  Code,
  ToggleLeft,
} from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";

type PlanTier = "free" | "premium" | "enterprise";

const VENDOR_PLAN: PlanTier = "free";

const PLAN_FEATURES: Record<PlanTier, string[]> = {
  free: ["logo", "banner", "description", "featured_products"],
  premium: ["logo", "banner", "description", "featured_products", "drag_drop", "homepage_layout", "color_customizer", "font_selector", "navigation_editor", "hero_banner_cta"],
  enterprise: ["logo", "banner", "description", "featured_products", "drag_drop", "homepage_layout", "color_customizer", "font_selector", "navigation_editor", "hero_banner_cta", "custom_domain", "custom_css", "custom_scripts", "white_label"],
};

function hasFeature(plan: PlanTier, feature: string): boolean {
  return PLAN_FEATURES[plan].includes(feature);
}

const TABS = [
  { id: "layout", label: "Layout", icon: LayoutTemplate },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "content", label: "Content", icon: FileText },
  { id: "navigation", label: "Navigation", icon: Menu },
  { id: "domain", label: "Custom Domain", icon: Globe },
];

const SECTIONS = [
  { id: "hero", label: "Hero Banner", icon: Image },
  { id: "featured", label: "Featured Products", icon: Sparkles },
  { id: "categories", label: "Category Grid", icon: LayoutTemplate },
  { id: "about", label: "About Section", icon: FileText },
  { id: "reviews", label: "Reviews Carousel", icon: Eye },
  { id: "newsletter", label: "Newsletter Signup", icon: Type },
];

const SHOP_LAYOUTS = [
  { id: "grid", label: "Grid", icon: LayoutTemplate, desc: "Clean grid layout with equal cards" },
  { id: "masonry", label: "Masonry", icon: LayoutTemplate, desc: "Pinterest-style staggered grid" },
  { id: "list", label: "List", icon: Menu, desc: "Detailed list with descriptions" },
  { id: "single", label: "Single Hero", icon: Eye, desc: "One hero product with grid below" },
];

const FONTS = [
  { value: "inter", label: "Inter", class: "font-sans" },
  { value: "geist", label: "Geist", class: "font-sans" },
  { value: "playfair", label: "Playfair Display", class: "font-serif" },
  { value: "syne", label: "Syne", class: "font-syne" },
  { value: "mono", label: "JetBrains Mono", class: "font-mono" },
];

const COLOR_PRESETS = [
  { name: "Ocean", primary: "#0A1628", accent: "#FF6B00", bg: "#FFFFFF" },
  { name: "Forest", primary: "#1A3A2A", accent: "#4CAF50", bg: "#F5F7F0" },
  { name: "Sunset", primary: "#2D1B4E", accent: "#FF6B35", bg: "#FFF8F0" },
  { name: "Midnight", primary: "#0F0F1A", accent: "#7C3AED", bg: "#F8F7FF" },
  { name: "Minimal", primary: "#1A1A1A", accent: "#3B82F6", bg: "#FFFFFF" },
];

const NAV_ITEMS_PRESET = [
  { label: "Home", href: "/", enabled: true },
  { label: "Shop", href: "/shop", enabled: true },
  { label: "About", href: "/about", enabled: true },
  { label: "Contact", href: "/contact", enabled: false },
];

export default function StoreBuilderPage() {
  const [activeTab, setActiveTab] = useState("layout");
  const [plan] = useState<PlanTier>(VENDOR_PLAN);
  const [activeSections, setActiveSections] = useState(["hero", "featured", "about"]);
  const [selectedLayout, setSelectedLayout] = useState("grid");
  const [selectedFont, setSelectedFont] = useState("inter");
  const [selectedColors, setSelectedColors] = useState(COLOR_PRESETS[0]);
  const [navItems, setNavItems] = useState(NAV_ITEMS_PRESET);
  const [customDomain, setCustomDomain] = useState("");
  const [customCss, setCustomCss] = useState("");
  const [customScripts, setCustomScripts] = useState("");
  const [whiteLabel, setWhiteLabel] = useState(false);
  const [previewMode, setPreviewMode] = useState("desktop");
  const [showLockedModal, setShowLockedModal] = useState<string | null>(null);

  const isLocked = (feature: string) => {
    const locked = !hasFeature(plan, feature);
    return locked;
  };

  const handleUpgradeClick = (feature: string) => {
    setShowLockedModal(feature);
  };

  const LockedOverlay = (_props: { feature: string }) => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center z-10">
      <Lock size={24} className="text-gray-300 mb-2" />
      <p className="text-xs font-semibold text-gray-400 mb-2">Premium Feature</p>
      <Link
        href="/vendor/subscription"
        className="text-[10px] bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Upgrade Plan
      </Link>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <LayoutTemplate size={16} className="text-purple-600" /> Shop Page Layout
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SHOP_LAYOUTS.map((layout) => {
            const Icon = layout.icon;
            return (
              <button
                key={layout.id}
                onClick={() => setSelectedLayout(layout.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedLayout === layout.id
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <Icon size={20} className={selectedLayout === layout.id ? "text-purple-600 mb-2" : "text-gray-400 mb-2"} />
                <p className="font-semibold text-xs">{layout.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{layout.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 relative">
        {isLocked("drag_drop") && <LockedOverlay feature="drag_drop" />}
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <GripVertical size={16} className="text-purple-600" /> Section Builder
          {!isLocked("drag_drop") && (
            <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full ml-auto">Drag & Drop</span>
          )}
        </h3>
        <div className="space-y-2">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const enabled = activeSections.includes(section.id);
            return (
              <div
                key={section.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  {!isLocked("drag_drop") && <GripVertical size={14} className="text-gray-300" />}
                  <Icon size={16} className={enabled ? "text-purple-600" : "text-gray-300"} />
                  <div>
                    <p className={`text-xs font-semibold ${enabled ? "text-gray-900" : "text-gray-400"}`}>{section.label}</p>
                    <p className="text-[10px] text-gray-400">{enabled ? "Visible on storefront" : "Hidden"}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isLocked("drag_drop")) return handleUpgradeClick("drag_drop");
                    setActiveSections((prev) =>
                      enabled ? prev.filter((s) => s !== section.id) : [...prev, section.id]
                    );
                  }}
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    enabled ? "bg-purple-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                      enabled ? "left-[18px]" : "left-[2px]"
                    }`}
                  />
                </button>
    </div>
  );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 relative">
        {isLocked("homepage_layout") && <LockedOverlay feature="homepage_layout" />}
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <Building2 size={16} className="text-purple-600" /> Homepage Layout
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: "hero-first", label: "Hero First", desc: "Full-width hero on top" },
            { id: "grid-first", label: "Grid First", desc: "Products above the fold" },
            { id: "split", label: "Split", desc: "Hero + sidebar layout" },
          ].map((layout) => (
            <button
              key={layout.id}
              className="p-4 rounded-xl border border-gray-200 text-center hover:border-purple-300 transition-colors"
            >
              <div className="w-full h-16 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                <LayoutTemplate size={20} className="text-gray-400" />
              </div>
              <p className="text-xs font-semibold">{layout.label}</p>
              <p className="text-[10px] text-gray-400">{layout.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <Image size={16} className="text-purple-600" /> Branding Assets
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Shop Logo</label>
            <div className="h-28 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 transition-colors">
              <Image size={24} className="text-gray-300 mb-1" />
              <span className="text-xs text-gray-400">Upload Logo (PNG, JPG, up to 2MB)</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Shop Banner</label>
            <div className="h-28 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 transition-colors">
              <Image size={24} className="text-gray-300 mb-1" />
              <span className="text-xs text-gray-400">Upload Banner (1200x300px)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 relative">
        {isLocked("color_customizer") && <LockedOverlay feature="color_customizer" />}
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <PaintBucket size={16} className="text-purple-600" /> Color Customizer
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => !isLocked("color_customizer") && setSelectedColors(preset)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                selectedColors.name === preset.name
                  ? "border-purple-600"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex gap-1 justify-center mb-2">
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.primary }} />
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.accent }} />
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.bg }} />
              </div>
              <p className="text-[10px] font-semibold">{preset.name}</p>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Primary</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedColors.primary}
                onChange={(e) => setSelectedColors({ ...selectedColors, primary: e.target.value })}
                disabled={isLocked("color_customizer")}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-gray-400">{selectedColors.primary}</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Accent</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedColors.accent}
                onChange={(e) => setSelectedColors({ ...selectedColors, accent: e.target.value })}
                disabled={isLocked("color_customizer")}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-gray-400">{selectedColors.accent}</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedColors.bg}
                onChange={(e) => setSelectedColors({ ...selectedColors, bg: e.target.value })}
                disabled={isLocked("color_customizer")}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-gray-400">{selectedColors.bg}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 relative">
        {isLocked("font_selector") && <LockedOverlay feature="font_selector" />}
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <Type size={16} className="text-purple-600" /> Font Selector
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {FONTS.map((font) => (
            <button
              key={font.value}
              onClick={() => !isLocked("font_selector") && setSelectedFont(font.value)}
              disabled={isLocked("font_selector")}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                selectedFont === font.value
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              } ${font.class}`}
            >
              <p className="text-xs font-semibold">{font.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Aa Bb Cc</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContentTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <FileText size={16} className="text-purple-600" /> Store Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Store Description</label>
            <textarea
              placeholder="Tell customers about your store..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Featured Products</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-300 transition-colors">
              <Plus size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-xs text-gray-400">Select up to 8 products to feature</p>
            </div>
          </div>
          <div className="relative">
            {isLocked("hero_banner_cta") && <LockedOverlay feature="hero_banner_cta" />}
            <label className="text-xs text-gray-500 block mb-1">Hero Banner Content</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Headline" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg" />
              <input placeholder="Subtext" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg" />
              <input placeholder="CTA Text (e.g. Shop Now)" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg" />
              <input placeholder="CTA URL" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNavigationTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 relative">
        {isLocked("navigation_editor") && <LockedOverlay feature="navigation_editor" />}
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <Menu size={16} className="text-purple-600" /> Navigation Menu
        </h3>
        <div className="space-y-2">
          {navItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              {!isLocked("navigation_editor") && <GripVertical size={14} className="text-gray-300 cursor-move" />}
              <input
                value={item.label}
                onChange={(e) => {
                  const updated = [...navItems];
                  updated[idx] = { ...updated[idx], label: e.target.value };
                  setNavItems(updated);
                }}
                disabled={isLocked("navigation_editor")}
                className="flex-1 h-9 px-3 text-sm border border-gray-200 rounded-lg"
              />
              <input
                value={item.href}
                onChange={(e) => {
                  const updated = [...navItems];
                  updated[idx] = { ...updated[idx], href: e.target.value };
                  setNavItems(updated);
                }}
                disabled={isLocked("navigation_editor")}
                className="w-40 h-9 px-3 text-sm border border-gray-200 rounded-lg"
              />
              <button
                onClick={() => {
                  if (isLocked("navigation_editor")) return;
                  const updated = [...navItems];
                  updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
                  setNavItems(updated);
                }}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  item.enabled ? "bg-purple-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                    item.enabled ? "left-[18px]" : "left-[2px]"
                  }`}
                />
              </button>
              {!isLocked("navigation_editor") && (
                <button
                  onClick={() => setNavItems(navItems.filter((_, i) => i !== idx))}
                  className="p-1 hover:bg-red-50 rounded transition-colors"
                >
                  <X size={14} className="text-red-400" />
                </button>
              )}
            </div>
          ))}
        </div>
        {!isLocked("navigation_editor") && (
          <button
            onClick={() =>
              setNavItems([...navItems, { label: "New Link", href: "/", enabled: true }])
            }
            className="mt-3 w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:border-purple-300 hover:text-purple-600 transition-colors flex items-center justify-center gap-1"
          >
            <Plus size={14} /> Add Menu Item
          </button>
        )}
      </div>
    </div>
  );

  const renderDomainTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 relative">
        {isLocked("custom_domain") && <LockedOverlay feature="custom_domain" />}
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <Globe size={16} className="text-purple-600" /> Custom Domain
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Your Domain</label>
            <div className="flex gap-2">
              <input
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                disabled={isLocked("custom_domain")}
                placeholder="shop.yourstore.com"
                className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg"
              />
              <button
                disabled={isLocked("custom_domain")}
                className="px-4 h-10 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                Verify
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Add a CNAME record pointing to store.kauvex.com</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">DNS Configuration</p>
            <code className="text-[10px] bg-gray-800 text-green-400 px-2 py-1 rounded block">
              CNAME shop {"→"} store.kauvex.com
            </code>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 relative">
        {isLocked("custom_css") && <LockedOverlay feature="custom_css" />}
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <Code size={16} className="text-purple-600" /> Custom CSS
        </h3>
        <textarea
          value={customCss}
          onChange={(e) => setCustomCss(e.target.value)}
          disabled={isLocked("custom_css")}
          placeholder="/* Enter custom CSS */"
          rows={6}
          className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg resize-none disabled:bg-gray-50"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 relative">
        {isLocked("custom_scripts") && <LockedOverlay feature="custom_scripts" />}
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <Cpu size={16} className="text-purple-600" /> Custom Scripts
        </h3>
        <textarea
          value={customScripts}
          onChange={(e) => setCustomScripts(e.target.value)}
          disabled={isLocked("custom_scripts")}
          placeholder="&lt;script&gt; ... &lt;/script&gt;"
          rows={4}
          className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg resize-none disabled:bg-gray-50"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 relative">
        {isLocked("white_label") && <LockedOverlay feature="white_label" />}
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <ToggleLeft size={16} className="text-purple-600" /> White Label
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Remove KAUVEX Branding</p>
            <p className="text-xs text-gray-400">Hide &ldquo;Powered by KAUVEX&rdquo; from your storefront</p>
          </div>
          <button
            onClick={() => !isLocked("white_label") && setWhiteLabel(!whiteLabel)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              whiteLabel ? "bg-purple-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                whiteLabel ? "left-[22px]" : "left-[2px]"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "layout": return renderLayoutTab();
      case "appearance": return renderAppearanceTab();
      case "content": return renderContentTab();
      case "navigation": return renderNavigationTab();
      case "domain": return renderDomainTab();
      default: return null;
    }
  };

  return (
    <VendorShell title="Store Builder" subtitle="Design and customize your vendor storefront">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-0.5">
            {[
              { id: "desktop", icon: Monitor },
              { id: "tablet", icon: Tablet },
              { id: "mobile", icon: Smartphone },
            ].map((device) => {
              const Icon = device.icon;
              return (
                <button
                  key={device.id}
                  onClick={() => setPreviewMode(device.id)}
                  className={`p-1.5 rounded transition-colors ${
                    previewMode === device.id ? "bg-white shadow-sm text-purple-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              plan === "free"
                ? "bg-gray-100 text-gray-500"
                : plan === "premium"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {plan === "free" ? "Free Plan" : plan === "premium" ? "Premium Plan" : "Enterprise Plan"}
          </span>
          {plan === "free" && (
            <Link
              href="/vendor/subscription"
              className="text-[10px] text-purple-600 hover:underline flex items-center gap-0.5"
            >
              Upgrade <ChevronRight size={10} />
            </Link>
          )}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-6 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {renderTabContent()}
      </div>

      {showLockedModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowLockedModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock size={20} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-center mb-1">Premium Feature</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              This feature requires a Premium or Enterprise plan. Upgrade to unlock unlimited customization.
            </p>
            <Link
              href="/vendor/subscription"
              className="block w-full text-center py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
              onClick={() => setShowLockedModal(null)}
            >
              View Plans
            </Link>
            <button
              onClick={() => setShowLockedModal(null)}
              className="block w-full text-center py-2 text-sm text-gray-500 hover:text-gray-700 mt-1"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </VendorShell>
  );
}
