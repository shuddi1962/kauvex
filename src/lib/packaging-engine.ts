"use server";

import { prisma } from "@/lib/prisma";

interface ProductData {
  id: string;
  name: string;
  sku: string;
  category: string;
  subcategory?: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
  isFragile: boolean;
  hasBattery: boolean;
  isLiquid: boolean;
  requiresOrientation: boolean;
  isFood: boolean;
  isElectronics: boolean;
  isHighValue: boolean;
  hasWarranty: boolean;
  hasCareInstructions: boolean;
  hasAuthTag: boolean;
  unitPrice: number;
}

interface OrderData {
  id: string;
  vendorId: string;
  customerId: string;
  storefront: string;
  items: ProductData[];
  total: number;
  isInternational: boolean;
  isGift: boolean;
  giftMessage?: string;
  deliveryAddress: {
    country: string;
    city: string;
  };
  fulfillmentType?: string;
}

interface CustomerData {
  id: string;
  inLoyaltyProgram: boolean;
  loyaltyPoints?: number;
}

interface VendorData {
  id: string;
  plan: string;
  name: string;
  hasCustomPackaging: boolean;
}

interface InnerMaterial {
  materialId: string;
  quantity: number;
}

interface ChecklistItem {
  label: string;
  required: boolean;
  completed: boolean;
  item: string;
}

interface ComplianceEvidence {
  photos: string[];
  description: string;
}

interface ComplianceResult {
  compliant: boolean;
  violations: string[];
  severity?: string;
}

interface OrderPackagingData {
  orderId: string;
  fulfillmentType: string;
  packagingTier?: string;
  outerMaterialId?: string;
  innerMaterials?: InnerMaterial[];
  sealMaterialId?: string;
  labelsApplied?: string[];
  insertsIncluded?: string[];
  addOnsIncluded?: string[];
  giftMessage?: string;
  photoUrl?: string;
  packedBy?: string;
  packagingCost?: number;
  kauvexBranded: boolean;
  vendorBranded: boolean;
  whiteLabel: boolean;
}

const BOX_SIZES = [
  {
    sku: "PKG-BOX-XS",
    maxVolume: 750,
    maxWeight: 0.5,
  },
  {
    sku: "PKG-BOX-S",
    maxVolume: 6000,
    maxWeight: 2,
  },
  {
    sku: "PKG-BOX-M",
    maxVolume: 39375,
    maxWeight: 5,
  },
  {
    sku: "PKG-BOX-L",
    maxVolume: 120000,
    maxWeight: 15,
  },
  {
    sku: "PKG-BOX-XL",
    maxVolume: 240000,
    maxWeight: 30,
  },
  {
    sku: "PKG-BOX-XXL",
    maxVolume: 560000,
    maxWeight: 50,
  },
];

const CLOTHING_CATEGORIES = ["clothing", "fashion", "apparel", "footwear"];
const SMALL_FRAGILE_VOLUME_THRESHOLD = 1500;
const SMALL_FRAGILE_WEIGHT_THRESHOLD = 1;

const FRAGILE_LABEL = "PKG-LBL-FRAGILE";
const BATTERY_LABEL = "PKG-LBL-BATTERY";
const LIQUID_LABEL = "PKG-LBL-LIQUID";
const HEAVY_LABEL = "PKG-LBL-HEAVY";
const INTERNATIONAL_LABEL = "PKG-LBL-INTERNATIONAL";

const LOYALTY_INSERT = "PKG-INS-LOYALTY";
const WARRANTY_INSERT = "PKG-INS-WARRANTY";
const CARE_CARD_INSERT = "PKG-INS-CARE";
const AUTH_CERT_INSERT = "PKG-INS-AUTH";
const GIFT_RECEIPT_INSERT = "PKG-INS-GIFT-RECEIPT";
const THANK_YOU_INSERT = "PKG-INS-THANKYOU";
const INVOICE_INSERT = "PKG-INS-INVOICE";
const RETURN_FORM_INSERT = "PKG-INS-RETURN";
const BRAND_CATALOG_INSERT = "PKG-INS-CATALOG";
const SAMPLE_INSERT = "PKG-INS-SAMPLE";

const INNER_BUBBLE_WRAP = "PKG-IN-BUBBLE";
const INNER_FOAM = "PKG-IN-FOAM";
const INNER_AIR_PILLOW = "PKG-IN-AIR";
const INNER_PACKING_PAPER = "PKG-IN-PAPER";
const INNER_CUSTOM_INSERT = "PKG-IN-CUSTOM";
const INNER_ABSORBENT = "PKG-IN-ABSORBENT";

const SEAL_TAPE = "PKG-SL-TAPE";
const SEAL_TAPE_FRAGILE = "PKG-SL-TAPE-FRAGILE";

