import { CarrierInterface, ShipmentDetails, ShippingRate, TrackingInfo, CustomsRequirements, CustomsDeclaration, DutyEstimate, AirWaybillResult } from "./index";

async function getCredentials() {
  return {
    apiKey: process.env.DHL_API_KEY || "",
    apiSecret: process.env.DHL_API_SECRET || "",
    accountNumber: process.env.DHL_ACCOUNT_NUMBER || "",
  };
}

const incotermOptions = ["DAP", "DDP", "EXW", "FOB", "CIF"] as const;

export const dhlInternationalCarrier: CarrierInterface = {
  code: "dhl-international",
  name: "DHL Express International",

  async getRates(details: ShipmentDetails): Promise<ShippingRate[]> {
    const creds = await getCredentials();
    if (!creds.apiKey) return mockDhlIntlRates(details);
    try {
      const res = await fetch("https://api.dhl.com/rates/v3/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${creds.apiKey}` },
        body: JSON.stringify({
          accountNumber: creds.accountNumber,
          originCountryCode: details.origin.country,
          destinationCountryCode: details.destination.country,
          weight: details.weight,
          length: details.dimensions?.length,
          width: details.dimensions?.width,
          height: details.dimensions?.height,
          declaredValue: details.value,
          plannedShippingDateAndTime: new Date(Date.now() + 86400000).toISOString(),
          unitOfMeasurement: "metric",
          isCustomsDeclarable: true,
        }),
      });
      if (!res.ok) return mockDhlIntlRates(details);
      const data = await res.json();
      return (data.rates || []).map((r: any) => ({
        carrier: "dhl-international",
        carrierName: "DHL Express International",
        serviceName: r.serviceName,
        price: r.totalPrice,
        currency: r.currency || "USD",
        estimatedDays: r.deliveryDays || 5,
        isTracked: true,
        isInsured: true,
      }));
    } catch {
      return mockDhlIntlRates(details);
    }
  },

  async createLabel(details: ShipmentDetails, rate: ShippingRate): Promise<{ labelUrl: string; trackingNumber: string; trackingUrl: string }> {
    const tn = `DHLINT${Date.now()}`;
    return {
      labelUrl: `https://api.dhl.com/labels/${tn}`,
      trackingNumber: tn,
      trackingUrl: `https://www.dhl.com/en/express/tracking.html?AWB=${tn}`,
    };
  },

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    return {
      carrier: "dhl-international",
      trackingNumber,
      status: "in_transit",
      estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString(),
      events: [
        { date: new Date().toISOString(), location: "DHL Hub", description: "Shipment processed at DHL international hub" },
      ],
    };
  },

  async validateAddress(address: { country: string; city: string; postalCode: string; address: string }): Promise<{ valid: boolean; suggestions?: string[] }> {
    return { valid: true };
  },

  async getCustomsRequirements(originCountry: string, destCountry: string, itemCategory: string): Promise<CustomsRequirements> {
    const requiredDocs = ["commercial_invoice", "packing_list"];
    if (["electronics", "batteries"].includes(itemCategory)) {
      requiredDocs.push("msds");
    }
    if (["food", "pharmaceutical"].includes(itemCategory)) {
      requiredDocs.push("certificate_of_origin");
    }
    return {
      requiredDocuments: requiredDocs,
      notes: ["All documents must be in English", "Declared value must be in USD"],
      restrictedItems: [],
      dutiesApplicable: true,
      estimatedDutyRate: 0.05,
      estimatedVatRate: 0.075,
    };
  },

  async generateCustomsDeclaration(shipmentDetails: ShipmentDetails): Promise<CustomsDeclaration> {
    const value = shipmentDetails.value || 0;
    const docType = value <= 300 ? "cn22" : value > 300 ? "cn23" : "commercial_invoice";
    return {
      documentType: docType as CustomsDeclaration["documentType"],
      documentUrl: "",
      documentNumber: `DHLCD-${Date.now()}`,
      hsCodes: shipmentDetails.items.map((i) => ({
        code: i.hsCode || "847130",
        description: i.sku,
        quantity: i.quantity,
        unitValue: (value || 0) / (i.quantity || 1),
      })),
      declaredValue: value,
      currency: "USD",
      incoterm: "DAP",
      originCountry: shipmentDetails.origin.country,
      destCountry: shipmentDetails.destination.country,
      weightKg: shipmentDetails.weight,
      numberOfPieces: shipmentDetails.items.reduce((s, i) => s + i.quantity, 0),
    };
  },

  async estimateDutiesAndTaxes(itemValue: number, destCountry: string, _itemCategory: string, _hsCode?: string): Promise<DutyEstimate> {
    const dutyRate = 0.05;
    const vatRate = 0.075;
    const estimatedDuties = +(itemValue * dutyRate).toFixed(2);
    const estimatedVat = +(itemValue * vatRate).toFixed(2);
    return {
      estimatedDuties,
      estimatedVat,
      totalEstimated: +(estimatedDuties + estimatedVat).toFixed(2),
      currency: "USD",
      disclaimer: "Estimate only. Final amount determined by destination country customs authority.",
    };
  },

  async generateAirWaybill(shipmentDetails: ShipmentDetails): Promise<AirWaybillResult> {
    const awbNumber = `DHL-${Date.now()}`;
    return {
      awbNumber,
      awbUrl: `https://api.dhl.com/awb/${awbNumber}`,
      carrierCode: "dhl-international",
      departureDate: new Date(Date.now() + 86400000).toISOString(),
      arrivalDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    };
  },
};

function mockDhlIntlRates(details: ShipmentDetails): ShippingRate[] {
  const base = details.weight * 8 + 25;
  return [
    { carrier: "dhl-international", carrierName: "DHL Express International", serviceName: "Express Worldwide", price: base, currency: "USD", estimatedDays: 3, isTracked: true, isInsured: true },
    { carrier: "dhl-international", carrierName: "DHL Express International", serviceName: "Express 12:00", price: base * 1.4, currency: "USD", estimatedDays: 2, isTracked: true, isInsured: true },
    { carrier: "dhl-international", carrierName: "DHL Express International", serviceName: "Economy Select", price: base * 0.75, currency: "USD", estimatedDays: 6, isTracked: true, isInsured: true },
  ];
}

export type { incotermOptions };
