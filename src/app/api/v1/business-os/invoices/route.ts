import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";
import { nextNumber } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosInvoice, { searchFields: ["invoiceNumber", "partyName"] });

export const POST = createCreateHandler(prisma.bosInvoice, {
  transform: async (body, orgId) => ({
    ...body,
    invoiceNumber: body.invoiceNumber || (await nextNumber(orgId, "invoice", body.direction === "payable" ? "BILL" : "INV")),
  }),
});
