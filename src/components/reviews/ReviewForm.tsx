"use client";

import { useState } from "react";
import { Star, X, Camera, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

type FormState = "idle" | "loading" | "success" | "error";

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [duplicate, setDuplicate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setFormState("loading");
    setErrorMsg("");

    try {
      const { data: sessionData } = await import("@/lib/insforge").then((m) =>
        m.insforge.auth.getSession()
      );
      const session = sessionData?.session;
      if (!session) {
        setNotLoggedIn(true);
        setFormState("idle");
        return;
      }

      const res = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim(),
          body: body.trim(),
          images,
        }),
      });

      const json = await res.json();

      if (res.status === 409) {
        setDuplicate(true);
        setFormState("idle");
        return;
      }

      if (!res.ok) {
        setErrorMsg(json.error || "Failed to submit review");
        setFormState("error");
        return;
      }

      setFormState("success");
      onSuccess?.();
    } catch {
      setErrorMsg("Network error. Please try again.");
      setFormState("error");
    }
  };

  if (notLoggedIn) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
        <AlertCircle size={24} className="mx-auto text-amber-500 mb-2" />
        <p className="font-syne font-bold text-amber-800 mb-1">You must be logged in</p>
        <p className="text-xs text-amber-600 mb-3">Please sign in to submit a review.</p>
        <Button size="sm" variant="outline" onClick={() => window.location.href = "/login"}>
          Sign In
        </Button>
      </div>
    );
  }

  if (duplicate) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
        <CheckCircle2 size={24} className="mx-auto text-blue-500 mb-2" />
        <p className="font-syne font-bold text-blue-800 mb-1">You&apos;ve already reviewed this product</p>
        <p className="text-xs text-blue-600">Your review is pending approval.</p>
      </div>
    );
  }

  if (formState === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center animate-fade-in">
        <CheckCircle2 size={32} className="mx-auto text-green-500 mb-2" />
        <p className="font-syne font-bold text-green-800 mb-1">Review Submitted!</p>
        <p className="text-xs text-green-600">Your review has been submitted for approval. Thank you!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-5 space-y-4">
      <h3 className="font-syne font-bold text-base text-text-1">Write a Review</h3>

      {/* Star Rating */}
      <div>
        <label className="text-xs font-semibold text-text-3 mb-2 block">Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                size={22}
                className={
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-border"
                }
              />
            </button>
          ))}
          <span className="text-xs text-text-4 ml-2">
            {rating > 0 ? `${rating}/5` : "Select rating"}
          </span>
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="review-title" className="text-xs font-semibold text-text-3 mb-1.5 block">
          Title <span className="text-text-4 font-normal">(optional)</span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={200}
          className="w-full h-10 px-3 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-kauvex-orange focus:border-transparent"
        />
      </div>

      {/* Body */}
      <div>
        <label htmlFor="review-body" className="text-xs font-semibold text-text-3 mb-1.5 block">
          Review <span className="text-text-4 font-normal">(optional)</span>
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell others about your experience with this product"
          maxLength={5000}
          rows={4}
          className="w-full px-3 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-kauvex-orange focus:border-transparent resize-y"
        />
      </div>

      {/* Images */}
      <div>
        <label className="text-xs font-semibold text-text-3 mb-1.5 block">
          Photos <span className="text-text-4 font-normal">(optional)</span>
        </label>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-3 border border-border rounded-lg cursor-pointer hover:bg-off-white transition-colors">
            <Camera size={14} />
            Add Photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setImages(files.map((f) => URL.createObjectURL(f)));
              }}
            />
          </label>
          {images.length > 0 && (
            <span className="text-xs text-text-4">{images.length} file(s) selected</span>
          )}
        </div>
        <p className="text-[10px] text-text-4 mt-1">Upload up to 10 photos to showcase your experience.</p>
      </div>

      {/* Error */}
      {formState === "error" && (
        <div className="flex items-center gap-2 text-xs text-red bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle size={12} />
          {errorMsg}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={rating === 0 || formState === "loading"}
        loading={formState === "loading"}
        className="w-full"
      >
        {formState === "loading" ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
