import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { resolveOrg } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(request.url).searchParams.get("org_id"));
  if (!orgId) return errorResponse("No organization", 404);
  try {
    let settings = await prisma.bosOrgSetting.findUnique({ where: { orgId } });
    if (!settings) {
      settings = await prisma.bosOrgSetting.create({ data: { orgId } });
    }
    return successResponse(settings);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;
  let body: any;
  try { body = await request.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  const orgId = await resolveOrg(user!.id, body.orgId ?? new URL(request.url).searchParams.get("org_id"));
  if (!orgId) return errorResponse("No organization", 404);
  try {
    const { orgId: _org, id: _id, createdAt: _c, ...update } = body;
    const settings = await prisma.bosOrgSetting.upsert({
      where: { orgId },
      create: { orgId, ...update },
      update: update,
    });
    return successResponse(settings);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
