import { NextRequest } from "next/server";

export interface StorefrontConfig {
  id: string;
  name: string;
  slug: string;
  domainType: "subdomain" | "custom_domain";
  activeDomain: string;
  currencyCode: string;
  currencySymbol: string;
  languageCode: string;
  countryCode: string;
  taxRate: number;
  taxLabel: string;
  taxInclusive: boolean;
  isDefault: boolean;
  metaTitle: string;
  metaDescription: string;
}

const DEFAULT_STOREFRONT: StorefrontConfig = {
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

const PATH_STOREFRONTS: Record<string, Partial<StorefrontConfig>> = {
  uk: {
    slug: "uk",
    currencyCode: "GBP",
    currencySymbol: "£",
    languageCode: "en",
    countryCode: "GB",
    taxRate: 20,
    taxLabel: "VAT",
    taxInclusive: true,
    name: "KAUVEX UK",
  },
  ng: {
    slug: "ng",
    currencyCode: "NGN",
    currencySymbol: "₦",
    languageCode: "en",
    countryCode: "NG",
    taxRate: 7.5,
    taxLabel: "VAT",
    taxInclusive: true,
    name: "KAUVEX Nigeria",
  },
  ca: {
    slug: "ca",
    currencyCode: "CAD",
    currencySymbol: "CA$",
    languageCode: "en",
    countryCode: "CA",
    taxRate: 13,
    taxLabel: "HST",
    taxInclusive: false,
    name: "KAUVEX Canada",
  },
  au: {
    slug: "au",
    currencyCode: "AUD",
    currencySymbol: "A$",
    languageCode: "en",
    countryCode: "AU",
    taxRate: 10,
    taxLabel: "GST",
    taxInclusive: true,
    name: "KAUVEX Australia",
  },
  de: {
    slug: "de",
    currencyCode: "EUR",
    currencySymbol: "€",
    languageCode: "de",
    countryCode: "DE",
    taxRate: 19,
    taxLabel: "MwSt",
    taxInclusive: true,
    name: "KAUVEX Germany",
  },
  fr: {
    slug: "fr",
    currencyCode: "EUR",
    currencySymbol: "€",
    languageCode: "fr",
    countryCode: "FR",
    taxRate: 20,
    taxLabel: "TVA",
    taxInclusive: true,
    name: "KAUVEX France",
  },
};

function getHost(request: NextRequest): string {
  return request.headers.get("host")?.replace(/^www\./, "").toLowerCase() || "";
}

function getPathname(request: NextRequest): string {
  return new URL(request.url).pathname;
}

export function detectCountry(request: NextRequest): string {
  const cf = request.headers.get("cf-ipcountry");
  if (cf && cf.length === 2) return cf.toUpperCase();

  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const ip = xff.split(",")[0].trim();
    if (ip && ip !== "::1" && ip !== "127.0.0.1") {
      return "US";
    }
  }

  return "US";
}

export async function resolveStorefrontFromDb(
  slug: string
): Promise<StorefrontConfig | null> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const db = createAdminClient();
    const { data } = await db
      .from("storefronts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .single();
    if (data) return mapRow(data);
  } catch {}
  return null;
}

export async function resolveStorefront(
  request: NextRequest,
  storefronts?: StorefrontConfig[]
): Promise<StorefrontConfig> {
  const host = getHost(request);
  const pathname = getPathname(request);

  const customDomainMatch = storefronts?.find(
    (s) => s.activeDomain === host || s.activeDomain === `www.${host}`
  );
  if (customDomainMatch) return customDomainMatch;

  if (host.endsWith(".kauvex.com")) {
    const subdomain = host.split(".")[0];
    const matched = storefronts?.find((s) => s.slug === subdomain);
    if (matched) return matched;
    const fallback = PATH_STOREFRONTS[subdomain];
    if (fallback) return buildPathConfig(subdomain, fallback);
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    const first = segments[0].toLowerCase();
    if (PATH_STOREFRONTS[first]) {
      return buildPathConfig(first, PATH_STOREFRONTS[first]);
    }
    if (storefronts) {
      const pathMatch = storefronts.find((s) => s.slug === first);
      if (pathMatch) return pathMatch;
    }
    const dbMatch = await resolveStorefrontFromDb(first);
    if (dbMatch) return dbMatch;
  }

  const dbDefault = storefronts?.find((s) => s.isDefault);
  if (dbDefault) return dbDefault;

  return DEFAULT_STOREFRONT;
}

export function getStorefrontBySlug(
  slug: string,
  storefronts?: StorefrontConfig[]
): StorefrontConfig | null {
  if (PATH_STOREFRONTS[slug]) {
    return buildPathConfig(slug, PATH_STOREFRONTS[slug]);
  }
  return storefronts?.find((s) => s.slug === slug) || null;
}

export function stripPathPrefix(pathname: string, slug: string): string {
  const prefix = `/${slug}`;
  if (pathname === prefix || pathname.startsWith(prefix + "/")) {
    return pathname.slice(prefix.length) || "/";
  }
  return pathname;
}

export function isPathBasedStorefront(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && PATH_STOREFRONTS[segments[0].toLowerCase()]) {
    return segments[0].toLowerCase();
  }
  return null;
}

function mapRow(row: any): StorefrontConfig {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    domainType: row.domain_type,
    activeDomain: row.active_domain,
    currencyCode: row.currency_code,
    currencySymbol: row.currency_symbol,
    languageCode: row.language_code,
    countryCode: row.country_code || "",
    taxRate: Number(row.tax_rate) || 0,
    taxLabel: row.tax_label || "VAT",
    taxInclusive: row.tax_inclusive || false,
    isDefault: row.is_default || false,
    metaTitle: row.meta_title || "",
    metaDescription: row.meta_description || "",
  };
}

function buildPathConfig(
  slug: string,
  overrides: Partial<StorefrontConfig>
): StorefrontConfig {
  return {
    ...DEFAULT_STOREFRONT,
    ...overrides,
    id: `path-${slug}`,
    slug,
    domainType: "subdomain" as const,
    activeDomain: `${slug}.kauvex.com`,
    isDefault: false,
  };
}
