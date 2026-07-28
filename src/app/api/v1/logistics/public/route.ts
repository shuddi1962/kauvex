import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/logistics/api-auth";

export async function GET(request: Request) {
  const auth = await validateApiKey(request.headers.get("Authorization"));
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  return NextResponse.json({
    name: "Kauvex Logistics API",
    version: "1.0",
    documentation: "https://kauvex.com/docs/logistics-api",
    auth: {
      type: "Bearer",
      keyId: auth.id,
      keyName: auth.name,
      scopes: auth.scopes,
    },
    endpoints: {
      quotes: {
        method: "POST",
        path: "/api/v1/logistics/public/quotes",
        description: "Get delivery quotes for a shipment",
        requiredScope: "quotes:read",
      },
      createShipment: {
        method: "POST",
        path: "/api/v1/logistics/public/shipments",
        description: "Create a new shipment",
        requiredScope: "shipments:write",
      },
      trackShipment: {
        method: "GET",
        path: "/api/v1/logistics/public/shipments?trackingNumber={number}",
        description: "Track a shipment by tracking number",
        requiredScope: "shipments:read",
      },
      lockers: {
        method: "GET",
        path: "/api/v1/logistics/public/lockers?city={city}&country={code}",
        description: "Find nearby lockers",
        requiredScope: "lockers:read",
      },
      w3wResolve: {
        method: "POST",
        path: "/api/v1/logistics/public/w3w",
        description: "Resolve a What3Words address to coordinates",
        requiredScope: "w3w:read",
      },
    },
  });
}
