"use client";

import { useMemo, useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal, X, Grid3X3, List, Star, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { products, categories, brands } from "@/lib/demo-data";
import { searchProducts, searchCategories, searchBrands, addRecentSearch } from "@/lib/search";
import { KAUVEX_CATEGORIES } from "@/lib/categories";
import { useCurrencyStore } from "@/store/currency-store";
import { isSponsoredProduct } from "@/lib/sponsored-products";
import type { Product } from "@/types";

type ViewMode = "grid" | "list";
type SortOption = "best-match" | "price-asc" | "price-desc" | "top-rated" | "most-orders" | "newest";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "best-match", label: "Best Match" },
  { value: "price-asc", label: "Price Low–High" },
  { value: "price-desc", label: "Price High–Low" },
  { value: "top-rated", label: "Top Rated" },
  { value: "most-orders", label: "Most Orders" },
  { value: "newest", label: "Newest" },
];

const VENDOR_TIERS = [
  { value: "gold", label: "Gold+" },
  { value: "platinum", label: "Platinum" },
  { value: "official", label: "Official Brand" },
];

const IMAGE_FALLBACK = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop";

const PRODUCTS_PER_PAGE = 20;

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice, formatNGN, currency } = useCurrencyStore();

  const q = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const ratingFilter = searchParams.get("rating") || "";
  const sortParam = (searchParams.get("sort") || "best-match") as SortOption;

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryFilter ? categoryFilter.split(",") : []
  );
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(minPrice);
  const [priceMax, setPriceMax] = useState(maxPrice);
  const [minRating, setMinRating] = useState(ratingFilter ? parseInt(ratingFilter) : 0);

  useEffect(() => {
    setSelectedCategories(categoryFilter ? categoryFilter.split(",") : []);
  }, [categoryFilter]);

  useEffect(() => {
    setPage(1);
  }, [q, categoryFilter, minPrice, maxPrice, ratingFilter, sortParam]);

  const allResults = useMemo(() => {
    let results: Product[] = [];

    if (q) {
      results = searchProducts(q, 200).map((r) => r.product);
    } else {
      results = [...products];
    }

    if (selectedCategories.length > 0) {
      results = results.filter((p) => selectedCategories.includes(p.category.slug));
    }

    if (priceMin) {
      const min = parseFloat(priceMin);
      if (!isNaN(min)) results = results.filter((p) => (p.salePrice || p.regularPrice) >= min);
    }
    if (priceMax) {
      const max = parseFloat(priceMax);
      if (!isNaN(max)) results = results.filter((p) => (p.salePrice || p.regularPrice) <= max);
    }

    if (minRating > 0) {
      results = results.filter((p) => p.rating >= minRating);
    }

    if (selectedTiers.length > 0) {
      results = results.filter((p) => {
        const tier = p.brand.name.toLowerCase();
        if (selectedTiers.includes("gold") && (tier.includes("gold") || tier.includes("platinum"))) return true;
        if (selectedTiers.includes("platinum") && tier.includes("platinum")) return true;
        if (selectedTiers.includes("official") && (tier === "official" || tier.includes("brand"))) return true;
        return false;
      });
    }

    switch (sortParam) {
      case "price-asc":
        results.sort((a, b) => (a.salePrice || a.regularPrice) - (b.salePrice || b.regularPrice));
        break;
      case "price-desc":
        results.sort((a, b) => (b.salePrice || b.regularPrice) - (a.salePrice || a.regularPrice));
        break;
      case "top-rated":
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "most-orders":
        results.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "newest":
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }

    return results;
  }, [q, selectedCategories, priceMin, priceMax, minRating, selectedTiers, sortParam]);

  const totalPages = Math.max(1, Math.ceil(allResults.length / PRODUCTS_PER_PAGE));
  const pagedResults = allResults.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, page]);

  const buildUrl = useCallback(
    (params: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([k, v]) => {
        if (v) sp.set(k, v);
        else sp.delete(k);
      });
      return `/search?${sp.toString()}`;
    },
    [searchParams]
  );

  const handleCategoryToggle = (slug: string) => {
    const next = selectedCategories.includes(slug)
      ? selectedCategories.filter((c) => c !== slug)
      : [...selectedCategories, slug];
    setSelectedCategories(next);
    setPage(1);
    const url = buildUrl({ category: next.join(",") });
    router.push(url, { scroll: false });
  };

  const handleRatingClick = (rating: number) => {
    const next = minRating === rating ? 0 : rating;
    setMinRating(next);
    setPage(1);
    const url = buildUrl({ rating: next > 0 ? String(next) : "" });
    router.push(url, { scroll: false });
  };

  const handlePriceFilter = () => {
    setPage(1);
    const url = buildUrl({ min_price: priceMin, max_price: priceMax });
    router.push(url, { scroll: false });
  };

  const handleSort = (sort: string) => {
    const url = buildUrl({ sort });
    router.push(url, { scroll: false });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = new FormData(form);
    const query = input.get("search-query") as string;
    if (query.trim()) {
      addRecentSearch(query.trim());
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const toggleFilter = () => setFilterOpen((v) => !v);

  const categoryMap = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const slug = p.category.slug;
      map.set(slug, (map.get(slug) || 0) + 1);
    });
    return map;
  }, []);

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-4" />
            <input
              name="search-query"
              defaultValue={q}
              placeholder="Search products, categories, brands..."
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-white text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-shadow"
            />
          </div>
        </form>

        <div className="flex gap-6">
          {/* Mobile Filter Overlay */}
          {filterOpen && (
            <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setFilterOpen(false)}>
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}

          {/* Sidebar Filters */}
          <aside
            className={`
              fixed top-0 left-0 bottom-0 z-50 w-80 bg-white shadow-xl lg:shadow-none
              lg:static lg:z-auto lg:w-64 shrink-0 lg:block
              transition-transform duration-300
              ${filterOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
              overflow-y-auto
            `}
          >
            <div className="sticky top-0 bg-white border-b border-border px-4 py-3 flex items-center justify-between lg:hidden">
              <span className="font-semibold text-sm">Filters</span>
              <button onClick={toggleFilter} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Category */}
              <div>
                <h3 className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-3">Category</h3>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {KAUVEX_CATEGORIES.map((cat) => {
                    const count = categoryMap.get(cat.slug) || 0;
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.slug)}
                          onChange={() => handleCategoryToggle(cat.slug)}
                          className="accent-[#FF6B00] w-4 h-4 rounded border-border"
                        />
                        <span className="text-sm text-text-2 flex-1 truncate">{cat.name}</span>
                        <span className="text-[11px] text-text-4">{count}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-3">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                  <span className="text-text-4">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-border text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                </div>
                <button
                  onClick={handlePriceFilter}
                  className="mt-2 w-full h-8 text-sm font-medium text-white bg-[#FF6B00] rounded-lg hover:bg-[#e85f00] transition-colors"
                >
                  Apply
                </button>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-3">Minimum Rating</h3>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingClick(star)}
                      className={`p-1 rounded transition-colors ${
                        star <= minRating ? "text-yellow-400" : "text-gray-200 hover:text-yellow-300"
                      }`}
                    >
                      <Star size={22} fill={star <= minRating ? "currentColor" : "none"} />
                    </button>
                  ))}
                  {minRating > 0 && (
                    <button
                      onClick={() => handleRatingClick(0)}
                      className="ml-2 text-[11px] text-text-4 hover:text-red transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Vendor Tier */}
              <div>
                <h3 className="text-xs font-semibold text-text-3 uppercase tracking-wider mb-3">Vendor Tier</h3>
                <div className="space-y-1.5">
                  {VENDOR_TIERS.map((tier) => (
                    <label
                      key={tier.value}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTiers.includes(tier.value)}
                        onChange={() => {
                          setSelectedTiers((prev) =>
                            prev.includes(tier.value)
                              ? prev.filter((t) => t !== tier.value)
                              : [...prev, tier.value]
                          );
                          setPage(1);
                        }}
                        className="accent-[#FF6B00] w-4 h-4 rounded border-border"
                      />
                      <span className="text-sm text-text-2">{tier.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Results */}
          <main className="flex-1 min-w-0">
            {/* Header: Count + Sort + View Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleFilter}
                  className="lg:hidden flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm text-text-2 hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </button>
                <h1 className="text-xl font-bold text-text-1">
                  {q ? (
                    <>
                      <span className="text-text-3 font-normal">{allResults.length} results for</span>{" "}
                      &ldquo;{q}&rdquo;
                    </>
                  ) : (
                    <>
                      <span className="text-text-3 font-normal">{allResults.length} products</span>
                    </>
                  )}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <select
                  value={sortParam}
                  onChange={(e) => handleSort(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-border text-sm text-text-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* View Toggle */}
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 transition-colors ${
                      viewMode === "grid" ? "bg-[#FF6B00] text-white" : "text-text-4 hover:bg-gray-50"
                    }`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 transition-colors ${
                      viewMode === "list" ? "bg-[#FF6B00] text-white" : "text-text-4 hover:bg-gray-50"
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {pagedResults.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {pagedResults.map((product) => (
                      <ProductCard key={product.id} product={product} isSponsored={isSponsoredProduct(product.id, "search_results")} formatPrice={formatPrice} formatNGN={formatNGN} currency={currency} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pagedResults.map((product) => (
                      <ProductRow key={product.id} product={product} isSponsored={isSponsoredProduct(product.id, "search_results")} formatPrice={formatPrice} formatNGN={formatNGN} currency={currency} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-8">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="p-2 rounded-lg border border-border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {pageNumbers.map((p, i) =>
                      p === "..." ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-text-4 text-sm">
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                            page === p
                              ? "bg-[#FF6B00] text-white"
                              : "border border-border text-text-2 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="p-2 rounded-lg border border-border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* No Results */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search size={28} className="text-text-4" />
                </div>
                <h2 className="text-lg font-semibold text-text-1 mb-1">No results found</h2>
                <p className="text-sm text-text-4 max-w-md mb-6">
                  {q ? (
                    <>We couldn&apos;t find any matches for &ldquo;{q}&rdquo;. Try different keywords or remove filters.</>
                  ) : (
                    <>No products match the selected filters. Try adjusting your criteria.</>
                  )}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["CCTV", "Solar Panel", "Router", "Fire Alarm", "Hard Drive", "Camera"].map(
                    (suggestion) => (
                      <Link
                        key={suggestion}
                        href={`/search?q=${encodeURIComponent(suggestion)}`}
                        className="text-sm px-4 py-2 rounded-full bg-gray-100 text-text-3 hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] transition-colors"
                      >
                        {suggestion}
                      </Link>
                    )
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* --- Sub-components --- */

function getProductImage(product: Product): string {
  if (product.images && product.images.length > 0) return product.images[0].url;
  const catSlug = product.category.slug;
  const map: Record<string, string> = {
    surveillance: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&h=400&fit=crop",
    "fire-alarm": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop",
    "access-control": "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop",
    "solar-systems": "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop",
    networking: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop",
    "ict-equipment": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
    "marine-accessories": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop",
    "boat-engines": "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=400&h=400&fit=crop",
    "safety-equipment": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop",
    "dredging-equipment": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    "kitchen-equipment": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    "ups-inverters": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop",
  };
  return map[catSlug] || IMAGE_FALLBACK;
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"}
          fill={s <= Math.round(rating) ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

function ProductCard({
  product,
  formatPrice,
  formatNGN,
  currency,
  isSponsored = false,
}: {
  product: Product;
  formatPrice: (n: number) => string;
  formatNGN: (n: number) => string;
  currency: string;
  isSponsored?: boolean;
}) {
  const price = product.salePrice || product.regularPrice;
  const hasSale = !!product.salePrice;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-md hover:border-[#FF6B00]/20 transition-all duration-200"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={getProductImage(product)}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {hasSale && (
          <span className="absolute top-2 left-2 bg-[#FF6B00] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            SALE
          </span>
        )}
        {isSponsored && (
          <span className="absolute top-2 right-2 bg-blue text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
            SPONSORED
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-text-4 truncate mb-0.5">{product.category.name}</p>
        <p className="text-sm font-medium text-text-1 leading-tight line-clamp-2 mb-1.5 group-hover:text-[#FF6B00] transition-colors">
          {product.name}
        </p>
        <div className="flex items-center gap-1 mb-1.5">
          <StarRating rating={product.rating} size={12} />
          <span className="text-[11px] text-text-4">({product.reviewCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-[#FF6B00]">{formatPrice(price)}</span>
          {hasSale && (
            <span className="text-[11px] text-text-4 line-through">{formatPrice(product.regularPrice)}</span>
          )}
        </div>
        {currency !== "NGN" && (
          <p className="text-[10px] text-text-4 mt-0.5">{formatNGN(price)}</p>
        )}
      </div>
    </Link>
  );
}

function ProductRow({
  product,
  formatPrice,
  formatNGN,
  currency,
  isSponsored = false,
}: {
  product: Product;
  formatPrice: (n: number) => string;
  formatNGN: (n: number) => string;
  currency: string;
  isSponsored?: boolean;
}) {
  const price = product.salePrice || product.regularPrice;
  const hasSale = !!product.salePrice;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="flex gap-4 bg-white rounded-xl border border-border p-3 hover:shadow-md hover:border-[#FF6B00]/20 transition-all duration-200 group"
    >
      <div className="relative w-24 h-24 rounded-lg bg-gray-50 overflow-hidden shrink-0">
        <Image
          src={getProductImage(product)}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="96px"
        />
        {hasSale && (
          <span className="absolute top-1 left-1 bg-[#FF6B00] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            SALE
          </span>
        )}
        {isSponsored && (
          <span className="absolute top-1 right-1 bg-blue text-white text-[8px] font-bold px-1 py-0.5 rounded">
            SPONSORED
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-4 mb-0.5">{product.category.name}</p>
        <p className="text-sm font-medium text-text-1 leading-tight group-hover:text-[#FF6B00] transition-colors line-clamp-1">
          {product.name}
        </p>
        <p className="text-xs text-text-4 mt-1 line-clamp-1">{product.shortDescription}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <StarRating rating={product.rating} size={12} />
          <span className="text-[11px] text-text-4">({product.reviewCount})</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-bold text-[#FF6B00]">{formatPrice(price)}</span>
          {hasSale && (
            <span className="text-xs text-text-4 line-through">{formatPrice(product.regularPrice)}</span>
          )}
          {currency !== "NGN" && (
            <span className="text-[10px] text-text-4">({formatNGN(price)})</span>
          )}
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end justify-between shrink-0">
        <span className="text-xs text-text-4 bg-gray-100 px-2 py-0.5 rounded-full">
          {product.brand.name}
        </span>
        <span className="text-[11px] text-text-4">{product.reviewCount} sold</span>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full" />
      </div>
    }>
      <SearchPageInner />
    </Suspense>
  );
}
