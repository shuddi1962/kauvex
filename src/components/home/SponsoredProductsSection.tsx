"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { products } from "@/lib/demo-data";
import { getSponsoredProductIds } from "@/lib/sponsored-products";
import ProductCard from "@/components/product/product-card";

interface SponsoredProductsSectionProps {
  title?: string;
  subtitle?: string;
  maxShown?: number;
}

export default function SponsoredProductsSection({
  title = "Sponsored Products",
  subtitle = "Featured products from our trusted vendors",
  maxShown = 4,
}: SponsoredProductsSectionProps) {
  const sponsoredIds = useMemo(() => getSponsoredProductIds("homepage_middle"), []);
  const sponsoredProducts = useMemo(
    () => products.filter((p) => sponsoredIds.includes(p.id)).slice(0, maxShown),
    [sponsoredIds, maxShown]
  );

  if (sponsoredProducts.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-orange-50 to-amber-50 py-12">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-syne font-bold text-2xl text-text-1">{title}</h2>
              <p className="text-sm text-text-4 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <Link href="/search?sponsored=true" className="flex items-center gap-1 text-sm text-orange font-semibold hover:underline">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sponsoredProducts.map((product) => (
            <ProductCard key={product.id} product={product} isSponsored />
          ))}
        </div>
      </div>
    </section>
  );
}
