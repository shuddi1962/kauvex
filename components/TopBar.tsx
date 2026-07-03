"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, MapPin, Globe } from "lucide-react";

const flags: Record<string, string> = { US: "🇺🇸", GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", NG: "🇳🇬", DE: "🇩🇪", FR: "🇫🇷", JP: "🇯🇵", CN: "🇨🇳", BR: "🇧🇷", ZA: "🇿🇦", KE: "🇰🇪", AE: "🇦🇪", SA: "🇸🇦", IN: "🇮🇳", GH: "🇬🇭" };

const storefronts = [
  { id: "kauvex-com", name: "Kauvex Global", countryCode: "US", currencyCode: "USD", currencySymbol: "$" },
  { id: "kauvex-co-uk", name: "Kauvex UK", countryCode: "GB", currencyCode: "GBP", currencySymbol: "£" },
  { id: "kauvex-ca", name: "Kauvex Canada", countryCode: "CA", currencyCode: "CAD", currencySymbol: "C$" },
  { id: "kauvex-com-au", name: "Kauvex Australia", countryCode: "AU", currencyCode: "AUD", currencySymbol: "A$" },
  { id: "kauvex-ng", name: "Kauvex Nigeria", countryCode: "NG", currencyCode: "NGN", currencySymbol: "₦" },
  { id: "kauvex-de", name: "Kauvex Germany", countryCode: "DE", currencyCode: "EUR", currencySymbol: "€" },
];

const languages = ["English", "French", "Spanish", "Arabic", "Portuguese"];

export default function TopBar() {
  const [sfOpen, setSfOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const [activeStore, setActiveStore] = useState(storefronts[0]);
  const sfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sfRef.current && !sfRef.current.contains(e.target as Node)) setSfOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="bg-navy text-white/70 text-[11px] h-[34px] hidden lg:flex items-center">
      <div className="container-kauvex flex items-center justify-between w-full">
        <div className="flex items-center gap-2" ref={sfRef}>
          <MapPin size={10} className="text-orange" />
          <span>Ship to </span>
          <button onClick={() => setSfOpen(!sfOpen)} className="flex items-center gap-1 hover:text-white transition-colors font-medium">
            <span className="text-sm">{flags[activeStore.countryCode] || "🌐"}</span>
            <span className="text-white">{activeStore.name}</span>
            <ChevronDown size={10} />
          </button>
          {sfOpen && (
            <div className="absolute left-4 top-full mt-1 bg-white rounded-lg shadow-strong border border-border py-1 z-50 min-w-[180px]">
              {storefronts.map(sf => (
                <button key={sf.id} onClick={() => { setActiveStore(sf); setSfOpen(false); }}
                  className={`flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs hover:bg-orange-50 transition-colors ${sf.id === activeStore.id ? "text-orange font-bold" : "text-text-2"}`}>
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
                    className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-orange-50 transition-colors ${l === language ? "text-orange font-bold" : "text-text-2"}`}>
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