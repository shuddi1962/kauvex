"use client";

import { Truck, Shield, Headphones, CreditCard } from "lucide-react";
import HeroPremium from "@/components/home/hero-premium";
import TrendingShowcase from "@/components/home/trending-showcase";
import DealsOfDay from "@/components/home/deals-of-day";
import PromoBanners from "@/components/home/promo-banners";
import BrandCarousel from "@/components/home/brand-carousel";
import V3FeaturesSection from "@/components/home/v3-features";
import SellBanner from "@/components/home/sell-banner";
import HomepageSectionRenderer from "@/components/home/HomepageSectionRenderer";
import ExpressBanner from "@/components/home/express-banner";

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

      {/* Hero Banner — Premium */}
      <HeroPremium />

      {/* Promo Category Banners */}
      <PromoBanners />

      {/* Trending Showcase — Top 100 Tabbed Products */}
      <TrendingShowcase />

      {/* Deal of the Day */}
      <DealsOfDay />

      {/* V3 Feature Highlights */}
      <V3FeaturesSection />

      {/* Kauvex Express Banner */}
      <ExpressBanner />

      {/* Brand & Vendor Showcase */}
      <BrandCarousel />

      {/* Modular Homepage Sections (from DB or defaults) */}
      <HomepageSectionRenderer />

      {/* Sell on KAUVEX Banner */}
      <SellBanner />
    </div>
  );
}
