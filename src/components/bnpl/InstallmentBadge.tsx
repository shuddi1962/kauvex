"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

interface InstallmentBadgeProps {
  price: number;
  className?: string;
  compact?: boolean;
}

interface BnplConfig {
  installmentCount: number;
  firstPaymentPercent: number;
  minOrderValue: number;
}

export default function InstallmentBadge({ price, className = "", compact = false }: InstallmentBadgeProps) {
  const [config, setConfig] = useState<BnplConfig>({ installmentCount: 4, firstPaymentPercent: 25, minOrderValue: 5000 });

  useEffect(() => {
    fetch("/api/v1/pay/bnpl/config")
      .then(r => r.json())
      .then(json => {
        if (json.data?.configs) {
          const cfg = json.data.configs;
          setConfig({
            installmentCount: parseInt(cfg.installment_count || "4"),
            firstPaymentPercent: parseFloat(cfg.first_payment_percent || "25"),
            minOrderValue: parseFloat(cfg.min_order_value || "5000"),
          });
        }
      })
      .catch(() => {});
  }, []);

  if (price < config.minOrderValue) return null;

  const firstPayment = Math.round(price * (config.firstPaymentPercent / 100));
  const remaining = price - firstPayment;
  const perInstallment = Math.round(remaining / (config.installmentCount - 1));

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-[11px] text-blue font-medium ${className}`}>
        <CreditCard size={12} />
        <span>
          Pay in {config.installmentCount}x ₦{perInstallment.toLocaleString()}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-xl p-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <CreditCard size={14} className="text-blue" />
        <span className="text-xs font-bold text-blue">Pay Later — Split into {config.installmentCount} installments</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="bg-white rounded-lg p-2 border border-blue-100">
          <p className="text-text-4 text-[10px]">Pay today ({config.firstPaymentPercent}%)</p>
          <p className="font-bold text-text-1">₦{firstPayment.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg p-2 border border-blue-100">
          <p className="text-text-4 text-[10px]">Then {config.installmentCount - 1}x</p>
          <p className="font-bold text-text-1">₦{perInstallment.toLocaleString()}/wk</p>
        </div>
      </div>
      <p className="text-[9px] text-text-4 mt-2">0% interest · 9 weeks · No hidden fees</p>
    </div>
  );
}
