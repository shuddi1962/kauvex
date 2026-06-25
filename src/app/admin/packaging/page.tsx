"use client";

import { useState, useMemo } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Plus, X, Save, Edit2, Trash2, Search, Package } from "lucide-react";

interface Material {
  id: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  length: number;
  width: number;
  height: number;
  maxWeight: number;
  unitCost: number;
  branded: boolean;
  unbranded: boolean;
  availableFor: string[];
  stock: number;
  reorderThreshold: number;
  description: string;
  status: "ok" | "low" | "out";
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  outer: { label: "Outer", color: "bg-blue-50 text-blue" },
  inner: { label: "Inner", color: "bg-green-50 text-green-700" },
  seal: { label: "Seal", color: "bg-purple-50 text-purple-600" },
  label: { label: "Label", color: "bg-red-50 text-red" },
  insert: { label: "Insert", color: "bg-orange-50 text-orange" },
};

const categories = ["outer", "inner", "seal", "label", "insert"];

const stockConfig: Record<string, { label: string; color: string }> = {
  ok: { label: "OK", color: "bg-green-50 text-green-700" },
  low: { label: "Low", color: "bg-yellow-50 text-yellow-700" },
  out: { label: "Out", color: "bg-red-50 text-red" },
};

function calcStatus(stock: number, threshold: number): "ok" | "low" | "out" {
  if (stock <= 0) return "out";
  if (stock <= threshold) return "low";
  return "ok";
}

function formatDim(m: Material): string {
  if (m.length === 0 && m.width === 0 && m.height === 0) return "—";
  return `${m.length}x${m.width}x${m.height}cm`;
}

function formatAvail(arr: string[]): string {
  if (arr.length === 0) return "—";
  if (arr.length === 1 && arr[0] === "all") return "All";
  return arr.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(", ");
}