const PACK_FOR_ME_FEES: Record<string, { fee: number; materials: string[] }> = {
  gift_wrap: { fee: 4.99, materials: [SEAL_TAPE, "PKG-GIFT-WRAP"] },
  fragile_pack: { fee: 2.99, materials: [INNER_BUBBLE_WRAP, INNER_FOAM] },
  eco_pack: { fee: 1.99, materials: ["PKG-BOX-RECYCLED", SEAL_TAPE] },
  luxury_pack: { fee: 9.99, materials: ["PKG-BOX-PREMIUM", INNER_CUSTOM_INSERT, SEAL_TAPE] },
};

export function getMaterialSku(product: ProductData): string {
  const volume = product.lengthCm * product.widthCm * product.heightCm;
  const isClothing = CLOTHING_CATEGORIES.some(
    (c) => product.subcategory?.toLowerCase().includes(c) ?? product.category.toLowerCase().includes(c)
  );

  if (isClothing) {
    return "PKG-POLY-MAILER";
  }

  const isSmallFragile =
    product.isFragile &&
    volume <= SMALL_FRAGILE_VOLUME_THRESHOLD &&
    product.weightKg <= SMALL_FRAGILE_WEIGHT_THRESHOLD;

  if (isSmallFragile) {
    return "PKG-BUBBLE-MAILER";
  }

  for (const box of BOX_SIZES) {
    if (volume <= box.maxVolume && product.weightKg <= box.maxWeight) {
      return box.sku;
    }
  }

  return "PKG-BOX-XXL";
}

export function getInnerProtection(product: ProductData): InnerMaterial[] {
  const materials: InnerMaterial[] = [];

  if (product.isFragile || product.isElectronics) {
    materials.push({ materialId: INNER_BUBBLE_WRAP, quantity: 1 });
  }

  if (product.isElectronics) {
    materials.push({ materialId: INNER_FOAM, quantity: 1 });
  }

  if (product.isLiquid) {
    materials.push({ materialId: INNER_ABSORBENT, quantity: 1 });
  }

  if (product.isFragile && volumeCm(product) > 10000) {
    materials.push({ materialId: INNER_AIR_PILLOW, quantity: 2 });
  }

  if (!product.isFragile && !product.isElectronics && !product.isLiquid && !product.isFood) {
    materials.push({ materialId: INNER_PACKING_PAPER, quantity: 1 });
  }

  if (product.isHighValue) {
    materials.push({ materialId: INNER_CUSTOM_INSERT, quantity: 1 });
  }

  return materials;
}

function volumeCm(product: ProductData): number {
  return product.lengthCm * product.widthCm * product.heightCm;
}

export function getLabels(product: ProductData, order: OrderData): string[] {
  const labels: string[] = [];

  if (product.isFragile) {
    labels.push(FRAGILE_LABEL);
  }

  if (product.hasBattery) {
    labels.push(BATTERY_LABEL);
  }

  if (product.isLiquid) {
    labels.push(LIQUID_LABEL);
  }

  if (product.weightKg > 20) {
    labels.push(HEAVY_LABEL);
  }

  if (order.isInternational) {
    labels.push(INTERNATIONAL_LABEL);
  }

  return [...new Set(labels)];
}

export function getInserts(product: ProductData, customer: CustomerData, vendor: VendorData): string[] {
  const inserts: string[] = [];

  inserts.push(INVOICE_INSERT);
  inserts.push(RETURN_FORM_INSERT);

  if (customer.inLoyaltyProgram) {
    inserts.push(LOYALTY_INSERT);
  }

  if (product.hasWarranty) {
    inserts.push(WARRANTY_INSERT);
  }

  if (product.hasCareInstructions) {
    inserts.push(CARE_CARD_INSERT);
  }

  if (product.hasAuthTag) {
    inserts.push(AUTH_CERT_INSERT);
  }

  inserts.push(THANK_YOU_INSERT);
  inserts.push(BRAND_CATALOG_INSERT);

  return [...new Set(inserts)];
}

export function determinePackagingTier(vendorPlan: string, vendorConfig: any): "A" | "B" | "C" {
  if (vendorConfig?.white_label === true) {
    return "C";
  }

  if (
    vendorConfig?.customPackagingEnabled === true &&
    (vendorPlan.toLowerCase().includes("professional") || vendorPlan.toLowerCase().includes("enterprise"))
  ) {
    return "B";
  }

  return "A";
}

