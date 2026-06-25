"use client";

import { useState } from "react";
import {
  Store, User, Layers, Package, Palette, Eye, Copy, Check,
  Camera, Link, Globe, Image, Video, MessageCircle, ExternalLink,
  ChevronRight, Heart,
} from "lucide-react";

type Section = "profile" | "collections" | "products" | "appearance";

const collections = [
  { name: "Summer Picks", count: 12, image: "🩳" },
  { name: "Tech Faves", count: 8, image: "💻" },
  { name: "Daily Essentials", count: 15, image: "🛒" },
];

const products = [
  { name: "Wireless Headphones Pro", price: "$129.99", commission: "12%", image: "🎧" },
  { name: "Smart Watch Ultra", price: "$349.99", commission: "10%", image: "⌚" },
  { name: "Portable Speaker Boom", price: "$79.99", commission: "15%", image: "🔊" },
  { name: "Laptop Stand Elite", price: "$59.99", commission: "8%", image: "💻" },
];

const themes = [
  { name: "Ocean", primary: "#0A1628", accent: "#FF6B00", secondary: "#1a2a4a" },
  { name: "Forest", primary: "#0f2e1a", accent: "#22c55e", secondary: "#1a3d28" },
  { name: "Rose", primary: "#2a0f1a", accent: "#e11d48", secondary: "#3d1a28" },
];

