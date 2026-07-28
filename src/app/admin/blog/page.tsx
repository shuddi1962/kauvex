"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit3, Trash2, Eye, EyeOff, Star } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  featured: boolean;
  published: boolean;
  publishedAt: string | null;
  readTime: string | null;
  createdAt: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/v1/blog/posts?limit=100");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error("Failed to fetch posts", e);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (post: BlogPost) => {
    await fetch(`/api/v1/blog/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
    fetchPosts();
  };

  const toggleFeatured = async (post: BlogPost) => {
    await fetch(`/api/v1/blog/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !post.featured }),
    });
    fetchPosts();
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/v1/blog/posts/${id}`, { method: "DELETE" });
    fetchPosts();
  };

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-800 text-navy">Blog Posts</h1>
        <Link
          href="/admin/blog/posts/new"
          className="bg-orange text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-orange/90"
        >
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-text-3 text-left">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id} className="border-t border-border hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-1">{post.title}</span>
                      {post.featured && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-3">{post.category}</td>
                  <td className="px-4 py-3 text-text-3">{post.author}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-3 text-xs">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => togglePublish(post)} className="p-1.5 hover:bg-gray-100 rounded-lg" title={post.published ? "Unpublish" : "Publish"}>
                        {post.published ? <EyeOff className="w-4 h-4 text-text-3" /> : <Eye className="w-4 h-4 text-text-3" />}
                      </button>
                      <button onClick={() => toggleFeatured(post)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Toggle featured">
                        <Star className={`w-4 h-4 ${post.featured ? "text-yellow-500 fill-yellow-500" : "text-text-3"}`} />
                      </button>
                      <Link href={`/admin/blog/posts/${post.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <Edit3 className="w-4 h-4 text-text-3" />
                      </Link>
                      <button onClick={() => deletePost(post.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-text-3">No posts found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}