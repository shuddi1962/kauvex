import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get manufacturer from profile
    const { data: profile } = await prisma.profiles.findUnique({
      where: { id: user!.id },
      select: { vendor_id: true },
    });

    const manufacturerId = profile?.vendor_id;
    if (!manufacturerId) {
      return errorResponse("No manufacturer profile linked to this account", 404);
    }

    const where: any = { manufacturer_id: manufacturerId };
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.mfgOrder.findMany({
        where,
        include: {
          buyer: { select: { id: true, full_name: true } },
          escrow: { select: { status: true, total_amount: true, released_amount: true } },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.mfgOrder.count({ where }),
    ]);

    return successResponse({
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
