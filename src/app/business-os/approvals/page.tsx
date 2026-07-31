"use client";

import { useState } from "react";
import { CheckSquare, Plus, Check, X } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, fmtMoney, useBosResource, StatusBadge } from "@/components/business-os/shared";

const MODULES = ["purchase", "payment", "discount", "quotation", "hiring", "leave", "contract", "manufacturing", "inventory_adjustment", "design", "expense", "other"];

export default function ApprovalsPage() {
  const approvals = useBosResource("approvals");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});
  const [chain, setChain] = useState<any[]>([]);

  const pending = approvals.rows.filter((a: any) => a.status === "pending");
  const pendingValue = pending.reduce((s: number, a: any) => s + Number(a.amount || 0), 0);

  const decide = async (approval: any, decision: "approved" | "rejected") => {
    const res = await fetch(`/api/v1/business-os/approvals/${approval.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    if (res.ok) {
      const json = await res.json();
      approvals.setRows?.([]);
      await approvals.fetchRows();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approval Workflows"
        subtitle="Multi-level approval chains for purchases, payments, contracts, and more"
        icon={<CheckSquare className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Approval Request</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={approvals.rows.length} icon={<CheckSquare className="w-4 h-4" />} />
        <StatCard label="Pending" value={pending.length} icon={<CheckSquare className="w-4 h-4" />} />
        <StatCard label="Pending Value" value={fmtMoney(pendingValue)} icon={<CheckSquare className="w-4 h-4" />} />
        <StatCard label="Approved" value={approvals.rows.filter((a: any) => a.status === "approved").length} icon={<CheckSquare className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Request" />

      <DataTable
        columns={[
          { header: "Ref", render: (r: any) => <span className="font-mono text-xs font-semibold text-kauvex-navy">{r.approvalNumber}</span> },
          { header: "Title", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.title}</span> },
          { header: "Module", render: (r: any) => <span className="capitalize text-xs">{r.module.replace("_", " ")}</span> },
          { header: "Amount", render: (r: any) => r.amount != null ? fmtMoney(r.amount) : "—" },
          { header: "Level", render: (r: any) => <span className="text-xs">Level {r.currentLevel + 1} of {Math.max(1, (r.approvers || []).length ? Math.max(...r.approvers.map((a: any) => a.level)) + 1 : 1)}</span> },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { header: "Requested", render: (r: any) => fmtDate(r.createdAt) },
          { header: "Action", render: (r: any) => r.status === "pending" ? (
            <div className="flex gap-1.5">
              <button onClick={() => decide(r, "approved")} className="p-1 rounded-md bg-emerald-100 text-emerald-600 hover:bg-emerald-200" title="Approve">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => decide(r, "rejected")} className="p-1 rounded-md bg-red-100 text-red-600 hover:bg-red-200" title="Reject">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null },
        ]}
        rows={approvals.rows}
        loading={approvals.loading}
        empty="No approval requests yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Approval Request" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await approvals.createRow({ ...form, approvers: chain, status: "pending", currentLevel: 0, decisionChain: [] });
          setShow(false);
          setChain([]);
        }}>
          <div className="col-span-2">
            <Field label="Title" required><input required className={inputCls} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          </div>
          <Field label="Module">
            <select className={selectCls} value={form.module ?? "purchase"} onChange={(e) => setForm({ ...form, module: e.target.value })}>
              {MODULES.map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Amount"><input type="number" className={inputCls} value={form.amount ?? ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></Field>
          <Field label="Description"><input className={inputCls} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Record Type"><input className={inputCls} placeholder="e.g. purchase_order" value={form.recordType ?? ""} onChange={(e) => setForm({ ...form, recordType: e.target.value })} /></Field>

          <div className="col-span-2">
            <p className="text-xs font-semibold text-text-2 mb-1.5">Approval Chain (level → approver)</p>
            <div className="space-y-2">
              {chain.map((line, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-text-3 w-14">Level {i + 1}</span>
                  <input className={`${inputCls} flex-1`} placeholder="Approver user id" value={line.userId ?? ""}
                    onChange={(e) => setChain(chain.map((l, j) => j === i ? { ...l, userId: e.target.value } : l))} />
                  <button type="button" onClick={() => setChain(chain.filter((_, j) => j !== i))} className="px-2 text-red-500 text-sm">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => setChain([...chain, { level: chain.length }])} className="text-xs font-semibold text-kauvex-orange">+ Add approver level</button>
            </div>
          </div>

          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Submit</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
