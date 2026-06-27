import { NextRequest, NextResponse } from "next/server";
import { provisionVendorSubdomain } from "@/lib/domains/vendor-subdomain";
import { initiateCustomDomain } from "@/lib/domains/vendor-custom-domain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, domain, type } = body;
    if (!vendorId || !domain) {
      return NextResponse.json({ error: "vendorId and domain required" }, { status: 400 });
    }
    if (type === "custom") {
      const result = await initiateCustomDomain(vendorId, domain);
      return NextResponse.json(result);
    }
    const result = await provisionVendorSubdomain(vendorId, domain);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Provisioning failed" }, { status: 500 });
  }
}
