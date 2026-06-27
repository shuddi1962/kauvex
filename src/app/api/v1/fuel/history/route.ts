import { NextRequest, NextResponse } from "next/server";
import { getFuelPriceHistory } from "@/lib/fuel/data-service";

const demoHistory = [
  { date: "2026-01-01T00:00:00Z", price: 620, currency: "NGN" },
  { date: "2026-01-15T00:00:00Z", price: 635, currency: "NGN" },
  { date: "2026-02-01T00:00:00Z", price: 645, currency: "NGN" },
  { date: "2026-02-15T00:00:00Z", price: 650, currency: "NGN" },
  { date: "2026-03-01T00:00:00Z", price: 660, currency: "NGN" },
  { date: "2026-03-15T00:00:00Z", price: 670, currency: "NGN" },
  { date: "2026-04-01T00:00:00Z", price: 675, currency: "NGN" },
  { date: "2026-04-15T00:00:00Z", price: 680, currency: "NGN" },
  { date: "2026-05-01T00:00:00Z", price: 685, currency: "NGN" },
  { date: "2026-05-15T00:00:00Z", price: 680, currency: "NGN" },
  { date: "2026-06-01T00:00:00Z", price: 690, currency: "NGN" },
  { date: "2026-06-15T00:00:00Z", price: 680, currency: "NGN" },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const city = searchParams.get("city") || "National Average";
    const fuelType = searchParams.get("fuel_type") || "diesel";
    const months = Number(searchParams.get("months")) || 6;

    if (!country) {
      return NextResponse.json(
        { success: false, error: "Missing required query param: country" },
        { status: 400 }
      );
    }

    try {
      const data = await getFuelPriceHistory(country, city, fuelType, months);
      if (data.length > 0) {
        return NextResponse.json({ success: true, data });
      }
    } catch {
      // Fall through to demo
    }

    return NextResponse.json({ success: true, data: demoHistory, source: "demo" });
  } catch {
    return NextResponse.json({ success: true, data: demoHistory, source: "demo" });
  }
}
