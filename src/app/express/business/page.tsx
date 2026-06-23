import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2, Users, Upload, Key, Tag, CreditCard, FileText,
  TrendingUp, BarChart3, Shield, ChevronRight, CheckCircle2,
  Zap, Globe, Download, Settings, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Kauvex Express for Business — Shipping Solutions for Companies",
  description:
    "Save on shipping with volume discounts, team access, bulk upload, API integration, and custom waybill branding. Create a free business account.",
  openGraph: {
    title: "Kauvex Express for Business",
    description: "Volume discounts, team access, API integration, and custom waybill branding.",
    type: "website",
  },
};

const features = [
  {
    icon: Building2,
    title: "Saved Addresses",
    desc: "Store frequently used pickup and dropoff locations for one-click selection.",
  },
  {
    icon: Users,
    title: "Team Access",
    desc: "Create sub-accounts for staff with role-based permissions and spending limits.",
  },
  {
    icon: Upload,
    title: "Bulk Upload",
    desc: "Ship up to 500 packages at once with CSV upload. Process in minutes.",
  },
  {
    icon: Key,
    title: "API Access",
    desc: "Integrate Kauvex Express directly into your platform with our REST API.",
  },
  {
    icon: Tag,
    title: "Custom Waybill Branding",
    desc: "Put your logo and colors on every waybill and tracking page.",
  },
  {
    icon: FileText,
    title: "Automated Reports",
    desc: "Monthly shipping reports with spend analysis, delivery performance, and more.",
  },
];

const billingOptions = [
  {
    title: "Pay-Per-Shipment",
    desc: "No commitment. Pay as you ship with standard rates.",
    features: ["No monthly fees", "Standard pricing", "Pay via card or bank transfer"],
  },
  {
    title: "Monthly Invoice",
    desc: "Centralized monthly billing with consolidated invoice.",
    features: ["Net 30 terms", "Consolidated invoice", "Dedicated account manager"],
  },
  {
    title: "Prepaid Credit Wallet",
    desc: "Pre-fund your wallet and unlock volume discount tiers.",
    features: ["Volume-based pricing", "Auto-recharge option", "Best rates from Bronze to Platinum"],
  },
];

const volumeTiers = [
  {
    tier: "Bronze",
    min: "₦0 – ₦100,000",
    discount: "0%",
    color: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-800",
  },
  {
    tier: "Silver",
    min: "₦100,001 – ₦500,000",
    discount: "5%",
    color: "bg-gray-50 border-gray-300",
    badge: "bg-gray-200 text-gray-800",
  },
  {
    tier: "Gold",
    min: "₦500,001 – ₦2,000,000",
    discount: "10%",
    color: "bg-yellow-50 border-yellow-300",
    badge: "bg-yellow-100 text-yellow-800",
    featured: true,
  },
  {
    tier: "Platinum",
    min: "₦2,000,001+",
    discount: "15%",
    color: "bg-blue-50 border-blue-300",
    badge: "bg-blue-100 text-blue-800",
  },
];