export function getPackagingChecklist(order: OrderData, vendorConfig: any): ChecklistItem[] {
  const tier = determinePackagingTier(vendorConfig?.plan ?? "starter", vendorConfig);
  const hasMultipleItems = order.items.length > 1;
  const allFragile = order.items.every((i) => i.isFragile);

  const checklist: ChecklistItem[] = [
    {
      label: "Select correct outer box size",
      required: true,
      completed: false,
      item: "box",
    },
    {
      label: "Apply inner protection materials",
      required: order.items.some((i) => i.isFragile || i.isElectronics || i.isLiquid),
      completed: false,
      item: "protection",
    },
    {
      label: "Insert packing slip / invoice",
      required: true,
      completed: false,
      item: "invoice",
    },
    {
      label: "Insert return form",
      required: true,
      completed: false,
      item: "return_form",
    },
    {
      label: "Apply shipping labels",
      required: true,
      completed: false,
      item: "label",
    },
    {
      label: "Apply fragile / hazard labels",
      required: order.items.some((i) => i.isFragile || i.hasBattery || i.isLiquid),
      completed: false,
      item: "hazard_label",
    },
    {
      label: "Seal box with tape",
      required: true,
      completed: false,
      item: "seal",
    },
    {
      label: "Weigh and record final weight",
      required: true,
      completed: false,
      item: "weigh",
    },
    {
      label: "Attach waybill / shipping label",
      required: true,
      completed: false,
      item: "waybill",
    },
  ];

  if (order.isGift) {
    checklist.push({
      label: "Include gift message",
      required: true,
      completed: false,
      item: "gift_message",
    });
  }

  if (hasMultipleItems) {
    checklist.push({
      label: "Verify all items are packed",
      required: true,
      completed: false,
      item: "verify_items",
    });
  }

  if (order.isInternational) {
    checklist.push({
      label: "Attach customs documents & commercial invoice",
      required: true,
      completed: false,
      item: "customs",
    });
    checklist.push({
      label: "Apply international shipping labels",
      required: true,
      completed: false,
      item: "international_label",
    });
  }

  if (allFragile) {
    checklist.push({
      label: "Use double-walled box for fragile items",
      required: true,
      completed: false,
      item: "double_wall_box",
    });
  }

  if (order.items.some((i) => i.hasBattery)) {
    checklist.push({
      label: "Apply battery hazard label (UN3481/UN3091)",
      required: true,
      completed: false,
      item: "battery_label",
    });
  }

  if (order.items.some((i) => i.requiresOrientation)) {
    checklist.push({
      label: "Apply THIS WAY UP orientation arrows",
      required: true,
      completed: false,
      item: "orientation",
    });
  }

  if (tier === "B" || tier === "C") {
    checklist.push({
      label: `Apply ${tier === "C" ? "white label" : "vendor-branded"} packaging`,
      required: true,
      completed: false,
      item: "branded_packaging",
    });
  }

  if (order.items.some((i) => i.isHighValue)) {
    checklist.push({
      label: "Photo-document package contents for insurance",
      required: true,
      completed: false,
      item: "photo_document",
    });
  }

  return checklist;
}

export function calculatePackagingCost(order: OrderData, tier: string, addOns: string[]): number {
  let total = 0;

  const BOX_COSTS: Record<string, number> = {
    "PKG-BOX-XS": 0.25,
    "PKG-BOX-S": 0.4,
    "PKG-BOX-M": 0.6,
    "PKG-BOX-L": 1.0,
    "PKG-BOX-XL": 1.75,
    "PKG-BOX-XXL": 2.5,
    "PKG-POLY-MAILER": 0.15,
    "PKG-BUBBLE-MAILER": 0.3,
  };

  const TIER_MULTIPLIERS: Record<string, number> = {
    A: 1.0,
    B: 1.3,
    C: 0.85,
  };

  const ADDON_COSTS: Record<string, number> = {
    "gift_wrap": 2.5,
    "extra_cushioning": 1.0,
    "custom_insert_card": 0.75,
    "eco_friendly": 0.5,
    "priority_rush": 3.0,
    "signature_required": 1.5,
    "insurance_top_up": 2.0,
  };

  for (const item of order.items) {
    const boxSku = getMaterialSku(item);
    const boxCost = BOX_COSTS[boxSku] ?? 1.0;
    total += boxCost;
  }

  const innerMaterials = new Set<string>();
  for (const item of order.items) {
    for (const mat of getInnerProtection(item)) {
      innerMaterials.add(mat.materialId);
    }
  }

  total += innerMaterials.size * 0.2;

  const labels = new Set<string>();
  for (const item of order.items) {
    for (const lbl of getLabels(item, order)) {
      labels.add(lbl);
    }
  }

  total += labels.size * 0.05;

  const tierMultiplier = TIER_MULTIPLIERS[tier] ?? 1.0;
  total *= tierMultiplier;

  for (const addOn of addOns) {
    total += ADDON_COSTS[addOn] ?? 0;
  }

  return Math.round(total * 100) / 100;
}

