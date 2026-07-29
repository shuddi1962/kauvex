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
    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });
    if (!business) return errorResponse("Business not found", 404);

    const document = await prisma.kaiDocument.findFirst({
      where: { id: params.id, businessId: business.id },
    });

    if (!document) return errorResponse("Document not found", 404);

    return successResponse(document);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });
    if (!business) return errorResponse("Business not found", 404);

    const existing = await prisma.kaiDocument.findFirst({
      where: { id: params.id, businessId: business.id },
    });
    if (!existing) return errorResponse("Document not found", 404);

    const body = await _request.json();
    const { name, type, isIndexed, metadata } = body;

    const updated = await prisma.kaiDocument.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(isIndexed !== undefined && { isIndexed }),
        ...(metadata !== undefined && { metadata }),
      },
    });

    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error: authErr } = await getAuthUser(_request);
  if (authErr) return authErr;

  try {
    const business = await prisma.kaiBusiness.findUnique({
      where: { userId: user!.id },
    });
    if (!business) return errorResponse("Business not found", 404);

    const existing = await prisma.kaiDocument.findFirst({
      where: { id: params.id, businessId: business.id },
    });
    if (!existing) return errorResponse("Document not found", 404);

    await prisma.kaiDocument.delete({ where: { id: params.id } });

    return successResponse({ deleted: true });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
