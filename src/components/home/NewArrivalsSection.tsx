"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { products } from "@/lib/demo-data";

interface NewArrivalsSectionProps {
  title?: string;
  maxShown?: number;
}

export default function NewArrivalsSection({
  title = "New Arrivals",
  maxShown = 8,
}: NewArrivalsSectionProps) {
  const newArrivals = useMemo(
    () => [...products].slice(0, maxShown),
    [maxShown]
  );

  return (
    <section className="bg-off-white py-12">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center">
              <Clock size={20} className="text-blue" />
            </div>
            <div>
              <h2 className="font-syne font-bold text-2xl text-text-1">{title}</h2>
              <p className="text-sm text-text-4 mt-1">Fresh products just added to our catalog</p>
            </div>
          </div>
          <Link href="/new-arrivals" className="flex items-center gap-1 text-sm text-blue font-semibold hover:underline">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {newArrivals.map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`} className="group relative">
              <div className="absolute top-2 left-2 z-10 bg-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                NEW
              </div>
              <div className="aspect-square bg-white rounded-xl mb-3 flex items-center justify-center border border-border group-hover:border-blue/50 transition-colors">
                <span className="text-xs text-text-4 font-mono">{product.sku}</span>
              </div>
              <h3 className="text-sm font-bold text-text-1 line-clamp-2 group-hover:text-blue transition-colors">{product.name}</h3>
              <p className="text-xs text-text-4 mt-1">{product.category.name}</p>
              <p className="text-sm font-bold text-text-1 mt-1.5">₦{product.regularPrice.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
