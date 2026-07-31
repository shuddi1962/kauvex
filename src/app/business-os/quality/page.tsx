"use client";

import { useState } from "react";
import { ShieldAlert, Plus } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, useBosResource, StatusBadge } from "@/components/business-os/shared";

const SEVERITIES = ["minor", "major", "critical"];
const CATEGORIES = ["product", "process", "supplier", "documentation", "safety", "customer"];
const STATUSES = ["open", "investigating", "corrective_action", "closed", "rejected"];

export default function QualityPage() {
  const ncrs = useBosResource("ncrs");
  const items = useBosResource("items");
  const suppliers = useBosResource("suppliers");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const open = ncrs.rows.filter((n: any) => !["closed", "rejected"].includes(n.status));
  const critical = ncrs.rows.filter((n: any) => n.severity === "critical" && n.status !== "closed");

  const advance = async (ncr: any) => {
    const flow = ["open", "investigating", "corrective_action", "closed"];
    const idx = flow.indexOf(ncr.status);
    if (idx < 0 || idx >= flow.length - 1) return;
    await ncrs.updateRow(ncr.id, {
      status: flow[idx + 1],
      closedAt: flow[idx + 1] === "closed" ? new Date().toISOString() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Management"
        subtitle="Non-conformance reports, CAPA, and quality metrics"
        icon={<ShieldAlert className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New NCR</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total NCRs" value={ncrs.rows.length} icon={<ShieldAlert className="w-4 h-4" />} />
        <StatCard label="Open" value={open.length} icon={<ShieldAlert className="w-4 h-4" />} />
        <StatCard label="Critical Open" value={critical.length} icon={<ShieldAlert className="w-4 h-4" />} />
        <StatCard label="Closed" value={ncrs.rows.filter((n: any) => n.status === "closed").length} icon={<ShieldAlert className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New NCR" />

      <DataTable
        columns={[
          { header: "NCR #", render: (r: any) => <span className="font-mono text-xs font-semibold text-kauvex-navy">{r.ncrNumber}</span> },
          { header: "Title", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.title}</span> },
          { header: "Item", render: (r: any) => items.rows.find((i: any) => i.id === r.itemId)?.name || "—" },
          { header: "Supplier", render: (r: any) => suppliers.rows.find((s: any) => s.id === r.supplierId)?.name || "—" },
          { header: "Severity", render: (r: any) => <StatusBadge status={r.severity} /> },
          { header: "Category", render: (r: any) => <span className="capitalize text-xs">{r.category || "—"}</span> },
          { header: "Root Cause", render: (r: any) => r.rootCause ? <span className="text-xs truncate max-w-[180px] block">{r.rootCause}</span> : "—" },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { header: "", render: (r: any) => (
            !["closed", "rejected"].includes(r.status) ? (
              <button onClick={() => advance(r)} className="text-xs font-semibold text-kauvex-orange hover:underline">Advance →</button>
            ) : null
          )},
        ]}
        rows={ncrs.rows}
        loading={ncrs.loading}
        empty="No non-conformance reports yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New NCR" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await ncrs.createRow({ ...form, status: "open" });
          setShow(false);
        }}>
          <div className="col-span-2">
            <Field label="Title" required><input required className={inputCls} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          </div>
          <Field label="Item">
            <select className={selectCls} value={form.itemId ?? ""} onChange={(e) => setForm({ ...form, itemId: e.target.value })}>
              <option value="">None</option>
              {items.rows.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </Field>
          <Field label="Supplier">
            <select className={selectCls} value={form.supplierId ?? ""} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
              <option value="">None</option>
              {suppliers.rows.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Severity">
            <select className={selectCls} value={form.severity ?? "minor"} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Category">
            <select className={selectCls} value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Description" required><textarea required rows={3} className={inputCls} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          </div>
          <Field label="Root Cause"><input className={inputCls} value={form.rootCause ?? ""} onChange={(e) => setForm({ ...form, rootCause: e.target.value })} /></Field>
          <Field label="Deadline"><input type="date" className={inputCls} value={form.deadline ?? ""} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create NCR</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
