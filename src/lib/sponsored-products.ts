"use client";

const sponsoredProductIds = ["3", "8", "15", "22", "31", "42", "57", "63"];

export function getSponsoredProductIds(_placement?: string): string[] {
  return sponsoredProductIds;
}

export function isSponsoredProduct(productId: string, _placement?: string): boolean {
  const ids = getSponsoredProductIds(placement);
  return ids.includes(productId);
}
