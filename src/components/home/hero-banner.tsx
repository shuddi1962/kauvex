"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { insforge } from "@/lib/insforge";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  image: string;
}

const defaultSlides: HeroSlide[] = [
  {
    id: "default-1",
    title: "Global Marketplace for Everything You Need",
    subtitle: "Shop millions of products from verified sellers worldwide. Electronics, fashion, home essentials and more.",
    cta: "Start Shopping",
    ctaLink: "/shop",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=800&fit=crop&q=80",
  },
  {
    id: "default-2",
    title: "Flash Sale — Up to 60% Off Electronics",
    subtitle: "Limited time deals on smartphones, laptops, audio gear and smart home devices from top brands.",
    cta: "Shop Deals",
    ctaLink: "/deals",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1920&h=800&fit=crop&q=80",
  },
  {
    id: "default-3",
    title: "Sell Globally with KAUVEX",
    subtitle: "Join thousands of sellers reaching buyers across 100+ countries. Zero setup fees, powerful tools.",
    cta: "Start Selling",
    ctaLink: "/vendor/register",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1920&h=800&fit=crop&q=80",
  },
];

export default function HeroBanner() {
  const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await insforge.database
        .from("storefront_banners")
        .select("id, image_url, headline, subtext, cta_text, cta_url, sort_order")
        .eq("status", "active")
        .order("sort_order", { ascending: true });
      if (!error && data && data.length > 0) {
        setSlides(
          data.map((b: any) => ({
            id: b.id,
            title: b.headline || "Welcome to KAUVEX",
            subtitle: b.subtext || "Shop millions of products from verified sellers worldwide.",
            cta: b.cta_text || "Shop Now",
            ctaLink: b.cta_url || "/shop",
            image: b.image_url,
          }))
        );
      }
    })();
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goToNext, 5000);
    return () => clearInterval(timer);
  }, [isPaused, goToNext]);

  const slide = slides[currentIndex];

  return (
    <div
      className="relative overflow-hidden rounded-xl h-[320px] sm:h-[400px] md:h-[460px] lg:h-[500px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/85 via-[#0A1628]/60 to-transparent" />

          <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 lg:px-14">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-[#FF6B00] text-xs font-bold mb-3 tracking-[0.2em] uppercase"
            >
              KAUVEX
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-bold text-2xl sm:text-3xl lg:text-[44px] text-white leading-[1.1] max-w-lg tracking-tight"
            >
              {slide.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-white/60 text-sm sm:text-base lg:text-lg mt-3 max-w-md leading-relaxed"
            >
              {slide.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex gap-3 mt-6 sm:mt-8"
            >
              <Link
                href={slide.ctaLink}
                className="inline-flex items-center justify-center rounded-lg text-sm font-bold h-11 sm:h-12 px-6 sm:px-7 bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 shadow-lg hover:shadow-xl transition-all"
              >
                {slide.cta}
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-lg text-sm font-semibold h-11 sm:h-12 px-6 sm:px-7 bg-white/15 border border-white/25 text-white hover:bg-white/25 backdrop-blur-sm transition-all"
              >
                Browse All
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors z-10"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors z-10"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 sm:bottom-5 left-6 sm:left-14 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex ? "w-8 bg-[#FF6B00]" : "w-3 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-10">
        <motion.div
          key={currentIndex}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-full bg-[#FF6B00]/60"
        />
      </div>
    </div>
  );
}
