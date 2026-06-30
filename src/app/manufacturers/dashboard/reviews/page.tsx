"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Star, ThumbsUp, MessageSquare, Filter,
  Loader2, Globe, Calendar, TrendingUp
} from "lucide-react";

interface Review {
  id: string;
  buyerName: string;
  buyerCountry: string;
  rating: number;
  comment: string;
  orderValue: string;
  productType: string;
  createdAt: string;
  helpful: number;
  response?: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/v1/manufacturers/dashboard/stats");
        const json = await res.json();
        if (json.data?.reviews) {
          setReviews(json.data.reviews);
        }
      } catch {
        setReviews([
          {
            id: "rev-001",
            buyerName: "GlobalTextile Co.",
            buyerCountry: "US",
            rating: 5,
            comment: "Excellent quality cotton t-shirts. The fabric weight and print quality exceeded our expectations. Will definitely order again for our fall collection.",
            orderValue: "$8,400",
            productType: "Cotton T-Shirts",
            createdAt: "2026-06-20",
            helpful: 12,
            response: "Thank you for the great feedback! We look forward to the fall collection order.",
          },
          {
            id: "rev-002",
            buyerName: "EuroParts GmbH",
            buyerCountry: "DE",
            rating: 4,
            comment: "Good quality CNC machined parts. Delivery was 2 days late but communication was prompt. Anodizing quality is very good.",
            orderValue: "$16,800",
            productType: "Aluminum Brackets",
            createdAt: "2026-06-15",
            helpful: 8,
          },
          {
            id: "rev-003",
            buyerName: "Lagos Retail Ltd",
            buyerCountry: "NG",
            rating: 5,
            comment: "Outstanding manufacturer! Great communication, perfect customization, and on-time delivery. The plastic containers are exactly as specified.",
            orderValue: "$12,000",
            productType: "Plastic Containers",
            createdAt: "2026-06-10",
            helpful: 15,
            response: "We appreciate your business and look forward to continuing our partnership!",
          },
          {
            id: "rev-004",
            buyerName: "Dubai Trading FZE",
            buyerCountry: "AE",
            rating: 4,
            comment: "Very professional team. Water bottles quality is top-notch. Minor issue with packaging was quickly resolved. Recommended.",
            orderValue: "$19,200",
            productType: "Water Bottles",
            createdAt: "2026-06-05",
            helpful: 6,
          },
          {
            id: "rev-005",
            buyerName: "Shanghai Electronics Ltd",
            buyerCountry: "CN",
            rating: 3,
            comment: "Decent product quality but lead time was longer than quoted. Communication could be improved during production phase.",
            orderValue: "$5,600",
            productType: "USB Cables",
            createdAt: "2026-05-28",
            helpful: 4,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const filtered = reviews
    .filter((r) => filterRating === 0 || r.rating === filterRating)
    .sort((a, b) => {
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0";
  const ratingDistribution = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviews.filter((rev) => rev.rating === r).length,
    percent: reviews.length > 0 ? (reviews.filter((rev) => rev.rating === r).length / reviews.length) * 100 : 0,
  }));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#FF6B00]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/manufacturers/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={16} className="text-gray-500" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Reviews</h2>
            <p className="text-xs text-gray-500">{reviews.length} buyer reviews</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <Star size={22} className="text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0A1628]">{avgRating}</p>
                <p className="text-[10px] text-gray-500">Average Rating</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <TrendingUp size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0A1628]">{reviews.filter((r) => r.rating >= 4).length}</p>
                <p className="text-[10px] text-gray-500">Positive Reviews (4+)</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ThumbsUp size={22} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0A1628]">{reviews.reduce((sum, r) => sum + r.helpful, 0)}</p>
                <p className="text-[10px] text-gray-500">Total Helpful Votes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Rating Distribution */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-[#0A1628] mb-4">Rating Distribution</h3>
            <div className="space-y-2.5">
              {ratingDistribution.map(({ rating, count, percent }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3">{rating}</span>
                  <Star size={10} className="text-amber-500 fill-amber-500 shrink-0" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(parseInt(e.target.value))}
                className="h-8 px-2 border border-gray-200 rounded-lg text-xs focus:outline-none"
              >
                <option value={0}>All Ratings</option>
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-8 px-2 border border-gray-200 rounded-lg text-xs focus:outline-none"
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>

            {/* Review Cards */}
            {filtered.map((review) => (
              <div key={review.id} className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0A1628] flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{review.buyerName.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#0A1628]">{review.buyerName}</p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Globe size={8} /> {review.buyerCountry} &bull; {review.productType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} className={s <= review.rating ? "text-amber-500 fill-amber-500" : "text-gray-200"} />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1 justify-end">
                      <Calendar size={8} /> {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">{review.comment}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400">Order: {review.orderValue}</span>
                    <button className="text-[10px] text-gray-400 hover:text-[#FF6B00] flex items-center gap-1 transition-colors">
                      <ThumbsUp size={9} /> Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
                {review.response && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-2 border-[#FF6B00]">
                    <p className="text-[10px] text-gray-500 font-semibold mb-1 flex items-center gap-1">
                      <MessageSquare size={9} /> Your Response
                    </p>
                    <p className="text-xs text-gray-600">{review.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