const seedMaterials: Material[] = [
  // ── Outer ──
  { id: "m1", sku: "PKG-BOX-XS", name: "Corrugated Box XS", category: "outer", subcategory: "Box", length: 15, width: 10, height: 5, maxWeight: 0.5, unitCost: 250, branded: true, unbranded: true, availableFor: ["fbk", "fbm", "supplier", "express"], stock: 500, reorderThreshold: 100, description: "Extra-small corrugated box for small items.", status: "ok" },
  { id: "m2", sku: "PKG-BOX-S", name: "Corrugated Box S", category: "outer", subcategory: "Box", length: 30, width: 20, height: 10, maxWeight: 2, unitCost: 350, branded: true, unbranded: true, availableFor: ["all"], stock: 450, reorderThreshold: 80, description: "Small corrugated box.", status: "ok" },
  { id: "m3", sku: "PKG-BOX-M", name: "Corrugated Box M", category: "outer", subcategory: "Box", length: 45, width: 35, height: 25, maxWeight: 5, unitCost: 450, branded: true, unbranded: true, availableFor: ["all"], stock: 300, reorderThreshold: 60, description: "Medium corrugated box.", status: "ok" },
  { id: "m4", sku: "PKG-BOX-L", name: "Corrugated Box L", category: "outer", subcategory: "Box", length: 60, width: 50, height: 40, maxWeight: 15, unitCost: 850, branded: true, unbranded: true, availableFor: ["all"], stock: 200, reorderThreshold: 40, description: "Large corrugated box.", status: "ok" },
  { id: "m5", sku: "PKG-BOX-XL", name: "Corrugated Box XL", category: "outer", subcategory: "Box", length: 80, width: 60, height: 50, maxWeight: 30, unitCost: 1200, branded: true, unbranded: true, availableFor: ["all"], stock: 100, reorderThreshold: 20, description: "Extra-large corrugated box.", status: "ok" },
  { id: "m6", sku: "PKG-BOX-XXL", name: "Corrugated Box XXL", category: "outer", subcategory: "Box", length: 100, width: 80, height: 70, maxWeight: 50, unitCost: 2000, branded: false, unbranded: true, availableFor: ["all"], stock: 50, reorderThreshold: 10, description: "XXL corrugated box (branded limited).", status: "ok" },
  { id: "m7", sku: "PKG-POLY-S", name: "Poly Mailer S", category: "outer", subcategory: "Poly Mailer", length: 25, width: 35, height: 0, maxWeight: 1, unitCost: 80, branded: true, unbranded: true, availableFor: ["fbk", "fbm", "supplier"], stock: 1000, reorderThreshold: 200, description: "Small poly mailer bag.", status: "ok" },
  { id: "m8", sku: "PKG-POLY-M", name: "Poly Mailer M", category: "outer", subcategory: "Poly Mailer", length: 35, width: 45, height: 0, maxWeight: 2, unitCost: 120, branded: true, unbranded: true, availableFor: ["fbk", "fbm", "supplier"], stock: 800, reorderThreshold: 150, description: "Medium poly mailer bag.", status: "ok" },
  { id: "m9", sku: "PKG-POLY-L", name: "Poly Mailer L", category: "outer", subcategory: "Poly Mailer", length: 45, width: 60, height: 0, maxWeight: 3, unitCost: 180, branded: true, unbranded: true, availableFor: ["fbk", "fbm", "supplier"], stock: 600, reorderThreshold: 100, description: "Large poly mailer bag.", status: "ok" },
  { id: "m10", sku: "PKG-BUBBLE-S", name: "Bubble Mailer S", category: "outer", subcategory: "Bubble Mailer", length: 15, width: 20, height: 0, maxWeight: 0.5, unitCost: 150, branded: true, unbranded: true, availableFor: ["all"], stock: 700, reorderThreshold: 150, description: "Small bubble-lined mailer.", status: "ok" },
  { id: "m11", sku: "PKG-BUBBLE-M", name: "Bubble Mailer M", category: "outer", subcategory: "Bubble Mailer", length: 25, width: 35, height: 0, maxWeight: 1, unitCost: 220, branded: true, unbranded: true, availableFor: ["all"], stock: 500, reorderThreshold: 100, description: "Medium bubble-lined mailer.", status: "ok" },
  { id: "m12", sku: "PKG-BUBBLE-L", name: "Bubble Mailer L", category: "outer", subcategory: "Bubble Mailer", length: 35, width: 50, height: 0, maxWeight: 2, unitCost: 320, branded: true, unbranded: true, availableFor: ["all"], stock: 350, reorderThreshold: 70, description: "Large bubble-lined mailer.", status: "ok" },
  { id: "m13", sku: "PKG-TUBE-S", name: "Mailing Tube S", category: "outer", subcategory: "Tube", length: 60, width: 8, height: 0, maxWeight: 1, unitCost: 300, branded: true, unbranded: true, availableFor: ["all"], stock: 200, reorderThreshold: 40, description: "Small mailing tube (60x8cm).", status: "ok" },
  { id: "m14", sku: "PKG-TUBE-M", name: "Mailing Tube M", category: "outer", subcategory: "Tube", length: 100, width: 10, height: 0, maxWeight: 2, unitCost: 450, branded: true, unbranded: true, availableFor: ["all"], stock: 150, reorderThreshold: 30, description: "Medium mailing tube (100x10cm).", status: "ok" },
  { id: "m15", sku: "PKG-TUBE-L", name: "Mailing Tube L", category: "outer", subcategory: "Tube", length: 150, width: 12, height: 0, maxWeight: 3, unitCost: 600, branded: false, unbranded: true, availableFor: ["all"], stock: 80, reorderThreshold: 15, description: "Large mailing tube (150x12cm, branded limited).", status: "ok" },
  { id: "m16", sku: "PKG-KRAFT-S", name: "Kraft Envelope S", category: "outer", subcategory: "Envelope", length: 20, width: 30, height: 0, maxWeight: 0.5, unitCost: 100, branded: true, unbranded: true, availableFor: ["all"], stock: 900, reorderThreshold: 200, description: "Small kraft envelope.", status: "ok" },
  { id: "m17", sku: "PKG-KRAFT-M", name: "Kraft Envelope M", category: "outer", subcategory: "Envelope", length: 30, width: 40, height: 0, maxWeight: 1, unitCost: 150, branded: true, unbranded: true, availableFor: ["all"], stock: 700, reorderThreshold: 150, description: "Medium kraft envelope.", status: "ok" },
  { id: "m18", sku: "PKG-KRAFT-L", name: "Kraft Envelope L", category: "outer", subcategory: "Envelope", length: 40, width: 55, height: 0, maxWeight: 2, unitCost: 200, branded: true, unbranded: true, availableFor: ["all"], stock: 500, reorderThreshold: 100, description: "Large kraft envelope.", status: "ok" },
  { id: "m19", sku: "PKG-JIFFY-S", name: "Jiffy Mailer S", category: "outer", subcategory: "Jiffy", length: 15, width: 20, height: 0, maxWeight: 0.3, unitCost: 120, branded: false, unbranded: true, availableFor: ["all"], stock: 400, reorderThreshold: 80, description: "Small jiffy padded mailer (unbranded only).", status: "ok" },
  { id: "m20", sku: "PKG-JIFFY-M", name: "Jiffy Mailer M", category: "outer", subcategory: "Jiffy", length: 22, width: 33, height: 0, maxWeight: 0.8, unitCost: 180, branded: false, unbranded: true, availableFor: ["all"], stock: 350, reorderThreshold: 70, description: "Medium jiffy padded mailer (unbranded only).", status: "ok" },
  { id: "m21", sku: "PKG-JIFFY-L", name: "Jiffy Mailer L", category: "outer", subcategory: "Jiffy", length: 30, width: 44, height: 0, maxWeight: 1.5, unitCost: 250, branded: false, unbranded: true, availableFor: ["all"], stock: 250, reorderThreshold: 50, description: "Large jiffy padded mailer (unbranded only).", status: "ok" },
  { id: "m22", sku: "PKG-THERM-S", name: "Thermal Box S", category: "outer", subcategory: "Thermal", length: 20, width: 30, height: 10, maxWeight: 2, unitCost: 500, branded: true, unbranded: true, availableFor: ["fbk", "supplier"], stock: 100, reorderThreshold: 25, description: "Small thermal insulated box.", status: "ok" },
  { id: "m23", sku: "PKG-THERM-M", name: "Thermal Box M", category: "outer", subcategory: "Thermal", length: 40, width: 30, height: 20, maxWeight: 5, unitCost: 800, branded: true, unbranded: true, availableFor: ["fbk", "supplier"], stock: 60, reorderThreshold: 15, description: "Medium thermal insulated box.", status: "ok" },
  { id: "m24", sku: "PKG-FOAM-CUSTOM", name: "Custom Foam Box", category: "outer", subcategory: "Foam", length: 0, width: 0, height: 0, maxWeight: 10, unitCost: 1500, branded: true, unbranded: false, availableFor: ["all"], stock: 0, reorderThreshold: 10, description: "Custom foam box (branded outer, made to order).", status: "out" },
  // ── Inner ──
  { id: "m25", sku: "PKG-INT-BUBBLE", name: "Bubble Wrap Sheets", category: "inner", subcategory: "Cushioning", length: 30, width: 50, height: 0, maxWeight: 0, unitCost: 80, branded: false, unbranded: true, availableFor: ["all"], stock: 1000, reorderThreshold: 200, description: "Bubble wrap sheets 30x50cm.", status: "ok" },
  { id: "m26", sku: "PKG-INT-FOAM-SHEET", name: "Foam Sheets", category: "inner", subcategory: "Cushioning", length: 30, width: 40, height: 0, maxWeight: 0, unitCost: 120, branded: false, unbranded: true, availableFor: ["all"], stock: 800, reorderThreshold: 150, description: "Foam sheets 30x40cm 3mm.", status: "ok" },
  { id: "m27", sku: "PKG-INT-AIR-S", name: "Air Pillows Small", category: "inner", subcategory: "Cushioning", length: 10, width: 15, height: 0, maxWeight: 0, unitCost: 30, branded: false, unbranded: true, availableFor: ["all"], stock: 2000, reorderThreshold: 500, description: "Air pillows small 10x15cm.", status: "ok" },
  { id: "m28", sku: "PKG-INT-AIR-L", name: "Air Pillow Chains", category: "inner", subcategory: "Cushioning", length: 20, width: 30, height: 0, maxWeight: 0, unitCost: 50, branded: false, unbranded: true, availableFor: ["all"], stock: 1500, reorderThreshold: 300, description: "Air pillow chains 20x30cm.", status: "ok" },
  { id: "m29", sku: "PKG-INT-KRAFT-FILL", name: "Kraft Paper Fill", category: "inner", subcategory: "Fill", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 40, branded: false, unbranded: true, availableFor: ["all"], stock: 1200, reorderThreshold: 300, description: "Kraft paper fill sheets.", status: "ok" },
  { id: "m30", sku: "PKG-INT-TISSUE", name: "White Tissue Paper", category: "inner", subcategory: "Wrap", length: 50, width: 75, height: 0, maxWeight: 0, unitCost: 60, branded: false, unbranded: true, availableFor: ["all"], stock: 900, reorderThreshold: 200, description: "White tissue 50x75cm.", status: "ok" },
  { id: "m31", sku: "PKG-INT-TISSUE-COLOR", name: "Coloured Tissue", category: "inner", subcategory: "Wrap", length: 50, width: 75, height: 0, maxWeight: 0, unitCost: 80, branded: true, unbranded: true, availableFor: ["all"], stock: 600, reorderThreshold: 150, description: "Coloured tissue (navy/orange/white).", status: "ok" },
  { id: "m32", sku: "PKG-INT-SHRED", name: "Kraft Shred Fill", category: "inner", subcategory: "Fill", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 100, branded: false, unbranded: true, availableFor: ["all"], stock: 400, reorderThreshold: 80, description: "Kraft paper shred loose fill per bag.", status: "ok" },
  { id: "m33", sku: "PKG-INT-FOAM-PEANUT", name: "Foam Peanuts", category: "inner", subcategory: "Fill", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 150, branded: false, unbranded: true, availableFor: ["all"], stock: 300, reorderThreshold: 60, description: "Foam peanuts loose fill per bag.", status: "ok" },
  { id: "m34", sku: "PKG-INT-DIVIDER", name: "Corrugated Dividers", category: "inner", subcategory: "Divider", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 200, branded: false, unbranded: true, availableFor: ["all"], stock: 200, reorderThreshold: 40, description: "Corrugated dividers per set.", status: "ok" },
  { id: "m35", sku: "PKG-INT-MOULD", name: "Moulded Pulp Inserts", category: "inner", subcategory: "Moulded", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 500, branded: false, unbranded: true, availableFor: ["all"], stock: 100, reorderThreshold: 20, description: "Moulded pulp inserts custom per unit.", status: "ok" },
  // ── Seal ──
  { id: "m36", sku: "PKG-SEAL-TAPE-KV", name: "Kauvex Branded Tape", category: "seal", subcategory: "Tape", length: 0, width: 48, height: 0, maxWeight: 0, unitCost: 150, branded: true, unbranded: false, availableFor: ["all"], stock: 500, reorderThreshold: 100, description: "Kauvex branded tape 48mm per roll.", status: "ok" },
  { id: "m37", sku: "PKG-SEAL-TAPE-CLEAR", name: "Plain Clear Tape", category: "seal", subcategory: "Tape", length: 0, width: 48, height: 0, maxWeight: 0, unitCost: 80, branded: false, unbranded: true, availableFor: ["all"], stock: 700, reorderThreshold: 150, description: "Plain clear tape 48mm per roll.", status: "ok" },
  { id: "m38", sku: "PKG-SEAL-SECURITY", name: "Tamper-Evident Tape", category: "seal", subcategory: "Tape", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 250, branded: false, unbranded: true, availableFor: ["all"], stock: 300, reorderThreshold: 60, description: "Tamper-evident tape VOID per roll.", status: "ok" },
  { id: "m39", sku: "PKG-SEAL-WAX", name: "Wax Seal Kit", category: "seal", subcategory: "Seal", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 75, branded: true, unbranded: false, availableFor: ["all"], stock: 200, reorderThreshold: 40, description: "Wax seal kit (stamp+sticks) per stamp.", status: "ok" },
  { id: "m40", sku: "PKG-SEAL-STICKER", name: "Branded Circular Sticker", category: "seal", subcategory: "Sticker", length: 0, width: 40, height: 0, maxWeight: 0, unitCost: 20, branded: true, unbranded: false, availableFor: ["all"], stock: 2000, reorderThreshold: 500, description: "Circular branded sticker 40mm per sticker.", status: "ok" },
  { id: "m41", sku: "PKG-SEAL-HEAT", name: "Heat Seal Mailer", category: "seal", subcategory: "Integrated", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 0, branded: false, unbranded: true, availableFor: ["all"], stock: 999999, reorderThreshold: 0, description: "Heat seal poly mailer (integrated, no cost).", status: "ok" },
  // ── Label ──
  { id: "m42", sku: "PKG-LBL-SHIPPING", name: "A6 Shipping Label", category: "label", subcategory: "Shipping", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 50, branded: false, unbranded: true, availableFor: ["all"], stock: 5000, reorderThreshold: 1000, description: "A6 shipping label (system generated).", status: "ok" },
  { id: "m43", sku: "PKG-LBL-FRAGILE", name: "Fragile Sticker", category: "label", subcategory: "Warning", length: 100, width: 50, height: 0, maxWeight: 0, unitCost: 30, branded: false, unbranded: true, availableFor: ["all"], stock: 3000, reorderThreshold: 500, description: "Fragile sticker 100x50mm.", status: "ok" },
  { id: "m44", sku: "PKG-LBL-THISWAY", name: "This Way Up Sticker", category: "label", subcategory: "Warning", length: 75, width: 50, height: 0, maxWeight: 0, unitCost: 30, branded: false, unbranded: true, availableFor: ["all"], stock: 2500, reorderThreshold: 500, description: "This Way Up 75x50mm.", status: "ok" },
  { id: "m45", sku: "PKG-LBL-DOBEND", name: "Do Not Bend Sticker", category: "label", subcategory: "Warning", length: 100, width: 50, height: 0, maxWeight: 0, unitCost: 30, branded: false, unbranded: true, availableFor: ["all"], stock: 2000, reorderThreshold: 400, description: "Do Not Bend 100x50mm.", status: "ok" },
  { id: "m46", sku: "PKG-LBL-KEEPREFRIG", name: "Keep Refrigerated", category: "label", subcategory: "Warning", length: 75, width: 50, height: 0, maxWeight: 0, unitCost: 35, branded: false, unbranded: true, availableFor: ["all"], stock: 1500, reorderThreshold: 300, description: "Keep Refrigerated 75x50mm.", status: "ok" },
  { id: "m47", sku: "PKG-LBL-BATTERY", name: "Lithium Battery Label", category: "label", subcategory: "Regulatory", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 50, branded: false, unbranded: true, availableFor: ["all"], stock: 1000, reorderThreshold: 200, description: "Lithium Battery IATA label.", status: "ok" },
  { id: "m48", sku: "PKG-LBL-CUSTOMS", name: "Customs Pouch", category: "label", subcategory: "Shipping", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 100, branded: false, unbranded: true, availableFor: ["all"], stock: 800, reorderThreshold: 150, description: "Customs declaration pouch.", status: "ok" },
  { id: "m49", sku: "PKG-LBL-HEAVY", name: "Heavy Sticker", category: "label", subcategory: "Warning", length: 100, width: 50, height: 0, maxWeight: 0, unitCost: 30, branded: false, unbranded: true, availableFor: ["all"], stock: 2000, reorderThreshold: 400, description: "Heavy sticker 100x50mm.", status: "ok" },
  { id: "m50", sku: "PKG-LBL-RETURN", name: "Return Address Label", category: "label", subcategory: "Shipping", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 50, branded: false, unbranded: true, availableFor: ["all"], stock: 3000, reorderThreshold: 600, description: "Return address label A6.", status: "ok" },
  { id: "m51", sku: "PKG-LBL-AUTH", name: "Authenticity NFC/QR Seal", category: "label", subcategory: "Security", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 200, branded: true, unbranded: false, availableFor: ["all"], stock: 500, reorderThreshold: 100, description: "Authenticity NFC/QR seal.", status: "ok" },
  // ── Insert ──
  { id: "m52", sku: "PKG-INS-PACKSLIP", name: "A5 Packing Slip", category: "insert", subcategory: "Document", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 30, branded: false, unbranded: true, availableFor: ["all"], stock: 5000, reorderThreshold: 1000, description: "A5 packing slip.", status: "ok" },
  { id: "m53", sku: "PKG-INS-THANKYOU", name: "Thank You Card", category: "insert", subcategory: "Marketing", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 50, branded: true, unbranded: false, availableFor: ["all"], stock: 2000, reorderThreshold: 500, description: "A6 thank you card.", status: "ok" },
  { id: "m54", sku: "PKG-INS-BRAND", name: "Brand Insert Card", category: "insert", subcategory: "Marketing", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 40, branded: true, unbranded: false, availableFor: ["all"], stock: 3000, reorderThreshold: 600, description: "A6/DL brand insert card.", status: "ok" },
  { id: "m55", sku: "PKG-INS-VOUCHER", name: "Credit Card Voucher", category: "insert", subcategory: "Promo", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 35, branded: true, unbranded: false, availableFor: ["all"], stock: 4000, reorderThreshold: 800, description: "Credit card size voucher.", status: "ok" },
  { id: "m56", sku: "PKG-INS-LOYALTY", name: "Loyalty Points Card", category: "insert", subcategory: "Promo", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 35, branded: true, unbranded: false, availableFor: ["all"], stock: 3000, reorderThreshold: 600, description: "Loyalty points card.", status: "ok" },
  { id: "m57", sku: "PKG-INS-REVIEW", name: "Review Request Card", category: "insert", subcategory: "Marketing", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 40, branded: true, unbranded: false, availableFor: ["all"], stock: 2500, reorderThreshold: 500, description: "Review request card.", status: "ok" },
  { id: "m58", sku: "PKG-INS-WARRANTY", name: "Warranty Card", category: "insert", subcategory: "Document", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 45, branded: true, unbranded: false, availableFor: ["all"], stock: 1500, reorderThreshold: 300, description: "Warranty card A6.", status: "ok" },
  { id: "m59", sku: "PKG-INS-CARE", name: "Product Care Card", category: "insert", subcategory: "Document", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 40, branded: true, unbranded: false, availableFor: ["all"], stock: 2000, reorderThreshold: 400, description: "Product care A6/folded A5.", status: "ok" },
  { id: "m60", sku: "PKG-INS-SAMPLE", name: "Product Sample", category: "insert", subcategory: "Sample", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 0, branded: false, unbranded: true, availableFor: ["all"], stock: 0, reorderThreshold: 0, description: "Product sample (vendor supplies, zero cost).", status: "out" },
  { id: "m61", sku: "PKG-INS-TISSUE-WRAP", name: "Tissue Wrap", category: "insert", subcategory: "Wrap", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 80, branded: true, unbranded: false, availableFor: ["all"], stock: 1000, reorderThreshold: 200, description: "Tissue paper wrap per sheet.", status: "ok" },
  { id: "m62", sku: "PKG-INS-RIBBON", name: "Ribbon / Raffia Tie", category: "insert", subcategory: "Decorative", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 50, branded: true, unbranded: false, availableFor: ["all"], stock: 800, reorderThreshold: 150, description: "Ribbon/raffia tie.", status: "ok" },
  { id: "m63", sku: "PKG-INS-FRAGRANCE", name: "Fragrance Strip", category: "insert", subcategory: "Decorative", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 30, branded: false, unbranded: true, availableFor: ["all"], stock: 1500, reorderThreshold: 300, description: "Fragrance strip.", status: "ok" },
  { id: "m64", sku: "PKG-INS-GIFT-MSG", name: "Gift Message Card", category: "insert", subcategory: "Marketing", length: 0, width: 0, height: 0, maxWeight: 0, unitCost: 100, branded: true, unbranded: false, availableFor: ["all"], stock: 500, reorderThreshold: 100, description: "Personalised gift message A6.", status: "ok" },
];

