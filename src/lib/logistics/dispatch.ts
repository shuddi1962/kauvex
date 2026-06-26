import crypto from "crypto";
import { prisma } from "@/lib/prisma";

type DeliveryTier = "TIER_1_LOCAL" | "TIER_2_DOMESTIC_FREIGHT" | "TIER_3_INTERNATIONAL";

interface PackageDetails {
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  declaredValue?: number;
  containsBatteries?: boolean;
  containsLiquids?: boolean;
  tempSensitive?: boolean;
  isHighValue?: boolean;
}

interface DispatchInput {
  pickupCountry: string;
  pickupCity: string;
  dropoffCountry: string;
  dropoffCity: string;
  distanceKm?: number;
  packageDetails: PackageDetails;
}

interface DispatchResult {
  tier: DeliveryTier;
  tierLabel: string;
  description: string;
  routesToPartnerPool: boolean;
  routesToCarrierAPI: boolean;
  countryCode: string;
  carrierFallbackOrder: string[];
  iossRequired: boolean;
  ddpRequired: boolean;
  codAvailable: boolean;
  codLimit: number | null;
  w3wRecommended: boolean;
  fallback?: string;
}

const TIER_LABELS: Record<DeliveryTier, string> = {
  TIER_1_LOCAL: "Local Delivery",
  TIER_2_DOMESTIC_FREIGHT: "Domestic Freight",
  TIER_3_INTERNATIONAL: "International Shipping",
};

const TIER_DESCRIPTIONS: Record<DeliveryTier, string> = {
  TIER_1_LOCAL: "Same-city or within-radius delivery via local partners",
  TIER_2_DOMESTIC_FREIGHT: "Inter-city domestic freight via consolidated carriers",
  TIER_3_INTERNATIONAL: "Cross-border shipping via major carrier APIs (DHL, FedEx, UPS, Aramex)",
};

const DEFAULT_TIER1_RADIUS: Record<string, number> = {
  NG: 60, GH: 50, KE: 50, ZA: 80, US: 40, GB: 50, DE: 50, AU: 60,
  AE: 40, IN: 50, CA: 80, SA: 50, BR: 80, JP: 50, FR: 50,
};

const CARRIER_FALLBACK: Record<string, string[]> = {
  NG: ["gig", "kwik", "sendbox", "dhl_ng", "dhl_intl"],
  GB: ["royal_mail", "evri", "dpd_uk", "dhl_uk"],
  US: ["usps", "ups", "fedex_ground"],
  IN: ["delhivery", "bluedart", "dtdc"],
  AU: ["auspost", "startrack"],
  AE: ["aramex_uae", "emirates_post"],
  DE: ["dhl_paket", "dpd_de", "gls"],
  DEFAULT: ["dhl", "fedex", "aramex"],
};

