"use client";

import { useState } from "react";
import { BookOpen, Plus, Eye } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, useBosResource, StatusBadge } from "@/components/business-os/shared";

const CATEGORIES = ["policy", "procedure", "faq", "training", "technical", "manual", "standard", "best_practice"];

export default function KnowledgePage() {
  const articles = useBosResource("knowledge");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});
  const [viewing, setViewing] = useState<any>(null);

  const published = articles.rows.filter((a: any) => a.status === "published");
  const totalViews = articles.rows.reduce((s: number, a: any) => s + (a.views || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Hub"
        subtitle="Policies, procedures, training, and technical documentation"
        icon={<BookOpen className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Article</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Articles" value={articles.rows.length} icon={<BookOpen className="w-4 h-4" />} />
        <StatCard label="Published" value={published.length} icon={<BookOpen className="w-4 h-4" />} />
        <StatCard label="Total Views" value={totalViews} icon={<Eye className="w-4 h-4" />} />
        <StatCard label="Categories" value={new Set(articles.rows.map((a: any) => a.category)).size} icon={<BookOpen className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Article" />

      <DataTable
        columns={[
          { header: "Title", render: (r: any) => (
            <button onClick={() => setViewing(r)} className="font-semibold text-kauvex-navy hover:text-kauvex-orange text-left">
              {r.title}
            </button>
          )},
          { header: "Category", render: (r: any) => <span className="capitalize text-xs">{r.category?.replace("_", " ") || "—"}</span> },
          { header: "Author", render: (r: any) => r.authorId ? <span className="font-mono text-xs">{r.authorId.slice(0, 8)}</span> : "—" },
          { header: "Views", render: (r: any) => r.views || 0 },
          { header: "Tags", render: (r: any) => r.tags?.length ? (
            <div className="flex flex-wrap gap-1">
              {r.tags.slice(0, 3).map((t: string, i: number) => <span key={i} className="px-1.5 py-0.5 rounded bg-kauvex-navy/5 text-[10px] font-semibold text-kauvex-navy">{t}</span>)}
            </div>
          ) : "—" },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { header: "Updated", render: (r: any) => fmtDate(r.updatedAt) },
        ]}
        rows={articles.rows}
        loading={articles.loading}
        empty="No knowledge articles yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Article" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await articles.createRow({ ...form, status: "published", tags: (form.tags ?? "").split(",").map((s: string) => s.trim()).filter(Boolean) });
          setShow(false);
        }}>
          <div className="col-span-2">
            <Field label="Title" required><input required className={inputCls} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          </div>
          <Field label="Category">
            <select className={selectCls} value={form.category ?? "procedure"} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Tags (comma separated)"><input className={inputCls} value={form.tags ?? ""} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></Field>
          <div className="col-span-2">
            <Field label="Content"><textarea rows={6} className={inputCls} value={form.content ?? ""} onChange={(e) => setForm({ ...form, content: e.target.value })} /></Field>
          </div>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Publish</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.title ?? ""} wide>
        {viewing && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-kauvex-navy/5 font-semibold">{viewing.category?.replace("_", " ")}</span>
              <StatusBadge status={viewing.status} />
              <span className="text-xs text-text-3 ml-auto">{viewing.views} views</span>
            </div>
            <p className="text-sm text-text-2 whitespace-pre-wrap">{viewing.content || "No content"}</p>
            {viewing.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4">
                {viewing.tags.map((t: string, i: number) => <span key={i} className="px-2 py-0.5 rounded bg-kauvex-navy/5 text-[11px] font-semibold text-kauvex-navy">{t}</span>)}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
