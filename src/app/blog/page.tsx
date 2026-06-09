"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Clock, User, Tag } from "lucide-react";

const blogPosts = [
  {
    id: "1", slug: "top-smartphones-2026",
    title: "Top 10 Smartphones to Buy in Nigeria in 2026",
    excerpt: "Our expert picks for the best smartphones across all price ranges — from budget to flagship.",
    category: "Electronics", author: "KAUVEX Team", date: "Apr 1, 2026", readTime: "8 min read",
    featured: true,
  },
  {
    id: "2", slug: "fashion-trends-nigeria-2026",
    title: "Fashion Trends Taking Over Nigeria in 2026",
    excerpt: "From streetwear to native styles — discover what's trending in Nigerian fashion this year.",
    category: "Fashion", author: "KAUVEX Team", date: "Mar 25, 2026", readTime: "6 min read",
    featured: true,
  },
  {
    id: "3", slug: "home-kitchen-essentials-guide",
    title: "Home & Kitchen Essentials: A Complete Buying Guide",
    excerpt: "Everything you need to set up your dream home — from appliances to decor must-haves.",
    category: "Home & Kitchen", author: "KAUVEX Team", date: "Mar 18, 2026", readTime: "7 min read",
  },
  {
    id: "4", slug: "skincare-routine-nigerian-weather",
    title: "The Perfect Skincare Routine for Nigerian Weather",
    excerpt: "Tips and product recommendations for maintaining healthy skin in Nigeria's tropical climate.",
    category: "Beauty", author: "KAUVEX Team", date: "Mar 12, 2026", readTime: "10 min read",
  },
  {
    id: "5", slug: "fitness-equipment-home-gym",
    title: "Best Fitness Equipment for Your Home Gym in 2026",
    excerpt: "Build the perfect home workout space with our top picks for fitness gear and accessories.",
    category: "Sports", author: "KAUVEX Team", date: "Mar 5, 2026", readTime: "9 min read",
  },
  {
    id: "6", slug: "laptop-buying-guide-nigeria",
    title: "Laptop Buying Guide 2026: Find the Perfect Laptop for Your Needs",
    excerpt: "From gaming to productivity — everything you need to know before buying a laptop in Nigeria.",
    category: "Electronics", author: "KAUVEX Team", date: "Feb 28, 2026", readTime: "11 min read",
  },
  {
    id: "7", slug: "affordable-fashion-brands-nigeria",
    title: "Top 10 Affordable Fashion Brands in Nigeria",
    excerpt: "Stylish looks that won't break the bank — discover budget-friendly fashion brands.",
    category: "Fashion", author: "KAUVEX Team", date: "Feb 20, 2026", readTime: "5 min read",
  },
  {
    id: "8", slug: "kitchen-gadgets-every-home-needs",
    title: "10 Kitchen Gadgets Every Nigerian Home Needs",
    excerpt: "Smart kitchen tools and appliances that make cooking easier and more enjoyable.",
    category: "Home & Kitchen", author: "KAUVEX Team", date: "Feb 14, 2026", readTime: "12 min read",
  },
];

const categories = ["All", "Electronics", "Fashion", "Home & Kitchen", "Beauty", "Sports"];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const featured = blogPosts.filter((p) => p.featured);
  const filtered = blogPosts.filter((p) => {
    if (activeCategory !== "All" && p.category !== activeCategory) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-off-white min-h-screen">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-text-3">
          <Link href="/" className="hover:text-blue">Home</Link><span>/</span>
          <span className="text-text-1 font-medium">Blog</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-r from-navy to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="font-syne font-800 text-3xl mb-3">KAUVEX Blog</h1>
          <p className="text-blue-200 mb-6">Expert insights on electronics, fashion, technology, and lifestyle</p>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-11 pr-4 py-2.5 rounded-lg text-sm text-text-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue/30"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured */}
        {!searchQuery && activeCategory === "All" && (
          <section className="mb-12">
            <h2 className="font-syne font-700 text-xl text-text-1 mb-6">Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featured.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="bg-white rounded-xl border border-border overflow-hidden hover:border-blue/30 transition-colors group">
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <Tag className="w-12 h-12 text-blue/20" />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-medium text-blue bg-blue-50 px-2 py-1 rounded-full">{post.category}</span>
                    <h3 className="font-syne font-700 text-lg text-text-1 group-hover:text-blue mt-3 mb-2">{post.title}</h3>
                    <p className="text-sm text-text-3 line-clamp-2 mb-4">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-text-4">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat ? "bg-blue text-white" : "bg-white border border-border text-text-2 hover:border-blue/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* All Articles */}
        <div className="space-y-4">
          {filtered.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="bg-white rounded-xl border border-border p-5 flex gap-5 hover:border-blue/30 transition-colors group">
              <div className="w-32 h-24 bg-off-white rounded-lg flex-shrink-0 flex items-center justify-center">
                <Tag className="w-8 h-8 text-text-4/20" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-blue bg-blue-50 px-2 py-0.5 rounded-full">{post.category}</span>
                  <span className="text-xs text-text-4">{post.readTime}</span>
                </div>
                <h3 className="font-syne font-700 text-text-1 group-hover:text-blue mb-1 line-clamp-1">{post.title}</h3>
                <p className="text-sm text-text-3 line-clamp-1">{post.excerpt}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-text-4">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-border">
            <Search className="w-12 h-12 text-text-4/30 mx-auto mb-3" />
            <h3 className="font-syne font-600 text-text-1 mb-1">No articles found</h3>
            <p className="text-sm text-text-3">Try different keywords or browse all categories</p>
          </div>
        )}
      </div>
    </div>
  );
}
