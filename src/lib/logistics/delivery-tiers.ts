type DeliveryTier = 'TIER_1_LOCAL' | 'TIER_2_DOMESTIC_FREIGHT' | 'TIER_3_INTERNATIONAL';

export interface TierConfig {
  tier: DeliveryTier;
  label: string;
  description: string;
  maxWeightKg: number;
  vehicleTypes: string[];
  documentType: string;
  documentDescription: string;
  transitTimeEstimate: string;
  supportsTracking: boolean;
  supportsInsurance: boolean;
}

export const TIER_CONFIGS: Record<DeliveryTier, TierConfig> = {
  TIER_1_LOCAL: {
    tier: 'TIER_1_LOCAL',
    label: 'Local Delivery',
    description: 'Same-city or within-radius delivery via local logistics partners',
    maxWeightKg: 50,
    vehicleTypes: ['motorcycle', 'bicycle', 'car', 'van'],
    documentType: 'Shipping Label',
    documentDescription: 'Standard shipping label for marketplace orders within local zone',
    transitTimeEstimate: '1–4 hours',
    supportsTracking: true,
    supportsInsurance: false,
  },
  TIER_2_DOMESTIC_FREIGHT: {
    tier: 'TIER_2_DOMESTIC_FREIGHT',
    label: 'Domestic Freight',
    description: 'Inter-city domestic freight via consolidated carriers and freight forwarders',
    maxWeightKg: 1000,
    vehicleTypes: ['van', 'truck', 'lorry', 'container_truck'],
    documentType: 'Consignment Note',
    documentDescription: 'Consignment note for domestic freight movement between cities',
    transitTimeEstimate: '1–5 business days',
    supportsTracking: true,
    supportsInsurance: true,
  },
  TIER_3_INTERNATIONAL: {
    tier: 'TIER_3_INTERNATIONAL',
    label: 'International Shipping',
    description: 'Cross-border shipping via major carrier APIs (DHL, FedEx, UPS, Aramex)',
    maxWeightKg: 5000,
    vehicleTypes: ['aircraft', 'cargo_ship', 'container_truck'],
    documentType: 'Air Waybill / Bill of Lading',
    documentDescription: 'Air Waybill (AWB) for air freight or Bill of Lading (BOL) for sea freight',
    transitTimeEstimate: '3–21 business days',
    supportsTracking: true,
    supportsInsurance: true,
  },
};

export const TIER_VEHICLE_MAP: Record<string, string[]> = {
  motorcycle: ['TIER_1_LOCAL'],
  bicycle: ['TIER_1_LOCAL'],
  car: ['TIER_1_LOCAL'],
  van: ['TIER_1_LOCAL', 'TIER_2_DOMESTIC_FREIGHT'],
  truck: ['TIER_2_DOMESTIC_FREIGHT'],
  lorry: ['TIER_2_DOMESTIC_FREIGHT'],
  container_truck: ['TIER_2_DOMESTIC_FREIGHT', 'TIER_3_INTERNATIONAL'],
  aircraft: ['TIER_3_INTERNATIONAL'],
  cargo_ship: ['TIER_3_INTERNATIONAL'],
};

export function getTierConfig(tier: DeliveryTier): TierConfig {
  return TIER_CONFIGS[tier];
}

export function getDocumentTypeForTier(tier: DeliveryTier): string {
  return TIER_CONFIGS[tier].documentType;
}

export function getVehicleTypesForTier(tier: DeliveryTier): string[] {
  return TIER_CONFIGS[tier].vehicleTypes;
}

export type { DeliveryTier };
