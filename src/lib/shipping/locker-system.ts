import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface LockerLocation {
  id: string;
  name: string;
  city: string;
  countryCode: string;
  lockerType: string;
  availableCompartments: number;
  latitude?: number;
  longitude?: number;
}

export interface CompartmentSize {
  size: string;
  label: string;
  l: number;
  w: number;
  h: number;
  maxKg: number;
}

export const COMPARTMENT_SIZES: CompartmentSize[] = [
  { size: "xs", label: "Letter/Document", l: 15, w: 10, h: 10, maxKg: 0.5 },
  { size: "s", label: "Small Parcel", l: 30, w: 20, h: 15, maxKg: 2 },
  { size: "m", label: "Medium Parcel", l: 45, w: 35, h: 25, maxKg: 10 },
  { size: "l", label: "Large Parcel", l: 60, w: 50, h: 40, maxKg: 25 },
  { size: "xl", label: "Extra Large", l: 80, w: 60, h: 50, maxKg: 30 },
];

export function generateCollectionPin(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function findNearbyLockers(city: string, countryCode: string, sizeNeeded?: string) {
  const where: any = {
    city,
    countryCode,
    status: "active",
  };

  const lockers = await (prisma as any).kspLocker.findMany({
    where,
    include: {
      compartments: {
        where: sizeNeeded ? { size: sizeNeeded, status: "available" } : { status: "available" },
      },
    },
    orderBy: { name: "asc" },
  });

  return lockers.map((locker: any) => ({
    id: locker.id,
    name: locker.name,
    locationName: locker.locationName,
    address: locker.address,
    city: locker.city,
    countryCode: locker.countryCode,
    lockerType: locker.lockerType,
    is24Hours: locker.is24Hours,
    hasRefrigerated: locker.hasRefrigerated,
    totalCompartments: locker.totalCompartments,
    availableCompartments: locker.compartments.length,
    latitude: locker.latitude ? Number(locker.latitude) : undefined,
    longitude: locker.longitude ? Number(locker.longitude) : undefined,
    availableSizes: locker.compartments.reduce((acc: any, c: any) => {
      acc[c.size] = (acc[c.size] || 0) + 1;
      return acc;
    }, {}),
  }));
}

export async function getLockerAvailability(lockerId: string) {
  const locker = await (prisma as any).kspLocker.findUnique({
    where: { id: lockerId },
    include: {
      compartments: true,
    },
  });

  if (!locker) return null;

  const bySize: Record<string, { total: number; available: number; occupied: number }> = {};
  for (const comp of locker.compartments) {
    if (!bySize[comp.size]) {
      bySize[comp.size] = { total: 0, available: 0, occupied: 0 };
    }
    bySize[comp.size].total++;
    if (comp.status === "available") bySize[comp.size].available++;
    if (comp.status === "occupied") bySize[comp.size].occupied++;
  }

  return {
    locker,
    availability: bySize,
  };
}

export async function bookCompartment(lockerId: string, shipmentId: string, shipmentType: string, sizeNeeded: string) {
  const compartment = await (prisma as any).kspLockerCompartment.findFirst({
    where: {
      lockerId,
      size: sizeNeeded,
      status: "available",
    },
  });

  if (!compartment) throw new Error("No compartment available for this size");

  const pin = generateCollectionPin();
  const qrUrl = `https://kauvex.com/locker/collect/${compartment.id}?pin=${pin}`;

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 96);

  const booking = await (prisma as any).kspLockerBooking.create({
    data: {
      compartmentId: compartment.id,
      lockerId,
      shipmentId,
      shipmentType,
      collectionPin: pin,
      collectionQrUrl: qrUrl,
      status: "awaiting_delivery",
      expiresAt,
    },
  });

  await (prisma as any).kspLockerCompartment.update({
    where: { id: compartment.id },
    data: { status: "reserved", currentShipmentId: shipmentId },
  });

  return { booking, pin, qrUrl };
}

export async function placeInLocker(bookingId: string, partnerId: string) {
  const booking = await (prisma as any).kspLockerBooking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking not found");

  const now = new Date();
  await (prisma as any).kspLockerBooking.update({
    where: { id: bookingId },
    data: { status: "delivered_to_locker", deliveredAt: now },
  });

  await (prisma as any).kspLockerCompartment.update({
    where: { id: booking.compartmentId },
    data: { status: "occupied", occupiedSince: now },
  });

  await (prisma as any).kspPlatformEvent.create({
    data: {
      eventType: "locker_collection",
      eventData: { bookingId, action: "placed", partnerId },
    },
  });

  return booking;
}

export async function collectFromLocker(compartmentId: string, pin: string) {
  const compartment = await (prisma as any).kspLockerCompartment.findUnique({
    where: { id: compartmentId },
    include: { bookings: { where: { status: "delivered_to_locker" }, orderBy: { deliveredAt: "desc" }, take: 1 } },
  });

  if (!compartment || compartment.bookings.length === 0) throw new Error("No package to collect");
  if (compartment.bookings[0].collectionPin !== pin) throw new Error("Invalid PIN");

  const booking = compartment.bookings[0];
  const now = new Date();

  await (prisma as any).kspLockerBooking.update({
    where: { id: booking.id },
    data: { status: "collected", collectedAt: now },
  });

  await (prisma as any).kspLockerCompartment.update({
    where: { id: compartmentId },
    data: { status: "available", currentShipmentId: null, occupiedSince: null },
  });

  await (prisma as any).kspPlatformEvent.create({
    data: {
      eventType: "locker_collection",
      eventData: { bookingId: booking.id, action: "collected" },
    },
  });

  return booking;
}

export async function getLockerStats(lockerId: string) {
  const bookings = await (prisma as any).kspLockerBooking.findMany({
    where: { lockerId },
  });

  const total = bookings.length;
  const collected = bookings.filter((b: any) => b.status === "collected").length;
  const expired = bookings.filter((b: any) => b.status === "expired").length;
  const avgDwellTime = bookings
    .filter((b: any) => b.deliveredAt && b.collectedAt)
    .reduce((acc: number, b: any) => {
      const hours = (new Date(b.collectedAt).getTime() - new Date(b.deliveredAt).getTime()) / 3600000;
      return acc + hours;
    }, 0) / (collected || 1);

  return {
    totalBookings: total,
    collected,
    expired,
    collectionRate: total > 0 ? Math.round((collected / total) * 100) : 0,
    avgDwellHours: Math.round(avgDwellTime * 10) / 10,
  };
}
