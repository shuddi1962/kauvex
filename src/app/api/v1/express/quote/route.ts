import { NextRequest, NextResponse } from "next/server";
import { getGuestQuote } from "@/lib/shipping/guest-quote";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originCountry, originCity, destCountry, destCity, weightKg, lengthCm, widthCm, heightCm, contentsType, declaredValue, isFragile, hasBatteries, hasLiquids } = body;

    if (!originCountry || !destCountry || !weightKg) {
      return NextResponse.json(
        { error: "originCountry, destCountry, and weightKg are required" },
        { status: 400 }
      );
    }

    const quote = await getGuestQuote({
      originCountry,
      originCity: originCity || "",
      destCountry,
      destCity: destCity || "",
      weightKg,
      lengthCm,
      widthCm,
      heightCm,
      contentsType,
      declaredValue,
      isFragile,
      hasBatteries,
      hasLiquids,
    });

    return NextResponse.json({ data: quote }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create quote" },
      { status: 500 }
    );
  }
}
