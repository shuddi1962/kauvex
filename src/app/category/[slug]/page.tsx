"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Grid3X3, List, SlidersHorizontal, ChevronRight, Package } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useCurrencyStore } from "@/store/currency-store";

interface Product {
  id: string;
  name: string;
  slug: string;
  regularPrice: number;
  salePrice?: number;
  images: { url: string; alt: string }[];
  rating: number;
  reviewCount: number;
  badges: { type: string; active: boolean }[];
  brand?: { name: string; slug: string };
  category?: { name: string; slug: string };
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
];

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const addItem = useCartStore((s) => s.addItem);
  const formatPrice = useCurrencyStore((s) => s.formatPrice);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Try real API first
        const res = await fetch(`/api/v1/products/search?category=${slug}&sort=${sortBy}`);
        if (res.ok) {
          const json = await res.json();
          setProducts(json.data || json.products || []);
          if (json.category) setCategory(json.category);
        }
      } catch {
        // fallback to demo
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, sortBy]);

  // If no real data, show demo products for this category
  const displayProducts = products.length > 0 ? products : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href="/" className="hover:text-[#0A1628]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-[#0A1628]">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0A1628] capitalize">{slug.replace(/-/g, " ")}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628] capitalize">
              {category?.name || slug.replace(/-/g, " ")}
            </h1>
            {category?.description && (
              <p className="text-sm text-gray-500 mt-1">{category.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {displayProducts.length} products
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-[#0A1628] text-white" : "bg-white border border-gray-200"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[#0A1628] text-white" : "bg-white border border-gray-200"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <SlidersHorizontal className="w-4 h-4" />
            Filter & Sort
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Package className="w-8 h-8 text-gray-300 animate-pulse" />
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-[#0A1628] mb-2">No products found</h2>
            <p className="text-sm text-gray-500 mb-4">This category doesn&apos;t have any products yet.</p>
            <Link
              href="/shop"
              className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-[#e65c00] transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-3"}>
            {displayProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className={`bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow ${
                  viewMode === "list" ? "flex items-center gap-4 p-4" : ""
                }`}
              >
                <div className={`${viewMode === "list" ? "w-20 h-20" : "aspect-square"} bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} alt={product.images[0].alt || product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className={`${viewMode === "list" ? "flex-1" : "p-3"}`}>
                  <p className="text-xs text-gray-400 mb-0.5">{product.brand?.name || "Brand"}</p>
                  <h3 className="text-sm font-medium text-[#0A1628] line-clamp-2 mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-[#FF6B00]">
                      {formatPrice(product.salePrice || product.regularPrice)}
                    </span>
                    {product.salePrice && product.salePrice < product.regularPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.regularPrice)}
                      </span>
                    )}
                  </div>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span className="text-amber-500">★</span>
                      {product.rating.toFixed(1)} ({product.reviewCount})
                    </div>
                  )}
                  {viewMode === "list" && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.salePrice || product.regularPrice,
                          image: product.images?.[0]?.url || "",
                          quantity: 1,
                        });
                      }}
                      className="mt-2 px-3 py-1 bg-[#FF6B00] text-white text-xs rounded-md hover:bg-[#e65c00]"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
