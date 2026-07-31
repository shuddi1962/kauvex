"use client";

import { useEffect, useState } from "react";
import { Workflow, Plus, Play, Zap } from "lucide-react";
import { PageHeader, StatCard, Modal, Field, Toolbar, inputCls, btnPrimary, btnSecondary, fmtDate, useKaiResource, StatusBadge } from "@/components/kai-ecosystem/shared";

export default function KaiFlowsPage() {
  const flows = useKaiResource("flows");
  const [runs, setRuns] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runLog, setRunLog] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/kai-ecosystem/flows")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          flowsFetch(j.data);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flowsFetch = (data: any) => {
    setRuns(data.runs ?? []);
    setRunLog((data.runs ?? []).slice(0, 10));
  };

  useEffect(() => {
    if (flows.rows.length) {
      // refresh runs after create/delete
      fetch("/api/v1/kai-ecosystem/flows").then((r) => r.json()).then((j) => {
        if (j.data) {
          setRuns(j.data.runs ?? []);
          setRunLog((j.data.runs ?? []).slice(0, 10));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flows.rows.length]);

  const runFlow = async (id: string) => {
    setRunningId(id);
    try {
      const res = await fetch(`/api/v1/kai-ecosystem/flows/${id}/run`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to run flow");
      setRuns((prev) => [json.data, ...prev]);
      setRunLog((prev) => [json.data, ...prev].slice(0, 10));
      await flows.fetchRows();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to run flow");
    } finally {
      setRunningId(null);
    }
  };

  const parsed = form.parsedPreview;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation Flows"
        subtitle="Create automations in plain English — no programming required"
        icon={<Workflow className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Flow</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Flows" value={flows.rows.length} icon={<Workflow className="w-4 h-4" />} />
        <StatCard label="Active" value={flows.rows.filter((f: any) => f.isActive).length} icon={<Zap className="w-4 h-4" />} />
        <StatCard label="Total Runs" value={flows.rows.reduce((s: number, f: any) => s + (f.runCount || 0), 0)} icon={<Play className="w-4 h-4" />} />
        <StatCard label="Triggers" value={new Set(flows.rows.map((f: any) => f.triggerType)).size} icon={<Workflow className="w-4 h-4" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <Toolbar onNew={() => setShow(true)} newLabel="New Flow" />
          <div className="space-y-3">
            {flows.loading ? <p className="text-sm text-text-3 py-6 text-center">Loading…</p> : flows.rows.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-8 text-center text-sm text-text-3">No flows yet. Try: <span className="font-mono text-kauvex-orange">"When inventory drops below 20, create purchase request, notify warehouse, notify supplier, email procurement manager."</span></div>
            ) : flows.rows.map((f: any) => (
              <div key={f.id} className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="font-bold text-kauvex-navy text-sm">{f.name}</p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={f.isActive ? "active" : "inactive"} />
                    <button onClick={() => runFlow(f.id)} disabled={runningId === f.id} className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-1.5">
                      <Play className="w-3 h-3" /> {runningId === f.id ? "Running…" : "Run"}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-text-3 italic">"{f.instruction}"</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[10px] font-bold text-purple-700">Trigger: {(f.parsed?.trigger ?? {}).type}</span>
                  {(f.parsed?.actions ?? []).map((a: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-kauvex-navy/5 text-[10px] font-semibold text-kauvex-navy">{a.replace(/_/g, " ")}</span>
                  ))}
                </div>
                <p className="text-[10px] text-text-3 mt-2">{f.runCount} runs · last {fmtDate(f.lastRunAt)}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-kauvex-navy mb-3">Run Log</h3>
          <div className="bg-white rounded-xl border border-border divide-y divide-border">
            {runLog.length === 0 ? (
              <p className="text-sm text-text-3 p-6 text-center">No runs yet</p>
            ) : runLog.map((r: any) => (
              <div key={r.id} className="p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-kauvex-navy">Flow run · {fmtDate(r.createdAt)}</p>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-1.5 space-y-1">
                  {(r.result?.actions ?? []).map((a: any, i: number) => (
                    <p key={i} className="text-[11px] text-text-2 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${a.executed ? "bg-emerald-500" : "bg-amber-500"}`} />
                      {a.action.replace(/_/g, " ")} — {a.note}
                    </p>
                  ))}
                  {r.result?.createdPurchaseRequest && (
                    <p className="text-[11px] font-semibold text-emerald-700">Created {r.result.createdPurchaseRequest}</p>
                  )}
                  {r.result?.lowStock && (
                    <p className="text-[11px] text-amber-700">{r.result.lowStock.length} item(s) below threshold</p>
                  )}
                </div>
                {r.error && <p className="text-[11px] text-red-600 mt-1">{r.error}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={show} onClose={() => setShow(false)} title="New Automation Flow" wide>
        <form className="grid gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await flows.createRow({ name: form.name, instruction: form.instruction });
          setShow(false);
          setForm({});
        }}>
          <Field label="Flow Name"><input className={inputCls} placeholder="Inventory auto-reorder" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Instruction (plain English)" required>
            <textarea required rows={4} className={inputCls} placeholder='Example: "When inventory drops below 20, create purchase request, notify warehouse, notify supplier, email procurement manager."' value={form.instruction ?? ""} onChange={(e) => setForm({ ...form, instruction: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create Flow</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
