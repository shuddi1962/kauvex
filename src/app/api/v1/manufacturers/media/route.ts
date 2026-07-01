import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import prisma from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const addMediaSchema = z.object({
  manufacturerId: z.string().uuid(),
  mediaType: z.enum(["photo", "video"]),
  url: z.string().url(),
  caption: z.string().max(300).optional(),
  sortOrder: z.number().int().min(0).optional(),
}).strict();

const reorderMediaSchema = z.object({
  mediaIds: z.array(z.string().uuid()),
}).strict();

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const manufacturerId = searchParams.get("manufacturerId");

    if (!manufacturerId) {
      return errorResponse("manufacturerId required", 400);
    }

    const media = await prisma.mfgFactoryMedia.findMany({
      where: { manufacturerId },
      orderBy: { sortOrder: "asc" },
    });

    return successResponse(media);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, addMediaSchema);
  if (valErr) return valErr;

  try {
    // Verify manufacturer ownership
    const manufacturer = await prisma.mfgManufacturer.findUnique({
      where: { id: body!.manufacturerId },
      select: { userId: true },
    });

    if (!manufacturer) {
      return errorResponse("Manufacturer not found", 404);
    }

    if (manufacturer.userId !== user!.id) {
      return errorResponse("Unauthorized", 403);
    }

    // Get current max sortOrder
    const maxSort = await prisma.mfgFactoryMedia.findFirst({
      where: { manufacturerId: body!.manufacturerId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const media = await prisma.mfgFactoryMedia.create({
      data: {
        manufacturerId: body!.manufacturerId,
        mediaType: body!.mediaType,
        url: body!.url,
        caption: body!.caption ?? null,
        sortOrder: body!.sortOrder ?? ((maxSort?.sortOrder ?? -1) + 1),
      },
    });

    return successResponse(media, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}

export async function PATCH(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const body = await request.json();

    if (body.mediaIds && Array.isArray(body.mediaIds)) {
      // Reorder media
      await Promise.all(
        body.mediaIds.map((id: string, index: number) =>
          prisma.mfgFactoryMedia.update({
            where: { id },
            data: { sortOrder: index },
          })
        )
      );
      return successResponse({ reordered: true });
    }

    return errorResponse("Invalid request body", 400);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}

export async function DELETE(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("id");

    if (!mediaId) {
      return errorResponse("Media ID required", 400);
    }

    const media = await prisma.mfgFactoryMedia.findUnique({
      where: { id: mediaId },
      include: { manufacturer: { select: { userId: true } } },
    });

    if (!media) {
      return errorResponse("Media not found", 404);
    }

    if (media.manufacturer.userId !== user!.id) {
      return errorResponse("Unauthorized", 403);
    }

    await prisma.mfgFactoryMedia.delete({ where: { id: mediaId } });

    return successResponse({ deleted: true });
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
