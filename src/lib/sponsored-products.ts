"use client";

const sponsoredProductIds = ["3", "8", "15", "22", "31", "42", "57", "63"];

export function getSponsoredProductIds(): string[] {
  return sponsoredProductIds;
}

export function isSponsoredProduct(productId: string): boolean {
  const ids = getSponsoredProductIds();
  return ids.includes(productId);
}
