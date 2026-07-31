import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosCustomer, { searchFields: ["name", "email", "phone", "customerCode"] });
export const POST = createCreateHandler(prisma.bosCustomer);