const defaultForm = {
  sku: "",
  name: "",
  category: "outer",
  subcategory: "",
  length: 0,
  width: 0,
  height: 0,
  maxWeight: 0,
  unitCost: 0,
  branded: false,
  unbranded: true,
  availableFor: [] as string[],
  stock: 0,
  reorderThreshold: 0,
  description: "",
};

export default function AdminPackagingRegistryPage() {
  const [materials, setMaterials] = useState<Material[]>(seedMaterials);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = materials;
    if (categoryFilter) {
      list = list.filter(m => m.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => m.sku.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
    }
    return list;
  }, [materials, categoryFilter, searchQuery]);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...defaultForm });
    setShowModal(true);
  };

  const openEdit = (m: Material) => {
    setEditId(m.id);
    setForm({
      sku: m.sku,
      name: m.name,
      category: m.category,
      subcategory: m.subcategory,
      length: m.length,
      width: m.width,
      height: m.height,
      maxWeight: m.maxWeight,
      unitCost: m.unitCost,
      branded: m.branded,
      unbranded: m.unbranded,
      availableFor: [...m.availableFor],
      stock: m.stock,
      reorderThreshold: m.reorderThreshold,
      description: m.description,
    });
    setShowModal(true);
  };

  const save = () => {
    if (!form.sku.trim() || !form.name.trim()) return;
    const status = calcStatus(form.stock, form.reorderThreshold);
    if (editId) {
      setMaterials(prev =>
        prev.map(m => (m.id === editId ? { ...m, ...form, status } : m))
      );
    } else {
      const newMat: Material = {
        id: `m${Date.now()}`,
        ...form,
        status,
      };
      setMaterials(prev => [...prev, newMat]);
    }
    setShowModal(false);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setMaterials(prev => prev.filter(m => m.id !== deleteId));
      setDeleteId(null);
    }
  };

  const toggleAvail = (val: string) => {
    setForm(prev => ({
      ...prev,
      availableFor: prev.availableFor.includes(val)
        ? prev.availableFor.filter(v => v !== val)
        : [...prev.availableFor, val],
    }));
  };

  return (
    <AdminShell title="Packaging Registry" subtitle="Master catalogue of all packaging materials">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or SKU..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
            />
          </div>
          <button
            onClick={openAdd}
            className="h-10 px-5 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2 shrink-0"
          >
            <Plus size={15} /> Add Material
          </button>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              categoryFilter === null
                ? "bg-navy text-white"
                : "bg-gray-100 text-text-3 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {categories.map(cat => {
            const cfg = categoryConfig[cat];
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? "bg-navy text-white"
                    : `${cfg.color} hover:opacity-80`
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Summary bar */}
        <p className="text-sm text-text-4">
          {filtered.length} of {materials.length} materials
          {categoryFilter && ` in ${categoryConfig[categoryFilter]?.label || categoryFilter}`}
        </p>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["SKU", "Name", "Category", "Dimensions", "Max Weight", "Unit Cost", "Branded", "Unbranded", "Available For", "Stock", "Status", ""].map(h => (
                  <th key={h} className="p-3 text-left text-[10px] font-semibold text-text-4 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-10 text-center text-text-4">
                    <Package size={32} className="mx-auto mb-2 opacity-30" />
                    No materials found
                  </td>
                </tr>
              ) : (
                filtered.map(m => {
                  const cat = categoryConfig[m.category] || { label: m.category, color: "bg-gray-100 text-gray-600" };
                  const st = stockConfig[m.status];
                  return (
                    <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="p-3 font-mono text-xs font-semibold text-text-2 whitespace-nowrap">{m.sku}</td>
                      <td className="p-3 font-medium text-text-1 whitespace-nowrap">{m.name}</td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cat.color}`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-text-3 whitespace-nowrap">{formatDim(m)}</td>
                      <td className="p-3 text-xs text-text-3 whitespace-nowrap">{m.maxWeight > 0 ? `${m.maxWeight}kg` : "—"}</td>
                      <td className="p-3 font-semibold text-text-1 whitespace-nowrap">₦{m.unitCost.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${m.branded ? "bg-orange-50 text-orange" : "bg-gray-100 text-text-4"}`}>
                          {m.branded ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${m.unbranded ? "bg-blue-50 text-blue" : "bg-gray-100 text-text-4"}`}>
                          {m.unbranded ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="p-3 text-[10px] text-text-3 max-w-[120px] truncate" title={formatAvail(m.availableFor)}>
                        {formatAvail(m.availableFor)}
                      </td>
                      <td className="p-3 font-mono text-xs text-text-2 whitespace-nowrap">
                        {m.stock >= 999999 ? "∞" : m.stock.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(m)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                            <Edit2 size={13} className="text-text-4" />
                          </button>
                          <button onClick={() => setDeleteId(m.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                            <Trash2 size={13} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-lg">{editId ? "Edit Material" : "Add Packaging Material"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-50 text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* SKU + Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-2 mb-1 block">SKU *</label>
                  <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" placeholder="e.g. PKG-BOX-M" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 mb-1 block">Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" placeholder="e.g. Corrugated Box M" />
                </div>
              </div>
              {/* Category + Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-2 mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue">
                    {categories.map(c => (
                      <option key={c} value={c}>{categoryConfig[c]?.label || c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 mb-1 block">Subcategory</label>
                  <input value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" placeholder="e.g. Box, Poly Mailer" />
                </div>
              </div>
              {/* Dimensions */}
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Dimensions (cm)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-text-4 mb-0.5 block">Length</label>
                    <input type="number" min={0} value={form.length} onChange={e => setForm({ ...form, length: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-4 mb-0.5 block">Width</label>
                    <input type="number" min={0} value={form.width} onChange={e => setForm({ ...form, width: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-4 mb-0.5 block">Height</label>
                    <input type="number" min={0} value={form.height} onChange={e => setForm({ ...form, height: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                  </div>
                </div>
              </div>
              {/* Max Weight + Unit Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-2 mb-1 block">Max Weight (kg)</label>
                  <input type="number" min={0} step={0.1} value={form.maxWeight} onChange={e => setForm({ ...form, maxWeight: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 mb-1 block">Unit Cost (₦)</label>
                  <input type="number" min={0} value={form.unitCost} onChange={e => setForm({ ...form, unitCost: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
              </div>
              {/* Stock + Reorder */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-2 mb-1 block">Stock Level</label>
                  <input type="number" min={0} value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 mb-1 block">Reorder Threshold</label>
                  <input type="number" min={0} value={form.reorderThreshold} onChange={e => setForm({ ...form, reorderThreshold: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
              </div>
              {/* Branded / Unbranded toggles */}
              <div>
                <label className="text-xs font-semibold text-text-2 mb-2 block">Branding Options</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.branded} onChange={e => setForm({ ...form, branded: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue focus:ring-blue" />
                    <span className="text-sm text-text-2">Branded</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.unbranded} onChange={e => setForm({ ...form, unbranded: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue focus:ring-blue" />
                    <span className="text-sm text-text-2">Unbranded</span>
                  </label>
                </div>
              </div>
              {/* Available For multi-select */}
              <div>
                <label className="text-xs font-semibold text-text-2 mb-2 block">Available For</label>
                <div className="flex flex-wrap gap-2">
                  {["all", "fbk", "fbm", "supplier", "express"].map(val => {
                    const isSelected = form.availableFor.includes(val) || (val === "all" && form.availableFor.includes("all"));
                    return (
                      <button key={val}
                        onClick={() => {
                          if (val === "all") {
                            setForm({ ...form, availableFor: form.availableFor.includes("all") ? [] : ["all"] });
                          } else {
                            const next = form.availableFor.filter(v => v !== "all");
                            toggleAvail(val);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          isSelected
                            ? "bg-blue text-white border-blue"
                            : "bg-white text-text-3 border-gray-200 hover:border-blue hover:text-blue"
                        }`}
                      >
                        {val.charAt(0).toUpperCase() + val.slice(1)}
                      </button>
                    );
                  })}
                </div>
                {form.availableFor.length > 0 && form.availableFor[0] !== "all" && (
                  <p className="text-[10px] text-text-4 mt-1">{form.availableFor.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(", ")}</p>
                )}
              </div>
              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full h-20 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue resize-none" placeholder="Describe this material..." />
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg border border-gray-200 text-sm text-text-3 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={!form.sku.trim() || !form.name.trim()}
                className="flex-1 h-10 rounded-lg bg-blue text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-40 flex items-center justify-center gap-1.5">
                <Save size={14} /> {editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[400px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 size={18} className="text-red" />
              </div>
              <div>
                <h2 className="font-semibold text-base">Delete Material</h2>
                <p className="text-sm text-text-4">Are you sure? This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setDeleteId(null)} className="flex-1 h-10 rounded-lg border border-gray-200 text-sm text-text-3 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 h-10 rounded-lg bg-red text-white text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