export function checkCompliance(orderId: string, evidence: ComplianceEvidence): ComplianceResult {
  const violations: string[] = [];

  if (!evidence.photos || evidence.photos.length === 0) {
    violations.push("No packing photos provided as evidence");
  }

  if (!evidence.description || evidence.description.trim().length === 0) {
    violations.push("No packing description provided");
  }

  if (evidence.photos.length > 0 && evidence.photos.length < 2) {
    violations.push("Insufficient photo evidence — minimum 2 photos required");
  }

  if (violations.length > 0) {
    return {
      compliant: false,
      violations,
      severity: violations.length > 2 ? "high" : "medium",
    };
  }

  return {
    compliant: true,
    violations: [],
  };
}

export async function logOrderPackaging(data: OrderPackagingData): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO kv_pkg_order_records (
        order_id, fulfillment_type, packaging_tier, outer_material_id,
        inner_materials, seal_material_id, labels_applied, inserts_included,
        add_ons_included, gift_message, photo_url, packed_by,
        packaging_cost, kauvex_branded, vendor_branded, white_label,
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()
      )`,
      data.orderId,
      data.fulfillmentType,
      data.packagingTier ?? null,
      data.outerMaterialId ?? null,
      data.innerMaterials ? JSON.stringify(data.innerMaterials) : null,
      data.sealMaterialId ?? null,
      data.labelsApplied ? JSON.stringify(data.labelsApplied) : null,
      data.insertsIncluded ? JSON.stringify(data.insertsIncluded) : null,
      data.addOnsIncluded ? JSON.stringify(data.addOnsIncluded) : null,
      data.giftMessage ?? null,
      data.photoUrl ?? null,
      data.packedBy ?? null,
      data.packagingCost ?? null,
      data.kauvexBranded,
      data.vendorBranded,
      data.whiteLabel,
    );
  } catch {
    console.error(`Failed to log packaging record for order ${data.orderId}`);
  }
}

export function getFulfillmentDesignation(order: OrderData): "fbk" | "fbm" | "supplier" | "cj" | "pod" | "express" {
  if (order.fulfillmentType) {
    return order.fulfillmentType as "fbk" | "fbm" | "supplier" | "cj" | "pod" | "express";
  }

  if (order.isInternational) {
    return "fbm";
  }

  const cjCategories = ["electronics", "gadgets", "accessories", "phone", "computer"];
  const allMatchCj = order.items.every((item) =>
    cjCategories.some((cat) => item.category.toLowerCase().includes(cat))
  );

  if (allMatchCj) {
    return "cj";
  }

  const podCategories = ["custom", "print-on-demand", "apparel", "merchandise"];
  const allMatchPod = order.items.every((item) =>
    podCategories.some((cat) => item.category.toLowerCase().includes(cat))
  );

  if (allMatchPod) {
    return "pod";
  }

  const expressCountries = ["NG", "GH", "KE"];
  if (expressCountries.includes(order.deliveryAddress.country) && !order.items.some((i) => i.weightKg > 30)) {
    return "express";
  }

  return "fbm";
}

export function getCjPackagingOption(category: string, price: number, storefront: string): string {
  const configs: Record<string, { optionA: number; optionB: number; optionC: number; optionD: number }> = {
    electronics: { optionA: 0, optionB: 1.5, optionC: 3, optionD: 5 },
    fashion: { optionA: 0, optionB: 1, optionC: 2.5, optionD: 4 },
    beauty: { optionA: 0, optionB: 1.2, optionC: 2.5, optionD: 4.5 },
    home: { optionA: 0, optionB: 2, optionC: 4, optionD: 7 },
    books: { optionA: 0, optionB: 0.8, optionC: 1.5, optionD: 3 },
    DEFAULT: { optionA: 0, optionB: 1, optionC: 2.5, optionD: 4 },
  };

  const cfg = configs[category.toLowerCase()] ?? configs.DEFAULT;

  if (price >= 100) return "D";
  if (price >= 50) return "C";
  if (price >= 20) return "B";

  const premiumStorefronts = ["kauvex.com", "kauvex.com/uk", "kauvex.com/ca", "kauvex.com/au"];
  if (premiumStorefronts.includes(storefront)) {
    return "B";
  }

  return "A";
}

export function getPackForMeFee(service: string): { fee: number; materials: string[] } {
  return (
    PACK_FOR_ME_FEES[service] ?? {
      fee: 0,
      materials: [],
    }
  );
}

export type {
  ProductData,
  OrderData,
  CustomerData,
  VendorData,
  InnerMaterial,
  ChecklistItem,
  ComplianceEvidence,
  ComplianceResult,
  OrderPackagingData,
};
