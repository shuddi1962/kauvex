import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { waybillId, photos, photoType, description } = body;

    if (!waybillId || !photos || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json(
        { error: "waybillId and photos array are required" },
        { status: 400 }
      );
    }

    const waybill = await (prisma as any).ksp_express_waybills.findUnique({
      where: { id: waybillId },
    });

    if (!waybill) {
      return NextResponse.json({ error: "Waybill not found" }, { status: 404 });
    }

    const createdPhotos = await Promise.all(
      photos.map((photo: any) =>
        (prisma as any).ksp_cargo_photos.create({
          data: {
            waybillId,
            url: photo.url,
            thumbnailUrl: photo.thumbnailUrl || null,
            photoType: photoType || "general",
            description: description || null,
            takenBy: photo.takenBy || null,
            latitude: photo.latitude || null,
            longitude: photo.longitude || null,
            timestamp: photo.timestamp ? new Date(photo.timestamp) : new Date(),
          },
        })
      )
    );

    return NextResponse.json({ photos: createdPhotos }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to upload cargo photos" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const waybillId = searchParams.get("waybillId");
    const photoType = searchParams.get("photoType");

    if (!waybillId) {
      return NextResponse.json(
        { error: "waybillId is required" },
        { status: 400 }
      );
    }

    const where: any = { waybillId };
    if (photoType) where.photoType = photoType;

    const photos = await (prisma as any).ksp_cargo_photos.findMany({
      where,
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json({ photos });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch cargo photos" },
      { status: 500 }
    );
  }
}
