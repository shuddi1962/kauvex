import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { resolveOrg } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const modules = await prisma.bosIndustryModule.findMany({ orderBy: { sortOrder: "asc" } });
    return successResponse(modules);
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
    const module = await prisma.bosIndustryModule.findUnique({ where: { moduleCode: body.moduleCode } });
    if (!module) return errorResponse("Module not found", 404);

    const installed = ((module.installedFor as any) || []) as string[];
    const next = body.install === false
      ? installed.filter((id) => id !== orgId)
      : [...new Set([...installed, orgId])];

    const updated = await prisma.bosIndustryModule.update({
      where: { id: module.id },
      data: { installedFor: next },
    });
    return successResponse(updated);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
