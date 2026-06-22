import crypto from "crypto";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = "NGN"): string {
  const symbols: Record<string, string> = {
    NGN: "₦",
    USD: "$",
    GBP: "£",
    EUR: "€",
    GHS: "₵",
    CAD: "C$",
    AUD: "A$",
    ZAR: "R",
    KES: "KSh",
    JPY: "¥",
    CNY: "¥",
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

const UUID_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"; // DNS namespace

export function demoToUuid(id: string): string {
  if (!id.startsWith("demo-")) return id;
  const hash = crypto.createHash("sha1").update(UUID_NAMESPACE + id).digest("hex");
  return [
    hash.slice(0, 8), hash.slice(8, 12), hash.slice(12, 16),
    hash.slice(16, 20), hash.slice(20, 32),
  ].join("-");
}

export function generateSKU(category: string, id: number): string {
  const prefix = category.substring(0, 3).toUpperCase();
  return `${prefix}-${String(id).padStart(6, "0")}`;
}
