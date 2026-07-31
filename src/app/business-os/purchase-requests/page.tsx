"use client";

import { useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, fmtMoney, useBosResource, StatusBadge } from "@/components/business-os/shared";

const STATUSES = ["draft", "submitted", "approved", "rejected", "ordered", "cancelled"];

export default function PurchaseRequestsPage() {
  const prs = useBosResource("purchase-requests");
  const deps = useBosResource("departments");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});
  const [lines, setLines] = useState<any[]>([]);

  const pending = prs.rows.filter((r: any) => ["draft", "submitted"].includes(r.status));
  const approved = prs.rows.filter((r: any) => r.status === "approved");

  const subtotal = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.estimated_cost) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Requests"
        subtitle="Internal requests for purchasing — route through approval"
        icon={<ClipboardList className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Request</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={prs.rows.length} icon={<ClipboardList className="w-4 h-4" />} />
        <StatCard label="Pending" value={pending.length} icon={<ClipboardList className="w-4 h-4" />} />
        <StatCard label="Approved" value={approved.length} icon={<ClipboardList className="w-4 h-4" />} />
        <StatCard label="Pending Value" value={fmtMoney(pending.reduce((s: number, r: any) => s + Number(r.subtotal), 0))} icon={<ClipboardList className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Request" />

      <DataTable
        columns={[
          { header: "PR #", render: (r: any) => <span className="font-mono text-xs font-semibold text-kauvex-navy">{r.prNumber}</span> },
          { header: "Department", render: (r: any) => deps.rows.find((d: any) => d.id === r.departmentId)?.name || "—" },
          { header: "Items", render: (r: any) => Array.isArray(r.items) ? `${r.items.length} line(s)` : "—" },
          { header: "Subtotal", render: (r: any) => <span className="font-bold">{fmtMoney(r.subtotal)}</span> },
          { header: "Needed By", render: (r: any) => fmtDate(r.neededBy) },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
        rows={prs.rows}
        loading={prs.loading}
        empty="No purchase requests yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Purchase Request" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await prs.createRow({ ...form, items: lines, subtotal, status: "submitted" });
          setShow(false);
          setLines([]);
        }}>
          <Field label="Department">
            <select className={selectCls} value={form.departmentId ?? ""} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
              <option value="">None</option>
              {deps.rows.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Needed By"><input type="date" className={inputCls} value={form.neededBy ?? ""} onChange={(e) => setForm({ ...form, neededBy: e.target.value })} /></Field>

          <div className="col-span-2">
            <p className="text-xs font-semibold text-text-2 mb-1.5">Requested Items</p>
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="flex gap-2">
                  <input className={`${inputCls} flex-1`} placeholder="Item description" value={line.description ?? ""}
                    onChange={(e) => setLines(lines.map((l, j) => j === i ? { ...l, description: e.target.value } : l))} />
                  <input className={`${inputCls} w-24`} type="number" placeholder="Qty" value={line.qty ?? ""}
                    onChange={(e) => setLines(lines.map((l, j) => j === i ? { ...l, qty: Number(e.target.value) } : l))} />
                  <input className={`${inputCls} w-32`} type="number" placeholder="Est. cost" value={line.estimated_cost ?? ""}
                    onChange={(e) => setLines(lines.map((l, j) => j === i ? { ...l, estimated_cost: Number(e.target.value) } : l))} />
                  <button type="button" onClick={() => setLines(lines.filter((_, j) => j !== i))} className="px-2 text-red-500 text-sm">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => setLines([...lines, {}])} className="text-xs font-semibold text-kauvex-orange">+ Add item</button>
            </div>
          </div>

          <div className="col-span-2 flex items-center justify-between">
            <span className="text-sm font-bold text-kauvex-navy">Estimated Total: {fmtMoney(subtotal)}</span>
          </div>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Submit Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
