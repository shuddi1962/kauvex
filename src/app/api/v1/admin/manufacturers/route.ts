import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin, validateBody, paginatedResponse } from "@/lib/api-helpers";
import { listManufacturers, updateManufacturer } from "@/lib/manufacturers/registration";
import prisma from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["active", "suspended", "pending_review"]),
  verificationTier: z.enum(["unverified", "document_verified", "factory_verified", "gold"]).optional(),
}).strict();

export async function GET(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await listManufacturers({
      countryCode: searchParams.get("country") || undefined,
      category: searchParams.get("category") || undefined,
      verificationTier: searchParams.get("verification") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("q") || undefined,
      page,
      limit,
    });

    return paginatedResponse(result.manufacturers, result.total, result.page, result.limit);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function PATCH(request: NextRequest) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, updateStatusSchema);
  if (valErr) return valErr;

  try {
    const updateData: any = {};

    if (body!.status) {
      updateData.status = body!.status;
    }

    if (body!.verificationTier) {
      // Use verification module to upgrade tier
      const { upgradeVerificationTier } = await import("@/lib/manufacturers/verification");
      await upgradeVerificationTier(body!.id, body!.verificationTier);
    }

    if (body!.status) {
      await prisma.mfgManufacturer.update({
        where: { id: body!.id },
        data: { status: body!.status },
      });
    }

    const manufacturer = await prisma.mfgManufacturer.findUnique({
      where: { id: body!.id },
      include: { categories: true, capabilities: true },
    });

    return successResponse(manufacturer);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
