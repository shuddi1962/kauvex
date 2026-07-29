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

    const connections = await prisma.kaiConnection.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(connections);
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
    const { name, provider, config } = body;

    if (!name) return errorResponse("name is required", 400);
    if (!provider) return errorResponse("provider is required", 400);

    const connection = await prisma.kaiConnection.create({
      data: {
        businessId: business.id,
        name,
        provider,
        config: config ?? {},
        isConnected: false,
      },
    });

    return successResponse(connection, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
