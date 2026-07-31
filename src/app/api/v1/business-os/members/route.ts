import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { resolveOrg } from "@/lib/business-os";
import { createListHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosOrgMember, {
  searchFields: ["jobTitle"],
  orderBy: { createdAt: "asc" },
});

export async function POST(request: NextRequest) {
  const { user, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;
  let body: any;
  try { body = await request.json(); } catch { return errorResponse("Invalid JSON body", 400); }
  const orgId = await resolveOrg(user!.id, body.orgId ?? new URL(request.url).searchParams.get("org_id"));
  if (!orgId) return errorResponse("No organization", 404);
  try {
    const existing = await prisma.bosOrgMember.findFirst({ where: { orgId, userId: body.userId } });
    if (existing) return errorResponse("User is already a member", 409);
    const member = await prisma.bosOrgMember.create({
      data: { orgId, userId: body.userId, memberRole: body.memberRole || "member", departmentId: body.departmentId, jobTitle: body.jobTitle },
    });
    return successResponse(member, 201);
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
