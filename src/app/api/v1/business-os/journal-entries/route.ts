import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosJournalEntry, { searchFields: ["description", "referenceType"], orderBy: { entryDate: "desc" } });
export const POST = createCreateHandler(prisma.bosJournalEntry);
