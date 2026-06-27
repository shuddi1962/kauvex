import { NextRequest, NextResponse } from "next/server";
import { removeVendorDomain } from "@/lib/domains/remove-domain";

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get("vendor_id") || "";
  const domain = searchParams.get("domain") || "";
  if (!vendorId || !domain) return NextResponse.json({ error: "vendor_id and domain required" }, { status: 400 });
  const result = await removeVendorDomain(vendorId, domain);
  return NextResponse.json({ success: result });
}
