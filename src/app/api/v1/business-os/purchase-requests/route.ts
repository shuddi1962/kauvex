import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";
import { nextNumber } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosPurchaseRequest, { searchFields: ["prNumber"] });

export const POST = createCreateHandler(prisma.bosPurchaseRequest, {
  transform: async (body, orgId) => ({
    ...body,
    prNumber: body.prNumber || (await nextNumber(orgId, "purchaseRequest", "PR")),
  }),
});
