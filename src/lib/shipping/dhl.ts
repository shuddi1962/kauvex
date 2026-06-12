import { CarrierInterface, ShipmentDetails, ShippingRate, TrackingInfo } from "./index";

async function getCredentials() {
  return {
    apiKey: process.env.DHL_API_KEY || "",
    apiSecret: process.env.DHL_API_SECRET || "",
    accountNumber: process.env.DHL_ACCOUNT_NUMBER || "",
  };
}

export const dhlCarrier: CarrierInterface = {
  code: "dhl",
  name: "DHL Express",

  async getRates(details: ShipmentDetails): Promise<ShippingRate[]> {
    const creds = await getCredentials();
    if (!creds.apiKey) {
      return mockDhlRates(details);
    }
    try {
      const res = await fetch("https://api.dhl.com/rates/v3/rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${creds.apiKey}`,
        },
        body: JSON.stringify({
          accountNumber: creds.accountNumber,
          originCountryCode: details.origin.country,
          originCity: details.origin.city,
          destinationCountryCode: details.destination.country,
          destinationCity: details.destination.city,
          weight: details.weight,
          length: details.dimensions?.length,
          width: details.dimensions?.width,
          height: details.dimensions?.height,
        }),
      });
      if (!res.ok) return mockDhlRates(details);
      const data = await res.json();
      return (data.rates || []).map((r: any) => ({
        carrier: "dhl",
        carrierName: "DHL Express",
        serviceName: r.serviceName,
        price: r.totalPrice,
        currency: r.currency || "USD",
        estimatedDays: r.deliveryDays || 5,
        isTracked: true,
        isInsured: r.totalPrice > 100,
      }));
    } catch {
      return mockDhlRates(details);
    }
  },

  async createLabel(details: ShipmentDetails, rate: ShippingRate): Promise<{ labelUrl: string; trackingNumber: string; trackingUrl: string }> {
    const creds = await getCredentials();
    if (!creds.apiKey) {
      const trackingNumber = `DHL${Date.now()}`;
      return {
        labelUrl: "",
        trackingNumber,
        trackingUrl: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
      };
    }
    const res = await fetch("https://api.dhl.com/shipments/v3/shipments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${creds.apiKey}`,
      },
      body: JSON.stringify({
        accountNumber: creds.accountNumber,
        serviceName: rate.serviceName,
        origin: details.origin,
        destination: details.destination,
        weight: details.weight,
      }),
    });
    const data = await res.json();
    return {
      labelUrl: data.labelUrl || "",
      trackingNumber: data.trackingNumber || `DHL${Date.now()}`,
      trackingUrl: `https://www.dhl.com/en/express/tracking.html?AWB=${data.trackingNumber || ""}`,
    };
  },

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    const creds = await getCredentials();
    if (!creds.apiKey) {
      return {
        carrier: "dhl",
        trackingNumber,
        status: "in_transit",
        estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString(),
        events: [
          { date: new Date().toISOString(), location: "Sorting Center", description: "Shipment is being processed" },
        ],
      };
    }
    const res = await fetch(`https://api.dhl.com/tracking/v3/shipments/${trackingNumber}`, {
      headers: { Authorization: `Bearer ${creds.apiKey}` },
    });
    const data = await res.json();
    return {
      carrier: "dhl",
      trackingNumber,
      status: mapDhlStatus(data.status),
      estimatedDelivery: data.estimatedDelivery,
      events: (data.events || []).map((e: any) => ({
        date: e.date,
        location: e.location?.address?.addressLocality || "Unknown",
        description: e.description,
      })),
    };
  },

  async validateAddress(address: { country: string; city: string; postalCode: string; address: string }): Promise<{ valid: boolean; suggestions?: string[] }> {
    return { valid: true };
  },
};

function mockDhlRates(details: ShipmentDetails): ShippingRate[] {
  const basePrice = details.weight * 5.5 + 10;
  return [
    { carrier: "dhl", carrierName: "DHL Express", serviceName: "Express Worldwide", price: basePrice, currency: "USD", estimatedDays: 3, isTracked: true, isInsured: true },
    { carrier: "dhl", carrierName: "DHL Express", serviceName: "Express 12:00", price: basePrice * 1.4, currency: "USD", estimatedDays: 2, isTracked: true, isInsured: true },
    { carrier: "dhl", carrierName: "DHL Express", serviceName: "Economy Select", price: basePrice * 0.75, currency: "USD", estimatedDays: 6, isTracked: true, isInsured: true },
  ];
}

function mapDhlStatus(status: string): TrackingInfo["status"] {
  const map: Record<string, TrackingInfo["status"]> = {
    "picked_up": "picked_up",
    "transit": "in_transit",
    "delivery": "out_for_delivery",
    "delivered": "delivered",
    "exception": "exception",
    "returned": "returned",
  };
  return map[status?.toLowerCase()] || "pending";
}
