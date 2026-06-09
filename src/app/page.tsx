"use client";

import HeroBanner from "@/components/home/hero-banner";
import CategoryGrid from "@/components/home/category-grid";
import FeaturedProducts from "@/components/home/featured-products";
import SellBanner from "@/components/home/sell-banner";
import { ArrowRight, Truck, Shield, Headphones, CreditCard } from "lucide-react";
import Link from "next/link";

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
                    <Icon size={18} className="text-[#FF6B00]" />
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
      <HeroBanner />

      {/* Shop by Category */}
      <CategoryGrid />

      {/* Today's Picks */}
      <FeaturedProducts />

      {/* Flash Sale Strip */}
      <section className="bg-[#FF6B00] py-4">
        <div className="w-full max-w-[1440px] mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-white font-bold text-lg">⚡ FLASH SALE</span>
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
              <span className="font-mono text-white font-bold text-xl">23:59:59</span>
            </div>
          </div>
          <Link href="/deals" className="text-white font-semibold text-sm flex items-center gap-1 hover:underline">
            View All <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Sell on KAUVEX Banner */}
      <SellBanner />
    </div>
  );
}
