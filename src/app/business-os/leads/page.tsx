"use client";

import { useState } from "react";
import { Target, Flame, Zap, Plus } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, fmtMoney, useBosResource, StatusBadge } from "@/components/business-os/shared";

const SOURCES = ["website", "referral", "walk_in", "social", "call", "email", "whatsapp", "marketplace", "other"];
const STAGES = ["new", "contacted", "qualified", "proposal", "won", "lost"];

export default function LeadsPage() {
  const leads = useBosResource("leads");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const hot = leads.rows.filter((l: any) => l.score >= 70 && !["won", "lost"].includes(l.stage));
  const warm = leads.rows.filter((l: any) => l.score >= 40 && l.score < 70 && !["won", "lost"].includes(l.stage));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        subtitle="Track, score, and convert leads into customers"
        icon={<Target className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Lead</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={leads.rows.length} icon={<Target className="w-4 h-4" />} />
        <StatCard label="Hot Leads" value={hot.length} icon={<Flame className="w-4 h-4" />} hint="Score ≥ 70" />
        <StatCard label="Warm Leads" value={warm.length} icon={<Zap className="w-4 h-4" />} hint="Score 40–69" />
        <StatCard label="Won" value={leads.rows.filter((l: any) => l.stage === "won").length} icon={<Target className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Lead" />

      <DataTable
        columns={[
          { header: "Contact", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.contactName}</span> },
          { header: "Company", render: (r: any) => r.companyName || "—" },
          { header: "Source", render: (r: any) => r.source ? <span className="capitalize">{r.source}</span> : "—" },
          { header: "Score", render: (r: any) => (
            <span className={`font-bold ${r.score >= 70 ? "text-red-500" : r.score >= 40 ? "text-amber-500" : "text-text-3"}`}>{r.score}</span>
          )},
          { header: "Estimated Value", render: (r: any) => fmtMoney(r.estimatedValue, r.currencyCode) },
          { header: "Stage", render: (r: any) => <StatusBadge status={r.stage} /> },
          { header: "Phone", render: (r: any) => r.phone || "—" },
          { header: "Created", render: (r: any) => fmtDate(r.createdAt) },
        ]}
        rows={leads.rows}
        loading={leads.loading}
        empty="No leads yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Lead" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await leads.createRow(form);
          setShow(false);
        }}>
          <Field label="Contact Name" required><input required className={inputCls} value={form.contactName ?? ""} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></Field>
          <Field label="Company Name"><input className={inputCls} value={form.companyName ?? ""} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></Field>
          <Field label="Email"><input type="email" className={inputCls} value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputCls} value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Source">
            <select className={selectCls} value={form.source ?? ""} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              <option value="">Select...</option>
              {SOURCES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Stage">
            <select className={selectCls} value={form.stage ?? "new"} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Lead Score"><input type="number" className={inputCls} value={form.score ?? 0} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} /></Field>
          <Field label="Estimated Value"><input type="number" className={inputCls} value={form.estimatedValue ?? ""} onChange={(e) => setForm({ ...form, estimatedValue: Number(e.target.value) })} /></Field>
          <Field label="Interests (comma separated)"><input className={inputCls} value={(form.interests ?? []).join(", ")} onChange={(e) => setForm({ ...form, interests: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} /></Field>
          <Field label="Notes"><input className={inputCls} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
