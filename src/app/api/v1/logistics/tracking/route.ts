import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const statusLabels: Record<string, string> = {
  pending: "Order Placed",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  failed: "Delivery Failed",
  returned: "Returned to Sender",
};

function buildTimeline(express: any) {
  const stages = [
    { status: "Order Placed", completed: true, current: false },
    { status: "In Transit", completed: express.status !== "pending", current: express.status === "picked_up" || express.status === "in_transit" },
    { status: "Out for Delivery", completed: express.status === "out_for_delivery" || express.status === "delivered", current: express.status === "out_for_delivery" },
    { status: "Delivered", completed: express.status === "delivered", current: express.status === "delivered" },
  ];
  return stages;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shipmentId = searchParams.get("shipmentId");
    const waybillNumber = searchParams.get("waybillNumber");

    if (!shipmentId && !waybillNumber) {
      return NextResponse.json({ success: false, error: "shipmentId or waybillNumber required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (waybillNumber) {
      const { data: express } = await supabase
        .from("kv_ship_express_shipments")
        .select("*")
        .eq("waybill_number", waybillNumber)
        .single();

      if (express) {
        return NextResponse.json({
          success: true,
          data: {
            waybill: express.waybill_number,
            status: express.status,
            service: express.service_level || "Standard",
            estimatedDelivery: express.created_at,
            pickupDate: express.created_at,
            pickupAddress: express.pickup_address || express.pickup_city || "—",
            dropoffAddress: express.dropoff_address || express.dropoff_city || "—",
            weight: express.weight_kg ? `${express.weight_kg} kg` : "—",
            contents: express.contents_type || "—",
            timeline: buildTimeline(express),
          },
        });
      }
    }

    if (shipmentId) {
      const { data: job } = await supabase
        .from("kv_logistics_jobs")
        .select("*")
        .eq("id", shipmentId)
        .single();

      if (job) {
        return NextResponse.json({
          success: true,
          data: {
            waybill: job.job_number || shipmentId,
            status: job.status,
            service: "Standard",
            estimatedDelivery: job.delivered_at || job.created_at,
            pickupDate: job.picked_up_at || job.created_at,
            pickupAddress: job.pickup_location || "—",
            dropoffAddress: job.dropoff_location || "—",
            weight: "—",
            contents: "—",
            timeline: [
              { status: "Order Placed", completed: true, current: false },
              { status: job.picked_up_at ? "Picked Up" : "In Transit", completed: !!job.picked_up_at, current: !!job.picked_up_at && !job.delivered_at },
              { status: "Delivered", completed: !!job.delivered_at, current: !!job.delivered_at },
            ],
          },
        });
      }
    }

    return NextResponse.json({ success: false, error: "Shipment not found" }, { status: 404 });
  } catch (error) {
    console.error("[Tracking API]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tracking information" }, { status: 500 });
  }
}
