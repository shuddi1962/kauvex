import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const demoSources = [
  {
    id: "src-001",
    country_code: "NG",
    source_name: "NNPC Daily Pump Price",
    source_type: "government",
    api_endpoint: null,
    api_key: null,
    fuel_type: "diesel",
    update_frequency: "daily",
    last_fetched: new Date().toISOString(),
    last_success: new Date().toISOString(),
    fetch_errors: 0,
    is_active: true,
  },
  {
    id: "src-002",
    country_code: "US",
    source_name: "EIA Petroleum Data",
    source_type: "government",
    api_endpoint: "https://api.eia.gov/v2/petroleum/pri/gnd/data/",
    api_key: null,
    fuel_type: "diesel",
    update_frequency: "weekly",
    last_fetched: new Date().toISOString(),
    last_success: new Date().toISOString(),
    fetch_errors: 0,
    is_active: true,
  },
  {
    id: "src-003",
    country_code: "GB",
    source_name: "BEIS Weekly Fuel Prices",
    source_type: "government",
    api_endpoint: null,
    api_key: null,
    fuel_type: "diesel",
    update_frequency: "weekly",
    last_fetched: new Date().toISOString(),
    last_success: new Date().toISOString(),
    fetch_errors: 0,
    is_active: true,
  },
  {
    id: "src-004",
    country_code: "IN",
    source_name: "Indian Oil Corporation",
    source_type: "government",
    api_endpoint: null,
    api_key: null,
    fuel_type: "diesel",
    update_frequency: "daily",
    last_fetched: new Date().toISOString(),
    last_success: new Date().toISOString(),
    fetch_errors: 0,
    is_active: true,
  },
  {
    id: "src-005",
    country_code: "AU",
    source_name: "ACCC Fuel Monitoring",
    source_type: "government",
    api_endpoint: null,
    api_key: null,
    fuel_type: "diesel",
    update_frequency: "weekly",
    last_fetched: new Date().toISOString(),
    last_success: new Date().toISOString(),
    fetch_errors: 0,
    is_active: true,
  },
  {
    id: "src-006",
    country_code: "DE",
    source_name: "Bundesnetzagentur",
    source_type: "government",
    api_endpoint: null,
    api_key: null,
    fuel_type: "diesel",
    update_frequency: "weekly",
    last_fetched: new Date().toISOString(),
    last_success: new Date().toISOString(),
    fetch_errors: 0,
    is_active: true,
  },
];

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("kv_fuel_data_sources")
      .select("*")
      .order("country_code", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: demoSources, source: "demo" });
    }

    return NextResponse.json({ success: true, data, source: "database" });
  } catch {
    return NextResponse.json({ success: true, data: demoSources, source: "demo" });
  }
}
