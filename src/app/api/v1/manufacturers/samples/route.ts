import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { requestSample, listSamplesForBuyer, listSamplesForManufacturer } from "@/lib/manufacturers/samples";
import prisma from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const requestSampleSchema = z.object({
  manufacturerId: z.string().uuid(),
  inquiryId: z.string().uuid().optional(),
  productDescription: z.string().max(1000).optional(),
  sampleCost: z.number().positive(),
  shippingFee: z.number().min(0),
}).strict();

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const manufacturerId = searchParams.get("manufacturerId");

    if (manufacturerId) {
      const samples = await listSamplesForManufacturer(manufacturerId);
      return successResponse(samples);
    }

    const samples = await listSamplesForBuyer(user!.id);
    return successResponse(samples);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, requestSampleSchema);
  if (valErr) return valErr;

  try {
    const sample = await requestSample({
      manufacturerId: body!.manufacturerId,
      buyerId: user!.id,
      inquiryId: body!.inquiryId,
      productDescription: body!.productDescription,
      sampleCost: body!.sampleCost,
      shippingFee: body!.shippingFee,
    });
    return successResponse(sample, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
