import { prisma } from "@/lib/prisma";

export interface CountryConfig {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  currencySymbol: string;
  tier1RadiusKm: number;
  vatRate: number;
  importDutyGeneral: number;
  deMinimisValue: number;
  codAvailable: boolean;
  codLimit: number | null;
  sundayDelivery: boolean;
  fridayDelivery: boolean;
  gigWorkerClassification: string;
  legalReviewStatus: string;
  isLive: boolean;
  timezone: string | null;
}

export async function getCountryConfig(countryCode: string): Promise<CountryConfig | null> {
  const country = await (prisma as any).glxCountry.findUnique({
    where: { countryCode },
  });
  return country as CountryConfig | null;
}

export async function getAllCountries(): Promise<CountryConfig[]> {
  const countries = await (prisma as any).glxCountry.findMany({
    orderBy: { countryName: "asc" },
  });
  return countries as CountryConfig[];
}

export async function getLiveCountries(): Promise<CountryConfig[]> {
  const countries = await (prisma as any).glxCountry.findMany({
    where: { isLive: true },
    orderBy: { countryName: "asc" },
  });
  return countries as CountryConfig[];
}

export async function updateCountryConfig(countryCode: string, data: Partial<CountryConfig>) {
  return (prisma as any).glxCountry.upsert({
    where: { countryCode },
    create: {
      countryCode,
      countryName: data.countryName || countryCode,
      currencyCode: data.currencyCode || "USD",
      ...data,
    },
    update: data,
  });
}

export async function getCountryCarriers(countryCode: string, tier?: string) {
  const where: any = { countryCode, isActive: true };
  if (tier) where.tier = tier;
  return (prisma as any).glxCountryCarrier.findMany({
    where,
    orderBy: { isPrimary: "desc" },
  });
}

export async function getRateCards(countryCode: string, tier?: string, serviceLevel?: string) {
  const where: any = { countryCode, isActive: true };
  if (tier) where.tier = tier;
  if (serviceLevel) where.serviceLevel = serviceLevel;
  return (prisma as any).glxRateCard.findMany({
    where,
    orderBy: { baseRate: "asc" },
  });
}

export async function calculateShippingFee(
  countryCode: string,
  tier: string,
  weightKg: number,
  serviceLevel: string = "standard"
): Promise<{ fee: number; currency: string; breakdown: string } | null> {
  const cards = await getRateCards(countryCode, tier, serviceLevel);
  if (cards.length === 0) return null;

  const matchingCard = cards.find(
    (c: any) => weightKg >= Number(c.weightMinKg) && weightKg <= Number(c.weightMaxKg)
  );

  if (!matchingCard) return null;

  const baseRate = Number(matchingCard.baseRate);
  const perKgRate = Number(matchingCard.perKgRate);
  const fee = baseRate + perKgRate * weightKg;

  return {
    fee: Math.round(fee * 100) / 100,
    currency: matchingCard.currencyCode,
    breakdown: `${matchingCard.currencyCode} ${baseRate} base + ${perKgRate}/kg × ${weightKg}kg`,
  };
}
