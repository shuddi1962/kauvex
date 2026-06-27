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
  api: "/api",
};

const PROTECTED_SUBDOMAINS = ["admin", "seller", "partners", "logistics", "warehouse", "supplier"];

// Kauvex country TLDs
const KAUVEX_TLDS = [
  "kauvex.com", "kauvex.co.uk", "kauvex.ca", "kauvex.com.au",
  "kauvex.ng", "kauvex.in", "kauvex.ae", "kauvex.de", "kauvex.fr",
  "kauvex.com.gh", "kauvex.co.ke", "kauvex.co.za", "kauvex.sa",
  "kauvex.com.br", "kauvex.jp",
];

const COUNTRY_TLD_MAP: Record<string, { currency: string; country: string; language: string }> = {
  "kauvex.com": { currency: "USD", country: "US", language: "en" },
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

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  const host = hostname.replace(":3000", "").replace(":3001", "");

  // ─── STEP 1: IDENTIFY DOMAIN TYPE ───
  const isKauvexCountryDomain = KAUVEX_TLDS.includes(host);
  const isKauvexSubdomain = host.endsWith(`.${ROOT_DOMAIN}`) && !isKauvexCountryDomain;
  const subdomain = isKauvexSubdomain ? host.replace(`.${ROOT_DOMAIN}`, "") : null;
  const isRootDomain = host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`;
  const isCustomDomain = !isKauvexCountryDomain && !isKauvexSubdomain && !isRootDomain && !host.includes("localhost");

  // ─── STEP 2: HANDLE KAUVEX COUNTRY DOMAINS ───
  // kauvex.co.uk, kauvex.ca, kauvex.ng, etc.
  if (isKauvexCountryDomain) {
    const countryConfig = COUNTRY_TLD_MAP[host];
    if (countryConfig) {
      const response = NextResponse.next();
      response.headers.set("x-storefront-id", host);
      response.headers.set("x-storefront-currency", countryConfig.currency);
      response.headers.set("x-storefront-country", countryConfig.country);
      response.headers.set("x-storefront-language", countryConfig.language);
      response.headers.set("x-storefront-type", "country_domain");
      return response;
    }
    return NextResponse.next();
  }

  // ─── STEP 3: HANDLE ROOT DOMAIN + PATH STOREFRONTS ───
  // kauvex.com or kauvex.com/ng
  if (isRootDomain) {
    const pathParts = url.pathname.split("/");
    const potentialStorefront = pathParts[1];

    // Known country path prefixes
    const countryPaths: Record<string, { currency: string; country: string }> = {
      ng: { currency: "NGN", country: "NG" },
      uk: { currency: "GBP", country: "UK" },
      ca: { currency: "CAD", country: "CA" },
      au: { currency: "AUD", country: "AU" },
      us: { currency: "USD", country: "US" },
      in: { currency: "INR", country: "IN" },
      ae: { currency: "AED", country: "AE" },
      de: { currency: "EUR", country: "DE" },
      gh: { currency: "GHS", country: "GH" },
      ke: { currency: "KES", country: "KE" },
      za: { currency: "ZAR", country: "ZA" },
      sa: { currency: "SAR", country: "SA" },
      br: { currency: "BRL", country: "BR" },
      jp: { currency: "JPY", country: "JP" },
      fr: { currency: "EUR", country: "FR" },
    };

    if (potentialStorefront && countryPaths[potentialStorefront]) {
      const cp = countryPaths[potentialStorefront];
      const response = NextResponse.next();
      response.headers.set("x-storefront-id", potentialStorefront);
      response.headers.set("x-storefront-currency", cp.currency);
      response.headers.set("x-storefront-country", cp.country);
      response.headers.set("x-storefront-language", "en");
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

  // ─── STEP 4: HANDLE CORE SUBDOMAINS ───
  if (subdomain && SUBDOMAIN_ROUTES[subdomain]) {
    if (PROTECTED_SUBDOMAINS.includes(subdomain)) {
      const token = request.cookies.get("sb-access-token")?.value;
      if (!token) {
        const loginUrl = new URL(`/login?redirect=${url.pathname}`, `https://${subdomain}.${ROOT_DOMAIN}`);
        return NextResponse.redirect(loginUrl);
      }
    }

    url.pathname = `${SUBDOMAIN_ROUTES[subdomain]}${url.pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("x-subdomain", subdomain);
    return response;
  }

  // ─── STEP 5: HANDLE VENDOR SUBDOMAINS ───
  if (subdomain && !SUBDOMAIN_ROUTES[subdomain]) {
    url.pathname = `/(stores)/${subdomain}${url.pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("x-vendor-slug", subdomain);
    response.headers.set("x-store-type", "subdomain");
    return response;
  }

  // ─── STEP 6: HANDLE CUSTOM VENDOR DOMAINS ───
  if (isCustomDomain) {
    url.pathname = `/(stores)/${host}${url.pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("x-store-type", "custom_domain");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
