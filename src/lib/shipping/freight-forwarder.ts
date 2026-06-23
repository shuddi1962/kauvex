import { CarrierInterface, ShipmentDetails, ShippingRate, TrackingInfo, CustomsRequirements, CustomsDeclaration, DutyEstimate, AirWaybillResult, BillOfLadingResult, getAllCarriers } from "./index";

interface ForwarderRoute {
  originCountry: string;
  destCountry: string;
  preferredCarrier: string;
  fallbackCarriers: string[];
  transportMode: "air" | "sea" | "road";
  estimatedDaysMin: number;
  estimatedDaysMax: number;
}

const FORWARDER_ROUTES: ForwarderRoute[] = [
  { originCountry: "NG", destCountry: "US", preferredCarrier: "dhl-international", fallbackCarriers: ["fedex-international"], transportMode: "air", estimatedDaysMin: 3, estimatedDaysMax: 7 },
  { originCountry: "NG", destCountry: "GB", preferredCarrier: "dhl-international", fallbackCarriers: ["fedex-international"], transportMode: "air", estimatedDaysMin: 3, estimatedDaysMax: 6 },
  { originCountry: "NG", destCountry: "AE", preferredCarrier: "aramex-international", fallbackCarriers: ["dhl-international"], transportMode: "air", estimatedDaysMin: 2, estimatedDaysMax: 5 },
  { originCountry: "NG", destCountry: "CN", preferredCarrier: "fedex-international", fallbackCarriers: ["dhl-international"], transportMode: "air", estimatedDaysMin: 5, estimatedDaysMax: 12 },
  { originCountry: "US", destCountry: "NG", preferredCarrier: "fedex-international", fallbackCarriers: ["dhl-international"], transportMode: "air", estimatedDaysMin: 4, estimatedDaysMax: 8 },
  { originCountry: "GB", destCountry: "NG", preferredCarrier: "dhl-international", fallbackCarriers: ["fedex-international", "aramex-international"], transportMode: "air", estimatedDaysMin: 3, estimatedDaysMax: 7 },
  { originCountry: "AE", destCountry: "NG", preferredCarrier: "aramex-international", fallbackCarriers: ["dhl-international"], transportMode: "air", estimatedDaysMin: 2, estimatedDaysMax: 5 },
  { originCountry: "CN", destCountry: "NG", preferredCarrier: "fedex-international", fallbackCarriers: [], transportMode: "sea", estimatedDaysMin: 25, estimatedDaysMax: 45 },
  { originCountry: "NG", destCountry: "GH", preferredCarrier: "aramex-international", fallbackCarriers: [], transportMode: "road", estimatedDaysMin: 3, estimatedDaysMax: 7 },
  { originCountry: "NG", destCountry: "KE", preferredCarrier: "dhl-international", fallbackCarriers: ["aramex-international"], transportMode: "air", estimatedDaysMin: 4, estimatedDaysMax: 8 },
];

function findRoute(origin: string, dest: string): ForwarderRoute | undefined {
  return FORWARDER_ROUTES.find((r) => r.originCountry === origin && r.destCountry === dest);
}

