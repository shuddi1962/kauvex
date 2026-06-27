import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface ClickRecord {
  id: string;
  ip_address: string;
  partner_id: string;
  created_at: string;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: clicks, error: fetchError } = await supabase
      .from("kv_aff_clicks")
      .select("id, ip_address, partner_id, created_at")
      .gte("created_at", since);

    if (fetchError) {
      if (fetchError.message?.includes("does not exist")) {
        return NextResponse.json({ count: 0, message: "Table not found — demo response" });
      }
      throw fetchError;
    }

    if (!clicks || clicks.length === 0) {
      return NextResponse.json({ count: 0, message: "No clicks in last 24 hours" });
    }

    const ipMap = new Map<string, ClickRecord[]>();
    for (const click of clicks) {
      if (!click.ip_address) continue;
      const existing = ipMap.get(click.ip_address) || [];
      existing.push(click);
      ipMap.set(click.ip_address, existing);
    }

    const suspiciousFlags: Array<{
      partner_id: string;
      ip_address: string;
      flag_type: string;
      details: string;
    }> = [];

    for (const [ip, ipClicks] of ipMap) {
      if (ipClicks.length > 50) {
        suspiciousFlags.push({
          partner_id: ipClicks[0].partner_id,
          ip_address: ip,
          flag_type: "rapid_clicks",
          details: `${ipClicks.length} clicks from same IP in 24h (threshold: 50)`,
        });
      }

      const partnerGroups = new Map<string, ClickRecord[]>();
      for (const click of ipClicks) {
        const existing = partnerGroups.get(click.partner_id) || [];
        existing.push(click);
        partnerGroups.set(click.partner_id, existing);
      }

      for (const [partnerId, partnerClicks] of partnerGroups) {
        if (partnerClicks.length >= 10 && ipClicks.length > 5) {
          const alreadyFlagged = suspiciousFlags.some(
            (f) => f.partner_id === partnerId && f.flag_type === "same_ip_multiple_clicks"
          );
          if (!alreadyFlagged) {
            suspiciousFlags.push({
              partner_id: partnerId,
              ip_address: ip,
              flag_type: "same_ip_multiple_clicks",
              details: `${partnerClicks.length} clicks from partner ${partnerId} via IP ${ip}`,
            });
          }
        }
      }

      const vpnPatterns = ["tor", "vpn", "proxy"];
      if (ipClicks.length >= 3) {
        const sampleUserAgent = ipClicks[0].id;
        const isSuspiciousIp = ip.startsWith("10.") || ip.startsWith("192.168.") || ip === "127.0.0.1";
        if (isSuspiciousIp) {
          suspiciousFlags.push({
            partner_id: ipClicks[0].partner_id,
            ip_address: ip,
            flag_type: "vpn_proxy_pattern",
            details: `Suspicious IP pattern detected: ${ip} with ${ipClicks.length} clicks`,
          });
        }
      }
    }

    let flagsCreated = 0;

    for (const flag of suspiciousFlags) {
      const { error: insertError } = await supabase
        .from("kv_aff_fraud_flags")
        .insert({
          partner_id: flag.partner_id,
          ip_address: flag.ip_address,
          flag_type: flag.flag_type,
          details: flag.details,
          status: "pending",
          created_at: new Date().toISOString(),
        });

      if (!insertError) {
        flagsCreated++;
      }
    }

    return NextResponse.json({
      count: flagsCreated,
      message: `Created ${flagsCreated} fraud flags from ${clicks.length} clicks scanned`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
