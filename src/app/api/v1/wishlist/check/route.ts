import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return errorResponse("productId query parameter is required", 400);
    }

    const item = await prisma.kv_wishlist_item.findUnique({
      where: {
        userId_productId: {
          userId: user!.id,
          productId,
        },
      },
    });

    return successResponse({ isWishlisted: !!item });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}