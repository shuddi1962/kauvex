import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function generateWaybillNumber(): string {
  const prefix = "KVX-EXP";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${timestamp}${random}`;
}

function calculateDimensionalWeight(lengthCm: number, widthCm: number, heightCm: number, divisor = 5000): number {
  return (lengthCm * widthCm * heightCm) / divisor;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const dimWeight = body.length_cm && body.width_cm && body.height_cm
      ? calculateDimensionalWeight(body.length_cm, body.width_cm, body.height_cm)
      : 0;
    const chargeableWeight = Math.max(body.weight_kg || 0, dimWeight);

    const waybillNumber = generateWaybillNumber();

    const { data, error } = await supabase.from("kv_ship_express_shipments").insert({
      waybill_number: waybillNumber,
      sender_name: body.sender_name,
      sender_phone: body.sender_phone,
      sender_email: body.sender_email,
      business_account_id: body.business_account_id || null,
      receiver_name: body.receiver_name,
      receiver_phone: body.receiver_phone,
      pickup_address: body.pickup_address,
      pickup_city: body.pickup_city,
      pickup_country: body.pickup_country || "NG",
      pickup_lat: body.pickup_lat,
      pickup_lng: body.pickup_lng,
      dropoff_address: body.dropoff_address,
      dropoff_city: body.dropoff_city,
      dropoff_country: body.dropoff_country || "NG",
      dropoff_lat: body.dropoff_lat,
      dropoff_lng: body.dropoff_lng,
      contents_type: body.contents_type || "General",
      contents_description: body.contents_description || "",
      weight_kg: body.weight_kg,
      length_cm: body.length_cm,
      width_cm: body.width_cm,
      height_cm: body.height_cm,
      dimensional_weight_kg: dimWeight || null,
      chargeable_weight_kg: chargeableWeight || null,
      declared_value: body.declared_value || 0,
      currency: body.currency || "NGN",
      service_level: body.service_level || "standard",
      tier: body.tier || "tier_1",
      carrier_used: body.carrier_used || "kauvex",
      price_paid: body.price_paid || 0,
      insurance_purchased: body.insurance_purchased || false,
      insurance_premium: body.insurance_premium || 0,
      pack_for_me: body.pack_for_me || false,
      pack_for_me_fee: body.pack_for_me_fee || 0,
      special_instructions: body.special_instructions || "",
      signature_required: body.signature_required || false,
      payment_status: "pending",
      status: "pending",
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ shipment: data, waybill_number: waybillNumber }, { status: 201 });
  } catch (error) {
    console.error("[Express Waybills POST]", error);
    return NextResponse.json({ error: "Failed to create waybill" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const waybillNumber = searchParams.get("waybillNumber");
    const businessAccountId = searchParams.get("businessAccountId");
    const status = searchParams.get("status");

    const supabase = createAdminClient();
    let query = supabase.from("kv_ship_express_shipments").select("*");

    if (waybillNumber) query = query.eq("waybill_number", waybillNumber);
    if (businessAccountId) query = query.eq("business_account_id", businessAccountId);
    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("created_at", { ascending: false }).limit(50);
    if (error) throw error;

    return NextResponse.json({ shipments: data, total: data?.length || 0 });
  } catch (error) {
    console.error("[Express Waybills GET]", error);
    return NextResponse.json({ error: "Failed to fetch waybills" }, { status: 500 });
  }
}
