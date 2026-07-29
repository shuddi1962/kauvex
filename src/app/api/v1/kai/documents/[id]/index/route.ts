import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
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

    const updated = await prisma.kaiDocument.update({
      where: { id: params.id },
      data: { isIndexed: true },
    });

    return successResponse({ indexed: true, document: updated });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
