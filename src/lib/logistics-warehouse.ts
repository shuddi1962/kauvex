"use server";

import { prisma } from "@/lib/prisma";

export interface PickItem {
  orderItemId: string;
  productId: string;
  sku: string;
  binLocation: string;
  quantity: number;
}

export interface PickTask {
  id: string;
  orderId: string;
  productId: string;
  sku: string;
  binLocation: string;
  quantity: number;
  status: string;
  assignedTo?: string;
}

export interface ChecklistItem {
  label: string;
  required: boolean;
  completed: boolean;
  item: string;
}

export interface PackTask {
  id: string;
  orderId: string;
  packagingTier: string;
  status: string;
  checklist: ChecklistItem[];
}

export interface ReceivedItem {
  sku: string;
  expectedQty: number;
  receivedQty: number;
  damagedQty: number;
  condition: "ok" | "damaged" | "wrong_item";
  notes?: string;
}

export interface ReceiptResult {
  confirmed: boolean;
  discrepancies: { sku: string; expected: number; received: number }[];
  totalDamaged: number;
}

export interface StockItem {
  materialId: string;
  name: string;
  sku: string;
  currentStock: number;
  reorderThreshold: number;
  status: "ok" | "low" | "out";
}

export interface CountItem {
  sku: string;
  binLocation: string;
  systemQty: number;
  physicalQty: number;
}

export interface CountResult {
  matches: boolean;
  discrepancies: { sku: string; system: number; physical: number; diff: number }[];
  totalCounted: number;
}

export async function createPickTask(orderId: string, item: PickItem): Promise<any> {
  const task = await prisma.kvLgxPickTask.create({
    data: {
      orderId,
      orderItemId: item.orderItemId,
      warehouseId: "default",
      productId: item.productId,
      sku: item.sku,
      binLocation: item.binLocation,
      quantity: item.quantity,
      status: "pending",
    },
  });
  return task;
}

export async function createPackTask(orderId: string, tier: string, checklist: ChecklistItem[]): Promise<any> {
  const task = await prisma.kvLgxPackTask.create({
    data: {
      orderId,
      warehouseId: "default",
      packagingTier: tier,
      checklistCompleted: checklist as any,
      status: "pending",
    },
  });
  return task;
}

export async function getTodayPickList(warehouseId: string): Promise<PickTask[]> {
  const tasks = await prisma.kvLgxPickTask.findMany({
    where: { warehouseId, status: { in: ["pending", "in_progress"] } },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    take: 50,
  });
  return tasks as unknown as PickTask[];
}

export async function getPackingQueue(warehouseId: string): Promise<PackTask[]> {
  const tasks = await prisma.kvLgxPackTask.findMany({
    where: { warehouseId, status: { in: ["pending", "in_progress"] } },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    take: 50,
  });
  return tasks as unknown as PackTask[];
}

export async function confirmPick(taskId: string, staffId: string): Promise<void> {
  await prisma.kvLgxPickTask.update({
    where: { id: taskId },
    data: {
      status: "picked",
      assignedTo: staffId,
      completedAt: new Date(),
    },
  });
}

export async function confirmPack(taskId: string, staffId: string, checklist: any): Promise<void> {
  await prisma.kvLgxPackTask.update({
    where: { id: taskId },
    data: {
      status: "packed",
      assignedTo: staffId,
      checklistCompleted: checklist,
      packedAt: new Date(),
    },
  });
}

export async function receiveInbound(planId: string, received: ReceivedItem[]): Promise<ReceiptResult> {
  const discrepancies: { sku: string; expected: number; received: number }[] = [];
  let totalDamaged = 0;

  for (const item of received) {
    if (item.expectedQty !== item.receivedQty) {
      discrepancies.push({
        sku: item.sku,
        expected: item.expectedQty,
        received: item.receivedQty,
      });
    }
    totalDamaged += item.damagedQty;
  }

  return {
    confirmed: discrepancies.length === 0,
    discrepancies,
    totalDamaged,
  };
}

export async function dispatchOrder(taskId: string, partnerId?: string): Promise<void> {
  await prisma.kvLgxPackTask.update({
    where: { id: taskId },
    data: {
      status: "dispatched",
      dispatchedAt: new Date(),
    },
  });
}

export async function getPackagingStock(warehouseId: string): Promise<StockItem[]> {
  const stock = await prisma.kvPkgWarehouseStock.findMany({
    where: { warehouseId },
    include: { material: true },
  });
  return stock.map((s) => ({
    materialId: s.materialId,
    name: s.material.name,
    sku: s.material.sku,
    currentStock: s.quantity,
    reorderThreshold: s.material.reorderThreshold,
    status: s.quantity <= 0 ? "out" : s.quantity <= s.material.reorderThreshold ? "low" : "ok",
  }));
}

export async function logCycleCount(warehouseId: string, counts: CountItem[]): Promise<CountResult> {
  const discrepancies: { sku: string; system: number; physical: number; diff: number }[] = [];

  for (const item of counts) {
    const diff = item.physicalQty - item.systemQty;
    if (diff !== 0) {
      discrepancies.push({
        sku: item.sku,
        system: item.systemQty,
        physical: item.physicalQty,
        diff,
      });
    }
  }

  return {
    matches: discrepancies.length === 0,
    discrepancies,
    totalCounted: counts.length,
  };
}

export function generatePickListPdf(warehouseId: string): string {
  return `/api/v1/warehouse/pick-list/${warehouseId}/pdf`;
}

export function generateManifestPdf(orders: string[]): string {
  return `/api/v1/warehouse/manifest/pdf?orders=${orders.join(",")}`;
}