export default function BusinessPage() {
  return (
    <div>
      <section className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,107,0,0.12)_0%,_transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange/10 text-orange text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Building2 className="w-3.5 h-3.5" />
              Kauvex Express for Business
            </div>
            <h1 className="text-4xl lg:text-5xl font-syne font-800 text-white leading-tight mb-4">
              Shipping infrastructure for
              <span className="text-orange"> growing businesses</span>
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-xl leading-relaxed">
              Save up to 15% on shipping with volume discounts. Manage your team, upload bulk orders, integrate via API, and brand every waybill.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/express/book">
                <Button size="lg" className="bg-orange hover:bg-orange-600 text-base px-8">
                  Create Business Account <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 text-base px-8">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-syne font-700 text-text-1 mb-3">Everything your business needs</h2>
            <p className="text-text-3 max-w-2xl mx-auto">
              From team management to API integration, Kauvex Express scales with your shipping volume.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-xl border border-border p-6 hover:shadow-medium transition-shadow">
                  <div className="w-11 h-11 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
                    <Icon className="w-5.5 h-5.5 text-orange" />
                  </div>
                  <h3 className="font-syne font-700 text-base text-text-1 mb-1">{f.title}</h3>
                  <p className="text-sm text-text-4">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-off-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-syne font-700 text-text-1 mb-3">Flexible billing for every scale</h2>
            <p className="text-text-3 max-w-2xl mx-auto">
              Whether you ship 10 or 10,000 packages a month, we have a billing option that works for you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {billingOptions.map((opt) => (
              <div key={opt.title} className="bg-white rounded-xl border border-border p-6 hover:shadow-medium transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                    {opt.title === "Pay-Per-Shipment" ? <CreditCard className="w-5 h-5 text-orange" /> :
                     opt.title === "Monthly Invoice" ? <FileText className="w-5 h-5 text-orange" /> :
                     <Star className="w-5 h-5 text-orange" />}
                  </div>
                  <h3 className="font-syne font-700 text-base text-text-1">{opt.title}</h3>
                </div>
                <p className="text-sm text-text-4 mb-4">{opt.desc}</p>
                <ul className="space-y-2">
                  {opt.features.map((f) => (
                    <li key={f} className="text-xs text-text-3 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-syne font-700 text-text-1 mb-3">Volume discount tiers</h2>
            <p className="text-text-3 max-w-2xl mx-auto">
              Pre-fund your wallet and unlock progressively better rates as your shipping volume grows.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {volumeTiers.map((t) => (
              <div key={t.tier} className={`rounded-xl border p-6 text-center ${t.color} ${t.featured ? "ring-2 ring-orange relative" : ""}`}>
                {t.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-xs font-bold bg-orange text-white px-3 py-1 rounded-full">Most Popular</span>
                  </div>
                )}
                <p className={`inline-flex text-xs font-bold px-2.5 py-0.5 rounded-full mb-3 ${t.badge}`}>{t.tier}</p>
                <p className="text-sm text-text-4 mb-2">{t.min}</p>
                <p className="text-3xl font-syne font-800 text-text-1">{t.discount}</p>
                <p className="text-xs text-text-4 mt-1">discount</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange/10 text-orange text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics Dashboard
              </div>
              <h2 className="text-3xl lg:text-4xl font-syne font-700 text-white mb-4">Know your shipping data</h2>
              <p className="text-white/60 mb-6 leading-relaxed">
                Get full visibility into your shipping operations with real-time analytics. Track spend trends, delivery performance, carrier breakdowns, and more — all in one dashboard.
              </p>
              <ul className="space-y-3">
                {[
                  "Monthly spend reports with per-team breakdown",
                  "On-time delivery rate & carrier performance",
                  "Top destinations & route optimization insights",
                  "Export raw data as CSV or PDF",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-orange mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 lg:p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/50">Monthly Spend</p>
                  <p className="text-2xl font-syne font-800 text-orange">₦2,450,000</p>
                </div>
                <div className="h-40 flex items-end gap-2">
                  {[35, 45, 30, 55, 40, 60, 50, 70, 65, 80, 75, 90].map((h, i) => (
                    <div key={i} className="flex-1 bg-orange/30 rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-xs text-white/40">Shipments</p>
                    <p className="text-lg font-syne font-700 text-white">1,247</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">On-Time Rate</p>
                    <p className="text-lg font-syne font-700 text-success">96.3%</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Avg. Cost</p>
                    <p className="text-lg font-syne font-700 text-white">₦1,964</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-orange to-orange-600 rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="text-2xl lg:text-3xl font-syne font-700 text-white mb-2">Ready to transform your shipping?</h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Create a business account in minutes. No minimum volume required.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/express/book">
                <Button size="xl" className="bg-navy hover:bg-navy/90 text-white text-base px-10">
                  Create Business Account <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="xl" className="border-white/30 text-white hover:bg-white/10 text-base px-10">
                  Request Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
