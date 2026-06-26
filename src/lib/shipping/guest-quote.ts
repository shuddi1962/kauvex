import { prisma } from "@/lib/prisma";

export interface QuoteRequest {
  originCountry: string;
  originCity: string;
  originPostcode?: string;
  destCountry: string;
  destCity: string;
  destPostcode?: string;
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  contentsType?: string;
  declaredValue?: number;
  isFragile?: boolean;
  hasBatteries?: boolean;
  hasLiquids?: boolean;
}

export interface QuoteOption {
  serviceLevel: string;
  serviceName: string;
  carrier: string;
  deliveryDays: number;
  deliveryRange: string;
  price: number;
  currency: string;
  features: string[];
  ddpAvailable: boolean;
  insuranceAvailable: boolean;
  insurancePremium: number;
  dutiesEstimate: number;
}

const SIZE_PRESETS: Record<string, { l: number; w: number; h: number; maxKg: number }> = {
  letter: { l: 35, w: 25, h: 2, maxKg: 0.5 },
  small: { l: 30, w: 20, h: 15, maxKg: 2 },
  medium: { l: 45, w: 35, h: 25, maxKg: 10 },
  large: { l: 60, w: 50, h: 40, maxKg: 25 },
  xlarge: { l: 80, w: 60, h: 50, maxKg: 30 },
  pallet: { l: 120, w: 100, h: 100, maxKg: 500 },
};

export function calculateDimensionalWeight(l: number, w: number, h: number): number {
  return (l * w * h) / 5000;
}

export function getChargeableWeight(actualKg: number, dimKg: number): number {
  return Math.max(actualKg, dimKg);
}

export async function getGuestQuote(req: QuoteRequest): Promise<QuoteOption[]> {
  const { originCountry, destCountry, weightKg, declaredValue = 0 } = req;

  const isDomestic = originCountry === destCountry;
  const isInternational = !isDomestic;
  const isEU = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"].includes(destCountry);

  const rateCards = await (prisma as any).glxRateCard.findMany({
    where: {
      originCountry: isDomestic ? originCountry : undefined,
      destCountry: isDomestic ? undefined : destCountry,
      isActive: true,
    },
  });

  const baseEconomy = isDomestic ? 1500 : 4500;
  const baseStandard = isDomestic ? 2500 : 7500;
  const baseExpress = isDomestic ? 4000 : 12000;
  const baseSameDay = isDomestic ? 6000 : 0;

  const weightMultiplier = Math.max(1, weightKg / 1);
  const dutiesEstimate = isInternational ? Math.round(declaredValue * 0.12) : 0;

  const options: QuoteOption[] = [];

  if (isDomestic) {
    options.push({
      serviceLevel: "economy",
      serviceName: "Kauvex Economy",
      carrier: "kauvex-logistics",
      deliveryDays: 3,
      deliveryRange: "2-4 days",
      price: Math.round(baseEconomy * weightMultiplier),
      currency: "NGN",
      features: ["Basic tracking", "Email updates"],
      ddpAvailable: false,
      insuranceAvailable: true,
      insurancePremium: Math.round(declaredValue * 0.015),
      dutiesEstimate: 0,
    });
  }

  options.push({
    serviceLevel: "standard",
    serviceName: "Kauvex Standard",
    carrier: isDomestic ? "kauvex-logistics" : "dhl-international",
    deliveryDays: isDomestic ? 2 : 5,
    deliveryRange: isDomestic ? "1-3 days" : "3-7 days",
    price: Math.round(baseStandard * weightMultiplier),
    currency: "NGN",
    features: ["Full tracking", "SMS updates", "Email notifications"],
    ddpAvailable: isInternational,
    insuranceAvailable: true,
    insurancePremium: Math.round(declaredValue * 0.015),
    dutiesEstimate,
  });

  options.push({
    serviceLevel: "express",
    serviceName: isInternational ? "DHL Express" : "Kauvex Express",
    carrier: isInternational ? "dhl-express-international" : "kauvex-express",
    deliveryDays: isDomestic ? 1 : 3,
    deliveryRange: isDomestic ? "Next day" : "2-4 days",
    price: Math.round(baseExpress * weightMultiplier),
    currency: "NGN",
    features: ["Real-time GPS tracking", "Signature required", "Insurance included", "Priority handling"],
    ddpAvailable: isInternational,
    insuranceAvailable: true,
    insurancePremium: 0,
    dutiesEstimate,
  });

  if (isDomestic) {
    options.push({
      serviceLevel: "same_day",
      serviceName: "Kauvex Same Day",
      carrier: "kauvex-logistics",
      deliveryDays: 0,
      deliveryRange: "Today",
      price: Math.round(baseSameDay * weightMultiplier),
      currency: "NGN",
      features: ["Live GPS tracking", "Instant pickup", "Real-time updates"],
      ddpAvailable: false,
      insuranceAvailable: true,
      insurancePremium: Math.round(declaredValue * 0.02),
      dutiesEstimate: 0,
    });
  }

  return options;
}

