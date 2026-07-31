import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";
import { nextNumber } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosPurchaseOrder, { searchFields: ["poNumber"] });

export const POST = createCreateHandler(prisma.bosPurchaseOrder, {
  transform: async (body, orgId) => ({
    ...body,
    poNumber: body.poNumber || (await nextNumber(orgId, "purchaseOrder", "PO")),
  }),
});
