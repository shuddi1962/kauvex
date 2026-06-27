import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const demoPrices: Record<string, Record<string, { price: number; currency: string; city: string }>> = {
  NG: { diesel: { price: 680, currency: "NGN", city: "Lagos" }, petrol: { price: 620, currency: "NGN", city: "Lagos" } },
  US: { diesel: { price: 3.85, currency: "USD", city: "National Average" }, petrol: { price: 3.65, currency: "USD", city: "National Average" } },
  GB: { diesel: { price: 1.45, currency: "GBP", city: "National Average" }, petrol: { price: 1.42, currency: "GBP", city: "National Average" } },
  IN: { diesel: { price: 94.5, currency: "INR", city: "Delhi" }, petrol: { price: 103.5, currency: "INR", city: "Delhi" } },
  AU: { diesel: { price: 1.85, currency: "AUD", city: "Sydney" }, petrol: { price: 1.78, currency: "AUD", city: "Sydney" } },
  DE: { diesel: { price: 1.65, currency: "EUR", city: "Berlin" }, petrol: { price: 1.72, currency: "EUR", city: "Berlin" } },
  CA: { diesel: { price: 1.55, currency: "CAD", city: "Toronto" }, petrol: { price: 1.48, currency: "CAD", city: "Toronto" } },
  ZA: { diesel: { price: 24.5, currency: "ZAR", city: "Johannesburg" }, petrol: { price: 22.8, currency: "ZAR", city: "Johannesburg" } },
  BR: { diesel: { price: 5.8, currency: "BRL", city: "Sao Paulo" }, petrol: { price: 5.4, currency: "BRL", city: "Sao Paulo" } },
  JP: { diesel: { price: 165, currency: "JPY", city: "Tokyo" }, petrol: { price: 172, currency: "JPY", city: "Tokyo" } },
  FR: { diesel: { price: 1.72, currency: "EUR", city: "Paris" }, petrol: { price: 1.82, currency: "EUR", city: "Paris" } },
  GH: { diesel: { price: 12.5, currency: "GHS", city: "Accra" }, petrol: { price: 11.8, currency: "GHS", city: "Accra" } },
  KE: { diesel: { price: 185, currency: "KES", city: "Nairobi" }, petrol: { price: 178, currency: "KES", city: "Nairobi" } },
  SA: { diesel: { price: 2.18, currency: "SAR", city: "Riyadh" }, petrol: { price: 2.18, currency: "SAR", city: "Riyadh" } },
  AE: { diesel: { price: 2.65, currency: "AED", city: "Dubai" }, petrol: { price: 2.65, currency: "AED", city: "Dubai" } },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ countryCode: string }> }
) {
  try {
    const { countryCode } = await params;
    const code = countryCode.toUpperCase();
    const { searchParams } = new URL(request.url);
    const fuelType = searchParams.get("fuel_type") || "diesel";

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_fuel_prices")
      .select("*")
      .eq("country_code", code)
      .eq("fuel_type", fuelType)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      const demo = demoPrices[code]?.[fuelType];
      if (demo) {
        return NextResponse.json({
          success: true,
          data: {
            country_code: code,
            city: demo.city,
            fuel_type: fuelType,
            price: demo.price,
            currency_code: demo.currency,
            source: "demo",
            is_stale: false,
            fetched_at: new Date().toISOString(),
          },
          source: "demo",
        });
      }

      return NextResponse.json(
        { success: false, error: `No fuel price data for ${code}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      source: "database",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
