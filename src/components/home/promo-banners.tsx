"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface PromoBanner {
  title: string;
  subtitle: string;
  image: string;
  href: string;
  color: string;
}

const banners: PromoBanner[] = [
  { title: "Shop with complete confidence", subtitle: "Trusted by millions", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&q=80", href: "/shop", color: "from-navy to-navy-light" },
  { title: "Have fun with Fashion!", subtitle: "Up to 60% OFF", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop&q=80", href: "/category/fashion", color: "from-pink-600 to-pink-700" },
  { title: "Cosmetic sale 40% OFF", subtitle: "Beauty essentials", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop&q=80", href: "/category/beauty", color: "from-rose-500 to-rose-600" },
  { title: "Office Supplies", subtitle: "Work from home deals", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&q=80", href: "/category/office", color: "from-blue-600 to-blue-700" },
  { title: "Find something for yourself", subtitle: "New arrivals weekly", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop&q=80", href: "/new-arrivals", color: "from-emerald-600 to-emerald-700" },
  { title: "All for motorcycle", subtitle: "Gear & accessories", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=400&fit=crop&q=80", href: "/category/sports", color: "from-gray-700 to-gray-800" },
  { title: "Pack into the mountain!", subtitle: "Outdoor adventure", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop&q=80", href: "/category/sports", color: "from-teal-600 to-teal-700" },
  { title: "Healthy hit of the week!", subtitle: "Wellness products", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80", href: "/category/health", color: "from-green-600 to-green-700" },
  { title: "Professional Zone", subtitle: "Premium business gear", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop&q=80", href: "/category/professional", color: "from-violet-600 to-violet-700" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function PromoBanners() {
  return (
    <section className="py-10 sm:py-14">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {banners.map((banner) => (
            <motion.div key={banner.title} variants={itemVariants}>
              <Link
                href={banner.href}
                className={`block relative aspect-[3/2] rounded-xl overflow-hidden bg-gradient-to-br ${banner.color} group`}
              >
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-300"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h3 className="text-white font-bold text-xs sm:text-sm leading-tight line-clamp-2">
                    {banner.title}
                  </h3>
                  <p className="text-white/70 text-[10px] sm:text-xs mt-0.5">{banner.subtitle}</p>
                  <div className="flex items-center gap-1 text-white text-[10px] sm:text-xs font-semibold mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    Shop Now <ArrowRight size={10} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
