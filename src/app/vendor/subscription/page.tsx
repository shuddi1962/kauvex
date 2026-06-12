"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Check,
  X,
  Zap,
  Building2,
  Crown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Clock,
  Package,
  Users,
  Store,
  BarChart3,
  RefreshCw,
  Ban,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

const CURRENT_PLAN = {
  id: "free",
  name: "Free",
  price: 0,
  currency: "$",
  interval: "month",
  status: "active",
  periodStart: "2026-05-11",
  periodEnd: "2026-06-11",
  cancelAtPeriodEnd: false,
};

const PLANS = [
  {
    id: "free",
    name: "Free",
    icon: Zap,
    price: 0,
    currency: "$",
    interval: "month",
    description: "Get started with basic selling tools",
    color: "gray",
    features: [
      { name: "Products", value: "10", included: true },
      { name: "Staff Accounts", value: "1", included: true },
      { name: "Storefronts", value: "1", included: true },
      { name: "Analytics", value: "Basic", included: true },
      { name: "Commission Rate", value: "12%", included: true },
      { name: "Drag & Drop Builder", value: null, included: false },
      { name: "Custom Domain", value: null, included: false },
      { name: "White Label", value: null, included: false },
      { name: "Priority Support", value: null, included: false },
      { name: "Custom CSS/Scripts", value: null, included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    icon: Crown,
    price: 29,
    currency: "$",
    interval: "month",
    description: "Advanced tools for growing businesses",
    color: "purple",
    popular: true,
    features: [
      { name: "Products", value: "Unlimited", included: true },
      { name: "Staff Accounts", value: "5", included: true },
      { name: "Storefronts", value: "3", included: true },
      { name: "Analytics", value: "Advanced", included: true },
      { name: "Commission Rate", value: "8%", included: true },
      { name: "Drag & Drop Builder", value: null, included: true },
      { name: "Custom Domain", value: "1", included: true },
      { name: "White Label", value: null, included: false },
      { name: "Priority Support", value: null, included: true },
      { name: "Custom CSS/Scripts", value: null, included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Building2,
    price: 99,
    currency: "$",
    interval: "month",
    description: "Full power for large-scale operations",
    color: "amber",
    features: [
      { name: "Products", value: "Unlimited", included: true },
      { name: "Staff Accounts", value: "Unlimited", included: true },
      { name: "Storefronts", value: "Unlimited", included: true },
      { name: "Analytics", value: "Real-time", included: true },
      { name: "Commission Rate", value: "5%", included: true },
      { name: "Drag & Drop Builder", value: null, included: true },
      { name: "Custom Domain", value: "Unlimited", included: true },
      { name: "White Label", value: null, included: true },
      { name: "Priority Support", value: null, included: true },
      { name: "Custom CSS/Scripts", value: null, included: true },
    ],
  },
];

const USAGE_STATS = [
  { label: "Products Used", used: 4, limit: 10, icon: Package },
  { label: "Staff Accounts", used: 1, limit: 1, icon: Users },
  { label: "Storefronts", used: 1, limit: 1, icon: Store },
  { label: "Monthly Orders", used: 156, limit: null, icon: BarChart3 },
];

const billingHistory = [
  { id: "INV-001", date: "May 11, 2026", description: "Free Plan - Monthly", amount: "$0.00", status: "Paid" },
  { id: "INV-002", date: "Apr 11, 2026", description: "Free Plan - Monthly", amount: "$0.00", status: "Paid" },
  { id: "INV-003", date: "Mar 11, 2026", description: "Free Plan - Monthly", amount: "$0.00", status: "Paid" },
];

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState(CURRENT_PLAN);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleChangePlan = async (planId: string) => {
    setProcessing(planId);
    await new Promise((r) => setTimeout(r, 1000));
    setCurrentPlan({ ...currentPlan, id: planId, name: PLANS.find((p) => p.id === planId)?.name || planId });
    setProcessing(null);
  };

  const handleCancel = async () => {
    setProcessing("cancel");
    await new Promise((r) => setTimeout(r, 1000));
    setCurrentPlan({ ...currentPlan, cancelAtPeriodEnd: true });
    setShowCancelConfirm(false);
    setProcessing(null);
  };

  const handleReinstate = async () => {
    setProcessing("reinstate");
    await new Promise((r) => setTimeout(r, 1000));
    setCurrentPlan({ ...currentPlan, cancelAtPeriodEnd: false });
    setProcessing(null);
  };

  return (
    <VendorShell title="Subscription & Plans" subtitle="Manage your vendor plan and billing">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">Current Plan</h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        currentPlan.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {currentPlan.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {currentPlan.name} Plan · {currentPlan.currency}{currentPlan.price}/{currentPlan.interval}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    currentPlan.id === "free"
                      ? "bg-gray-100"
                      : currentPlan.id === "premium"
                        ? "bg-purple-100"
                        : "bg-amber-100"
                  }`}
                >
                  {currentPlan.id === "free" ? (
                    <Zap size={20} className="text-gray-500" />
                  ) : currentPlan.id === "premium" ? (
                    <Crown size={20} className="text-purple-600" />
                  ) : (
                    <Building2 size={20} className="text-amber-600" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} /> Period Start
                  </p>
                  <p className="text-xs font-semibold mt-0.5">{currentPlan.periodStart}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} /> Period End
                  </p>
                  <p className="text-xs font-semibold mt-0.5">{currentPlan.periodEnd}</p>
                </div>
              </div>

              {currentPlan.cancelAtPeriodEnd && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle size={14} className="text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Subscription Cancelled</p>
                    <p className="text-[10px] text-amber-700">
                      Your plan will expire on {currentPlan.periodEnd}. You can reinstate before then.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <BarChart3 size={16} className="text-purple-600" /> Usage
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {USAGE_STATS.map((stat) => {
                  const Icon = stat.icon;
                  const pct = stat.limit ? Math.round((stat.used / stat.limit) * 100) : null;
                  return (
                    <div key={stat.label} className="text-center">
                      <Icon size={18} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-lg font-bold text-gray-900">
                        {stat.used}
                        {stat.limit !== null && <span className="text-sm text-gray-400">/{stat.limit}</span>}
                      </p>
                      <p className="text-[10px] text-gray-500">{stat.label}</p>
                      {pct !== null && (
                        <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-purple-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {currentPlan.cancelAtPeriodEnd ? (
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    onClick={handleReinstate}
                    disabled={processing === "reinstate"}
                  >
                    {processing === "reinstate" ? (
                      <Loader2 size={14} className="mr-1 animate-spin" />
                    ) : (
                      <RefreshCw size={14} className="mr-1" />
                    )}
                    Reinstate Plan
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setShowCancelConfirm(true)}
                  >
                    <Ban size={14} className="mr-1" />
                    Cancel Subscription
                  </Button>
                )}
                <Button variant="outline" className="w-full text-xs">
                  <CreditCard size={14} className="mr-1" />
                  Update Payment
                </Button>
                <Button variant="outline" className="w-full text-xs">
                  <Clock size={14} className="mr-1" />
                  Billing History
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-sm mb-6">Available Plans</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const PlanIcon = plan.icon;
              const isCurrent = currentPlan.id === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border-2 p-5 transition-all ${
                    plan.popular
                      ? "border-purple-600 shadow-lg shadow-purple-100"
                      : isCurrent
                        ? "border-purple-400"
                        : "border-gray-200"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-purple-600 text-white px-3 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        plan.color === "purple"
                          ? "bg-purple-100"
                          : plan.color === "amber"
                            ? "bg-amber-100"
                            : "bg-gray-100"
                      }`}
                    >
                      <PlanIcon
                        size={16}
                        className={
                          plan.color === "purple"
                            ? "text-purple-600"
                            : plan.color === "amber"
                              ? "text-amber-600"
                              : "text-gray-500"
                        }
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{plan.name}</p>
                      <p className="text-lg font-bold">
                        {plan.currency}{plan.price}
                        <span className="text-xs font-normal text-gray-400">/{plan.interval}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-4">{plan.description}</p>
                  <div className="space-y-2 mb-5">
                    {plan.features.map((feature) => (
                      <div key={feature.name} className="flex items-center gap-2">
                        {feature.included ? (
                          <Check size={12} className="text-green-500 shrink-0" />
                        ) : (
                          <X size={12} className="text-gray-300 shrink-0" />
                        )}
                        <span className={`text-[11px] ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                          {feature.name}
                          {feature.value ? <span className="font-semibold"> ({feature.value})</span> : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant={isCurrent ? "outline" : plan.popular ? "default" : "outline"}
                    className={`w-full text-xs ${plan.popular && !isCurrent ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                    onClick={() => !isCurrent && handleChangePlan(plan.id)}
                    disabled={isCurrent || processing === plan.id}
                  >
                    {processing === plan.id ? (
                      <Loader2 size={14} className="mr-1 animate-spin" />
                    ) : isCurrent ? (
                      "Current Plan"
                    ) : plan.price === 0 ? (
                      "Downgrade"
                    ) : currentPlan.price < plan.price ? (
                      <><ArrowUp size={12} className="mr-1" /> Upgrade</>
                    ) : (
                      <><ArrowDown size={12} className="mr-1" /> Downgrade</>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-purple-600" /> Billing History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-[10px] text-gray-400 font-semibold uppercase">Invoice</th>
                  <th className="text-left py-3 px-2 text-[10px] text-gray-400 font-semibold uppercase">Date</th>
                  <th className="text-left py-3 px-2 text-[10px] text-gray-400 font-semibold uppercase">Description</th>
                  <th className="text-right py-3 px-2 text-[10px] text-gray-400 font-semibold uppercase">Amount</th>
                  <th className="text-right py-3 px-2 text-[10px] text-gray-400 font-semibold uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-sm text-gray-400">
                      No billing history yet
                    </td>
                  </tr>
                ) : (
                  billingHistory.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2 text-xs font-mono font-semibold">{inv.id}</td>
                      <td className="py-3 px-2 text-xs text-gray-600">{inv.date}</td>
                      <td className="py-3 px-2 text-xs text-gray-600">{inv.description}</td>
                      <td className="py-3 px-2 text-xs text-right font-semibold">{inv.amount}</td>
                      <td className="py-3 px-2 text-right">
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowCancelConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Ban size={20} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-center mb-1">Cancel Subscription?</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Your plan will remain active until the end of the current billing period. After that, your store will
              be downgraded to the Free plan.
            </p>
            <Button
              variant="destructive"
              className="w-full mb-2"
              onClick={handleCancel}
              disabled={processing === "cancel"}
            >
              {processing === "cancel" ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : null}
              Yes, Cancel Plan
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCancelConfirm(false)}
            >
              Keep Plan
            </Button>
          </div>
        </div>
      )}
    </VendorShell>
  );
}
