"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Clock, User, Tag, ChevronRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  coverImage: string | null;
  tags: string[];
  featured: boolean;
  publishedAt: string;
  readTime: string | null;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/v1/blog/posts?limit=50");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error("Failed to fetch posts", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/v1/blog/categories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data.map((c: any) => c.name));
      }
    } catch (e) {}
  };

  const featured = posts.filter((p) => p.featured);
  const filtered = posts.filter((p) => {
    if (activeCategory !== "all" && p.category !== activeCategory) return false;
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

      <section className="bg-gradient-to-r from-navy to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="font-800 text-3xl mb-3">KAUVEX Blog</h1>
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
        {featured.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-700 text-navy mb-4">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {featured.slice(0, 2).map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-44 bg-gradient-to-br from-orange/10 to-navy/10 flex items-center justify-center">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-800 text-navy/20">{post.category[0]}</span>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-medium text-orange uppercase tracking-wide">{post.category}</span>
                    <h3 className="font-700 text-lg text-navy mt-1 group-hover:text-orange transition-colors">{post.title}</h3>
                    <p className="text-sm text-text-3 mt-1 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-text-4">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime || "5 min read"}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "all" ? "bg-navy text-white" : "bg-white text-text-3 border border-border hover:border-navy/30"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat ? "bg-navy text-white" : "bg-white text-text-3 border border-border hover:border-navy/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <section>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse">
                  <div className="h-3 w-16 bg-gray-200 rounded mb-3" />
                  <div className="h-5 w-full bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-3" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-800 text-gray-300">{post.category[0]}</span>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-medium text-orange uppercase tracking-wide">{post.category}</span>
                    <h3 className="font-700 text-navy mt-1 group-hover:text-orange transition-colors">{post.title}</h3>
                    <p className="text-sm text-text-3 mt-1 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-text-4">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime || "5 min read"}</span>
                    </div>
                  </div>
                </Link>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-12 text-text-3">
                  No posts found in this category
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}