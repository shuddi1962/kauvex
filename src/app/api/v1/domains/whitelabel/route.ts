import { NextRequest, NextResponse } from "next/server";
import { provisionWhitelabelDomain } from "@/lib/domains/whitelabel-domain";

export async function POST(request: NextRequest) {
  try {
    const { clientId, domain } = await request.json();
    if (!clientId || !domain) return NextResponse.json({ error: "clientId and domain required" }, { status: 400 });
    const result = await provisionWhitelabelDomain(clientId, domain);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
