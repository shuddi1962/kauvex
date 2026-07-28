import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const items = await prisma.kv_wishlist_item.findMany({
      where: { userId: user!.id },
      select: { productId: true },
      orderBy: { createdAt: "desc" },
    });

    const productIds = items.map((i) => i.productId);
    return successResponse({ productIds });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return errorResponse("productId is required", 400);
    }

    await prisma.kv_wishlist_item.upsert({
      where: {
        userId_productId: {
          userId: user!.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: user!.id,
        productId,
      },
    });

    return successResponse({ productId, wishlisted: true }, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}

export async function DELETE(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (productId) {
      await prisma.kv_wishlist_item.deleteMany({
        where: {
          userId: user!.id,
          productId,
        },
      });
      return successResponse({ productId, wishlisted: false });
    }

    await prisma.kv_wishlist_item.deleteMany({
      where: { userId: user!.id },
    });

    return successResponse({ cleared: true });
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}