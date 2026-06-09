"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, ChevronDown, HelpCircle } from "lucide-react";

const languages = ["English", "French", "Spanish", "Arabic", "Portuguese"];

export default function TopBar() {
  const [langOpen, setLangOpen] = useState(false);
  const [language, setLanguage] = useState("English");

  return (
    <div className="bg-[#0A1628] text-white/70 text-[11px] h-[34px] hidden lg:flex items-center">
      <div className="w-full max-w-[1440px] mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🇬🇧</span>
          <span>Ship to <span className="text-white font-medium">United Kingdom</span></span>
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
