"use client";

import { useState } from "react";
import { CheckSquare, Plus, ArrowRight } from "lucide-react";
import { PageHeader, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, fmtMoney, useBosResource, StatusBadge } from "@/components/business-os/shared";

const STAGES = ["qualification", "discovery", "proposal", "negotiation", "won", "lost"];
const PIPELINES = ["sales", "b2b", "projects", "services"];

export default function PipelinePage() {
  const deals = useBosResource("deals");
  const customers = useBosResource("customers");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const stageTotals = STAGES.map((stage) => ({
    stage,
    deals: deals.rows.filter((d: any) => d.stage === stage),
  }));
  const openValue = deals.rows
    .filter((d: any) => !["won", "lost"].includes(d.stage))
    .reduce((sum: number, d: any) => sum + Number(d.amount), 0);

  const advance = async (deal: any) => {
    const idx = STAGES.indexOf(deal.stage);
    if (idx >= 0 && idx < STAGES.length - 1) {
      await deals.updateRow(deal.id, { stage: STAGES[idx + 1] });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Pipeline"
        subtitle={`Open pipeline: ${fmtMoney(openValue)}`}
        icon={<CheckSquare className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Deal</button>}
      />

      <Toolbar onNew={() => setShow(true)} newLabel="New Deal" />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stageTotals.map(({ stage, deals: stageDeals }) => (
          <div key={stage} className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-kauvex-navy capitalize">{stage.replace("_", " ")}</h3>
              <span className="text-xs font-bold text-kauvex-orange">{fmtMoney(stageDeals.reduce((s: number, d: any) => s + Number(d.amount), 0))}</span>
            </div>
            <div className="space-y-2">
              {stageDeals.length === 0 && <p className="text-xs text-text-3 text-center py-3">No deals</p>}
              {stageDeals.map((d: any) => (
                <div key={d.id} className="rounded-lg border border-border p-3 hover:border-kauvex-orange/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-kauvex-navy truncate">{d.dealName}</p>
                      <p className="text-[11px] text-text-3 mt-0.5">
                        {customers.rows.find((c: any) => c.id === d.customerId)?.name || "Walk-in"} · {d.probability}%
                      </p>
                    </div>
                    <StatusBadge status={d.stage} />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-kauvex-navy">{fmtMoney(d.amount, d.currencyCode)}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-text-3">{fmtDate(d.expectedClose)}</span>
                      {!["won", "lost"].includes(d.stage) && (
                        <button onClick={() => advance(d)} className="p-1 rounded-md text-kauvex-orange hover:bg-kauvex-orange/10" title="Advance stage">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal open={show} onClose={() => setShow(false)} title="New Deal">
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await deals.createRow(form);
          setShow(false);
        }}>
          <div className="col-span-2">
            <Field label="Deal Name" required><input required className={inputCls} value={form.dealName ?? ""} onChange={(e) => setForm({ ...form, dealName: e.target.value })} /></Field>
          </div>
          <Field label="Customer">
            <select className={selectCls} value={form.customerId ?? ""} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">None</option>
              {customers.rows.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Pipeline">
            <select className={selectCls} value={form.pipeline ?? "sales"} onChange={(e) => setForm({ ...form, pipeline: e.target.value })}>
              {PIPELINES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Stage">
            <select className={selectCls} value={form.stage ?? "qualification"} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
              {STAGES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Amount" required><input required type="number" className={inputCls} value={form.amount ?? ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></Field>
          <Field label="Probability (%)"><input type="number" className={inputCls} value={form.probability ?? 10} onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })} /></Field>
          <Field label="Expected Close"><input type="date" className={inputCls} value={form.expectedClose ?? ""} onChange={(e) => setForm({ ...form, expectedClose: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
