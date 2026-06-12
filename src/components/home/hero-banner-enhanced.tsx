"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Clock, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { insforge } from "@/lib/insforge";
interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl: string;
  videoUrl?: string;
  bannerType: "image" | "video" | "promotional" | "flash_sale";
  flashSaleEnd?: string;
  countryCode?: string;
}

function FlashCountdown({ endTime }: { endTime: string }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000));
      setTime({
        h: Math.floor(diff / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-2">
      <Clock size={16} className="text-orange" />
      <span className="font-mono font-bold text-xl text-white bg-black/30 px-3 py-1 rounded-lg">
        {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
      </span>
    </div>
  );
}

const defaultSlides: HeroSlide[] = [
  {
    id: "default-1",
    title: "Global Marketplace for Everything You Need",
    subtitle: "Shop millions of products from verified sellers worldwide. Electronics, fashion, home essentials and more.",
    ctaText: "Start Shopping",
    ctaUrl: "/shop",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=800&fit=crop&q=80",
    bannerType: "image",
  },
  {
    id: "default-2",
    title: "Flash Sale — Up to 60% Off Electronics",
    subtitle: "Limited time deals on smartphones, laptops, audio gear and smart home devices from top brands.",
    ctaText: "Shop Deals",
    ctaUrl: "/deals",
    imageUrl: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1920&h=800&fit=crop&q=80",
    bannerType: "flash_sale",
    flashSaleEnd: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: "default-3",
    title: "Sell Globally with KAUVEX",
    subtitle: "Join thousands of sellers reaching buyers across 100+ countries. Zero setup fees, powerful tools.",
    ctaText: "Start Selling",
    ctaUrl: "/vendor/register",
    imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1920&h=800&fit=crop&q=80",
    bannerType: "promotional",
  },
];

export default function HeroBannerEnhanced() {
  const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await insforge.database
        .from("hero_banners")
        .select("*")
        .eq("status", "active")
        .order("sort_order", { ascending: true });

      if (data && data.length > 0) {
        const now = new Date().toISOString();
        const filtered = data.filter((b: any) => {
          if (!b.start_date && !b.end_date) return true;
          if (b.start_date && b.end_date) return b.start_date <= now && b.end_date >= now;
          if (b.start_date) return b.start_date <= now;
          if (b.end_date) return b.end_date >= now;
          return true;
        });
        if (filtered.length > 0) {
          setSlides(filtered.map((b: any) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            ctaText: b.cta_text,
            ctaUrl: b.cta_url,
            imageUrl: b.image_url,
            videoUrl: b.video_url,
            bannerType: b.banner_type,
            flashSaleEnd: b.flash_sale_end,
            countryCode: b.country_code,
          })));
        }
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
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(goToNext, 6000);
    return () => clearInterval(timer);
  }, [isPaused, goToNext, slides.length]);

  const slide = slides[currentIndex];

  return (
    <div
      className="relative overflow-hidden rounded-xl h-[320px] sm:h-[400px] md:h-[460px] lg:h-[520px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {slide.bannerType === "video" && slide.videoUrl ? (
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src={slide.videoUrl} type="video/mp4" />
            </video>
          ) : (
            <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" priority unoptimized />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/60 to-transparent" />

          <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 lg:px-14">
            {slide.bannerType === "video" && (
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex items-center gap-1.5 text-white/70 text-xs mb-3"
              >
                <Play size={12} fill="currentColor" /> Featured Video
              </motion.span>
            )}

            {slide.bannerType === "flash_sale" && slide.flashSaleEnd && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="mb-3"
              >
                <div className="inline-flex items-center gap-2 bg-orange/20 backdrop-blur-sm border border-orange/30 rounded-lg px-3 py-1.5">
                  <span className="text-orange text-xs font-bold uppercase tracking-wider">Flash Sale</span>
                  <FlashCountdown endTime={slide.flashSaleEnd} />
                </div>
              </motion.div>
            )}

            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-orange text-xs font-bold mb-3 tracking-[0.2em] uppercase"
            >
              {slide.bannerType === "promotional" ? "Promotion" : "KAUVEX"}
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
              <Link href={slide.ctaUrl} className="inline-flex items-center justify-center rounded-lg text-sm font-bold h-11 sm:h-12 px-6 sm:px-7 bg-orange text-white hover:bg-orange/90 shadow-lg hover:shadow-xl transition-all">
                {slide.ctaText}
              </Link>
              <Link href="/shop" className="inline-flex items-center justify-center rounded-lg text-sm font-semibold h-11 sm:h-12 px-6 sm:px-7 bg-white/15 border border-white/25 text-white hover:bg-white/25 backdrop-blur-sm transition-all">
                Browse All
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button onClick={goToPrev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors z-10">
            <ChevronLeft size={18} />
          </button>
          <button onClick={goToNext} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors z-10">
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-4 sm:bottom-5 left-6 sm:left-14 flex gap-2 z-10">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "w-8 bg-orange" : "w-3 bg-white/30 hover:bg-white/50"}`}
              />
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-10">
            <motion.div key={currentIndex} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 6, ease: "linear" }} className="h-full bg-orange/60" />
          </div>
        </>
      )}
    </div>
  );
}
