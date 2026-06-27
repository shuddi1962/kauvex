import { createAdminClient } from "@/lib/supabase/admin";
import { removeDomainFromVercel } from "./provisioning";

export async function removeVendorDomain(vendorId: string, domain: string): Promise<boolean> {
  const supabase = createAdminClient();
  await removeDomainFromVercel(domain);
  await supabase.from("kv_dom_domains").update({ status: "removed", removed_at: new Date().toISOString() }).eq("domain", domain).eq("vendor_id", vendorId);
  return true;
}
