import crypto from "crypto";

const TIER1_RADIUS_KM: Record<string, number> = {
  NG: 60,
  GH: 50,
  KE: 50,
  ZA: 80,
  US: 40,
  GB: 50,
  DEFAULT: 60,
};

type DeliveryTier = 'TIER_1_LOCAL' | 'TIER_2_DOMESTIC_FREIGHT' | 'TIER_3_INTERNATIONAL';

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

export function determineTier(input: DispatchInput): DispatchResult {
  const { pickupCountry, dropoffCountry, pickupCity, dropoffCity, distanceKm } = input;

  if (pickupCountry !== dropoffCountry) {
    return {
      tier: 'TIER_3_INTERNATIONAL',
      tierLabel: TIER_LABELS.TIER_3_INTERNATIONAL,
      description: TIER_DESCRIPTIONS.TIER_3_INTERNATIONAL,
      routesToPartnerPool: false,
      routesToCarrierAPI: true,
    };
  }

  const radius = getTier1Radius(pickupCountry);

  if (pickupCity !== dropoffCity || (distanceKm !== undefined && distanceKm > radius)) {
    return {
      tier: 'TIER_2_DOMESTIC_FREIGHT',
      tierLabel: TIER_LABELS.TIER_2_DOMESTIC_FREIGHT,
      description: TIER_DESCRIPTIONS.TIER_2_DOMESTIC_FREIGHT,
      routesToPartnerPool: false,
      routesToCarrierAPI: true,
    };
  }

  return {
    tier: 'TIER_1_LOCAL',
    tierLabel: TIER_LABELS.TIER_1_LOCAL,
    description: TIER_DESCRIPTIONS.TIER_1_LOCAL,
    routesToPartnerPool: true,
    routesToCarrierAPI: true,
  };
}

export function getTier1Radius(countryCode: string): number {
  return TIER1_RADIUS_KM[countryCode] ?? TIER1_RADIUS_KM.DEFAULT;
}

export function calculateDimensionalWeight(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  divisor: number = 5000
): number {
  return (lengthCm * widthCm * heightCm) / divisor;
}

export function calculateChargeableWeight(actualKg: number, dimWeightKg: number): number {
  return Math.max(actualKg, dimWeightKg);
}

export function generateJobNumber(type: 'order' | 'express'): string {
  const prefix = type === 'order' ? 'ORD' : 'EXP';
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `KVX-${prefix}-${random}`;
}

export function generateDeliveryPin(): string {
  const digits = crypto.randomInt(0, 1000000);
  return String(digits).padStart(6, '0');
}

export type { DeliveryTier, PackageDetails, DispatchInput, DispatchResult };
