import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";
import { nextNumber } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosQuotation, { searchFields: ["quoteNumber", "title"] });

export const POST = createCreateHandler(prisma.bosQuotation, {
  transform: async (body, orgId) => ({
    ...body,
    quoteNumber: body.quoteNumber || (await nextNumber(orgId, "quotation", "QT")),
  }),
});
