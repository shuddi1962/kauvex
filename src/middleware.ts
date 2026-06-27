import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kauvex.com";

const SUBDOMAIN_ROUTES: Record<string, string> = {
  admin: "/admin",
  seller: "/vendor",
  partners: "/partners",
  logistics: "/logistics",
  warehouse: "/warehouse",
  express: "/express",
  supplier: "/supplier",
};

// Kauvex country TLDs (reserved — not live until domains are purchased)
const KAUVEX_COUNTRY_TLDS = [
  "kauvex.co.uk", "kauvex.ca", "kauvex.com.au",
  "kauvex.ng", "kauvex.in", "kauvex.ae", "kauvex.de", "kauvex.fr",
  "kauvex.com.gh", "kauvex.co.ke", "kauvex.co.za", "kauvex.sa",
  "kauvex.com.br", "kauvex.jp",
];

const COUNTRY_TLD_CONFIG: Record<string, { currency: string; country: string; language: string }> = {
  "kauvex.co.uk": { currency: "GBP", country: "UK", language: "en" },
  "kauvex.ca": { currency: "CAD", country: "CA", language: "en" },
  "kauvex.com.au": { currency: "AUD", country: "AU", language: "en" },
  "kauvex.ng": { currency: "NGN", country: "NG", language: "en" },
  "kauvex.in": { currency: "INR", country: "IN", language: "en" },
  "kauvex.ae": { currency: "AED", country: "AE", language: "en" },
  "kauvex.de": { currency: "EUR", country: "DE", language: "de" },
  "kauvex.fr": { currency: "EUR", country: "FR", language: "fr" },
  "kauvex.com.gh": { currency: "GHS", country: "GH", language: "en" },
  "kauvex.co.ke": { currency: "KES", country: "KE", language: "en" },
  "kauvex.co.za": { currency: "ZAR", country: "ZA", language: "en" },
  "kauvex.sa": { currency: "SAR", country: "SA", language: "ar" },
  "kauvex.com.br": { currency: "BRL", country: "BR", language: "pt" },
  "kauvex.jp": { currency: "JPY", country: "JP", language: "ja" },
};

const COUNTRY_PATHS: Record<string, { currency: string; country: string; language: string }> = {
  ng: { currency: "NGN", country: "NG", language: "en" },
  uk: { currency: "GBP", country: "UK", language: "en" },
  ca: { currency: "CAD", country: "CA", language: "en" },
  au: { currency: "AUD", country: "AU", language: "en" },
  in: { currency: "INR", country: "IN", language: "en" },
  ae: { currency: "AED", country: "AE", language: "en" },
  de: { currency: "EUR", country: "DE", language: "de" },
  gh: { currency: "GHS", country: "GH", language: "en" },
  ke: { currency: "KES", country: "KE", language: "en" },
  za: { currency: "ZAR", country: "ZA", language: "en" },
  sa: { currency: "SAR", country: "SA", language: "ar" },
  br: { currency: "BRL", country: "BR", language: "pt" },
  jp: { currency: "JPY", country: "JP", language: "ja" },
  fr: { currency: "EUR", country: "FR", language: "fr" },
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  const host = hostname.replace(":3000", "").replace(":3001", "").replace(":8080", "");

  const pathname = url.pathname;

  // Skip: static files, Next.js internals, API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ─── IDENTIFY HOSTNAME ───
  const isKauvexRoot = host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`;
  const isKauvexCountryTLD = KAUVEX_COUNTRY_TLDS.includes(host);
  const isKauvexSubdomain = host.endsWith(`.${ROOT_DOMAIN}`) && !isKauvexRoot && !isKauvexCountryTLD;
  const subdomain = isKauvexSubdomain ? host.split(".")[0] : null;

  // ─── COUNTRY TLDs (kauvex.co.uk, kauvex.ng, etc.) ───
  if (isKauvexCountryTLD) {
    const config = COUNTRY_TLD_CONFIG[host];
    if (config) {
      const response = NextResponse.next();
      response.headers.set("x-storefront-id", host);
      response.headers.set("x-storefront-currency", config.currency);
      response.headers.set("x-storefront-country", config.country);
      response.headers.set("x-storefront-language", config.language);
      response.headers.set("x-storefront-type", "country_domain");
      return response;
    }
    return NextResponse.next();
  }

  // ─── CORE SUBDOMAINS (admin.kauvex.com → /admin, seller.kauvex.com → /vendor, etc.) ───
  if (isKauvexSubdomain && subdomain && SUBDOMAIN_ROUTES[subdomain]) {
    url.pathname = `${SUBDOMAIN_ROUTES[subdomain]}${url.pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("x-subdomain", subdomain);
    return response;
  }

  // ─── VENDOR SUBDOMAINS (shopname.kauvex.com) ───
  // Only if (stores) route group exists
  if (isKauvexSubdomain && subdomain && !SUBDOMAIN_ROUTES[subdomain]) {
    const storesDir = url.pathname.startsWith("/(stores)") ? "" : `/(stores)/${subdomain}`;
    url.pathname = `${storesDir}${url.pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("x-vendor-slug", subdomain);
    response.headers.set("x-store-type", "subdomain");
    return response;
  }

  // ─── ROOT DOMAIN with country path (kauvex.com/ng, kauvex.com/uk, etc.) ───
  if (isKauvexRoot) {
    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0];

    if (firstSegment && COUNTRY_PATHS[firstSegment]) {
      const cp = COUNTRY_PATHS[firstSegment];
      const response = NextResponse.next();
      response.headers.set("x-storefront-id", firstSegment);
      response.headers.set("x-storefront-currency", cp.currency);
      response.headers.set("x-storefront-country", cp.country);
      response.headers.set("x-storefront-language", cp.language);
      response.headers.set("x-storefront-type", "path");
      return response;
    }

    // Default global storefront
    const response = NextResponse.next();
    response.headers.set("x-storefront-id", "global");
    response.headers.set("x-storefront-currency", "USD");
    response.headers.set("x-storefront-country", "US");
    return response;
  }

  // ─── FALLBACK: everything else passes through ───
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
