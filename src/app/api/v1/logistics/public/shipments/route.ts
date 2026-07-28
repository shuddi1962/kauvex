import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, checkScope } from "@/lib/logistics/api-auth";
import { generateJobNumber, generateDeliveryPin } from "@/lib/logistics/dispatch";

export async function POST(request: Request) {
  const auth = await validateApiKey(request.headers.get("Authorization"));
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!checkScope(auth, "shipments:write") && !checkScope(auth, "*")) {
    return NextResponse.json({ error: "Insufficient permissions. Required scope: shipments:write" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { pickupAddress, pickupCity, pickupCountry, pickupLat, pickupLng, dropoffAddress, dropoffCity, dropoffCountry, dropoffLat, dropoffLng, weightKg, description, what3words, gpsLat, gpsLng, customerName, customerPhone, customerEmail } = body;

    if (!dropoffAddress || !dropoffCountry) {
      return NextResponse.json({ error: "dropoffAddress and dropoffCountry are required" }, { status: 400 });
    }

    const trackingNumber = generateJobNumber("express");
    const deliveryPin = generateDeliveryPin();

    const shipment = await (prisma as any).expressShipment.create({
      data: {
        trackingNumber,
        pickupAddress: pickupAddress || "---",
        pickupCity: pickupCity || "---",
        pickupCountry: pickupCountry || dropoffCountry,
        pickupLat: pickupLat || gpsLat || null,
        pickupLng: pickupLng || gpsLng || null,
        dropoffAddress,
        dropoffCity: dropoffCity || "---",
        dropoffCountry,
        dropoffLat: dropoffLat || null,
        dropoffLng: dropoffLng || null,
        weightKg: weightKg || 1,
        description: description || "",
        status: "pending_pickup",
        deliveryPin,
        customerName: customerName || "---",
        customerPhone: customerPhone || "---",
        customerEmail: customerEmail || "",
        what3wordsPickup: what3words || null,
        what3wordsDropoff: what3words || null,
      },
    });

    return NextResponse.json({
      data: {
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        deliveryPin: shipment.deliveryPin,
      },
    }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const auth = await validateApiKey(request.headers.get("Authorization"));
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!checkScope(auth, "shipments:read") && !checkScope(auth, "*")) {
    return NextResponse.json({ error: "Insufficient permissions. Required scope: shipments:read" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const trackingNumber = searchParams.get("trackingNumber");

  if (!trackingNumber) {
    return NextResponse.json({ error: "trackingNumber query parameter is required" }, { status: 400 });
  }

  try {
    const shipment = await (prisma as any).expressShipment.findUnique({
      where: { trackingNumber },
      select: {
        id: true,
        trackingNumber: true,
        status: true,
        pickupAddress: true,
        pickupCity: true,
        pickupCountry: true,
        dropoffAddress: true,
        dropoffCity: true,
        dropoffCountry: true,
        weightKg: true,
        description: true,
        deliveryPin: true,
        statusHistory: true,
        createdAt: true,
        deliveredAt: true,
      },
    });

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    return NextResponse.json({ data: shipment });
  } catch {
    return NextResponse.json({ error: "Failed to retrieve shipment" }, { status: 500 });
  }
}
