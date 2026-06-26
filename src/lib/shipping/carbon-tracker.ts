import { prisma } from "@/lib/prisma";

const CO2_FACTORS: Record<string, number> = {
  "kauvex-logistics": 50,
  "kauvex-express": 60,
  "dhl": 80,
  "dhl-international": 120,
  "dhl-express-international": 150,
  "fedex": 75,
  "fedex-international": 110,
  "aramex": 70,
  "aramex-international": 100,
  "gig-logistics": 45,
  "kwik-delivery": 40,
  "freight-forwarder": 200,
};

export async function calculateCarbonFootprint(data: {
  shipmentId?: string;
  accountId?: string;
  originCountry: string;
  destCountry: string;
  weightKg: number;
  carrierUsed: string;
  serviceLevel: string;
  distanceKm?: number;
}) {
  const isDomestic = data.originCountry === data.destCountry;
  const distanceKm = data.distanceKm || (isDomestic ? 500 : 5000);

  const factor = CO2_FACTORS[data.carrierUsed] || 80;
  const weightFactor = Math.max(0.5, data.weightKg / 5);
  const co2Grams = Math.round(distanceKm * factor * weightFactor * 0.001);

  const record = await (prisma as any).kspCarbonFootprint.create({
    data: {
      shipmentId: data.shipmentId,
      accountId: data.accountId,
      countryCode: data.originCountry,
      distanceKm,
      weightKg: data.weightKg,
      co2Grams,
      carrierUsed: data.carrierUsed,
      serviceLevel: data.serviceLevel,
    },
  });

  return record;
}

export async function getAccountCarbonStats(accountId: string, months: number = 1) {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const records = await (prisma as any).kspCarbonFootprint.findMany({
    where: { accountId, calculatedAt: { gte: since } },
  });

  const totalCO2 = records.reduce((sum: number, r: any) => sum + Number(r.co2Grams || 0), 0);
  const totalShipments = records.length;
  const avgCO2 = totalShipments > 0 ? Math.round(totalCO2 / totalShipments) : 0;
  const treesNeeded = Math.ceil(totalCO2 / 21000);

  return {
    totalCO2Grams: totalCO2,
    totalCO2Kg: Math.round(totalCO2 / 100) / 10,
    totalShipments,
    avgCO2PerShipment: avgCO2,
    treesForOffset: treesNeeded,
    treesPlanted: records.reduce((sum: number, r: any) => sum + (r.treesPlanted || 0), 0),
  };
}

export async function offsetShipmentCarbon(shipmentId: string, treesToPlant: number) {
  const record = await (prisma as any).kspCarbonFootprint.findFirst({
    where: { shipmentId },
    orderBy: { calculatedAt: "desc" },
  });

  if (!record) throw new Error("Carbon footprint not found for this shipment");

  await (prisma as any).kspCarbonFootprint.update({
    where: { id: record.id },
    data: { offsetPurchased: true, treesPlanted: treesToPlant },
  });

  return { success: true, treesPlanted: treesToPlant };
}
