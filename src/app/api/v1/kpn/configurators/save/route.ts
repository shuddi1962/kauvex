import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const saveSessionSchema = z.object({
  configuratorType: z.string().min(1).max(50),
  configuration: z.record(z.any()),
  result: z.any().optional(),
  name: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, saveSessionSchema);
  if (valErr) return valErr;

  try {
    const session = await prisma.kpnConfiguratorSession.create({
      data: {
        userId: user!.id,
        configuratorType: body!.configuratorType,
        configuration: body!.configuration,
        result: body!.result || {},
        name: body!.name || `${body!.configuratorType} configuration`,
      },
    });
    return successResponse(session, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
