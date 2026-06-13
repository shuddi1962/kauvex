"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface LocalizationConfig {
  storefrontId: string;
  storefrontSlug: string;
  storefrontName: string;
  currencyCode: string;
  currencySymbol: string;
  languageCode: string;
  countryCode: string;
  taxRate: number;
  taxLabel: string;
  taxInclusive: boolean;
  paymentMethods: string[];
  shippingMethods: string[];
  deliveryEstimate: string;
}

const COUNTRY_CONFIG: Record<string, Partial<LocalizationConfig>> = {
  NG: {
    currencyCode: "NGN",
    currencySymbol: "₦",
    languageCode: "en",
    countryCode: "NG",
    taxRate: 7.5,
    taxLabel: "VAT",
    taxInclusive: false,
    paymentMethods: ["paystack", "bank_transfer", "cod"],
    shippingMethods: ["standard", "express"],
    deliveryEstimate: "3-7 business days",
  },
  GB: {
    currencyCode: "GBP",
    currencySymbol: "£",
    languageCode: "en",
    countryCode: "GB",
    taxRate: 20,
    taxLabel: "VAT",
    taxInclusive: true,
    paymentMethods: ["stripe", "paypal"],
    shippingMethods: ["standard", "express", "next_day"],
    deliveryEstimate: "1-3 business days",
  },
  CA: {
    currencyCode: "CAD",
    currencySymbol: "CA$",
    languageCode: "en",
    countryCode: "CA",
    taxRate: 13,
    taxLabel: "HST",
    taxInclusive: false,
    paymentMethods: ["stripe", "paypal"],
    shippingMethods: ["standard", "express"],
    deliveryEstimate: "2-5 business days",
  },
  AU: {
    currencyCode: "AUD",
    currencySymbol: "A$",
    languageCode: "en",
    countryCode: "AU",
    taxRate: 10,
    taxLabel: "GST",
    taxInclusive: true,
    paymentMethods: ["stripe", "paypal"],
    shippingMethods: ["standard", "express"],
    deliveryEstimate: "3-7 business days",
  },
  IN: {
    currencyCode: "INR",
    currencySymbol: "₹",
    languageCode: "en",
    countryCode: "IN",
    taxRate: 18,
    taxLabel: "GST",
    taxInclusive: true,
    paymentMethods: ["razorpay", "cod"],
    shippingMethods: ["standard"],
    deliveryEstimate: "3-7 business days",
  },
  AE: {
    currencyCode: "AED",
    currencySymbol: "د.إ",
    languageCode: "en",
    countryCode: "AE",
    taxRate: 5,
    taxLabel: "VAT",
    taxInclusive: true,
    paymentMethods: ["stripe", "tabby"],
    shippingMethods: ["standard", "express"],
    deliveryEstimate: "1-3 business days",
  },
};

const COUNTRY_STOREFRONT: Record<string, string> = {
  NG: "ng",
  GB: "uk",
  CA: "ca",
  AU: "au",
  IN: "in",
  AE: "ae",
};

export async function getLocalizationForCountry(
  countryCode: string,
  storefronts?: { slug: string; id: string; name: string }[]
): Promise<LocalizationConfig> {
  const config = COUNTRY_CONFIG[countryCode] || COUNTRY_CONFIG["GB"];

  let storefrontSlug = COUNTRY_STOREFRONT[countryCode] || "global";
  let storefrontId = "";
  let storefrontName = "Global";

  if (storefronts && storefronts.length > 0) {
    const match = storefronts.find((s) => s.slug === storefrontSlug);
    if (match) {
      storefrontId = match.id;
      storefrontName = match.name;
    } else {
      const def = storefronts.find((s) => s.slug === "global");
      if (def) {
        storefrontId = def.id;
        storefrontName = def.name;
      }
    }
  }

  return {
    storefrontId,
    storefrontSlug,
    storefrontName,
    currencyCode: config.currencyCode || "USD",
    currencySymbol: config.currencySymbol || "$",
    languageCode: config.languageCode || "en",
    countryCode: config.countryCode || countryCode,
    taxRate: config.taxRate || 0,
    taxLabel: config.taxLabel || "Tax",
    taxInclusive: config.taxInclusive || false,
    paymentMethods: config.paymentMethods || ["stripe"],
    shippingMethods: config.shippingMethods || ["standard"],
    deliveryEstimate: config.deliveryEstimate || "3-7 business days",
  };
}

export async function detectAndLocalize(request?: Request): Promise<LocalizationConfig> {
  let countryCode = "GB";

  if (request) {
    const cfCountry = request.headers.get("cf-ipcountry");
    if (cfCountry && COUNTRY_CONFIG[cfCountry]) {
      countryCode = cfCountry;
    }
  } else {
    try {
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      if (data.country_code && COUNTRY_CONFIG[data.country_code]) {
        countryCode = data.country_code;
      }
    } catch {
      // fallback to default
    }
  }

  let storefronts: { slug: string; id: string; name: string }[] = [];
  try {
    const db = createAdminClient();
    const { data } = await db.from("storefronts").select("id, slug, name").eq("status", "active");
    if (data) storefronts = data;
  } catch {
    // fallback
  }

  return getLocalizationForCountry(countryCode, storefronts);
}

export function formatPrice(amount: number, currencyCode: string): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    NGN: "₦",
    GBP: "£",
    CAD: "CA$",
    AUD: "A$",
    EUR: "€",
    INR: "₹",
    AED: "د.إ",
    JPY: "¥",
    CNY: "¥",
  };
  return symbols[currencyCode] || currencyCode;
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];
  if (!fromRate || !toRate) return amount;
  const baseAmount = amount / fromRate;
  return Math.round(baseAmount * toRate * 100) / 100;
}
