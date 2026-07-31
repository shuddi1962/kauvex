import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";
import { nextNumber } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosNcr, { searchFields: ["ncrNumber", "title"] });

export const POST = createCreateHandler(prisma.bosNcr, {
  transform: async (body, orgId) => ({
    ...body,
    ncrNumber: body.ncrNumber || (await nextNumber(orgId, "ncr", "NCR")),
  }),
});
