import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";
import { runFlow } from "@/lib/kai-ecosystem";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const orgId = await resolveOrg(user!.id, new URL(req.url).searchParams.get("org_id"));
  if (!orgId) return errorResponse("No organization", 404);
  try {
    const flow = await prisma.kaiEcoFlow.findUnique({ where: { id: params.id } });
    if (!flow || flow.orgId !== orgId) return errorResponse("Flow not found", 404);
    const run = await runFlow(orgId, flow, user!.id);
    return successResponse(run, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
