"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store, Star, Package, Clock, Heart, ShoppingCart,
  MessageCircle, Filter, Grid3X3, List, ChevronDown,
  CheckCircle, MapPin, Shield, Users, ThumbsUp,
  TrendingUp, Sparkles, Medal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const vendorData = {
  name: "TechPrime Solutions",
  slug: "techprime-solutions",
  initials: "TS",
  tagline: "Premium electronics & gadgets at unbeatable prices.",
  banner: null,
  logo: null,
  tier: "Platinum" as const,
  rating: 4.8,
  totalReviews: 1247,
  positiveFeedback: 97,
  itemsSold: 15320,
  responseRate: 98,
  responseTime: "Within 2 hours",
  joinedDate: "January 2023",
  followers: 2840,
  location: "Lagos, Nigeria",
  memberSince: "2023",
  verified: true,
  categories: ["Electronics", "Accessories", "Smart Home", "Gaming"],
};

const tiers = [
  { name: "Bronze", color: "text-amber-700", bg: "bg-amber-100", min: 0 },
  { name: "Silver", color: "text-gray-500", bg: "bg-gray-100", min: 500 },
  { name: "Gold", color: "text-yellow-600", bg: "bg-yellow-100", min: 2000 },
  { name: "Platinum", color: "text-blue-700", bg: "bg-blue-100", min: 5000 },
  { name: "Diamond", color: "text-purple-700", bg: "bg-purple-100", min: 10000 },
];

const demoProducts = [
  {
    id: 1, name: "Wireless Noise-Cancelling Headphones",
    price: 249.99, originalPrice: 299.99,
    rating: 4.7, reviews: 342,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    category: "Electronics", isNew: true, sold: 1840,
    discount: 17,
  },
  {
    id: 2, name: "Smart Watch Pro Series X",
    price: 399.99, originalPrice: null,
    rating: 4.9, reviews: 215,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    category: "Electronics", isNew: true, sold: 960,
  },
  {
    id: 3, name: "Portable Bluetooth Speaker Bass+",
    price: 89.99, originalPrice: 129.99,
    rating: 4.5, reviews: 587,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    category: "Accessories", isNew: false, sold: 3200,
    discount: 31,
  },
  {
    id: 4, name: "Mechanical Gaming Keyboard RGB",
    price: 159.99, originalPrice: 189.99,
    rating: 4.6, reviews: 423,
    image: "https://images.unsplash.com/photo-1541140532154-b024d1c0c78e?w=400&h=400&fit=crop",
    category: "Gaming", isNew: false, sold: 2100,
    discount: 16,
  },
  {
    id: 5, name: "Smart Home Security Camera 4K",
    price: 129.99, originalPrice: null,
    rating: 4.4, reviews: 178,
    image: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&h=400&fit=crop",
    category: "Smart Home", isNew: true, sold: 740,
  },
  {
    id: 6, name: "Minimalist Leather Laptop Bag",
    price: 79.99, originalPrice: 99.99,
    rating: 4.3, reviews: 291,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    category: "Accessories", isNew: false, sold: 1500,
    discount: 20,
  },
  {
    id: 7, name: "Wireless Charging Pad Fast 15W",
    price: 34.99, originalPrice: 49.99,
    rating: 4.8, reviews: 891,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop",
    category: "Accessories", isNew: false, sold: 5600,
    discount: 30,
  },
  {
    id: 8, name: "Ultralight Wireless Gaming Mouse",
    price: 99.99, originalPrice: null,
    rating: 4.7, reviews: 356,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
    category: "Gaming", isNew: true, sold: 1280,
  },
];

const demoReviews = [
  {
    id: 1, author: "Emeka Okafor", rating: 5,
    date: "2026-05-28",
    text: "Absolutely love the headphones! Sound quality is incredible and noise cancellation works perfectly. Fast delivery too. Will definitely buy from this vendor again.",
    verified: true,
  },
  {
    id: 2, author: "Fatima Bello", rating: 4,
    date: "2026-05-15",
    text: "Good quality product for the price. The keyboard feels solid and the RGB is vibrant. One of the keys had a slight wobble but support resolved it quickly.",
    verified: true,
  },
  {
    id: 3, author: "Chidi Nwankwo", rating: 5,
    date: "2026-05-02",
    text: "Best vendor on KAUVEX! This is my 5th order from TechPrime and every single experience has been flawless. Their customer service is top notch.",
    verified: true,
  },
];

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={cn(
            star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200",
          )}
        />
      ))}
    </div>
  );
}

