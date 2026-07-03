"use client";

import Image from "next/image";
import { Heart, Eye, Star, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/lib/types";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { title, category, image, price, oldPrice, rating, reviews, discount, badge } = product;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white rounded-xl border border-border/60 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {badge && (
          <span className="absolute top-3 left-3 z-10 bg-orange text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
            {badge}
          </span>
        )}
        {discount ? (
          <span className="absolute top-3 right-3 z-10 bg-navy/90 text-white text-[10px] font-semibold rounded-full px-2 py-1 backdrop-blur-sm">
            -{discount}%
          </span>
        ) : null}

        <Image
          src={image}
          alt={title}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 50vw, 220px"
          className="object-cover transition-all duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 z-10">
          <button aria-label="Wishlist" className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm text-text-3 hover:bg-orange hover:text-white transition-all">
            <Heart size={14} />
          </button>
          <button aria-label="Quick view" className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm text-text-3 hover:bg-navy hover:text-white transition-all">
            <Eye size={14} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button className="w-full h-9 bg-orange hover:bg-orange/90 text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-orange/20">
            <ShoppingCart size={13} />
            Add to Cart
          </button>
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        <p className="text-[10px] uppercase tracking-widest text-text-4 font-medium">{category}</p>
        <h3 className="text-sm font-semibold text-text-1 leading-snug line-clamp-2 group-hover:text-orange transition-colors duration-200">
          {title}
        </h3>

        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              className={`${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
            />
          ))}
          <span className="text-[10px] text-text-4 ml-1">({reviews})</span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-orange font-bold font-display text-base">${price.toFixed(2)}</span>
          {oldPrice && <span className="text-text-4 text-xs line-through">${oldPrice.toFixed(2)}</span>}
        </div>
      </div>
    </motion.div>
  );
}