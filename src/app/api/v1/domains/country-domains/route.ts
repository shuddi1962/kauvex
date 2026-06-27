import { NextResponse } from "next/server";
import { KAUVEX_COUNTRY_DOMAINS, provisionCountryDomains } from "@/lib/domains/country-domains";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  const { data: dbDomains } = await supabase.from("kv_dom_domains").select("domain, status, ssl_status, activated_at").eq("domain_type", "kauvex_country");
  const dbMap = new Map((dbDomains || []).map((d: Record<string, unknown>) => [d.domain as string, d]));
  const domains = KAUVEX_COUNTRY_DOMAINS.map((c) => {
    const db = dbMap.get(c.domain) as Record<string, unknown> | undefined;
    return { ...c, status: (db?.status as string) || "not_provisioned", sslStatus: (db?.ssl_status as string) || "pending", activatedAt: db?.activated_at || null };
  });
  return NextResponse.json({ domains });
}

export async function POST() {
  const result = await provisionCountryDomains();
  return NextResponse.json(result);
}
