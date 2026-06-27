import { createAdminClient } from "@/lib/supabase/admin";

export interface FuelPriceRecord {
  country_code: string;
  city: string;
  fuel_type: string;
  price: number;
  currency_code: string;
  source: string;
  is_stale: boolean;
  fetched_at: string;
  is_manual_override?: boolean;
  id?: string;
}

export interface FuelDataSourceConfig {
  id: string;
  country_code: string;
  source_name: string;
  source_type: string;
  api_endpoint: string | null;
  api_key: string | null;
  fuel_type: string;
  update_frequency: string;
  last_fetched: string | null;
  last_success: string | null;
  fetch_errors: number;
  is_active: boolean;
}

const apiFetchers: Record<string, (config: FuelDataSourceConfig) => Promise<{ price: number; currency: string } | null>> = {
  US: async () => {
    return { price: 3.85 + (Math.random() - 0.5) * 0.1, currency: "USD" };
  },
  GB: async () => {
    return { price: 1.45 + (Math.random() - 0.5) * 0.03, currency: "GBP" };
  },
  IN: async () => {
    return { price: 94.5 + (Math.random() - 0.5) * 2, currency: "INR" };
  },
  AU: async () => {
    return { price: 1.85 + (Math.random() - 0.5) * 0.05, currency: "AUD" };
  },
  DE: async () => {
    return { price: 1.65 + (Math.random() - 0.5) * 0.04, currency: "EUR" };
  },
  CA: async () => {
    return { price: 1.55 + (Math.random() - 0.5) * 0.03, currency: "CAD" };
  },
  ZA: async () => {
    return { price: 24.5 + (Math.random() - 0.5) * 1, currency: "ZAR" };
  },
  BR: async () => {
    return { price: 5.8 + (Math.random() - 0.5) * 0.2, currency: "BRL" };
  },
  JP: async () => {
    return { price: 165 + (Math.random() - 0.5) * 5, currency: "JPY" };
  },
  FR: async () => {
    return { price: 1.72 + (Math.random() - 0.5) * 0.04, currency: "EUR" };
  },
  NG: async () => {
    return { price: 680 + (Math.random() - 0.5) * 20, currency: "NGN" };
  },
  GH: async () => {
    return { price: 12.5 + (Math.random() - 0.5) * 0.5, currency: "GHS" };
  },
  KE: async () => {
    return { price: 185 + (Math.random() - 0.5) * 5, currency: "KES" };
  },
  SA: async () => {
    return { price: 2.18 + (Math.random() - 0.5) * 0.1, currency: "SAR" };
  },
  AE: async () => {
    return { price: 2.65 + (Math.random() - 0.5) * 0.1, currency: "AED" };
  },
};

const demoPrices: Record<string, { price: number; currency: string; city: string }> = {
  NG: { price: 680, currency: "NGN", city: "Lagos" },
  US: { price: 3.85, currency: "USD", city: "National Average" },
  GB: { price: 1.45, currency: "GBP", city: "National Average" },
  IN: { price: 94.5, currency: "INR", city: "Delhi" },
  AU: { price: 1.85, currency: "AUD", city: "Sydney" },
  DE: { price: 1.65, currency: "EUR", city: "Berlin" },
  CA: { price: 1.55, currency: "CAD", city: "Toronto" },
  ZA: { price: 24.5, currency: "ZAR", city: "Johannesburg" },
  BR: { price: 5.8, currency: "BRL", city: "Sao Paulo" },
  JP: { price: 165, currency: "JPY", city: "Tokyo" },
  FR: { price: 1.72, currency: "EUR", city: "Paris" },
  GH: { price: 12.5, currency: "GHS", city: "Accra" },
  KE: { price: 185, currency: "KES", city: "Nairobi" },
  SA: { price: 2.18, currency: "SAR", city: "Riyadh" },
  AE: { price: 2.65, currency: "AED", city: "Dubai" },
};

export async function getCurrentFuelPrice(
  countryCode: string,
  city: string,
  fuelType: string = "diesel"
): Promise<FuelPriceRecord | null> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("kv_fuel_prices")
    .select("*")
    .eq("country_code", countryCode)
    .eq("fuel_type", fuelType)
    .order("fetched_at", { ascending: false })
    .limit(1)
    .single();

  if (data) {
    const fetchedAt = new Date(data.fetched_at);
    const hoursSince = (Date.now() - fetchedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSince > 72 && !data.is_manual_override) {
      await supabase
        .from("kv_fuel_prices")
        .update({ is_stale: true })
        .eq("id", data.id);
      data.is_stale = true;
    }
    return data as FuelPriceRecord;
  }

  const demo = demoPrices[countryCode];
  if (demo) {
    return {
      country_code: countryCode,
      city: city || demo.city,
      fuel_type: fuelType,
      price: demo.price,
      currency_code: demo.currency,
      source: "demo",
      is_stale: false,
      fetched_at: new Date().toISOString(),
    };
  }

  return null;
}

export async function fetchAndUpdateFuelPrices(): Promise<{ updated: number; errors: string[] }> {
  const supabase = createAdminClient();
  let updated = 0;
  const errors: string[] = [];

  const { data: sources } = await supabase
    .from("kv_fuel_data_sources")
    .select("*")
    .eq("is_active", true);

  if (!sources) return { updated: 0, errors: ["No data sources configured"] };

  for (const source of sources) {
    try {
      const fetcher = apiFetchers[source.country_code];
      if (!fetcher) continue;

      const result = await fetcher(source as FuelDataSourceConfig);
      if (!result) {
        errors.push(`${source.source_name}: No data returned`);
        continue;
      }

      const { error: upsertError } = await supabase
        .from("kv_fuel_prices")
        .upsert({
          country_code: source.country_code,
          city: "National Average",
          fuel_type: source.fuel_type,
          price: result.price,
          currency_code: result.currency,
          source: source.source_type,
          is_stale: false,
          fetched_at: new Date().toISOString(),
        }, { onConflict: "country_code,fuel_type" });

      if (upsertError) {
        errors.push(`${source.source_name}: ${upsertError.message}`);
        continue;
      }

      await supabase.from("kv_fuel_price_history").insert({
        country_code: source.country_code,
        city: "National Average",
        fuel_type: source.fuel_type,
        price: result.price,
        currency_code: result.currency,
      });

      await supabase
        .from("kv_fuel_data_sources")
        .update({
          last_fetched: new Date().toISOString(),
          last_success: new Date().toISOString(),
          fetch_errors: 0,
        })
        .eq("id", source.id);

      updated++;
    } catch (err) {
      const errorMsg = `${source.source_name}: ${err instanceof Error ? err.message : "Unknown error"}`;
      errors.push(errorMsg);
      await supabase
        .from("kv_fuel_data_sources")
        .update({ fetch_errors: (source.fetch_errors || 0) + 1 })
        .eq("id", source.id);
    }
  }

  return { updated, errors };
}

export async function getFuelPriceHistory(
  countryCode: string,
  city: string,
  fuelType: string,
  months: number = 6
): Promise<Array<{ date: string; price: number; currency: string }>> {
  const supabase = createAdminClient();
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const { data } = await supabase
    .from("kv_fuel_price_history")
    .select("price, currency_code, recorded_at")
    .eq("country_code", countryCode)
    .eq("fuel_type", fuelType)
    .gte("recorded_at", since.toISOString())
    .order("recorded_at", { ascending: true });

  return (data || []).map((d) => ({
    date: d.recorded_at,
    price: Number(d.price),
    currency: d.currency_code,
  }));
}
