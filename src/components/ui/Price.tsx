"use client";

import { useStorefront } from "@/lib/storefront-context";

interface PriceProps {
  usdPrice: number;
  showOriginal?: boolean;
  originalUsdPrice?: number;
  discountPercent?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Price({ usdPrice, showOriginal, originalUsdPrice, discountPercent, className = "", size = "md" }: PriceProps) {
  const { storefront, exchangeRate } = useStorefront();

  const convertedPrice = usdPrice * exchangeRate;
  const convertedOriginal = originalUsdPrice ? originalUsdPrice * exchangeRate : undefined;

  const formatCurrency = (amount: number): string => {
    const { currencyCode, currencySymbol } = storefront;
    
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: currencyCode === "NGN" ? 0 : 2,
        maximumFractionDigits: currencyCode === "NGN" ? 0 : 2,
      }).format(amount).replace(/^(\D+)/, currencySymbol);
    } catch {
      return `${currencySymbol}${amount.toFixed(2)}`;
    }
  };

  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <span className={`inline-flex items-center gap-2 ${className}`} title={`Converted from $${usdPrice.toFixed(2)} USD`}>
      <span className={`font-bold ${sizeClasses[size]} text-[#FF6B00]`}>
        {formatCurrency(convertedPrice)}
      </span>
      {showOriginal && convertedOriginal && (
        <span className="text-sm text-text-4 line-through">
          {formatCurrency(convertedOriginal)}
        </span>
      )}
      {discountPercent && (
        <span className="text-[11px] font-bold text-white bg-red px-1.5 py-0.5 rounded">
          -{discountPercent}%
        </span>
      )}
    </span>
  );
}
