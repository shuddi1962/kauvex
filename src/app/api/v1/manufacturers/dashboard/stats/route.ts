import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { data: profile } = await prisma.profiles.findUnique({
      where: { id: user!.id },
      select: { vendor_id: true },
    });

    const manufacturerId = profile?.vendor_id;
    if (!manufacturerId) {
      return errorResponse("No manufacturer profile linked to this account", 404);
    }

    const manufacturer = await prisma.mfgManufacturer.findUnique({
      where: { id: manufacturerId },
      include: {
        categories: true,
        capabilities: true,
        certifications: true,
      },
    });

    if (!manufacturer) return errorResponse("Manufacturer not found", 404);

    const [
      totalInquiries,
      pendingInquiries,
      totalOrders,
      activeOrders,
      completedOrders,
      totalEscrows,
      activeEscrows,
      totalSamples,
      pendingSamples,
      openDisputes,
    ] = await Promise.all([
      prisma.mfgInquiry.count({ where: { manufacturer_id: manufacturerId } }),
      prisma.mfgInquiry.count({ where: { manufacturer_id: manufacturerId, status: "pending" } }),
      prisma.mfgOrder.count({ where: { manufacturer_id: manufacturerId } }),
      prisma.mfgOrder.count({ where: { manufacturer_id: manufacturerId, status: { in: ["pending_payment", "confirmed", "in_production"] } } }),
      prisma.mfgOrder.count({ where: { manufacturer_id: manufacturerId, status: "completed" } }),
      prisma.mfgEscrow.count({ where: { order: { manufacturer_id: manufacturerId } } }),
      prisma.mfgEscrow.count({ where: { order: { manufacturer_id: manufacturerId }, status: { in: ["funded", "partial_release"] } } }),
      prisma.mfgSample.count({ where: { manufacturer_id: manufacturerId } }),
      prisma.mfgSample.count({ where: { manufacturer_id: manufacturerId, status: "requested" } }),
      prisma.mfgDispute.count({ where: { order: { manufacturer_id: manufacturerId }, status: "open" } }),
    ]);

    const recentInquiries = await prisma.mfgInquiry.findMany({
      where: { manufacturer_id: manufacturerId },
      orderBy: { created_at: "desc" },
      take: 5,
      include: { quotes: true },
    });

    const activeOrdersList = await prisma.mfgOrder.findMany({
      where: { manufacturer_id: manufacturerId, status: { in: ["confirmed", "in_production"] } },
      orderBy: { created_at: "desc" },
      take: 5,
    });

    return successResponse({
      manufacturer: {
        id: manufacturer.id,
        companyName: manufacturer.company_name,
        verificationTier: manufacturer.verification_tier,
        trustScore: manufacturer.trust_score,
        status: manufacturer.status,
      },
      stats: {
        totalInquiries,
        pendingInquiries,
        totalOrders,
        activeOrders,
        completedOrders,
        totalEscrows,
        activeEscrows,
        totalSamples,
        pendingSamples,
        openDisputes,
      },
      recentInquiries,
      activeOrders: activeOrdersList,
    });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
