import { prisma } from "@/lib/prisma";

export interface CarrierOption {
  carrierCode: string;
  carrierName: string;
  tier: string;
  isPrimary: boolean;
  estimatedDays: number | null;
  estimatedCost: number | null;
}

export async function selectCarrier(
  countryCode: string,
  tier: string,
  weightKg: number,
  serviceLevel: string = "standard",
  budgetPriority: boolean = false
): Promise<CarrierOption[]> {
  // Get active carriers for this country and tier
  const carriers = await (prisma as any).glxCountryCarrier.findMany({
    where: { countryCode, tier, isActive: true },
    orderBy: { isPrimary: "desc" },
  });

  if (carriers.length === 0) return [];

  // Get rate cards to estimate costs
  const rateCards = await (prisma as any).glxRateCard.findMany({
    where: { countryCode, tier, serviceLevel, isActive: true },
    orderBy: { baseRate: budgetPriority ? "asc" : "desc" },
  });

  const options: CarrierOption[] = carriers.map((carrier: any) => {
    const matchingCard = rateCards.find(
      (rc: any) => weightKg >= Number(rc.weightMinKg) && weightKg <= Number(rc.weightMaxKg)
    );

    const estimatedCost = matchingCard
      ? Number(matchingCard.baseRate) + Number(matchingCard.perKgRate) * weightKg
      : null;

    return {
      carrierCode: carrier.carrierCode,
      carrierName: carrier.carrierName,
      tier: carrier.tier,
      isPrimary: carrier.isPrimary,
      estimatedDays: getEstimatedDays(tier, serviceLevel),
      estimatedCost: estimatedCost ? Math.round(estimatedCost * 100) / 100 : null,
    };
  });

  // Sort by budget or speed
  if (budgetPriority) {
    options.sort((a, b) => (a.estimatedCost ?? Infinity) - (b.estimatedCost ?? Infinity));
  } else {
    options.sort((a, b) => (a.estimatedDays ?? Infinity) - (b.estimatedDays ?? Infinity));
  }

  return options;
}

function getEstimatedDays(tier: string, serviceLevel: string): number {
  if (tier === "tier_1_local") {
    if (serviceLevel === "same_day") return 0;
    if (serviceLevel === "express") return 1;
    return 2;
  }
  if (tier === "tier_2_domestic") {
    if (serviceLevel === "express") return 2;
    return 3;
  }
  if (tier === "tier_3_international") {
    if (serviceLevel === "express") return 3;
    if (serviceLevel === "standard") return 7;
    return 14;
  }
  return 5;
}

export async function getCarrierStatus(countryCode: string) {
  const carriers = await (prisma as any).glxCountryCarrier.findMany({
    where: { countryCode },
    orderBy: { isPrimary: "desc" },
  });

  return carriers.map((c: any) => ({
    carrierCode: c.carrierCode,
    carrierName: c.carrierName,
    tier: c.tier,
    isPrimary: c.isPrimary,
    isActive: c.isActive,
    testMode: c.testMode,
    lastTested: c.lastTested,
  }));
}
