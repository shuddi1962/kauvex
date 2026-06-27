"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { insforge } from "@/lib/insforge";
import { useCurrencyStore } from "@/store/currency-store";

export interface Storefront {
  id: string;
  name: string;
  slug: string;
  domainType?: "subdomain" | "custom_domain";
  activeDomain?: string;
  currencyCode: string;
  currencySymbol: string;
  languageCode: string;
  countryCode: string;
  taxRate: number;
  taxLabel?: string;
  taxInclusive?: boolean;
  isDefault: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

const defaultStorefront: Storefront = {
  id: "default",
  name: "Global",
  slug: "global",
  domainType: "subdomain",
  activeDomain: "kauvex.com",
  currencyCode: "USD",
  currencySymbol: "$",
  languageCode: "en",
  countryCode: "US",
  taxRate: 0,
  taxLabel: "VAT",
  taxInclusive: false,
  isDefault: true,
  metaTitle: "KAUVEX — Everything. Everywhere. Delivered.",
  metaDescription: "Shop millions of products from verified sellers worldwide.",
};

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1, GBP: 0.79, CAD: 1.36, AUD: 1.52, NGN: 1540, EUR: 0.92, JPY: 149, CNY: 7.24,
};

function detectStorefrontByHost(storefronts: Storefront[]): Storefront | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname.replace(/^www\./, "");
  for (const sf of storefronts) {
    if (sf.activeDomain && host === sf.activeDomain.replace(/^www\./, "")) return sf;
  }
  if (host.endsWith(".kauvex.com")) {
    const slug = host.split(".")[0];
    const found = storefronts.find(s => s.slug === slug);
    if (found) return found;
  }
  return null;
}

const StorefrontContext = createContext<{
  storefront: Storefront;
  storefronts: Storefront[];
  setStorefront: (storefront: Storefront) => void;
  getStorefrontByDomain: (domain: string) => Storefront | undefined;
  exchangeRate: number;
  loading: boolean;
}>({
  storefront: defaultStorefront,
  storefronts: [],
  setStorefront: () => {},
  getStorefrontByDomain: () => undefined,
  exchangeRate: 1,
  loading: true,
});

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [storefront, setStorefrontState] = useState<Storefront>(defaultStorefront);
  const [storefronts, setStorefronts] = useState<Storefront[]>([]);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const setCurrency = useCurrencyStore(s => s.setCurrency);

  const applyStorefront = useCallback((sf: Storefront) => {
    setStorefrontState(sf);
    localStorage.setItem("kauvex-storefront", JSON.stringify({ id: sf.id }));
    const rate = EXCHANGE_RATES[sf.currencyCode] || 1;
    setExchangeRate(rate);
    setCurrency(sf.currencyCode);
  }, [setCurrency]);

  const setStorefront = useCallback((sf: Storefront) => {
    applyStorefront(sf);
  }, [applyStorefront]);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await insforge.database
          .from("storefronts")
          .select("*")
          .order("is_default", { ascending: false });
        let list: Storefront[] = [];
        if (!error && data && data.length > 0) {
          list = data.map((s: any) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            domainType: s.domain_type,
            activeDomain: s.active_domain,
            currencyCode: s.currency_code,
            currencySymbol: s.currency_symbol,
            languageCode: s.language_code,
            countryCode: s.country_code || "",
            taxRate: s.tax_rate,
            taxLabel: s.tax_label || "VAT",
            taxInclusive: s.tax_inclusive || false,
            isDefault: s.is_default || false,
            metaTitle: s.meta_title,
            metaDescription: s.meta_description,
          }));
        }
        setStorefronts(list);
        if (list.length > 0) {
          try {
            const stored = localStorage.getItem("kauvex-storefront");
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                const match = list.find(s => s.id === parsed.id);
                if (match) { applyStorefront(match); setLoading(false); return; }
              } catch {}
            }
            const byHost = detectStorefrontByHost(list);
            if (byHost) { applyStorefront(byHost); setLoading(false); return; }
            const def = list.find(s => s.isDefault) || list[0];
            applyStorefront(def);
          } catch {}
        }
        setLoading(false);
      } catch {
        setLoading(false);
      }
    })();
  }, [applyStorefront]);

  const getStorefrontByDomain = (domain: string): Storefront | undefined => {
    return storefronts.find(s => s.activeDomain === domain);
  };

  return (
    <StorefrontContext.Provider value={{ storefront, storefronts, setStorefront, getStorefrontByDomain, exchangeRate, loading }}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const ctx = useContext(StorefrontContext);
  if (!ctx) throw new Error("useStorefront must be used within StorefrontProvider");
  return ctx;
}
