import { CarrierInterface, ShipmentDetails, ShippingRate, TrackingInfo } from "./index";

const GIG_ZONES: Record<string, { name: string; cities: string[]; basePrice: number; days: number }[]> = {
  NG: [
    { name: "GIG Lagos Metro", cities: ["Lagos", "Ikeja", "Victoria Island", "Lekki", "Surulere", "Yaba"], basePrice: 2500, days: 1 },
    { name: "GIG Abuja Metro", cities: ["Abuja", "Garki", "Wuse", "Maitama"], basePrice: 2500, days: 1 },
    { name: "GIG Port Harcourt", cities: ["Port Harcourt", "Rivers"], basePrice: 2800, days: 1 },
    { name: "GIG Intercity Express", cities: [], basePrice: 4500, days: 2 },
  ],
};

export const gigCarrier: CarrierInterface = {
  code: "gig",
  name: "GIG Logistics",

  async getRates(details: ShipmentDetails): Promise<ShippingRate[]> {
    const zones = GIG_ZONES[details.destination.country] || GIG_ZONES.NG;
    const curr = details.destination.country === "NG" ? "NGN" : "USD";
    return zones.map((z) => {
      const matches = z.cities.some((c) => (details.destination.city || "").toLowerCase().includes(c.toLowerCase()));
      const weightSurcharge = Math.max(0, Math.ceil((details.weight - 5) / 5)) * 0.15;
      return {
        carrier: "gig",
        carrierName: "GIG Logistics",
        serviceName: z.name,
        price: z.basePrice * (1 + weightSurcharge) * (matches ? 1 : 1.1),
        currency: curr,
        estimatedDays: matches ? z.days : z.days + 1,
        isTracked: true,
        isInsured: false,
      };
    });
  },

  async createLabel(details: ShipmentDetails, rate: ShippingRate): Promise<{ labelUrl: string; trackingNumber: string; trackingUrl: string }> {
    const tn = `GIG${Date.now()}`;
    return { labelUrl: "", trackingNumber: tn, trackingUrl: `https://giglogistics.com/track/${tn}` };
  },

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    return {
      carrier: "gig", trackingNumber,
      status: "in_transit",
      estimatedDelivery: new Date(Date.now() + 2 * 86400000).toISOString(),
      events: [{ date: new Date().toISOString(), location: "GIG Hub", description: "Package with GIG Logistics" }],
    };
  },

  async validateAddress(address: { country: string; city: string; postalCode: string; address: string }): Promise<{ valid: boolean; suggestions?: string[] }> {
    return { valid: address.city?.length > 0 && address.country?.length > 0 };
  },
};
