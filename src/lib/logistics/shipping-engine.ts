"use server";

interface ShippingItem {
  sku: string;
  quantity: number;
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  declaredValue?: number;
  vendorId: string;
}

interface ShippingProfile {
  id: string;
  vendorId: string;
  name: string;
  freeShippingThreshold?: number;
  baseRate: number;
  ratePerKg: number;
  handlingFee: number;
  dimensionalFactor?: number;
  availableCarriers?: string[];
}

interface Destination {
  country: string;
  city: string;
  postalCode?: string;
}

interface ShippingOption {
  carrier: string;
  serviceName: string;
  price: number;
  currency: string;
  estimatedDays: number;
  isTracked: boolean;
  isInsured: boolean;
}

interface FreeShippingResult {
  freeShipping: boolean;
  remainingForFree?: number;
}

export function calculateDimensionalWeight(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  divisor: number = 5000
): number {
  return (lengthCm * widthCm * heightCm) / divisor;
}

export function checkFreeShippingThreshold(
  subtotal: number,
  threshold: number | undefined | null
): FreeShippingResult {
  if (!threshold || threshold <= 0) {
    return { freeShipping: false };
  }

  if (subtotal >= threshold) {
    return { freeShipping: true };
  }

  return {
    freeShipping: false,
    remainingForFree: +(threshold - subtotal).toFixed(2),
  };
}

async function getFlatRate(
  profile: ShippingProfile,
  totalChargeableWeight: number,
  destination: Destination
): Promise<ShippingOption[]> {
  const estimatedDays = destination.country === 'NG' ? '1–3' : '5–14';

  return [
    {
      carrier: 'kauvex',
      serviceName: profile.name,
      price: profile.baseRate + profile.ratePerKg * totalChargeableWeight + profile.handlingFee,
      currency: 'NGN',
      estimatedDays: 3,
      isTracked: true,
      isInsured: false,
    },
  ];
}

async function getCarrierRates(
  profile: ShippingProfile,
  totalChargeableWeight: number,
  destination: Destination
): Promise<ShippingOption[]> {
  const rates: ShippingOption[] = [];

  if (!profile.availableCarriers || profile.availableCarriers.length === 0) {
    return rates;
  }

  for (const carrierCode of profile.availableCarriers) {
    try {
      const { getCarrier } = await import('@/lib/shipping');
      const carrier = await getCarrier(carrierCode);
      const carrierRates = await carrier.getRates({
        origin: { country: 'NG', city: 'Lagos', postalCode: '', address: '' },
        destination: {
          country: destination.country,
          city: destination.city,
          postalCode: destination.postalCode || '',
          address: '',
        },
        weight: totalChargeableWeight,
        items: [],
      });

      rates.push(
        ...carrierRates.map((r) => ({
          carrier: r.carrier,
          serviceName: r.serviceName,
          price: r.price + profile.handlingFee,
          currency: r.currency,
          estimatedDays: r.estimatedDays,
          isTracked: r.isTracked,
          isInsured: r.isInsured,
        }))
      );
    } catch {
      continue;
    }
  }

  return rates.sort((a, b) => a.price - b.price);
}

export async function calculateShippingCost(
  profile: ShippingProfile,
  items: ShippingItem[],
  destination: Destination
): Promise<ShippingOption[]> {
  const subtotal = items.reduce((sum, item) => sum + (item.declaredValue || 0) * item.quantity, 0);
  const { freeShipping } = checkFreeShippingThreshold(subtotal, profile.freeShippingThreshold);

  if (freeShipping) {
    return [
      {
        carrier: 'kauvex',
        serviceName: 'Free Shipping',
        price: 0,
        currency: 'NGN',
        estimatedDays: 5,
        isTracked: true,
        isInsured: false,
      },
    ];
  }

  let totalActualWeight = 0;
  let totalDimWeight = 0;

  for (const item of items) {
    totalActualWeight += item.weightKg * item.quantity;
    if (item.lengthCm && item.widthCm && item.heightCm) {
      const dimWeight = calculateDimensionalWeight(
        item.lengthCm,
        item.widthCm,
        item.heightCm,
        profile.dimensionalFactor
      );
      totalDimWeight += dimWeight * item.quantity;
    }
  }

  const totalChargeableWeight = Math.max(totalActualWeight, totalDimWeight);

  if (profile.availableCarriers && profile.availableCarriers.length > 0) {
    return getCarrierRates(profile, totalChargeableWeight, destination);
  }

  return getFlatRate(profile, totalChargeableWeight, destination);
}

export type { ShippingItem, ShippingProfile, Destination, ShippingOption, FreeShippingResult };
