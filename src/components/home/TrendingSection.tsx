"use client";

import { TrendingUp, Star, ShoppingCart, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Price from "@/components/ui/Price";

interface TrendingProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
}

interface TrendingSectionProps {
  title: string;
  maxShown?: number;
  categoryFilter?: string;
  products: TrendingProduct[];
}

export default function TrendingSection({ title, maxShown = 10, products }: TrendingSectionProps) {
  const displayed = products.slice(0, maxShown);

  return (
    <section className="py-10 sm:py-14">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-[#FF6B00]" />
            <h2 className="font-bold text-2xl text-text-1 tracking-tight">{title}</h2>
          </div>
          <Link
            href="/shop?sort=popular"
            className="text-sm text-[#FF6B00] font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent -mx-4 px-4">
          {displayed.map((product, i) => {
            const onSale = product.originalPrice !== null;
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.4 }}
                className="flex-shrink-0 w-[200px] sm:w-[220px] bg-white rounded-xl border border-border overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="block relative aspect-square overflow-hidden bg-gray-50"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  <span className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <TrendingUp size={10} /> Trending
                  </span>
                  {onSale && (
                    <span className="absolute top-2 right-2 bg-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                    <button className="w-full h-10 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-md">
                      <ShoppingCart size={14} />
                      Add to Cart
                    </button>
                  </div>
                </Link>

                <div className="p-3">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-semibold text-sm text-text-1 line-clamp-2 hover:text-[#FF6B00] transition-colors leading-tight">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 mt-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        className={i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                      />
                    ))}
                    <span className="text-[10px] text-text-4 ml-0.5">({product.reviews})</span>
                  </div>

                  <div className="mt-2">
                    <Price
                      usdPrice={product.price}
                      showOriginal={onSale}
                      originalUsdPrice={onSale ? product.originalPrice! : undefined}
                      size="sm"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
