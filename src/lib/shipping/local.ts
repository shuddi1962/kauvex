import { CarrierInterface, ShipmentDetails, ShippingRate, TrackingInfo } from "./index";

const LOCAL_DELIVERY_ZONES: Record<string, { name: string; cities: string[]; basePrice: number; days: number }[]> = {
  NG: [
    { name: "Port Harcourt Metro", cities: ["Port Harcourt", "Rivers"], basePrice: 1500, days: 1 },
    { name: "Lagos Metro", cities: ["Lagos", "Ikeja", "Victoria Island", "Lekki"], basePrice: 2000, days: 1 },
    { name: "Abuja Metro", cities: ["Abuja", "Garki", "Wuse"], basePrice: 2000, days: 1 },
    { name: "South-South Region", cities: ["Uyo", "Calabar", "Benin City", "Warri"], basePrice: 3000, days: 2 },
    { name: "South-West Region", cities: ["Ibadan", "Abeokuta", "Akure", "Osogbo"], basePrice: 3000, days: 2 },
    { name: "North-Central Region", cities: ["Jos", "Makurdi", "Lafia", "Minna"], basePrice: 4000, days: 3 },
    { name: "North-West Region", cities: ["Kano", "Kaduna", "Sokoto", "Zaria"], basePrice: 4500, days: 3 },
    { name: "North-East Region", cities: ["Maiduguri", "Yola", "Bauchi", "Gombe"], basePrice: 5000, days: 4 },
    { name: "Nationwide Standard", cities: [], basePrice: 3500, days: 3 },
  ],
  US: [
    { name: "Local Same-Day", cities: [], basePrice: 5.99, days: 0 },
    { name: "Standard Shipping", cities: [], basePrice: 4.99, days: 5 },
    { name: "Express Shipping", cities: [], basePrice: 12.99, days: 2 },
  ],
  GB: [
    { name: "Royal Mail Standard", cities: [], basePrice: 3.99, days: 3 },
    { name: "Royal Mail Tracked", cities: [], basePrice: 6.99, days: 2 },
  ],
};

export const localCarrier: CarrierInterface = {
  code: "local",
  name: "Local Delivery",

  async getRates(details: ShipmentDetails): Promise<ShippingRate[]> {
    const countryZones = LOCAL_DELIVERY_ZONES[details.destination.country] || LOCAL_DELIVERY_ZONES.NG;
    const currency = getCurrency(details.destination.country);
    return countryZones.map((zone) => {
      const destCity = details.destination.city?.toLowerCase() || "";
      const matches = zone.cities.some((c) => destCity.includes(c.toLowerCase()));
      const priceMultiplier = matches && zone.cities.length > 0 ? 1 : zone.cities.length === 0 ? 1 : 1.2;
      const weightSurcharge = Math.max(1, Math.ceil(details.weight / 5)) * 0.1;
      return {
        carrier: "local",
        carrierName: "Local Delivery",
        serviceName: zone.name,
        price: zone.basePrice * (1 + weightSurcharge) * (matches ? 1 : 1),
        currency,
        estimatedDays: zone.days,
        isTracked: true,
        isInsured: zone.basePrice > 3000,
      };
    });
  },

  async createLabel(details: ShipmentDetails, rate: ShippingRate): Promise<{ labelUrl: string; trackingNumber: string; trackingUrl: string }> {
    const tn = `LOCAL${Date.now()}`;
    return { labelUrl: "", trackingNumber: tn, trackingUrl: "" };
  },

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    return {
      carrier: "local", trackingNumber,
      status: "in_transit",
      estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
      events: [{ date: new Date().toISOString(), location: "Local Hub", description: "Package in local delivery network" }],
    };
  },

  async validateAddress(address: { country: string; city: string; postalCode: string; address: string }): Promise<{ valid: boolean; suggestions?: string[] }> {
    return { valid: address.city?.length > 0 && address.country?.length > 0, suggestions: [] };
  },
};

function getCurrency(country: string): string {
  const currencies: Record<string, string> = { NG: "NGN", US: "USD", GB: "GBP", CA: "CAD", AU: "AUD", DE: "EUR", FR: "EUR" };
  return currencies[country] || "USD";
}