export async function createGuestShipment(data: {
  quoteRequestId?: string;
  senderName: string;
  senderPhone: string;
  senderEmail?: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail?: string;
  pickupAddress: string;
  pickupCity: string;
  pickupCountry: string;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffCountry: string;
  serviceLevel: string;
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  contentsType?: string;
  declaredValue?: number;
  packForMe?: boolean;
  specialInstructions?: string;
  lockerId?: string;
  lockerCompartmentId?: string;
}) {
  const waybillNumber = `KVX-EXP-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const shipment = await (prisma as any).expressShipment.create({
    data: {
      waybillNumber,
      senderName: data.senderName,
      senderPhone: data.senderPhone,
      senderEmail: data.senderEmail,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      pickupAddress: data.pickupAddress,
      pickupCity: data.pickupCity,
      pickupCountry: data.pickupCountry,
      dropoffAddress: data.dropoffAddress,
      dropoffCity: data.dropoffCity,
      dropoffCountry: data.dropoffCountry,
      serviceLevel: data.serviceLevel,
      weightKg: data.weightKg,
      lengthCm: data.lengthCm,
      widthCm: data.widthCm,
      heightCm: data.heightCm,
      contentsType: data.contentsType,
      declaredValue: data.declaredValue,
      packForMe: data.packForMe ?? false,
      specialInstructions: data.specialInstructions,
      lockerId: data.lockerId,
      lockerCompartmentId: data.lockerCompartmentId,
      isGuest: true,
      status: "pending",
      paymentStatus: "pending",
    },
  });

  await (prisma as any).kspPlatformEvent.create({
    data: {
      eventType: "express_booking",
      eventData: { waybillNumber, serviceLevel: data.serviceLevel, isGuest: true },
      countryCode: data.pickupCountry,
      city: data.pickupCity,
    },
  });

  return shipment;
}

export async function createAccountShipment(data: {
  accountId: string;
  senderName: string;
  senderPhone: string;
  senderEmail?: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail?: string;
  pickupAddress: string;
  pickupCity: string;
  pickupCountry: string;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffCountry: string;
  serviceLevel: string;
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  contentsType?: string;
  declaredValue?: number;
  packForMe?: boolean;
  specialInstructions?: string;
  lockerId?: string;
  lockerCompartmentId?: string;
}) {
  const account = await (prisma as any).kspExpressAccount.findUnique({
    where: { id: data.accountId },
  });

  if (!account) throw new Error("Account not found");

  const waybillNumber = `KVX-EXP-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const shipment = await (prisma as any).expressShipment.create({
    data: {
      waybillNumber,
      accountId: data.accountId,
      senderName: data.senderName,
      senderPhone: data.senderPhone,
      senderEmail: data.senderEmail,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      pickupAddress: data.pickupAddress,
      pickupCity: data.pickupCity,
      pickupCountry: data.pickupCountry,
      dropoffAddress: data.dropoffAddress,
      dropoffCity: data.dropoffCity,
      dropoffCountry: data.dropoffCountry,
      serviceLevel: data.serviceLevel,
      weightKg: data.weightKg,
      lengthCm: data.lengthCm,
      widthCm: data.widthCm,
      heightCm: data.heightCm,
      contentsType: data.contentsType,
      declaredValue: data.declaredValue,
      packForMe: data.packForMe ?? false,
      specialInstructions: data.specialInstructions,
      lockerId: data.lockerId,
      lockerCompartmentId: data.lockerCompartmentId,
      isGuest: false,
      status: "pending",
      paymentStatus: "pending",
    },
  });

  await (prisma as any).kspExpressAccount.update({
    where: { id: data.accountId },
    data: {
      monthlyVolume: { increment: 1 },
      monthlySpend: { increment: shipment.pricePaid ?? 0 },
    },
  });

  await (prisma as any).kspPlatformEvent.create({
    data: {
      eventType: "express_booking",
      eventData: { waybillNumber, serviceLevel: data.serviceLevel, isGuest: false, accountId: data.accountId },
      countryCode: data.pickupCountry,
      city: data.pickupCity,
    },
  });

  return shipment;
}
