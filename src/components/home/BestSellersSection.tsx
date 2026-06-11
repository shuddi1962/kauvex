"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { products } from "@/lib/demo-data";

interface BestSellersSectionProps {
  title?: string;
  maxShown?: number;
}

export default function BestSellersSection({
  title = "Best Sellers",
  maxShown = 8,
}: BestSellersSectionProps) {
  const bestSellers = useMemo(
    () => [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, maxShown),
    [maxShown]
  );

  return (
    <section className="bg-white py-12">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-syne font-bold text-2xl text-text-1">{title}</h2>
            <p className="text-sm text-text-4 mt-1">Most popular products based on customer reviews</p>
          </div>
          <Link href="/shop?sort=most-orders" className="flex items-center gap-1 text-sm text-blue font-semibold hover:underline">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bestSellers.map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`} className="group">
              <div className="aspect-square bg-off-white rounded-xl mb-3 flex items-center justify-center border border-border group-hover:border-blue/50 transition-colors">
                <span className="text-xs text-text-4 font-mono">{product.sku}</span>
              </div>
              <h3 className="text-sm font-bold text-text-1 line-clamp-2 group-hover:text-blue transition-colors">{product.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-text-3">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-text-4">({product.reviewCount})</span>
              </div>
              <p className="text-sm font-bold text-text-1 mt-1.5">₦{product.regularPrice.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
