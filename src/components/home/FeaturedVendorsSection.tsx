"use client";

import { Star, Store, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface Vendor {
  name: string;
  logo: string;
  slug: string;
  rating: number;
  productCount: number;
}

interface FeaturedVendorsSectionProps {
  title: string;
  vendors: Vendor[];
}

export default function FeaturedVendorsSection({ title, vendors }: FeaturedVendorsSectionProps) {
  return (
    <section className="py-10 sm:py-14 bg-gray-50/50">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <Store size={20} className="text-[#FF6B00]" />
            <h2 className="font-bold text-2xl text-text-1 tracking-tight">{title}</h2>
          </div>
          <Link
            href="/vendors"
            className="text-sm text-[#FF6B00] font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            All Vendors <ChevronRight size={14} />
          </Link>
        </div>

        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent -mx-4 px-4">
          {vendors.map((vendor, i) => (
            <motion.div
              key={vendor.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="flex-shrink-0 w-[180px] sm:w-[200px]"
            >
              <Link
                href={`/vendor/${vendor.slug}`}
                className="block bg-white rounded-xl border border-border p-5 text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mx-auto bg-gray-100 border-2 border-gray-100">
                  {vendor.logo ? (
                    <Image
                      src={vendor.logo}
                      alt={vendor.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-3">
                      <Store size={28} />
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-sm text-text-1 mt-3 line-clamp-1">{vendor.name}</h3>

                <div className="flex items-center justify-center gap-1 mt-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      className={i < Math.floor(vendor.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                    />
                  ))}
                  <span className="text-[10px] text-text-4 ml-0.5">({vendor.rating})</span>
                </div>

                <p className="text-xs text-text-4 mt-2">
                  <span className="font-semibold text-text-2">{vendor.productCount}</span> products
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
