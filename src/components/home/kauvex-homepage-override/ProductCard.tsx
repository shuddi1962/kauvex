"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, Star, ShoppingCart, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Product } from "@/lib/homepage-types";
import { existingRoutes } from "@/lib/homepage-data";
import { useCartStore } from "@/store/cart-store";

const productUrl = (id: string, category?: string) => {
  if (category && existingRoutes[category]) return existingRoutes[category];
  return "/shop";
};

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { id, title, category, image, price, oldPrice, rating, reviews, discount, badge } = product;
  const [added, setAdded] = useState(false);

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    useCartStore.getState().addItem(
      {
        id: `homepage-${id}`,
        name: title,
        slug: title.toLowerCase().replace(/\s+/g, "-"),
        type: "simple",
        sku: id,
        shortDescription: title,
        longDescription: title,
        brand: { id: "", name: "", slug: "", logo: "", productCount: 0 },
        category: { id: "", name: category, slug: category?.toLowerCase().replace(/\s+/g, "-") || "", productCount: 0 },
        regularPrice: oldPrice || price,
        salePrice: price,
        images: [{ id: "1", url: image, alt: title, position: 0, watermark: false }],
        badges: [],
        inventory: [{ locationId: "main", locationName: "Main", quantity: 10, lowStockThreshold: 2, backorderEnabled: false }],
        seo: { metaTitle: title, metaDescription: title, focusKeyword: "", altTexts: [] },
        tags: [category],
        rating,
        reviewCount: reviews,
        featured: false,
        status: "published",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any,
      1,
      undefined,
      "phc-main"
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={productUrl(id, category)}
        className="group relative bg-white rounded-xl border border-border/60 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 overflow-hidden block"
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
            unoptimized
          />

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

          <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 z-10">
            <button
              aria-label="Wishlist"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm text-text-3 hover:bg-orange hover:text-white transition-all"
            >
              <Heart size={14} />
            </button>
            <button
              aria-label="Quick view"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm text-text-3 hover:bg-navy hover:text-white transition-all"
            >
              <Eye size={14} />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={addToCart}
              className={`w-full h-9 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-lg flex items-center justify-center gap-1.5 ${
                added ? "bg-emerald-500 text-white" : "bg-orange hover:bg-orange/90 text-white shadow-orange/20"
              }`}
            >
              {added ? <Check size={13} /> : <ShoppingCart size={13} />}
              {added ? "Added!" : "Add to Cart"}
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
      </Link>
    </motion.div>
  );
}