export default function StorefrontPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [copied, setCopied] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [bio, setBio] = useState("Hi, I'm Alex! I share my favorite finds — from the latest tech gadgets to everyday essentials. All products here are personally tested and recommended.");
  const [socialLinks, setSocialLinks] = useState({
    instagram: "@alexj_reviews",
    twitter: "@alexj_reviews",
    youtube: "@AlexJReviews",
  });

  const copyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sectionIcons: Record<Section, typeof User> = {
    profile: User,
    collections: Layers,
    products: Package,
    appearance: Palette,
  };

  const sections: Section[] = ["profile", "collections", "products", "appearance"];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#0A1628]">My Storefront</h1>
        <p className="text-xs text-gray-500">Build and customize your influencer storefront</p>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 h-8 px-4 bg-[#FF6B00] text-white font-bold text-[10px] rounded-lg hover:bg-[#FF6B00]/90 transition-colors">
          <Eye size={12} /> View Public Storefront
        </button>
        <button
          onClick={copyLink}
          className={`flex items-center gap-1.5 h-8 px-4 rounded-lg text-[10px] font-bold transition-all ${
            copied
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Storefront Link</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-5">
        {/* Sidebar */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-3 h-fit">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Sections</p>
          <nav className="space-y-0.5">
            {sections.map((section) => {
              const Icon = sectionIcons[section];
              const labels: Record<Section, string> = {
                profile: "Profile",
                collections: "Collections",
                products: "Products",
                appearance: "Appearance",
              };
              return (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                    activeSection === section
                      ? "bg-[#FF6B00]/10 text-[#FF6B00] font-semibold"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={14} />
                  <span>{labels[section]}</span>
                  <ChevronRight size={12} className="ml-auto text-gray-300" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-5 space-y-4">
          {activeSection === "profile" && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-bold text-sm text-[#0A1628] flex items-center gap-2">
                <User size={14} className="text-[#FF6B00]" /> Profile
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#FF6B00] transition-colors">
                  <Camera size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Alex Johnson</p>
                  <p className="text-[10px] text-gray-400">Upload profile photo</p>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 block mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00] resize-none"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">
                    <Image size={10} className="inline mr-1" /> Instagram
                  </label>
                  <input
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">
                    <MessageCircle size={10} className="inline mr-1" /> Twitter/X
                  </label>
                  <input
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">
                    <Video size={10} className="inline mr-1" /> YouTube
                  </label>
                  <input
                    value={socialLinks.youtube}
                    onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                    className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">
                    <Globe size={10} className="inline mr-1" /> Website
                  </label>
                  <input
                    defaultValue="https://alexjohnson.reviews"
                    className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === "collections" && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-bold text-sm text-[#0A1628] flex items-center gap-2">
                <Layers size={14} className="text-[#FF6B00]" /> Collections
              </h3>
              <div className="space-y-3">
                {collections.map((col) => (
                  <div key={col.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-lg">
                      {col.image}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-800">{col.name}</p>
                      <p className="text-[10px] text-gray-400">{col.count} products</p>
                    </div>
                    <button className="text-[10px] text-[#FF6B00] font-semibold hover:underline">Edit</button>
                  </div>
                ))}
              </div>
              <button className="w-full h-9 rounded-lg border-2 border-dashed border-gray-300 text-xs text-gray-500 font-semibold hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors">
                + Add Collection
              </button>
            </div>
          )}

          {activeSection === "products" && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-bold text-sm text-[#0A1628] flex items-center gap-2">
                <Package size={14} className="text-[#FF6B00]" /> Products
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <div key={product.name} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                    <div className="h-24 bg-gray-200 flex items-center justify-center text-3xl">
                      {product.image}
                    </div>
                    <div className="p-2.5 space-y-1">
                      <p className="text-[11px] font-semibold text-gray-800 truncate">{product.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0A1628]">{product.price}</span>
                        <span className="text-[9px] font-semibold text-[#FF6B00] bg-[#FF6B00]/10 px-1.5 py-0.5 rounded">{product.commission}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="font-bold text-sm text-[#0A1628] flex items-center gap-2">
                <Palette size={14} className="text-[#FF6B00]" /> Appearance
              </h3>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 block mb-2">Theme Color</label>
                <div className="flex gap-3">
                  {themes.map((theme, idx) => (
                    <button
                      key={theme.name}
                      onClick={() => setSelectedTheme(idx)}
                      className={`w-20 h-14 rounded-xl border-2 transition-all ${
                        selectedTheme === idx ? "border-[#FF6B00] ring-1 ring-[#FF6B00]/30" : "border-gray-200"
                      }`}
                      style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                    >
                      <div className="w-3 h-3 rounded-full mx-auto" style={{ background: theme.accent }} />
                      <p className="text-[7px] text-white/70 text-center mt-1">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 block mb-2">Banner Image</label>
                <div className="h-28 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6B00] transition-colors">
                  <Camera size={20} className="text-gray-400 mb-1" />
                  <p className="text-[10px] text-gray-500 font-semibold">Click to upload banner</p>
                  <p className="text-[8px] text-gray-400">Recommended: 1200 x 300 px</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-4">
            <div className="bg-[#0A1628] px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store size={12} className="text-[#FF6B00]" />
                <span className="text-[10px] font-semibold text-white/80">Storefront Preview</span>
              </div>
              <ExternalLink size={10} className="text-white/40" />
            </div>
            <div className="p-3">
              <div className="h-16 bg-gradient-to-r from-[#0A1628] to-[#1a2a4a] rounded-lg flex items-center gap-3 px-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-[10px] font-bold">AJ</div>
                <div>
                  <p className="text-xs font-bold text-white">Alex&apos;s Picks</p>
                  <p className="text-[8px] text-white/50">Influencer Storefront</p>
                </div>
              </div>
              <p className="text-[9px] text-gray-500 mb-3 leading-relaxed">{bio.slice(0, 100)}...</p>
              <div className="flex gap-1 mb-3">
                <span className="text-[8px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">#Tech</span>
                <span className="text-[8px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">#Lifestyle</span>
                <span className="text-[8px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">#Gadgets</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {products.slice(0, 4).map((product) => (
                  <div key={product.name} className="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                    <div className="h-16 bg-gray-200 flex items-center justify-center text-xl">{product.image}</div>
                    <div className="p-1.5">
                      <p className="text-[9px] font-semibold text-gray-800 truncate">{product.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#0A1628]">{product.price}</span>
                        <Heart size={8} className="text-gray-300" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
