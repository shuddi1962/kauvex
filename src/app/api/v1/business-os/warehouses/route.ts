import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosWarehouse, { searchFields: ["name"] });
export const POST = createCreateHandler(prisma.bosWarehouse);
