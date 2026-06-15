"use client";

import Link from "next/link";
import { Radio, Users, Palette, Image as ImageIcon, Sparkles, Package } from "lucide-react";

const features = [
  {
    href: "/live",
    icon: Radio,
    title: "Kauvex Live",
    desc: "Shop live with your favourite vendors. Watch, chat, buy instantly.",
    gradient: "from-red-500 to-pink-600",
  },
  {
    href: "/group-buy",
    icon: Users,
    title: "Group Buy",
    desc: "Buy together, save more! Invite friends and unlock lower prices.",
    gradient: "from-purple-600 to-indigo-700",
  },
  {
    href: "/pod-marketplace",
    icon: Palette,
    title: "POD Marketplace",
    desc: "Browse & license designs from creators. Apply them to print-on-demand products.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    href: "/art-marketplace",
    icon: ImageIcon,
    title: "Art Marketplace",
    desc: "Buy and sell digital art & illustrations with commercial licenses.",
    gradient: "from-[#0A1628] to-purple-900",
  },
  {
    href: "/concierge",
    icon: Sparkles,
    title: "Concierge AI",
    desc: "AI-powered personal shopping assistant. Tell me what you need, I'll find it.",
    gradient: "from-[#0A1628] to-[#FF6B00]",
  },
  {
    href: "/request-product",
    icon: Package,
    title: "Request a Product",
    desc: "Can't find it? Tell us what you need and we'll source it for you.",
    gradient: "from-emerald-500 to-teal-600",
  },
];

export default function V3FeaturesSection() {
  return (
    <section className="py-10 lg:py-14 bg-white">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#0A1628] tracking-tight">Explore Kauvex</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl mx-auto">
            Discover unique ways to shop, sell, and create on the Kauvex platform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.href}
                href={f.href}
                className="group relative overflow-hidden rounded-xl p-5 text-white hover:shadow-lg transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3 backdrop-blur-sm">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-base mb-1">{f.title}</h3>
                  <p className="text-sm text-white/80">{f.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
