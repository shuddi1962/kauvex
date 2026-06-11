"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface Category {
  name: string;
  slug: string;
  icon: string;
  image?: string;
}

interface CategoriesSectionProps {
  categories: Category[];
}

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
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

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
            >
              <Link
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-border hover:border-[#FF6B00]/30 hover:shadow-medium transition-all duration-300 group"
              >
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-2xl">{cat.icon}</span>
                  )}
                </div>
                <span className="text-xs font-medium text-text-2 text-center group-hover:text-[#FF6B00] transition-colors line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
