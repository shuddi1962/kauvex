"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Globe, ChevronDown, HelpCircle, MapPin } from "lucide-react";
import { useStorefront } from "@/lib/storefront-context";

const flags: Record<string, string> = { US: "🇺🇸", GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", NG: "🇳🇬", DE: "🇩🇪", FR: "🇫🇷", JP: "🇯🇵", CN: "🇨🇳", BR: "🇧🇷", ZA: "🇿🇦", GH: "🇬🇭", KE: "🇰🇪", IT: "🇮🇹", ES: "🇪🇸" };

const languages = ["English", "French", "Spanish", "Arabic", "Portuguese"];

export default function TopBar() {
  const { storefront, storefronts, setStorefront } = useStorefront();
  const [sfOpen, setSfOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const sfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sfRef.current && !sfRef.current.contains(e.target as Node)) setSfOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSwitch = (sf: typeof storefront) => {
    setStorefront(sf);
    setSfOpen(false);
  };

  return (
    <div className="bg-[#0A1628] text-white/70 text-[11px] h-[34px] hidden lg:flex items-center">
      <div className="w-full max-w-[1440px] mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2" ref={sfRef}>
          <MapPin size={10} className="text-[#FF6B00]" />
          <span>Ship to </span>
          <button onClick={() => setSfOpen(!sfOpen)} className="flex items-center gap-1 hover:text-white transition-colors font-medium">
            <span className="text-sm">{flags[storefront.countryCode] || "🌐"}</span>
            <span className="text-white">{storefront.name}</span>
            <ChevronDown size={10} />
          </button>
          {sfOpen && (
            <div className="absolute left-4 top-full mt-1 bg-white rounded-lg shadow-strong border border-border py-1 z-50 min-w-[180px]">
              {storefronts.map(sf => (
                <button key={sf.id} onClick={() => handleSwitch(sf)}
                  className={`flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs hover:bg-orange-50 transition-colors ${sf.id === storefront.id ? "text-[#FF6B00] font-bold" : "text-text-2"}`}>
                  <span>{flags[sf.countryCode] || "🌐"}</span>
                  <span>{sf.name}</span>
                  <span className="ml-auto text-[9px] text-text-4">{sf.currencyCode} {sf.currencySymbol}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link href="/vendor/register" className="hover:text-white transition-colors">Sell on KAUVEX</Link>
          <span className="text-white/20">|</span>
          <Link href="/help" className="hover:text-white transition-colors flex items-center gap-1">
            <HelpCircle size={10} /> Help
          </Link>
          <span className="text-white/20">|</span>
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 hover:text-white transition-colors">
              <Globe size={10} /> {language} <ChevronDown size={10} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-strong border border-border py-1 z-50 min-w-[120px]">
                {languages.map(l => (
                  <button key={l} onClick={() => { setLanguage(l); setLangOpen(false); }}
                    className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-orange-50 transition-colors ${l === language ? "text-[#FF6B00] font-bold" : "text-text-2"}`}>
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
