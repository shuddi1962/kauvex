"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, User, ArrowLeft, Share2, Tag, ChevronRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string | null;
  category: string;
  coverImage: string | null;
  tags: string[];
  publishedAt: string;
  readTime: string | null;
}

export default function BlogDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.slug) return;
    fetch(`/api/v1/blog/posts/${params.slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setPost(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-4 w-full bg-gray-200 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-800 text-navy mb-2">Article not found</h1>
          <Link href="/blog" className="text-orange hover:underline">Back to blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-text-3">
          <Link href="/" className="hover:text-blue">Home</Link><span>/</span>
          <Link href="/blog" className="hover:text-blue">Blog</Link><span>/</span>
          <span className="text-text-1 font-medium truncate">{post.title}</span>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-text-3 hover:text-navy mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to articles
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-2 text-xs font-medium text-orange uppercase tracking-wide mb-3">
            <span>{post.category}</span>
            {post.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="bg-orange/10 text-orange px-2 py-0.5 rounded-full lowercase">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-800 text-navy leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-text-4">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {post.author}
              {post.authorRole && <span className="text-text-4">· {post.authorRole}</span>}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readTime || "5 min read"}
            </span>
          </div>
        </header>

        {post.coverImage && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img src={post.coverImage} alt={post.title} className="w-full h-auto" />
          </div>
        )}

        <div
          className="prose prose-lg max-w-none prose-headings:text-navy prose-a:text-orange prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content || "" }}
        />

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-text-4" />
              {post.tags?.map((tag) => (
                <span key={tag} className="text-sm bg-gray-100 text-text-3 px-2.5 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="flex items-center gap-1.5 text-sm text-text-3 hover:text-orange"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}