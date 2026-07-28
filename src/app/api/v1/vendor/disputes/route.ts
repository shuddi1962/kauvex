import { NextRequest, NextResponse } from "next/server";
import { getVendorDisputes, getDisputeStats } from "@/lib/vendor/disputes";

export async function GET(req: NextRequest) {
  try {
    const vendorId = req.headers.get("x-vendor-id") || "demo-vendor";
    const { searchParams } = new URL(req.url);

    if (searchParams.get("stats") === "true") {
      const stats = await getDisputeStats(vendorId);
      return NextResponse.json(stats);
    }

    const disputes = await getVendorDisputes(vendorId);
    return NextResponse.json({ disputes });
  } catch {
    return NextResponse.json({ error: "Failed to fetch disputes" }, { status: 500 });
  }
}