export async function determineTier(input: DispatchInput): Promise<DispatchResult> {
  const { pickupCountry, dropoffCountry, pickupCity, dropoffCity, distanceKm } = input;

  // Fetch country config from DB (with fallback to defaults)
  const [pickupConfig, dropoffConfig] = await Promise.all([
    getCountryTierConfig(pickupCountry),
    pickupCountry !== dropoffCountry ? getCountryTierConfig(dropoffCountry) : null,
  ]);

  const tier1Radius = pickupConfig?.tier1RadiusKm ?? DEFAULT_TIER1_RADIUS[pickupCountry] ?? 60;

  // TIER 3: International (different countries)
  if (pickupCountry !== dropoffCountry) {
    const iossRequired = pickupConfig?.continent === "Europe" || dropoffConfig?.continent === "Europe";
    const ddpRequired = dropoffConfig?.ddpRequired ?? false;

    return {
      tier: "TIER_3_INTERNATIONAL",
      tierLabel: TIER_LABELS.TIER_3_INTERNATIONAL,
      description: TIER_DESCRIPTIONS.TIER_3_INTERNATIONAL,
      routesToPartnerPool: false,
      routesToCarrierAPI: true,
      countryCode: pickupCountry,
      carrierFallbackOrder: CARRIER_FALLBACK[pickupCountry] || CARRIER_FALLBACK.DEFAULT,
      iossRequired,
      ddpRequired,
      codAvailable: false,
      codLimit: null,
      w3wRecommended: false,
    };
  }

  // TIER 2: Domestic freight (different city OR distance exceeds radius)
  if (pickupCity !== dropoffCity || (distanceKm !== undefined && distanceKm > tier1Radius)) {
    return {
      tier: "TIER_2_DOMESTIC_FREIGHT",
      tierLabel: TIER_LABELS.TIER_2_DOMESTIC_FREIGHT,
      description: TIER_DESCRIPTIONS.TIER_2_DOMESTIC_FREIGHT,
      routesToPartnerPool: false,
      routesToCarrierAPI: true,
      countryCode: pickupCountry,
      carrierFallbackOrder: CARRIER_FALLBACK[pickupCountry] || CARRIER_FALLBACK.DEFAULT,
      iossRequired: false,
      ddpRequired: false,
      codAvailable: pickupConfig?.codAvailable ?? false,
      codLimit: pickupConfig?.codLimit ?? null,
      w3wRecommended: pickupConfig?.w3wEnabled ?? false,
    };
  }

  // TIER 1: Local delivery (same city, within radius)
  return {
    tier: "TIER_1_LOCAL",
    tierLabel: TIER_LABELS.TIER_1_LOCAL,
    description: TIER_DESCRIPTIONS.TIER_1_LOCAL,
    routesToPartnerPool: true,
    routesToCarrierAPI: true,
    countryCode: pickupCountry,
    carrierFallbackOrder: CARRIER_FALLBACK[pickupCountry] || CARRIER_FALLBACK.DEFAULT,
    iossRequired: false,
    ddpRequired: false,
    codAvailable: pickupConfig?.codAvailable ?? false,
    codLimit: pickupConfig?.codLimit ?? null,
    w3wRecommended: pickupConfig?.w3wEnabled ?? false,
  };
}

async function getCountryTierConfig(countryCode: string) {
  try {
    const country = await (prisma as any).glxCountry.findUnique({
      where: { countryCode },
      select: {
        tier1RadiusKm: true,
        codAvailable: true,
        codLimit: true,
        w3wEnabled: true,
        ddpRequired: true,
        continent: true,
      },
    });
    return country;
  } catch {
    return null;
  }
}

export async function calculateShippingFeeGlobal(
  countryCode: string,
  tier: string,
  weightKg: number,
  serviceLevel: string = "standard"
): Promise<{ fee: number; currency: string; breakdown: string; carrierSuggestion: string } | null> {
  try {
    const cards = await (prisma as any).glxRateCard.findMany({
      where: { countryCode, tier, serviceLevel, isActive: true },
      orderBy: { baseRate: "asc" },
    });

    if (cards.length === 0) return null;

    const matchingCard = cards.find(
      (c: any) => weightKg >= Number(c.weightMinKg) && weightKg <= Number(c.weightMaxKg)
    );

    if (!matchingCard) return null;

    const baseRate = Number(matchingCard.baseRate);
    const perKg = Number(matchingCard.perKgRate);
    const fee = baseRate + perKg * weightKg;

    // Get primary carrier for this tier
    const carriers = await (prisma as any).glxCountryCarrier.findMany({
      where: { countryCode, tier, isActive: true },
      orderBy: { isPrimary: "desc" },
      take: 1,
    });

    return {
      fee: Math.round(fee * 100) / 100,
      currency: matchingCard.currencyCode,
      breakdown: `${matchingCard.currencyCode} ${baseRate} base + ${perKg}/kg x ${weightKg}kg`,
      carrierSuggestion: carriers[0]?.carrierName || "Platform default",
    };
  } catch {
    return null;
  }
}

export function getTier1Radius(countryCode: string): number {
  return DEFAULT_TIER1_RADIUS[countryCode] ?? 60;
}

export function calculateDimensionalWeight(lengthCm: number, widthCm: number, heightCm: number, divisor: number = 5000): number {
  return (lengthCm * widthCm * heightCm) / divisor;
}

export function calculateChargeableWeight(actualKg: number, dimWeightKg: number): number {
  return Math.max(actualKg, dimWeightKg);
}

export function generateJobNumber(type: "order" | "express"): string {
  const prefix = type === "order" ? "ORD" : "EXP";
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `KVX-${prefix}-${random}`;
}

export function generateDeliveryPin(): string {
  const digits = crypto.randomInt(0, 1000000);
  return String(digits).padStart(6, "0");
}

export type { DeliveryTier, PackageDetails, DispatchInput, DispatchResult };
