import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";
import { nextNumber } from "@/lib/business-os";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosIncident, { searchFields: ["incidentNumber", "title", "location"] });

export const POST = createCreateHandler(prisma.bosIncident, {
  transform: async (body, orgId) => ({
    ...body,
    incidentNumber: body.incidentNumber || (await nextNumber(orgId, "incident", "INC")),
  }),
});
