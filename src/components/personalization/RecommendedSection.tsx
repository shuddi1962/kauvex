"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Star, ArrowRight, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import Price from "@/components/ui/Price";
import ProductTracker from "@/components/personalization/ProductTracker";

interface RecProduct {
  id: string;
  name: string;
  slug: string;
  regularPrice: number;
  salePrice: number | null;
  images: string[];
  rating: number;
  reviewCount?: number;
}

export default function RecommendedSection() {
  const [products, setProducts] = useState<RecProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await fetch("/api/v1/personalization/recommendations?type=homepage&limit=6");
        const data = await res.json();
        if (data.data) {
          setProducts(data.data.map((r: any) => r.product).filter(Boolean));
        }
      } catch (e) {
        console.error("Failed to fetch recommendations", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-800 text-navy">
            {user ? "Recommended for You" : "Trending Now"}
          </h2>
          <p className="text-sm text-text-3 mt-0.5">
            {user ? "Based on your browsing history" : "Most popular products on Kauvex"}
          </p>
        </div>
        <Link href="/shop?sort=rating" className="text-sm text-orange hover:underline flex items-center gap-1">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product, index) => (
          <ProductTracker key={product.id} productId={product.id}>
            <div className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all">
              <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 16vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-4 text-sm">
                    No image
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    useUIStore.getState().toggleWishlist(product.id);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="w-4 h-4 text-text-3" />
                </button>
              </Link>
              <div className="p-3">
                <h3 className="text-xs font-medium text-text-1 line-clamp-2 min-h-[2rem]">
                  <Link href={`/product/${product.slug}`}>{product.name}</Link>
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-text-3">{Number(product.rating).toFixed(1)}</span>
                </div>
                <div className="mt-1">
                  <Price amount={product.salePrice || product.regularPrice} className="text-sm font-700 text-navy" />
                  {product.salePrice && (
                    <Price amount={product.regularPrice} className="text-xs text-text-4 line-through ml-1" />
                  )}
                </div>
                <button
                  onClick={() => addItem({ id: product.id, name: product.name, price: product.salePrice || product.regularPrice, image: product.images?.[0] || "", quantity: 1 })}
                  className="w-full mt-2 py-1.5 bg-navy text-white text-xs font-medium rounded-lg hover:bg-navy/90 transition-colors flex items-center justify-center gap-1"
                >
                  <ShoppingCart className="w-3 h-3" /> Add
                </button>
              </div>
            </div>
          </ProductTracker>
        ))}
      </div>
    </section>
  );
}