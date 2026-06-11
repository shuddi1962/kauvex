"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Banner {
  imageUrl: string;
  headline: string;
  subtext: string;
  ctaText: string;
  ctaUrl: string;
}

interface HeroSliderConfig {
  transitionSpeed?: number;
  autoPlay?: boolean;
  showDots?: boolean;
}

interface HeroSliderProps {
  banners: Banner[];
  config?: HeroSliderConfig;
}

export default function HeroSlider({ banners, config }: HeroSliderProps) {
  const transitionSpeed = config?.transitionSpeed ?? 0.7;
  const autoPlay = config?.autoPlay ?? true;
  const showDots = config?.showDots ?? true;
  const interval = 5000;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const goToPrev = useCallback(() => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (!autoPlay || isPaused || banners.length <= 1) return;
    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isPaused, goToNext, banners.length]);

  if (banners.length === 0) return null;

  const slide = banners[currentIndex];

  return (
    <div
      className="relative overflow-hidden h-[260px] sm:h-[380px] md:h-[460px] lg:h-[520px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: transitionSpeed, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide.imageUrl}
            alt={slide.headline}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/85 via-[#0A1628]/60 to-transparent" />

          <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 lg:px-14">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-bold text-2xl sm:text-3xl lg:text-[44px] text-white leading-[1.1] max-w-lg tracking-tight"
            >
              {slide.headline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-white/60 text-sm sm:text-base lg:text-lg mt-3 max-w-md leading-relaxed"
            >
              {slide.subtext}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-6 sm:mt-8"
            >
              <Link
                href={slide.ctaUrl}
                className="inline-flex items-center justify-center rounded-lg text-sm font-bold h-11 sm:h-12 px-6 sm:px-7 bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 shadow-lg hover:shadow-xl transition-all"
              >
                {slide.ctaText}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
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
        </>
      )}

      {showDots && banners.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-5 left-6 sm:left-14 flex gap-2 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentIndex ? "w-8 bg-[#FF6B00]" : "w-3 bg-white/30 hover:bg-white/50"
              )}
            />
          ))}
        </div>
      )}

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
