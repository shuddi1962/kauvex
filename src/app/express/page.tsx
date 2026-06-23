import type { Metadata } from "next";
import Link from "next/link";
import { Shield, MapPin, Globe, Clock, Package, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuoteCalculator from "./quote-calculator";

export const metadata: Metadata = {
  title: "Kauvex Express — Ship Anything, Anywhere. Fast.",
  description:
    "Powered by Nigeria's largest independent delivery network. Get instant quotes, track in real-time, and ship nationwide + 50+ countries.",
  openGraph: {
    title: "Kauvex Express — Ship Anything, Anywhere. Fast.",
    description: "Get instant quotes, real-time tracking, nationwide coverage + 50+ countries.",
    type: "website",
    images: [{ url: "/og-express.png", width: 1200, height: 630 }],
  },
};

const trustItems = [
  { icon: Shield, title: "Kauvex Buyer Protection", desc: "Every shipment is covered by our protection guarantee" },
  { icon: MapPin, title: "Real-Time Tracking", desc: "Know exactly where your package is, 24/7" },
  { icon: Globe, title: "Nationwide + 50+ Countries", desc: "Coverage across Nigeria and international destinations" },
  { icon: Clock, title: "Same-Day Delivery", desc: "Select cities — order before 12PM, delivered by 6PM" },
];

const serviceOptions = [
  {
    name: "Economy",
    time: "5-7 business days",
    desc: "Budget-friendly for non-urgent shipments",
    features: ["Tracking included", "Insurance up to ₦50,000", "Weekday delivery"],
  },
  {
    name: "Standard",
    time: "2-4 business days",
    desc: "Best value for everyday shipping",
    features: ["Real-time tracking", "Insurance up to ₦200,000", "Weekday & Saturday delivery"],
  },
  {
    name: "Express",
    time: "1-2 business days",
    desc: "Priority handling for time-sensitive packages",
    features: ["Priority tracking & alerts", "Insurance up to ₦500,000", "Delivery confirmation"],
  },
  {
    name: "Same Day",
    time: "Same day by 6 PM",
    desc: "Select cities — Lagos, Abuja, Port Harcourt",
    features: ["Real-time driver tracking", "Insurance up to ₦1,000,000", "Signature on delivery"],
  },
];

const stats = [
  { value: "1M+", label: "Packages Delivered" },
  { value: "50+", label: "Countries Served" },
  { value: "774", label: "LGAs Covered in Nigeria" },
  { value: "4.8★", label: "Customer Rating" },
];

export default function ExpressPage() {
  return (
    <div>
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,107,0,0.15)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(22,65,196,0.1)_0%,_transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-24 lg:pt-24 lg:pb-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange/10 text-orange text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Package className="w-3.5 h-3.5" />
                Nigeria&apos;s Largest Independent Delivery Network
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-syne font-800 text-white leading-tight mb-4">
                Ship anything, anywhere.
                <span className="text-orange"> Fast.</span>
              </h1>
              <p className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed">
                Powered by Nigeria&apos;s largest independent delivery network. Get instant quotes, book in minutes, and track in real-time.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/express/book">
                  <Button variant="cta" size="lg" className="bg-orange hover:bg-orange-600 text-base px-8">
                    Ship Now <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/express/track">
                  <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 text-base px-8">
                    Track Shipment
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <QuoteCalculator />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-orange" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-1">{item.title}</p>
                    <p className="text-xs text-text-4 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-off-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-syne font-700 text-text-1 mb-3">Services for every need</h2>
            <p className="text-text-3 max-w-2xl mx-auto">
              From budget-friendly economy to urgent same-day delivery, we have a service tier for every shipment.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceOptions.map((svc) => (
              <div key={svc.name} className="bg-white rounded-xl border border-border p-6 hover:shadow-medium transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
                  <Package className="w-5 h-5 text-orange" />
                </div>
                <h3 className="font-syne font-700 text-lg text-text-1 mb-1">{svc.name}</h3>
                <p className="text-sm text-orange font-semibold mb-2">{svc.time}</p>
                <p className="text-xs text-text-4 mb-4">{svc.desc}</p>
                <ul className="space-y-2">
                  {svc.features.map((f) => (
                    <li key={f} className="text-xs text-text-3 flex items-start gap-2">
                      <span className="text-success mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-navy">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-syne font-800 text-orange mb-1">{s.value}</p>
                <p className="text-sm text-white/60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-navy to-navy/90 rounded-2xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-syne font-700 text-white mb-2">Ready to ship with Kauvex Express?</h2>
              <p className="text-white/60">Get your instant quote and book in under 2 minutes.</p>
            </div>
            <div className="flex gap-4 shrink-0">
              <Link href="/express/book">
                <Button variant="cta" size="lg" className="bg-orange hover:bg-orange-600 text-base px-8">
                  Get a Quote
                </Button>
              </Link>
              <Link href="/express/business">
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 text-base px-8">
                  For Business
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
