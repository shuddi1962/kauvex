"use client";

import { useState } from "react";
import { ShieldAlert, Plus } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, useBosResource, StatusBadge } from "@/components/business-os/shared";

const TYPES = ["incident", "near_miss", "safety_observation", "environmental", "ppe_violation"];
const SEVERITIES = ["low", "medium", "high", "critical"];
const STATUSES = ["open", "investigating", "action_taken", "closed"];

export default function HsePage() {
  const incidents = useBosResource("incidents");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const open = incidents.rows.filter((i: any) => i.status !== "closed");
  const critical = incidents.rows.filter((i: any) => ["high", "critical"].includes(i.severity) && i.status !== "closed");
  const nearMisses = incidents.rows.filter((i: any) => i.incidentType === "near_miss");

  const advance = async (inc: any) => {
    const flow = ["open", "investigating", "action_taken", "closed"];
    const idx = flow.indexOf(inc.status);
    if (idx < 0 || idx >= flow.length - 1) return;
    await incidents.updateRow(inc.id, {
      status: flow[idx + 1],
      closedAt: flow[idx + 1] === "closed" ? new Date().toISOString() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Health, Safety & Environment"
        subtitle="Incident reports, near misses, risk assessments, and permits to work"
        icon={<ShieldAlert className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> Report Incident</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Reports" value={incidents.rows.length} icon={<ShieldAlert className="w-4 h-4" />} />
        <StatCard label="Open" value={open.length} icon={<ShieldAlert className="w-4 h-4" />} />
        <StatCard label="High / Critical" value={critical.length} icon={<ShieldAlert className="w-4 h-4" />} />
        <StatCard label="Near Misses" value={nearMisses.length} icon={<ShieldAlert className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="Report Incident" />

      <DataTable
        columns={[
          { header: "Ref", render: (r: any) => <span className="font-mono text-xs font-semibold text-kauvex-navy">{r.incidentNumber}</span> },
          { header: "Title", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.title}</span> },
          { header: "Type", render: (r: any) => <span className="capitalize text-xs">{r.incidentType?.replace("_", " ") || "incident"}</span> },
          { header: "Severity", render: (r: any) => <StatusBadge status={r.severity} /> },
          { header: "Occurred", render: (r: any) => fmtDate(r.occurredAt) },
          { header: "Location", render: (r: any) => r.location || "—" },
          { header: "PPE Involved", render: (r: any) => r.ppeInvolved ? <span className="text-xs font-bold text-red-500">YES</span> : <span className="text-xs text-text-3">No</span> },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { header: "", render: (r: any) => (
            r.status !== "closed" ? (
              <button onClick={() => advance(r)} className="text-xs font-semibold text-kauvex-orange hover:underline">Advance →</button>
            ) : null
          )},
        ]}
        rows={incidents.rows}
        loading={incidents.loading}
        empty="No incidents reported"
      />

      <Modal open={show} onClose={() => setShow(false)} title="Report Incident" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await incidents.createRow({ ...form, status: "open" });
          setShow(false);
        }}>
          <div className="col-span-2">
            <Field label="Title" required><input required className={inputCls} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          </div>
          <Field label="Type">
            <select className={selectCls} value={form.incidentType ?? "incident"} onChange={(e) => setForm({ ...form, incidentType: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Severity">
            <select className={selectCls} value={form.severity ?? "low"} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Occurred At"><input type="date" className={inputCls} value={form.occurredAt ?? ""} onChange={(e) => setForm({ ...form, occurredAt: e.target.value })} /></Field>
          <Field label="Location"><input className={inputCls} value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <div className="col-span-2">
            <Field label="Description" required><textarea required rows={3} className={inputCls} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          </div>
          <Field label="Immediate Action"><input className={inputCls} value={form.immediateAction ?? ""} onChange={(e) => setForm({ ...form, immediateAction: e.target.value })} /></Field>
          <Field label="PPE Involved">
            <select className={selectCls} value={form.ppeInvolved ? "true" : "false"} onChange={(e) => setForm({ ...form, ppeInvolved: e.target.value === "true" })}>
              <option value="false">No</option><option value="true">Yes</option>
            </select>
          </Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Report</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
