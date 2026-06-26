import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, filters = {} } = body;
    const supabase = createAdminClient();

    const {
      search,
      status,
      carrier,
      route: routeFilter,
      date_from,
      date_to,
      service_level,
      show = "all",
    } = filters;

    let query = supabase
      .from("kv_ship_express_shipments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (user_id) {
      query = query.eq("account_id", user_id);
    }

    if (search) {
      query = query.ilike("waybill_number", `%${search}%`);
    }

    if (status && status !== "all") {
      const statusMap: Record<string, string[]> = {
        on_route: ["picked_up", "in_transit"],
        delivered: ["delivered"],
        waiting: ["pending"],
        delayed: ["in_transit"],
        exception: ["failed", "returned"],
      };
      const mapped = statusMap[status] || [status];
      query = query.in("status", mapped);
    }

    if (carrier) {
      query = query.ilike("carrier_used", `%${carrier}%`);
    }

    if (service_level) {
      query = query.eq("service_level", service_level);
    }

    if (routeFilter) {
      const [origin, dest] = routeFilter.split("->").map((s: string) => s.trim());
      if (origin) {
        query = query.or(`pickup_city.ilike.%${origin}%,pickup_address.ilike.%${origin}%`);
      }
      if (dest) {
        query = query.or(`dropoff_city.ilike.%${dest}%,dropoff_address.ilike.%${dest}%`);
      }
    }

    if (date_from) {
      query = query.gte("created_at", date_from);
    }
    if (date_to) {
      query = query.lte("created_at", date_to);
    }

    if (show === "active") {
      query = query.in("status", ["pending", "picked_up", "in_transit", "out_for_delivery"]);
    } else if (show === "inactive") {
      query = query.in("status", ["delivered", "failed", "returned"]);
    }

    const { data: shipments, error: shipmentError } = await query;

    if (shipmentError) {
      console.error("[Fleet Tracking] Shipment query error:", shipmentError);
      return NextResponse.json({ error: shipmentError.message }, { status: 500 });
    }

    const shipmentIds = (shipments || []).map((s: any) => s.id);

    let cargoPhotosMap: Record<string, any[]> = {};
    if (shipmentIds.length > 0) {
      const { data: photos } = await supabase
        .from("kv_ksp_cargo_photos")
        .select("*")
        .in("shipment_id", shipmentIds)
        .order("created_at", { ascending: true });

      if (photos) {
        for (const photo of photos) {
          const sid = photo.shipment_id;
          if (!cargoPhotosMap[sid]) cargoPhotosMap[sid] = [];
          cargoPhotosMap[sid].push({
            id: photo.id,
            checkpointType: photo.checkpoint_type,
            photoUrl: photo.photo_url,
            takenByType: photo.taken_by_type,
            latitude: photo.latitude,
            longitude: photo.longitude,
            notes: photo.notes,
            createdAt: photo.created_at,
          });
        }
      }
    }

    const statusTimeline: Record<string, { label: string; progress: number }> = {
      pending: { label: "Waiting", progress: 5 },
      picked_up: { label: "On Route", progress: 30 },
      in_transit: { label: "On Route", progress: 60 },
      out_for_delivery: { label: "On Route", progress: 85 },
      delivered: { label: "Delivered", progress: 100 },
      failed: { label: "Exception", progress: 0 },
      returned: { label: "Exception", progress: 0 },
    };

    const enrichedShipments = (shipments || []).map((s: any) => {
      const statusInfo = statusTimeline[s.status] || { label: s.status, progress: 0 };
      const created = new Date(s.created_at).getTime();
      const now = Date.now();
      const elapsedMs = now - created;
      const elapsedHours = Math.floor(elapsedMs / 3600000);
      const elapsedDays = Math.floor(elapsedHours / 24);

      let elapsed: string;
      if (elapsedDays > 0) {
        elapsed = `${elapsedDays}d ${elapsedHours % 24}h`;
      } else if (elapsedHours > 0) {
        elapsed = `${elapsedHours}h ${Math.floor((elapsedMs % 3600000) / 60000)}m`;
      } else {
        elapsed = `${Math.floor(elapsedMs / 60000)}m`;
      }

      const estimatedDays = s.service_level === "same_day" ? 0 : s.service_level === "express" ? 1 : s.service_level === "standard" ? 3 : 5;
      const estimatedEnd = created + estimatedDays * 86400000;
      const remainingMs = Math.max(0, estimatedEnd - now);
      const remainingHours = Math.floor(remainingMs / 3600000);
      const remainingDays = Math.floor(remainingHours / 24);

      let remaining: string;
      if (s.status === "delivered") {
        remaining = "Delivered";
      } else if (remainingDays > 0) {
        remaining = `${remainingDays}d ${remainingHours % 24}h left`;
      } else if (remainingHours > 0) {
        remaining = `${remainingHours}h left`;
      } else {
        remaining = "Due soon";
      }

      return {
        id: s.id,
        waybillNumber: s.waybill_number,
        status: s.status,
        statusLabel: statusInfo.label,
        progress: statusInfo.progress,
        origin: {
          address: s.pickup_address,
          city: s.pickup_city,
          country: s.pickup_country,
          lat: s.pickup_lat,
          lng: s.pickup_lng,
        },
        destination: {
          address: s.dropoff_address,
          city: s.dropoff_city,
          country: s.dropoff_country,
          lat: s.dropoff_lat,
          lng: s.dropoff_lng,
        },
        sender: {
          name: s.sender_name,
          phone: s.sender_phone,
          email: s.sender_email,
        },
        receiver: {
          name: s.receiver_name,
          phone: s.receiver_phone,
        },
        carrier: s.carrier_used || "Unassigned",
        serviceLevel: s.service_level || "standard",
        tier: s.tier,
        weight: s.weight_kg,
        dimensions: { l: s.length_cm, w: s.width_cm, h: s.height_cm },
        chargeableWeight: s.chargeable_weight_kg,
        declaredValue: s.declared_value,
        currency: s.currency || "NGN",
        pricing: {
          baseShipping: s.price_paid || 0,
          insurancePremium: s.insurance_premium || 0,
          packagingFee: s.packaging_fee || 0,
          total: (parseFloat(s.price_paid || "0") + parseFloat(s.insurance_premium || "0") + parseFloat(s.packaging_fee || "0")),
        },
        insurance: s.insurance_purchased,
        packaging: { type: s.packaging_type, size: s.packaging_size },
        waybillUrl: s.waybill_url,
        paymentStatus: s.payment_status,
        deliveryConfidence: s.delivery_confidence_score,
        cargoPhotos: cargoPhotosMap[s.id] || [],
        elapsed,
        remaining,
        createdAt: s.created_at,
      };
    });

    return NextResponse.json({
      shipments: enrichedShipments,
      total: enrichedShipments.length,
      hasData: enrichedShipments.length > 0,
    });
  } catch (error: any) {
    console.error("[Fleet Tracking]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch fleet tracking data" },
      { status: 500 }
    );
  }
}
