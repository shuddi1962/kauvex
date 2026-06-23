import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const waybillNumber = searchParams.get("waybillNumber");

    if (!waybillNumber) {
      return NextResponse.json({ error: "waybillNumber is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: shipment, error } = await supabase
      .from("kv_ship_express_shipments")
      .select("*")
      .eq("waybill_number", waybillNumber)
      .single();

    if (error || !shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    const statusMap: Record<string, { label: string; progress: number }> = {
      pending: { label: "Booking Confirmed", progress: 10 },
      picked_up: { label: "Picked Up", progress: 30 },
      in_transit: { label: "In Transit", progress: 50 },
      out_for_delivery: { label: "Out for Delivery", progress: 75 },
      delivered: { label: "Delivered", progress: 100 },
      failed: { label: "Delivery Failed", progress: 0 },
      returned: { label: "Returned to Sender", progress: 0 },
    };

    const statusInfo = statusMap[shipment.status as string] || { label: shipment.status, progress: 0 };

    const events = [
      {
        id: "booking",
        status: "Shipment booked via " + (shipment.service_level || "standard"),
        location: shipment.pickup_city || shipment.pickup_address || "Origin",
        timestamp: shipment.created_at,
        type: "order",
        statusType: "completed",
      },
    ];

    if (shipment.status !== "pending") {
      events.push({
        id: "pickup",
        status: "Package picked up by carrier",
        location: shipment.pickup_city || "Pickup location",
        timestamp: shipment.created_at,
        type: "pickup",
        statusType: shipment.status === "picked_up" || shipment.status === "in_transit" || shipment.status === "out_for_delivery" || shipment.status === "delivered" ? "completed" : "pending",
      });
    }

    if (shipment.status === "in_transit" || shipment.status === "out_for_delivery" || shipment.status === "delivered") {
      events.push({
        id: "transit",
        status: "Package in transit to destination",
        location: shipment.dropoff_city || "Destination",
        timestamp: shipment.created_at,
        type: "transit",
        statusType: shipment.status === "in_transit" ? "in_progress" : "completed",
      });
    }

    if (shipment.status === "out_for_delivery" || shipment.status === "delivered") {
      events.push({
        id: "out-for-delivery",
        status: "Package out for delivery",
        location: shipment.dropoff_city || "Destination",
        timestamp: shipment.created_at,
        type: "delivery",
        statusType: shipment.status === "out_for_delivery" ? "in_progress" : "completed",
      });
    }

    if (shipment.status === "delivered") {
      events.push({
        id: "delivered",
        status: "Package delivered successfully",
        location: shipment.dropoff_address || shipment.dropoff_city || "Destination",
        timestamp: shipment.created_at,
        type: "delivery",
        statusType: "completed",
      });
    }

    if (shipment.status === "failed") {
      events.push({
        id: "failed",
        status: "Delivery attempt failed",
        location: shipment.dropoff_city || "Destination",
        timestamp: shipment.created_at,
        type: "delivery",
        statusType: "failed",
      });
    }

    return NextResponse.json({
      shipment: {
        waybillNumber: shipment.waybill_number,
        status: shipment.status,
        statusLabel: statusInfo.label,
        progress: statusInfo.progress,
        senderName: shipment.sender_name,
        receiverName: shipment.receiver_name,
        pickupAddress: shipment.pickup_address,
        dropoffAddress: shipment.dropoff_address,
        pickupCity: shipment.pickup_city,
        dropoffCity: shipment.dropoff_city,
        weightKg: shipment.weight_kg,
        serviceLevel: shipment.service_level,
        pricePaid: shipment.price_paid,
        currency: shipment.currency,
        carrierUsed: shipment.carrier_used,
        signatureRequired: shipment.signature_required,
        createdAt: shipment.created_at,
      },
      events: events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    });
  } catch (error) {
    console.error("[Express Tracking]", error);
    return NextResponse.json({ error: "Failed to fetch tracking" }, { status: 500 });
  }
}
