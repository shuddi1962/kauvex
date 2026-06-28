"use client";

import Link from "next/link";
import {
  ShoppingCart,
  ArrowRight,
  Check,
  Package,
  BarChart3,
  Zap,
  Globe,
} from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    shipments: "Up to 50/month",
    features: [
      "2 courier options",
      "Basic tracking",
      "Email support",
      "Standard rates",
    ],
  },
  {
    name: "Growth",
    price: "₦15,000",
    period: "/month",
    shipments: "Up to 500/month",
    features: [
      "All couriers",
      "Priority tracking",
      "Bulk label printing",
      "5% rate discount",
      "COD collection",
      "API access",
    ],
    featured: true,
    badge: "Popular",
  },
  {
    name: "Scale",
    price: "₦45,000",
    period: "/month",
    shipments: "Unlimited",
    features: [
      "All couriers + priority",
      "Dedicated account manager",
      "Custom SLAs",
      "10% rate discount",
      "Branded tracking page",
      "Webhook integrations",
      "Monthly invoicing",
    ],
  },
];

const INTEGRATIONS = [
  { name: "Shopify", color: "bg-green-500" },
  { name: "WooCommerce", color: "bg-purple-600" },
  { name: "Jumia", color: "bg-yellow-500" },
  { name: "Konga", color: "bg-blue-600" },
  { name: "Bukka Hut", color: "bg-red-500" },
  { name: "Glovo", color: "bg-green-600" },
];

export default function EcommercePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2744] rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <ShoppingCart className="w-8 h-8 text-[#FF6B00]" />
          <h1 className="text-2xl font-bold">eCommerce Shipping</h1>
        </div>
        <p className="text-white/70 max-w-xl">
          Flexible shipping plans built for online sellers. Integrate your store, 
          automate fulfillment, and scale without worry.
        </p>
        <Link
          href="/express/business"
          className="inline-flex items-center gap-2 bg-[#FF6B00] text-white font-semibold px-6 py-3 rounded-lg text-sm mt-5 hover:bg-[#e55f00] transition-colors"
        >
          View Business Plans <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Plans */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Choose Your Plan</h2>
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
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF6B00] text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}
              <h3 className="font-semibold text-[#0A1628]">{plan.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{plan.shipments}</p>
              <div className="mt-3 mb-5">
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
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  plan.featured
                    ? "bg-[#FF6B00] text-white hover:bg-[#e55f00]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {plan.featured ? "Get Started" : "Select Plan"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Store Integrations */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Store Integrations</h2>
        <p className="text-sm text-gray-500 mb-4">
          Connect your store and orders sync automatically — no manual entry needed.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {INTEGRATIONS.map((int) => (
            <div
              key={int.name}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className={`w-8 h-8 ${int.color} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                {int.name[0]}
              </div>
              <span className="text-sm font-medium text-[#0A1628]">{int.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "eCommerce Sellers", value: "2,400+", icon: ShoppingCart },
          { label: "Orders Automated", value: "180K+", icon: Package },
          { label: "Avg Fulfillment", value: "4.2 hrs", icon: Zap },
          { label: "Countries Served", value: "230+", icon: Globe },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <s.icon className="w-6 h-6 text-[#FF6B00] mx-auto mb-2" />
            <p className="text-xl font-bold text-[#0A1628]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
