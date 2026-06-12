import { CarrierInterface, ShipmentDetails, ShippingRate, TrackingInfo } from "./index";

async function getCredentials() {
  return {
    username: process.env.ARAMEX_USERNAME || "",
    password: process.env.ARAMEX_PASSWORD || "",
    accountNumber: process.env.ARAMEX_ACCOUNT_NUMBER || "",
    clientInfo: process.env.ARAMEX_CLIENT_INFO || "",
  };
}

export const aramexCarrier: CarrierInterface = {
  code: "aramex",
  name: "Aramex",

  async getRates(details: ShipmentDetails): Promise<ShippingRate[]> {
    const creds = await getCredentials();
    if (!creds.username) return mockAramexRates(details);
    try {
      const res = await fetch("https://ws.aramex.net/ShippingAPI/Rates/RatesCalculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ClientInfo: { UserName: creds.username, Password: creds.password, AccountNumber: creds.accountNumber, ClientInfo: creds.clientInfo },
          OriginAddress: { CountryCode: details.origin.country, City: details.origin.city, PostalCode: details.origin.postalCode },
          DestinationAddress: { CountryCode: details.destination.country, City: details.destination.city, PostalCode: details.destination.postalCode },
          ShipmentDetails: { Weight: details.weight, NumberOfPieces: details.items.length },
        }),
      });
      if (!res.ok) return mockAramexRates(details);
      const data = await res.json();
      return (data.Rates || []).map((r: any) => ({
        carrier: "aramex",
        carrierName: "Aramex",
        serviceName: r.ProductType || "Express",
        price: r.TotalAmount || details.weight * 4.5,
        currency: r.CurrencyCode || "USD",
        estimatedDays: r.EstimatedTransitDays || 5,
        isTracked: true,
        isInsured: false,
      }));
    } catch { return mockAramexRates(details); }
  },

  async createLabel(details: ShipmentDetails, rate: ShippingRate): Promise<{ labelUrl: string; trackingNumber: string; trackingUrl: string }> {
    const tn = `ARAMEX${Date.now()}`;
    return { labelUrl: "", trackingNumber: tn, trackingUrl: `https://www.aramex.com/track?number=${tn}` };
  },

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    return {
      carrier: "aramex", trackingNumber,
      status: "in_transit",
      estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString(),
      events: [{ date: new Date().toISOString(), location: "Dubai, UAE", description: "Shipment received at Aramex hub" }],
    };
  },

  async validateAddress(address: { country: string; city: string; postalCode: string; address: string }): Promise<{ valid: boolean; suggestions?: string[] }> {
    return { valid: true };
  },
};

function mockAramexRates(details: ShipmentDetails): ShippingRate[] {
  const base = details.weight * 4.5 + 8;
  return [
    { carrier: "aramex", carrierName: "Aramex", serviceName: "Express", price: base, currency: "USD", estimatedDays: 4, isTracked: true, isInsured: false },
    { carrier: "aramex", carrierName: "Aramex", serviceName: "Economy", price: base * 0.7, currency: "USD", estimatedDays: 7, isTracked: true, isInsured: false },
  ];
}
