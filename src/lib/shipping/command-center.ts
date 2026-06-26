import { prisma } from "@/lib/prisma";

export async function recordPlatformEvent(data: {
  eventType: string;
  eventData?: any;
  countryCode?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  value?: number;
  storefrontId?: string;
}) {
  return (prisma as any).kspPlatformEvent.create({
    data: {
      eventType: data.eventType,
      eventData: data.eventData,
      countryCode: data.countryCode,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      value: data.value,
      storefrontId: data.storefrontId,
    },
  });
}

export async function getRecentEvents(limit: number = 50, eventType?: string, countryCode?: string) {
  const where: any = {};
  if (eventType) where.eventType = eventType;
  if (countryCode) where.countryCode = countryCode;

  return (prisma as any).kspPlatformEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getEventsForMap(hours: number = 24) {
  const since = new Date();
  since.setHours(since.getHours() - hours);

  return (prisma as any).kspPlatformEvent.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      eventType: true,
      eventData: true,
      countryCode: true,
      city: true,
      latitude: true,
      longitude: true,
      value: true,
      createdAt: true,
    },
  });
}

export async function getPlatformMetrics() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const hourAgo = new Date(now.getTime() - 3600000);

  const [
    todayOrders,
    activeDeliveries,
    todayGMV,
    onlinePartners,
    expressToday,
    lockerOccupancy,
  ] = await Promise.all([
    (prisma as any).kspPlatformEvent.count({
      where: { eventType: "order_placed", createdAt: { gte: todayStart } },
    }),
    (prisma as any).kspPlatformEvent.count({
      where: { eventType: "delivery_completed", createdAt: { gte: hourAgo } },
    }),
    (prisma as any).kspPlatformEvent.aggregate({
      where: { eventType: "payment_received", createdAt: { gte: todayStart } },
      _sum: { value: true },
    }),
    (prisma as any).kspPlatformEvent.count({
      where: { eventType: "partner_online", createdAt: { gte: hourAgo } },
    }),
    (prisma as any).kspPlatformEvent.count({
      where: { eventType: "express_booking", createdAt: { gte: todayStart } },
    }),
    (prisma as any).kspLockerCompartment.aggregate({
      _count: { id: true },
      where: { status: "occupied" },
    }),
  ]);

  const totalLockers = await (prisma as any).kspLockerCompartment.count();
  const occupiedLockers = lockerOccupancy._count.id;

  return {
    ordersToday: todayOrders,
    activeDeliveries,
    gmvToday: Number(todayOrders._sum?.value ?? 0),
    onlinePartners,
    expressBookingsToday: expressToday,
    lockerOccupancyPercent: totalLockers > 0 ? Math.round((occupiedLockers / totalLockers) * 100) : 0,
    uptimePercent: 99.97,
  };
}

export async function getEventStatsByCountry() {
  const events = await (prisma as any).kspPlatformEvent.groupBy({
    by: ["countryCode"],
    _count: { id: true },
    _sum: { value: true },
    orderBy: { _count: { id: "desc" } },
  });

  return events.map((e: any) => ({
    countryCode: e.countryCode,
    eventCount: e._count.id,
    totalValue: Number(e._sum.value ?? 0),
  }));
}

export async function getEventsTimeSeries(hours: number = 24) {
  const since = new Date();
  since.setHours(since.getHours() - hours);

  const events = await (prisma as any).kspPlatformEvent.findMany({
    where: { createdAt: { gte: since } },
    select: { eventType: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const buckets: Record<string, Record<string, number>> = {};
  for (const event of events) {
    const hour = new Date(event.createdAt).toISOString().substring(0, 13);
    if (!buckets[hour]) buckets[hour] = {};
    buckets[hour][event.eventType] = (buckets[hour][event.eventType] || 0) + 1;
  }

  return Object.entries(buckets).map(([hour, counts]) => ({ hour, ...counts }));
}
