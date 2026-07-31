import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosDocument, { searchFields: ["title", "docType", "category", "tags"] });
export const POST = createCreateHandler(prisma.bosDocument);