function VendorTierBadge({ tier }: { tier: string }) {
  const icon = tier === "Platinum" || tier === "Diamond" ? Medal : Star;
  const IconComp = icon;
  return (
    <Badge variant="navy" className="flex items-center gap-1 px-3 py-1">
      <IconComp size={14} />
      {tier}
    </Badge>
  );
}

export default function VendorStorePage({ params }: { params: { "vendor-slug": string } }) {
  const [activeTab, setActiveTab] = useState<"all" | "top-rated" | "new-arrivals">("all");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPriceRange, setFilterPriceRange] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [addedToCart, setAddedToCart] = useState<Record<number, boolean>>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const vendor = vendorData;

  const filteredProducts = demoProducts.filter((p) => {
    if (activeTab === "top-rated" && p.rating < 4.5) return false;
    if (activeTab === "new-arrivals" && !p.isNew) return false;
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterPriceRange) {
      const [min, max] = filterPriceRange.split("-").map(Number);
      if (p.price < min || (max && p.price > max)) return false;
    }
    if (filterRating && p.rating < filterRating) return false;
    return true;
  });

  const handleAddToCart = (id: number) => {
    setAddedToCart((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setAddedToCart((prev) => ({ ...prev, [id]: false })), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-blue transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-blue transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold truncate max-w-[200px]">{vendor.name}</span>
          </div>
        </div>
      </div>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-48 md:h-64 overflow-hidden"
      >
        {vendor.banner ? (
          <Image src={vendor.banner} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#0A1628] via-[#162240] to-[#0A1628]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,107,0,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(22,65,196,0.1),transparent_50%)]" />
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }} />
          </div>
        )}
      </motion.div>

      {/* Vendor Info Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-[1440px] mx-auto px-4 md:px-6"
      >
        <div className="relative -mt-16 md:-mt-24 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
          {/* Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white border-4 border-white shadow-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
            {vendor.logo ? (
              <Image src={vendor.logo} alt={vendor.name} width={128} height={128} className="object-cover w-full h-full" />
            ) : (
              <span className="text-2xl md:text-3xl font-bold text-[#0A1628]">{vendor.initials}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-[#0A1628]">{vendor.name}</h1>
                  <VendorTierBadge tier={vendor.tier} />
                  {vendor.verified && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle size={12} /> Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{vendor.tagline}</p>
                <div className="flex items-center gap-4 flex-wrap text-sm">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={vendor.rating} size={14} />
                    <span className="font-semibold text-gray-800">{vendor.rating}</span>
                    <span className="text-gray-400">({vendor.totalReviews.toLocaleString()})</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <ThumbsUp size={14} /> {vendor.positiveFeedback}% positive feedback
                  </span>
                  <span className="text-gray-300 hidden md:inline">|</span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Package size={14} /> {vendor.itemsSold.toLocaleString()} items sold
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={cn(isFollowing && "border-[#FF6B00] text-[#FF6B00]")}
                >
                  <Heart size={14} className={cn(isFollowing && "fill-[#FF6B00]")} />
                  {isFollowing ? "Following" : "Follow Store"}
                </Button>
                <Button size="sm" className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
                  <MessageCircle size={14} />
                  Contact Seller
                </Button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock size={14} />
                <div>
                  <span className="text-gray-900 font-medium">{vendor.responseTime}</span>
                  <span className="ml-1">response</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Users size={14} />
                <div>
                  <span className="text-gray-900 font-medium">{vendor.followers.toLocaleString()}</span>
                  <span className="ml-1">followers</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin size={14} />
                <span>{vendor.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Store size={14} />
                <span>Member since {vendor.memberSince}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs + Filters */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 mt-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 md:px-6">
            <div className="flex">
              {[
                { key: "all" as const, label: "All Products", icon: Grid3X3 },
                { key: "top-rated" as const, label: "Top Rated", icon: TrendingUp },
                { key: "new-arrivals" as const, label: "New Arrivals", icon: Sparkles },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex items-center gap-2 px-4 md:px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                      activeTab === tab.key
                        ? "border-[#FF6B00] text-[#FF6B00]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                    )}
                  >
                    <Icon size={16} />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors",
                  showFilters ? "border-[#FF6B00] text-[#FF6B00] bg-orange-50" : "border-gray-200 text-gray-500 hover:border-gray-300",
                )}
              >
                <Filter size={14} />
                Filters
              </button>
              <div className="hidden md:flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn("p-2", viewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600")}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn("p-2", viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600")}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-gray-100"
              >
                <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</h4>
                    <div className="flex flex-wrap gap-2">
                      {vendor.categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                            filterCategory === cat
                              ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00]"
                              : "border-gray-200 text-gray-600 hover:border-gray-300",
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Price Range</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Under $50", value: "0-50" },
                        { label: "$50 - $100", value: "50-100" },
                        { label: "$100 - $200", value: "100-200" },
                        { label: "$200+", value: "200-9999" },
                      ].map((range) => (
                        <button
                          key={range.value}
                          onClick={() => setFilterPriceRange(filterPriceRange === range.value ? null : range.value)}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                            filterPriceRange === range.value
                              ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00]"
                              : "border-gray-200 text-gray-600 hover:border-gray-300",
                          )}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Minimum Rating</h4>
                    <div className="flex flex-wrap gap-2">
                      {[4, 3, 2, 1].map((stars) => (
                        <button
                          key={stars}
                          onClick={() => setFilterRating(filterRating === stars ? null : stars)}
                          className={cn(
                            "flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors",
                            filterRating === stars
                              ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00]"
                              : "border-gray-200 text-gray-600 hover:border-gray-300",
                          )}
                        >
                          <Star size={12} className={filterRating === stars ? "fill-[#FF6B00]" : "fill-gray-300"} />
                          {stars}+
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Product Count */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 mt-6">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products found
        </p>
      </div>

      {/* Product Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={activeTab + filterCategory + filterPriceRange + filterRating}
        className={cn(
          "max-w-[1440px] mx-auto px-4 md:px-6 mt-4",
          viewMode === "grid"
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            : "space-y-4",
        )}
      >
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            layout
            className={cn(
              "bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow",
              viewMode === "list" && "flex flex-row",
            )}
          >
            {/* Image */}
            <div className={cn("relative overflow-hidden", viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-square")}>
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={viewMode === "list" ? 200 : 400}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.discount && (
                <div className="absolute top-2 left-2">
                  <Badge variant="sale">-{product.discount}%</Badge>
                </div>
              )}
              {product.isNew && (
                <div className="absolute top-2 right-2">
                  <Badge variant="new">NEW</Badge>
                </div>
              )}
              <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white">
                <Heart size={14} className="text-gray-500 hover:text-red-500" />
              </button>
            </div>

            {/* Info */}
            <div className={cn("p-3 md:p-4", viewMode === "list" && "flex-1 flex flex-col justify-center")}>
              <p className="text-xs text-gray-400 mb-1">{product.category}</p>
              <h3 className="font-semibold text-sm md:text-base text-[#0A1628] leading-tight mb-2 line-clamp-2">
                <Link href={`/product/${product.id}`} className="hover:text-[#FF6B00] transition-colors">
                  {product.name}
                </Link>
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={product.rating} size={12} />
                <span className="text-xs text-gray-400">({product.reviews})</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base md:text-lg font-bold text-[#0A1628]">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                )}
              </div>
              <Button
                size="sm"
                className={cn(
                  "w-full transition-all",
                  addedToCart[product.id]
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white",
                )}
                onClick={() => handleAddToCart(product.id)}
              >
                {addedToCart[product.id] ? (
                  <><CheckCircle size={14} /> Added</>
                ) : (
                  <><ShoppingCart size={14} /> Add to Cart</>
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 mt-12 text-center py-16">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No products found</h3>
          <p className="text-sm text-gray-400">Try adjusting your filters to find what you are looking for.</p>
        </div>
      )}

      {/* Customer Reviews */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 mt-12 mb-12">
        <h2 className="text-xl font-bold text-[#0A1628] mb-6 flex items-center gap-2">
          <MessageCircle size={20} className="text-[#FF6B00]" />
          Customer Reviews
          <span className="text-sm font-normal text-gray-400">({vendor.totalReviews.toLocaleString()})</span>
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-4 md:gap-6"
        >
          {demoReviews.map((review) => (
            <motion.div
              key={review.id}
              variants={itemVariants}
              className="bg-white rounded-xl border border-gray-100 p-4 md:p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A1628] flex items-center justify-center text-white text-sm font-bold">
                    {review.author.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#0A1628]">{review.author}</p>
                    <p className="text-xs text-gray-400">{review.date}</p>
                  </div>
                </div>
                {review.verified && (
                  <Badge variant="success" className="text-[10px] flex items-center gap-1">
                    <CheckCircle size={10} /> Verified
                  </Badge>
                )}
              </div>
              <StarRating rating={review.rating} size={12} />
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
