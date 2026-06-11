import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_request: NextRequest) {
  try {
    const db = createAdminClient();
    const { data, error } = await db
      .from("storefronts")
      .select("id, name, slug, active_domain, currency_code, currency_symbol, language_code, country_code, tax_rate, tax_label, tax_inclusive, is_default, meta_title, meta_description")
      .eq("status", "active")
      .order("is_default", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch storefronts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ storefronts: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
