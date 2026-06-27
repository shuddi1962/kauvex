import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDomainStatus } from "@/lib/domains/provisioning";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: pendingDomains } = await supabase
    .from("kv_dom_domains")
    .select("*")
    .in("status", ["provisioning", "awaiting_dns"]);

  let activated = 0;
  let errors = 0;

  for (const record of pendingDomains || []) {
    const status = await getDomainStatus(record.domain as string);

    if (status.sslStatus === "issued" && status.verified) {
      await supabase
        .from("kv_dom_domains")
        .update({ status: "active", ssl_status: "issued", activated_at: new Date().toISOString() })
        .eq("id", record.id);
      activated++;
    } else if (status.sslStatus === "error" || status.error) {
      await supabase
        .from("kv_dom_domains")
        .update({ status: "error", ssl_status: "error", error_message: status.error })
        .eq("id", record.id);
      errors++;
    }
  }

  return NextResponse.json({ checked: pendingDomains?.length || 0, activated, errors, timestamp: new Date().toISOString() });
}
