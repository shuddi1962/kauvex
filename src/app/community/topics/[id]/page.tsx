"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Pin, Lock, Share2, CheckCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Author {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface Topic {
  id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  created_at: string;
  author: Author;
  category: { name: string; slug: string };
  replies: Reply[];
}

interface Reply {
  id: string;
  body: string;
  is_solution: boolean;
  created_at: string;
  author: Author;
}

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/v1/community/topics/${params.id}`);
        if (!res.ok) { router.push("/community"); return; }
        const json = await res.json();
        setTopic(json.data);
        fetch(`/api/v1/community/topics/${params.id}/view`, { method: "POST" }).catch(() => {});
      } catch {
        router.push("/community");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  const handleReply = async () => {
    if (!replyBody.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/community/topics/${params.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to post reply");
      setTopic((prev) => prev ? {
        ...prev,
        replies: [...prev.replies, json.data],
        reply_count: prev.reply_count + 1,
      } : prev);
      setReplyBody("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert("Link copied to clipboard!");
    }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (!topic) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0A1628] mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back to {topic.category?.name || "Community"}
      </button>

      {/* OP Post */}
      <div className="bg-white rounded-xl border border-border p-6 mb-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(topic.author?.full_name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#0A1628]">{topic.title}</h1>
              {topic.is_pinned && <Pin size={16} className="text-[#FF6B00]" />}
              {topic.is_locked && <Lock size={16} className="text-gray-400" />}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
              <span>by <span className="font-medium text-gray-600">{topic.author?.full_name || "Unknown"}</span></span>
              <span>in <Link href={`/community/category/${topic.category?.slug}`} className="text-[#FF6B00] hover:underline">{topic.category?.name}</Link></span>
              <span>{new Date(topic.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <button onClick={handleShare} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Share link">
            <Share2 size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
          {topic.body}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-gray-400">
          <span className="flex items-center gap-1"><MessageSquare size={14} />{topic.reply_count} replies</span>
          <span>{topic.view_count} views</span>
        </div>
      </div>

      {/* Replies */}
      <h2 className="text-lg font-semibold text-[#0A1628] mb-3">
        {topic.replies?.length || 0} {(topic.replies?.length || 0) === 1 ? "Reply" : "Replies"}
      </h2>

      <div className="space-y-3 mb-6">
        {topic.replies?.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-8 text-center">
            <MessageSquare size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No replies yet. Be the first to respond!</p>
          </div>
        ) : (
          topic.replies?.map((reply) => (
            <div key={reply.id} className={`bg-white rounded-xl border p-4 ${reply.is_solution ? "border-green-300 bg-green-50/50" : "border-border"}`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {(reply.author?.full_name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-[#0A1628]">{reply.author?.full_name || "Unknown"}</span>
                    <span className="text-xs text-gray-400">{new Date(reply.created_at).toLocaleDateString()}</span>
                    {reply.is_solution && (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle size={12} /> Solution
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{reply.body}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Form */}
      {!topic.is_locked && (
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="text-base font-semibold text-[#0A1628] mb-3">Post a Reply</h3>
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            rows={4}
            placeholder="Write your reply..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
          />
          <div className="flex justify-end mt-3">
            <Button
              onClick={handleReply}
              disabled={submitting || !replyBody.trim()}
              className="bg-[#FF6B00] hover:bg-[#e06000] text-white gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {submitting ? "Posting..." : "Post Reply"}
            </Button>
          </div>
        </div>
      )}

      {topic.is_locked && (
        <div className="bg-gray-50 rounded-xl border border-border p-4 text-center text-sm text-gray-500">
          This topic is locked. New replies cannot be added.
        </div>
      )}
    </div>
  );
}