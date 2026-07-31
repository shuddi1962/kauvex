import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosDeal, { searchFields: ["dealName"], orderBy: { expectedClose: "asc" } });
export const POST = createCreateHandler(prisma.bosDeal);
