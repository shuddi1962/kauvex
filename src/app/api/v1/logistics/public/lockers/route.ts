import { NextResponse } from "next/server";
import { validateApiKey, checkScope } from "@/lib/logistics/api-auth";
import { findNearbyLockers } from "@/lib/shipping/locker-system";

export async function GET(request: Request) {
  const auth = await validateApiKey(request.headers.get("Authorization"));
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!checkScope(auth, "lockers:read") && !checkScope(auth, "*")) {
    return NextResponse.json({ error: "Insufficient permissions. Required scope: lockers:read" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const country = searchParams.get("country") || "NG";
  const sizeNeeded = searchParams.get("sizeNeeded") || undefined;

  if (!city) {
    return NextResponse.json({ error: "city query parameter is required" }, { status: 400 });
  }

  try {
    const lockers = await findNearbyLockers(city, country, sizeNeeded);
    return NextResponse.json({
      data: lockers.map((l: any) => ({
        id: l.id,
        name: l.name,
        address: l.address,
        city: l.city,
        lockerType: l.lockerType,
        is24Hours: l.is24Hours,
        hasRefrigerated: l.hasRefrigerated,
        totalCompartments: l.totalCompartments,
        availableCompartments: l.availableCompartments,
        availableSizes: l.availableSizes,
        latitude: l.latitude,
        longitude: l.longitude,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch lockers" }, { status: 500 });
  }
}
