import { createAdminClient } from "@/lib/supabase/admin";
import { addDomainToVercel } from "./provisioning";

const RESERVED_SUBDOMAINS = [
  "admin", "seller", "partners", "logistics", "warehouse", "express", "supplier", "api",
  "www", "mail", "smtp", "ftp", "ssh", "dev", "staging", "test", "beta", "app", "dashboard",
  "login", "signup", "register", "auth", "help", "support", "status", "blog", "news",
  "careers", "jobs", "about", "contact", "legal", "privacy", "terms", "kauvex", "pay",
  "live", "track", "shop", "store", "market", "buy", "ng", "uk", "ae", "ca", "au", "us",
  "in", "gh", "ke", "za", "de", "fr",
];

export interface ProvisionResult {
  success: boolean;
  domain?: string;
  status?: string;
  message?: string;
  error?: string;
}

export async function checkSubdomainAvailability(subdomain: string): Promise<{ available: boolean; reason: string; suggestions: string[] }> {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kauvex.com";
  const fullDomain = `${subdomain}.${rootDomain}`;

  if (!/^[a-z0-9-]{3,50}$/.test(subdomain)) {
    return { available: false, reason: "invalid", suggestions: [] };
  }
  if (RESERVED_SUBDOMAINS.includes(subdomain)) {
    return { available: false, reason: "reserved", suggestions: [`${subdomain}store`, `${subdomain}shop`, `${subdomain}official`] };
  }
  const supabase = createAdminClient();
  const { data } = await supabase.from("kv_dom_domains").select("id").eq("domain", fullDomain).single();
  if (data) {
    const suggestions = [`${subdomain}2`, `${subdomain}ng`, `${subdomain}official`, `${subdomain}store`].filter((s) => !RESERVED_SUBDOMAINS.includes(s));
    return { available: false, reason: "taken", suggestions };
  }
  return { available: true, reason: "available", suggestions: [] };
}

export async function provisionVendorSubdomain(vendorId: string, subdomain: string): Promise<ProvisionResult> {
  const supabase = createAdminClient();
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kauvex.com";
  const fullDomain = `${subdomain}.${rootDomain}`;

  const check = await checkSubdomainAvailability(subdomain);
  if (!check.available) return { success: false, error: `Subdomain ${check.reason}: ${subdomain}` };

  const { data: domainRecord, error: insertErr } = await supabase
    .from("kv_dom_domains")
    .insert({ vendor_id: vendorId, domain: fullDomain, subdomain, domain_type: "vendor_subdomain", status: "provisioning", ssl_status: "pending" })
    .select()
    .single();
  if (insertErr || !domainRecord) return { success: false, error: insertErr?.message || "Failed to create domain record" };

  const vercelResult = await addDomainToVercel(fullDomain);
  if (!vercelResult.success) {
    await supabase.from("kv_dom_domains").update({ status: "error", error_message: vercelResult.error }).eq("id", domainRecord.id);
    return { success: false, error: vercelResult.error };
  }

  await supabase.from("kv_dom_domains").update({ vercel_domain_id: vercelResult.domain, provisioned_at: new Date().toISOString() }).eq("id", domainRecord.id);

  return { success: true, domain: fullDomain, status: "provisioning", message: "Domain provisioning started. SSL certificate will be ready in 5-15 minutes." };
}
