"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Star, Eye, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { insforge } from "@/lib/insforge";

interface ShowcaseProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
  badge: string | null;
  category: string;
}

const tabs = [
  { id: "all", label: "Top 100" },
  { id: "electronics", label: "Digital & Electronics" },
  { id: "fashion", label: "Fashion & Accessories" },
  { id: "home", label: "Home & Living" },
  { id: "beauty", label: "Health & Beauty" },
];

const fallbackProducts: ShowcaseProduct[] = [
  { id: "s1", name: "Wireless Bluetooth Noise-Cancelling Headphones", slug: "wireless-bluetooth-headphones", price: 89.99, originalPrice: 149.99, rating: 4.5, reviews: 2847, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop", badge: "Sale", category: "electronics" },
  { id: "s2", name: "Smart Watch Pro Series with Heart Rate Monitor", slug: "smart-watch-pro", price: 199.99, originalPrice: null, rating: 4.7, reviews: 1523, image: "https://images.unsplash.com/photo-1546868871-af0de0ae72fc?w=600&h=600&fit=crop", badge: "Featured", category: "electronics" },
  { id: "s3", name: "Premium Leather Crossbody Bag for Women", slug: "premium-leather-crossbody-bag", price: 59.99, originalPrice: 89.99, rating: 4.3, reviews: 967, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop", badge: "Sale", category: "fashion" },
  { id: "s4", name: "4K Ultra HD Smart TV 55-inch with HDR", slug: "4k-ultra-hd-smart-tv", price: 499.99, originalPrice: 699.99, rating: 4.6, reviews: 3201, image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop", badge: "Hot", category: "electronics" },
  { id: "s5", name: "Mechanical Gaming Keyboard RGB Backlit", slug: "mechanical-gaming-keyboard", price: 74.99, originalPrice: null, rating: 4.4, reviews: 1876, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=600&fit=crop", badge: null, category: "electronics" },
  { id: "s6", name: "Designer Running Shoes Lightweight Mesh", slug: "designer-running-shoes", price: 129.99, originalPrice: 179.99, rating: 4.5, reviews: 2456, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop", badge: "Sale", category: "fashion" },
  { id: "s7", name: "Portable Bluetooth Speaker Waterproof", slug: "portable-bluetooth-speaker", price: 39.99, originalPrice: null, rating: 4.2, reviews: 4321, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop", badge: null, category: "electronics" },
  { id: "s8", name: "Minimalist Desk Lamp with Wireless Charger", slug: "desk-lamp-wireless-charger", price: 44.99, originalPrice: 69.99, rating: 4.1, reviews: 789, image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=600&fit=crop", badge: "New", category: "home" },
  { id: "s9", name: "Organic Face Serum Vitamin C", slug: "organic-vitamin-c-serum", price: 28.99, originalPrice: 45.99, rating: 4.8, reviews: 5123, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop", badge: "Hot", category: "beauty" },
  { id: "s10", name: "Stainless Steel French Press Coffee Maker", slug: "french-press-coffee-maker", price: 34.99, originalPrice: null, rating: 4.4, reviews: 2134, image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600&h=600&fit=crop", badge: null, category: "home" },
  { id: "s11", name: "Smart Home Security Camera 2K", slug: "smart-security-camera", price: 79.99, originalPrice: 119.99, rating: 4.3, reviews: 1876, image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=600&fit=crop", badge: "Sale", category: "electronics" },
  { id: "s12", name: "Wool Blend Oversized Cardigan", slug: "wool-blend-cardigan", price: 89.99, originalPrice: 139.99, rating: 4.2, reviews: 654, image: "https://images.unsplash.com/photo-1434389677669-e08b4cda3a60?w=600&h=600&fit=crop", badge: "Sale", category: "fashion" },
];

export default function TrendingShowcase() {
  const { addItem } = useCartStore();
  const { toggleWishlist, wishlistItems } = useUIStore();
  const [products, setProducts] = useState<ShowcaseProduct[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    (async () => {
      const { data, error } = await insforge.database
        .from("products")
        .select("id, name, slug, regular_price, sale_price, rating, review_count, images, badges, category_id")
        .eq("status", "published")
        .order("rating", { ascending: false })
        .limit(16);
      if (!error && data && data.length > 0) {
        setProducts(
          data.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.sale_price || p.regular_price,
            originalPrice: p.sale_price ? p.regular_price : null,
            rating: p.rating || 0,
            reviews: p.review_count || 0,
            image: p.images?.[0] || fallbackProducts[0].image,
            badge: p.badges?.[0] || (p.sale_price ? "Sale" : null),
            category: p.category_id || "electronics",
          }))
        );
      }
      setLoading(false);
    })();
  }, []);

  const filtered = activeTab === "all"
    ? products
    : products.filter((p) => p.category === activeTab);

  return (
    <section className="py-10 sm:py-14 bg-gray-50/50">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative whitespace-nowrap text-sm font-semibold pb-2 transition-colors",
                  activeTab === tab.id ? "text-orange" : "text-text-3 hover:text-text-1"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
          <Link
            href="/shop"
            className="text-sm text-orange font-semibold flex items-center gap-1 hover:gap-2 transition-all shrink-0"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-orange" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4"
            >
              {filtered.slice(0, 12).map((product, i) => {
                const isWishlisted = wishlistItems.includes(product.id);
                const onSale = product.originalPrice !== null;
                const discount = onSale
                  ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
                  : 0;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <Link
                      href={`/product/${product.slug}`}
                      className="block relative aspect-square overflow-hidden bg-gray-50"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />

                      {product.badge && (
                        <span className={cn(
                          "absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full",
                          product.badge === "Sale" && "bg-orange text-white",
                          product.badge === "Featured" && "bg-blue text-white",
                          product.badge === "Hot" && "bg-red text-white",
                          product.badge === "New" && "bg-success text-white",
                        )}>
                          {product.badge === "Hot" ? "🔥 Hot" : product.badge}
                        </span>
                      )}

                      {onSale && discount > 0 && (
                        <span className="absolute top-2 right-2 bg-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      )}

                      {/* Hover actions */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 z-10">
                        <button
                          onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors",
                            isWishlisted
                              ? "bg-red text-white"
                              : "bg-white/90 text-text-3 hover:bg-red hover:text-white"
                          )}
                        >
                          <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                        <Link
                          href={`/product/${product.slug}`}
                          className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center text-text-3 hover:bg-blue hover:text-white transition-colors shadow-sm backdrop-blur-sm"
                        >
                          <Eye size={14} />
                        </Link>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-10">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addItem(product as any);
                          }}
                          className="w-full h-9 bg-orange hover:bg-orange/90 text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md"
                        >
                          <ShoppingCart size={13} />
                          Add to Cart
                        </button>
                      </div>
                    </Link>

                    <div className="p-2.5">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-semibold text-xs sm:text-sm text-text-1 line-clamp-2 hover:text-orange transition-colors leading-snug">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-1 mt-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} className={i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                        ))}
                        <span className="text-[9px] sm:text-[10px] text-text-4 ml-0.5">({product.reviews})</span>
                      </div>

                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-orange font-bold text-sm">${product.price.toFixed(2)}</span>
                        {onSale && (
                          <span className="text-text-4 text-[10px] line-through">${product.originalPrice!.toFixed(2)}</span>
                        )}
                      </div>

                      <div className="mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" />
                        <span className="text-[9px] text-success font-medium">In Stock</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
