import { prisma } from "@/lib/prisma";

export interface GeofenceAlertInput {
  shipmentId?: string;
  accountId?: string;
  alertName: string;
  triggerType: string;
  city?: string;
  countryCode?: string;
  radiusKm?: number;
  latitude?: number;
  longitude?: number;
}

export async function createGeofenceAlert(data: GeofenceAlertInput) {
  return (prisma as any).kspGeofenceAlert.create({
    data: {
      shipmentId: data.shipmentId,
      accountId: data.accountId,
      alertName: data.alertName,
      triggerType: data.triggerType,
      city: data.city,
      countryCode: data.countryCode,
      radiusKm: data.radiusKm,
      latitude: data.latitude,
      longitude: data.longitude,
      triggered: false,
      notificationSent: false,
    },
  });
}

export async function checkGeofenceAlerts(shipmentId: string, currentLat: number, currentLng: number) {
  const alerts = await (prisma as any).kspGeofenceAlert.findMany({
    where: { shipmentId, triggered: false },
  });

  const triggeredAlerts = [];

  for (const alert of alerts) {
    if (!alert.latitude || !alert.longitude) continue;

    const distance = haversineDistance(currentLat, currentLng, Number(alert.latitude), Number(alert.longitude));

    if (alert.triggerType === "distance" && distance <= Number(alert.radiusKm || 5)) {
      await (prisma as any).kspGeofenceAlert.update({
        where: { id: alert.id },
        data: { triggered: true, triggeredAt: new Date(), notificationSent: true },
      });
      triggeredAlerts.push(alert);
    }
  }

  return triggeredAlerts;
}

export async function getGeofenceAlerts(accountId?: string, shipmentId?: string) {
  const where: any = {};
  if (accountId) where.accountId = accountId;
  if (shipmentId) where.shipmentId = shipmentId;

  return (prisma as any).kspGeofenceAlert.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteGeofenceAlert(id: string) {
  return (prisma as any).kspGeofenceAlert.delete({ where: { id } });
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getCargoPhotos(shipmentId: string) {
  return (prisma as any).kspCargoPhoto.findMany({
    where: { shipmentId },
    orderBy: { createdAt: "asc" },
  });
}

export async function addCargoPhoto(data: {
  shipmentId: string;
  shipmentType?: string;
  checkpointType: string;
  photoUrl: string;
  takenByType?: string;
  takenById?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}) {
  return (prisma as any).kspCargoPhoto.create({
    data: {
      shipmentId: data.shipmentId,
      shipmentType: data.shipmentType,
      checkpointType: data.checkpointType,
      photoUrl: data.photoUrl,
      takenByType: data.takenByType,
      takenById: data.takenById,
      latitude: data.latitude,
      longitude: data.longitude,
      notes: data.notes,
    },
  });
}
