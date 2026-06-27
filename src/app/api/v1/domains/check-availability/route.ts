import { NextRequest, NextResponse } from "next/server";
import { checkSubdomainAvailability } from "@/lib/domains/vendor-subdomain";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get("subdomain") || "";
  if (!subdomain || subdomain.length < 3) {
    return NextResponse.json({ available: false, reason: "too_short", suggestions: [] });
  }
  const result = await checkSubdomainAvailability(subdomain.toLowerCase().trim());
  return NextResponse.json(result);
}
