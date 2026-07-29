import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { getPassportById, updateTrustScore } from "@/lib/kai/digital-passport";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const passport = await getPassportById(id);
    if (!passport) {
      return errorResponse("Passport not found", 404);
    }
    return successResponse(passport);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;
    const existing = await prisma.digitalPassport.findUnique({ where: { id } });
    if (!existing) return errorResponse("Passport not found", 404);
    if (existing.ownerId && existing.ownerId !== user!.id) {
      return errorResponse("Unauthorized", 403);
    }

    const body = await request.json();
    const { title, status, passportData, documents, isVerified, trustScore } = body;

    const updated = await prisma.digitalPassport.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(status !== undefined && { status }),
        ...(passportData !== undefined && { passportData }),
        ...(documents !== undefined && { documents }),
        ...(isVerified !== undefined && { isVerified }),
        ...(trustScore !== undefined && { trustScore }),
      },
      include: { events: { orderBy: { eventDate: "desc" }, take: 20 } },
    });

    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const { id } = await params;
    const existing = await prisma.digitalPassport.findUnique({ where: { id } });
    if (!existing) return errorResponse("Passport not found", 404);
    if (existing.ownerId && existing.ownerId !== user!.id) {
      return errorResponse("Unauthorized", 403);
    }

    await prisma.digitalPassport.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
