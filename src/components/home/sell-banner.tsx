"use client";

import Link from "next/link";
import { ArrowRight, Store, BarChart3, Globe, Shield } from "lucide-react";

const benefits = [
  { icon: Globe, text: "Reach millions of buyers worldwide" },
  { icon: BarChart3, text: "Powerful seller analytics & tools" },
  { icon: Shield, text: "Protected payments & dispute resolution" },
];

export default function SellBanner() {
  return (
    <section className="py-10 sm:py-14">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden bg-[#0A1628]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B00]/10 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FF6B00]/5 rounded-full blur-3xl" />

          <div className="relative px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center">
                  <Store size={20} className="text-[#FF6B00]" />
                </div>
                <span className="text-[#FF6B00] text-sm font-bold uppercase tracking-wider">Seller Program</span>
              </div>

              <h2 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
                Sell on <span className="text-[#FF6B00]">KAUVEX</span> — Reach Global Buyers
              </h2>

              <p className="text-white/50 text-sm sm:text-base mt-3 max-w-lg leading-relaxed">
                Join thousands of successful sellers and grow your business across 100+ countries.
                Zero monthly fees, powerful tools, and dedicated support.
              </p>

              <div className="flex flex-wrap gap-4 sm:gap-6 mt-6">
                {benefits.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.text} className="flex items-center gap-2">
                      <Icon size={14} className="text-[#FF6B00] shrink-0" />
                      <span className="text-white/60 text-xs sm:text-sm">{b.text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link
                  href="/vendor/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Start Selling <ArrowRight size={16} />
                </Link>
                <Link
                  href="/sell"
                  className="inline-flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/15 transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
