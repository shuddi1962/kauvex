import { createAdminClient } from "@/lib/supabase/admin";
import { addDomainToVercel, removeDomainFromVercel } from "./provisioning";

export interface CountryDomain {
  countryCode: string;
  domain: string;
  currency: string;
  language: string;
  status: "active" | "provisioning" | "error" | "removed";
}

// All Kauvex country domains — the single source of truth
export const KAUVEX_COUNTRY_DOMAINS: Omit<CountryDomain, "status">[] = [
  { countryCode: "US", domain: "kauvex.com", currency: "USD", language: "en" },
  { countryCode: "UK", domain: "kauvex.co.uk", currency: "GBP", language: "en" },
  { countryCode: "CA", domain: "kauvex.ca", currency: "CAD", language: "en" },
  { countryCode: "AU", domain: "kauvex.com.au", currency: "AUD", language: "en" },
  { countryCode: "NG", domain: "kauvex.ng", currency: "NGN", language: "en" },
  { countryCode: "IN", domain: "kauvex.in", currency: "INR", language: "en" },
  { countryCode: "AE", domain: "kauvex.ae", currency: "AED", language: "en" },
  { countryCode: "DE", domain: "kauvex.de", currency: "EUR", language: "de" },
  { countryCode: "FR", domain: "kauvex.fr", currency: "EUR", language: "fr" },
  { countryCode: "GH", domain: "kauvex.com.gh", currency: "GHS", language: "en" },
  { countryCode: "KE", domain: "kauvex.co.ke", currency: "KES", language: "en" },
  { countryCode: "ZA", domain: "kauvex.co.za", currency: "ZAR", language: "en" },
  { countryCode: "SA", domain: "kauvex.sa", currency: "SAR", language: "ar" },
  { countryCode: "BR", domain: "kauvex.com.br", currency: "BRL", language: "pt" },
  { countryCode: "JP", domain: "kauvex.jp", currency: "JPY", language: "ja" },
];

export async function getCountryDomain(domain: string): Promise<CountryDomain | null> {
  const config = KAUVEX_COUNTRY_DOMAINS.find((d) => d.domain === domain);
  if (!config) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("kv_dom_domains")
    .select("status, ssl_status")
    .eq("domain", domain)
    .eq("domain_type", "kauvex_country")
    .single();

  return {
    ...config,
    status: (data?.status as CountryDomain["status"]) || "active",
  };
}

export async function provisionCountryDomains(): Promise<{ provisioned: number; errors: string[] }> {
  const supabase = createAdminClient();
  let provisioned = 0;
  const errors: string[] = [];

  for (const country of KAUVEX_COUNTRY_DOMAINS) {
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from("kv_dom_domains")
        .select("id, status")
        .eq("domain", country.domain)
        .single();

      if (existing && existing.status === "active") continue;

      // Add to Vercel
      const result = await addDomainToVercel(country.domain);
      if (!result.success) {
        errors.push(`${country.domain}: ${result.error}`);
        continue;
      }

      // Upsert domain record
      await supabase.from("kv_dom_domains").upsert(
        {
          domain: country.domain,
          domain_type: "kauvex_country",
          status: "provisioning",
          ssl_status: "pending",
          vercel_domain_id: result.domain,
          provisioned_at: new Date().toISOString(),
        },
        { onConflict: "domain" }
      );

      provisioned++;
    } catch (err) {
      errors.push(`${country.domain}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return { provisioned, errors };
}

export async function removeCountryDomain(countryCode: string): Promise<boolean> {
  const supabase = createAdminClient();
  const config = KAUVEX_COUNTRY_DOMAINS.find((d) => d.countryCode === countryCode);
  if (!config) return false;

  await removeDomainFromVercel(config.domain);
  await supabase
    .from("kv_dom_domains")
    .update({ status: "removed", removed_at: new Date().toISOString() })
    .eq("domain", config.domain);
  return true;
}

export function isKauvexCountryDomain(hostname: string): boolean {
  return KAUVEX_COUNTRY_DOMAINS.some((d) => d.domain === hostname);
}
