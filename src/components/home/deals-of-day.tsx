"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart-store";
import { insforge } from "@/lib/insforge";

interface DealProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
}

const fallbackDeals: DealProduct[] = [
  {
    id: "deal-1", name: "Sony PlayStation VR Aim Controller", slug: "ps-vr-aim",
    price: 350, originalPrice: 450, rating: 4.6, reviews: 1247,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=600&fit=crop",
  },
  {
    id: "deal-2", name: "Samsung Galaxy Note 20 Ultra 5G", slug: "galaxy-note-20-ultra",
    price: 500, originalPrice: 650, rating: 4.8, reviews: 3210,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop",
  },
  {
    id: "deal-3", name: "Samsung Galaxy Buds Pro", slug: "galaxy-buds-pro",
    price: 90, originalPrice: 220, rating: 4.3, reviews: 2876,
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&h=600&fit=crop",
  },
  {
    id: "deal-4", name: "Apple AirPods Max Wireless", slug: "airpods-max",
    price: 479, originalPrice: 549, rating: 4.7, reviews: 1654,
    image: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=600&h=600&fit=crop",
  },
];

function CountdownTimer({ endTime }: { endTime: Date }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endTime.getTime() - Date.now());
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const segments = [
    { label: "Days", value: pad(time.d) },
    { label: "Hours", value: pad(time.h) },
    { label: "Mins", value: pad(time.m) },
    { label: "Secs", value: pad(time.s) },
  ];

  return (
    <div className="flex items-center gap-2">
      {segments.map((seg, i) => (
        <div key={seg.label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="font-mono font-bold text-xl md:text-2xl text-white bg-orange rounded-lg px-2.5 py-1 leading-none">
              {seg.value}
            </span>
            <span className="text-[9px] text-white/50 mt-0.5 uppercase tracking-wider">{seg.label}</span>
          </div>
          {i < segments.length - 1 && (
            <span className="text-orange font-bold text-lg pb-4">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function DealsOfDay() {
  const { addItem } = useCartStore();
  const [deals, setDeals] = useState<DealProduct[]>(fallbackDeals);
  const [countdownEnd] = useState(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 0);
    return d;
  });

  useEffect(() => {
    (async () => {
      const { data, error } = await insforge.database
        .from("products")
        .select("id, name, slug, regular_price, sale_price, rating, review_count, images")
        .eq("status", "published")
        .not("sale_price", "is", null)
        .order("created_at", { ascending: false })
        .limit(8);
      if (!error && data && data.length > 0) {
        setDeals(
          data.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.sale_price,
            originalPrice: p.regular_price,
            rating: p.rating || 0,
            reviews: p.review_count || 0,
            image: p.images?.[0] || fallbackDeals[0].image,
          }))
        );
      }
    })();
  }, []);

  const heroDeal = deals[0];
  const sideDeals = deals.slice(1, 4);

  return (
    <section className="py-10 sm:py-14">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-orange" />
              <h2 className="font-bold text-xl md:text-2xl text-text-1 tracking-tight">Deal of the Day</h2>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-4">
              <span>Ends in:</span>
              <CountdownTimer endTime={countdownEnd} />
            </div>
          </div>
          <Link
            href="/deals"
            className="text-sm text-orange font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="sm:hidden mb-4">
          <CountdownTimer endTime={countdownEnd} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Hero Deal */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative group rounded-2xl overflow-hidden bg-white border border-border shadow-sm hover:shadow-lg transition-shadow"
          >
            <Link href={`/product/${heroDeal.slug}`} className="block">
              <div className="relative aspect-[4/3] md:aspect-[16/10]">
                <Image
                  src={heroDeal.image}
                  alt={heroDeal.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-orange text-white text-xs font-bold px-3 py-1 rounded-full">
                  {heroDeal.originalPrice
                    ? `-${Math.round(((heroDeal.originalPrice - heroDeal.price) / heroDeal.originalPrice) * 100)}%`
                    : "Sale"}
                </div>
              </div>
              <div className="p-4 md:p-5">
                <h3 className="font-bold text-base md:text-lg text-text-1 line-clamp-1">{heroDeal.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-orange font-bold text-xl">${heroDeal.price.toFixed(2)}</span>
                  {heroDeal.originalPrice && (
                    <span className="text-text-4 text-sm line-through">${heroDeal.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < Math.floor(heroDeal.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                    ))}
                  </div>
                  <span className="text-xs text-text-4">({heroDeal.reviews})</span>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); addItem(heroDeal as any); }}
                  className="mt-3 w-full h-10 bg-orange hover:bg-orange/90 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <ShoppingCart size={15} />
                  Add to Cart
                </button>
              </div>
            </Link>
          </motion.div>

          {/* Side Deals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sideDeals.map((deal, i) => {
              const discount = deal.originalPrice
                ? Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)
                : 0;
              return (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={`/product/${deal.slug}`} className="block relative aspect-square">
                    <Image
                      src={deal.image}
                      alt={deal.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute top-2 left-2 bg-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      -{discount}%
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link href={`/product/${deal.slug}`}>
                      <h4 className="font-semibold text-xs text-text-1 line-clamp-2 leading-snug hover:text-orange transition-colors">
                        {deal.name}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-orange font-bold text-sm">${deal.price.toFixed(2)}</span>
                      {deal.originalPrice && (
                        <span className="text-text-4 text-[10px] line-through">${deal.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <button
                      onClick={() => addItem(deal as any)}
                      className="mt-2 w-full h-8 bg-navy hover:bg-navy/90 text-white text-[10px] font-semibold rounded-lg flex items-center justify-center gap-1 transition-all"
                    >
                      <ShoppingCart size={12} />
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
