"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { KAUVEX_CATEGORIES } from "@/lib/categories";

export default function CategoryGrid() {
  return (
    <section className="py-10 sm:py-14">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="font-bold text-2xl text-text-1 tracking-tight">Shop by Category</h2>
            <p className="text-sm text-text-4 mt-1">Browse millions of products across all categories</p>
          </div>
          <Link
            href="/shop"
            className="text-sm text-[#FF6B00] font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {KAUVEX_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-medium transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/60 via-transparent to-transparent" />
              </div>
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{cat.icon}</span>
                  <h3 className="font-semibold text-sm text-text-1 group-hover:text-[#FF6B00] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                </div>
                <p className="text-xs text-text-4 line-clamp-1">{cat.description}</p>
                <span className="inline-flex items-center gap-0.5 mt-2 text-xs font-medium text-[#FF6B00] opacity-0 group-hover:opacity-100 transition-all">
                  Shop Now <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
