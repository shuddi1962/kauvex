import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosContact, { searchFields: ["firstName", "lastName", "email", "phone"] });
export const POST = createCreateHandler(prisma.bosContact);
