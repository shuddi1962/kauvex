"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Pin, Lock, Loader2 } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  last_activity_at: string;
  created_at: string;
  author: { id: string; full_name: string; avatar_url: string | null };
  category: { name: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  topicCount: number;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [topics, setTopics] = useState<Topic[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [catRes, topRes] = await Promise.all([
          fetch(`/api/v1/community/categories`),
          fetch(`/api/v1/community/topics?category=${slug}&page=${page}&limit=20`),
        ]);
        if (catRes.ok) {
          const cats = (await catRes.json()).data || [];
          setCategory(cats.find((c: Category) => c.slug === slug) || null);
        }
        if (topRes.ok) {
          const d = await topRes.json();
          setTopics(d.data || []);
          setTotalPages(d.totalPages || 1);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, page]);

  return (
    <div>
      <Link href="/community" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0A1628] mb-4 transition-colors">
        <ArrowLeft size={16} /> All Categories
      </Link>

      {category && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h1 className="text-2xl font-bold text-[#0A1628]">{category.name}</h1>
          <p className="text-gray-500 mt-1">{category.description}</p>
          <p className="text-sm text-gray-400 mt-2">{category.topicCount || 0} topics</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border divide-y divide-border">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="animate-spin text-[#FF6B00] mx-auto" />
          </div>
        ) : topics.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No topics in this category yet.</p>
            <Link href="/community/topics/new" className="text-[#FF6B00] font-medium text-sm hover:underline mt-2 inline-block">
              Start a discussion
            </Link>
          </div>
        ) : (
          topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/community/topics/${topic.id}`}
              className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {topic.is_pinned && <Pin size={14} className="text-[#FF6B00]" />}
                  {topic.is_locked && <Lock size={14} className="text-gray-400" />}
                  <h3 className="font-medium text-[#0A1628]">{topic.title}</h3>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{topic.body?.replace(/<[^>]+>/g, "").slice(0, 200)}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>by {topic.author?.full_name || "Unknown"}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={12} />{topic.reply_count || 0}</span>
                  <span>{topic.view_count || 0} views</span>
                  <span>{topic.last_activity_at ? new Date(topic.last_activity_at).toLocaleDateString() : ""}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                p === page ? "bg-[#FF6B00] text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-border"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}