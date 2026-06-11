import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  resolveStorefront,
  detectCountry,
  isPathBasedStorefront,
  stripPathPrefix,
  type StorefrontConfig,
} from "@/lib/storefront-resolver";
import { createAdminClient } from "@/lib/supabase/admin";

async function loadStorefronts(): Promise<StorefrontConfig[]> {
  try {
    const db = createAdminClient();
    const { data } = await db
      .from("storefronts")
      .select("*")
      .eq("status", "active")
      .order("is_default", { ascending: false });
    return (data || []).map((row: any) => ({
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
    }));
  } catch {
    return [];
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  const storefronts = await loadStorefronts();

  const pathSlug = isPathBasedStorefront(pathname);
  let resolved: StorefrontConfig;

  if (pathSlug) {
    const pathMatch = storefronts.find((s) => s.slug === pathSlug);
    if (pathMatch) {
      resolved = pathMatch;
    } else {
      const { getStorefrontBySlug } = await import("@/lib/storefront-resolver");
      resolved = getStorefrontBySlug(pathSlug, storefronts) || storefronts.find((s) => s.isDefault) || (await resolveStorefront(request, storefronts));
    }
  } else {
    resolved = await resolveStorefront(request, storefronts);
  }

  const country = detectCountry(request);

  let response = NextResponse.next({ request });

  if (pathSlug) {
    const newPathname = stripPathPrefix(pathname, pathSlug);
    if (newPathname !== pathname) {
      response = NextResponse.rewrite(new URL(newPathname, request.url));
    }
  }

  response.headers.set("x-storefront-id", resolved.id);
  response.headers.set("x-storefront-currency", resolved.currencyCode);
  response.headers.set("x-storefront-language", resolved.languageCode);
  response.headers.set("x-storefront-country", country);

  const cookieValue = JSON.stringify({
    id: resolved.id,
    slug: resolved.slug,
    currency: resolved.currencyCode,
    language: resolved.languageCode,
    country,
  });
  const existingCookie = request.cookies.get("kauvex-storefront")?.value;
  if (!existingCookie || existingCookie !== cookieValue) {
    response.cookies.set("kauvex-storefront", cookieValue, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const supabaseResponse = await updateSession(request);

  supabaseResponse.headers.forEach((value, key) => {
    response.headers.set(key, value);
  });
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value);
  });

  const isAdminLoginRoute = pathname.startsWith("/admin/login");
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLoginRoute;
  const isVendorLoginRoute = pathname.startsWith("/vendor/login");
  const isVendorRoute = pathname.startsWith("/vendor") && !isVendorLoginRoute;

  if (isAdminRoute || isVendorRoute) {
    const { createServerClient } = await import("@supabase/ssr");
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || !["super-admin", "admin", "finance-admin", "support-admin"].includes(profile.role)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    if (isVendorRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || (profile.role !== "vendor" && profile.role !== "admin")) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
