import { createAdminClient } from "@/lib/supabase/admin";

export async function getStorefrontByPath(pathPrefix: string) {
  if (!pathPrefix || pathPrefix.length > 5) return null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("storefronts").select("*").eq("pathPrefix", pathPrefix).eq("status", "active").single();
    return data;
  } catch {
    return null;
  }
}

export async function getVendorBySubdomain(subdomain: string) {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("vendors").select("id, slug, status, planType").eq("subdomain", subdomain).single();
    return data;
  } catch {
    return null;
  }
}

export async function getVendorByCustomDomain(domain: string) {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("vendors").select("id, slug, status, planType").eq("customDomain", domain).eq("domainVerified", true).single();
    return data;
  } catch {
    return null;
  }
}
