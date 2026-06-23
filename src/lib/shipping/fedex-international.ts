import { CarrierInterface, ShipmentDetails, ShippingRate, TrackingInfo, CustomsRequirements, CustomsDeclaration, DutyEstimate, AirWaybillResult } from "./index";

async function getCredentials() {
  return {
    apiKey: process.env.FEDEX_API_KEY || "",
    apiSecret: process.env.FEDEX_API_SECRET || "",
    accountNumber: process.env.FEDEX_ACCOUNT_NUMBER || "",
  };
}

export const fedexInternationalCarrier: CarrierInterface = {
  code: "fedex-international",
  name: "FedEx International",

  async getRates(details: ShipmentDetails): Promise<ShippingRate[]> {
    const creds = await getCredentials();
    if (!creds.apiKey) return mockFedExIntlRates(details);
    try {
      const tokenRes = await fetch("https://apis.fedex.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "client_credentials", client_id: creds.apiKey, client_secret: creds.apiSecret }),
      });
      const { access_token } = await tokenRes.json();
      const res = await fetch("https://apis.fedex.com/rate/v1/rates/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${access_token}` },
        body: JSON.stringify({
          accountNumber: { value: creds.accountNumber },
          requestedShipment: {
            shipper: { address: { countryCode: details.origin.country } },
            recipient: { address: { countryCode: details.destination.country } },
            requestedPackageLineItems: [{ weight: { value: details.weight, units: "KG" } }],
            customsClearanceDetail: { commodities: [{ numberOfPieces: 1, countryOfOrigin: details.origin.country, unitPrice: details.value }] },
          },
        }),
      });
      if (!res.ok) return mockFedExIntlRates(details);
      const data = await res.json();
      return (data.output?.rateReplyDetails || []).map((r: any) => ({
        carrier: "fedex-international",
        carrierName: "FedEx International",
        serviceName: r.serviceName,
        price: r.ratedShipmentDetails?.[0]?.totalNetCharge || details.weight * 9 + 20,
        currency: "USD",
        estimatedDays: r.operationalDetail?.estimatedDeliveryDays || 5,
        isTracked: true,
        isInsured: true,
      }));
    } catch {
      return mockFedExIntlRates(details);
    }
  },

  async createLabel(details: ShipmentDetails, rate: ShippingRate): Promise<{ labelUrl: string; trackingNumber: string; trackingUrl: string }> {
    const tn = `FXINT${Date.now()}`;
    return { labelUrl: `https://www.fedex.com/labels/${tn}`, trackingNumber: tn, trackingUrl: `https://www.fedex.com/fedextrack/?trknbr=${tn}` };
  },

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    return {
      carrier: "fedex-international", trackingNumber,
      status: "in_transit",
      estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString(),
      events: [{ date: new Date().toISOString(), location: "FedEx Memphis Hub", description: "International shipment in transit" }],
    };
  },

  async validateAddress(address: { country: string; city: string; postalCode: string; address: string }): Promise<{ valid: boolean; suggestions?: string[] }> {
    return { valid: true };
  },

  async getCustomsRequirements(originCountry: string, destCountry: string, itemCategory: string): Promise<CustomsRequirements> {
    const requiredDocs = ["commercial_invoice", "packing_list"];
    if (itemCategory === "electronics") requiredDocs.push("fcc_declaration");
    if (itemCategory === "food") requiredDocs.push("fda_declaration");
    return {
      requiredDocuments: requiredDocs,
      notes: ["All values must be in USD", "HS codes required for all items"],
      restrictedItems: [],
      dutiesApplicable: true,
      estimatedDutyRate: 0.04,
      estimatedVatRate: 0.1,
    };
  },

  async generateCustomsDeclaration(shipmentDetails: ShipmentDetails): Promise<CustomsDeclaration> {
    const value = shipmentDetails.value || 0;
    const docType = value <= 300 ? "cn22" : "commercial_invoice";
    return {
      documentType: docType as CustomsDeclaration["documentType"],
      documentUrl: "",
      documentNumber: `FEDEXCD-${Date.now()}`,
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
    const dutyRate = 0.04;
    const vatRate = 0.1;
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
    const awbNumber = `FX-${Date.now()}`;
    return {
      awbNumber,
      awbUrl: `https://apis.fedex.com/awb/${awbNumber}`,
      carrierCode: "fedex-international",
      departureDate: new Date(Date.now() + 86400000).toISOString(),
      arrivalDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    };
  },
};

function mockFedExIntlRates(details: ShipmentDetails): ShippingRate[] {
  const base = details.weight * 9 + 20;
  return [
    { carrier: "fedex-international", carrierName: "FedEx International", serviceName: "International Priority", price: base * 1.5, currency: "USD", estimatedDays: 2, isTracked: true, isInsured: true },
    { carrier: "fedex-international", carrierName: "FedEx International", serviceName: "International Economy", price: base, currency: "USD", estimatedDays: 5, isTracked: true, isInsured: true },
    { carrier: "fedex-international", carrierName: "FedEx International", serviceName: "International Ground", price: base * 0.65, currency: "USD", estimatedDays: 7, isTracked: true, isInsured: false },
  ];
}
