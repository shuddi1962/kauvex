import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { resolveOrg } from "@/lib/business-os";
import { reviewModule } from "@/lib/k-platform";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  const moduleId = new URL(req.url).searchParams.get("module_id");
  const reviews = await prisma.kpReview.findMany({
    where: moduleId ? { moduleId } : {},
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return successResponse({ reviews });
}

export async function POST(req: Request) {
  const { user, error: authErr } = await getAuthUser(req);
  if (authErr) return authErr;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  if (!body.moduleId || !body.rating) return errorResponse("moduleId and rating are required", 400);
  const orgId = await resolveOrg(user!.id, body.orgId);
  if (!orgId) return errorResponse("No organization. Create an organization first.", 404);

  try {
    const review = await reviewModule(orgId, body.moduleId, Number(body.rating), body.comment);
    return successResponse(review, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 400);
  }
}
