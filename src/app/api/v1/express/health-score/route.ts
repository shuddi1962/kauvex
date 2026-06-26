import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function calculateHealthFactors(shipment: any) {
  const packagingScore = shipment.pack_for_me
    ? 92
    : shipment.contents_type === "Electronics" || shipment.contents_type === "Fragile"
      ? 45
      : 70;

  const insuranceScore = shipment.insurance_purchased ? 95 : 20;

  const addressQuality = shipment.pickup_address && shipment.dropoff_address && shipment.pickup_lat
    ? 88
    : 55;

  const routeReliability = shipment.service_level === "express"
    ? 90
    : shipment.service_level === "same_day"
      ? 95
      : 72;

  const hoursSinceCreated = (new Date().getTime() - new Date(shipment.created_at).getTime()) / (1000 * 60 * 60);
  const timeSensitivity = hoursSinceCreated < 6 ? 85 : hoursSinceCreated < 24 ? 70 : 50;

  const factors = [
    { name: "Packaging Adequacy", score: packagingScore, color: packagingScore > 80 ? "#10B981" : packagingScore > 60 ? "#F59E0B" : "#EF4444" },
    { name: "Insurance Coverage", score: insuranceScore, color: insuranceScore > 80 ? "#10B981" : insuranceScore > 60 ? "#F59E0B" : "#EF4444" },
    { name: "Address Quality", score: addressQuality, color: addressQuality > 80 ? "#10B981" : addressQuality > 60 ? "#F59E0B" : "#EF4444" },
    { name: "Route Reliability", score: routeReliability, color: routeReliability > 80 ? "#10B981" : routeReliability > 60 ? "#F59E0B" : "#EF4444" },
    { name: "Time Sensitivity", score: timeSensitivity, color: timeSensitivity > 80 ? "#10B981" : timeSensitivity > 60 ? "#F59E0B" : "#EF4444" },
  ];

  const overallScore = Math.round(factors.reduce((a, f) => a + f.score, 0) / factors.length);

  const suggestions: string[] = [];
  if (packagingScore < 70) {
    suggestions.push("Your packaging choice may not protect this item adequately. Consider upgrading to reinforced packaging.");
  }
  if (!shipment.insurance_purchased) {
    suggestions.push("This shipment has no insurance. Add coverage to protect against loss or damage.");
  }
  if (addressQuality < 70) {
    suggestions.push("Address details are incomplete. Full addresses reduce delivery failures by 40%.");
  }
  if (routeReliability < 75) {
    suggestions.push("This route has historically lower reliability. Consider express service for critical shipments.");
  }
  if (timeSensitivity < 60) {
    suggestions.push("This shipment has been in transit longer than optimal. Monitor for potential delays.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Your shipment health is excellent. No immediate actions needed.");
  }

  return { overallScore, factors, suggestions };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json().catch(() => ({}));

    const limit = body.limit || 50;

    const { data: shipments, error } = await supabase
      .from("kv_ship_express_shipments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const results = (shipments || []).map((shipment: any) => {
      const { overallScore, factors, suggestions } = calculateHealthFactors(shipment);

      return {
        shipmentId: shipment.id,
        waybillNumber: shipment.waybill_number,
        route: `${shipment.pickup_city || shipment.pickup_country || "Origin"} → ${shipment.dropoff_city || shipment.dropoff_country || "Destination"}`,
        status: shipment.status,
        serviceLevel: shipment.service_level,
        healthScore: overallScore,
        factors,
        suggestions,
        createdAt: shipment.created_at,
      };
    });

    const accountHealth = results.length > 0
      ? Math.round(results.reduce((a, r) => a + r.healthScore, 0) / results.length)
      : 0;

    return NextResponse.json({
      shipments: results,
      accountHealthScore: accountHealth,
      total: results.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Health Score]", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate health scores" },
      { status: 500 }
    );
  }
}
