"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const brands = [
  { name: "Apple", slug: "apple", color: "bg-gray-100" },
  { name: "Samsung", slug: "samsung", color: "bg-blue-50" },
  { name: "Sony", slug: "sony", color: "bg-black/5" },
  { name: "Nike", slug: "nike", color: "bg-orange-50" },
  { name: "Adidas", slug: "adidas", color: "bg-green-50" },
  { name: "LG", slug: "lg", color: "bg-red-50" },
  { name: "Microsoft", slug: "microsoft", color: "bg-blue-50" },
  { name: "Dell", slug: "dell", color: "bg-blue-50/50" },
];

export default function FeaturedBrandsSection() {
  return (
    <section className="bg-white py-12">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-syne font-bold text-2xl text-text-1">Featured Brands</h2>
            <p className="text-sm text-text-4 mt-1">Shop from top brands worldwide</p>
          </div>
          <Link href="/brands" className="flex items-center gap-1 text-sm text-blue font-semibold hover:underline">
            All Brands <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brand/${brand.slug}`}
              className={`${brand.color} rounded-xl h-20 flex items-center justify-center hover:shadow-md transition-shadow border border-border/50`}
            >
              <span className="text-xs font-bold text-text-3">{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
