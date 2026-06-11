import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { successResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(_request: NextRequest) {
  try {
    const db = createAdminClient();
    const { data, error } = await db
      .from("storefronts")
      .select("id, name, slug, active_domain, currency_code, currency_symbol, language_code, country_code, tax_rate, tax_label, tax_inclusive, is_default, meta_title, meta_description, catalog_mode")
      .eq("status", "active")
      .order("is_default", { ascending: false });

    if (error) return errorResponse("Failed to fetch storefronts", 500);

    return successResponse(data || []);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
