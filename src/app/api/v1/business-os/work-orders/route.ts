import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";
import { nextNumber } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosWorkOrder, { searchFields: ["workOrderNumber", "title"] });

export const POST = createCreateHandler(prisma.bosWorkOrder, {
  transform: async (body, orgId) => ({
    ...body,
    workOrderNumber: body.workOrderNumber || (await nextNumber(orgId, "workOrder", "WO")),
  }),
});
