import { NextRequest, NextResponse } from "next/server";
import { calculateSurcharge } from "@/lib/fuel/surcharge";

const demoResult = {
  surcharge_percent: 0,
  surcharge_amount: 0,
  currency_code: "USD",
  fuel_price: 0,
  baseline_price: 0,
  fuel_increase_percent: 0,
  rule_applied: "none",
  partner_share: 0,
  kauvex_share: 0,
  carrier_surcharge: 0,
  carrier_surcharge_currency: null,
  carrier_surcharge_note: null,
  tooltip: "No fuel surcharge active on this route.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originCountry, originCity, destinationCountry, destinationCity, tier, baseRate, currencyCode } = body;

    if (!originCountry || !destinationCountry || !tier || baseRate === undefined || !currencyCode) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: originCountry, destinationCountry, tier, baseRate, currencyCode" },
        { status: 400 }
      );
    }

    try {
      const result = await calculateSurcharge(
        originCountry,
        originCity || null,
        destinationCountry,
        destinationCity || null,
        tier,
        Number(baseRate),
        currencyCode
      );

      return NextResponse.json({ success: true, data: result });
    } catch {
      return NextResponse.json({ success: true, data: demoResult, source: "demo" });
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
