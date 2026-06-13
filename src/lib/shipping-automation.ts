"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getRates, type ShipmentDetails } from "@/lib/shipping";

export interface AutoRoutingResult {
  warehouseId: string;
  warehouseName: string;
  warehouseCity: string;
  distanceScore: number;
  hasInventory: boolean;
  carrierCode: string;
  carrierName: string;
  serviceName: string;
  price: number;
  estimatedDays: number;
  trackingNumber?: string;
  labelUrl?: string;
}

interface WarehouseWithInventory {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  inventory: number;
}

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const GEO_CITIES: Record<string, { lat: number; lng: number }> = {
  Lagos: { lat: 6.5244, lng: 3.3792 },
  Abuja: { lat: 9.0579, lng: 7.4951 },
  "Port Harcourt": { lat: 4.8156, lng: 7.0498 },
  London: { lat: 51.5074, lng: -0.1278 },
  Toronto: { lat: 43.6532, lng: -79.3832 },
  Dubai: { lat: 25.2048, lng: 55.2708 },
  Warri: { lat: 5.5173, lng: 5.7506 },
  Kano: { lat: 12.002, lng: 8.592 },
  Ibadan: { lat: 7.3775, lng: 3.947 },
  Enugu: { lat: 6.4483, lng: 7.5107 },
  "New York": { lat: 40.7128, lng: -74.006 },
  "Los Angeles": { lat: 34.0522, lng: -118.2437 },
};

export async function findNearestWarehouse(
  destinationCountry: string,
  destinationCity: string,
  productIds: { productId: string; variantId?: string; quantity: number }[]
): Promise<WarehouseWithInventory | null> {
  try {
    const db = createAdminClient();

    const { data: warehouses } = await db
      .from("warehouses")
      .select("id, name, city, country, latitude, longitude")
      .eq("status", "active");

    if (!warehouses || warehouses.length === 0) return null;

    const destGeo = GEO_CITIES[destinationCity] || { lat: 0, lng: 0 };

    // Get inventory for each warehouse
    const enriched: WarehouseWithInventory[] = await Promise.all(
      warehouses.map(async (w: any) => {
        let totalInventory = 0;
        for (const item of productIds) {
          const { data: inv } = await db
            .from("warehouse_inventory")
            .select("quantity_available")
            .eq("warehouse_id", w.id)
            .eq("product_id", item.productId)
            .single();
          if (inv) {
            totalInventory += Math.min(inv.quantity_available || 0, item.quantity);
          }
        }

        return {
          id: w.id,
          name: w.name,
          city: w.city,
          country: w.country,
          latitude: w.latitude || GEO_CITIES[w.city]?.lat || 0,
          longitude: w.longitude || GEO_CITIES[w.city]?.lng || 0,
          inventory: totalInventory,
        };
      })
    );

    // Score: distance (lower is better) + inventory coverage
    const scored = enriched
      .map((w) => {
        const distance = haversineDistance(
          w.latitude, w.longitude,
          destGeo.lat, destGeo.lng
        );
        const inventoryScore = productIds.length > 0 ? w.inventory / productIds.reduce((a, i) => a + i.quantity, 0) : 0;
        // Normalize distance (0-1, 1 is best = closest)
        const maxDist = 20000;
        const distanceScore = Math.max(0, 1 - distance / maxDist);
        return { ...w, distanceScore: Math.round((distanceScore * 0.6 + Math.min(inventoryScore, 1) * 0.4) * 100) };
      })
      .sort((a, b) => b.distanceScore - a.distanceScore);

    return scored[0] || null;
  } catch {
    return null;
  }
}

export async function autoRouteShipment(params: {
  destinationCountry: string;
  destinationCity: string;
  destinationAddress: string;
  destinationPostalCode: string;
  productIds: { productId: string; variantId?: string; quantity: number }[];
  weight: number;
  value?: number;
}): Promise<{
  warehouse: AutoRoutingResult | null;
  rates: any[];
  error?: string;
}> {
  try {
    const warehouse = await findNearestWarehouse(
      params.destinationCountry,
      params.destinationCity,
      params.productIds
    );

    if (!warehouse) {
      return { warehouse: null, rates: [], error: "No suitable warehouse found" };
    }

    const details: ShipmentDetails = {
      origin: {
        country: warehouse.country,
        city: warehouse.city,
        postalCode: "",
        address: `${warehouse.name}, ${warehouse.city}`,
      },
      destination: {
        country: params.destinationCountry,
        city: params.destinationCity,
        postalCode: params.destinationPostalCode,
        address: params.destinationAddress,
      },
      weight: params.weight,
      value: params.value,
      items: params.productIds.map((p) => ({
        sku: p.productId,
        quantity: p.quantity,
      })),
    };

    const rates = await getRates(details);

    const bestRate = rates[0];

    const result: AutoRoutingResult = {
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      warehouseCity: warehouse.city,
      distanceScore: warehouse.distanceScore,
      hasInventory: warehouse.inventory > 0,
      carrierCode: bestRate?.carrier || "",
      carrierName: bestRate?.carrierName || "",
      serviceName: bestRate?.serviceName || "",
      price: bestRate?.price || 0,
      estimatedDays: bestRate?.estimatedDays || 0,
    };

    return { warehouse: result, rates };
  } catch (err) {
    return { warehouse: null, rates: [], error: String(err) };
  }
}
