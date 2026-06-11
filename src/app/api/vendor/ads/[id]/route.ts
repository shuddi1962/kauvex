import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    const db = createAdminClient();

    let query = db
      .from("vendor_ads")
      .select("*")
      .eq("id", params.id);

    if (vendorId) {
      query = query.eq("vendor_id", vendorId);
    }

    const { data, error } = await query.single();

    if (error && error.code === "PGRST116") {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (error) {
      return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
    }

    return NextResponse.json({ campaign: data });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      vendor_id,
      name,
      budget,
      bid_amount,
      bid_type,
      start_date,
      end_date,
      target_storefronts,
      keywords,
      product_ids,
      headline,
      description,
      cta,
      creative_urls,
    } = body;

    const db = createAdminClient();

    const { data: existing } = await db
      .from("vendor_ads")
      .select("id, vendor_id")
      .eq("id", params.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (vendor_id && existing.vendor_id !== vendor_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (budget !== undefined) updates.budget = budget;
    if (bid_amount !== undefined) updates.bid_amount = bid_amount;
    if (bid_type !== undefined) updates.bid_type = bid_type;
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;
    if (target_storefronts !== undefined) updates.target_storefronts = target_storefronts;
    if (keywords !== undefined) updates.keywords = keywords;
    if (product_ids !== undefined) updates.product_ids = product_ids;
    if (headline !== undefined) updates.headline = headline;
    if (description !== undefined) updates.description = description;
    if (cta !== undefined) updates.cta = cta;
    if (creative_urls !== undefined) updates.creative_urls = creative_urls;

    const { data, error } = await db
      .from("vendor_ads")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
    }

    return NextResponse.json({ campaign: data });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, vendor_id } = body;

    if (!action || !["pause", "resume", "end"].includes(action)) {
      return NextResponse.json(
        { error: "Valid action required: pause, resume, or end" },
        { status: 400 }
      );
    }

    const db = createAdminClient();

    const { data: existing } = await db
      .from("vendor_ads")
      .select("id, vendor_id, status")
      .eq("id", params.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (vendor_id && existing.vendor_id !== vendor_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let newStatus: string;
    switch (action) {
      case "pause":
        newStatus = "paused";
        break;
      case "resume":
        newStatus = "active";
        break;
      case "end":
        newStatus = "ended";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { data, error } = await db
      .from("vendor_ads")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `Failed to ${action} campaign` }, { status: 500 });
    }

    return NextResponse.json({ campaign: data });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendor_id");

    const db = createAdminClient();

    const { data: existing } = await db
      .from("vendor_ads")
      .select("id, vendor_id, status")
      .eq("id", params.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (vendorId && existing.vendor_id !== vendorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error } = await db
      .from("vendor_ads")
      .update({
        status: "ended",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: "Failed to end campaign" }, { status: 500 });
    }

    return NextResponse.json({ message: "Campaign ended successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
