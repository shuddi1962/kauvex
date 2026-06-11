import { NextRequest, NextResponse } from "next/server";
import {
  resolveStorefront,
  detectCountry,
  StorefrontConfig,
} from "@/lib/storefront-resolver";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function GET(request: NextRequest) {
  try {
    const db = createAdminClient();
    const { data } = await db
      .from("storefronts")
      .select("*")
      .eq("status", "active")
      .order("is_default", { ascending: false });

    const storefronts: StorefrontConfig[] = (data || []).map(mapRow);

    const resolved = await resolveStorefront(request, storefronts);
    const country = detectCountry(request);

    const res = NextResponse.json({
      ...resolved,
      serverResolvedCountry: country,
      resolvedAt: new Date().toISOString(),
    });

    res.headers.set("x-storefront-id", resolved.id);
    res.headers.set("x-storefront-currency", resolved.currencyCode);
    res.headers.set("x-storefront-language", resolved.languageCode);
    res.headers.set("x-storefront-country", country);

    return res;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to resolve storefront" },
      { status: 500 }
    );
  }
}
