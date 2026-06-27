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

export function demoToUuid(id: string): string {
  if (!id.startsWith("demo-")) return id;
  let hash = 0;
  const input = "6ba7b810-9dad-11d1-80b4-00c04fd430c8" + id;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `${hex}-0000-4000-8000-${hex.slice(0, 12).padStart(12, "0")}`;
}

export function generateSKU(category: string, id: number): string {
  const prefix = category.substring(0, 3).toUpperCase();
  return `${prefix}-${String(id).padStart(6, "0")}`;
}
