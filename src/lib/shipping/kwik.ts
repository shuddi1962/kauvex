import { CarrierInterface, ShipmentDetails, ShippingRate, TrackingInfo } from "./index";

const KWIK_ZONES: Record<string, { name: string; cities: string[]; basePrice: number; minutes: number }[]> = {
  NG: [
    { name: "Kwik Same-Day Lagos", cities: ["Lagos", "Ikeja", "Victoria Island", "Lekki", "Surulere", "Yaba", "Maryland"], basePrice: 3200, minutes: 240 },
    { name: "Kwik Same-Day Abuja", cities: ["Abuja", "Wuse", "Garki", "Maitama"], basePrice: 3200, minutes: 240 },
    { name: "Kwik Same-Day Port Harcourt", cities: ["Port Harcourt"], basePrice: 3500, minutes: 300 },
    { name: "Kwik Intercity", cities: [], basePrice: 5500, minutes: 1440 },
  ],
};

export const kwikCarrier: CarrierInterface = {
  code: "kwik",
  name: "Kwik Delivery",

  async getRates(details: ShipmentDetails): Promise<ShippingRate[]> {
    const zones = KWIK_ZONES[details.destination.country] || KWIK_ZONES.NG;
    const curr = details.destination.country === "NG" ? "NGN" : "USD";
    return zones.map((z) => {
      const matches = z.cities.some((c) => (details.destination.city || "").toLowerCase().includes(c.toLowerCase()));
      const surgeMultiplier = details.weight > 10 ? 1.25 : 1;
      return {
        carrier: "kwik",
        carrierName: "Kwik Delivery",
        serviceName: z.name,
        price: z.basePrice * surgeMultiplier * (matches ? 1 : 1.15),
        currency: curr,
        estimatedDays: Math.ceil(z.minutes / 1440),
        isTracked: true,
        isInsured: true,
      };
    });
  },

  async createLabel(details: ShipmentDetails, rate: ShippingRate): Promise<{ labelUrl: string; trackingNumber: string; trackingUrl: string }> {
    const tn = `KWIK${Date.now()}`;
    return { labelUrl: "", trackingNumber: tn, trackingUrl: `https://kwik.delivery/track/${tn}` };
  },

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    return {
      carrier: "kwik", trackingNumber,
      status: "in_transit",
      estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
      events: [{ date: new Date().toISOString(), location: "Kwik Hub", description: "Package with Kwik Delivery" }],
    };
  },

  async validateAddress(address: { country: string; city: string; postalCode: string; address: string }): Promise<{ valid: boolean; suggestions?: string[] }> {
    return { valid: address.city?.length > 0 && address.country?.length > 0 };
  },
};
