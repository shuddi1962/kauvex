import { prisma } from "@/lib/prisma";

export interface CustomsData {
  hsCode: string;
  description: string;
  countryOfOrigin: string;
  declaredValue: number;
  currency: string;
  weight: number;
}

export async function getCountryCustomsInfo(countryCode: string) {
  const country = await (prisma as any).glxCountry.findUnique({
    where: { countryCode },
  });

  if (!country) return null;

  return {
    countryCode: country.countryCode,
    countryName: country.countryName,
    vatRate: Number(country.vatRate),
    importDutyGeneral: Number(country.importDutyGeneral),
    deMinimisValue: Number(country.deMinimisValue),
    deMinimisCurrency: country.deMinimisCurrency,
  };
}

export function estimateDuties(
  declaredValue: number,
  vatRate: number,
  importDuty: number,
  deMinimisValue: number
): { vat: number; duty: number; total: number; requiresCustomsEntry: boolean } {
  const requiresCustomsEntry = declaredValue > deMinimisValue;
  const duty = requiresCustomsEntry ? declaredValue * (importDuty / 100) : 0;
  const vat = declaredValue * (vatRate / 100);
  return {
    vat: Math.round(vat * 100) / 100,
    duty: Math.round(duty * 100) / 100,
    total: Math.round((vat + duty) * 100) / 100,
    requiresCustomsEntry,
  };
}

export function generateCommercialInvoice(items: Array<{ name: string; qty: number; unitPrice: number; weight: number }>, currency: string) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  return {
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString(),
    currency,
    items: items.map((item) => ({
      description: item.name,
      quantity: item.qty,
      unitPrice: item.unitPrice,
      lineTotal: item.qty * item.unitPrice,
      weight: item.weight,
    })),
    subtotal,
    totalWeight: items.reduce((sum, item) => sum + item.qty * item.weight, 0),
  };
}

export function generateCN22(declaredValue: number, currency: string, category: string) {
  return {
    formType: declaredValue > 300 ? "CN23" : "CN22",
    category,
    declaredValue,
    currency,
    date: new Date().toISOString(),
    contents: category,
    weight: 0,
  };
}

export function generatePackingList(items: Array<{ name: string; qty: number; weight: number }>) {
  return {
    packingListNumber: `PL-${Date.now()}`,
    date: new Date().toISOString(),
    items: items.map((item, index) => ({
      packageNumber: index + 1,
      description: item.name,
      quantity: item.qty,
      weight: item.weight,
    })),
    totalPackages: items.length,
    totalWeight: items.reduce((sum, item) => sum + item.qty * item.weight, 0),
  };
}
