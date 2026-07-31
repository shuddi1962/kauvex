import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";
import { generateResearchReport } from "@/lib/kai-ecosystem";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(req.url).searchParams.get("org_id"));
  if (!orgId) return errorResponse("No organization", 404);
  const rows = await prisma.kaiEcoResearch.findMany({ where: { orgId }, orderBy: { createdAt: "desc" }, take: 100 });
  return successResponse({ rows, orgId });
}

export async function POST(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  if (!body.topic) return errorResponse("topic is required", 400);
  const orgId = await resolveOrg(user!.id, body.orgId);
  if (!orgId) return errorResponse("No organization", 404);
  try {
    const report = await generateResearchReport(orgId, body.topic, user!.id);
    return successResponse(report, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
