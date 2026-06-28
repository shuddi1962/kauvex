"use client";

import { Check, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    features: [
      "Up to 10 shipments/month",
      "2 courier options",
      "Basic tracking",
      "Email support",
    ],
    current: false,
    cta: "Downgrade",
    ctaDisabled: true,
  },
  {
    name: "Business",
    price: "₦25,000",
    period: "/month",
    features: [
      "Unlimited shipments",
      "All 18+ couriers",
      "Priority pickup scheduling",
      "Branded tracking page",
      "Shipping rules & automation",
      "Shopify / WooCommerce sync",
      "Phone + chat support",
    ],
    current: true,
    badge: "Current plan",
    cta: "Active",
    ctaDisabled: true,
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    features: [
      "Dedicated account manager",
      "Custom SLAs",
      "API access + webhooks",
      "White-label option",
      "Multi-user / team access",
      "Monthly invoicing",
      "24/7 dedicated support",
    ],
    current: false,
    cta: "Contact Sales",
    ctaDisabled: false,
  },
];

export default function SubscriptionPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">Subscription</h1>
        <p className="text-gray-500 mt-1">
          Manage your Kauvex Express plan
        </p>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2744] rounded-xl p-6 flex items-center justify-between text-white">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider">Current plan</p>
          <h2 className="text-xl font-bold mt-1">Business Plan</h2>
          <p className="text-sm text-white/60 mt-1">
            Renews Jan 1, 2027 · ₦25,000/month
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-medium transition-colors">
          Manage plan
        </button>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative border-2 rounded-xl p-6 transition-all ${
              plan.featured
                ? "border-[#FF6B00] shadow-lg"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF6B00] text-white text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                {plan.badge}
              </div>
            )}
            <h3 className="font-semibold text-[#0A1628]">{plan.name}</h3>
            <div className="mt-2 mb-5">
              <span className="text-3xl font-bold text-[#0A1628]">{plan.price}</span>
              <span className="text-sm text-gray-500 ml-1">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled={plan.ctaDisabled}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                plan.featured
                  ? "bg-[#FF6B00] text-white"
                  : plan.ctaDisabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#0A1628] text-white hover:bg-[#1a2744]"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
