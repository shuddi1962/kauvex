"use client";

import { useState } from "react";
import { FolderOpen, Plus } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, useBosResource, StatusBadge } from "@/components/business-os/shared";

const TYPES = ["contract", "drawing", "manual", "certificate", "sop", "policy", "invoice", "purchase_order", "delivery_note", "technical", "proposal", "other"];

export default function DocumentsPage() {
  const docs = useBosResource("documents");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const contracts = docs.rows.filter((d: any) => d.docType === "contract");
  const pendingApproval = docs.rows.filter((d: any) => d.approvalStatus === "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Management"
        subtitle="Contracts, drawings, certificates, SOPs, and policies with version control"
        icon={<FolderOpen className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Document</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Documents" value={docs.rows.length} icon={<FolderOpen className="w-4 h-4" />} />
        <StatCard label="Contracts" value={contracts.length} icon={<FolderOpen className="w-4 h-4" />} />
        <StatCard label="Pending Approval" value={pendingApproval.length} icon={<FolderOpen className="w-4 h-4" />} />
        <StatCard label="Active" value={docs.rows.filter((d: any) => d.status === "active").length} icon={<FolderOpen className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Document" />

      <DataTable
        columns={[
          { header: "Title", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.title}</span> },
          { header: "Type", render: (r: any) => <span className="capitalize text-xs">{r.docType?.replace("_", " ") || "other"}</span> },
          { header: "Category", render: (r: any) => r.category || "—" },
          { header: "Version", render: (r: any) => <span className="font-mono text-xs font-bold">v{r.version}</span> },
          { header: "File", render: (r: any) => r.fileUrl ? <a href={r.fileUrl} target="_blank" className="text-xs font-semibold text-kauvex-orange hover:underline">Open ↗</a> : "—" },
          { header: "Approval", render: (r: any) => r.approvalStatus !== "none" ? <StatusBadge status={r.approvalStatus} /> : "—" },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { header: "Updated", render: (r: any) => fmtDate(r.updatedAt) },
        ]}
        rows={docs.rows}
        loading={docs.loading}
        empty="No documents yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Document">
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await docs.createRow({ ...form, version: 1, status: "active", tags: (form.tags ?? "").split(",").map((s: string) => s.trim()).filter(Boolean) });
          setShow(false);
        }}>
          <div className="col-span-2">
            <Field label="Title" required><input required className={inputCls} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          </div>
          <Field label="Type">
            <select className={selectCls} value={form.docType ?? "other"} onChange={(e) => setForm({ ...form, docType: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Category"><input className={inputCls} value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
          <Field label="File URL"><input className={inputCls} placeholder="https://..." value={form.fileUrl ?? ""} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} /></Field>
          <Field label="Tags (comma separated)"><input className={inputCls} value={form.tags ?? ""} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
