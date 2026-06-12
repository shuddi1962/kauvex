"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface ShipmentDetails {
  origin: {
    country: string;
    city: string;
    postalCode: string;
    address: string;
  };
  destination: {
    country: string;
    city: string;
    postalCode: string;
    address: string;
  };
  weight: number;
  dimensions?: { length: number; width: number; height: number };
  value?: number;
  items: { sku: string; quantity: number; weight?: number }[];
}

export interface ShippingRate {
  carrier: string;
  carrierName: string;
  serviceName: string;
  price: number;
  currency: string;
  estimatedDays: number;
  isTracked: boolean;
  isInsured: boolean;
}

export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  status: "pending" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "exception" | "returned";
  estimatedDelivery?: string;
  events: { date: string; location: string; description: string }[];
}

export interface CarrierInterface {
  code: string;
  name: string;
  getRates(details: ShipmentDetails): Promise<ShippingRate[]>;
  createLabel(details: ShipmentDetails, rate: ShippingRate): Promise<{ labelUrl: string; trackingNumber: string; trackingUrl: string }>;
  trackShipment(trackingNumber: string): Promise<TrackingInfo>;
  validateAddress(address: { country: string; city: string; postalCode: string; address: string }): Promise<{ valid: boolean; suggestions?: string[] }>;
}

const carriers = new Map<string, CarrierInterface>();

export async function registerCarrier(carrier: CarrierInterface) {
  carriers.set(carrier.code, carrier);
}

export async function getCarrier(code: string): Promise<CarrierInterface> {
  const carrier = carriers.get(code);
  if (!carrier) throw new Error(`Carrier "${code}" not found. Available carriers: ${[...carriers.keys()].join(", ")}`);
  return carrier;
}

export async function getAllCarriers(): Promise<CarrierInterface[]> {
  const supabase = createAdminClient();
  const { data: dbCarriers } = await supabase.from("shipping_carriers").select("*").eq("is_active", true);
  const result: CarrierInterface[] = [];
  for (const c of (dbCarriers || [])) {
    const impl = carriers.get(c.code);
    if (impl) result.push(impl);
  }
  return result;
}

export async function getRates(details: ShipmentDetails): Promise<ShippingRate[]> {
  const allRates: ShippingRate[] = [];
  const activeCarriers = await getAllCarriers();
  await Promise.allSettled(
    activeCarriers.map(async (c) => {
      try {
        const rates = await c.getRates(details);
        allRates.push(...rates);
      } catch (err) {
        console.error(`[Shipping] ${c.code} rate lookup failed:`, err);
      }
    })
  );
  return allRates.sort((a, b) => a.price - b.price);
}

export async function createLabel(details: ShipmentDetails, carrierCode: string, rate: ShippingRate): Promise<{ labelUrl: string; trackingNumber: string; trackingUrl: string }> {
  const carrier = await getCarrier(carrierCode);
  return carrier.createLabel(details, rate);
}

export async function trackShipment(carrierCode: string, trackingNumber: string): Promise<TrackingInfo> {
  const carrier = await getCarrier(carrierCode);
  return carrier.trackShipment(trackingNumber);
}
