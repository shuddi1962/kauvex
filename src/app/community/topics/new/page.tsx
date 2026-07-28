"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewTopicPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetch("/api/v1/community/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (!categoryId) return setError("Please select a category");
    if (title.length < 5) return setError("Title must be at least 5 characters");
    if (body.length < 20) return setError("Body must be at least 20 characters");

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/community/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: categoryId, title, body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create topic");
      router.push(`/community/topics/${json.data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create topic");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0A1628] mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-xl border border-border p-6">
        <h1 className="text-2xl font-bold text-[#0A1628] mb-6">Create New Topic</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your topic a descriptive title..."
              className="w-full h-11 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/200 characters</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">Body</label>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-[#FF6B00] font-medium flex items-center gap-1 hover:underline"
              >
                <Eye size={14} /> {showPreview ? "Edit" : "Preview"}
              </button>
            </div>
            {showPreview ? (
              <div className="w-full min-h-[200px] p-4 rounded-lg border border-gray-200 bg-gray-50 text-sm prose prose-sm max-w-none">
                {body.split("\n").map((line, i) => (
                  <p key={i}>{line || "\u00A0"}</p>
                ))}
              </div>
            ) : (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                placeholder="Write your topic content here... Use plain text. Line breaks will be preserved."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] min-h-[200px]"
              />
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSubmit} disabled={submitting} className="bg-[#FF6B00] hover:bg-[#e06000] text-white">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? "Creating..." : "Create Topic"}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}