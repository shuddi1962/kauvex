import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import { createInquiry } from "@/lib/manufacturers/inquiries";
import prisma from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createRfqSchema = z.object({
  type: z.enum(["broadcast", "direct"]),
  manufacturerId: z.string().uuid().optional(),
  productDescription: z.string().min(10).max(2000),
  referenceImages: z.array(z.string().url()).optional(),
  desiredQuantity: z.number().int().positive().optional(),
  customizationDetails: z.string().max(1000).optional(),
  targetPrice: z.number().positive().optional(),
  destinationCountry: z.string().max(10).optional(),
  category: z.string().max(100).optional(),
}).strict();

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, createRfqSchema);
  if (valErr) return valErr;

  try {
    if (body!.type === "direct") {
      if (!body!.manufacturerId) {
        return errorResponse("manufacturerId is required for direct RFQ", 400);
      }

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

      return successResponse({ rfq: inquiry, type: "direct" }, 201);
    }

    // Broadcast RFQ — create inquiry for all manufacturers matching the category
    const where: any = { status: "active" };
    if (body!.category) {
      where.categories = { some: { category: body!.category } };
    }

    const manufacturers = await prisma.mfgManufacturer.findMany({
      where,
      select: { id: true },
      take: 50,
    });

    if (manufacturers.length === 0) {
      return errorResponse("No manufacturers found matching your criteria", 404);
    }

    const inquiries = await Promise.all(
      manufacturers.map((m) =>
        createInquiry({
          manufacturerId: m.id,
          buyerId: user!.id,
          buyerType: "customer",
          productDescription: body!.productDescription,
          referenceImages: body!.referenceImages,
          desiredQuantity: body!.desiredQuantity,
          customizationDetails: body!.customizationDetails,
          targetPrice: body!.targetPrice,
          destinationCountry: body!.destinationCountry,
        })
      )
    );

    return successResponse(
      { rfqs: inquiries, type: "broadcast", manufacturerCount: manufacturers.length },
      201
    );
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
