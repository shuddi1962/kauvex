"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Sun, CloudSun, Calendar } from "lucide-react";
import { promoStrip } from "@/lib/homepage-data";

const iconMap: Record<string, any> = { Sun, CloudSun, Zap, Calendar };

export default function PromoStrip() {
  return (
    <section className="container-kauvex py-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {promoStrip.map((p, i) => {
          const Icon = iconMap[p.icon] || Zap;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                href={p.href}
                className={`relative rounded-xl overflow-hidden h-28 bg-gradient-to-br ${p.theme} flex items-center gap-4 px-5 text-white cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group`}
              >
                <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <Icon size={24} className="text-white/30" />
                </div>
                <div className="relative z-10">
                  <p className="font-display font-bold text-lg leading-tight text-white">{p.title}</p>
                  <p className="text-xs text-white/80 mt-1">{p.subtitle}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-white font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Shop Now <ArrowRight size={10} />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}