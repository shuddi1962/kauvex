"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Zap, ChevronRight, Star, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const headlineWords = ["Everything.", "Everywhere.", "Delivered."];

const categories = [
  { name: "Electronics", href: "/category/electronics" },
  { name: "Fashion", href: "/category/fashion" },
  { name: "Home", href: "/category/home" },
  { name: "Beauty", href: "/category/beauty" },
  { name: "Sports", href: "/category/sports" },
];

const products = [
  {
    title: "Premium Wireless Headphones",
    price: "$49.99",
    originalPrice: "$89.99",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80",
    rating: 4.8,
    discount: "-44%",
  },
  {
    title: "Smart Watch Ultra",
    price: "$129.99",
    originalPrice: "$199.99",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80",
    rating: 4.9,
    discount: "-35%",
  },
  {
    title: "Minimalist Sneakers",
    price: "$79.99",
    originalPrice: "$129.99",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&q=80",
    rating: 4.7,
    discount: "-38%",
  },
];

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const wordVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14,
    },
  },
};

const searchVariants = {
  hidden: { y: 60, opacity: 0, scaleX: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scaleX: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      delay: 0.8,
    },
  },
};

const pillContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 1.0,
    },
  },
};

const pillVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 15,
    },
  },
};

export default function HeroPremium() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const cardOffsets = [
    useTransform(scrollY, [0, 800], [0, -150]),
    useTransform(scrollY, [0, 800], [0, -80]),
    useTransform(scrollY, [0, 800], [0, -200]),
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[800px] overflow-hidden bg-navy"
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-[#0f1a3a] to-[#1a0533]" />

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,107,0,0.08) 0%, transparent 60%)",
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 50%", "0% 100%", "0% 0%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient glow orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, #FF6B00 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.03, 0.06, 0.03],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, #FF6B00 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.02, 0.05, 0.02],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 min-h-[inherit] items-center pt-24 pb-16 md:pt-28 md:pb-20">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            {/* Live Now Badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-orange/15 border border-orange/30 rounded-full px-4 py-1.5"
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-orange"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="text-orange text-xs font-bold tracking-wider uppercase">
                Live Now
              </span>
              <Zap size={12} className="text-orange" />
            </motion.div>

            {/* Headline with word stagger */}
            <motion.div
              className="space-y-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight">
                {headlineWords.map((word, i) => (
                  <motion.span
                    key={word}
                    variants={wordVariants}
                    className={`inline-block mr-[0.15em] ${
                      i === 2 ? "text-orange" : "text-white"
                    }`}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="text-white/50 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              The world&apos;s most ambitious marketplace. Shop millions of products from
              verified sellers across 100+ countries with blazing-fast delivery.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              className="relative max-w-xl"
              variants={searchVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="relative flex items-center bg-white/[0.07] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden group focus-within:border-orange/40 focus-within:bg-white/[0.12] transition-all duration-300">
                <Search
                  size={20}
                  className="absolute left-5 text-white/40 group-focus-within:text-orange transition-colors duration-300"
                />
                <input
                  type="text"
                  placeholder="Search millions of products..."
                  className="w-full bg-transparent text-white placeholder:text-white/25 pl-14 pr-4 py-3.5 md:py-4 text-sm outline-none"
                />
                <button className="mr-2 bg-orange hover:bg-orange/90 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5">
                  Search
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Trending searches */}
              <div className="flex items-center gap-2 mt-3 text-xs text-white/25">
                <TrendingUp size={12} />
                <span>Trending:</span>
                {["iPhone 16", "Wireless Earbuds", "Summer Fashion"].map(
                  (trend) => (
                    <button
                      key={trend}
                      className="text-white/50 hover:text-white transition-colors duration-200"
                    >
                      {trend}
                    </button>
                  )
                )}
              </div>
            </motion.div>

            {/* Category Pills */}
            <motion.div
              className="flex flex-wrap gap-2.5"
              variants={pillContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {categories.map((cat) => (
                <motion.div key={cat.name} variants={pillVariants}>
                  <Link
                    href={cat.href}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] rounded-full text-sm text-white/60 hover:text-white transition-all duration-200 backdrop-blur-sm"
                  >
                    {cat.name}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Column — Desktop Floating Cards */}
          <div className="lg:col-span-5 relative hidden lg:block" style={{ height: 520 }}>
            {products.map((product, i) => {
              const positions = [
                { left: "4%", top: "0%", rotate: -3 },
                { left: "42%", top: "18%", rotate: 4 },
                { left: "16%", top: "52%", rotate: -2 },
              ];
              const sizes = [
                "w-[240px] xl:w-[270px]",
                "w-[210px] xl:w-[240px]",
                "w-[225px] xl:w-[255px]",
              ];
              const delays = [0.6, 0.8, 1.0];

              return (
                <motion.div
                  key={product.title}
                  className={`absolute ${sizes[i]} bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl`}
                  style={{
                    left: positions[i].left,
                    top: positions[i].top,
                    rotate: positions[i].rotate,
                    y: cardOffsets[i],
                  }}
                  initial={{ opacity: 0, x: 120 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: delays[i],
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{
                    scale: 1.05,
                    rotate: 0,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                    },
                  }}
                >
                  <div className="relative aspect-square">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-3 left-3 bg-orange text-white text-[10px] font-bold px-2 py-1 rounded-md">
                      {product.discount}
                    </div>
                  </div>
                  <div className="p-3.5">
                    <p className="text-white text-xs font-medium truncate">
                      {product.title}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-orange font-bold text-sm">
                          {product.price}
                        </span>
                        <span className="text-white/25 text-[10px] line-through">
                          {product.originalPrice}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Star
                          size={10}
                          className="text-yellow-500 fill-yellow-500"
                        />
                        <span className="text-white/50 text-[10px]">
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-3 text-white/15 text-xs"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-6 h-px bg-white/15" />
              <span>Scroll to explore</span>
              <div className="w-6 h-px bg-white/15" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Product Cards */}
      <div className="relative z-10 lg:hidden pb-8">
        <div className="flex gap-3 overflow-x-auto px-4 sm:px-6 snap-x snap-mandatory hide-scrollbar">
          {products.map((product, i) => (
            <motion.div
              key={product.title}
              className="snap-start shrink-0 w-[170px] sm:w-[200px] bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.1, duration: 0.5 }}
            >
              <div className="relative aspect-square">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-2 left-2 bg-orange text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  {product.discount}
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-white text-[11px] font-medium truncate">
                  {product.title}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-orange font-bold text-xs">
                    {product.price}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Star size={8} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-white/50 text-[9px]">
                      {product.rating}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy to-transparent pointer-events-none z-10" />
    </section>
  );
}
