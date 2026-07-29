import prisma from "@/lib/db"
import { Prisma } from "@/generated/prisma/client"

export interface PassportWithEvents {
  id: string
  entityType: string
  entityId: string
  title: string
  status: string
  trustScore: number | null
  qrCode: string | null
  passportData: Prisma.JsonValue
  documents: Prisma.JsonValue
  ownerId: string | null
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  events: DigitalPassportEventData[]
}

export interface DigitalPassportEventData {
  id: string
  passportId: string
  eventType: string
  title: string
  description: string | null
  eventDate: Date
  performedBy: string | null
  documents: Prisma.JsonValue
  metadata: Prisma.JsonValue
  createdAt: Date
}

export async function createPassport(data: {
  entityType: string
  entityId: string
  title: string
  ownerId?: string
  passportData?: Record<string, any>
}): Promise<PassportWithEvents> {
  const existing = await prisma.digitalPassport.findFirst({
    where: { entityType: data.entityType, entityId: data.entityId },
  })

  if (existing) {
    throw new Error(
      `Digital passport already exists for ${data.entityType} with ID ${data.entityId}`
    )
  }

  const passport = await prisma.digitalPassport.create({
    data: {
      entityType: data.entityType,
      entityId: data.entityId,
      title: data.title,
      ownerId: data.ownerId || null,
      passportData: (data.passportData as Prisma.JsonObject) || {},
      qrCode: null,
    },
    include: { events: true },
  })

  const qrCode = generateQRText(passport.id)
  await prisma.digitalPassport.update({
    where: { id: passport.id },
    data: { qrCode },
  })

  return prisma.digitalPassport.findUnique({
    where: { id: passport.id },
    include: { events: { orderBy: { eventDate: "desc" } } },
  }) as Promise<PassportWithEvents>
}

export async function getPassportByEntity(
  entityType: string,
  entityId: string
): Promise<PassportWithEvents | null> {
  return prisma.digitalPassport.findFirst({
    where: { entityType, entityId },
    include: { events: { orderBy: { eventDate: "desc" } } },
  }) as Promise<PassportWithEvents | null>
}

export async function getPassportById(
  id: string
): Promise<PassportWithEvents | null> {
  return prisma.digitalPassport.findUnique({
    where: { id },
    include: { events: { orderBy: { eventDate: "asc" } } },
  }) as Promise<PassportWithEvents | null>
}

export async function addPassportEvent(data: {
  passportId: string
  eventType: string
  title: string
  description?: string
  performedBy?: string
  metadata?: Record<string, any>
}): Promise<DigitalPassportEventData> {
  const event = await prisma.digitalPassportEvent.create({
    data: {
      passportId: data.passportId,
      eventType: data.eventType,
      title: data.title,
      description: data.description || null,
      performedBy: data.performedBy || null,
      metadata: (data.metadata as Prisma.JsonObject) || {},
    },
  })

  await updateTrustScore(data.passportId)

  return event as unknown as DigitalPassportEventData
}

export async function getOwnerPassports(
  ownerId: string
): Promise<PassportWithEvents[]> {
  return prisma.digitalPassport.findMany({
    where: { ownerId },
    include: {
      events: { orderBy: { eventDate: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  }) as Promise<PassportWithEvents[]>
}

export async function updateTrustScore(passportId: string): Promise<number> {
  const passport = await prisma.digitalPassport.findUnique({
    where: { id: passportId },
    include: { events: true },
  })

  if (!passport) throw new Error("Passport not found")

  let score = 50

  score += Math.min(passport.events.length * 5, 20)

  if (passport.isVerified) score += 15

  if (passport.documents && Array.isArray(passport.documents)) {
    score += Math.min(passport.documents.length * 3, 10)
  }

  if (passport.passportData && typeof passport.passportData === "object") {
    const keys = Object.keys(passport.passportData as Record<string, unknown>)
    score += Math.min(keys.length * 2, 10)
  }

  if (passport.status === "active") score += 5
  if (passport.status === "verified") score += 10

  score = Math.max(0, Math.min(100, score))

  await prisma.digitalPassport.update({
    where: { id: passportId },
    data: { trustScore: score },
  })

  return score
}

export function generateQRText(passportId: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    "http://localhost:3000"
  return `${baseUrl.replace(/\/$/, "")}/passport/${passportId}`
}
