"use client";

import Link from "next/link";
import {
  Building2,
  ArrowRight,
  Check,
  Shield,
  Clock,
  Users,
  Globe,
  Zap,
  BarChart3,
} from "lucide-react";

const FEATURES = [
  { icon: Users, title: "Dedicated Account Manager", desc: "Single point of contact for all your logistics needs" },
  { icon: Shield, title: "Custom SLAs", desc: "Guaranteed delivery times with penalty clauses" },
  { icon: Globe, title: "Multi-Country", desc: "Ship to and from 230+ countries with unified billing" },
  { icon: Zap, title: "Priority Processing", desc: "Your shipments skip the queue — always first" },
  { icon: BarChart3, title: "Advanced Analytics", desc: "Custom reports, BI integration, cost optimization" },
  { icon: Clock, title: "24/7 Support", desc: "Dedicated hotline with 15-minute response SLA" },
];

const CASE_STUDIES = [
  {
    company: "Nigerian Fintech",
    industry: "Finance",
    result: "40% reduction in delivery costs",
    desc: "Integrated Kauvex API for card delivery logistics across 6 cities",
  },
  {
    company: "Pan-African Retailer",
    industry: "Retail",
    result: "3-day avg delivery (was 7 days)",
    desc: "Used global fulfillment network for cross-border inventory",
  },
  {
    company: "Lagos Manufacturer",
    industry: "Manufacturing",
    result: "₦12M annual savings",
    desc: "Consolidated haulage and last-mile with Kauvex enterprise plan",
  },
];

export default function EnterprisePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2744] rounded-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Building2 className="w-8 h-8 text-[#FF6B00]" />
          <h1 className="text-2xl font-bold">Enterprise Shipping</h1>
        </div>
        <p className="text-white/70 max-w-xl">
          Custom logistics built for growing and large businesses. Dedicated managers, 
          custom SLAs, and volume pricing.
        </p>
        <div className="flex items-center gap-3 mt-5">
          <Link
            href="/express/corporate"
            className="inline-flex items-center gap-2 bg-[#FF6B00] text-white font-semibold px-6 py-3 rounded-lg text-sm hover:bg-[#e55f00] transition-colors"
          >
            Contact Sales <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/express/api-keys"
            className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white font-semibold px-6 py-3 rounded-lg text-sm hover:bg-white/25 transition-colors"
          >
            View API Docs
          </Link>
        </div>
      </div>

      {/* Features */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Enterprise Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="w-10 h-10 bg-[#FF6B00]/10 rounded-lg flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5 text-[#FF6B00]" />
              </div>
              <h3 className="font-semibold text-sm text-[#0A1628]">{f.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Case Studies */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CASE_STUDIES.map((cs) => (
            <div key={cs.company} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">{cs.industry}</p>
              <h3 className="font-semibold text-[#0A1628] mt-1">{cs.company}</h3>
              <p className="text-lg font-bold text-[#FF6B00] mt-2">{cs.result}</p>
              <p className="text-xs text-gray-500 mt-1">{cs.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
