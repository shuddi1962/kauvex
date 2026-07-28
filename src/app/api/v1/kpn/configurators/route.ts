import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, validateBody } from "@/lib/api-helpers";
import {
  boatConfigurator, solarConfigurator, cctvConfigurator,
  houseConfigurator, kitchenConfigurator, dredgingConfigurator,
} from "@/lib/kpn";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const configSchema = z.object({
  type: z.enum(["boat", "solar", "cctv", "house", "kitchen", "dredging"]),
  config: z.record(z.any()),
});

const configurators: Record<string, (cfg: any) => any> = {
  boat: boatConfigurator,
  solar: solarConfigurator,
  cctv: cctvConfigurator,
  house: houseConfigurator,
  kitchen: kitchenConfigurator,
  dredging: dredgingConfigurator,
};

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  try {
    const sessions = await prisma.kpnConfiguratorSession.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return successResponse(sessions);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;

  const { data: body, error: valErr } = await validateBody(request, configSchema);
  if (valErr) return valErr;

  try {
    const fn = configurators[body!.type];
    if (!fn) return errorResponse(`Unknown configurator type: ${body!.type}`, 400);

    const result = fn(body!.config);
    return successResponse(result);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
