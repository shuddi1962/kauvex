"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Plus, Search, Edit2, Trash2, X, BookOpen, Video, Clock,
  BarChart3, Users, TrendingDown, AlertTriangle, Save,
} from "lucide-react";

type ContentType = "video" | "article";
type LessonStatus = "draft" | "published" | "archived";

interface Lesson {
  id: number;
  title: string;
  description: string;
  category: string;
  content_type: ContentType;
  content_url: string;
  content_body: string;
  duration_minutes: number;
  sort_order: number;
  status: LessonStatus;
  completions: number;
  drop_off_rate: number;
  created_at: string;
}

const categories = ["Getting Started", "Catalog Management", "Order Fulfillment", "Marketing & SEO", "Analytics & Reports", "Store Builder", "FBK & Logistics", "Advertising", "Dropshipping", "POD"];

const defaultLessons: Lesson[] = [
  { id: 1, title: "Welcome to Kauvex Vendor Dashboard", description: "Overview of the vendor dashboard and key features", category: "Getting Started", content_type: "video", content_url: "https://youtube.com/watch?v=abc123", content_body: "", duration_minutes: 5, sort_order: 1, status: "published", completions: 234, drop_off_rate: 5, created_at: "2026-05-01" },
  { id: 2, title: "How to Add Your First Product", description: "Step-by-step guide to listing products on Kauvex", category: "Catalog Management", content_type: "video", content_url: "https://youtube.com/watch?v=def456", content_body: "", duration_minutes: 12, sort_order: 1, status: "published", completions: 189, drop_off_rate: 12, created_at: "2026-05-03" },
  { id: 3, title: "Understanding Product Categories & Attributes", description: "Deep dive into product categorization", category: "Catalog Management", content_type: "article", content_url: "", content_body: "Categories help customers find your products. Kauvex uses a hierarchical category system...", duration_minutes: 8, sort_order: 2, status: "published", completions: 156, drop_off_rate: 8, created_at: "2026-05-05" },
  { id: 4, title: "Processing Orders & Shipping", description: "How to fulfill orders on time", category: "Order Fulfillment", content_type: "video", content_url: "https://youtube.com/watch?v=ghi789", content_body: "", duration_minutes: 15, sort_order: 1, status: "published", completions: 143, drop_off_rate: 18, created_at: "2026-05-08" },
  { id: 5, title: "Optimizing Your Store for SEO", description: "Improve your store's visibility in search results", category: "Marketing & SEO", content_type: "article", content_url: "", content_body: "Search engine optimization is critical for driving organic traffic to your store...", duration_minutes: 10, sort_order: 1, status: "published", completions: 98, drop_off_rate: 15, created_at: "2026-05-10" },
  { id: 6, title: "Using the Store Builder", description: "Customize your storefront with drag-and-drop", category: "Store Builder", content_type: "video", content_url: "https://youtube.com/watch?v=jkl012", content_body: "", duration_minutes: 20, sort_order: 1, status: "published", completions: 67, drop_off_rate: 25, created_at: "2026-05-12" },
  { id: 7, title: "FBK Enrollment Guide", description: "How to enroll in Fulfillment by Kauvex", category: "FBK & Logistics", content_type: "article", content_url: "", content_body: "FBK allows you to store your products in our warehouses for faster delivery...", duration_minutes: 7, sort_order: 1, status: "draft", completions: 0, drop_off_rate: 0, created_at: "2026-06-01" },
  { id: 8, title: "Running Ad Campaigns", description: "Create and manage advertising campaigns", category: "Advertising", content_type: "video", content_url: "https://youtube.com/watch?v=mno345", content_body: "", duration_minutes: 18, sort_order: 1, status: "draft", completions: 0, drop_off_rate: 0, created_at: "2026-06-02" },
];

