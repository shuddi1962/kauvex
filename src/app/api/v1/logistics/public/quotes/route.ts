import { NextResponse } from "next/server";
import { validateApiKey, checkScope } from "@/lib/logistics/api-auth";
import { determineTier, calculateShippingFeeGlobal } from "@/lib/logistics/dispatch";

export async function POST(request: Request) {
  const auth = await validateApiKey(request.headers.get("Authorization"));
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!checkScope(auth, "quotes:read") && !checkScope(auth, "*")) {
    return NextResponse.json({ error: "Insufficient permissions. Required scope: quotes:read" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { pickupCountry, pickupCity, dropoffCountry, dropoffCity, weightKg, lengthCm, widthCm, heightCm, declaredValue } = body;

    if (!pickupCountry || !dropoffCountry) {
      return NextResponse.json({ error: "pickupCountry and dropoffCountry are required" }, { status: 400 });
    }

    const tierResult = await determineTier({
      pickupCountry,
      pickupCity: pickupCity || "Unknown",
      dropoffCountry,
      dropoffCity: dropoffCity || "Unknown",
      packageDetails: {
        weightKg: weightKg || 1,
        lengthCm,
        widthCm,
        heightCm,
        declaredValue,
      },
    });

    const standardFee = await calculateShippingFeeGlobal(pickupCountry, tierResult.tier, weightKg || 1, "standard");
    const expressFee = await calculateShippingFeeGlobal(pickupCountry, tierResult.tier, weightKg || 1, "express");
    const economyFee = await calculateShippingFeeGlobal(pickupCountry, tierResult.tier, weightKg || 1, "economy");

    const quotes = [];
    if (standardFee) quotes.push({ service: "standard", ...standardFee, estimatedDays: getEstimateDays(tierResult.tier, "standard") });
    if (expressFee) quotes.push({ service: "express", ...expressFee, estimatedDays: getEstimateDays(tierResult.tier, "express") });
    if (economyFee) quotes.push({ service: "economy", ...economyFee, estimatedDays: getEstimateDays(tierResult.tier, "economy") });

    if (quotes.length === 0) {
      return NextResponse.json({ error: "No shipping options available for this route" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        tier: tierResult.tier,
        tierLabel: tierResult.tierLabel,
        quotes,
        w3wRecommended: tierResult.w3wRecommended,
        codAvailable: tierResult.codAvailable,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to calculate quotes" }, { status: 500 });
  }
}

function getEstimateDays(tier: string, service: string): string {
  const map: Record<string, Record<string, string>> = {
    TIER_1_LOCAL: { economy: "2-3 days", standard: "Same day", express: "1-3 hours" },
    TIER_2_DOMESTIC_FREIGHT: { economy: "3-7 days", standard: "1-3 days", express: "Same day" },
    TIER_3_INTERNATIONAL: { economy: "10-20 days", standard: "5-10 days", express: "2-5 days" },
  };
  return map[tier]?.[service] || "Contact support";
}
