import { prisma } from "@/lib/prisma";

export interface W3WLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export function validateW3WAddress(address: string): boolean {
  // What3Words format: word.word.word (3 words separated by dots)
  const parts = address.split(".");
  if (parts.length !== 3) return false;
  return parts.every((p) => p.length > 0 && /^[a-zA-Z]+$/.test(p));
}

export async function saveW3WLocation(
  entityType: string,
  entityId: string,
  w3wAddress: string,
  latitude: number,
  longitude: number,
  countryCode?: string
) {
  return (prisma as any).glxWhat3WordsLocation.upsert({
    where: {
      entityType_entityId: { entityType, entityId },
    },
    create: {
      entityType,
      entityId,
      what3wordsAddress: w3wAddress,
      latitude,
      longitude,
      countryCode,
    },
    update: {
      what3wordsAddress: w3wAddress,
      latitude,
      longitude,
      countryCode,
    },
  });
}

export async function getW3WLocation(entityType: string, entityId: string) {
  return (prisma as any).glxWhat3WordsLocation.findUnique({
    where: {
      entityType_entityId: { entityType, entityId },
    },
  });
}

export async function getW3WByCountry(countryCode: string) {
  return (prisma as any).glxWhat3WordsLocation.findMany({
    where: { countryCode },
    orderBy: { createdAt: "desc" },
  });
}
