import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody, paginatedResponse } from "@/lib/api-helpers";
import {
  createInquiry,
  listInquiriesForManufacturer,
  listInquiriesForBuyer,
} from "@/lib/manufacturers/inquiries";
import prisma from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createInquirySchema = z.object({
  manufacturerId: z.string().uuid(),
  productDescription: z.string().min(10).max(2000),
  referenceImages: z.array(z.string().url()).optional(),
  desiredQuantity: z.number().int().positive().optional(),
  customizationDetails: z.string().max(1000).optional(),
  targetPrice: z.number().positive().optional(),
  destinationCountry: z.string().max(10).optional(),
}).strict();

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const manufacturerId = searchParams.get("manufacturerId");
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    if (manufacturerId) {
      const inquiries = await listInquiriesForManufacturer(manufacturerId, status || undefined);
      return successResponse(inquiries);
    }

    const inquiries = await listInquiriesForBuyer(user!.id);
    return successResponse(inquiries);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createInquirySchema);
  if (valErr) return valErr;

  try {
    const inquiry = await createInquiry({
      manufacturerId: body!.manufacturerId,
      buyerId: user!.id,
      buyerType: "customer",
      productDescription: body!.productDescription,
      referenceImages: body!.referenceImages,
      desiredQuantity: body!.desiredQuantity,
      customizationDetails: body!.customizationDetails,
      targetPrice: body!.targetPrice,
      destinationCountry: body!.destinationCountry,
    });
    return successResponse(inquiry, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
