import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const { id, docId } = params;

    const passport = await prisma.kv_digital_passports.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });
    if (!passport) return errorResponse("Passport not found", 404);

    if (passport.ownerId !== user!.id) {
      return errorResponse("Access denied", 403);
    }

    const document = await prisma.kv_digital_passport_documents.findUnique({
      where: { id: docId },
    });
    if (!document || document.passportId !== id) {
      return errorResponse("Document not found", 404);
    }

    await prisma.kv_digital_passport_documents.delete({
      where: { id: docId },
    });

    return successResponse({ deleted: true });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
