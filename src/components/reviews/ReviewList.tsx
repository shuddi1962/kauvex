"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ThumbsUp, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  images: string[];
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  author: { name: string };
}

interface ReviewStats {
  totalCount: number;
  averageRating: number;
  distribution: {
    stars: number;
    count: number;
    percent: number;
  }[];
}

interface ReviewListProps {
  productId: string;
}

type SortOption = "newest" | "helpful" | "highest" | "lowest";

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("newest");
  const [helpfulVoted, setHelpfulVoted] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(`helpful_votes_${productId}`);
    if (saved) {
      try {
        setHelpfulVoted(new Set(JSON.parse(saved)));
      } catch {}
    }
  }, [productId]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/reviews/product/${productId}?sort=${sort}`);
      const json = await res.json();
      if (json.data) {
        setReviews(json.data.reviews || []);
        setStats(json.data.stats || null);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [productId, sort]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleHelpful = async (reviewId: string) => {
    if (helpfulVoted.has(reviewId)) return;

    try {
      const { insforge } = await import("@/lib/insforge");
      const { data: sessionData } = await insforge.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return;

      const res = await fetch(`/api/v1/reviews/${reviewId}/helpful`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const newVoted = new Set(helpfulVoted);
      newVoted.add(reviewId);
      setHelpfulVoted(newVoted);
      localStorage.setItem(`helpful_votes_${productId}`, JSON.stringify([...newVoted]));

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
        )
      );
    } catch {
      // silently handle
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="animate-spin text-text-4" />
      </div>
    );
  }

  if (!stats || stats.totalCount === 0) {
    return (
      <div className="text-center py-12 text-text-4 text-sm border border-border rounded-xl bg-white">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary + Stats */}
      <div className="grid md:grid-cols-3 gap-6 bg-white rounded-xl border border-border p-6">
        {/* Average Rating */}
        <div className="text-center">
          <p className="font-syne font-bold text-5xl text-text-1">{stats.averageRating.toFixed(1)}</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                className={
                  star <= Math.round(stats.averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-border"
                }
              />
            ))}
          </div>
          <p className="text-xs text-text-4 mt-1">Based on {stats.totalCount} review{stats.totalCount !== 1 ? "s" : ""}</p>
        </div>

        {/* Distribution */}
        <div className="space-y-1.5">
          {stats.distribution.map((d) => (
            <div key={d.stars} className="flex items-center gap-2">
              <span className="text-xs text-text-3 w-8 shrink-0">{d.stars} star</span>
              <div className="flex-1 h-2 bg-off-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${d.percent}%` }}
                />
              </div>
              <span className="text-xs text-text-4 w-6 text-right">{d.count}</span>
            </div>
          ))}
        </div>

        {/* Sort */}
        <div className="flex flex-col items-end justify-center">
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="appearance-none h-9 pl-3 pr-8 text-xs rounded-lg border border-border bg-white text-text-2 focus:outline-none focus:ring-2 focus:ring-kauvex-orange cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="helpful">Most Helpful</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-4 pointer-events-none" />
          </div>
          <p className="text-[10px] text-text-4 mt-2">{stats.totalCount} review{stats.totalCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-kauvex-orange/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-kauvex-orange">
                    {review.author.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-text-1">{review.author.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={10}
                          className={
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-border"
                          }
                        />
                      ))}
                    </div>
                    {review.isVerified && (
                      <span className="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-text-4 shrink-0">{formatDate(review.createdAt)}</span>
            </div>

            {review.title && (
              <h5 className="font-syne font-bold text-sm mt-3 text-text-1">{review.title}</h5>
            )}
            {review.body && (
              <p className="text-sm text-text-2 mt-1 leading-relaxed">{review.body}</p>
            )}

            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mt-3">
                {review.images.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-lg bg-off-white border border-border flex items-center justify-center text-[8px] text-text-4"
                  >
                    Photo
                  </div>
                ))}
                {review.images.length > 4 && (
                  <div className="w-16 h-16 rounded-lg bg-off-white border border-border flex items-center justify-center text-[10px] text-text-4 font-bold">
                    +{review.images.length - 4}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
              <button
                onClick={() => handleHelpful(review.id)}
                disabled={helpfulVoted.has(review.id)}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  helpfulVoted.has(review.id)
                    ? "text-kauvex-orange"
                    : "text-text-4 hover:text-kauvex-orange"
                }`}
              >
                <ThumbsUp
                  size={12}
                  fill={helpfulVoted.has(review.id) ? "currentColor" : "none"}
                />
                Helpful ({review.helpfulCount})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
