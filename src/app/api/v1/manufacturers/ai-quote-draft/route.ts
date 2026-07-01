import { NextRequest, NextResponse } from "next/server";
import { createOpenRouterClient } from "@/lib/ai/openrouter";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inquiryId, inquiry, manufacturerCapabilities, manufacturerId } = body;

    if (!inquiry && !inquiryId) {
      return NextResponse.json(
        { error: "Inquiry data or inquiryId required" },
        { status: 400 }
      );
    }

    let inquiryData = inquiry;
    let caps = manufacturerCapabilities;

    // If inquiryId provided, load from DB
    if (inquiryId && !inquiryData) {
      const dbInquiry = await prisma.mfgInquiry.findUnique({
        where: { id: inquiryId },
        include: {
          manufacturer: {
            include: { capabilities: true, certifications: true, categories: true },
          },
        },
      });
      if (!dbInquiry) {
        return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
      }
      inquiryData = {
        productDescription: dbInquiry.productDescription,
        desiredQuantity: dbInquiry.desiredQuantity,
        targetPrice: dbInquiry.targetPrice ? `$${dbInquiry.targetPrice}` : null,
        customizationDetails: dbInquiry.customizationDetails,
        destinationCountry: dbInquiry.destinationCountry,
      };
      if (!caps && dbInquiry.manufacturer.capabilities?.[0]) {
        const c = dbInquiry.manufacturer.capabilities[0];
        caps = {
          defaultMoq: c.defaultMoq,
          defaultLeadTimeDays: c.defaultLeadTimeDays,
          allowsPrivateLabel: c.allowsPrivateLabel,
          allowsOem: c.allowsOem,
          allowsOdm: c.allowsOdm,
        };
      }
    }

    // Fallback mock data
    inquiryData = inquiryData || {
      productDescription: "Cotton t-shirts, 200gsm",
      desiredQuantity: 5000,
      targetPrice: "$3.20",
      customizationDetails: "Private label, custom packaging",
      destinationCountry: "US",
    };

    caps = caps || {
      defaultMoq: 500,
      defaultLeadTimeDays: 21,
      allowsPrivateLabel: true,
      allowsOem: true,
      allowsOdm: false,
    };

    // Try OpenRouter first, fall back to local calculation
    try {
      const client = createOpenRouterClient();

      const systemPrompt = `You are a B2B manufacturing quote generator for Kauvex Commerce Cloud.
Generate professional, competitive pricing quotes for international buyers.
Always respond with valid JSON only. No markdown, no explanation.`;

      const prompt = `Generate a manufacturing quote for this inquiry:

Product: ${inquiryData.productDescription}
Quantity: ${inquiryData.desiredQuantity?.toLocaleString()} units
Target Price: ${inquiryData.targetPrice || "Not specified"}
Customization: ${inquiryData.customizationDetails || "Standard"}
Destination: ${inquiryData.destinationCountry || "Global"}

Manufacturer capabilities:
- MOQ: ${caps.defaultMoq} units
- Lead time: ${caps.defaultLeadTimeDays} days
- Private label: ${caps.allowsPrivateLabel ? "Yes" : "No"}
- OEM: ${caps.allowsOem ? "Yes" : "No"}
- ODM: ${caps.allowsOdm ? "Yes" : "No"}

Generate a quote with:
1. 3 volume-based pricing tiers (low/mid/high quantity)
2. MOQ, lead time, sample cost
3. Payment terms (30% escrow deposit, 70% on delivery)
4. Incoterm (FOB)
5. Valid until date (14 days from now)
6. Professional notes

Respond as JSON:
{
  "pricingTiers": [{ "min": number, "max": number, "price": number }],
  "moq": number,
  "leadTimeDays": number,
  "sampleCost": number,
  "paymentTerms": "string",
  "incoterm": "string",
  "validUntil": "YYYY-MM-DD",
  "notes": "string"
}`;

      const draft = await client.generateJSON<{
        pricingTiers: { min: number; max: number; price: number }[];
        moq: number;
        leadTimeDays: number;
        sampleCost: number;
        paymentTerms: string;
        incoterm: string;
        validUntil: string;
        notes: string;
      }>({ prompt, systemPrompt, temperature: 0.4 });

      return NextResponse.json({ data: draft, source: "ai" });
    } catch {
      // Fallback to local calculation if OpenRouter not configured
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

      return NextResponse.json({ data: draft, source: "local" });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to generate quote draft" },
      { status: 500 }
    );
  }
}