export default function UniversityPage() {
  const [lessons, setLessons] = useState<Lesson[]>(defaultLessons);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  const [form, setForm] = useState({
    title: "", description: "", category: categories[0],
    content_type: "video" as ContentType, content_url: "", content_body: "",
    duration_minutes: 10, sort_order: 1, status: "draft" as LessonStatus,
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const filtered = lessons.filter(l => {
    if (catFilter !== "all" && l.category !== catFilter) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", category: categories[0], content_type: "video", content_url: "", content_body: "", duration_minutes: 10, sort_order: lessons.length + 1, status: "draft" });
    setShowModal(true);
  };

  const openEdit = (l: Lesson) => {
    setEditing(l);
    setForm({ title: l.title, description: l.description, category: l.category, content_type: l.content_type, content_url: l.content_url, content_body: l.content_body, duration_minutes: l.duration_minutes, sort_order: l.sort_order, status: l.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }

    if (editing) {
      setLessons(prev => prev.map(l => l.id === editing.id ? { ...l, ...form } : l));
      showToast("Lesson updated");
    } else {
      const newLesson: Lesson = {
        id: Math.max(...lessons.map(l => l.id), 0) + 1,
        ...form, completions: 0, drop_off_rate: 0, created_at: new Date().toISOString().slice(0, 10),
      };
      setLessons(prev => [newLesson, ...prev]);
      showToast("Lesson created");
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      setLessons(prev => prev.filter(l => l.id !== deleteId));
      showToast("Lesson deleted");
      setDeleteId(null);
    }
  };

  const publishLesson = (id: number) => {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, status: "published" as LessonStatus } : l));
    showToast("Lesson published");
  };

  const statusBadge = (s: LessonStatus) => {
    switch (s) {
      case "draft": return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Draft</span>;
      case "published": return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">Published</span>;
      case "archived": return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">Archived</span>;
    }
  };

  const totalCompletions = lessons.filter(l => l.status === "published").reduce((s, l) => s + l.completions, 0);
  const avgDropOff = lessons.filter(l => l.status === "published" && l.drop_off_rate > 0).reduce((s, l, _, a) => s + l.drop_off_rate / a.length, 0);

  return (
    <AdminShell title="Vendor University" subtitle="Create and manage vendor training content">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Lessons", value: lessons.length, icon: BookOpen, color: "#1641C4" },
          { label: "Published", value: lessons.filter(l => l.status === "published").length, icon: BookOpen, color: "#10B981" },
          { label: "Total Completions", value: totalCompletions, icon: Users, color: "#F59E0B" },
          { label: "Avg Drop-off Rate", value: avgDropOff ? `${Math.round(avgDropOff)}%` : "0%", icon: TrendingDown, color: "#EF4444" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full -translate-y-1/2 translate-x-1/2 opacity-10" style={{ backgroundColor: s.color }} />
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-text-4">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lessons..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={openCreate} className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2 shrink-0">
          <Plus size={14} /> New Lesson
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-text-4">Title</th>
              <th className="text-left px-5 py-3 font-medium text-text-4">Category</th>
              <th className="text-center px-5 py-3 font-medium text-text-4">Type</th>
              <th className="text-center px-5 py-3 font-medium text-text-4">Duration</th>
              <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
              <th className="text-center px-5 py-3 font-medium text-text-4">Completions</th>
              <th className="text-center px-5 py-3 font-medium text-text-4">Drop-off</th>
              <th className="text-right px-5 py-3 font-medium text-text-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(l => (
              <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div>
                    <p className="font-medium text-text-1">{l.title}</p>
                    <p className="text-[10px] text-text-4 truncate max-w-[250px]">{l.description}</p>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue">{l.category}</span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${l.content_type === "video" ? "bg-purple-50 text-purple-700" : "bg-orange-50 text-orange"}`}>
                    {l.content_type === "video" ? <Video size={10} /> : <BookOpen size={10} />} {l.content_type}
                  </span>
                </td>
                <td className="px-5 py-3 text-center text-text-4">
                  <span className="inline-flex items-center gap-1"><Clock size={10} /> {l.duration_minutes}m</span>
                </td>
                <td className="px-5 py-3 text-center">{statusBadge(l.status)}</td>
                <td className="px-5 py-3 text-center font-medium text-text-1">{l.status === "published" ? l.completions : "—"}</td>
                <td className="px-5 py-3 text-center">
                  {l.status === "published" && l.drop_off_rate > 0 ? (
                    <span className={`text-xs font-medium ${l.drop_off_rate > 20 ? "text-red" : l.drop_off_rate > 10 ? "text-yellow-600" : "text-green-600"}`}>
                      {l.drop_off_rate}%
                    </span>
                  ) : <span className="text-text-4">—</span>}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {l.status === "draft" && (
                      <button onClick={() => publishLesson(l.id)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-600" title="Publish">
                        <Save size={13} />
                      </button>
                    )}
                    <button onClick={() => openEdit(l)} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-4 hover:text-blue"><Edit2 size={13} /></button>
                    <button onClick={() => setDeleteId(l.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-text-4 hover:text-red"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-text-4">No lessons found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-lg">{editing ? "Edit Lesson" : "New Lesson"}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-4 hover:text-text-2"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-text-2 block mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Lesson title" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-2 block mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Brief description..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Content Type</label>
                  <select value={form.content_type} onChange={e => setForm({ ...form, content_type: e.target.value as ContentType })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue">
                    <option value="video">Video</option>
                    <option value="article">Article</option>
                  </select>
                </div>
              </div>
              {form.content_type === "video" && (
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Content URL</label>
                  <input value={form.content_url} onChange={e => setForm({ ...form, content_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
              )}
              {form.content_type === "article" && (
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Content Body</label>
                  <textarea value={form.content_body} onChange={e => setForm({ ...form, content_body: e.target.value })} rows={6} placeholder="Write your article content here..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue resize-none" />
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Duration (minutes)</label>
                  <input type="number" min={1} value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: +e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Sort Order</label>
                  <input type="number" min={1} value={form.sort_order} onChange={e => setForm({ ...form, sort_order: +e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as LessonStatus })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-text-3 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 h-10 rounded-lg bg-blue text-white text-sm font-semibold hover:bg-blue-600 flex items-center justify-center gap-1.5">
                <Save size={14} /> {editing ? "Update" : "Create"} Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl w-[400px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><AlertTriangle size={18} className="text-red" /></div>
              <div>
                <h3 className="font-semibold text-lg">Delete Lesson?</h3>
                <p className="text-sm text-text-3">This action cannot be undone. Vendor completion data will be lost.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setDeleteId(null)} className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-text-3 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 h-10 rounded-lg bg-red text-white text-sm font-semibold hover:bg-red/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
