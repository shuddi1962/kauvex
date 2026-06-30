import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody, paginatedResponse } from "@/lib/api-helpers";
import { createQuote, getQuotesForInquiry } from "@/lib/manufacturers/inquiries";
import prisma from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createQuoteSchema = z.object({
  inquiryId: z.string().uuid(),
  pricingTiers: z.array(z.object({
    minQty: z.number().int().positive(),
    maxQty: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
  moq: z.number().int().positive(),
  leadTimeDays: z.number().int().positive(),
  sampleCost: z.number().positive().optional(),
  sampleAvailable: z.boolean().optional(),
  paymentTerms: z.string().max(200).optional(),
  incoterm: z.string().max(20).optional(),
  validUntil: z.string().optional(),
  notes: z.string().max(1000).optional(),
}).strict();

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const inquiryId = searchParams.get("inquiryId");

    if (!inquiryId) {
      return errorResponse("inquiryId query parameter is required", 400);
    }

    const quotes = await getQuotesForInquiry(inquiryId);
    return successResponse(quotes);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createQuoteSchema);
  if (valErr) return valErr;

  try {
    // Verify user owns a manufacturer
    const { data: profile } = await prisma.profiles.findUnique({
      where: { id: user!.id },
      select: { vendor_id: true },
    });

    const manufacturerId = profile?.vendor_id;
    if (!manufacturerId) {
      return errorResponse("No manufacturer profile linked to this account", 403);
    }

    // Verify inquiry exists and belongs to this manufacturer
    const inquiry = await prisma.mfgInquiry.findUnique({
      where: { id: body!.inquiryId },
    });
    if (!inquiry) return errorResponse("Inquiry not found", 404);
    if (inquiry.manufacturer_id !== manufacturerId) {
      return errorResponse("This inquiry is not assigned to your manufacturer account", 403);
    }

    const quote = await createQuote({
      inquiryId: body!.inquiryId,
      manufacturerId,
      pricingTiers: body!.pricingTiers,
      moq: body!.moq,
      leadTimeDays: body!.leadTimeDays,
      sampleCost: body!.sampleCost,
      sampleAvailable: body!.sampleAvailable,
      paymentTerms: body!.paymentTerms,
      incoterm: body!.incoterm,
      validUntil: body!.validUntil ? new Date(body!.validUntil) : undefined,
      notes: body!.notes,
    });

    // Update inquiry status to quoted
    await prisma.mfgInquiry.update({
      where: { id: body!.inquiryId },
      data: { status: "quoted" },
    });

    return successResponse(quote, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
