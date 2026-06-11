"use client";

import { useState, useEffect } from "react";
import { Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Price from "@/components/ui/Price";

interface FlashProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  image: string;
}

interface FlashDealsSectionProps {
  title: string;
  endTime: string;
  products: FlashProduct[];
}

export default function FlashDealsSection({ title, endTime, products }: FlashDealsSectionProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };
    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <section className="py-10 sm:py-14 bg-gradient-to-r from-[#0A1628] to-[#0F1F3A]">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-2xl text-white tracking-tight">{title}</h2>
            <div className="flex items-center gap-2 text-white">
              <Clock size={16} className="text-[#FF6B00]" />
              <span className="text-xs font-semibold uppercase tracking-wider">Ends in</span>
              <div className="flex items-center gap-1 font-mono font-bold text-sm">
                {timeLeft.days > 0 && (
                  <span className="bg-white/10 rounded px-1.5 py-0.5">{timeLeft.days}d</span>
                )}
                <span className="bg-white/10 rounded px-1.5 py-0.5">{pad(timeLeft.hours)}</span>
                <span className="text-[#FF6B00]">:</span>
                <span className="bg-white/10 rounded px-1.5 py-0.5">{pad(timeLeft.minutes)}</span>
                <span className="text-[#FF6B00]">:</span>
                <span className="bg-white/10 rounded px-1.5 py-0.5">{pad(timeLeft.seconds)}</span>
              </div>
            </div>
          </div>
          <Link
            href="/deals"
            className="text-sm text-[#FF6B00] font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent -mx-4 px-4">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="flex-shrink-0 w-[200px] sm:w-[220px] bg-white rounded-xl overflow-hidden hover:shadow-xl transition-shadow"
            >
              <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                <span className="absolute top-2 left-2 bg-[#FF6B00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Flash Deal
                </span>
              </Link>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-text-1 line-clamp-2 leading-tight">
                  {product.name}
                </h3>
                <div className="mt-2">
                  <Price usdPrice={product.price} showOriginal originalUsdPrice={product.originalPrice} size="sm" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
