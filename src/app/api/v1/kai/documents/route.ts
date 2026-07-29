import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });
    if (!business) return errorResponse("Business not found", 404);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { businessId: business.id };
    if (type) where.type = type;
    if (search) where.name = { contains: search, mode: "insensitive" };

    const documents = await prisma.kaiDocument.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return successResponse(documents);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });
    if (!business) return errorResponse("Business not found", 404);

    const body = await request.json();
    const { name, type, fileUrl, fileSize, mimeType, source, metadata } = body;

    if (!name) return errorResponse("name is required", 400);

    const document = await prisma.kaiDocument.create({
      data: {
        businessId: business.id,
        name,
        type: type ?? null,
        fileUrl: fileUrl ?? null,
        fileSize: fileSize ?? null,
        mimeType: mimeType ?? null,
        source: source ?? "upload",
        isIndexed: false,
        metadata: metadata ?? {},
      },
    });

    return successResponse(document, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
