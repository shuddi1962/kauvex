"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Star, Eye, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { insforge } from "@/lib/insforge";
import Price from "@/components/ui/Price";

interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
  badge: string | null;
}

const fallbackProducts: FeaturedProduct[] = [
  {
    id: "demo-1", name: "Wireless Bluetooth Noise-Cancelling Headphones", slug: "wireless-bluetooth-headphones",
    price: 89.99, originalPrice: 149.99, rating: 4.5, reviews: 2847,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop", badge: "Sale",
  },
  {
    id: "demo-2", name: "Smart Watch Pro Series with Heart Rate Monitor", slug: "smart-watch-pro",
    price: 199.99, originalPrice: null, rating: 4.7, reviews: 1523,
    image: "https://images.unsplash.com/photo-1546868871-af0de0ae72fc?w=600&h=600&fit=crop", badge: "Featured",
  },
  {
    id: "demo-3", name: "Premium Leather Crossbody Bag for Women", slug: "premium-leather-crossbody-bag",
    price: 59.99, originalPrice: 89.99, rating: 4.3, reviews: 967,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop", badge: "Sale",
  },
  {
    id: "demo-4", name: "4K Ultra HD Smart TV 55-inch with HDR", slug: "4k-ultra-hd-smart-tv",
    price: 499.99, originalPrice: 699.99, rating: 4.6, reviews: 3201,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop", badge: "Hot",
  },
  {
    id: "demo-5", name: "Mechanical Gaming Keyboard RGB Backlit", slug: "mechanical-gaming-keyboard",
    price: 74.99, originalPrice: null, rating: 4.4, reviews: 1876,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=600&fit=crop", badge: null,
  },
  {
    id: "demo-6", name: "Designer Running Shoes Lightweight Mesh", slug: "designer-running-shoes",
    price: 129.99, originalPrice: 179.99, rating: 4.5, reviews: 2456,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop", badge: "Sale",
  },
  {
    id: "demo-7", name: "Portable Bluetooth Speaker Waterproof IPX7", slug: "portable-bluetooth-speaker",
    price: 39.99, originalPrice: null, rating: 4.2, reviews: 4321,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop", badge: null,
  },
  {
    id: "demo-8", name: "Stainless Steel Smart Water Bottle with Temp Display", slug: "smart-water-bottle",
    price: 34.99, originalPrice: 49.99, rating: 4.1, reviews: 789,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop", badge: "New",
  },
];

export default function FeaturedProducts() {
  const { addItem } = useCartStore();
  const { toggleWishlist, wishlistItems } = useUIStore();
  const [products, setProducts] = useState<FeaturedProduct[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    (async () => {
      const { data, error } = await insforge.database
        .from("products")
        .select("id, name, slug, regular_price, sale_price, rating, review_count, images, featured, status")
        .eq("status", "published")
        .eq("featured", true)
        .order("created_at", { ascending: false });
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
            image: (p.images?.[0]) || fallbackProducts.find(f => f.id === "demo-1")?.image || "",
            badge: p.sale_price ? "Sale" : "Featured",
          }))
        );
      }
      setLoading(false);
    })();
  }, []);

  const displayed = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <section className="py-10 sm:py-14 bg-gray-50/50">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="font-bold text-2xl text-text-1 tracking-tight">Today&apos;s Picks</h2>
            <p className="text-sm text-text-4 mt-1">Handpicked just for you</p>
          </div>
          <Link
            href="/shop"
            className="text-sm text-[#FF6B00] font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            Shop All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#FF6B00]" />
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {displayed.map((product, i) => {
            const isWishlisted = wishlistItems.includes(product.id);
            const onSale = product.originalPrice !== null;
            const discount = onSale
              ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
              : 0;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="product-card bg-white rounded-xl border border-border overflow-hidden group relative"
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
                      product.badge === "Sale" && "bg-[#FF6B00] text-white",
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

                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-colors",
                        isWishlisted
                          ? "bg-red text-white"
                          : "bg-white text-text-3 hover:bg-red hover:text-white"
                      )}
                    >
                      <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                    <Link
                      href={`/product/${product.slug}`}
                      className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-text-3 hover:bg-blue hover:text-white transition-colors shadow-sm"
                    >
                      <Eye size={14} />
                    </Link>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addItem(product as any);
                      }}
                      className="w-full h-9 sm:h-10 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-md"
                    >
                      <ShoppingCart size={14} />
                      Add to Cart
                    </button>
                  </div>
                </Link>

                <div className="p-2 sm:p-3">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-semibold text-sm text-text-1 line-clamp-2 hover:text-[#FF6B00] transition-colors leading-tight">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 mt-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        className={i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}
                      />
                    ))}
                    <span className="text-[10px] text-text-4 ml-0.5">({product.reviews})</span>
                  </div>

                  <div className="mt-2">
                    <Price
                      usdPrice={product.price}
                      showOriginal={onSale}
                      originalUsdPrice={onSale ? product.originalPrice! : undefined}
                      size="sm"
                    />
                  </div>

                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span className="text-[10px] text-success font-medium">In Stock</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setVisibleCount(prev => prev + 4)}
              className="h-11 px-8 bg-white border-2 border-[#FF6B00] text-[#FF6B00] font-bold text-sm rounded-xl hover:bg-[#FF6B00] hover:text-white transition-all"
            >
              Load More Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
