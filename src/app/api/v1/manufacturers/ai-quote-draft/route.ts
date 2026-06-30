import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inquiryId, inquiry, manufacturerCapabilities } = body;

    if (!inquiry && !inquiryId) {
      return NextResponse.json(
        { error: "Inquiry data or inquiryId required" },
        { status: 400 }
      );
    }

    const inquiryData = inquiry || {
      productDescription: "Cotton t-shirts, 200gsm",
      desiredQuantity: 5000,
      targetPrice: "$3.20",
      customizationDetails: "Private label, custom packaging",
      destinationCountry: "US",
    };

    const caps = manufacturerCapabilities || {
      defaultMoq: 500,
      defaultLeadTimeDays: 21,
      allowsPrivateLabel: true,
      allowsOem: true,
      allowsOdm: false,
    };

    const quantity = inquiryData.desiredQuantity || 1000;
    const basePrice = parseFloat(inquiryData.targetPrice?.replace(/[$,]/g, "") || "3.00");

    const tiers = [
      { min: caps.defaultMoq, max: Math.floor(quantity * 0.3), price: +(basePrice * 1.15).toFixed(2) },
      { min: Math.floor(quantity * 0.3), max: Math.floor(quantity * 0.7), price: +basePrice.toFixed(2) },
      { min: Math.floor(quantity * 0.7), max: quantity * 2, price: +(basePrice * 0.92).toFixed(2) },
    ];

    const draft = {
      pricingTiers: tiers,
      moq: caps.defaultMoq,
      leadTimeDays: caps.defaultLeadTimeDays,
      sampleCost: +(basePrice * 10).toFixed(2),
      paymentTerms: "30% deposit via Kauvex Escrow, 70% on delivery confirmation",
      incoterm: "FOB",
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      notes: `Thank you for your inquiry about ${inquiryData.productDescription}. We can produce ${quantity.toLocaleString()} units within ${caps.defaultLeadTimeDays} business days. Our factory is equipped for ${caps.allowsPrivateLabel ? "private label" : ""} ${caps.allowsOem ? "OEM" : ""} ${caps.allowsOdm ? "ODM" : ""} production. Sample available at $${tiers[0].price * 10}. All transactions are protected by Kauvex Trade Assurance.`,
    };

    return NextResponse.json({ data: draft });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate quote draft" },
      { status: 500 }
    );
  }
}
