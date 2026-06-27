"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Package, ShoppingCart, Check, Tag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useCurrencyStore } from "@/store/currency-store";

interface BundleItem {
  id: string;
  name: string;
  slug: string;
  regularPrice: number;
  image: string;
  quantity: number;
}

interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  items: BundleItem[];
  bundlePrice: number;
  savings: number;
  image: string;
  badge?: string;
  rating: number;
  reviewCount: number;
}

export default function BundleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const formatPrice = useCurrencyStore((s) => s.formatPrice);

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        const res = await fetch(`/api/bundles?slug=${slug}`);
        if (res.ok) {
          const json = await res.json();
          setBundle(json.data || json.bundle || null);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchBundle();
  }, [slug]);

  const handleAddToCart = () => {
    if (!bundle) return;
    bundle.items.forEach((item) => {
      addItem({
        id: item.id,
        name: `${bundle.name} - ${item.name}`,
        price: (bundle.bundlePrice / bundle.items.length),
        image: item.image,
        quantity: item.quantity,
      });
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Package className="w-8 h-8 text-gray-300 animate-pulse" />
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0A1628] mb-2">Bundle Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">This bundle doesn&apos;t exist or is no longer available.</p>
          <Link href="/shop" className="text-sm text-[#FF6B00] hover:underline">← Browse Shop</Link>
        </div>
      </div>
    );
  }

  const totalRegular = bundle.items.reduce((sum, item) => sum + item.regularPrice * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#0A1628]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-[#0A1628]">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0A1628]">{bundle.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bundle Image */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="aspect-square bg-gradient-to-br from-[#FF6B00]/10 to-[#FF6B00]/5 rounded-xl flex items-center justify-center relative">
              <Tag className="w-24 h-24 text-[#FF6B00]/30" />
              {bundle.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-[#FF6B00] text-white text-xs font-bold rounded-full">
                  {bundle.badge}
                </span>
              )}
            </div>

            {/* Bundle Items Preview */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {bundle.items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center mb-1">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                    ) : (
                      <Package className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-2">{item.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bundle Details */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
              <h1 className="text-2xl font-bold text-[#0A1628] mb-2">{bundle.name}</h1>
              <p className="text-sm text-gray-500 mb-4">{bundle.description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-[#FF6B00]">{formatPrice(bundle.bundlePrice)}</span>
                <span className="text-lg text-gray-400 line-through">{formatPrice(totalRegular)}</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  Save {formatPrice(bundle.savings)}
                </span>
              </div>

              {/* Rating */}
              {bundle.rating > 0 && (
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                  <span className="text-amber-500">★</span>
                  {bundle.rating.toFixed(1)} ({bundle.reviewCount} reviews)
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2 mb-6">
                <h3 className="text-sm font-semibold text-[#0A1628]">Bundle Includes:</h3>
                {bundle.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                    <span className="text-xs text-gray-400">×{item.quantity}</span>
                    <span className="text-xs font-medium text-gray-600">{formatPrice(item.regularPrice)}</span>
                  </div>
                ))}
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={addedToCart}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : "bg-[#FF6B00] text-white hover:bg-[#e65c00]"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add Bundle to Cart
                  </>
                )}
              </button>
            </div>

            {/* Savings Breakdown */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <h3 className="text-sm font-semibold text-green-800 mb-2">Bundle Savings</h3>
              <div className="space-y-1 text-xs text-green-700">
                <div className="flex justify-between">
                  <span>Individual prices total:</span>
                  <span>{formatPrice(totalRegular)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bundle price:</span>
                  <span className="font-bold">{formatPrice(bundle.bundlePrice)}</span>
                </div>
                <div className="flex justify-between border-t border-green-200 pt-1">
                  <span>You save:</span>
                  <span className="font-bold">{formatPrice(bundle.savings)} ({Math.round((bundle.savings / totalRegular) * 100)}% off)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
