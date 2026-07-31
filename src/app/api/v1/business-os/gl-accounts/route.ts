import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosGlAccount, { searchFields: ["code", "name"], orderBy: { code: "asc" } });
export const POST = createCreateHandler(prisma.bosGlAccount);
