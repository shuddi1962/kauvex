import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";
import { generateDecisionSupport } from "@/lib/kai-ecosystem";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const url = new URL(req.url);
  const orgId = await resolveOrg(user!.id, url.searchParams.get("org_id"));
  if (!orgId) return errorResponse("No organization", 404);
  const status = url.searchParams.get("status");
  const rows = await prisma.kaiEcoDecision.findMany({
    where: { orgId, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return successResponse({ rows, orgId });
}

export async function POST(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  if (!body.context) return errorResponse("context is required", 400);
  const orgId = await resolveOrg(user!.id, body.orgId);
  if (!orgId) return errorResponse("No organization", 404);
  try {
    const decision = await generateDecisionSupport(orgId, body.context, user!.id);
    return successResponse(decision, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
