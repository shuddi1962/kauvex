"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, Zap, Star, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { heroSlides, todaysDeals } from "@/lib/data";

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const slide = heroSlides[index];

  return (
    <section className="container-kauvex pt-4 pb-2">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        {/* Main Slider */}
        <div className="relative rounded-2xl overflow-hidden h-[380px] md:h-[440px] lg:h-[480px] bg-navy group">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image src={slide.image} alt={slide.title} fill className="object-cover" priority />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
              
              <div className="absolute inset-0 bg-grid-white opacity-30" />

              <div className="absolute inset-0 flex flex-col justify-center px-8 lg:px-14 max-w-xl">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block w-fit bg-orange/20 backdrop-blur-sm text-orange text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-orange/30"
                >
                  {slide.tag}
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="font-display font-extrabold text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white leading-[1.1] tracking-tight mb-3 text-balance"
                >
                  {slide.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-white/60 text-sm md:text-base mb-6 max-w-md leading-relaxed"
                >
                  {slide.subtitle}
                </motion.p>
                <Link
                  href={slide.href}
                  className="inline-block w-fit bg-orange hover:bg-orange/90 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-orange/20 hover:shadow-xl hover:shadow-orange/30 active:scale-95"
                >
                  {slide.cta}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav Arrows */}
          <button
            onClick={() => setIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % heroSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-8 flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-8 bg-orange" : "w-1.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Sidebar: Search + Today's Deals */}
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="flex items-center bg-white border border-border rounded-xl overflow-hidden focus-within:border-orange/50 focus-within:shadow-glow transition-all duration-300">
              <Search size={18} className="absolute left-4 text-text-4" />
              <input
                type="text"
                placeholder="Search millions of products..."
                className="w-full bg-transparent text-text-1 placeholder:text-text-4 pl-11 pr-4 py-3.5 text-sm outline-none"
              />
              <button className="mr-1.5 bg-orange hover:bg-orange/90 text-white text-xs font-semibold px-5 py-2 rounded-lg transition-all">
                Search
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-text-4">
              <TrendingUp size={12} />
              <span>Trending:</span>
              {[{ label: "iPhone 16", href: "/search?q=iphone+16" }, { label: "Wireless Earbuds", href: "/search?q=wireless+earbuds" }, { label: "Summer Fashion", href: "/category/fashion" }].map((trend) => (
                <Link key={trend.label} href={trend.href} className="text-text-3 hover:text-orange transition-colors">
                  {trend.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Today's Deals Widget */}
          <div className="bg-white rounded-xl border border-border/60 shadow-card p-4 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/60">
              <p className="font-display font-bold text-sm text-text-1">Today&apos;s Deals</p>
              <Link href="/deals" className="text-[10px] text-orange font-semibold hover:underline">View All</Link>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              {todaysDeals.map((p) => (
                <Link key={p.id} href="/deals" className="flex gap-3 group">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                    <Image src={p.image} alt={p.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-text-1 leading-snug line-clamp-2 group-hover:text-orange transition-colors">
                      {p.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-orange font-bold text-sm font-display">${p.price}</span>
                      {p.oldPrice && <span className="text-text-4 text-[10px] line-through">${p.oldPrice}</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={9} className="fill-amber-400 text-amber-400" />
                      <span className="text-[9px] text-text-4">{p.rating}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}