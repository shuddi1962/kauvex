import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const demoPrices = [
  { country_code: "NG", city: "Lagos", fuel_type: "diesel", price: 680, currency_code: "NGN", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
  { country_code: "NG", city: "Lagos", fuel_type: "petrol", price: 620, currency_code: "NGN", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
  { country_code: "US", city: "National Average", fuel_type: "diesel", price: 3.85, currency_code: "USD", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
  { country_code: "GB", city: "National Average", fuel_type: "diesel", price: 1.45, currency_code: "GBP", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
  { country_code: "IN", city: "Delhi", fuel_type: "diesel", price: 94.5, currency_code: "INR", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
  { country_code: "AU", city: "Sydney", fuel_type: "diesel", price: 1.85, currency_code: "AUD", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
  { country_code: "DE", city: "Berlin", fuel_type: "diesel", price: 1.65, currency_code: "EUR", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
  { country_code: "CA", city: "Toronto", fuel_type: "diesel", price: 1.55, currency_code: "CAD", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
  { country_code: "ZA", city: "Johannesburg", fuel_type: "diesel", price: 24.5, currency_code: "ZAR", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
  { country_code: "BR", city: "Sao Paulo", fuel_type: "diesel", price: 5.8, currency_code: "BRL", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
  { country_code: "JP", city: "Tokyo", fuel_type: "diesel", price: 165, currency_code: "JPY", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
  { country_code: "FR", city: "Paris", fuel_type: "diesel", price: 1.72, currency_code: "EUR", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
  { country_code: "GH", city: "Accra", fuel_type: "diesel", price: 12.5, currency_code: "GHS", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
  { country_code: "KE", city: "Nairobi", fuel_type: "diesel", price: 185, currency_code: "KES", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
  { country_code: "SA", city: "Riyadh", fuel_type: "diesel", price: 2.18, currency_code: "SAR", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
  { country_code: "AE", city: "Dubai", fuel_type: "diesel", price: 2.65, currency_code: "AED", source: "demo", is_stale: false, fetched_at: new Date().toISOString() },
];

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const fuelType = searchParams.get("fuel_type");
    const country = searchParams.get("country");

    let query = supabase
      .from("kv_fuel_prices")
      .select("*")
      .order("fetched_at", { ascending: false });

    if (fuelType) query = query.eq("fuel_type", fuelType);
    if (country) query = query.eq("country_code", country);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      let filtered = demoPrices;
      if (fuelType) filtered = filtered.filter((p) => p.fuel_type === fuelType);
      if (country) filtered = filtered.filter((p) => p.country_code === country);

      return NextResponse.json({
        success: true,
        data: filtered,
        source: "demo",
      });
    }

    return NextResponse.json({
      success: true,
      data,
      source: "database",
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: demoPrices,
      source: "demo",
    });
  }
}
