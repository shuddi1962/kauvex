import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosSupplier, { searchFields: ["name", "email", "category"] });
export const POST = createCreateHandler(prisma.bosSupplier);
