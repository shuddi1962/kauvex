import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    if (!vendorId) {
      return NextResponse.json({ error: "vendor_id is required" }, { status: 400 });
    }

    const db = createAdminClient();
    const { data, error } = await db
      .from("vendor_ads")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }

    return NextResponse.json({ campaigns: data || [] });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vendor_id,
      name,
      type,
      status,
      budget,
      bid_amount,
      bid_type,
      start_date,
      end_date,
      target_storefronts,
      targeting_type,
      keywords,
      product_ids,
      headline,
      description,
      cta,
      creative_urls,
    } = body;

    if (!vendor_id || !name || !type || !budget || !start_date || !end_date) {
      return NextResponse.json(
        { error: "Missing required fields: vendor_id, name, type, budget, start_date, end_date" },
        { status: 400 }
      );
    }

    if (!target_storefronts || target_storefronts.length === 0) {
      return NextResponse.json(
        { error: "At least one target storefront is required" },
        { status: 400 }
      );
    }

    const db = createAdminClient();

    const { data: vendor } = await db
      .from("vendors")
      .select("id")
      .eq("id", vendor_id)
      .single();

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const adData: Record<string, unknown> = {
      vendor_id,
      name,
      type,
      status: status || "draft",
      budget,
      bid_amount: bid_amount || null,
      bid_type: bid_type || "auto",
      start_date,
      end_date,
      target_storefronts,
      targeting_type: targeting_type || "auto",
      keywords: keywords || [],
      product_ids: product_ids || [],
      headline: headline || null,
      description: description || null,
      cta: cta || null,
      creative_urls: creative_urls || [],
      spent: 0,
      impressions: 0,
      clicks: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await db
      .from("vendor_ads")
      .insert([adData])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create campaign", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaign: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
