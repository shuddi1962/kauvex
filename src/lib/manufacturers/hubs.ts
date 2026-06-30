import prisma from "@/lib/db";

export interface ManufacturingHub {
  id: string;
  countryCode: string;
  city: string;
  hubName: string;
  primaryCategories: string[];
  description: string | null;
}

export async function listHubs(countryCode?: string) {
  const where = countryCode ? { countryCode } : {};

  const hubs = await prisma.mfgHub.findMany({
    where,
    orderBy: { hubName: "asc" },
  });

  return hubs.map((h) => ({
    id: h.id,
    countryCode: h.countryCode,
    city: h.city,
    hubName: h.hubName,
    primaryCategories: h.primaryCategories,
    description: h.description,
  }));
}

export async function getHubById(id: string) {
  const hub = await prisma.mfgHub.findUnique({ where: { id } });
  if (!hub) return null;

  return {
    id: hub.id,
    countryCode: hub.countryCode,
    city: hub.city,
    hubName: hub.hubName,
    primaryCategories: hub.primaryCategories,
    description: hub.description,
  };
}

export async function createHub(data: Omit<ManufacturingHub, 'id'>) {
  const hub = await prisma.mfgHub.create({
    data: {
      countryCode: data.countryCode,
      city: data.city,
      hubName: data.hubName,
      primaryCategories: data.primaryCategories,
      description: data.description,
    },
  });

  return {
    id: hub.id,
    countryCode: hub.countryCode,
    city: hub.city,
    hubName: hub.hubName,
    primaryCategories: hub.primaryCategories,
    description: hub.description,
  };
}
