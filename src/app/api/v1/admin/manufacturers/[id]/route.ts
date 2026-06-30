import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin, validateBody } from "@/lib/api-helpers";
import { getManufacturerById } from "@/lib/manufacturers/registration";
import { upgradeVerificationTier, recalculateTrustScore } from "@/lib/manufacturers/verification";
import prisma from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const approveRejectSchema = z.object({
  action: z.enum(["approve", "reject", "suspend", "activate"]),
  reason: z.string().max(500).optional(),
  verificationTier: z.enum(["unverified", "document_verified", "factory_verified", "gold"]).optional(),
}).strict();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;
    const manufacturer = await getManufacturerById(id);
    if (!manufacturer) return errorResponse("Manufacturer not found", 404);

    const verification = await prisma.mfgManufacturer.findUnique({
      where: { id },
      include: {
        certifications: true,
        orders: {
          select: {
            id: true,
            status: true,
            total_amount: true,
            rating_average: true,
            created_at: true,
          },
          orderBy: { created_at: "desc" },
          take: 10,
        },
        disputes: {
          orderBy: { created_at: "desc" },
          take: 10,
        },
        inquiries: {
          select: { id: true, status: true, created_at: true, responded_at: true },
        },
      },
    });

    const stats = {
      totalOrders: verification?.orders.length ?? 0,
      completedOrders: verification?.orders.filter((o) => o.status === "completed").length ?? 0,
      totalRevenue: verification?.orders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + o.total_amount, 0) ?? 0,
      avgRating: verification?.orders.length
        ? verification.orders.reduce((sum, o) => sum + (o.rating_average ?? 0), 0) / verification.orders.length
        : 0,
      openDisputes: verification?.disputes.filter((d) => d.status === "open").length ?? 0,
      totalInquiries: verification?.inquiries.length ?? 0,
      respondedInquiries: verification?.inquiries.filter((i) => i.responded_at !== null).length ?? 0,
    };

    return successResponse({ ...manufacturer, details: verification, stats });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authErr } = await requireAdmin(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, approveRejectSchema);
  if (valErr) return valErr;

  try {
    const { id } = await params;

    const manufacturer = await prisma.mfgManufacturer.findUnique({ where: { id } });
    if (!manufacturer) return errorResponse("Manufacturer not found", 404);

    let newStatus = manufacturer.status;
    switch (body!.action) {
      case "approve":
        newStatus = "active";
        break;
      case "reject":
        newStatus = "rejected";
        break;
      case "suspend":
        newStatus = "suspended";
        break;
      case "activate":
        newStatus = "active";
        break;
    }

    await prisma.mfgManufacturer.update({
      where: { id },
      data: { status: newStatus },
    });

    if (body!.verificationTier) {
      await upgradeVerificationTier(id, body!.verificationTier);
    }

    const trustScore = await recalculateTrustScore(id);

    const updated = await getManufacturerById(id);
    return successResponse({ ...updated, trustScore });
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
