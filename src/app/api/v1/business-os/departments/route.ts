import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosDepartment, { searchFields: ["name", "code"], orderBy: { name: "asc" } });
export const POST = createCreateHandler(prisma.bosDepartment);
