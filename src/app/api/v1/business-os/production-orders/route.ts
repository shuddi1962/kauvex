import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";
import { nextNumber } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosProductionOrder, { searchFields: ["productionNumber", "workCenter"] });

export const POST = createCreateHandler(prisma.bosProductionOrder, {
  transform: async (body, orgId) => ({
    ...body,
    productionNumber: body.productionNumber || (await nextNumber(orgId, "productionOrder", "MO")),
  }),
});
