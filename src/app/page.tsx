"use client";

import { Truck, Shield, Headphones, CreditCard } from "lucide-react";
import HeroSection from "@/components/home/kauvex-homepage-override/HeroSection";
import PromoStrip from "@/components/home/kauvex-homepage-override/PromoStrip";
import DealOfDay from "@/components/home/kauvex-homepage-override/DealOfDay";
import TopProducts from "@/components/home/kauvex-homepage-override/TopProducts";
import CategoryBlock from "@/components/home/kauvex-homepage-override/CategoryBlock";
import PromoBanners from "@/components/home/kauvex-homepage-override/PromoBanners";
import CategoryIcons from "@/components/home/kauvex-homepage-override/CategoryIcons";
import BrandSlider from "@/components/home/kauvex-homepage-override/BrandSlider";
import VendorShowcase from "@/components/home/kauvex-homepage-override/VendorShowcase";
import Newsletter from "@/components/home/kauvex-homepage-override/Newsletter";
import RecommendedSection from "@/components/personalization/RecommendedSection";
import { categoryBlocks } from "@/lib/homepage-data";

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

      {/* Hero Section */}
      <HeroSection />

      {/* Promo Strip */}
      <PromoStrip />

      {/* Deal of the Day */}
      <DealOfDay />

      {/* Top Products */}
      <TopProducts />

      {/* Recommended / Trending */}
      <RecommendedSection />

      {/* Category Blocks */}
      {categoryBlocks.map((block) => (
        <CategoryBlock
          key={block.key}
          title={block.title}
          bannerImage={block.bannerImage}
          bannerTag={block.bannerTag}
          href={block.href}
          products={block.products}
        />
      ))}

      {/* Promo Banners */}
      <PromoBanners />

      {/* Category Icons */}
      <CategoryIcons />

      {/* Brand Slider */}
      <BrandSlider />

      {/* Vendor Showcase */}
      <VendorShowcase />

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
