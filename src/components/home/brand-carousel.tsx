"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const brands = [
  { name: "Apple", color: "bg-gray-900", textColor: "text-white" },
  { name: "Samsung", color: "bg-blue-600", textColor: "text-white" },
  { name: "Sony", color: "bg-black", textColor: "text-white" },
  { name: "Nike", color: "bg-gray-800", textColor: "text-white" },
  { name: "Adidas", color: "bg-red-600", textColor: "text-white" },
  { name: "LG", color: "bg-red-700", textColor: "text-white" },
  { name: "Microsoft", color: "bg-blue-700", textColor: "text-white" },
  { name: "Dell", color: "bg-blue-800", textColor: "text-white" },
  { name: "Google", color: "bg-gradient-to-br from-blue-500 via-red-400 to-yellow-400", textColor: "text-white" },
  { name: "Amazon", color: "bg-amber-700", textColor: "text-white" },
];

const vendors = [
  { name: "Vendor1", products: "10 products", color: "from-orange-500 to-pink-500" },
  { name: "Vendor2", products: "5 products", color: "from-blue-500 to-cyan-500" },
  { name: "Vendor3", products: "6 products", color: "from-purple-500 to-violet-500" },
  { name: "Vendor4", products: "6 products", color: "from-emerald-500 to-teal-500" },
  { name: "Vendor5", products: "12 products", color: "from-rose-500 to-red-500" },
  { name: "Vendor6", products: "8 products", color: "from-amber-500 to-orange-500" },
];

export default function BrandCarousel() {
  return (
    <section className="py-6 sm:py-10 bg-gray-50/50">
      <div className="w-full max-w-[1440px] mx-auto px-4 space-y-10">
        {/* Brand Avenue */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-xl md:text-2xl text-text-1 tracking-tight">Brand Avenue</h2>
            <Link
              href="/brands"
              className="text-sm text-orange font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-3">
            {brands.map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/brand/${brand.name.toLowerCase()}`}
                  className={`${brand.color} ${brand.textColor} aspect-square rounded-xl flex items-center justify-center text-center p-2 hover:scale-105 hover:shadow-md transition-all duration-200`}
                >
                  <span className="font-bold text-[10px] sm:text-xs leading-tight">{brand.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Vendor Avenue */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-xl md:text-2xl text-text-1 tracking-tight">Vendor Avenue</h2>
            <Link
              href="/vendors"
              className="text-sm text-orange font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory">
            {vendors.map((vendor, i) => (
              <motion.div
                key={vendor.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="snap-start shrink-0"
              >
                <Link
                  href={`/vendor/${vendor.name.toLowerCase()}`}
                  className="flex flex-col items-center gap-3 p-5 bg-white rounded-xl border border-border hover:shadow-md transition-all w-[140px] sm:w-[160px]"
                >
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${vendor.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {vendor.name.charAt(0)}
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm text-text-1">{vendor.name}</p>
                    <p className="text-[10px] text-text-4 mt-0.5">{vendor.products}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
