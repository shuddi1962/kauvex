import { createAdminClient } from "@/lib/supabase/admin";
import { addDomainToVercel } from "./provisioning";

export interface CustomDomainResult {
  success: boolean;
  domain?: string;
  status?: string;
  error?: string;
  dnsInstructions?: {
    message: string;
    records: Array<{ type: string; name: string; value: string; note: string }>;
    estimatedTime: string;
  };
}

export async function initiateCustomDomain(vendorId: string, customDomain: string): Promise<CustomDomainResult> {
  const supabase = createAdminClient();

  if (!/^[a-z0-9][a-z0-9-.]*\.[a-z]{2,}$/i.test(customDomain)) {
    return { success: false, error: "Invalid domain format" };
  }

  const { data: existing } = await supabase.from("kv_dom_domains").select("id").eq("domain", customDomain).single();
  if (existing) return { success: false, error: "Domain already registered on Kauvex" };

  const vercelResult = await addDomainToVercel(customDomain);

  await supabase.from("kv_dom_domains").insert({
    vendor_id: vendorId, domain: customDomain, domain_type: "vendor_custom", status: "awaiting_dns", ssl_status: "pending",
    dns_instructions: { cname: { name: "www", value: "cname.vercel-dns.com" }, a_record: { name: "@", value: "76.76.21.21" } },
  });

  return {
    success: true, domain: customDomain, status: "awaiting_dns",
    dnsInstructions: {
      message: "Add these DNS records to your domain registrar:",
      records: [
        { type: "CNAME", name: "www", value: "cname.vercel-dns.com", note: "For www." + customDomain },
        { type: "A", name: "@", value: "76.76.21.21", note: "For " + customDomain + " (root)" },
      ],
      estimatedTime: "10 minutes to 48 hours depending on your registrar",
    },
  };
}
