"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

interface StorefrontOption {
  id: string;
  name: string;
  slug: string;
  currency: string;
  flag: string;
}

const FLAGS: Record<string, string> = {
  global: "🌐",
  uk: "🇬🇧",
  ng: "🇳🇬",
  ca: "🇨🇦",
  au: "🇦🇺",
  in: "🇮🇳",
  ae: "🇦🇪",
  de: "🇩🇪",
  fr: "🇫🇷",
};

export function AdminStorefrontFilter() {
  const [storefronts, setStorefronts] = useState<StorefrontOption[]>([]);
  const [selected, setSelected] = useState<StorefrontOption | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("kauvex_admin_storefront") : null;
    const defaults: StorefrontOption[] = [
      { id: "all", name: "All Storefronts", slug: "all", currency: "", flag: "🌐" },
      { id: "global", name: "Global", slug: "global", currency: "USD", flag: "🌐" },
      { id: "ng", name: "Nigeria", slug: "ng", currency: "NGN", flag: "🇳🇬" },
      { id: "uk", name: "United Kingdom", slug: "uk", currency: "GBP", flag: "🇬🇧" },
      { id: "ca", name: "Canada", slug: "ca", currency: "CAD", flag: "🇨🇦" },
      { id: "au", name: "Australia", slug: "au", currency: "AUD", flag: "🇦🇺" },
      { id: "in", name: "India", slug: "in", currency: "INR", flag: "🇮🇳" },
      { id: "ae", name: "UAE", slug: "ae", currency: "AED", flag: "🇦🇪" },
    ];
    setStorefronts(defaults);
    const initial = stored ? defaults.find(s => s.id === stored) : defaults[0];
    setSelected(initial || defaults[0]);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const select = (s: StorefrontOption) => {
    setSelected(s);
    setOpen(false);
    localStorage.setItem("kauvex_admin_storefront", s.id);
    window.dispatchEvent(new CustomEvent("storefront-filter-change", { detail: s }));
  };

  if (!selected) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-8 px-2.5 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-medium text-white/80 transition-colors whitespace-nowrap"
      >
        <span className="text-sm leading-none">{selected.flag}</span>
        <span className="hidden md:inline">{selected.name}</span>
        {selected.currency && <span className="text-[9px] text-white/40">({selected.currency})</span>}
        <ChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-border py-1.5 min-w-[180px] z-50">
          {storefronts.map(s => (
            <button
              key={s.id}
              onClick={() => select(s)}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-all ${
                selected?.id === s.id
                  ? "bg-orange-50 text-orange font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-sm leading-none">{s.flag}</span>
              <span className="flex-1 text-left">{s.name}</span>
              {s.currency && <span className="text-[9px] text-text-4">{s.currency}</span>}
              {selected?.id === s.id && <Check size={12} className="text-orange" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function VendorStorefrontFilter() {
  const [storefronts, setStorefronts] = useState<StorefrontOption[]>([]);
  const [selected, setSelected] = useState<StorefrontOption | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("kauvex_vendor_storefront") : null;
    const defaults: StorefrontOption[] = [
      { id: "all", name: "All", slug: "all", currency: "", flag: "🌐" },
      { id: "global", name: "Global", slug: "global", currency: "USD", flag: "🌐" },
      { id: "ng", name: "Nigeria", slug: "ng", currency: "NGN", flag: "🇳🇬" },
      { id: "uk", name: "UK", slug: "uk", currency: "GBP", flag: "🇬🇧" },
      { id: "ca", name: "Canada", slug: "ca", currency: "CAD", flag: "🇨🇦" },
    ];
    setStorefronts(defaults);
    const initial = stored ? defaults.find(s => s.id === stored) : defaults[0];
    setSelected(initial || defaults[0]);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const select = (s: StorefrontOption) => {
    setSelected(s);
    setOpen(false);
    localStorage.setItem("kauvex_vendor_storefront", s.id);
  };

  if (!selected) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-7 px-2 bg-white/10 hover:bg-white/15 rounded-lg text-[10px] font-medium text-white/80 transition-colors whitespace-nowrap"
      >
        <span className="text-xs leading-none">{selected.flag}</span>
        <span>{selected.name}</span>
        <ChevronDown size={8} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-border py-1.5 min-w-[150px] z-50">
          {storefronts.map(s => (
            <button
              key={s.id}
              onClick={() => select(s)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-all ${
                selected?.id === s.id
                  ? "bg-purple-50 text-purple-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-xs leading-none">{s.flag}</span>
              <span className="flex-1 text-left">{s.name}</span>
              {selected?.id === s.id && <Check size={10} className="text-purple-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
