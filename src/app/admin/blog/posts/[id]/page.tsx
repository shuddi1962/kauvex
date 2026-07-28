"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { generateSlug, calculateReadTime } from "@/lib/blog/helpers";

export default function BlogEditorPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params?.id === "new";

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "General",
    author: "KAUVEX Team",
    authorRole: "",
    coverImage: "",
    tags: "",
    featured: false,
    published: false,
    readTime: "",
  });
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    fetch("/api/v1/blog/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isNew && params?.id) {
      fetch(`/api/v1/blog/posts/${params.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) return;
          setForm({
            title: data.title || "",
            slug: data.slug || "",
            excerpt: data.excerpt || "",
            content: data.content || "",
            category: data.category || "General",
            author: data.author || "KAUVEX Team",
            authorRole: data.authorRole || "",
            coverImage: data.coverImage || "",
            tags: (data.tags || []).join(", "),
            featured: data.featured || false,
            published: data.published || false,
            readTime: data.readTime || "",
          });
        })
        .catch(() => {});
    }
  }, [isNew, params?.id]);

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: isNew ? generateSlug(title) : f.slug,
    }));
  };

  const handleSave = async (publish: boolean) => {
    setSaving(true);
    const body = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      readTime: form.readTime || calculateReadTime(form.content),
      published: publish,
    };

    try {
      const url = isNew
        ? "/api/v1/blog/posts"
        : `/api/v1/blog/posts/${params.id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/admin/blog");
      }
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-800 text-navy">
            {isNew ? "New Post" : "Edit Post"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="bg-orange text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-orange/90"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-border p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-2 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/30"
                placeholder="Post title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-2 mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-2 mb-1">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/30"
                placeholder="Short description for listing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-2 mb-1">Content (HTML)</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={16}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange/30"
                placeholder="<h2>Article content...</h2><p>Write in HTML</p>"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-border p-4 space-y-4">
            <h3 className="font-semibold text-sm text-text-1">Meta</h3>
            <div>
              <label className="block text-sm font-medium text-text-2 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-2 mb-1">Author</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-2 mb-1">Author Role</label>
              <input
                type="text"
                value={form.authorRole}
                onChange={(e) => setForm((f) => ({ ...f, authorRole: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="e.g. Tech Editor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-2 mb-1">Cover Image URL</label>
              <input
                type="text"
                value={form.coverImage}
                onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-2 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="tech, ecommerce, nigeria"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-sm text-text-2">Featured</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}