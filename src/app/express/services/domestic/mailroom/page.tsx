"use client";

import Link from "next/link";
import {
  Mail,
  ArrowRight,
  Check,
  FileText,
  Scan,
  Package,
  Building2,
  BarChart3,
  Shield,
} from "lucide-react";

const SERVICES = [
  {
    icon: Mail,
    title: "Mail Collection",
    desc: "We collect mail from your PO Box or designated address",
  },
  {
    icon: Scan,
    title: "Scanning & Digitization",
    desc: "Physical mail scanned and uploaded to your dashboard",
  },
  {
    icon: FileText,
    title: "Sorting & Routing",
    desc: "Mail sorted by department, priority, or custom rules",
  },
  {
    icon: Package,
    title: "Dispatch",
    desc: "Outbound mail sent via courier with tracking",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Volume reports, delivery times, cost breakdown",
  },
  {
    icon: Shield,
    title: "Secure Handling",
    desc: "Confidential mail handled under NDA with chain of custody",
  },
];

const PLANS = [
  {
    name: "Basic",
    price: "₦50,000",
    period: "/month",
    features: [
      "100 mail items/month",
      "Weekly collection",
      "Digital scanning",
      "Basic dashboard",
    ],
  },
  {
    name: "Professional",
    price: "₦150,000",
    period: "/month",
    features: [
      "500 mail items/month",
      "Daily collection",
      "Priority scanning",
      "Department routing",
      "Analytics dashboard",
      "Dedicated coordinator",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    features: [
      "Unlimited items",
      "Real-time collection",
      "Same-day scanning",
      "Custom workflows",
      "API integration",
      "On-site staff",
      "SLA guarantee",
    ],
  },
];

export default function MailroomPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-700 rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Mail className="w-8 h-8 text-amber-200" />
          <h1 className="text-2xl font-bold">Mailroom Services</h1>
        </div>
        <p className="text-white/70 max-w-xl">
          Outsource your entire corporate mailroom — collection, sorting, scanning, dispatch. 
          Efficient mail management for businesses.
        </p>
      </div>

      {/* Services */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">What We Handle</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SERVICES.map((s) => (
            <div key={s.title} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
                <s.icon className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-sm text-[#0A1628]">{s.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`border-2 rounded-xl p-6 ${
                plan.featured ? "border-[#FF6B00] shadow-lg" : "border-gray-200"
              }`}
            >
              {plan.featured && (
                <div className="text-center mb-3">
                  <span className="bg-[#FF6B00] text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="font-semibold text-[#0A1628]">{plan.name}</h3>
              <div className="mt-2 mb-5">
                <span className="text-2xl font-bold text-[#0A1628]">{plan.price}</span>
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
                className={`w-full py-2.5 rounded-lg text-sm font-semibold ${
                  plan.featured
                    ? "bg-[#FF6B00] text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
