import { CarrierInterface, ShipmentDetails, ShippingRate, TrackingInfo, CustomsRequirements, CustomsDeclaration, DutyEstimate, AirWaybillResult } from "./index";

async function getCredentials() {
  return {
    username: process.env.ARAMEX_USERNAME || "",
    password: process.env.ARAMEX_PASSWORD || "",
    accountNumber: process.env.ARAMEX_ACCOUNT_NUMBER || "",
    clientInfo: process.env.ARAMEX_CLIENT_INFO || "",
  };
}

export const aramexInternationalCarrier: CarrierInterface = {
  code: "aramex-international",
  name: "Aramex International",

  async getRates(details: ShipmentDetails): Promise<ShippingRate[]> {
    const creds = await getCredentials();
    if (!creds.username) return mockAramexIntlRates(details);
    try {
      const res = await fetch("https://ws.aramex.net/ShippingAPI/Rates/RatesCalculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ClientInfo: { UserName: creds.username, Password: creds.password, AccountNumber: creds.accountNumber },
          OriginAddress: { CountryCode: details.origin.country, City: details.origin.city },
          DestinationAddress: { CountryCode: details.destination.country, City: details.destination.city },
          ShipmentDetails: { Weight: details.weight, NumberOfPieces: details.items.length, DeclaredValue: details.value },
        }),
      });
      if (!res.ok) return mockAramexIntlRates(details);
      const data = await res.json();
      return (data.Rates || []).map((r: any) => ({
        carrier: "aramex-international",
        carrierName: "Aramex International",
        serviceName: r.ProductType || "International Express",
        price: r.TotalAmount || details.weight * 7,
        currency: r.CurrencyCode || "USD",
        estimatedDays: r.EstimatedTransitDays || 5,
        isTracked: true,
        isInsured: true,
      }));
    } catch {
      return mockAramexIntlRates(details);
    }
  },

  async createLabel(details: ShipmentDetails, rate: ShippingRate): Promise<{ labelUrl: string; trackingNumber: string; trackingUrl: string }> {
    const tn = `ARAMEXINT${Date.now()}`;
    return { labelUrl: "", trackingNumber: tn, trackingUrl: `https://www.aramex.com/track?number=${tn}` };
  },

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    return {
      carrier: "aramex-international", trackingNumber,
      status: "in_transit",
      estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString(),
      events: [{ date: new Date().toISOString(), location: "Dubai International Hub", description: "International shipment in transit via Aramex network" }],
    };
  },

  async validateAddress(address: { country: string; city: string; postalCode: string; address: string }): Promise<{ valid: boolean; suggestions?: string[] }> {
    return { valid: true };
  },

  async getCustomsRequirements(originCountry: string, destCountry: string, itemCategory: string): Promise<CustomsRequirements> {
    const isMena = ["AE", "SA", "QA", "KW", "BH", "OM", "EG", "JO", "LB"].includes(destCountry);
    const requiredDocs = ["commercial_invoice", "packing_list"];
    if (isMena) requiredDocs.push("certificate_of_origin");
    if (itemCategory === "electronics") requiredDocs.push("manufacturer_declaration");
    return {
      requiredDocuments: requiredDocs,
      notes: isMena ? ["Arabic translation may be required", "Original certificate of origin needed"] : ["All documents must be in English"],
      restrictedItems: [],
      dutiesApplicable: true,
      estimatedDutyRate: 0.05,
      estimatedVatRate: 0.05,
    };
  },

  async generateCustomsDeclaration(shipmentDetails: ShipmentDetails): Promise<CustomsDeclaration> {
    const value = shipmentDetails.value || 0;
    return {
      documentType: value <= 300 ? "cn22" : "cn23",
      documentUrl: "",
      documentNumber: `ARAMEXCD-${Date.now()}`,
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
    const isMena = ["AE", "SA", "QA", "KW", "BH", "OM"].includes(destCountry);
    const dutyRate = isMena ? 0 : 0.05;
    const vatRate = isMena ? 0.05 : 0.075;
    const estimatedDuties = +(itemValue * dutyRate).toFixed(2);
    const estimatedVat = +(itemValue * vatRate).toFixed(2);
    return {
      estimatedDuties,
      estimatedVat,
      totalEstimated: +(estimatedDuties + estimatedVat).toFixed(2),
      currency: "USD",
      disclaimer: "Estimate only. GCC countries may have 0% import duty but 5% VAT.",
    };
  },

  async generateAirWaybill(shipmentDetails: ShipmentDetails): Promise<AirWaybillResult> {
    const awbNumber = `ARMX-${Date.now()}`;
    return {
      awbNumber,
      awbUrl: `https://ws.aramex.net/awb/${awbNumber}`,
      carrierCode: "aramex-international",
      departureDate: new Date(Date.now() + 86400000).toISOString(),
      arrivalDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    };
  },
};

function mockAramexIntlRates(details: ShipmentDetails): ShippingRate[] {
  const base = details.weight * 7 + 15;
  return [
    { carrier: "aramex-international", carrierName: "Aramex International", serviceName: "International Express", price: base, currency: "USD", estimatedDays: 4, isTracked: true, isInsured: true },
    { carrier: "aramex-international", carrierName: "Aramex International", serviceName: "International Economy", price: base * 0.7, currency: "USD", estimatedDays: 7, isTracked: true, isInsured: true },
    { carrier: "aramex-international", carrierName: "Aramex International", serviceName: "Shop & Ship", price: base * 0.85, currency: "USD", estimatedDays: 5, isTracked: true, isInsured: false },
  ];
}
