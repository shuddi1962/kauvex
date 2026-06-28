import { NextRequest, NextResponse } from "next/server";
import {
  assignVirtualAddress,
  getVirtualAddresses,
  getVirtualAddressStats,
  VIRTUAL_ADDRESS_HUBS,
} from "@/lib/logistics/virtual-address";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");

    if (action === "stats" && userId) {
      const stats = await getVirtualAddressStats(userId);
      return NextResponse.json({ stats });
    }

    if (action === "hubs") {
      return NextResponse.json({ hubs: VIRTUAL_ADDRESS_HUBS });
    }

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const addresses = await getVirtualAddresses(userId);
    return NextResponse.json({ addresses, total: addresses.length });
  } catch (error) {
    console.error("[Virtual Addresses GET]", error);
    return NextResponse.json({ error: "Failed to fetch virtual addresses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, countryCode } = body;

    if (!userId || !countryCode) {
      return NextResponse.json({ error: "userId and countryCode are required" }, { status: 400 });
    }

    if (!VIRTUAL_ADDRESS_HUBS[countryCode]) {
      return NextResponse.json({
        error: `No hub available in ${countryCode}. Available: ${Object.keys(VIRTUAL_ADDRESS_HUBS).join(", ")}`,
      }, { status: 400 });
    }

    const address = await assignVirtualAddress(userId, countryCode);
    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    console.error("[Virtual Addresses POST]", error);
    return NextResponse.json({ error: "Failed to assign virtual address" }, { status: 500 });
  }
}
