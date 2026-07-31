import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosAnnouncement, { searchFields: ["title", "content"], orderBy: { publishedAt: "desc" } });
export const POST = createCreateHandler(prisma.bosAnnouncement);
