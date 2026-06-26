import { prisma } from "@/lib/prisma";

export interface WmsAdapter {
  createPickOrder(order: { orderId: string; items: any[]; priority: string; packagingTier: string }): Promise<string>;
  cancelPickOrder(wmsRef: string): Promise<void>;
  getPickStatus(wmsRef: string): Promise<{ status: string; pickedAt?: Date; packedAt?: Date }>;
  updateInventory(sku: string, qty: number): Promise<void>;
}

export interface WmsConfig {
  id: string;
  warehouseId: string;
  wmsType: string;
  apiEndpoint?: string;
  apiKey?: string;
  webhookUrl?: string;
  statusCodeMapping?: Record<string, string>;
  isActive: boolean;
}

const STATUS_MAP: Record<string, Record<string, string>> = {
  manual: {
    pending: "pending",
    picking: "picking",
    picked: "picked",
    packing: "packing",
    packed: "packed",
    dispatched: "dispatched",
  },
  autostore: {
    queued: "pending",
    robots_fetching: "picking",
    retrieved: "picked",
    bin_packed: "packing",
    ready: "packed",
    shipped: "dispatched",
  },
  geekplus: {
    new_task: "pending",
    picking: "picking",
    picked: "picked",
    sorting: "packing",
    packed: "packed",
    shipped: "dispatched",
  },
};

export function mapWmsStatus(wmsType: string, wmsStatus: string): string {
  const mapping = STATUS_MAP[wmsType] || STATUS_MAP.manual;
  return mapping[wmsStatus] || wmsStatus;
}

export async function getWmsConfig(warehouseId: string): Promise<WmsConfig | null> {
  const integration = await (prisma as any).kspWmsIntegration.findFirst({
    where: { warehouseId, isActive: true },
  });

  if (!integration) return null;

  return {
    id: integration.id,
    warehouseId: integration.warehouseId,
    wmsType: integration.wmsType,
    apiEndpoint: integration.apiEndpoint,
    apiKey: integration.apiKey,
    webhookUrl: integration.webhookUrl,
    statusCodeMapping: integration.statusCodeMapping,
    isActive: integration.isActive,
  };
}

export async function createWmsIntegration(data: {
  warehouseId: string;
  wmsType: string;
  wmsName?: string;
  apiEndpoint?: string;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  statusCodeMapping?: any;
}) {
  return (prisma as any).kspWmsIntegration.create({
    data: {
      warehouseId: data.warehouseId,
      wmsType: data.wmsType,
      wmsName: data.wmsName,
      apiEndpoint: data.apiEndpoint,
      apiKey: data.apiKey,
      apiSecret: data.apiSecret,
      webhookUrl: data.webhookUrl,
      statusCodeMapping: data.statusCodeMapping,
      isActive: true,
    },
  });
}

export async function updateWmsIntegration(id: string, data: Partial<{
  wmsType: string;
  apiEndpoint: string;
  apiKey: string;
  webhookUrl: string;
  statusCodeMapping: any;
  isActive: boolean;
}>) {
  return (prisma as any).kspWmsIntegration.update({
    where: { id },
    data,
  });
}

export async function getWmsIntegrations() {
  return (prisma as any).kspWmsIntegration.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function handleWmsWebhook(integrationId: string, payload: {
  eventType: string;
  wmsRef?: string;
  orderId?: string;
  status?: string;
  timestamp?: string;
  data?: any;
}) {
  const integration = await (prisma as any).kspWmsIntegration.findUnique({
    where: { id: integrationId },
  });

  if (!integration) throw new Error("WMS integration not found");

  const mappedStatus = mapWmsStatus(integration.wmsType, payload.status || payload.eventType);

  await (prisma as any).kspPlatformEvent.create({
    data: {
      eventType: "warehouse_pick",
      eventData: {
        wmsType: integration.wmsType,
        wmsEvent: payload.eventType,
        mappedStatus,
        orderId: payload.orderId,
        wmsRef: payload.wmsRef,
        raw: payload.data,
      },
      countryCode: payload.data?.countryCode,
      city: payload.data?.city,
    },
  });

  await (prisma as any).kspWmsIntegration.update({
    where: { id: integrationId },
    data: { lastSync: new Date() },
  });

  return { success: true, mappedStatus };
}
