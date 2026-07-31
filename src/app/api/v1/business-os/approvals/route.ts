import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";
import { nextNumber } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosApproval, { searchFields: ["approvalNumber", "title"], orderBy: { createdAt: "desc" } });

export const POST = createCreateHandler(prisma.bosApproval, {
  transform: async (body, orgId) => ({
    ...body,
    approvalNumber: body.approvalNumber || (await nextNumber(orgId, "approval", "AP")),
  }),
});
