import { NextRequest, NextResponse } from "next/server";

const CARRIERS = [
  { id: "kauvex-express", name: "Kauvex Express", coverage: ["NG", "GH", "KE", "ZA"], co2PerKg: 0.8, reliabilityBase: 94 },
  { id: "dhl", name: "DHL Express", coverage: ["NG", "GB", "US", "AE", "IN", "AU", "DE", "CA", "GH", "KE", "ZA", "SA", "BR", "JP", "FR"], co2PerKg: 1.2, reliabilityBase: 96 },
  { id: "fedex", name: "FedEx", coverage: ["NG", "GB", "US", "AE", "IN", "AU", "DE", "CA", "GH", "KE", "ZA", "SA", "BR", "JP", "FR"], co2PerKg: 1.1, reliabilityBase: 95 },
  { id: "aramex", name: "Aramex", coverage: ["NG", "AE", "SA", "IN", "GB", "US"], co2PerKg: 1.0, reliabilityBase: 91 },
  { id: "gig", name: "GIG Logistics", coverage: ["NG"], co2PerKg: 0.6, reliabilityBase: 89 },
  { id: "kwik", name: "Kwik Delivery", coverage: ["NG"], co2PerKg: 0.5, reliabilityBase: 87 },
  { id: "ups", name: "UPS", coverage: ["US", "GB", "DE", "CA", "AU", "IN", "AE", "SA", "BR", "JP", "FR"], co2PerKg: 1.3, reliabilityBase: 97 },
  { id: "ems", name: "EMS (Universal Postal)", coverage: ["NG", "GB", "US", "AE", "IN", "AU", "DE", "CA", "GH", "KE", "ZA", "SA", "BR", "JP", "FR"], co2PerKg: 0.9, reliabilityBase: 82 },
];

function detectCountry(city: string): string {
  const cityLower = city.toLowerCase();
  const map: Record<string, string[]> = {
    NG: ["lagos", "abuja", "port harcourt", "kano", "ibadan", "benin", "enugu", "calabar", "warri", "abuja"],
    GB: ["london", "manchester", "birmingham", "edinburgh", "glasgow", "liverpool", "bristol", "uk"],
    US: ["new york", "los angeles", "chicago", "houston", "miami", "san francisco", "seattle", "usa"],
    AE: ["dubai", "abu dhabi", "sharjah", "uae"],
    IN: ["mumbai", "delhi", "bangalore", "chennai", "india"],
    AU: ["sydney", "melbourne", "brisbane", "australia"],
    DE: ["berlin", "munich", "frankfurt", "hamburg", "germany"],
    CA: ["toronto", "vancouver", "montreal", "ottawa", "canada"],
    GH: ["accra", "kumasi", "ghana"],
    KE: ["nairobi", "mombasa", "kenya"],
    ZA: ["johannesburg", "cape town", "durban", "south africa"],
    SA: ["riyadh", "jeddah", "dammam", "saudi"],
    BR: ["sao paulo", "rio de Janeiro", "brazil"],
    JP: ["tokyo", "osaka", "yokohama", "japan"],
    FR: ["paris", "lyon", "marseille", "france"],
  };

  for (const [code, keywords] of Object.entries(map)) {
    if (keywords.some((kw) => cityLower.includes(kw))) return code;
  }
  return "NG";
}

function estimateDistance(origin: string, destination: string): number {
  const originCountry = detectCountry(origin);
  const destCountry = detectCountry(destination);
  if (originCountry === destCountry) return 300 + Math.random() * 700;
  return 2000 + Math.random() * 8000;
}

function calculateCarrierQuote(
  carrier: typeof CARRIERS[0],
  distanceKm: number,
  weightKg: number,
  serviceLevel: string,
  originCountry: string,
  destCountry: string
) {
  const coversOrigin = carrier.coverage.includes(originCountry);
  const coversDest = carrier.coverage.includes(destCountry);
  if (!coversOrigin || !coversDest) return null;

  const baseRate = distanceKm * 0.05 + weightKg * 2.5;
  const serviceMultiplier = serviceLevel === "express" ? 1.8 : serviceLevel === "same_day" ? 2.5 : serviceLevel === "economy" ? 0.7 : 1.0;
  const price = Math.round(baseRate * serviceMultiplier * 100) / 100;

  const speedDays = serviceLevel === "same_day" ? 0.5 : serviceLevel === "express" ? 1 : serviceLevel === "economy" ? 5 + Math.round(distanceKm / 1000) : 2 + Math.round(distanceKm / 2000);

  const reliability = Math.min(99, carrier.reliabilityBase + Math.round(Math.random() * 4 - 2));
  const co2 = Math.round(carrier.co2PerKg * weightKg * 10) / 10;

  return {
    carrier: carrier.name,
    carrierId: carrier.id,
    price,
    currency: "NGN",
    speedDays,
    speedLabel: speedDays <= 1 ? "Same Day/Next Day" : speedDays <= 3 ? "2-3 Days" : speedDays <= 5 ? "3-5 Days" : `${speedDays} Days`,
    reliability,
    co2,
    coverage: `${coversOrigin && coversDest ? "Full" : "Partial"}`,
    recommended: reliability >= 94 && price < 500,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, weight, length, width, height, serviceLevel } = body;

    if (!origin || !destination || !weight) {
      return NextResponse.json(
        { error: "origin, destination, and weight are required" },
        { status: 400 }
      );
    }

    const originCountry = detectCountry(origin);
    const destCountry = detectCountry(destination);
    const distanceKm = estimateDistance(origin, destination);
    const weightKg = Number(weight) || 1;

    const quotes = CARRIERS.map((carrier) =>
      calculateCarrierQuote(carrier, distanceKm, weightKg, serviceLevel || "standard", originCountry, destCountry)
    ).filter(Boolean);

    quotes.sort((a: any, b: any) => a.price - b.price);

    const cheapestIdx = 0;
    const fastestIdx = quotes.reduce((minIdx: number, q: any, i: number) =>
      q.speedDays < (quotes[minIdx] as any).speedDays ? i : minIdx, 0);

    const results = quotes.map((q: any, i: number) => ({
      ...q,
      isCheapest: i === cheapestIdx,
      isFastest: i === fastestIdx,
    }));

    return NextResponse.json({
      origin,
      destination,
      originCountry,
      destCountry,
      distanceKm: Math.round(distanceKm),
      weightKg,
      serviceLevel: serviceLevel || "standard",
      carriers: results,
      totalResults: results.length,
    });
  } catch (error: any) {
    console.error("[Multi-Carrier Compare]", error);
    return NextResponse.json(
      { error: error.message || "Failed to compare carriers" },
      { status: 500 }
    );
  }
}
