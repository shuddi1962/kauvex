"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

const STOREFRONT_COOKIE_KEY = "kauvex-storefront";

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

const seedStorefronts: Storefront[] = [
  defaultStorefront,
  {
    id: "uk", name: "United Kingdom", slug: "uk",
    domainType: "subdomain", activeDomain: "uk.kauvex.com",
    currencyCode: "GBP", currencySymbol: "£", languageCode: "en",
    countryCode: "GB", taxRate: 20, taxLabel: "VAT", taxInclusive: true,
    isDefault: false, metaTitle: "KAUVEX UK"
  },
  {
    id: "ca", name: "Canada", slug: "ca",
    domainType: "subdomain", activeDomain: "ca.kauvex.com",
    currencyCode: "CAD", currencySymbol: "CA$", languageCode: "en",
    countryCode: "CA", taxRate: 13, taxLabel: "HST", taxInclusive: false,
    isDefault: false, metaTitle: "KAUVEX Canada"
  },
  {
    id: "au", name: "Australia", slug: "au",
    domainType: "subdomain", activeDomain: "au.kauvex.com",
    currencyCode: "AUD", currencySymbol: "A$", languageCode: "en",
    countryCode: "AU", taxRate: 10, taxLabel: "GST", taxInclusive: true,
    isDefault: false, metaTitle: "KAUVEX Australia"
  },
  {
    id: "ng", name: "Nigeria", slug: "ng",
    domainType: "subdomain", activeDomain: "ng.kauvex.com",
    currencyCode: "NGN", currencySymbol: "₦", languageCode: "en",
    countryCode: "NG", taxRate: 7.5, taxLabel: "VAT", taxInclusive: true,
    isDefault: false, metaTitle: "KAUVEX Nigeria"
  },
  {
    id: "de", name: "Deutschland", slug: "de",
    domainType: "subdomain", activeDomain: "de.kauvex.com",
    currencyCode: "EUR", currencySymbol: "€", languageCode: "de",
    countryCode: "DE", taxRate: 19, taxLabel: "MwSt", taxInclusive: true,
    isDefault: false, metaTitle: "KAUVEX Deutschland"
  },
];

const StorefrontContext = createContext<{
  storefront: Storefront;
  storefronts: Storefront[];
  setStorefront: (storefront: Storefront) => void;
  getStorefrontByDomain: (domain: string) => Storefront | undefined;
  exchangeRate: number;
}>({
  storefront: defaultStorefront,
  storefronts: seedStorefronts,
  setStorefront: () => {},
  getStorefrontByDomain: () => undefined,
  exchangeRate: 1,
});

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [storefront, setStorefrontState] = useState<Storefront>(defaultStorefront);
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    const stored = localStorage.getItem(STOREFRONT_COOKIE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const found = seedStorefronts.find(s => s.id === parsed.id);
        if (found) setStorefrontState(found);
      } catch {}
    }
  }, []);

  const setStorefront = (sf: Storefront) => {
    setStorefrontState(sf);
    localStorage.setItem(STOREFRONT_COOKIE_KEY, JSON.stringify({ id: sf.id }));
    const rates: Record<string, number> = { USD: 1, GBP: 0.79, CAD: 1.36, AUD: 1.52, NGN: 1540, EUR: 0.92 };
    setExchangeRate(rates[sf.currencyCode] || 1);
  };

  const getStorefrontByDomain = (domain: string): Storefront | undefined => {
    return seedStorefronts.find(s => s.activeDomain === domain);
  };

  return (
    <StorefrontContext.Provider value={{ storefront, storefronts: seedStorefronts, setStorefront, getStorefrontByDomain, exchangeRate }}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const ctx = useContext(StorefrontContext);
  if (!ctx) throw new Error("useStorefront must be used within StorefrontProvider");
  return ctx;
}
