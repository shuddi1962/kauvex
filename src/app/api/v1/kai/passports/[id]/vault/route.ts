import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const { id } = params;

    const passport = await prisma.kv_digital_passports.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });
    if (!passport) return errorResponse("Passport not found", 404);

    if (passport.ownerId !== user!.id) {
      return errorResponse("Access denied", 403);
    }

    const documents = await prisma.kv_digital_passport_documents.findMany({
      where: { passportId: id },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(documents);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = params;
    const body = await request.json();
    const { name, type, fileUrl, fileSize, mimeType, metadata } = body;

    if (!name) {
      return errorResponse("name is required", 400);
    }

    const passport = await prisma.kv_digital_passports.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });
    if (!passport) return errorResponse("Passport not found", 404);

    if (passport.ownerId !== user!.id) {
      return errorResponse("Access denied", 403);
    }

    const document = await prisma.kv_digital_passport_documents.create({
      data: {
        passportId: id,
        name,
        type: type || null,
        fileUrl: fileUrl || null,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        uploadedBy: user!.id,
        metadata: metadata || {},
      },
    });

    return successResponse(document, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
