import { NextRequest, NextResponse } from "next/server";
import { getAllCarriers } from "@/lib/shipping";

const BASE_RATES: Record<string, { economy: number; standard: number; express: number; sameDay: number }> = {
  NG: { economy: 2500, standard: 4500, express: 8500, sameDay: 12000 },
  GH: { economy: 30, standard: 55, express: 100, sameDay: 150 },
  KE: { economy: 500, standard: 900, express: 1800, sameDay: 2500 },
  US: { economy: 15, standard: 25, express: 45, sameDay: 0 },
  GB: { economy: 12, standard: 20, express: 38, sameDay: 0 },
  DEFAULT: { economy: 2000, standard: 4000, express: 7500, sameDay: 10000 },
};

function getBaseRate(country: string, serviceLevel: string): number {
  const rates = BASE_RATES[country] || BASE_RATES.DEFAULT;
  switch (serviceLevel) {
    case "economy": return rates.economy;
    case "standard": return rates.standard;
    case "express": return rates.express;
    case "same_day": return rates.sameDay;
    default: return rates.standard;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      originCountry = "NG",
      destCountry = "NG",
      weightKg = 1,
      declaredValue = 0,
      lengthCm,
      widthCm,
      heightCm,
    } = body;

    const dimWeight = lengthCm && widthCm && heightCm
      ? (lengthCm * widthCm * heightCm) / 5000
      : 0;
    const chargeableWeight = Math.max(weightKg, dimWeight);
    const weightSurcharge = Math.max(0, (chargeableWeight - 1)) * 0.15;

    const prices = [
      {
        serviceLevel: "economy",
        name: "Economy",
        basePrice: getBaseRate(destCountry, "economy"),
        estimatedDays: destCountry === "NG" ? "5-7" : "7-14",
      },
      {
        serviceLevel: "standard",
        name: "Standard",
        basePrice: getBaseRate(destCountry, "standard"),
        estimatedDays: destCountry === "NG" ? "2-4" : "5-10",
      },
      {
        serviceLevel: "express",
        name: "Express",
        basePrice: getBaseRate(destCountry, "express"),
        estimatedDays: destCountry === "NG" ? "1-2" : "3-5",
      },
    ];

    if (destCountry === "NG" && originCountry === "NG") {
      prices.push({
        serviceLevel: "same_day",
        name: "Same Day",
        basePrice: getBaseRate(destCountry, "same_day"),
        estimatedDays: destCountry === "NG" ? "Same day" : "N/A",
      });
    }

    const quotes = prices.map((p) => {
      const price = Math.round(p.basePrice * (1 + weightSurcharge));
      return {
        serviceLevel: p.serviceLevel,
        serviceName: p.name,
        price,
        currency: destCountry === "NG" ? "NGN" : "USD",
        estimatedDays: p.estimatedDays,
        chargeableWeight: Math.round(chargeableWeight * 100) / 100,
        insurancePremium: declaredValue > 0 ? Math.round(declaredValue * 0.015) : 0,
      };
    });

    const intlRates: any[] = [];
    if (originCountry !== destCountry) {
      try {
        const allCarriers = await getAllCarriers();
        for (const carrier of allCarriers) {
          if (["dhl-international", "fedex-international", "aramex-international", "freight-forwarder"].includes(carrier.code)) {
            try {
              const rates = await carrier.getRates({
                origin: { country: originCountry, city: "", postalCode: "", address: "" },
                destination: { country: destCountry, city: "", postalCode: "", address: "" },
                weight: weightKg,
                items: [{ sku: "default", quantity: 1 }],
              });
              intlRates.push(...rates);
            } catch {
              continue;
            }
          }
        }
      } catch {
        // Carrier lookup fallback
      }
    }

    return NextResponse.json({
      quotes,
      internationalRates: intlRates,
      chargeableWeight: Math.round(chargeableWeight * 100) / 100,
    });
  } catch (error) {
    console.error("[Express Pricing]", error);
    return NextResponse.json({ error: "Failed to calculate pricing" }, { status: 500 });
  }
}
