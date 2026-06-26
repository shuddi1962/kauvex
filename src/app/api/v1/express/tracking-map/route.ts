import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  lagos: { lat: 6.5244, lng: 3.3792 },
  abuja: { lat: 9.0579, lng: 7.4951 },
  "port harcourt": { lat: 4.8156, lng: 7.0498 },
  kano: { lat: 12.0022, lng: 8.592 },
  ibadan: { lat: 7.3775, lng: 3.947 },
  accra: { lat: 5.56, lng: -0.187 },
  nairobi: { lat: -1.2864, lng: 36.8172 },
  johannesburg: { lat: -26.2041, lng: 28.0473 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  london: { lat: 51.5074, lng: -0.1278 },
  newyork: { lat: 40.7128, lng: -74.006 },
  "new york": { lat: 40.7128, lng: -74.006 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  saopaulo: { lat: -23.5505, lng: -46.6333 },
  "sao paulo": { lat: -23.5505, lng: -46.6333 },
  paris: { lat: 48.8566, lng: 2.3522 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  capetown: { lat: -33.9249, lng: 18.4241 },
  "cape town": { lat: -33.9249, lng: 18.4241 },
  cairo: { lat: 30.0444, lng: 31.2357 },
  casablanca: { lat: 33.5731, lng: -7.5898 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  berlin: { lat: 52.52, lng: 13.405 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  lekki: { lat: 6.4477, lng: 3.4619 },
  ikeja: { lat: 6.6018, lng: 3.3515 },
  surulere: { lat: 6.5244, lng: 3.3611 },
  calabar: { lat: 4.9584, lng: 8.3259 },
  ghana: { lat: 5.6037, lng: -0.187 },
  kenya: { lat: -1.2864, lng: 36.8172 },
  "south africa": { lat: -33.9249, lng: 18.4241 },
  uk: { lat: 51.5074, lng: -0.1278 },
  usa: { lat: 40.7128, lng: -74.006 },
  uae: { lat: 25.2048, lng: 55.2708 },
  india: { lat: 19.076, lng: 72.8777 },
  australia: { lat: -33.8688, lng: 151.2093 },
  germany: { lat: 52.52, lng: 13.405 },
  canada: { lat: 43.6532, lng: -79.3832 },
  brazil: { lat: -23.5505, lng: -46.6333 },
  japan: { lat: 35.6762, lng: 139.6503 },
  france: { lat: 48.8566, lng: 2.3522 },
};

function resolveCoords(city: string | null, country: string | null): { lat: number; lng: number } {
  if (city) {
    const key = city.toLowerCase().trim();
    if (CITY_COORDS[key]) return CITY_COORDS[key];
  }
  if (country) {
    const key = country.toLowerCase().trim();
    if (CITY_COORDS[key]) return CITY_COORDS[key];
  }
  return { lat: 6.5244, lng: 3.3792 };
}

function interpolatePosition(
  pickup: { lat: number; lng: number },
  dropoff: { lat: number; lng: number },
  progress: number
): { lat: number; lng: number } {
  const t = Math.min(Math.max(progress / 100, 0), 1);
  return {
    lat: pickup.lat + (dropoff.lat - pickup.lat) * t,
    lng: pickup.lng + (dropoff.lng - pickup.lng) * t,
  };
}

function calcDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const STATUS_MAP: Record<string, { label: string; mapStatus: string; progress: number }> = {
  pending: { label: "Booking Confirmed", mapStatus: "pickup", progress: 5 },
  picked_up: { label: "At Pickup", mapStatus: "pickup", progress: 20 },
  in_transit: { label: "In Transit", mapStatus: "transit", progress: 55 },
  out_for_delivery: { label: "Out for Delivery", mapStatus: "out_for_delivery", progress: 80 },
  delivered: { label: "Delivered", mapStatus: "delivered", progress: 100 },
  failed: { label: "Failed", mapStatus: "exception", progress: 0 },
  returned: { label: "Returned", mapStatus: "exception", progress: 0 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, filters } = body;

    const where: any = {
      status: { notIn: ["delivered", "failed", "returned"] },
    };

    if (filters?.status && filters.status !== "all") {
      where.status = filters.status;
    }
    if (filters?.serviceLevel && filters.serviceLevel !== "all") {
      where.serviceLevel = filters.serviceLevel;
    }
    if (filters?.carrier && filters.carrier !== "all") {
      where.carrierUsed = filters.carrier;
    }
    if (filters?.tier && filters.tier !== "all") {
      where.tier = filters.tier;
    }

    const shipments = await (prisma as any).expressShipment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const mappedShipments = shipments.map((s: any) => {
      const pickupCoords = resolveCoords(s.pickupCity, s.pickupCountry);
      const dropoffCoords = resolveCoords(s.dropoffCity, s.dropoffCountry);
      const statusInfo = STATUS_MAP[s.status] || { label: s.status, mapStatus: "transit", progress: 30 };
      const progress = statusInfo.progress + Math.floor(Math.random() * 20) - 10;
      const currentPos = interpolatePosition(pickupCoords, dropoffCoords, progress);
      const totalDist = calcDistanceKm(pickupCoords.lat, pickupCoords.lng, dropoffCoords.lat, dropoffCoords.lng);
      const remaining = totalDist * (1 - progress / 100);

      const createdAt = new Date(s.createdAt).getTime();
      const now = Date.now();
      const hoursInTransit = ((now - createdAt) / (1000 * 60 * 60)).toFixed(1);

      return {
        id: s.id,
        waybillNumber: s.waybillNumber,
        status: statusInfo.mapStatus,
        statusLabel: statusInfo.label,
        progress: Math.min(Math.max(progress, 0), 100),
        senderName: s.senderName,
        receiverName: s.receiverName,
        pickupCity: s.pickupCity || "Unknown",
        dropoffCity: s.dropoffCity || "Unknown",
        pickupCountry: s.pickupCountry,
        dropoffCountry: s.dropoffCountry,
        contentsDescription: s.contentsDescription || "Package",
        serviceLevel: s.serviceLevel || "standard",
        tier: s.tier || "tier_1",
        carrierUsed: s.carrierUsed || "Kauvex Express",
        currentLat: currentPos.lat,
        currentLng: currentPos.lng,
        pickupLat: pickupCoords.lat,
        pickupLng: pickupCoords.lng,
        dropoffLat: dropoffCoords.lat,
        dropoffLng: dropoffCoords.lng,
        distanceRemaining: Math.round(remaining),
        totalDistance: Math.round(totalDist),
        hoursInTransit: parseFloat(hoursInTransit),
        eta: statusInfo.mapStatus === "out_for_delivery" ? "Today" : `~${Math.max(1, Math.round(remaining / 500))}h`,
        createdAt: s.createdAt,
      };
    });

    let geofenceAlerts: any[] = [];
    try {
      geofenceAlerts = await (prisma as any).kspGeofenceAlert.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    } catch {
      geofenceAlerts = [];
    }

    const stats = {
      total: mappedShipments.length,
      transit: mappedShipments.filter((s: any) => s.status === "transit").length,
      pickup: mappedShipments.filter((s: any) => s.status === "pickup").length,
      out_for_delivery: mappedShipments.filter((s: any) => s.status === "out_for_delivery").length,
      exception: mappedShipments.filter((s: any) => s.status === "exception").length,
      avgEta:
        mappedShipments.length > 0
          ? `${Math.round(mappedShipments.reduce((a: number, s: any) => a + s.hoursInTransit, 0) / mappedShipments.length * 10) / 10}h`
          : "0h",
    };

    return NextResponse.json({
      shipments: mappedShipments,
      geofenceAlerts,
      stats,
    });
  } catch (error: any) {
    console.error("[Tracking Map]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tracking map data" }, { status: 500 });
  }
}
