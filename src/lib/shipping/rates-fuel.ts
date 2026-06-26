import { prisma } from "@/lib/prisma";

export async function createFuelPrice(data: {
  countryCode: string;
  city: string;
  fuelType?: string;
  pricePerLitre: number;
  currencyCode: string;
  source?: string;
}) {
  return (prisma as any).kspFuelPrice.create({
    data: {
      countryCode: data.countryCode,
      city: data.city,
      fuelType: data.fuelType || "petrol",
      pricePerLitre: data.pricePerLitre,
      currencyCode: data.currencyCode,
      source: data.source,
    },
  });
}

export async function getFuelPrices(countryCode?: string, city?: string) {
  const where: any = {};
  if (countryCode) where.countryCode = countryCode;
  if (city) where.city = city;

  return (prisma as any).kspFuelPrice.findMany({
    where,
    orderBy: { recordedAt: "desc" },
    take: 100,
  });
}

export async function getLatestFuelPrices(countryCode: string) {
  const prices = await (prisma as any).kspFuelPrice.findMany({
    where: { countryCode },
    orderBy: { recordedAt: "desc" },
    distinct: ["city", "fuelType"],
  });

  const latest: Record<string, any> = {};
  for (const p of prices) {
    const key = `${p.city}-${p.fuelType}`;
    if (!latest[key]) latest[key] = p;
  }

  return Object.values(latest);
}

export async function getSmartRateCalendar(data: {
  originCountry: string;
  destCountry: string;
  originCity?: string;
  destCity?: string;
  startDate: string;
  endDate: string;
}) {
  return (prisma as any).kspSmartRateCalendar.findMany({
    where: {
      originCountry: data.originCountry,
      destinationCountry: data.destCountry,
      date: { gte: new Date(data.startDate), lte: new Date(data.endDate) },
    },
    orderBy: { date: "asc" },
  });
}

export async function calculateSmartRates(data: {
  originCountry: string;
  destCountry: string;
  originCity?: string;
  destCity?: string;
}) {
  const baseRate = data.originCountry === data.destCountry ? 1500 : 4500;
  const rates = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();

    let multiplier = 1;
    if (dayOfWeek === 0 || dayOfWeek === 6) multiplier *= 1.15;
    if (dayOfWeek === 5) multiplier *= 1.1;

    const month = date.getMonth();
    if (month === 10 || month === 11) multiplier *= 1.25;

    const rate = Math.round(baseRate * multiplier);
    rates.push({
      date: date.toISOString().split("T")[0],
      predictedRate: rate,
      cheapestDayOfWeek: dayOfWeek,
      rateFactors: {
        peak_season: multiplier > 1.15,
        weekend: dayOfWeek === 0 || dayOfWeek === 6,
      },
    });
  }

  return rates;
}

export async function getFuelImpactOnRoute(originCity: string, destCity: string, countryCode: string) {
  const latestPrices = await getLatestFuelPrices(countryCode);

  const priceChanges = latestPrices.map((p: any) => ({
    city: p.city,
    currentPrice: Number(p.pricePerLitre),
    fuelType: p.fuelType,
    recordedAt: p.recordedAt,
  }));

  return {
    originPrices: priceChanges.filter((p) => p.city === originCity),
    destPrices: priceChanges.filter((p) => p.city === destCity),
    routeImpact: priceChanges.length > 0 ? "Fuel prices may affect shipping rates on this route" : "No fuel data available",
  };
}
