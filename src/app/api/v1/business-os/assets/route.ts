import { prisma } from "@/lib/prisma";
import { createListHandler, createCreateHandler } from "@/lib/business-os/crud";

export const dynamic = "force-dynamic";

export const GET = createListHandler(prisma.bosAsset, { searchFields: ["name", "assetCode", "assetTag", "serialNumber"] });
export const POST = createCreateHandler(prisma.bosAsset);