export const freightForwarderCarrier: CarrierInterface = {
  code: "freight-forwarder",
  name: "Kauvex Freight Forwarder",

  async getRates(details: ShipmentDetails): Promise<ShippingRate[]> {
    const route = findRoute(details.origin.country, details.destination.country);
    if (!route) return mockForwarderRates(details);

    const carriers = route.fallbackCarriers.length > 0
      ? [route.preferredCarrier, ...route.fallbackCarriers]
      : [route.preferredCarrier];

    const allRates: ShippingRate[] = [];
    const allCarriers = await getAllCarriers();

    for (const carrierCode of carriers) {
      const carrier = allCarriers.find((c) => c.code === carrierCode);
      if (!carrier) continue;
      try {
        const rates = await carrier.getRates(details);
        allRates.push(...rates.map((r) => ({
          ...r,
          carrier: "freight-forwarder",
          carrierName: `Kauvex Freight (via ${r.carrierName})`,
          estimatedDays: route.transportMode === "sea" ? route.estimatedDaysMin + Math.floor(Math.random() * 10) : r.estimatedDays,
        })));
      } catch {
        continue;
      }
    }

    if (allRates.length === 0) return mockForwarderRates(details);
    return allRates.sort((a, b) => a.price - b.price);
  },

  async createLabel(details: ShipmentDetails, rate: ShippingRate): Promise<{ labelUrl: string; trackingNumber: string; trackingUrl: string }> {
    const tn = `KVXFF-${Date.now()}`;
    return { labelUrl: "", trackingNumber: tn, trackingUrl: `https://kauvex.com/track/${tn}` };
  },

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    return {
      carrier: "freight-forwarder", trackingNumber,
      status: "in_transit",
      estimatedDelivery: new Date(Date.now() + 10 * 86400000).toISOString(),
      events: [
        { date: new Date().toISOString(), location: "Origin Hub", description: "Shipment consolidated at origin" },
      ],
    };
  },

  async validateAddress(address: { country: string; city: string; postalCode: string; address: string }): Promise<{ valid: boolean; suggestions?: string[] }> {
    return { valid: address.country?.length > 0 && address.city?.length > 0, suggestions: [] };
  },

  async getCustomsRequirements(originCountry: string, destCountry: string, itemCategory: string): Promise<CustomsRequirements> {
    const route = findRoute(originCountry, destCountry);
    const isSeaFreight = route?.transportMode === "sea";
    const requiredDocs = ["commercial_invoice", "packing_list"];
    if (isSeaFreight) requiredDocs.push("bill_of_lading");
    return {
      requiredDocuments: requiredDocs,
      notes: isSeaFreight ? ["Sea freight requires full Bill of Lading", "Container inspections may apply"] : ["Air waybill will be generated", "Customs broker recommended for high-value items"],
      restrictedItems: [],
      dutiesApplicable: true,
      estimatedDutyRate: 0.05,
      estimatedVatRate: 0.075,
    };
  },

  async generateCustomsDeclaration(shipmentDetails: ShipmentDetails): Promise<CustomsDeclaration> {
    return {
      documentType: "commercial_invoice",
      documentUrl: "",
      documentNumber: `KVXFFCD-${Date.now()}`,
      hsCodes: shipmentDetails.items.map((i) => ({
        code: i.hsCode || "847130",
        description: i.sku,
        quantity: i.quantity,
        unitValue: (shipmentDetails.value || 0) / (i.quantity || 1),
      })),
      declaredValue: shipmentDetails.value || 0,
      currency: "USD",
      incoterm: "DAP",
      originCountry: shipmentDetails.origin.country,
      destCountry: shipmentDetails.destination.country,
      weightKg: shipmentDetails.weight,
      numberOfPieces: shipmentDetails.items.reduce((s, i) => s + i.quantity, 0),
    };
  },

  async estimateDutiesAndTaxes(itemValue: number, destCountry: string, _itemCategory: string, _hsCode?: string): Promise<DutyEstimate> {
    const route = FORWARDER_ROUTES.find((r) => r.destCountry === destCountry);
    const dutyRate = 0.05;
    const vatRate = route?.transportMode === "sea" ? 0.12 : 0.075;
    return {
      estimatedDuties: +(itemValue * dutyRate).toFixed(2),
      estimatedVat: +(itemValue * vatRate).toFixed(2),
      totalEstimated: +(itemValue * (dutyRate + vatRate)).toFixed(2),
      currency: "USD",
      disclaimer: "Estimate combines carrier rates with Kauvex freight forwarding markup.",
    };
  },

  async generateAirWaybill(shipmentDetails: ShipmentDetails): Promise<AirWaybillResult> {
    const route = findRoute(shipmentDetails.origin.country, shipmentDetails.destination.country);
    return {
      awbNumber: `KVXAWB-${Date.now()}`,
      awbUrl: "",
      carrierCode: route?.preferredCarrier || "dhl-international",
      departureDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      arrivalDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    };
  },

  async generateBillOfLading(shipmentDetails: ShipmentDetails): Promise<BillOfLadingResult> {
    return {
      bolNumber: `KVXBOL-${Date.now()}`,
      bolUrl: "",
      vesselName: "MV Kauvex Trader",
      voyageNumber: `V-${Math.floor(Math.random() * 999)}`,
      portOfLoading: "Apapa, Lagos",
      portOfDischarge: "Shanghai, China",
      containerNumber: `KVXU${Math.floor(Math.random() * 9999999)}`,
    };
  },
};

function mockForwarderRates(details: ShipmentDetails): ShippingRate[] {
  const isSea = details.weight > 100;
  if (isSea) {
    return [
      { carrier: "freight-forwarder", carrierName: "Kauvex Freight (Sea)", serviceName: "Sea Freight (LCL)", price: details.weight * 3.5 + 50, currency: "USD", estimatedDays: 30, isTracked: true, isInsured: true },
      { carrier: "freight-forwarder", carrierName: "Kauvex Freight (Sea)", serviceName: "Sea Freight (FCL)", price: 1200 + details.weight * 1.5, currency: "USD", estimatedDays: 25, isTracked: true, isInsured: true },
    ];
  }
  return [
    { carrier: "freight-forwarder", carrierName: "Kauvex Freight (Air)", serviceName: "Air Freight Standard", price: details.weight * 10 + 30, currency: "USD", estimatedDays: 5, isTracked: true, isInsured: true },
    { carrier: "freight-forwarder", carrierName: "Kauvex Freight (Air)", serviceName: "Air Freight Express", price: details.weight * 15 + 40, currency: "USD", estimatedDays: 3, isTracked: true, isInsured: true },
  ];
}
