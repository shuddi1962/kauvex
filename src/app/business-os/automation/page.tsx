"use client";

import { useState } from "react";
import { Bot, Plus, Play, Power } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, useBosResource, StatusBadge } from "@/components/business-os/shared";

const TRIGGERS = ["stock_low", "task_due", "document_expiry", "approval_pending", "payment_due", "quotation_expiry", "contract_renewal", "schedule"];

export default function AutomationPage() {
  const rules = useBosResource("automation");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});
  const [runResult, setRunResult] = useState<string[] | null>(null);
  const [running, setRunning] = useState(false);

  const active = rules.rows.filter((r: any) => r.active);
  const totalRuns = rules.rows.reduce((s: number, r: any) => s + (r.runCount || 0), 0);

  const runNow = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/v1/business-os/dashboard", { method: "POST" });
      const json = await res.json();
      setRunResult(json.data?.triggered?.map((t: any) => `${t.rule}: ${t.message}`) ?? ["No rules triggered"]);
    } finally {
      setRunning(false);
      await rules.fetchRows();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation Engine"
        subtitle="Rules that trigger notifications, approvals, and replenishment automatically"
        icon={<Bot className="w-5 h-5" />}
        actions={
          <div className="flex gap-2">
            <button className={btnSecondary} onClick={runNow} disabled={running}>
              <Play className="w-4 h-4" /> {running ? "Running..." : "Run Rules"}
            </button>
            <button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Rule</button>
          </div>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Rules" value={rules.rows.length} icon={<Bot className="w-4 h-4" />} />
        <StatCard label="Active" value={active.length} icon={<Power className="w-4 h-4" />} />
        <StatCard label="Total Runs" value={totalRuns} icon={<Play className="w-4 h-4" />} />
        <StatCard label="Trigger Types" value={new Set(rules.rows.map((r: any) => r.triggerType)).size} icon={<Bot className="w-4 h-4" />} />
      </div>

      {runResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs font-bold text-emerald-700 mb-2">Last run results</p>
          <ul className="space-y-1">
            {runResult.map((r, i) => <li key={i} className="text-xs text-emerald-800">• {r}</li>)}
          </ul>
        </div>
      )}

      <Toolbar onNew={() => setShow(true)} newLabel="New Rule" />

      <DataTable
        columns={[
          { header: "Rule", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.name}</span> },
          { header: "Trigger", render: (r: any) => <span className="capitalize text-xs">{r.triggerType?.replace("_", " ")}</span> },
          { header: "Actions", render: (r: any) => Array.isArray(r.actions) ? (
            <div className="flex flex-wrap gap-1">
              {r.actions.map((a: any, i: number) => <span key={i} className="px-1.5 py-0.5 rounded bg-kauvex-navy/5 text-[10px] font-semibold">{a.type ?? String(a)}</span>)}
            </div>
          ) : "—" },
          { header: "Runs", render: (r: any) => r.runCount || 0 },
          { header: "Last Run", render: (r: any) => fmtDate(r.lastRunAt) },
          { header: "Status", render: (r: any) => r.active ? <StatusBadge status="active" /> : <StatusBadge status="inactive" /> },
        ]}
        rows={rules.rows}
        loading={rules.loading}
        empty="No automation rules yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Automation Rule">
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          const conditions: any = {};
          if (form.triggerType === "stock_low") conditions.threshold = Number(form.threshold) || 0;
          if (form.triggerType === "contract_renewal") conditions.days = Number(form.days) || 30;
          await rules.createRow({
            name: form.name,
            triggerType: form.triggerType,
            conditions,
            actions: [{ type: form.actionType ?? "notify" }],
            active: true,
          });
          setShow(false);
        }}>
          <div className="col-span-2">
            <Field label="Rule Name" required><input required className={inputCls} value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          </div>
          <Field label="Trigger">
            <select className={selectCls} value={form.triggerType ?? "stock_low"} onChange={(e) => setForm({ ...form, triggerType: e.target.value })}>
              {TRIGGERS.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Action">
            <select className={selectCls} value={form.actionType ?? "notify"} onChange={(e) => setForm({ ...form, actionType: e.target.value })}>
              <option value="notify">Notify team</option>
              <option value="create_purchase_request">Create purchase request</option>
              <option value="escalate">Escalate</option>
            </select>
          </Field>
          {form.triggerType === "stock_low" && (
            <Field label="Stock Threshold"><input type="number" className={inputCls} value={form.threshold ?? 0} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} /></Field>
          )}
          {form.triggerType === "contract_renewal" && (
            <Field label="Days Before Expiry"><input type="number" className={inputCls} value={form.days ?? 30} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} /></Field>
          )}
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create Rule</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
