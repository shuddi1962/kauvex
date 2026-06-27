import { createAdminClient } from "@/lib/supabase/admin";
import { addDomainToVercel } from "./provisioning";

export async function provisionWhitelabelDomain(clientId: string, domain: string) {
  const supabase = createAdminClient();
  const results = await Promise.all([
    addDomainToVercel(domain),
    addDomainToVercel(`www.${domain}`),
    addDomainToVercel(`admin.${domain}`),
    addDomainToVercel(`seller.${domain}`),
  ]);
  const success = results.some((r) => r.success);
  if (success) {
    await supabase.from("kv_whitelabel_clients").update({ domain, domainStatus: "provisioning" }).eq("id", clientId);
  }
  return { success, domain, domainsProvisioned: [domain, `www.${domain}`, `admin.${domain}`, `seller.${domain}`] };
}
