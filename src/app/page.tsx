"use client";

import { Truck, Shield, Headphones, CreditCard } from "lucide-react";
import HeroBannerEnhanced from "@/components/home/hero-banner-enhanced";
import CategoryGrid from "@/components/home/category-grid";
import FeaturedProducts from "@/components/home/featured-products";
import SellBanner from "@/components/home/sell-banner";
import HomepageSectionRenderer from "@/components/home/HomepageSectionRenderer";

const trustFeatures = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
  { icon: Shield, title: "Buyer Protection", desc: "Full refund if not received" },
  { icon: Headphones, title: "24/7 Support", desc: "AI + human agents" },
  { icon: CreditCard, title: "Secure Payments", desc: "256-bit SSL encryption" },
];

export default function HomePage() {
  return (
    <div>
      {/* Trust Bar */}
      <div className="bg-white border-b border-border">
        <div className="w-full max-w-[1440px] mx-auto px-4 py-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-orange" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-1">{f.title}</p>
                    <p className="text-[11px] text-text-4">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <HeroBannerEnhanced />

      {/* Shop by Category */}
      <CategoryGrid />

      {/* Today's Picks */}
      <FeaturedProducts />

      {/* Modular Homepage Sections (from DB or defaults) */}
      <HomepageSectionRenderer />

      {/* Sell on KAUVEX Banner */}
      <SellBanner />
    </div>
  );
}
