import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";
import { nextNumber } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosSalesOrder, { searchFields: ["orderNumber"] });

export const POST = createCreateHandler(prisma.bosSalesOrder, {
  transform: async (body, orgId) => ({
    ...body,
    orderNumber: body.orderNumber || (await nextNumber(orgId, "salesOrder", "SO")),
  }),
});
