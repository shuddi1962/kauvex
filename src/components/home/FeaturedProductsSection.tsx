"use client";

import { Star, ShoppingCart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Price from "@/components/ui/Price";

interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
}

interface FeaturedProductsSectionProps {
  title: string;
  subtitle?: string;
  products: FeaturedProduct[];
  maxShown?: number;
}

export default function FeaturedProductsSection({ title, subtitle, products, maxShown = 8 }: FeaturedProductsSectionProps) {
  const displayed = products.slice(0, maxShown);

  return (
    <section className="py-10 sm:py-14 bg-gray-50/50">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="font-bold text-2xl text-text-1 tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-text-4 mt-1">{subtitle}</p>}
          </div>
          <Link
            href="/shop"
            className="text-sm text-[#FF6B00] font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            Shop All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {displayed.map((product, i) => {
            const onSale = product.originalPrice !== null;
            const discount = onSale
              ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
              : 0;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="bg-white rounded-xl border border-border overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
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

                  {onSale && discount > 0 && (
                    <span className="absolute top-2 right-2 bg-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      -{discount}%
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
