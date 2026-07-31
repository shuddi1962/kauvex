"use client";

import { useState } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, useKaiResource, StatusBadge } from "@/components/kai-ecosystem/shared";

const DOC_TYPES = ["document", "manual", "policy", "catalog", "drawing", "contract", "specification", "training", "report", "image", "video"];

export default function KaiKnowledgePage() {
  const knowledge = useKaiResource("knowledge");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Hub"
        subtitle="Company knowledge KAI searches before answering"
        icon={<BookOpen className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> Add Document</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Documents" value={knowledge.rows.length} icon={<BookOpen className="w-4 h-4" />} />
        <StatCard label="Indexed" value={knowledge.rows.filter((k: any) => k.status === "indexed").length} icon={<BookOpen className="w-4 h-4" />} />
        <StatCard label="Types" value={new Set(knowledge.rows.map((k: any) => k.docType)).size} icon={<BookOpen className="w-4 h-4" />} />
        <StatCard label="Tags" value={new Set(knowledge.rows.flatMap((k: any) => k.tags ?? [])).size} icon={<BookOpen className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="Add Document" />

      <DataTable
        columns={[
          { header: "Title", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.title}</span> },
          { header: "Type", render: (r: any) => <span className="capitalize text-xs">{r.docType}</span> },
          { header: "Tags", render: (r: any) => (r.tags?.length ? (
            <div className="flex flex-wrap gap-1">
              {r.tags.slice(0, 3).map((t: string, i: number) => <span key={i} className="px-1.5 py-0.5 rounded bg-kauvex-navy/5 text-[10px] font-semibold text-kauvex-navy">{t}</span>)}
            </div>
          ) : "—") },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { header: "Added", render: (r: any) => fmtDate(r.createdAt) },
          { header: "", render: (r: any) => (
            <button onClick={() => knowledge.deleteRow(r.id)} className="text-xs font-semibold text-red-500 hover:underline inline-flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          )},
        ]}
        rows={knowledge.rows}
        loading={knowledge.loading}
        empty="No knowledge documents yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="Add Knowledge Document" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await knowledge.createRow({ ...form, tags: (form.tags ?? "").split(",").map((s: string) => s.trim()).filter(Boolean), status: "indexed" });
          setShow(false);
          setForm({});
        }}>
          <div className="col-span-2">
            <Field label="Title" required><input required className={inputCls} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          </div>
          <Field label="Type">
            <select className={selectCls} value={form.docType ?? "document"} onChange={(e) => setForm({ ...form, docType: e.target.value })}>
              {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Tags (comma separated)"><input className={inputCls} value={form.tags ?? ""} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></Field>
          <div className="col-span-2">
            <Field label="Content"><textarea rows={6} className={inputCls} value={form.content ?? ""} onChange={(e) => setForm({ ...form, content: e.target.value })} /></Field>
          </div>
          <Field label="File URL (optional)"><input className={inputCls} value={form.fileUrl ?? ""} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} /></Field>
          <Field label="File Type"><input className={inputCls} placeholder="pdf, dwg, png…" value={form.fileType ?? ""} onChange={(e) => setForm({ ...form, fileType: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Index Document</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
