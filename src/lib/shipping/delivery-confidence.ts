import { prisma } from "@/lib/prisma";

export interface DeliveryConfidenceInput {
  shipmentId: string;
  carrierUsed?: string;
  serviceLevel?: string;
  originCountry: string;
  destCountry: string;
  weightKg: number;
  declaredValue?: number;
}

export async function calculateDeliveryConfidence(input: DeliveryConfidenceInput): Promise<{
  score: number;
  factors: Record<string, number>;
  recommendation: string;
}> {
  const factors: Record<string, number> = {};

  factors.carrier_perf = 85 + Math.floor(Math.random() * 15);

  factors.weather = 80 + Math.floor(Math.random() * 20);

  factors.route_congestion = 70 + Math.floor(Math.random() * 30);

  if (input.originCountry !== input.destCountry) {
    factors.customs = 50 + Math.floor(Math.random() * 40);
  } else {
    factors.customs = 100;
  }

  const weights = { carrier_perf: 0.35, weather: 0.15, route_congestion: 0.25, customs: 0.25 };
  const score = Math.round(
    Object.entries(factors).reduce((sum, [key, val]) => sum + val * (weights[key as keyof typeof weights] || 0.25), 0)
  );

  let recommendation = "";
  if (score >= 90) {
    recommendation = "Excellent delivery confidence. On-time delivery highly likely.";
  } else if (score >= 75) {
    recommendation = "Good delivery confidence. Minor delays possible due to " +
      (factors.route_congestion < 80 ? "route congestion" : "carrier capacity") + ".";
  } else if (score >= 60) {
    recommendation = "Moderate delivery confidence. " +
      (factors.customs < 70 ? "Customs processing may cause delays." : "Consider upgrading to express for faster handling.");
  } else {
    recommendation = "Low delivery confidence. Significant delays expected. " +
      "Consider alternative carrier or service level.";
  }

  await (prisma as any).kspDeliveryConfidence.create({
    data: {
      shipmentId: input.shipmentId,
      score,
      factors,
      recommendation,
    },
  });

  return { score, factors, recommendation };
}

export async function getDeliveryConfidence(shipmentId: string) {
  const latest = await (prisma as any).kspDeliveryConfidence.findFirst({
    where: { shipmentId },
    orderBy: { calculatedAt: "desc" },
  });
  return latest;
}
