"use client";

import { useState } from "react";
import { Search, Plus, ChevronDown } from "lucide-react";
import { PageHeader, StatCard, Modal, Field, Toolbar, inputCls, btnPrimary, btnSecondary, fmtDate, useKaiResource, StatusBadge } from "@/components/kai-ecosystem/shared";

export default function KaiResearchPage() {
  const research = useKaiResource("research");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Research Engine"
        subtitle="KAI continuously researches competitors, markets, pricing, and regulations — summarized for you"
        icon={<Search className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Research</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Reports" value={research.rows.length} icon={<Search className="w-4 h-4" />} />
        <StatCard label="Ready" value={research.rows.filter((r: any) => r.status === "ready").length} icon={<Search className="w-4 h-4" />} />
        <StatCard label="Findings" value={research.rows.reduce((s: number, r: any) => s + (r.findings?.length ?? 0), 0)} icon={<Search className="w-4 h-4" />} />
        <StatCard label="Topics" value={new Set(research.rows.map((r: any) => r.topic)).size} icon={<Search className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Research" />

      <div className="space-y-3">
        {research.loading ? <p className="text-sm text-text-3 py-6 text-center">Loading…</p> : research.rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-8 text-center text-sm text-text-3">No research reports yet.</div>
        ) : research.rows.map((r: any) => (
          <div key={r.id} className="bg-white rounded-xl border border-border p-4">
            <button onClick={() => setOpenId(openId === r.id ? null : r.id)} className="w-full flex items-center justify-between gap-2 text-left">
              <div>
                <p className="text-sm font-bold text-kauvex-navy">{r.topic}</p>
                <p className="text-[11px] text-text-3">{fmtDate(r.createdAt)} · {r.findings?.length ?? 0} intelligence areas</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={r.status} />
                <ChevronDown className={`w-4 h-4 text-text-3 transition-transform ${openId === r.id ? "rotate-180" : ""}`} />
              </div>
            </button>
            {openId === r.id && (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-text-2 leading-relaxed bg-purple-50/50 border border-purple-100 rounded-lg p-3">{r.summary}</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {(r.findings ?? []).map((f: any, i: number) => (
                    <div key={i} className="rounded-lg border border-border p-3">
                      <p className="text-xs font-bold text-kauvex-navy">{f.area}</p>
                      <p className="text-[11px] text-text-2 mt-1 leading-relaxed">{f.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={show} onClose={() => setShow(false)} title="New Research Report">
        <form className="grid gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await research.createRow({ topic: form.topic });
          setShow(false);
          setForm({});
        }}>
          <Field label="Research Topic" required>
            <input required className={inputCls} placeholder="e.g. Solar inverters demand in West Africa" value={form.topic ?? ""} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Generate Report</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
