import { createAdminClient } from "@/lib/supabase/admin";

export interface SurchargeRule {
  id: string;
  rule_name: string;
  origin_country: string | null;
  origin_city: string | null;
  destination_country: string | null;
  destination_city: string | null;
  tier: string;
  baseline_fuel_price: number;
  baseline_currency: string;
  surcharge_formula: string;
  surcharge_per_unit_increase: number;
  unit_increase_amount: number;
  max_surcharge_percent: number;
  min_fuel_increase_to_activate: number;
  partner_share_percent: number;
  is_active: boolean;
}

export interface SurchargeResult {
  surcharge_percent: number;
  surcharge_amount: number;
  currency_code: string;
  fuel_price: number;
  baseline_price: number;
  fuel_increase_percent: number;
  rule_applied: string;
  partner_share: number;
  kauvex_share: number;
  carrier_surcharge: number;
  carrier_surcharge_currency: string | null;
  carrier_surcharge_note: string | null;
  tooltip: string;
}

export async function calculateSurcharge(
  originCountry: string,
  originCity: string | null,
  destinationCountry: string,
  destinationCity: string | null,
  tier: string,
  baseRate: number,
  currencyCode: string
): Promise<SurchargeResult> {
  const supabase = createAdminClient();
  
  // Find applicable rule
  const { data: rules } = await supabase
    .from("kv_fuel_surcharge_rules")
    .select("*")
    .eq("is_active", true)
    .or(`origin_country.eq.${originCountry},origin_country.is.null`)
    .or(`destination_country.eq.${destinationCountry},destination_country.is.null`)
    .or(`tier.eq.${tier},tier.eq.all`)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!rules || rules.length === 0) {
    return {
      surcharge_percent: 0,
      surcharge_amount: 0,
      currency_code: currencyCode,
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
  }

  // Pick best matching rule (most specific first)
  const rule = rules[0];

  // Get current fuel price
  const { data: fuelPrice } = await supabase
    .from("kv_fuel_prices")
    .select("price, currency_code, city, country_code")
    .eq("country_code", originCountry)
    .eq("is_stale", false)
    .order("fetched_at", { ascending: false })
    .limit(1)
    .single();

  const currentPrice = fuelPrice?.price || rule.baseline_fuel_price;
  const fuelCurrency = fuelPrice?.currency_code || rule.baseline_currency;
  const baseline = rule.baseline_fuel_price;

  // Calculate fuel increase %
  const increase = baseline > 0 ? ((currentPrice - baseline) / baseline) * 100 : 0;

  // Check minimum threshold
  if (increase < rule.min_fuel_increase_to_activate) {
    return {
      surcharge_percent: 0,
      surcharge_amount: 0,
      currency_code: currencyCode,
      fuel_price: Number(currentPrice),
      baseline_price: Number(baseline),
      fuel_increase_percent: Math.round(increase * 100) / 100,
      rule_applied: rule.rule_name,
      partner_share: 0,
      kauvex_share: 0,
      carrier_surcharge: 0,
      carrier_surcharge_currency: null,
      carrier_surcharge_note: null,
      tooltip: `Fuel increase (${Math.round(increase)}%) is below the activation threshold (${rule.min_fuel_increase_to_activate}%). No surcharge applies.`,
    };
  }

  // Calculate surcharge %
  let surchargePercent = 0;
  if (rule.surcharge_formula === "percent_per_unit" && rule.unit_increase_amount > 0) {
    const units = increase / rule.unit_increase_amount;
    surchargePercent = units * rule.surcharge_per_unit_increase;
  } else if (rule.surcharge_formula === "fixed_percent") {
    surchargePercent = rule.surcharge_per_unit_increase;
  }

  // Cap at maximum
  surchargePercent = Math.min(surchargePercent, rule.max_surcharge_percent);
  surchargePercent = Math.max(surchargePercent, 0);

  // Calculate amounts
  const surchargeAmount = baseRate * (surchargePercent / 100);
  const partnerShare = surchargeAmount * (rule.partner_share_percent / 100);
  const kauvexShare = surchargeAmount - partnerShare;

  const cityLabel = fuelPrice?.city || originCountry;
  const priceFormatted = fuelCurrency === "NGN" ? `\u20a6${Number(currentPrice).toLocaleString()}` :
    fuelCurrency === "GBP" ? `\u00a3${Number(currentPrice).toFixed(2)}` :
    fuelCurrency === "USD" ? `$${Number(currentPrice).toFixed(2)}` :
    `${Number(currentPrice).toFixed(2)} ${fuelCurrency}`;

  return {
    surcharge_percent: Math.round(surchargePercent * 100) / 100,
    surcharge_amount: Math.round(surchargeAmount * 100) / 100,
    currency_code: currencyCode,
    fuel_price: Number(currentPrice),
    baseline_price: Number(baseline),
    fuel_increase_percent: Math.round(increase * 100) / 100,
    rule_applied: rule.rule_name,
    partner_share: Math.round(partnerShare * 100) / 100,
    kauvex_share: Math.round(kauvexShare * 100) / 100,
    carrier_surcharge: 0,
    carrier_surcharge_currency: null,
    carrier_surcharge_note: null,
    tooltip: `Fuel surcharge reflects the current cost of fuel on this route. Current diesel price in ${cityLabel}: ${priceFormatted} (+${Math.round(increase)}% vs baseline). Surcharge: ${Math.round(surchargePercent)}% of base rate.`,
  };
}

export async function logSurcharge(
  shipmentId: string,
  ruleId: string,
  result: SurchargeResult
): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("kv_fuel_surcharge_log").insert({
    shipment_id: shipmentId,
    route_rule_id: ruleId,
    fuel_price_at_booking: result.fuel_price,
    baseline_price: result.baseline_price,
    surcharge_percent: result.surcharge_percent,
    surcharge_amount: result.surcharge_amount,
    currency_code: result.currency_code,
    partner_share: result.partner_share,
    kauvex_share: result.kauvex_share,
  });
}
