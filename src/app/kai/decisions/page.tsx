"use client";

import { useState } from "react";
import { Scale, Plus, Check, X, Eye } from "lucide-react";
import { PageHeader, StatCard, Modal, Field, Toolbar, inputCls, btnPrimary, btnSecondary, fmtDate, useKaiResource, StatusBadge } from "@/components/kai-ecosystem/shared";

export default function KaiDecisionsPage() {
  const decisions = useKaiResource("decisions");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});
  const [viewing, setViewing] = useState<any>(null);

  const decide = async (id: string, decision: string) => {
    await fetch(`/api/v1/kai-ecosystem/decisions/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    await decisions.fetchRows();
  };

  const pending = decisions.rows.filter((d: any) => d.status === "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Decision Support"
        subtitle="KAI weighs benefits, risks, costs, ROI, and alternatives before you commit"
        icon={<Scale className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Decision</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Decisions" value={decisions.rows.length} icon={<Scale className="w-4 h-4" />} />
        <StatCard label="Pending Review" value={pending.length} icon={<Eye className="w-4 h-4" />} />
        <StatCard label="Approved" value={decisions.rows.filter((d: any) => d.status === "approved").length} icon={<Check className="w-4 h-4" />} />
        <StatCard label="Avg Confidence" value={decisions.rows.length ? `${Math.round(decisions.rows.reduce((s: number, d: any) => s + Number(d.confidence || 0), 0) / decisions.rows.length * 100)}%` : "—"} icon={<Scale className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Decision" />

      <div className="grid lg:grid-cols-2 gap-4">
        {decisions.loading ? <p className="text-sm text-text-3 py-6">Loading…</p> : decisions.rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-8 text-center text-sm text-text-3">No decisions yet. Ask KAI to evaluate a major action first.</div>
        ) : decisions.rows.map((d: any) => (
          <div key={d.id} className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <p className="text-sm font-bold text-kauvex-navy flex-1">"{d.context}"</p>
              <StatusBadge status={d.status} />
            </div>
            <div className="space-y-2 mb-3">
              {(d.options ?? []).map((o: any, i: number) => (
                <div key={i} className={`rounded-lg border p-3 ${o.label === d.recommended ? "border-kauvex-orange/50 bg-kauvex-orange/5" : "border-border"}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-kauvex-navy">{o.label} {o.label === d.recommended && <span className="text-[10px] text-kauvex-orange">RECOMMENDED</span>}</p>
                    <p className="text-[10px] font-semibold text-text-3">{Math.round((o.confidence ?? 0) * 100)}% confidence</p>
                  </div>
                  <p className="text-[11px] text-text-2 mt-1">Cost: {o.cost}</p>
                  <p className="text-[11px] text-text-2">ROI: {o.roi}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-text-3 italic mb-3">{d.rationale}</p>
            <div className="flex gap-2">
              <button onClick={() => setViewing(d)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-kauvex-navy hover:bg-gray-50 inline-flex items-center gap-1.5"><Eye className="w-3 h-3" /> Details</button>
              {d.status === "pending" && (
                <>
                  <button onClick={() => decide(d.id, "approved")} className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-700 inline-flex items-center gap-1.5"><Check className="w-3 h-3" /> Approve</button>
                  <button onClick={() => decide(d.id, "rejected")} className="rounded-lg bg-red-500 text-white px-3 py-1.5 text-xs font-semibold hover:bg-red-600 inline-flex items-center gap-1.5"><X className="w-3 h-3" /> Reject</button>
                  <button onClick={() => decide(d.id, "dismissed")} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-3 hover:bg-gray-50">Dismiss</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={show} onClose={() => setShow(false)} title="Evaluate a Decision">
        <form className="grid gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await decisions.createRow({ context: form.context });
          setShow(false);
          setForm({});
        }}>
          <Field label="What are you considering?" required>
            <textarea required rows={4} className={inputCls} placeholder="e.g. Expand to a second location in Lagos" value={form.context ?? ""} onChange={(e) => setForm({ ...form, context: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Generate Analysis</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Decision Details" wide>
        {viewing && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-kauvex-navy">"{viewing.context}"</p>
            <p className="text-xs text-text-3">Created {fmtDate(viewing.createdAt)} · Status: {viewing.status}</p>
            <div className="grid md:grid-cols-3 gap-3">
              {(viewing.options ?? []).map((o: any, i: number) => (
                <div key={i} className="rounded-xl border border-border p-4">
                  <p className="text-xs font-bold text-kauvex-navy mb-2">{o.label}</p>
                  <p className="text-[11px] font-semibold text-text-3 mb-1">Benefits</p>
                  <ul className="text-[11px] text-text-2 space-y-0.5 mb-2">{(o.benefits ?? []).map((b: string, j: number) => <li key={j}>• {b}</li>)}</ul>
                  <p className="text-[11px] font-semibold text-text-3 mb-1">Risks</p>
                  <ul className="text-[11px] text-text-2 space-y-0.5">{(o.risks ?? []).map((r: string, j: number) => <li key={j}>• {r}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
