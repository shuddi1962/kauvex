import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shipmentId = searchParams.get("shipmentId");
    const waybillNumber = searchParams.get("waybillNumber");

    if (!shipmentId && !waybillNumber) {
      return NextResponse.json({ error: "shipmentId or waybillNumber required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const events: any[] = [];

    if (shipmentId) {
      const { data: job } = await supabase
        .from("kv_logistics_jobs")
        .select("*")
        .eq("id", shipmentId)
        .single();

      if (job) {
        if (job.picked_up_at) {
          events.push({
            id: "pickup",
            status: "Package picked up",
            location: job.pickup_location || "Pickup location",
            timestamp: job.picked_up_at,
            type: "pickup",
            statusType: "completed",
          });
        }
        if (job.delivered_at) {
          events.push({
            id: "delivery",
            status: "Package delivered",
            location: job.dropoff_location || "Delivery location",
            timestamp: job.delivered_at,
            type: "delivery",
            statusType: "completed",
          });
        }
        if (job.tracking_events) {
          const parsed = typeof job.tracking_events === "string" ? JSON.parse(job.tracking_events) : job.tracking_events;
          if (Array.isArray(parsed)) {
            parsed.forEach((e: any, i: number) => {
              events.push({
                id: `event-${i}`,
                status: e.description || e.status || "In transit",
                location: e.location || "Unknown",
                timestamp: e.date || e.timestamp || job.created_at,
                type: e.type || "transit",
                statusType: i === parsed.length - 1 ? "in_progress" : "completed",
              });
            });
          }
        }
        if (events.length === 0) {
          events.push({
            id: "created",
            status: "Shipment created",
            location: job.pickup_location || "Origin",
            timestamp: job.created_at,
            type: "order",
            statusType: "completed",
          });
        }
      }
    }

    if (waybillNumber) {
      const { data: express } = await supabase
        .from("kv_ship_express_shipments")
        .select("*")
        .eq("waybill_number", waybillNumber)
        .single();

      if (express) {
        events.push({
          id: "booking",
          status: "Express shipment booked",
          location: express.pickup_city || express.pickup_address || "Origin",
          timestamp: express.created_at,
          type: "order",
          statusType: "completed",
        });
        if (express.status === "picked_up" || express.status === "in_transit" || express.status === "out_for_delivery") {
          events.push({
            id: "transit",
            status: express.status === "out_for_delivery" ? "Out for delivery" : "In transit",
            location: express.dropoff_city || "Destination",
            timestamp: express.created_at,
            type: "transit",
            statusType: "in_progress",
          });
        }
        if (express.status === "delivered") {
          events.push({
            id: "delivered",
            status: "Delivered successfully",
            location: express.dropoff_city || express.dropoff_address || "Destination",
            timestamp: express.created_at,
            type: "delivery",
            statusType: "completed",
          });
        }
      }
    }

    return NextResponse.json({
      events: events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      total: events.length,
    });
  } catch (error) {
    console.error("[Tracking API]", error);
    return NextResponse.json({ error: "Failed to fetch tracking events" }, { status: 500 });
  }
}
