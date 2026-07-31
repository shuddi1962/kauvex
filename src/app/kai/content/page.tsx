"use client";

import { useState } from "react";
import { FileText, Plus, Check, X } from "lucide-react";
import { PageHeader, StatCard, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, useKaiResource, StatusBadge } from "@/components/kai-ecosystem/shared";

const CONTENT_TYPES = [
  { value: "blog", label: "Blog post" },
  { value: "landing", label: "Landing page" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "whatsapp", label: "WhatsApp campaign" },
  { value: "product_description", label: "Product description" },
  { value: "technical_doc", label: "Technical documentation" },
  { value: "training_manual", label: "Training manual" },
  { value: "social", label: "Social media" },
  { value: "ad", label: "Advertising creative" },
];

export default function KaiContentPage() {
  const content = useKaiResource("content");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const review = async (id: string, decision: string) => {
    await fetch(`/api/v1/kai-ecosystem/content/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    await content.fetchRows();
  };

  const drafts = content.rows.filter((c: any) => c.status === "draft");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Factory"
        subtitle="KAI drafts content for every channel — saved as drafts for your approval"
        icon={<FileText className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> Generate</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Drafts" value={drafts.length} icon={<FileText className="w-4 h-4" />} />
        <StatCard label="Approved" value={content.rows.filter((c: any) => c.status === "approved").length} icon={<Check className="w-4 h-4" />} />
        <StatCard label="Rejected" value={content.rows.filter((c: any) => c.status === "rejected").length} icon={<X className="w-4 h-4" />} />
        <StatCard label="Formats" value={new Set(content.rows.map((c: any) => c.contentType)).size} icon={<FileText className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="Generate" />

      <div className="grid lg:grid-cols-2 gap-4">
        {content.loading ? <p className="text-sm text-text-3 py-6">Loading…</p> : content.rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-8 text-center text-sm text-text-3">No content yet. Generate your first draft from the Content Factory.</div>
        ) : content.rows.map((c: any) => (
          <div key={c.id} className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-sm font-bold text-kauvex-navy">{c.title}</p>
                <p className="text-[11px] text-text-3">{c.contentType?.replace(/_/g, " ")} · {c.channel} · {fmtDate(c.createdAt)}</p>
              </div>
              <StatusBadge status={c.status} />
            </div>
            <p className="text-[11px] text-text-2 whitespace-pre-wrap max-h-28 overflow-y-auto rounded-lg bg-gray-50 border border-border p-3">{c.content}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setOpenId(openId === c.id ? null : c.id)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-kauvex-navy hover:bg-gray-50">
                {openId === c.id ? "Hide full" : "View full"}
              </button>
              {c.status === "draft" && (
                <>
                  <button onClick={() => review(c.id, "approved")} className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-700 inline-flex items-center gap-1.5"><Check className="w-3 h-3" /> Approve</button>
                  <button onClick={() => review(c.id, "rejected")} className="rounded-lg bg-red-500 text-white px-3 py-1.5 text-xs font-semibold hover:bg-red-600 inline-flex items-center gap-1.5"><X className="w-3 h-3" /> Reject</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={show} onClose={() => setShow(false)} title="Generate Content">
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await content.createRow(form);
          setShow(false);
          setForm({});
        }}>
          <div className="col-span-2">
            <Field label="Title / Topic" required><input required className={inputCls} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          </div>
          <Field label="Format">
            <select className={selectCls} value={form.contentType ?? "blog"} onChange={(e) => setForm({ ...form, contentType: e.target.value })}>
              {CONTENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Channel">
            <select className={selectCls} value={form.channel ?? "general"} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              {["general", "website", "email", "sms", "whatsapp", "social", "ads"].map((ch) => <option key={ch} value={ch}>{ch}</option>)}
            </select>
          </Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Generate Draft</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
