import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cached exchange rates (refreshed hourly via cron)
let cachedRates: Record<string, number> = {};
let lastFetched = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (cachedRates && Object.keys(cachedRates).length > 0 && now - lastFetched < CACHE_TTL) {
    return cachedRates;
  }

  try {
    const apiKey = process.env.OPEN_EXCHANGE_RATES_API_KEY;
    if (!apiKey) {
      // Fallback rates
      return {
        USD: 1, NGN: 1550, GBP: 0.79, EUR: 0.92, AED: 3.67,
        INR: 83.5, AUD: 1.53, CAD: 1.36, GHS: 12.5, KES: 153,
        ZAR: 18.5, SAR: 3.75, BRL: 4.97, JPY: 149.5,
      };
    }

    const res = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${apiKey}&base=USD`
    );
    const data = await res.json();
    cachedRates = data.rates;
    lastFetched = now;
    return cachedRates;
  } catch {
    return cachedRates || { USD: 1 };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || "USD";
    const to = searchParams.get("to");
    const amount = parseFloat(searchParams.get("amount") || "1");

    const rates = await fetchExchangeRates();

    if (to) {
      const rate = rates[to] && rates[from] ? rates[to] / rates[from] : null;
      if (!rate) {
        return NextResponse.json({ error: `Currency ${to} not found` }, { status: 404 });
      }
      const buffer = 1.02; // 2% buffer
      const converted = amount * rate * buffer;
      return NextResponse.json({
        data: {
          from,
          to,
          amount,
          rate,
          bufferedRate: rate * buffer,
          converted: Math.round(converted * 100) / 100,
          buffer: "2%",
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Return all rates
    return NextResponse.json({
      data: {
        base: "USD",
        rates,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch exchange rates" }, { status: 500 });
  }
}
