import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCarrier } from "@/lib/shipping";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      shipment_id,
      shipment_type = "marketplace",
      carrier_code,
      origin_country,
      dest_country,
      items,
      declared_value,
      currency = "USD",
      incoterm = "DAP",
    } = body;

    if (!origin_country || !dest_country || !items?.length) {
      return NextResponse.json({ error: "origin_country, dest_country, and items required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    let customsDoc: any = null;

    if (carrier_code) {
      try {
        const carrier = await getCarrier(carrier_code);
        if (carrier.generateCustomsDeclaration) {
          customsDoc = await carrier.generateCustomsDeclaration({
            origin: { country: origin_country, city: "", postalCode: "", address: "" },
            destination: { country: dest_country, city: "", postalCode: "", address: "" },
            weight: items.reduce((s: number, i: any) => s + (i.weight || 0) * (i.quantity || 1), 0),
            value: declared_value,
            items: items.map((i: any) => ({
              sku: i.sku || i.name || "item",
              quantity: i.quantity || 1,
              weight: i.weight,
              hsCode: i.hs_code,
            })),
          });
        }
      } catch {
        // Carrier customs generation failed, use defaults
      }
    }

    const { data, error } = await supabase.from("kv_ship_customs_documents").insert({
      shipment_id,
      shipment_type,
      document_type: customsDoc?.documentType || "commercial_invoice",
      hs_codes: customsDoc?.hsCodes || items.map((i: any) => ({
        code: i.hs_code || "847130",
        description: i.name || i.sku || "item",
        quantity: i.quantity || 1,
        unitValue: i.unit_value || 0,
      })),
      declared_value: declared_value || 0,
      currency,
      incoterm,
      origin_country,
      dest_country,
      customs_status: "pending",
      duties_estimated: customsDoc?.totalEstimated || 0,
      duties_paid_by: incoterm === "DDP" ? "kauvex" : "customer",
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ document: data, customs: customsDoc }, { status: 201 });
  } catch (error) {
    console.error("[Customs API]", error);
    return NextResponse.json({ error: "Failed to create customs document" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shipmentId = searchParams.get("shipmentId");
    const status = searchParams.get("customsStatus");

    const supabase = createAdminClient();
    let query = supabase.from("kv_ship_customs_documents").select("*");

    if (shipmentId) query = query.eq("shipment_id", shipmentId);
    if (status) query = query.eq("customs_status", status);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    return NextResponse.json({ documents: data, total: data?.length || 0 });
  } catch (error) {
    console.error("[Customs GET]", error);
    return NextResponse.json({ error: "Failed to fetch customs documents" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Document ID required" }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase.from("kv_ship_customs_documents").update(updates).eq("id", id).select().single();
    if (error) throw error;

    return NextResponse.json({ document: data });
  } catch (error) {
    console.error("[Customs PATCH]", error);
    return NextResponse.json({ error: "Failed to update customs document" }, { status: 500 });
  }
}
