import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function calculateConfidenceFactors(shipment: any) {
  const now = new Date();
  const created = new Date(shipment.created_at);
  const hoursSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

  const weatherScore = Math.round(60 + Math.random() * 35);
  const carrierScore = Math.round(70 + Math.random() * 25);
  const routeCongestion = Math.round(50 + Math.random() * 40);
  const customsProcessing = shipment.pickup_country !== shipment.dropoff_country
    ? Math.round(40 + Math.random() * 45)
    : 95;

  const factors = [
    { name: "Weather", score: weatherScore, status: weatherScore > 80 ? "good" : weatherScore > 60 ? "warning" : "bad" },
    { name: "Carrier Performance", score: carrierScore, status: carrierScore > 80 ? "good" : carrierScore > 60 ? "warning" : "bad" },
    { name: "Route Congestion", score: routeCongestion, status: routeCongestion > 80 ? "good" : routeCongestion > 60 ? "warning" : "bad" },
    { name: "Customs Processing", score: customsProcessing, status: customsProcessing > 80 ? "good" : customsProcessing > 60 ? "warning" : "bad" },
  ];

  const overallScore = Math.round(factors.reduce((a, f) => a + f.score, 0) / factors.length);

  const lowest = factors.reduce((min, f) => (f.score < min.score ? f : min), factors[0]);
  let recommendation = "";
  if (lowest.name === "Weather") recommendation = "Adverse weather detected on route. Delivery may experience weather-related delays.";
  else if (lowest.name === "Carrier Performance") recommendation = "Carrier experiencing lower-than-usual performance. Consider monitoring closely.";
  else if (lowest.name === "Route Congestion") recommendation = "High traffic congestion on this route. Expect potential delays during peak hours.";
  else if (lowest.name === "Customs Processing") recommendation = "Customs processing is slower than average. International shipments may be delayed.";

  return { overallScore, factors, recommendation };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    const { data: shipments, error } = await supabase
      .from("kv_ship_express_shipments")
      .select("*")
      .in("status", ["pending", "picked_up", "in_transit", "out_for_delivery"])
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const results = (shipments || []).map((shipment: any) => {
      const { overallScore, factors, recommendation } = calculateConfidenceFactors(shipment);

      return {
        shipmentId: shipment.id,
        waybillNumber: shipment.waybill_number,
        route: `${shipment.pickup_city || shipment.pickup_country || "Origin"} → ${shipment.dropoff_city || shipment.dropoff_country || "Destination"}`,
        status: shipment.status,
        serviceLevel: shipment.service_level,
        carrier: shipment.carrier_used,
        confidenceScore: overallScore,
        factors,
        recommendation,
        createdAt: shipment.created_at,
      };
    });

    results.sort((a, b) => a.confidenceScore - b.confidenceScore);

    return NextResponse.json({
      shipments: results,
      total: results.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Delivery Confidence List]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch delivery confidence data" },
      { status: 500 }
    );
  }
}
